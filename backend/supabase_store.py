import os
from supabase import create_client

_client = None


def _get_client():
    global _client
    if _client is None:
        _client = create_client(
            os.getenv("SUPABASE_URL"),
            os.getenv("SUPABASE_KEY"),
        )
    return _client


def insert_session(user_id: str, topic: str, notes: str) -> str:
    """Insert a new session and return its ID."""
    try:
        client = _get_client()
        res = client.table("sessions").insert({
            "user_id": user_id,
            "topic": topic,
            "notes": notes,
        }).execute()
        doc_id = res.data[0]["id"]
        print(f"[Supabase] inserted session '{topic}' → {doc_id}")
        return doc_id
    except Exception as e:
        print(f"[Supabase] insert error: {e}")
        return None


def update_insights(doc_id: str, insights: str):
    """Update an existing session with insights after exam submission."""
    try:
        client = _get_client()
        client.table("sessions").update({"insights": insights}).eq("id", doc_id).execute()
        print(f"[Supabase] updated insights for session {doc_id}")
    except Exception as e:
        print(f"[Supabase] update error: {e}")


def fetch_session(doc_id: str) -> dict:
    """Fetch full notes and insights for a session by ID."""
    try:
        client = _get_client()
        res = client.table("sessions").select("notes, insights").eq("id", doc_id).execute()
        if res.data:
            return res.data[0]
        return {}
    except Exception as e:
        print(f"[Supabase] fetch error: {e}")
        return {}
