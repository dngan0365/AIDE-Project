from app.service.user import UserService
from app.helper.auth import get_current_user
from app.schema.character_schema import CharacterCreate, CharacterOut
from app.service.character import CharacterService
from fastapi import APIRouter, Depends, HTTPException
from app.db.connect import get_db

router = APIRouter(prefix="/characters", tags=["Characters"])

@router.get("/", response_model=list[CharacterOut])
async def list_characters(name: str = None, culture_topic: str = None, limit: int = 20, offset: int = 0, recent: bool = False, db=Depends(get_db)):
    return await CharacterService.list_characters(db, name, culture_topic, limit, offset, recent)

@router.get("/{character_id}", response_model=CharacterOut)
async def get_character(character_id: str, db=Depends(get_db)):
    return await CharacterService.get_character(character_id, db)

@router.post("/", response_model=CharacterOut)
async def create_character(body: CharacterCreate, db=Depends(get_db)):
    return await CharacterService.create_character(body, db)

@router.put("/{character_id}", response_model=CharacterOut)
async def update_character(character_id: str, body: CharacterCreate, db=Depends(get_db)):
    return await CharacterService.update_character(character_id, body, db)

@router.delete("/{character_id}")
async def delete_character(character_id: str, db=Depends(get_db)):
    return await CharacterService.delete_character(character_id, db)

@router.get("/recent", response_model=list[CharacterOut])
async def list_recent_characters(db=Depends(get_db)):
    return await CharacterService.list_characters(db, recent=True)

@router.get("/story/{story_id}", response_model=list[CharacterOut])
async def list_characters_for_story(story_id: str, db=Depends(get_db)):
    return await CharacterService.list_characters_for_story(story_id, db)

@router.post("/story/{story_id}/assign/{character_id}")
async def assign_character_to_story(story_id: str, character_id: str, db=Depends(get_db)):
    return await CharacterService.assign_character_to_story(story_id, character_id, db)

@router.post("/story/{story_id}/unassign/{character_id}")
async def unassign_character_from_story(story_id: str, character_id: str, db=Depends(get_db)):
    return await CharacterService.unassign_character_from_story(story_id, character_id, db)