from typing import List, Optional, Dict, Any


from app.schema.challenge_schema import ChallengeOut
from app.schema.choice_schema import ChoiceOut
from fastapi import HTTPException
from app.schema.scene_schema import (SceneChallengeUserOut, SceneCreate, SceneOut, SceneUpdate, SceneRequest)

class SceneService:

    @staticmethod
    async def list_scenes(story_id: str, db) -> List[SceneOut]:
        rows = await db.fetch(
            "SELECT * FROM scenes WHERE story_id = $1 ORDER BY scene_order ASC",
            story_id,
        )
        return [SceneOut(**r) for r in rows]

    @staticmethod
    async def get_scene(scene_id: str, db) -> SceneOut:
        row = await db.fetchrow("SELECT * FROM scenes WHERE id = $1", scene_id)
        if not row:
            raise HTTPException(status_code=404, detail="Scene not found")
        return SceneOut(**row)

    @staticmethod
    async def create_scene(body: SceneCreate, db) -> SceneOut:
        row = await db.fetchrow(
            """
            INSERT INTO scenes (story_id, scene_order, narrative_text, character_id,
                background_image_url, scene_type)
            VALUES ($1,$2,$3,$4,$5,$6::scene_type_enum)
            RETURNING *
            """,
            body.story_id, body.scene_order, body.narrative_text,
            body.character_id, body.background_image_url,
            body.scene_type,
        )
        return SceneOut(**row)

    @staticmethod
    async def update_scene(scene_id: str, body: SceneUpdate, db) -> SceneOut:
        existing = await db.fetchrow("SELECT * FROM scenes WHERE id = $1", scene_id)
        if not existing:
            raise HTTPException(status_code=404, detail="Scene not found")

        fields = {k: v for k, v in body.dict(exclude_unset=True).items() if v is not None}
        if not fields:
            return SceneOut(**existing)

        set_clause = ", ".join(f"{k} = ${i+2}" for i, k in enumerate(fields))
        row = await db.fetchrow(
            f"UPDATE scenes SET {set_clause} WHERE id = $1 RETURNING *",
            scene_id, *fields.values(),
        )
        return SceneOut(**row)

    @staticmethod
    async def delete_scene(scene_id: str, db) -> dict:
        result = await db.execute("DELETE FROM scenes WHERE id = $1", scene_id)
        if result == "DELETE 0":
            raise HTTPException(status_code=404, detail="Scene not found")
        return {"message": "Scene deleted"}

    @staticmethod
    async def get_scene_with_choices_and_challenges(scene_id: str, db) -> SceneChallengeUserOut:
        scene = await db.fetchrow("SELECT * FROM scenes WHERE id = $1", scene_id)
        if not scene:
            raise HTTPException(status_code=404, detail="Scene not found")

        choices = await db.fetch("SELECT * FROM choices WHERE scene_id = $1", scene_id)
        challenges = await db.fetch("SELECT * FROM challenges WHERE scene_id = $1", scene_id)

        result = SceneOut(**scene)
        result.choices = [ChoiceOut(**c) for c in choices]
        result.challenges = [ChallengeOut(**c) for c in challenges]
        return result
    
    @staticmethod
    async def get_scene_challenges(scene_id: str, db) -> List[ChallengeOut]:
        rows = await db.fetch("SELECT * FROM challenges WHERE scene_id = $1", scene_id)
        return [ChallengeOut(**r) for r in rows]
    
    @staticmethod
    async def get_scene_challenge_user(scene_id: str, user_id: str, db) -> List[SceneChallengeUserOut]:
        rows = await db.fetch(
            """
            SELECT cu.*, u.name AS user_name, c.name AS challenge_name
            FROM challenge_users cu
            JOIN users u ON cu.user_id = u.id
            JOIN challenges c ON cu.challenge_id = c.id
            WHERE cu.scene_id = $1 AND cu.user_id = $2
            """,
            scene_id, user_id
        )
        return [SceneChallengeUserOut(**r) for r in rows]

    @staticmethod
    async def get_scene_challenge_users(scene_id: str, db) -> List[SceneChallengeUserOut]:
        rows = await db.fetch(
            """
            SELECT cu.*, u.name AS user_name, c.name AS challenge_name
            FROM challenge_users cu
            JOIN users u ON cu.user_id = u.id
            JOIN challenges c ON cu.challenge_id = c.id
            WHERE cu.scene_id = $1
            """,
            scene_id
        )
        return [SceneChallengeUserOut(**r) for r in rows]

    @staticmethod
    async def get_scene_choices(scene_id: str, db) -> List[ChoiceOut]:
        rows = await db.fetch("SELECT * FROM choices WHERE scene_id = $1", scene_id)
        return [ChoiceOut(**r) for r in rows]

    @staticmethod
    async def get_scene_choices_user(scene_id: str, user_id: str, db) -> List[ChoiceOut]:
        rows = await db.fetch(
            """
            SELECT ch.*, cu.user_id
            FROM choices ch
            LEFT JOIN choice_users cu ON ch.id = cu.choice_id AND cu.user_id = $2
            WHERE ch.scene_id = $1
            """,
            scene_id, user_id
        )
        return [ChoiceOut(**r) for r in rows]