import os
import re
import json
from json_repair import repair_json
from tavily import TavilyClient
from langchain_core.messages import HumanMessage
from langgraph.graph import StateGraph, END
import trafilatura

from .state import SessionState
from llm import invoke_with_retry
from pinecone_store import query_similar

tavily = TavilyClient(api_key=os.getenv("TAVILY_API_KEY"))


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

MAX_CHARS_PER_SOURCE = 1500  # keep each source small
MAX_SOURCES = 3              # use top 3 sources only


def _sources_to_text(sources: list[dict]) -> str:
    """Concatenate top sources, truncated to stay within free tier token limits."""
    parts = []
    for s in sources[:MAX_SOURCES]:
        content = s.get("content", "")[:MAX_CHARS_PER_SOURCE]
        parts.append(f"Source: {s['url']}\n{content}")
    return "\n\n---\n\n".join(parts)


def _parse_json(text: str) -> dict:
    """Strip markdown code fences and parse JSON, repairing common LLM formatting errors."""
    text = text.strip()
    if text.startswith("```"):
        text = text.split("```")[1]
        if text.startswith("json"):
            text = text[4:]
    text = text.strip()
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        return json.loads(repair_json(text))


# ---------------------------------------------------------------------------
# Nodes
# ---------------------------------------------------------------------------

async def fetch_node(state: SessionState) -> dict:
    """EXTRACT — fetch web content via Tavily + past context from Pinecone."""
    results = tavily.search(
        query=f"{state['topic']} explained concepts tutorial overview",
        search_depth="advanced",
        max_results=7,
        include_raw_content=True,
    )
    sources = []
    for r in results.get("results", []):
        raw = r.get("raw_content") or r.get("content", "")
        # Clean HTML/boilerplate with trafilatura, fall back to raw if it returns nothing
        cleaned = trafilatura.extract(raw, include_comments=False, include_tables=False) or raw
        if len(cleaned) > 300:
            sources.append({"url": r["url"], "content": cleaned})

    # Retrieve past similar sessions from Pinecone
    user_id = state.get("user_id") or ""
    past_sessions = query_similar(state["topic"], user_id, top_k=3)
    past_context = ""
    if past_sessions:
        parts = []
        for s in past_sessions:
            section = f"**{s['topic']}**:\n{s['notes_snippet']}"
            if s.get("insights_snippet"):
                section += f"\nStruggled with: {s['insights_snippet']}"
            if s.get("flashcards_snippet"):
                section += f"\nKey concepts: {s['flashcards_snippet']}"
            parts.append(section)
        past_context = "\n\n---\n\n".join(parts)

    return {
        "sources": sources,
        "source_urls": [s["url"] for s in sources],
        "past_context": past_context,
    }


async def notes_node(state: SessionState) -> dict:
    """TRANSFORM — generate lecture notes grounded in fetched sources."""
    context = _sources_to_text(state["sources"])

    past_context = state.get("past_context", "")
    past_section = f"""
PAST STUDY NOTES (from the user's previous sessions — use for additional context only):
{past_context}

""" if past_context else ""

    prompt = f"""You are an expert educator. Using the source content below, write comprehensive lecture notes on: "{state['topic']}".

SOURCE CONTENT:
{context}
{past_section}
Rules:
- Output raw markdown only — no JSON, no code fences
- Use markdown headers (##), bullet points, bold for key terms
- Write at least 800 words — be thorough and detailed
- Cover all major subtopics from the sources
- Where a diagram would genuinely help, insert a marker on its own line: [DIAGRAM:diagram_1]
- Use at most 2 [DIAGRAM:x] markers
- Base notes primarily on the provided sources"""

    response = invoke_with_retry([HumanMessage(content=prompt)])
    notes = response.content.strip()

    # Extract diagram markers so visual_node knows what to generate
    diagram_ids = [d.strip() for d in re.findall(r'\[DIAGRAM:([^\]]+)\]', notes)]
    diagram_requests = [
        {"id": did, "type": "flowchart", "description": f"Visual diagram for '{did}' about {state['topic']}"}
        for did in diagram_ids
    ]

    return {"notes": notes, "diagram_requests": diagram_requests}


async def quiz_node(state: SessionState) -> dict:
    """TRANSFORM — generate exam questions grounded in fetched sources."""
    context = _sources_to_text(state["sources"])

    prompt = f"""You are an expert examiner. Using ONLY the source content below, create exam questions on the topic: "{state['topic']}".

SOURCE CONTENT:
{context}

Your output must be valid JSON in this exact format:
{{
  "mcq": [
    {{
      "question": "question text",
      "answers": ["option A", "option B", "option C", "option D"],
      "correct_answer": 0
    }}
  ],
  "short_questions": [
    {{
      "question": "question text",
      "sample_answer": "expected answer"
    }}
  ],
  "long_questions": [
    {{
      "question": "question text",
      "sample_answer": "detailed expected answer"
    }}
  ]
}}

Rules:
- Generate exactly 10 MCQ, 10 short answer, 2 long answer questions
- Base questions ONLY on the provided sources
- correct_answer is the index (0-3) of the correct option in answers array
- Questions should test genuine understanding of the TOPIC, not trivia
- NEVER reference the source type (e.g. do NOT say "according to Wikipedia", "in the YouTube video", "based on the source", "as stated in the article" etc.)
- Write questions as if testing knowledge of the topic directly"""

    response = invoke_with_retry([HumanMessage(content=prompt)])
    parsed = _parse_json(response.content)
    return {
        "mcq": parsed["mcq"],
        "short_questions": parsed["short_questions"],
        "long_questions": parsed["long_questions"],
    }


