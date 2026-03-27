"""
AI Chat Service — Gemini with persistent conversation memory.

Each (user, scene) pair has its own conversation history stored in
the `ai_chat_messages` table, so memory survives across sessions.

Flow:
    1. Load past messages for (user_id, scene_id) → build Gemini history
    2. Fetch character's prompt_template to construct the system prompt
    3. Send to Gemini with full history
    4. Persist both the user message and the model reply
    5. Return the assistant reply
"""

import os
from typing import Optional
from google import genai
from google.genai.types import GenerateContentConfig, HttpOptions, ModelContent, Part, UserContent, Content
from fastapi import HTTPException

# ---------------------------------------------------------------------------
# Initialise Gemini once at import time.
# Set GEMINI_API_KEY in your environment / .env file.
# ---------------------------------------------------------------------------
_GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
if _GEMINI_API_KEY:
    client = genai.Client(api_key=_GEMINI_API_KEY)

_MODEL_NAME = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")

# Max past turns kept in the context window sent to Gemini.
# Each "turn" = 1 user message + 1 model reply → 2 entries.
# Keeping 20 turns (40 messages) is a safe default.
_MAX_HISTORY_TURNS = int(os.getenv("GEMINI_MAX_HISTORY_TURNS", "10"))


# ---------------------------------------------------------------------------
# Public service class
# ---------------------------------------------------------------------------

class AIChatService:

    # ------------------------------------------------------------------
    # Core: send a message and get a reply
    # ------------------------------------------------------------------

    @staticmethod
    async def chat(
        scene_id: str,
        user_id: str,
        character_id: Optional[str],
        user_message: str,
        db,
    ) -> dict:
        """
        Send `user_message` in the context of a scene, persist it, get a
        Gemini reply, persist that too, and return the reply.
        """
        if not _GEMINI_API_KEY:
            raise HTTPException(
                status_code=503,
                detail="GEMINI_API_KEY is not configured on the server.",
            )

        # 1. Build system prompt from character template (if any)
        system_prompt = await _build_system_prompt(character_id, db)

        # 2. Load existing conversation history from DB
        history_rows = await db.fetch(
            """
            SELECT role, content FROM ai_chat_messages
            WHERE scene_id = $1 AND user_id = $2
            ORDER BY created_at ASC
            """,
            scene_id, user_id,
        )

        # Keep only the last N turns to avoid context overflows
        history_rows = list(history_rows)[-(_MAX_HISTORY_TURNS * 2):]

        # 3. Persist the incoming user message
        await db.execute(
            """
            INSERT INTO ai_chat_messages (scene_id, user_id, character_id, role, content)
            VALUES ($1,$2,$3,'user',$4)
            """,
            scene_id, user_id, character_id, user_message,
        )

        # 4. Call Gemini
        reply_text = await _call_gemini(
            system_prompt=system_prompt,
            history=history_rows,
            user_message=user_message,
        )

        # 5. Persist the model reply
        await db.execute(
            """
            INSERT INTO ai_chat_messages (scene_id, user_id, character_id, role, content)
            VALUES ($1,$2,$3,'model',$4)
            """,
            scene_id, user_id, character_id, reply_text,
        )

        return {
            "role": "model",
            "content": reply_text,
            "character_id": character_id,
            "scene_id": scene_id,
        }

    # ------------------------------------------------------------------
    # Retrieve conversation history
    # ------------------------------------------------------------------

    @staticmethod
    async def get_history(scene_id: str, user_id: str, db) -> list[dict]:
        rows = await db.fetch(
            """
            SELECT id, scene_id, user_id, character_id, role, content, created_at
            FROM ai_chat_messages
            WHERE scene_id = $1 AND user_id = $2
            ORDER BY created_at ASC
            """,
            scene_id, user_id,
        )
        return [_serialize_msg(r) for r in rows]

    # ------------------------------------------------------------------
    # Clear conversation memory for a (user, scene) pair
    # ------------------------------------------------------------------

    @staticmethod
    async def clear_history(scene_id: str, user_id: str, db) -> dict:
        await db.execute(
            "DELETE FROM ai_chat_messages WHERE scene_id=$1 AND user_id=$2",
            scene_id, user_id,
        )
        return {"message": "Conversation history cleared."}

    # ------------------------------------------------------------------
    # Regenerate last reply (delete last model message, re-call Gemini)
    # ------------------------------------------------------------------

    @staticmethod
    async def regenerate_last(
        scene_id: str,
        user_id: str,
        character_id: Optional[str],
        db,
    ) -> dict:
        # Find the last model message
        last_model = await db.fetchrow(
            """
            SELECT id FROM ai_chat_messages
            WHERE scene_id=$1 AND user_id=$2 AND role='model'
            ORDER BY created_at DESC LIMIT 1
            """,
            scene_id, user_id,
        )
        if not last_model:
            raise HTTPException(status_code=404, detail="No previous reply to regenerate.")

        # Delete it
        await db.execute("DELETE FROM ai_chat_messages WHERE id=$1", last_model["id"])

        # Find the last user message to resend
        last_user = await db.fetchrow(
            """
            SELECT content FROM ai_chat_messages
            WHERE scene_id=$1 AND user_id=$2 AND role='user'
            ORDER BY created_at DESC LIMIT 1
            """,
            scene_id, user_id,
        )
        if not last_user:
            raise HTTPException(status_code=404, detail="No user message to regenerate from.")

        # Re-use the normal chat flow (minus re-saving the user message)
        system_prompt = await _build_system_prompt(character_id, db)
        history_rows = await db.fetch(
            """
            SELECT role, content FROM ai_chat_messages
            WHERE scene_id=$1 AND user_id=$2
            ORDER BY created_at ASC
            """,
            scene_id, user_id,
        )
        history_rows = list(history_rows)[-(_MAX_HISTORY_TURNS * 2):]

        reply_text = await _call_gemini(
            system_prompt=system_prompt,
            history=history_rows[:-1],          # exclude the last user msg (we pass it directly)
            user_message=last_user["content"],
        )

        await db.execute(
            """
            INSERT INTO ai_chat_messages (scene_id, user_id, character_id, role, content)
            VALUES ($1,$2,$3,'model',$4)
            """,
            scene_id, user_id, character_id, reply_text,
        )

        return {"role": "model", "content": reply_text}


