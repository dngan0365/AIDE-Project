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
    description: str
    next_scene_id: UUID
    xp_reward: int
    created_at: datetime

class ChoiceLog(BaseModel):
    user_id: UUID
    choice_id: UUID
    chosen_at: datetime