from typing import TypedDict, Optional


class SessionState(TypedDict):
    # Input
    topic: str

    # fetch_node output (shared by all nodes)
    sources: Optional[list[dict]]        # [{ url, content }]
    source_urls: Optional[list[str]]

    # notes_node output
    notes: Optional[str]                 # markdown with [DIAGRAM:id] markers
    diagram_requests: Optional[list[dict]]  # [{ id, type, description }]

    # visual_node output
    diagrams: Optional[list[dict]]       # [{ id, mermaid }]

    # flashcard_node output
    flashcards: Optional[list[dict]]     # [{ front, back }]

    # quiz_node output
    mcq: Optional[list[dict]]            # [{ question, answers[], correct_answer }]
    short_questions: Optional[list[dict]]  # [{ question, sample_answer }]
    long_questions: Optional[list[dict]]   # [{ question, sample_answer }]

    # insights_node output (populated on submit)
    user_answers: Optional[dict]         # { mcq: [], short: [], long: [] }
    score: Optional[float]               # percentage 0-100
    fruits_earned: Optional[int]
    insights: Optional[str]              # markdown
