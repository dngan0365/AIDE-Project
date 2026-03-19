from fastapi import APIRouter
from app.api.routers import auth, admin, upload_file

router = APIRouter(prefix="/api/v1")

router.include_router(auth.router)
router.include_router(admin.router)
router.include_router(upload_file.router)