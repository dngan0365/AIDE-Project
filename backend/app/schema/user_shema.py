from datetime import datetime, timedelta
from typing import Optional
from pydantic import BaseModel, EmailStr

class UserOut(BaseModel):
    id: str
    name: str
    email: EmailStr
    role: str
    avatar_url: Optional[str] = None
    favorite_cultures: Optional[str] = None
    preferred_language: Optional[str] = None
    created_at: str