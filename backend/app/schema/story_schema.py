from typing import Optional

from pydantic import BaseModel
from datetime import datetime, timedelta
from uuid import UUID

class StoryOut(BaseModel):
    id: UUID
    title: str
    culture_topic: str
    description: str
    cover_image_url: Optional[str] = None
    difficulty: int
    estimated_time: Optional[str] = None
    is_published: bool
    estimated_minutes: int
    country: str
    culture_type: str
    created_at: datetime

class StoryCreate(BaseModel):
    title: str
    culture_topic: str
    description: str
    cover_image_url: Optional[str] = None
    difficulty: int
    estimated_time: Optional[str] = None
    is_published: bool
    estimated_minutes: int
    country: str
    culture_type: str

class StoryUpdate(BaseModel):
    title: str = None
    culture_topic: str = None
    description: str = None
    cover_image_url: Optional[str] = None
    difficulty: int = None
    estimated_time: Optional[str] = None
    is_published: bool = None
    estimated_minutes: int = None
    country: str = None
    culture_type: str = None