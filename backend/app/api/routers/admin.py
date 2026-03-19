from fastapi import APIRouter, Depends
from app.helper.auth import require_admin
from app.db.connect import get_db
from app.schema.auth_schema import UpdateRoleRequest
from fastapi import HTTPException
from app.service.admin import AdminService

router = APIRouter(prefix="/admin", tags=["Admin"])
# ── Admin routes ──────────────────────────────────────────────
@router.get("/users")
async def list_users(admin=Depends(require_admin), db=Depends(get_db)):
    return await AdminService.list_users(admin, db)
 
@router.patch("/users/{user_id}/role")
async def update_role(user_id: str, body: UpdateRoleRequest, admin=Depends(require_admin), db=Depends(get_db)):
    return await AdminService.update_role(user_id, body, admin, db)

@router.delete("/users/{user_id}", status_code=204)
async def delete_user(user_id: str, admin=Depends(require_admin), db=Depends(get_db)):
    await AdminService.delete_user(user_id, admin, db)