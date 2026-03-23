from app.service.user import UserService
from backend.app.helper.auth import get_current_user
from fastapi import APIRouter, Depends, HTTPException
from app.db.connect import get_db

router = APIRouter(prefix="/users", tags=["Users"])

@router.get("/me")
async def read_user_me(current_user=Depends(get_current_user), db=Depends(get_db)):
    return await UserService.read_user_me(current_user, db)

@router.put('/me')
async def update_profile(name: str = None, avatar_url: str = None, preferred_language: str = None, current_user=Depends(get_current_user), db=Depends(get_db)):
    return await UserService.update_profile(current_user, name, avatar_url, preferred_language, db)