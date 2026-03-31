import json
from typing import Optional
from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from graphs.session_graph import session_graph, insights_graph
from pinecone_store import store_session, query_similar
from supabase_store import insert_session, update_insights

router = APIRouter(prefix="/api/session")


class StartRequest(BaseModel):
    topic: str
    user_id: Optional[str] = None


class SubmitRequest(BaseModel):
    topic: str
    sources: list[dict]
    mcq: list[dict]
    short_questions: list[dict]
    long_questions: list[dict]
    user_answers: dict  # { mcq: [], short: [], long: [] }
    notes: Optional[str] = None
    user_id: Optional[str] = None


def _calculate_score(mcq: list[dict], mcq_answers: list) -> tuple[float, int]:
    """Returns (score_percentage, fruits_earned)."""
    if not mcq:
        return 0.0, 0
    correct = sum(
        1 for i, q in enumerate(mcq)
        if i < len(mcq_answers) and mcq_answers[i] == q["correct_answer"]
    )
    score = (correct / len(mcq)) * 100
    if score >= 90:
        fruits = 20
    elif score >= 80:
        fruits = 10
    elif score >= 70:
        fruits = 5
    else:
        fruits = 0
    return round(score, 1), fruits


@router.post("/start")
async def start_session(req: StartRequest):
    """
    Starts a study session for a topic.
    Streams node completion events via SSE as each agent finishes.
    """
    async def event_stream():
        state = {"topic": req.topic, "user_id": req.user_id}
        session_result = {}

        async for event in session_graph.astream_events(state, version="v2"):
            kind = event.get("event")
            name = event.get("name", "")

            if kind == "on_chain_end" and name in ("fetch", "notes", "quiz", "flashcards", "visuals"):
                output = event.get("data", {}).get("output", {})
                if name == "notes":
                    session_result["notes"] = output.get("notes", "")
                if name == "flashcards":
                    session_result["flashcards"] = output.get("flashcards", [])
                payload = json.dumps({
                    "node": name,
                    "status": "done",
                    "data": output,
                })
                yield f"data: {payload}\n\n"

        # Signal stream complete
        yield f"data: {json.dumps({'node': 'complete', 'status': 'done'})}\n\n"

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
        },
    )


@router.post("/submit")
async def submit_session(req: SubmitRequest):
    """
    Receives quiz answers, runs insights_node, returns score + insights.
    """
    score, fruits = _calculate_score(req.mcq, req.user_answers.get("mcq", []))

    state = {
        "topic": req.topic,
        "sources": req.sources,
        "mcq": req.mcq,
        "short_questions": req.short_questions,
        "long_questions": req.long_questions,
        "user_answers": req.user_answers,
        "score": score,
        "fruits_earned": fruits,
    }

    result = await insights_graph.ainvoke(state)
    insights = result.get("insights", "")

    # Insert full session (notes + insights) to Supabase, then index in Pinecone
    if req.user_id and req.notes and insights:
        doc_id = insert_session(req.user_id, req.topic, req.notes)
        if doc_id:
            update_insights(doc_id, insights)
            store_session(req.topic, doc_id, req.user_id)

    return {
        "score": score,
        "fruits_earned": fruits,
        "insights": insights,
    }
