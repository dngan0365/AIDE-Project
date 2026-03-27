from datetime import datetime, timedelta
from typing import Optional
from uuid import UUID
from pydantic import BaseModel, EmailStr

class UserOut(BaseModel):
    id: UUID
    name: str
    email: EmailStr
    role: str
    avatar_url: Optional[str] = None
    favorite_cultures: Optional[str] = None
    preferred_language: Optional[str] = None
    created_at: datetime

class UserProgress(BaseModel):
    user_id: UUID
    story_id: UUID
    story_title: str
    current_scene_id: UUID
    current_scene_order: int
    status: str
    xp_earned: int
    updated_at: datetime
    
class ChallengeUserOut(BaseModel):
    challenge_id: UUID
    user_id: UUID
    scene_id: UUID
    scene_title: str
    total_xp: int
    progress: int
    updated_at: datetime