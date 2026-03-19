# ── DB pool ───────────────────────────────────────────────────
from typing import Optional
from app.config import settings
import asyncpg

_pool: Optional[asyncpg.Pool] = None
 
async def get_pool() -> asyncpg.Pool:
    global _pool
    if _pool is None:
        _pool = await asyncpg.create_pool(settings.DATABASE_URL, min_size=2, max_size=10)
    return _pool
 
async def get_db():
    pool = await get_pool()
    async with pool.acquire() as conn:
        yield conn