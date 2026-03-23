from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from app.helper.auth import (hash_password, verify_password, create_token, decode_token, get_current_user)
from app.db.connect import get_db
from app.schema.auth_schema import (LoginRequest, RegisterRequest, ResetPasswordRequest, TokenResponse, UserOut)  
from app.service.auth import AuthService
# ── Auth routes ───────────────────────────────────────────────
router = APIRouter(prefix="/auth", tags=["Auth"])

@router.post("/register", response_model=TokenResponse, status_code=201)
async def register(body: RegisterRequest, db=Depends(get_db)):
    return await AuthService.register(body, db)
@router.post("/login", response_model=TokenResponse)
async def login(body: LoginRequest, db=Depends(get_db)):
    return await AuthService.login(body, db)
@router.get("/me", response_model=UserOut)
async def me(user=Depends(get_current_user)):
    return await AuthService.me(user)
@router.post("/reset-password")
async def reset_password(body: ResetPasswordRequest, db=Depends(get_db)):
    return await AuthService.reset_password(body, db)
@router.post("/logout", response_model=TokenResponse)
async def logout(user=Depends(get_current_user)):
    return await AuthService.logout(user)
