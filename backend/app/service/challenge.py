from fastapi import HTTPException
from datetime import datetime
from app.schema.challenge_schema import (
    ChallengeAttempt, ChallengeOut, ChallengeCreate, ChallengeUpdate
)
import json


class ChallengeService:

    @staticmethod
    def _parse_options(row: dict):
        options = row.get("options")

        # Case 1: None
        if not options:
            parsed_options = []

        # Case 2: already dict
        elif isinstance(options, dict):
            parsed_options = list(options.values())

        # Case 3: string (JSON string)
        elif isinstance(options, str):
            try:
                parsed = json.loads(options)
                if isinstance(parsed, dict):
                    parsed_options = list(parsed.values())
                elif isinstance(parsed, list):
                    parsed_options = parsed
                else:
                    parsed_options = [str(parsed)]
            except:
                parsed_options = [options]  # fallback

        # Case 4: already list
        elif isinstance(options, list):
            parsed_options = options

        else:
            parsed_options = []

        return {
            **row,
            "options": parsed_options
        }

    @staticmethod
    async def list_challenges_for_scene(scene_id: str, db) -> list[ChallengeOut]:
        rows = await db.fetch(
            "SELECT * FROM challenges WHERE scene_id = $1",
            scene_id
        )
        return [
            ChallengeOut(**ChallengeService._parse_options(dict(r)))
            for r in rows
        ]

    @staticmethod
    async def get_challenge(challenge_id: str, db) -> ChallengeOut:
        row = await db.fetchrow(
            "SELECT * FROM challenges WHERE id = $1",
            challenge_id
        )
        if not row:
            raise HTTPException(status_code=404, detail="Challenge not found")
        row = ChallengeService._parse_options(dict(row))
        return ChallengeOut(**row)

    @staticmethod
    async def create_challenge(body: ChallengeCreate, db) -> ChallengeOut:
        row = await db.fetchrow(
            """
            INSERT INTO challenges (scene_id, type, question, options, correct_answer, xp_reward, max_attempt)
            VALUES ($1,$2::question_type_enum,$3,$4,$5,$6,$7)
            RETURNING *
            """,
            body.scene_id,
            body.type,
            body.question,
            json.dumps(body.options) if body.options is not None else None,
            body.correct_answer,
            body.xp_reward or 0,
            body.max_attempt or 3,
        )
        row = ChallengeService._parse_options(dict(row))
        return ChallengeOut(**row)

    @staticmethod
    async def update_challenge(challenge_id: str, body: ChallengeUpdate, db) -> ChallengeOut:
        existing = await db.fetchrow(
            "SELECT * FROM challenges WHERE id = $1",
            challenge_id
        )
        if not existing:
            raise HTTPException(status_code=404, detail="Challenge not found")

        fields = body.dict(exclude_unset=True)
        if "options" in fields and fields["options"] is not None:
            fields["options"] = json.dumps(fields["options"])

        if not fields:
            existing = ChallengeService._parse_options(dict(existing))
            return ChallengeOut(**existing)

        set_clause = ", ".join(f"{k} = ${i+2}" for i, k in enumerate(fields))
        row = await db.fetchrow(
            f"UPDATE challenges SET {set_clause} WHERE id = $1 RETURNING *",
            challenge_id,
            *fields.values(),
        )
        row = ChallengeService._parse_options(dict(row))
        return ChallengeOut(**row)

    @staticmethod
    async def delete_challenge(challenge_id: str, db) -> dict:
        result = await db.execute(
            "DELETE FROM challenges WHERE id = $1",
            challenge_id
        )
        if result == "DELETE 0":
            raise HTTPException(status_code=404, detail="Challenge not found")
        return {"message": "Challenge deleted"}

    @staticmethod
    async def submit_attempt(user_id: str, challenge_id: str, story_id: str, answer_given: str, db) -> ChallengeAttempt:
        challenge = await db.fetchrow(
            "SELECT * FROM challenges WHERE id = $1",
            challenge_id
        )
        if not challenge:
            raise HTTPException(status_code=404, detail="Challenge not found")

        attempts = await db.fetchval(
            """
            SELECT COUNT(*) FROM challenge_attempts
            WHERE user_id = $1 AND challenge_id = $2
            """,
            user_id, challenge_id,
        )
        if attempts >= challenge["max_attempt"]:
            raise HTTPException(status_code=429, detail="Max attempts reached")

        is_correct = (
            answer_given.strip().lower()
            == challenge["correct_answer"].strip().lower()
        )
        xp_rewarded = challenge["xp_reward"] if is_correct else 0

        await db.execute(
            """
            INSERT INTO challenge_attempts
            (user_id, challenge_id, answer_given, is_correct, xp_reward)
            VALUES ($1,$2,$3,$4,$5)
            """,
            user_id, challenge_id, answer_given, is_correct, xp_rewarded,
        )

        if is_correct:
            # FIX: check whether this scene has a next scene via choices.
            # If no onward choice exists, this is the final scene → mark story completed.
            # Also do XP + status in one atomic UPDATE to keep user_progress consistent.
            has_next = await db.fetchval(
                """
                SELECT COUNT(*) FROM choices
                WHERE scene_id = $1 AND next_scene_id IS NOT NULL
                """,
                challenge["scene_id"],
            )

            if has_next == 0:
                # Final scene — complete the story atomically
                await db.execute(
                    """
                    UPDATE user_progress
                    SET xp_earned    = xp_earned + $1,
                        status       = 'completed',
                        completed_at = NOW()
                    WHERE user_id = $2 AND story_id = $3
                    """,
                    xp_rewarded, user_id, story_id,
                )
            else:
                # Mid-story challenge — just award XP, scene advances via choice
                await db.execute(
                    """
                    UPDATE user_progress
                    SET xp_earned = xp_earned + $1
                    WHERE user_id = $2 AND story_id = $3
                    """,
                    xp_rewarded, user_id, story_id,
                )

        return ChallengeAttempt(
            user_id=user_id,
            challenge_id=challenge_id,
            answer_given=answer_given,
            is_correct=is_correct,
            xp_rewarded=xp_rewarded,
            attempted_at=datetime.utcnow(),
        )

    @staticmethod
    async def get_user_attempts(user_id: str, challenge_id: str, db) -> list[ChallengeAttempt]:
        rows = await db.fetch(
            """
            SELECT * FROM challenge_attempts
            WHERE user_id=$1 AND challenge_id=$2
            ORDER BY attempted_at
            """,
            user_id, challenge_id,
        )
        return [ChallengeAttempt(**dict(r)) for r in rows]