import os
import random
import logging
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import BaseMessage
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

_keys = [
    os.getenv("GEMINI_API_KEY_1"),
    os.getenv("GEMINI_API_KEY_2"),
    os.getenv("GEMINI_API_KEY_3"),
    os.getenv("GEMINI_API_KEY_4"),
    os.getenv("GEMINI_API_KEY_5"),
]
_keys = [k for k in _keys if k]

if not _keys:
    raise ValueError("No Gemini API keys found. Set GEMINI_API_KEY_1..5 in .env")

# Models tried in order — each project key has independent quota per model
_FALLBACK_MODELS = [
    "gemini-2.5-flash",
    "gemini-2.5-flash-lite",
]

# Tracks (model, key) pairs that have hit their daily limit this process run
_exhausted: set[tuple[str, str]] = set()


def get_llm(model: str, key: str) -> ChatGoogleGenerativeAI:
    return ChatGoogleGenerativeAI(
        model=model,
        google_api_key=key,
        temperature=0.7,
    )


def invoke_with_retry(messages: list[BaseMessage]) -> any:
    """
    Try all (model, key) combinations. Skip pairs known to be daily-exhausted.
    Once a pair hits a daily limit it's remembered for the process lifetime.
    """
    last_error = None
    for model in _FALLBACK_MODELS:
        shuffled_keys = _keys.copy()
        random.shuffle(shuffled_keys)
        for key in shuffled_keys:
            if (model, key) in _exhausted:
                logger.warning(f"[LLM] Skipping {model} / ...{key[-6:]} (exhausted)")
                continue
            try:
                logger.warning(f"[LLM] Trying {model} / ...{key[-6:]}")
                return get_llm(model, key).invoke(messages)
            except Exception as e:
                err = str(e)
                if "429" in err or "RESOURCE_EXHAUSTED" in err:
                    logger.warning(f"[LLM] Rate limited: {model} / ...{key[-6:]}")
                    _exhausted.add((model, key))
                    last_error = e
                    continue
                if "503" in err or "UNAVAILABLE" in err:
                    logger.warning(f"[LLM] Overloaded (503): {model} / ...{key[-6:]}, trying next key")
                    last_error = e
                    continue
                if "404" in err or "NOT_FOUND" in err:
                    logger.warning(f"[LLM] Model not found: {model}, skipping all keys")
                    # Mark all keys as exhausted for this invalid model
                    for k in _keys:
                        _exhausted.add((model, k))
                    last_error = e
                    break  # break inner loop, move to next model
                raise

    raise RuntimeError(f"All Gemini combinations exhausted. Last error: {last_error}")
