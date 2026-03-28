from uuid import UUID

from pydantic import BaseModel
from typing import List
from datetime import datetime

class ChoiceOut(BaseModel):
    id: UUID
    scene_id: UUID
    choice_text: str
    next_scene_id: UUID
    xp_reward: int
    next_scene_id: UUID

class ChoiceCreate(BaseModel):
    scene_id: UUID
    choice_text: str
    next_scene_id: UUID
    xp_reward: int

class ChoiceUpdate(BaseModel):
    choice_text: str = None
    next_scene_id: UUID = None
    xp_reward: int = None

class ChoiceRequest(BaseModel):
    scene_id: UUID
class ChoiceLog(BaseModel):
    user_id: UUID
    choice_id: UUID
    chosen_at: datetime