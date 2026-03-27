from app.service.user import UserService
from app.helper.auth import get_current_user
from fastapi import APIRouter, Depends
from app.db.connect import get_db

router = APIRouter(prefix="/users", tags=["Users"])

@router.get("/me")
async def read_user_me(current_user=Depends(get_current_user), db=Depends(get_db)):
    return await UserService(db).get_user(current_user["id"])

@router.put("/me")
async def update_profile(
    name: str = None,
    avatar_url: str = None,
    preferred_language: str = None,
    current_user=Depends(get_current_user),
    db=Depends(get_db),
):
    return await UserService(db).update_profile(current_user["id"], name, avatar_url, preferred_language)

@router.get("/progress")
async def get_user_progress(current_user=Depends(get_current_user), db=Depends(get_db)):
    return await UserService(db).get_user_progress(current_user["id"])

@router.get("/challenge")
async def get_user_challenge_progress(current_user=Depends(get_current_user), db=Depends(get_db)):
    return await UserService(db).get_user_challenges(current_user["id"])