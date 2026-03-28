from app.helper.auth import get_current_user
from fastapi import APIRouter, Depends, HTTPException
from app.db.connect import get_db
from app.service.choice import ChoiceService
from app.schema.choice_schema import ChoiceCreate, ChoiceOut

router = APIRouter(prefix="/choices", tags=["Choices"])

@router.get("/scenes/{scene_id}", response_model=list[ChoiceOut])
async def list_scene_choices(scene_id: str, db=Depends(get_db)):
    return await ChoiceService.list_choices_for_scene(scene_id, db)
@router.get("/{choice_id}", response_model=ChoiceOut)
async def get_choice(choice_id: str, db=Depends(get_db)):
    return await ChoiceService.get_choice(choice_id, db)
@router.post("/", response_model=ChoiceOut)
async def create_choice(body: ChoiceCreate, db=Depends(get_db), current_user=Depends(get_current_user)):
    return await ChoiceService.create_choice(body, db)
@router.put("/{choice_id}", response_model=ChoiceOut)
async def update_choice(choice_id: str, body: ChoiceCreate, db=Depends(get_db), current_user=Depends(get_current_user)):
    return await ChoiceService.update_choice(choice_id, body, db)
@router.delete("/{choice_id}")
async def delete_choice(choice_id: str, db=Depends(get_db), current_user=Depends(get_current_user)):
    return await ChoiceService.delete_choice(choice_id, db)
@router.post("/log/{choice_id}")
async def log_choice(choice_id: str, story_id: str, db=Depends(get_db), current_user=Depends(get_current_user)):
    return await ChoiceService.log_choice(current_user["id"], choice_id, story_id, db)