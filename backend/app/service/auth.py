import datetime
import secrets
from fastapi import HTTPException
from app.helper.auth import decode_token, hash_password, verify_password, create_token, get_current_user
from app.schema.auth_schema import LoginRequest, RefreshRequest, RegisterRequest, ResetPasswordRequest, ForgotPasswordRequest
from app.helper.email import send_reset_email
from app.config import settings


class AuthService:
    async def register(self, body: RegisterRequest, db):
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

    async def login(self, body: LoginRequest, db):
        user = await db.fetchrow(
            "SELECT id, password_hash, role FROM users WHERE email=$1", body.email
        )
        if not user or not verify_password(body.password, user["password_hash"]):
            raise HTTPException(status_code=401, detail="Invalid credentials")
        token = create_token({"sub": str(user["id"]), "role": user["role"]})
        return {"access_token": token, "role": user["role"]}

    async def forgot_password(self, body: ForgotPasswordRequest, db):
        user = await db.fetchrow("SELECT id FROM users WHERE email=$1", body.email)

        if not user:
            return {"message": "If that email is registered, a reset link has been sent"}

        reset_token = secrets.token_urlsafe(32)
        expiry = datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(hours=1)

        await db.execute(
            "UPDATE users SET reset_token=$1, reset_token_expiry=$2 WHERE id=$3",
            reset_token, expiry, user["id"],
        )

        reset_link = f"{settings.FRONTEND_URL}/reset-password?token={reset_token}"
        await send_reset_email(to_email=body.email, reset_link=reset_link)

        return {"message": "If that email is registered, a reset link has been sent"}

    async def reset_password(self, body: ResetPasswordRequest, db):
        user = await db.fetchrow(
            "SELECT id, reset_token_expiry FROM users WHERE reset_token=$1", body.token,
        )
        if not user:
            raise HTTPException(400, "Invalid or expired reset token")

        expiry = user["reset_token_expiry"]
        if expiry is None or expiry < datetime.datetime.now(datetime.timezone.utc):
            raise HTTPException(400, "Reset token has expired")

        if len(body.new_password) < 6:
            raise HTTPException(422, "Password must be at least 6 characters")

        hashed = hash_password(body.new_password)
        await db.execute(
            "UPDATE users SET password_hash=$1, reset_token=NULL, reset_token_expiry=NULL WHERE id=$2",
            hashed, user["id"],
        )
        return {"message": "Password updated successfully"}

    async def me(self, user):  # user is passed in from the router via Depends(get_current_user)
        return {**user, "id": str(user["id"]), "created_at": str(user["created_at"])}
    
    async def refresh_token(self, body: RefreshRequest, db):
        payload = decode_token(body.refresh_token)
        if not payload:
            raise HTTPException(status_code=401, detail="Invalid refresh token")
        
        user_id = payload.get("sub")
        # optionally verify user still exists in db
        
        new_access_token = create_token({"sub": user_id})
        return {"access_token": new_access_token, "token_type": "bearer"}