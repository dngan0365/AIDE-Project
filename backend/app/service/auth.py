import datetime
from http.client import HTTPException
from fastapi import APIRouter, Depends
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from app.helper.auth import (hash_password, verify_password, create_token, decode_token, get_current_user)
from app.db.connect import get_db
from app.schema.auth_schema import (RegisterRequest, TokenResponse, UserOut)  

# ── Auth routes ───────────────────────────────────────────────
class AuthService:
    async def register(body: RegisterRequest, db=Depends(get_db)):
        existing = await db.fetchrow("SELECT id FROM users WHERE email=$1", body.email)
        if existing:
            raise HTTPException(status_code=400, detail="Email already registered")
        hashed = hash_password(body.password)
        user = await db.fetchrow(
            "INSERT INTO users (name, email, password_hash, role) VALUES ($1,$2,$3,'user') RETURNING id, role",
            body.name, body.email, hashed,
        )
        token = create_token({"sub": str(user["id"]), "role": user["role"]})
        return {"access_token": token, "role": user["role"]}
    
    async def login(form: OAuth2PasswordRequestForm = Depends(), db=Depends(get_db)):
        user = await db.fetchrow(
            "SELECT id, password_hash, role FROM users WHERE email=$1", form.username
        )
        if not user or not verify_password(form.password, user["password_hash"]):
            raise HTTPException(status_code=401, detail="Invalid credentials")
        token = create_token({"sub": str(user["id"]), "role": user["role"]})
        return {"access_token": token, "role": user["role"]}
    
    async def reset_password(body: ResetPasswordRequest, db=Depends(get_db)):
        user = await db.fetchrow(
            "SELECT id, reset_token_expiry FROM users WHERE reset_token=$1",
            body.token
        )
        if not user:
            raise HTTPException(400, "Invalid or expired reset token")

        expiry = user["reset_token_expiry"]
        if expiry is None or expiry < datetime.now(datetime.timezone.utc):
            raise HTTPException(400, "Reset token has expired")

        if len(body.new_password) < 6:
            raise HTTPException(422, "Password must be at least 6 characters")

        hashed = hash_password(body.new_password)
        await db.execute(
            """UPDATE users
            SET password_hash=$1, reset_token=NULL, reset_token_expiry=NULL
            WHERE id=$2""",
            hashed, user["id"]
        )
        return {"message": "Password updated successfully"}
        
    async def me(user=Depends(get_current_user)):
        return {**user, "id": str(user["id"]), "created_at": str(user["created_at"])}