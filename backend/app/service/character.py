from typing import List, Optional, Dict, Any
from typing import Optional

from fastapi import HTTPException
from app.schema.character_schema import CharacterOut, CharacterCreate, CharacterUpdate

class CharacterService:

    @staticmethod
    async def list_characters(
        db,
        name: Optional[str] = None,
        culture_topic: Optional[str] = None,
        limit: int = 20,
        offset: int = 0,
        recent: bool = False
    ) -> List[CharacterOut]:
        query = "SELECT * FROM characters WHERE 1=1"
        params = []
        if name:
            params.append(f"%{name}%")
            query += f" AND name ILIKE ${len(params)}"
        if culture_topic:
            params.append(culture_topic)
            query += f" AND culture_topic = ${len(params)}"
        query += " ORDER BY created_at DESC"
        if recent:
            params.append(10)
            query += f" LIMIT ${len(params)}"
        else:
            params.append(limit)
            query += f" LIMIT ${len(params)}"

            params.append(offset)
            query += f" OFFSET ${len(params)}"
        rows = await db.fetch(query, *params)
        return [CharacterOut(**r) for r in rows]

    @staticmethod
    async def get_character(character_id: str, db) -> CharacterOut:
        row = await db.fetchrow("SELECT * FROM characters WHERE id = $1", character_id)
        if not row:
            raise HTTPException(status_code=404, detail="Character not found")
        return CharacterOut(**row)

    @staticmethod
    async def create_character(body: CharacterCreate, db) -> CharacterOut:
        row = await db.fetchrow(
            """
            INSERT INTO characters
                (name, role, culture_topic, description, personality, prompt_template, avatar_image_url)
            VALUES ($1,$2,$3,$4,$5,$6,$7)
            RETURNING *
            """,
            body.name, body.role, body.culture_topic,
            body.description, body.personality,
            body.prompt_template, body.avatar_image_url,
        )
        return CharacterOut(**row)

    @staticmethod
    async def update_character(character_id: str, body: CharacterUpdate, db) -> CharacterOut:
        existing = await db.fetchrow("SELECT * FROM characters WHERE id = $1", character_id)
        if not existing:
            raise HTTPException(status_code=404, detail="Character not found")

        fields = {k: v for k, v in body.dict(exclude_unset=True).items() if v is not None}
        if not fields:
            return CharacterOut(**existing)

        set_clause = ", ".join(f"{k} = ${i+2}" for i, k in enumerate(fields))
        row = await db.fetchrow(
            f"UPDATE characters SET {set_clause} WHERE id = $1 RETURNING *",
            character_id, *fields.values(),
        )
        return CharacterOut(**row)

    @staticmethod
    async def delete_character(character_id: str, db) -> dict:
        result = await db.execute("DELETE FROM characters WHERE id = $1", character_id)
        if result == "DELETE 0":
            raise HTTPException(status_code=404, detail="Character not found")
        return {"message": "Character deleted"}

    @staticmethod
    async def list_characters_for_story(story_id: str, db) -> list[CharacterOut]:
        rows = await db.fetch(
            """
            SELECT c.* FROM characters c
            JOIN story_characters sc ON sc.character_id = c.id
            WHERE sc.story_id = $1
            """,
            story_id,
        )
        return [CharacterOut(**r) for r in rows]

    @staticmethod
    async def assign_character_to_story(story_id: str, character_id: str, db) -> dict:
        try:
            await db.execute(
                "INSERT INTO story_characters (story_id, character_id) VALUES ($1,$2)",
                story_id, character_id,
            )
        except Exception:
            raise HTTPException(status_code=409, detail="Character already assigned to story")
        return {"message": "Character assigned to story"}

    @staticmethod
    async def remove_character_from_story(story_id: str, character_id: str, db) -> dict:
        result = await db.execute(
            "DELETE FROM story_characters WHERE story_id=$1 AND character_id=$2",
            story_id, character_id,
        )
        if result == "DELETE 0":
            raise HTTPException(status_code=404, detail="Assignment not found")
        return {"message": "Character removed from story"}
