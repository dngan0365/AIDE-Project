from app.helper.auth import get_current_user
from app.schema.chat_schema import ChatRequest, RegenerateRequest
from fastapi import APIRouter, Depends, HTTPException
from app.db.connect import get_db
from app.service.chat import AIChatService

router = APIRouter(prefix="/chat", tags=["Chat"])

@router.post("/message")
async def send_message(
    body: ChatRequest,
    db=Depends(get_db),
    current_user=Depends(get_current_user),
):
    return await AIChatService.chat(
        scene_id=body.scene_id,
        user_id=current_user["id"],
        character_id=body.character_id,
        user_message=body.message,
        db=db,
    )


# ================= GET HISTORY =================
@router.get("/history")
async def get_chat_history(
    scene_id: str,
    db=Depends(get_db),
    current_user=Depends(get_current_user),
):
    return await AIChatService.get_history(
        scene_id=scene_id,
        user_id=current_user["id"],
        db=db,
    )


# ================= CLEAR HISTORY =================
@router.delete("/history")
async def clear_chat_history(
    scene_id: str,
    db=Depends(get_db),
    current_user=Depends(get_current_user),
):
    return await AIChatService.clear_history(
        scene_id=scene_id,
        user_id=current_user["id"],
        db=db,
    )


# ================= REGENERATE =================
@router.post("/regenerate")
async def regenerate_last_message(
    body: RegenerateRequest,
    db=Depends(get_db),
    current_user=Depends(get_current_user),
):
    return await AIChatService.regenerate_last(
        scene_id=body.scene_id,
        user_id=current_user["id"],
        character_id=body.character_id,
        db=db,
    )