# ---------------------------------------------------------------------------
# Private helpers
# ---------------------------------------------------------------------------

async def _build_system_prompt(character_id: Optional[str], db) -> str:
    """
    If a character_id is given, use its prompt_template as the system prompt.
    Falls back to a sensible default about Southeast-Asian culture education.
    """
    default = (
        "You are a knowledgeable and engaging guide for Southeast Asian cultural stories. "
        "Provide immersive, accurate, and respectful insights about local traditions, history, "
        "and culture. Keep responses concise (2-4 sentences) unless the user asks for more detail."
    )

    if not character_id:
        return default

    row = await db.fetchrow(
        "SELECT name, role, personality, prompt_template FROM characters WHERE id=$1",
        character_id,
    )
    if not row or not row["prompt_template"]:
        return default

    # Allow the template to use {{name}}, {{role}}, {{personality}} placeholders
    template: str = row["prompt_template"]
    return (
        template
        .replace("{{name}}", row["name"] or "")
        .replace("{{role}}", row["role"] or "")
        .replace("{{personality}}", row["personality"] or "")
    )


async def _call_gemini(
    system_prompt: str,
    history: list,           # list of asyncpg Record with 'role' and 'content'
    user_message: str,
) -> str:
    """
    Build a Gemini GenerativeModel with a system instruction, reconstruct
    chat history, and send the latest user message.

    Gemini role mapping:
        DB role "user"  → Gemini "user"
        DB role "model" → Gemini "model"
    """
    contents = []
    # system prompt là message đầu tiên
    contents.append(
        Content(role="user", parts=[Part(text=system_prompt)])
    )
    # lịch sử chat
    for row in history:
        role = "user" if row["role"] == "user" else "model"
        contents.append(
            Content(role=role, parts=[Part(text=row["content"])])
        )
    # message mới nhất
    contents.append(
        Content(role="user", parts=[Part(text=user_message)])
    )
    try:
        response = client.models.generate_content(
            model=_MODEL_NAME,
            contents=contents,
            config=GenerateContentConfig(
                temperature=0.7,
                max_output_tokens=256,
            ),
        )
        return response.text

    except Exception as e:
        raise HTTPException(
            status_code=502,
            detail=f"Gemini API error: {str(e)}"
        )


def _serialize_msg(row) -> dict:
    d = dict(row)
    for key in ("id", "scene_id", "user_id", "character_id"):
        if key in d and d[key] is not None:
            d[key] = str(d[key])
    if d.get("created_at"):
        d["created_at"] = d["created_at"].isoformat()
    return d