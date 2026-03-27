from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from app.helper.auth import (hash_password, verify_password, create_token, decode_token, get_current_user)
from app.db.connect import get_db
from app.schema.auth_schema import (ForgotPasswordRequest, LoginRequest, RefreshRequest, RegisterRequest, ResetPasswordRequest, TokenResponse, UserOut)  
from app.service.auth import AuthService
from app.helper.auth import require_admin
# ── Auth routes ───────────────────────────────────────────────
router = APIRouter(prefix="/auth", tags=["Auth"])

@router.get("/me")
async def me(db=Depends(get_db), user=Depends(get_current_user)):
    return await AuthService().me(user)

@router.post("/register")
async def register(body: RegisterRequest, db=Depends(get_db)):
    return await AuthService().register(body, db)

@router.post("/login")
async def login(body: LoginRequest, db=Depends(get_db)):
    return await AuthService().login(body, db)

@router.post("/forgot-password")
async def forgot_password(body: ForgotPasswordRequest, db=Depends(get_db)):
    return await AuthService().forgot_password(body, db)

@router.post("/reset-password")
async def reset_password(body: ResetPasswordRequest, db=Depends(get_db)):
    return await AuthService().reset_password(body, db)

@router.post("/refresh")
async def refresh_token(body: RefreshRequest, db=Depends(get_db)):
    return await AuthService().refresh_token(body, db)