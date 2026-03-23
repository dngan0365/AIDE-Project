from functools import lru_cache
import logging
import sys
from typing import Optional
import asyncpg
from app.config import Settings
from app.db.connect import get_pool
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.router import router
# ── Logging ───────────────────────────────────────────────────────────────────

logging.basicConfig(
    stream=sys.stdout,
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
)
logger = logging.getLogger(__name__)

# Function to get settings, using lru_cache to avoid reloading for every request
@lru_cache()
def get_settings():
    return Settings()

# ── Lifespan (startup / shutdown) ─────────────────────────────────────────────

# @asynccontextmanager
# async def lifespan(app: FastAPI):
#     logger.info("Connecting to Redis at %s ...", settings.REDIS_URL)

#     redis_client = aioredis.from_url(
#         settings.REDIS_URL,
#         encoding="utf-8",
#         decode_responses=True,
#     )

#     # Verify connection
#     await redis_client.ping()
#     logger.info("Redis connection established.")

#     app.state.redis = redis_client
#     yield

#     logger.info("Shutting down — closing Redis connection.")
#     await redis_client.aclose()


# ── Application factory ───────────────────────────────────────────────────────

def create_app() -> FastAPI:
    app = FastAPI(
        title="ASEAN Culture App API", 
        description=(
            "An API for the ASEAN Culture App, providing endpoints for user management, content browsing, and cultural information."
        ),
        version="1.0.0", 
        docs_url="/docs",
        # redoc_url="/redoc",
        # lifespan=lifespan
        )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],  # tighten this in production
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    
    app.include_router(router)


    @app.get("/api/v1/health", tags=["health"])
    async def health_check():
        return {"status": "ok", "service": "asean-culture-app"}

    return app

app = create_app()
_pool: Optional[asyncpg.Pool] = None

@app.on_event("startup")
async def startup():
    global _pool
    _pool = await get_pool()

@app.on_event("shutdown")
async def shutdown():
    if _pool:
        await _pool.close()

