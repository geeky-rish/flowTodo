from fastapi import APIRouter, Depends
from app.database.connection import get_db
from app.services.task_service import TaskService
from app.schemas.task import StatsResponse

router = APIRouter(prefix="/stats", tags=["stats"])


@router.get("", response_model=StatsResponse)
async def get_stats():
    from app.database.connection import get_db
    db = get_db()
    svc = TaskService(db)
    return await svc.get_stats()
