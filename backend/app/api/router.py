from fastapi import APIRouter
from app.api.routers import (auth, admin, 
                             upload_file, challenge,
                             character, user,
                             story, scene, chat, event)

router = APIRouter(prefix="/api/v1")

router.include_router(auth.router)
router.include_router(admin.router)
router.include_router(upload_file.router)
router.include_router(challenge.router)
router.include_router(character.router)
router.include_router(user.router)
router.include_router(story.router)
router.include_router(scene.router)
router.include_router(chat.router)
router.include_router(event.router)