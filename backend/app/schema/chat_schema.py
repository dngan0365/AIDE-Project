from typing import Optional
from uuid import UUID

from pydantic import BaseModel
from datetime import datetime

class AIChatMessage(BaseModel):
    id: UUID
    scene_id: UUID
    user_id: UUID
    character_id: UUID
    role: str  # "user" or "character"
    content: str
    created_at: datetime

class AIChatMessageCreate(BaseModel):
    scene_id: UUID
    user_id: UUID
    character_id: UUID
    role: str  # "user" or "character"
    content: str


class ChatRequest(BaseModel):
    scene_id: str
    character_id: Optional[str] = None
    message: str

class RegenerateRequest(BaseModel):
    scene_id: str
    character_id: Optional[str] = None