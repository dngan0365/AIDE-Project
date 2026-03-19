# ── Helpers ───────────────────────────────────────────────────
from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
import bcrypt
from passlib.context import CryptContext
from datetime import datetime, timedelta
from app.config import TOKEN_EXPIRE, settings
from app.db.connect import get_db

oauth2  = OAuth2PasswordBearer(tokenUrl="/auth/login")

def hash_password(pw: str) -> str:
    return bcrypt.hashpw(pw.encode(), bcrypt.gensalt()).decode()
 
def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode(), hashed.encode())
 
def create_token(data: dict) -> str:
    payload = {**data, "exp": datetime.utcnow() + timedelta(minutes=TOKEN_EXPIRE)}
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
 
def decode_token(token: str) -> dict:
    try:
        return jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
 
# ── Auth dependencies ─────────────────────────────────────────
async def get_current_user(token: str = Depends(oauth2), db=Depends(get_db)) -> dict:
    payload = decode_token(token)
    user = await db.fetchrow(
        "SELECT id, name, email, role, avatar_url, preferred_language, created_at "
        "FROM users WHERE id=$1",
        payload.get("sub"),
    )
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return dict(user)
 
def require_role(*roles: str):
    async def checker(user=Depends(get_current_user)):
        if user["role"] not in roles:
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        return user
    return checker

require_admin = require_role("admin")
require_any   = require_role("user", "admin")