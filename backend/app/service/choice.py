from fastapi import HTTPException
from app.schema.choice_schema import ChoiceOut, ChoiceCreate, ChoiceUpdate, ChoiceRequest

class ChoiceService:

    @staticmethod
    async def list_choices_for_scene(scene_id: str, db) -> list[ChoiceOut]:
        rows = await db.fetch("SELECT * FROM choices WHERE scene_id = $1", scene_id)
        return [ChoiceOut(**r) for r in rows]

    @staticmethod
    async def get_choice(choice_id: str, db) -> ChoiceOut:
        row = await db.fetchrow("SELECT * FROM choices WHERE id = $1", choice_id)
        if not row:
            raise HTTPException(status_code=404, detail="Choice not found")
        return ChoiceOut(**row)

    @staticmethod
    async def create_choice(body: ChoiceCreate, db) -> ChoiceOut:
        row = await db.fetchrow(
            """
            INSERT INTO choices (scene_id, choice_text, next_scene_id, xp_reward)
            VALUES ($1,$2,$3,$4)
            RETURNING *
            """,
            body.scene_id, body.choice_text, body.next_scene_id, body.xp_reward
        )
        return ChoiceOut(**row)

    @staticmethod
    async def update_choice(choice_id: str, body: ChoiceUpdate, db) -> ChoiceOut:
        existing = await db.fetchrow("SELECT * FROM choices WHERE id = $1", choice_id)
        if not existing:
            raise HTTPException(status_code=404, detail="Choice not found")

        fields = {k: v for k, v in body.dict(exclude_unset=True).items() if v is not None}
        if not fields:
            return ChoiceOut(**existing)

        set_clause = ", ".join(f"{k} = ${i+2}" for i, k in enumerate(fields))
        row = await db.fetchrow(
            f"UPDATE choices SET {set_clause} WHERE id = $1 RETURNING *",
            choice_id, *fields.values(),
        )
        return ChoiceOut(**row)

    @staticmethod
    async def delete_choice(choice_id: str, db) -> ChoiceOut:
        existing = await db.fetchrow("SELECT * FROM choices WHERE id = $1", choice_id)
        if not existing:
            raise HTTPException(status_code=404, detail="Choice not found")
        return ChoiceOut(**existing)

    @staticmethod
    async def log_choice(user_id: str, choice_id: str, db) -> dict:
        """Record a user's choice and award XP."""
        choice = await db.fetchrow("SELECT * FROM choices WHERE id = $1", choice_id)
        if not choice:
            raise HTTPException(status_code=404, detail="Choice not found")

        await db.execute(
            "INSERT INTO choice_log (user_id, choice_id) VALUES ($1,$2)",
            user_id, choice_id,
        )

        if choice["xp_reward"] > 0:
            await db.execute(
                "UPDATE user_progress SET xp_earned = xp_earned + $1 WHERE user_id = $2",
                choice["xp_reward"], user_id,
            )

        return {
            "next_scene_id": str(choice["next_scene_id"]) if choice["next_scene_id"] else None,
            "xp_rewarded": choice["xp_reward"],
        }

    @staticmethod
    async def get_choice_log(user_id: str, db) -> list[dict]:
        rows = await db.fetch(
            "SELECT * FROM choice_log WHERE user_id = $1 ORDER BY chosen_at DESC",
            user_id,
        )
        return [dict(r) | {"id": str(r["id"]), "choice_id": str(r["choice_id"])} for r in rows]

