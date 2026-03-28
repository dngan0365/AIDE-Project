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
    async def delete_choice(choice_id: str, db) -> dict:
        # FIX: actually delete from DB (was returning existing row without deleting)
        result = await db.execute("DELETE FROM choices WHERE id = $1", choice_id)
        if result == "DELETE 0":
            raise HTTPException(status_code=404, detail="Choice not found")
        return {"message": "Choice deleted"}

    @staticmethod
    async def log_choice(user_id: str, choice_id: str, story_id: str, db) -> dict:
        """Record a user's choice, award XP, advance to next scene, and mark story completed if no next scene."""
        choice = await db.fetchrow("SELECT * FROM choices WHERE id = $1", choice_id)
        if not choice:
            raise HTTPException(status_code=404, detail="Choice not found")

        await db.execute(
            "INSERT INTO choice_log (user_id, choice_id) VALUES ($1,$2)",
            user_id, choice_id,
        )

        next_scene_id = choice["next_scene_id"]
        is_completed = next_scene_id is None
        xp_reward = choice["xp_reward"] or 0

        # FIX: single atomic UPDATE combining XP, scene advance, status, and completed_at
        # This prevents race conditions from separate queries and ensures completed_at
        # is always set together with status = 'completed'
        if is_completed:
            await db.execute(
                """
                UPDATE user_progress
                SET xp_earned     = xp_earned + $1,
                    current_scene_id = NULL,
                    status        = 'completed',
                    completed_at  = NOW()
                WHERE user_id = $2 AND story_id = $3
                """,
                xp_reward, user_id, story_id,
            )
        else:
            await db.execute(
                """
                UPDATE user_progress
                SET xp_earned        = xp_earned + $1,
                    current_scene_id = $2
                WHERE user_id = $3 AND story_id = $4
                """,
                xp_reward, next_scene_id, user_id, story_id,
            )

        return {
            "next_scene_id": str(next_scene_id) if next_scene_id else None,
            "xp_rewarded": xp_reward,
            "status": "completed" if is_completed else "in_progress",
        }

    @staticmethod
    async def get_choice_log(user_id: str, db) -> list[dict]:
        rows = await db.fetch(
            "SELECT * FROM choice_log WHERE user_id = $1 ORDER BY chosen_at DESC",
            user_id,
        )
        return [dict(r) | {"id": str(r["id"]), "choice_id": str(r["choice_id"])} for r in rows]

    @staticmethod
    async def get_user_progress(user_id: str, db) -> list[dict]:
        """Retrieve all story progress records for a user."""
        rows = await db.fetch(
            """
            SELECT
                id,
                user_id,
                story_id,
                current_scene_id,
                status,
                xp_earned,
                started_at,
                completed_at
            FROM user_progress
            WHERE user_id = $1
            ORDER BY started_at DESC
            """,
            user_id,
        )
        return [
            {
                "id": str(r["id"]),
                "user_id": str(r["user_id"]),
                "story_id": str(r["story_id"]),
                "current_scene_id": str(r["current_scene_id"]) if r["current_scene_id"] else None,
                "status": r["status"],
                "xp_earned": r["xp_earned"],
                "started_at": r["started_at"],
                "completed_at": r["completed_at"],
            }
            for r in rows
        ]

    @staticmethod
    async def get_user_progress_by_story(user_id: str, story_id: str, db) -> dict:
        """Retrieve a user's progress for a specific story."""
        row = await db.fetchrow(
            """
            SELECT
                id,
                user_id,
                story_id,
                current_scene_id,
                status,
                xp_earned,
                started_at,
                completed_at
            FROM user_progress
            WHERE user_id = $1 AND story_id = $2
            """,
            user_id, story_id,
        )
        if not row:
            raise HTTPException(status_code=404, detail="User progress not found")
        return {
            "id": str(row["id"]),
            "user_id": str(row["user_id"]),
            "story_id": str(row["story_id"]),
            "current_scene_id": str(row["current_scene_id"]) if row["current_scene_id"] else None,
            "status": row["status"],
            "xp_earned": row["xp_earned"],
            "started_at": row["started_at"],
            "completed_at": row["completed_at"],
        }