from typing import List, Optional, Any
import json
from fastapi import HTTPException

from app.schema.challenge_schema import ChallengeOut
from app.schema.choice_schema import ChoiceOut
from app.schema.scene_schema import (
    SceneChallengeUserOut,
    SceneCreate,
    SceneOut,
    SceneUpdate,
)

# Scene types that require no user interaction
PASSIVE_SCENE_TYPES = {"narrative", "cutscene", "dialogue"}


# ========================
# JSONB HELPERS
# ========================

def _serialize_reference(reference: Any) -> Optional[str]:
    if reference is None:
        return None
    if isinstance(reference, (list, dict)):
        return json.dumps(reference)
    return reference  # already string


def _deserialize_reference(data: dict) -> dict:
    if data.get("reference"):
        try:
            data["reference"] = json.loads(data["reference"])
        except Exception:
            pass
    return data


# ========================
# SERVICE
# ========================

class SceneService:

    # -------- LIST --------
    @staticmethod
    async def list_scenes(story_id: str, db) -> List[SceneOut]:
        rows = await db.fetch(
            "SELECT * FROM scenes WHERE story_id = $1 ORDER BY scene_order ASC",
            story_id,
        )

        result = []
        for r in rows:
            data = _deserialize_reference(dict(r))
            result.append(SceneOut(**data))

        return result

    # -------- GET --------
    @staticmethod
    async def get_scene(scene_id: str, db) -> SceneOut:
        row = await db.fetchrow(
            "SELECT * FROM scenes WHERE id = $1",
            scene_id,
        )

        if not row:
            raise HTTPException(status_code=404, detail="Scene not found")

        data = _deserialize_reference(dict(row))
        return SceneOut(**data)

    # -------- CREATE --------
    @staticmethod
    async def create_scene(body: SceneCreate, db) -> SceneOut:
        reference = _serialize_reference(body.reference)

        row = await db.fetchrow(
            """
            INSERT INTO scenes (
                story_id, scene_order, narrative_text, character_id,
                background_image_url, scene_type, content, reference
            )
            VALUES ($1,$2,$3,$4,$5,$6::scene_type_enum,$7,$8::jsonb)
            RETURNING *
            """,
            body.story_id,
            body.scene_order,
            body.narrative_text,
            body.character_id,
            body.background_image_url,
            body.scene_type,
            body.content,
            reference,
        )

        data = _deserialize_reference(dict(row))
        return SceneOut(**data)

    # -------- UPDATE --------
    @staticmethod
    async def update_scene(scene_id: str, body: SceneUpdate, db) -> SceneOut:
        existing = await db.fetchrow(
            "SELECT * FROM scenes WHERE id = $1",
            scene_id,
        )

        if not existing:
            raise HTTPException(status_code=404, detail="Scene not found")

        fields = body.dict(exclude_unset=True)

        # JSONB serialize
        if "reference" in fields:
            fields["reference"] = _serialize_reference(fields["reference"])

        # remove None
        fields = {k: v for k, v in fields.items() if v is not None}

        if not fields:
            return SceneOut(**_deserialize_reference(dict(existing)))

        set_parts = []
        values = [scene_id]

        for i, (key, value) in enumerate(fields.items()):
            if key == "scene_type":
                set_parts.append(f"{key} = ${i+2}::scene_type_enum")
            elif key == "reference":
                set_parts.append(f"{key} = ${i+2}::jsonb")
            else:
                set_parts.append(f"{key} = ${i+2}")
            values.append(value)

        set_clause = ", ".join(set_parts)

        row = await db.fetchrow(
            f"""
            UPDATE scenes
            SET {set_clause}
            WHERE id = $1
            RETURNING *
            """,
            *values,
        )

        data = _deserialize_reference(dict(row))
        return SceneOut(**data)

    # -------- DELETE --------
    @staticmethod
    async def delete_scene(scene_id: str, db) -> dict:
        result = await db.execute(
            "DELETE FROM scenes WHERE id = $1",
            scene_id,
        )

        if result == "DELETE 0":
            raise HTTPException(status_code=404, detail="Scene not found")

        return {"message": "Scene deleted"}

    # -------- SCENE + RELATIONS --------
    @staticmethod
    async def get_scene_with_choices_and_challenges(scene_id: str, db):
        scene = await db.fetchrow(
            "SELECT * FROM scenes WHERE id = $1",
            scene_id,
        )

        if not scene:
            raise HTTPException(status_code=404, detail="Scene not found")

        choices = await db.fetch(
            "SELECT * FROM choices WHERE scene_id = $1",
            scene_id,
        )

        challenges = await db.fetch(
            "SELECT * FROM challenges WHERE scene_id = $1",
            scene_id,
        )

        data = _deserialize_reference(dict(scene))

        result = SceneOut(**data)
        result.choices = [ChoiceOut(**c) for c in choices]
        result.challenges = [ChallengeOut(**c) for c in challenges]

        return result

    # -------- ADVANCE --------
    @staticmethod
    async def advance_scene(scene_id: str, user_id: str, story_id: str, db) -> dict:
        scene = await db.fetchrow(
            "SELECT id, scene_type, scene_order, story_id FROM scenes WHERE id = $1",
            scene_id,
        )

        if not scene:
            raise HTTPException(status_code=404, detail="Scene not found")

        if scene["scene_type"] not in PASSIVE_SCENE_TYPES:
            raise HTTPException(
                status_code=400,
                detail=f"Scene type '{scene['scene_type']}' must be advanced via choice or challenge submission"
            )

        next_scene = await db.fetchrow(
            """
            SELECT id FROM scenes
            WHERE story_id = $1 AND scene_order > $2
            ORDER BY scene_order ASC
            LIMIT 1
            """,
            scene["story_id"],
            scene["scene_order"],
        )

        is_completed = next_scene is None
        next_scene_id = next_scene["id"] if next_scene else None

        if is_completed:
            await db.execute(
                """
                UPDATE user_progress
                SET current_scene_id = NULL,
                    status = 'completed',
                    completed_at = NOW()
                WHERE user_id = $1 AND story_id = $2
                """,
                user_id,
                story_id,
            )
        else:
            await db.execute(
                """
                UPDATE user_progress
                SET current_scene_id = $1
                WHERE user_id = $2 AND story_id = $3
                """,
                next_scene_id,
                user_id,
                story_id,
            )

        return {
            "next_scene_id": str(next_scene_id) if next_scene_id else None,
            "status": "completed" if is_completed else "in_progress",
        }