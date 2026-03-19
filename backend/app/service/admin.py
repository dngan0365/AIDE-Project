# ── Admin routes ──────────────────────────────────────────────
from fastapi import APIRouter, Depends
from app.helper.auth import require_admin
from app.db.connect import get_db
from app.schema.auth_schema import UpdateRoleRequest
from fastapi import HTTPException

class AdminService:
    async def list_users(admin=Depends(require_admin), db=Depends(get_db)):
        rows = await db.fetch(
            "SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC"
        )
        return [dict(r) | {"id": str(r["id"])} for r in rows]
    
    async def update_role(user_id: str, body: UpdateRoleRequest, admin=Depends(require_admin), db=Depends(get_db)):
        if body.role not in ("user", "admin"):
            raise HTTPException(status_code=400, detail="role must be 'user' or 'admin'")
        result = await db.execute("UPDATE users SET role=$1 WHERE id=$2", body.role, user_id)
        if result == "UPDATE 0":
            raise HTTPException(status_code=404, detail="User not found")
        return {"message": f"Role updated to {body.role}"}
    
    async def delete_user(user_id: str, admin=Depends(require_admin), db=Depends(get_db)):
        await db.execute("DELETE FROM users WHERE id=$1", user_id)

