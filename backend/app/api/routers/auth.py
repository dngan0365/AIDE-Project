from http.client import HTTPException
from fastapi import APIRouter, Depends
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from app.helper.auth import (hash_password, verify_password, create_token, decode_token, get_current_user)
from app.db.connect import get_db
from app.schema.auth_schema import (RegisterRequest, TokenResponse, UserOut)  
from app.service.auth import AuthService
# ── Auth routes ───────────────────────────────────────────────
router = APIRouter(prefix="/auth", tags=["Auth"])

@router.post("/register", response_model=TokenResponse, status_code=201)
async def register(body: RegisterRequest, db=Depends(get_db)):
    return await AuthService.register(body, db)
 
@router.post("/login", response_model=TokenResponse)
async def login(form: OAuth2PasswordRequestForm = Depends(), db=Depends(get_db)):
    return await AuthService.login(form, db)
 
@router.get("/me", response_model=UserOut)
async def me(user=Depends(get_current_user)):
    return await AuthService.me(user)