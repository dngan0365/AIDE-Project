from typing import Optional
from uuid import UUID
from pydantic import BaseModel
from datetime import datetime

class EventOut(BaseModel):
    id: UUID
    story_id: Optional[UUID] = None
    title: str
    description: str
    started_at: datetime
    ended_at: datetime

class EventCreate(BaseModel):
    story_id: Optional[UUID] = None
    title: str
    description: str
    started_at: datetime
    ended_at: datetime

class EventUpdate(BaseModel):
    title: str = None
    description: str = None
    started_at: datetime = None
    ended_at: datetime = None

class EventRequest(BaseModel):
    story_id: Optional[UUID] = None