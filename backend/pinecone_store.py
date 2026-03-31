import os
import hashlib
import time
from pinecone import Pinecone
from google import genai
from supabase_store import fetch_session

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
                config={"output_dimensionality": 768},
            )
            return result.embeddings[0].values
        except Exception as e:
            last_err = e
            continue
    raise RuntimeError(f"All embedding keys failed: {last_err}")


def query_similar(topic: str, user_id: str, top_k: int = 3) -> list[dict]:
    """
    Query Pinecone by topic embedding, fetch full notes + insights from Supabase.
    Returns list of { topic, notes, insights } dicts.
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
            doc_id = meta.get("doc_id")
            session_data = fetch_session(doc_id) if doc_id else {}
            past.append({
                "topic": meta.get("topic", ""),
                "notes": session_data.get("notes", ""),
                "insights": session_data.get("insights", ""),
            })
        print(f"[Pinecone] query '{topic}' → {len(past)} past sessions retrieved")
        return past
    except Exception as e:
        print(f"[Pinecone] query error: {e}")
        return []


def store_session(topic: str, doc_id: str, user_id: str):
    """
    Embed the topic and upsert into Pinecone with a reference to the Supabase doc_id.
    """
    try:
        index = _get_index()
        vector = _embed(topic)
        pinecone_id = hashlib.md5(f"{user_id}:{topic}:{time.time()}".encode()).hexdigest()

        index.upsert(vectors=[{
            "id": pinecone_id,
            "values": vector,
            "metadata": {
                "user_id": user_id,
                "topic": topic,
                "doc_id": doc_id,
            },
        }])
        print(f"[Pinecone] stored reference for '{topic}' → doc_id {doc_id}")
    except Exception as e:
        print(f"[Pinecone] upsert error: {e}")
