from typing import Optional
from uuid import UUID

from pydantic import BaseModel
from datetime import datetime, timedelta

class CharacterOut(BaseModel):
    id: UUID
    name: str
    role: str
    culture_topic: str
    description: str
    personality: str
    prompt_template: Optional[str] = None
    avatar_image_url: Optional[str] = None
    created_at: Optional[datetime] = None

class CharacterCreate(BaseModel):
    name: str
    role: str
    culture_topic: str
    description: str
    personality: str
    prompt_template: Optional[str] = None
    avatar_image_url: Optional[str] = None

class CharacterUpdate(BaseModel):
    name: Optional[str] = None
    role: Optional[str] = None
    culture_topic: Optional[str] = None
    description: Optional[str] = None
    personality: Optional[str] = None
    prompt_template: Optional[str] = None
    avatar_image_url: Optional[str] = None

