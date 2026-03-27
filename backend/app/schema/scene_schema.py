from typing import Optional

from pydantic import BaseModel
from datetime import datetime, timedelta
from uuid import UUID

class SceneOut(BaseModel):
    id: UUID
    story_id: UUID
    scene_order: int
    narrative_text: Optional[str] = None
    character_id: Optional[UUID] = None
    background_image_url: Optional[str] = None
    scene_type: str
    created_at: datetime

class SceneCreate(BaseModel):
    story_id: UUID
    scene_order: int
    narrative_text: str
    character_id: Optional[UUID] = None
    background_image_url: Optional[str] = None
    scene_type: str

class SceneUpdate(BaseModel):
    scene_order: int = None
    narrative_text: str = None
    character_id: Optional[UUID] = None
    background_image_url: Optional[str] = None
    scene_type: str = None

class SceneRequest(BaseModel):
    story_id: UUID
    scene_order: int

class SceneChallengeUserOut(BaseModel):
    challenge_id: UUID
    user_id: UUID
    scene_id: UUID
    scene_title: str
    total_xp: int
    progress: int
    updated_at: str