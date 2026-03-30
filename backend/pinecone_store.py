import os
import hashlib
from pinecone import Pinecone
from google import genai

_pc = None
_index = None
_INDEX_NAME = "testquest"


def _get_index():
    global _pc, _index
    if _index is None:
        _pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))
        _index = _pc.Index(_INDEX_NAME)
    return _index


_EMBED_KEYS = [k for k in [
    os.getenv("GEMINI_API_KEY_1"),
    os.getenv("GEMINI_API_KEY_2"),
    os.getenv("GEMINI_API_KEY_3"),
] if k]


def _embed(text: str) -> list[float]:
    """Embed text using gemini-embedding-001 (768 dims), with key fallback."""
    last_err = None
    for key in _EMBED_KEYS:
        try:
            client = genai.Client(api_key=key)
            result = client.models.embed_content(
                model="gemini-embedding-001",
                contents=text[:8000],
            )
            return result.embeddings[0].values
        except Exception as e:
            last_err = e
            continue
    raise RuntimeError(f"All embedding keys failed: {last_err}")


def query_similar(topic: str, user_id: str, top_k: int = 3) -> list[dict]:
    """
    Query Pinecone for past sessions similar to the given topic.
    Returns list of { topic, notes_snippet, insights_snippet, flashcards_snippet } dicts.
    """
    try:
        index = _get_index()
        vector = _embed(topic)
        results = index.query(
            vector=vector,
            top_k=top_k,
            include_metadata=True,
            filter={"user_id": {"$eq": user_id}} if user_id else None,
        )
        past = []
        for match in results.get("matches", []):
            if match["score"] < 0.75:
                continue
            meta = match.get("metadata", {})
            past.append({
                "topic": meta.get("topic", ""),
                "notes_snippet": meta.get("notes_snippet", ""),
                "insights_snippet": meta.get("insights_snippet", ""),
                "flashcards_snippet": meta.get("flashcards_snippet", ""),
            })
        print(f"[Pinecone] query '{topic}' → {len(past)} past sessions retrieved")
        return past
    except Exception as e:
        print(f"[Pinecone] query error: {e}")
        return []


def store_session(topic: str, notes: str, user_id: str,
                  flashcards: list = None, insights: str = ""):
    """
    Embed and upsert session notes + flashcards + insights into Pinecone.
    ID is deterministic so re-running the same topic updates rather than duplicates.
    """
    try:
        index = _get_index()

        # Combine all content for a richer embedding
        flashcards_text = ""
        if flashcards:
            flashcards_text = " ".join(
                f"{f.get('front', '')}: {f.get('back', '')}"
                for f in flashcards[:20]
            )

        combined = f"{notes}\n\n{flashcards_text}\n\n{insights}"
        vector = _embed(combined[:8000])
        doc_id = hashlib.md5(f"{user_id}:{topic}".encode()).hexdigest()

        index.upsert(vectors=[{
            "id": doc_id,
            "values": vector,
            "metadata": {
                "user_id": user_id,
                "topic": topic,
                "notes_snippet": notes[:500],
                "insights_snippet": insights[:300] if insights else "",
                "flashcards_snippet": flashcards_text[:200] if flashcards_text else "",
            },
        }])
        print(f"[Pinecone] stored session '{topic}' for user '{user_id}'")
    except Exception as e:
        print(f"[Pinecone] upsert error: {e}")
