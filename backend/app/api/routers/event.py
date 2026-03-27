from app.helper.auth import get_current_user
from app.schema.event_schema import EventCreate, EventOut
from fastapi import APIRouter, Depends, HTTPException
from app.db.connect import get_db

router = APIRouter(prefix="/events", tags=["Events"])

@router.get("/", response_model=list[EventOut])
async def list_events(story_id: str | None = None, db=Depends(get_db)):
    from app.service.event import EventService
    return await EventService.list_events(db, story_id)

@router.get("/year", response_model=list[EventOut])
async def list_year_events(db=Depends(get_db)):
    from app.service.event import EventService
    return await EventService.list_year_events(db)

@router.get("/{event_id}", response_model=EventOut)
async def get_event(event_id: str, db=Depends(get_db)):
    from app.service.event import EventService
    return await EventService.get_event(event_id, db)

@router.post("/", response_model=EventOut)
async def create_event(body: EventCreate, db=Depends(get_db), current_user=Depends(get_current_user)):
    from app.service.event import EventService
    return await EventService.create_event(body, db)

@router.put("/{event_id}", response_model=EventOut)
async def update_event(event_id: str, body: EventCreate, db=Depends(get_db), current_user=Depends(get_current_user)):
    from app.service.event import EventService
    return await EventService.update_event(event_id, body, db)

@router.delete("/{event_id}")
async def delete_event(event_id: str, db=Depends(get_db), current_user=Depends(get_current_user)):
    from app.service.event import EventService
    return await EventService.delete_event(event_id, db)

@router.get("/timeline/{story_id}", response_model=list[EventOut])
async def get_timeline(story_id: str, db=Depends(get_db)):
    from app.service.event import EventService
    return await EventService.get_timeline(story_id, db)