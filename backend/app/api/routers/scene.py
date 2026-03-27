from app.helper.auth import get_current_user
from app.schema.scene_schema import SceneChallengeUserOut, SceneCreate, SceneOut
from app.schema.choice_schema import ChoiceOut
from app.service.scene import SceneService
from fastapi import APIRouter, Depends
from app.db.connect import get_db

router = APIRouter(prefix="/scenes", tags=["Scenes"])


@router.get("/", response_model=list[SceneOut])
async def list_scenes(story_id: str, db=Depends(get_db)):
    return await SceneService.list_scenes(story_id, db)


# ── Static-prefix routes first ──────────────────────────────────────────────

@router.get("/challenge-users/{scene_id}", response_model=list[SceneChallengeUserOut])
async def get_scene_challenge_users(scene_id: str, db=Depends(get_db)):
    return await SceneService.get_scene_challenge_users(scene_id, db)


@router.get("/challenge-users/{scene_id}/{user_id}", response_model=SceneChallengeUserOut)
async def get_scene_challenge_user(scene_id: str, user_id: str, db=Depends(get_db)):
    return await SceneService.get_scene_challenge_user(scene_id, user_id, db)


@router.get("/choices/{scene_id}", response_model=list[ChoiceOut])
async def get_scene_choices(scene_id: str, db=Depends(get_db)):
    return await SceneService.get_scene_choices(scene_id, db)


@router.get("/choices/{scene_id}/{user_id}", response_model=list[ChoiceOut])
async def get_scene_user_choices(scene_id: str, user_id: str, db=Depends(get_db)):
    return await SceneService.get_scene_user_choices(scene_id, user_id, db)


# ── Dynamic /{scene_id} routes last ─────────────────────────────────────────

@router.get("/{scene_id}", response_model=SceneOut)
async def get_scene(scene_id: str, db=Depends(get_db)):
    return await SceneService.get_scene(scene_id, db)


@router.post("/", response_model=SceneOut)
async def create_scene(body: SceneCreate, db=Depends(get_db), current_user=Depends(get_current_user)):
    return await SceneService.create_scene(body, db)


@router.put("/{scene_id}", response_model=SceneOut)
async def update_scene(
    scene_id: str,
    body: SceneCreate,
    db=Depends(get_db),
    current_user=Depends(get_current_user),
):
    return await SceneService.update_scene(scene_id, body, db)


@router.delete("/{scene_id}")
async def delete_scene(scene_id: str, db=Depends(get_db), current_user=Depends(get_current_user)):
    return await SceneService.delete_scene(scene_id, db)