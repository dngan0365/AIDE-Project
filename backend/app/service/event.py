from typing import List, Optional, Dict, Any
from fastapi import HTTPException
from datetime import datetime, timezone
from app.schema.event_schema import EventOut, EventCreate, EventUpdate, EventRequest


class EventService:

    @staticmethod
    async def list_events(db, story_id: str | None = None) -> List[EventOut]:
        if story_id:
            rows = await db.fetch(
                "SELECT * FROM events WHERE story_id = $1 ORDER BY started_at DESC", story_id
            )
        else:
            rows = await db.fetch("SELECT * FROM events ORDER BY started_at DESC")
        return [EventOut(**r) for r in rows]

    @staticmethod
    async def get_event(event_id: str, db) -> EventOut:
        row = await db.fetchrow("SELECT * FROM events WHERE id = $1", event_id)
        if not row:
            raise HTTPException(status_code=404, detail="Event not found")
        return EventOut(**(row))
    
    @staticmethod
    async def get_timeline(story_id: str, db) -> List[EventOut]:
        rows = await db.fetch(
            "SELECT * FROM events WHERE story_id = $1 ORDER BY started_at ASC", story_id
        )
        return [EventOut(**r) for r in rows]

    @staticmethod
    async def create_event(body: EventCreate, db) -> EventOut:
        row = await db.fetchrow(
            """
            INSERT INTO events (story_id, title, description, started_at, ended_at)
            VALUES ($1,$2,$3,$4,$5)
            RETURNING *
            """,
            body.story_id, body.title, body.description, body.started_at, body.ended_at
        )
        return EventOut(**(row))

    @staticmethod
    async def update_event(event_id: str, body: EventUpdate, db) -> EventOut:
        existing = await db.fetchrow("SELECT * FROM events WHERE id = $1", event_id)
        if not existing:
            raise HTTPException(status_code=404, detail="Event not found")

        fields = {k: v for k, v in body.dict(exclude_unset=True).items() if v is not None}
        if not fields:
            return EventOut(**existing)

        set_clause = ", ".join(f"{k} = ${i+2}" for i, k in enumerate(fields))
        row = await db.fetchrow(
            f"UPDATE events SET {set_clause} WHERE id = $1 RETURNING *",
            event_id, *fields.values(),
        )
        return EventOut(**row)

    @staticmethod
    async def delete_event(event_id: str, db) -> EventOut:
        existing = await db.fetchrow("SELECT * FROM events WHERE id = $1", event_id)
        if not existing:
            raise HTTPException(status_code=404, detail="Event not found")

        result = await db.execute("DELETE FROM events WHERE id = $1", event_id)
        if result == "DELETE 0":
            raise HTTPException(status_code=404, detail="Event not found")
        return EventOut(**existing)

    @staticmethod
    async def list_active_events(db) -> list[EventOut]:
        now = datetime.now(timezone.utc)
        rows = await db.fetch(
            "SELECT * FROM events WHERE started_at <= $1 AND ended_at >= $1 ORDER BY started_at",
            now,
        )
        return [EventOut(**r) for r in rows]

    @staticmethod
    async def list_year_events(db) -> list[EventOut]:
        now = datetime.now(timezone.utc)
        start_of_year = datetime(now.year, 1, 1, tzinfo=timezone.utc)
        end_of_year = datetime(now.year, 12, 31, tzinfo=timezone.utc)
        rows = await db.fetch(
            "SELECT * FROM events WHERE started_at >= $1 AND ended_at <= $2 ORDER BY started_at",
            start_of_year, end_of_year,
        )
        return [EventOut(**r) for r in rows]