async def flashcard_node(state: SessionState) -> dict:
    """TRANSFORM — extract key concepts from notes as flashcards."""
    prompt = f"""You are a study coach. Based on the lecture notes below, create flashcards for the most important concepts.

LECTURE NOTES:
{state['notes']}

Your output must be valid JSON in this exact format:
{{
  "flashcards": [
    {{
      "front": "concept or question",
      "back": "definition or answer"
    }}
  ]
}}

Rules:
- Generate 10-15 flashcards
- Focus on key concepts, definitions, and relationships
- Keep front short (a term or question), back concise but complete"""

    response = invoke_with_retry([HumanMessage(content=prompt)])
    parsed = _parse_json(response.content)
    return {"flashcards": parsed["flashcards"]}


async def visual_node(state: SessionState) -> dict:
    """TRANSFORM — generate Mermaid diagrams for diagram_requests from notes_node."""
    diagram_requests = state.get("diagram_requests", [])
    if not diagram_requests:
        return {"diagrams": []}

    diagrams = []
    for req in diagram_requests:
        prompt = f"""Generate a simple Mermaid.js flowchart for: {req['description']}
Topic: {state['topic']}

Output ONLY this exact format, no explanation, no code fences:
flowchart TD
  A[Label] --> B[Label]
  B --> C[Label]
  C --> D[Label]

Rules:
- 4 to 6 nodes maximum
- Node labels: short words only, no commas, no parentheses, no special characters
- Only use --> arrows
- Every node must have a unique single letter ID"""

        response = invoke_with_retry([HumanMessage(content=prompt)])
        diagrams.append({
            "id": req["id"],
            "mermaid": response.content.strip(),
        })

    return {"diagrams": diagrams}


async def insights_node(state: SessionState) -> dict:
    """TRANSFORM — generate personalized insights after quiz submission."""
    context = _sources_to_text(state["sources"])
    mcq = state.get("mcq", [])
    user_answers = state.get("user_answers", {})
    mcq_answers = user_answers.get("mcq", [])

    wrong_questions = []
    correct_count = 0
    for i, q in enumerate(mcq):
        user_ans = mcq_answers[i] if i < len(mcq_answers) else None
        if user_ans == q["correct_answer"]:
            correct_count += 1
        else:
            wrong_questions.append({
                "question": q["question"],
                "user_answer": q["answers"][user_ans] if user_ans is not None else "unanswered",
                "correct_answer": q["answers"][q["correct_answer"]],
            })

    prompt = f"""You are a study coach giving personalized feedback.

Topic: {state['topic']}
MCQ Score: {correct_count}/{len(mcq)}

Questions the user got WRONG:
{json.dumps(wrong_questions, indent=2)}

SOURCE CONTENT (for reference):
{context[:2000]}

Write personalized study insights in markdown. Cover:
1. What the user struggled with and why
2. Key concepts to review
3. Common misconceptions related to their mistakes
4. What they did well (if anything)

Be specific, encouraging, and actionable. Keep it concise."""

    response = invoke_with_retry([HumanMessage(content=prompt)])
    return {"insights": response.content}


# ---------------------------------------------------------------------------
# Graph assembly
# ---------------------------------------------------------------------------

def build_session_graph():
    graph = StateGraph(SessionState)

    graph.add_node("fetch", fetch_node)
    graph.add_node("notes", notes_node)
    graph.add_node("quiz", quiz_node)
    graph.add_node("flashcards", flashcard_node)
    graph.add_node("visuals", visual_node)

    # Wave 1: fetch → notes + quiz in parallel
    graph.set_entry_point("fetch")
    graph.add_edge("fetch", "notes")
    graph.add_edge("fetch", "quiz")

    # Wave 2: notes → flashcards + visuals in parallel
    graph.add_edge("notes", "flashcards")
    graph.add_edge("notes", "visuals")

    graph.add_edge("quiz", END)
    graph.add_edge("flashcards", END)
    graph.add_edge("visuals", END)

    return graph.compile()


def build_insights_graph():
    """Triggered separately on quiz submit."""
    graph = StateGraph(SessionState)
    graph.add_node("insights", insights_node)
    graph.set_entry_point("insights")
    graph.add_edge("insights", END)
    return graph.compile()


session_graph = build_session_graph()
insights_graph = build_insights_graph()
