from typing import Annotated
from fastapi import APIRouter, Depends
from app.database.connection import get_db
from app.services.task_service import TaskService
from app.schemas.task import StatsResponse
from app.core.security import get_current_user

router = APIRouter(prefix="/stats", tags=["stats"])
CurrentUser = Annotated[dict, Depends(get_current_user)]


@router.get("", response_model=StatsResponse)
async def get_stats(current_user: CurrentUser):
    from app.database.connection import get_db
    db = get_db()
    svc = TaskService(db)
    return await svc.get_stats(str(current_user["_id"]))
