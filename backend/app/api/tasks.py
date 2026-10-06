from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, Query
from typing import Optional

from app.database.connection import get_db
from app.services.task_service import TaskService
from app.schemas.task import (
    TaskCreate, TaskUpdate, TaskResponse, TaskListResponse, MessageResponse, StatsResponse
)
from app.core.security import get_current_user

router = APIRouter(prefix="/tasks", tags=["tasks"])
CurrentUser = Annotated[dict, Depends(get_current_user)]


def get_task_service() -> TaskService:
    return TaskService(get_db())


@router.get("", response_model=TaskListResponse)
async def list_tasks(
    current_user: CurrentUser,
    status: Optional[str] = Query(None),
    priority: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    tag: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    sort_by: str = Query("created_at"),
    sort_order: int = Query(-1),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    svc: TaskService = Depends(get_task_service),
):
    return await svc.get_tasks(
        user_id=str(current_user["_id"]),
        status=status,
        priority=priority,
        category=category,
        tag=tag,
        search=search,
        sort_by=sort_by,
        sort_order=sort_order,
        skip=skip,
        limit=limit,
    )


@router.post("", response_model=TaskResponse, status_code=201)
async def create_task(data: TaskCreate, current_user: CurrentUser, svc: TaskService = Depends(get_task_service)):
    return await svc.create_task(str(current_user["_id"]), data)


@router.get("/date/{date_str}")
async def get_tasks_by_date(date_str: str, current_user: CurrentUser, svc: TaskService = Depends(get_task_service)):
    tasks = await svc.get_tasks_by_date(str(current_user["_id"]), date_str)
    return {"tasks": tasks, "total": len(tasks)}


@router.get("/{task_id}", response_model=TaskResponse)
async def get_task(task_id: str, current_user: CurrentUser, svc: TaskService = Depends(get_task_service)):
    task = await svc.get_task(str(current_user["_id"]), task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task


@router.put("/{task_id}", response_model=TaskResponse)
async def update_task(task_id: str, data: TaskUpdate, current_user: CurrentUser, svc: TaskService = Depends(get_task_service)):
    task = await svc.update_task(str(current_user["_id"]), task_id, data)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task


@router.delete("/{task_id}", response_model=MessageResponse)
async def delete_task(task_id: str, current_user: CurrentUser, svc: TaskService = Depends(get_task_service)):
    deleted = await svc.delete_task(str(current_user["_id"]), task_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Task not found")
    return {"message": "Task deleted successfully", "success": True}


@router.patch("/{task_id}/complete", response_model=TaskResponse)
async def toggle_complete(task_id: str, current_user: CurrentUser, svc: TaskService = Depends(get_task_service)):
    task = await svc.complete_task(str(current_user["_id"]), task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task
