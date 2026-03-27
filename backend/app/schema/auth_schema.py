from datetime import datetime, timedelta
from typing import Optional
from pydantic import BaseModel, EmailStr

class RegisterRequest(BaseModel):
    name: str
    email: EmailStr
    password: str

class LoginRequest(BaseModel):
    email: EmailStr
    password: str
 
class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str
 
class UserOut(BaseModel):
    id: str
    name: str
    email: str
    role: str
    avatar_url: Optional[str] = None
    preferred_language: Optional[str] = None
    created_at:datetime
 
class UpdateRoleRequest(BaseModel):
    role: str
# ── Reset password ───────────────────────────────────────────
class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str
class ForgotPasswordRequest(BaseModel):
    email: str
class RefreshRequest(BaseModel):
    refresh_token: str
    