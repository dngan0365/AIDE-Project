from app.service.user import UserService
from app.helper.auth import get_current_user
from app.schema.challenge_schema import ChallengeCreate, ChallengeOut
from app.service.challenge import ChallengeService
from fastapi import APIRouter, Depends, HTTPException
from app.db.connect import get_db

router = APIRouter(prefix="/challenges", tags=["Challenges"])

@router.get("/scene/{scene_id}", response_model=list[ChallengeOut])
async def list_challenges_for_scene(scene_id: str, db=Depends(get_db)):
    return await ChallengeService.list_challenges_for_scene(scene_id, db)

@router.get("/{challenge_id}", response_model=ChallengeOut)
async def get_challenge(challenge_id: str, db=Depends(get_db)):
    return await ChallengeService.get_challenge(challenge_id, db)

@router.post("/", response_model=ChallengeOut)
async def create_challenge(body: ChallengeCreate, db=Depends(get_db)):
    return await ChallengeService.create_challenge(body, db)

@router.put("/{challenge_id}", response_model=ChallengeOut)
async def update_challenge(challenge_id: str, body: ChallengeCreate, db=Depends(get_db)):
    return await ChallengeService.update_challenge(challenge_id, body, db)

@router.delete("/{challenge_id}")
async def delete_challenge(challenge_id: str, db=Depends(get_db)):
    return await ChallengeService.delete_challenge(challenge_id, db)

@router.post("/{challenge_id}/attempt")
async def submit_challenge_attempt(challenge_id: str, story_id: str, answer_given: str, current_user=Depends(get_current_user), db=Depends(get_db)):
    return await ChallengeService.submit_attempt(current_user["id"], challenge_id, story_id, answer_given, db)    

@router.get("/{challenge_id}/attempts")
async def get_user_attempts(challenge_id: str, story_id: str, current_user=Depends(get_current_user), db=Depends(get_db)):
    return await ChallengeService.get_user_attempts(current_user["id"], challenge_id, db)
