
from http.client import HTTPException
from app.helper.auth import decode_token


class UserService:
    def __init__(self, db):
        self.db = db

    async def get_user(self, id: str):
        user = await self.db.fetchrow(
            "SELECT id, name, email, role, avatar_url, favorite_cultures, preferred_language, created_at "
            "FROM users WHERE id=$1",
            id,
        )
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        return dict(user)
    
    async def update_profile(self, id: str, name: str = None, avatar_url: str = None, preferred_language: str = None):
        user = await self.get_user(id)
        updated = {
            "name": name or user["name"],
            "avatar_url": avatar_url if avatar_url is not None else user["avatar_url"],
            "preferred_language": preferred_language if preferred_language is not None else user["preferred_language"],
            "favorite_cultures": user["favorite_cultures"]
        }
        await self.db.execute(
            "UPDATE users SET name=$1, avatar_url=$2, preferred_language=$3, favorite_cultures=$4 WHERE id=$5",
            updated["name"], updated["avatar_url"], updated["preferred_language"], updated["favorite_cultures"], id
        )
        return updated
    
        