from typing import List
from app.schema.user_shema import UserProgress, ChallengeUserOut
from fastapi import HTTPException


class UserService:
    def __init__(self, db):
        self.db = db

    async def get_user(self, user_id: str):
        user = await self.db.fetchrow(
            "SELECT id, name, email, role, avatar_url, favorite_culture, preferred_language, created_at "
            "FROM users WHERE id=$1",
            user_id,
        )
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        return dict(user)

    async def update_profile(self, user_id: str, name: str = None, avatar_url: str = None, preferred_language: str = None):
        user = await self.get_user(user_id)
        updated = {
            "name": name or user["name"],
            "avatar_url": avatar_url if avatar_url is not None else user["avatar_url"],
            "preferred_language": preferred_language if preferred_language is not None else user["preferred_language"],
            "favorite_culture": user["favorite_culture"],
        }
        await self.db.execute(
            "UPDATE users SET name=$1, avatar_url=$2, preferred_language=$3, favorite_culture=$4 WHERE id=$5",
            updated["name"], updated["avatar_url"], updated["preferred_language"], updated["favorite_culture"], user_id,
        )
        return updated

    async def get_user_progress(self, user_id: str) -> List[UserProgress]:
        rows = await self.db.fetch(
            "SELECT up.user_id, up.story_id, s.title AS story_title, up.current_scene_id, "
            "up.status, up.xp_earned "
            "FROM user_progress up JOIN stories s ON up.story_id = s.id "
            "WHERE up.user_id=$1",
            user_id,
        )
        return [dict(row) for row in rows]

    async def get_user_challenges(self, user_id: str) -> List[ChallengeUserOut]:
        rows = await self.db.fetch(
            "SELECT c.id AS challenge_id, c.question AS challenge_title, c.type, c.xp_reward "
            # "uc.status, uc.progress, uc.updated_at "
            "FROM challenge_attempts uc JOIN challenges c ON uc.challenge_id = c.id "
            "WHERE uc.user_id=$1",
            user_id,
        )
        return [dict(row) for row in rows]