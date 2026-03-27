from datetime import datetime
from typing import List, Optional, Dict, Any
from uuid import UUID
from pydantic import BaseModel
from enum import Enum

class QuestionType(str, Enum):
    quiz = "quiz"
    puzzle = "puzzle"
    riddle = "riddle"
    matching = "matching"
    
class ChallengeOut(BaseModel):
    id: UUID
    scene_id: UUID
    type: QuestionType
    options: Optional[List[str]] = None   
    correct_answer: str
    max_attempt: int
    created_at: Optional[datetime] = None

class ChallengeCreate(BaseModel):
    scene_id: UUID
    type: QuestionType
    options: Optional[Dict[str, Any]]   
    correct_answer: str
    max_attempt: int

class ChallengeUpdate(BaseModel):
    type: Optional[QuestionType] = None
    options: Optional[Dict[str, Any]] = None   
    correct_answer: Optional[str] = None
    max_attempt: Optional[int] = None

class ChallengeAttempt(BaseModel):
    user_id: UUID
    challenge_id: UUID
    answer_given: str
    is_correct: bool
    attempted_at: datetime
    xp_rewarded: int