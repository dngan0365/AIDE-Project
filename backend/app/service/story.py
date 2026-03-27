from fastapi import HTTPException
from app.schema.story_schema import (StoryOut, StoryCreate, StoryUpdate)
from typing import List, Optional


class StoryService:

    @staticmethod
    async def list_stories(
        db,
        country: Optional[str] = None,
        culture_type: Optional[str] = None,
        title: Optional[str] = None,
        limit: int = 20,
        offset: int = 0,
        recent: bool = False  
    ) -> List[StoryOut]:
        query = "SELECT * FROM stories WHERE is_published = true"
        params = []
        if country:
            params.append(country)
            query += f" AND country = ${len(params)}::country_enum"
        if culture_type:
            params.append(culture_type)
            query += f" AND culture_type = ${len(params)}::culture_type_enum"
        if title:
            params.append(f"%{title}%")
            query += f" AND title ILIKE ${len(params)}"
        query += " ORDER BY created_at DESC"
        if recent:
            params.append(20) 
            query += f" LIMIT ${len(params)}"
        else:
            params.append(limit)
            query += f" LIMIT ${len(params)}"

            params.append(offset)
            query += f" OFFSET ${len(params)}"
        rows = await db.fetch(query, *params)
        return [StoryOut(**r) for r in rows]

    @staticmethod
    async def get_story(story_id: str, db) -> StoryOut:
        row = await db.fetchrow("SELECT * FROM stories WHERE id = $1", story_id)
        if not row:
            raise HTTPException(status_code=404, detail="Story not found")
        return StoryOut(**row)

    @staticmethod
    async def create_story(body: StoryCreate, db) -> StoryOut:
        row = await db.fetchrow(
            """
            INSERT INTO stories (title, culture_topic, description, cover_image_url,
                difficulty, estimated_time, is_published, estimated_minutes, country, culture_type)
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9::country_enum,$10::culture_type_enum)
            RETURNING *
            """,
            body.title, body.culture_topic, body.description,
            body.cover_image_url, body.difficulty, body.estimated_time,
            body.is_published, body.estimated_minutes,
            body.country, body.culture_type,
        )
        return StoryOut(**row)

    @staticmethod
    async def update_story(story_id: str, body: StoryUpdate, db) -> StoryOut:
        existing = await db.fetchrow("SELECT * FROM stories WHERE id = $1", story_id)
        if not existing:
            raise HTTPException(status_code=404, detail="Story not found")

        fields = {k: v for k, v in body.dict(exclude_unset=True).items() if v is not None}
        if not fields:
            return StoryOut(**existing)

        set_clause = ", ".join(f"{k} = ${i+2}" for i, k in enumerate(fields))
        values = list(fields.values())
        row = await db.fetchrow(
            f"UPDATE stories SET {set_clause} WHERE id = $1 RETURNING *",
            story_id, *values,
        )
        return StoryOut(**row)

    @staticmethod
    async def delete_story(story_id: str, db) -> StoryOut:
        existing = await db.fetchrow("SELECT * FROM stories WHERE id = $1", story_id)
        if not existing:
            raise HTTPException(status_code=404, detail="Story not found")
        return StoryOut(**existing)

    @staticmethod
    async def publish_story(story_id: str, db) -> dict:
        result = await db.execute(
            "UPDATE stories SET is_published = true WHERE id = $1", story_id
        )
        if result == "UPDATE 0":
            raise HTTPException(status_code=404, detail="Story not found")
        return {"message": "Story published"}