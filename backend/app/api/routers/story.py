from app.helper.auth import get_current_user
from fastapi import APIRouter, Depends, HTTPException
from app.db.connect import get_db
from app.schema.story_schema import StoryCreate, StoryOut, StoryUpdate
from app.service.story import StoryService

router = APIRouter(prefix="/stories", tags=["Stories"])

@router.get("/", response_model=list[StoryOut])
async def list_stories(country: str = None, culture_type: str = None, title: str = None, limit: int = 20, offset: int = 0, recent: bool = False, db=Depends(get_db)):
    return await StoryService.list_stories(db, country, culture_type, title, limit, offset, recent)

@router.get("/{story_id}", response_model=StoryOut)
async def get_story(story_id: str, db=Depends(get_db)):
    return await StoryService.get_story(story_id, db)

@router.post("/", response_model=StoryOut)
async def create_story(body: StoryCreate, db=Depends(get_db)):
    return await StoryService.create_story(body, db)

@router.put("/{story_id}", response_model=StoryOut)
async def update_story(story_id: str, body: StoryUpdate, db=Depends(get_db)):
    return await StoryService.update_story(story_id, body, db)

@router.delete("/{story_id}")
async def delete_story(story_id: str, db=Depends(get_db)):
    return await StoryService.delete_story(story_id, db)

@router.put("/{story_id}/publish", response_model=StoryOut)
async def publish_story(story_id: str, db=Depends(get_db)):
    return await StoryService.publish_story(story_id, db)