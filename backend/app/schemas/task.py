from typing import Optional, List, Any
from datetime import datetime
from pydantic import BaseModel, Field, field_validator, model_validator
from app.models.enums import Priority, TaskStatus, PyObjectId


# ── Task Schemas ──────────────────────────────────────────────────────────────

class TaskCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=500)
    description: Optional[str] = Field(None, max_length=5000)
    due_date: Optional[str] = None          # ISO date string: YYYY-MM-DD
    due_time: Optional[str] = None          # HH:MM
    priority: Priority = Priority.MEDIUM
    status: TaskStatus = TaskStatus.TODO
    category: Optional[str] = Field(None, max_length=100)
    tags: List[str] = Field(default_factory=list)
    reminder_date: Optional[str] = None     # YYYY-MM-DD
    reminder_time: Optional[str] = None     # HH:MM


class TaskUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=500)
    description: Optional[str] = None
    due_date: Optional[str] = None
    due_time: Optional[str] = None
    priority: Optional[Priority] = None
    status: Optional[TaskStatus] = None
    category: Optional[str] = None
    tags: Optional[List[str]] = None
    reminder_date: Optional[str] = None
    reminder_time: Optional[str] = None


class TaskResponse(BaseModel):
    id: str = Field(alias="_id")
    title: str
    description: Optional[str] = None
    due_date: Optional[str] = None
    due_time: Optional[str] = None
    priority: Priority
    status: TaskStatus
    category: Optional[str] = None
    tags: List[str] = []
    reminder_date: Optional[str] = None
    reminder_time: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    completed_at: Optional[datetime] = None

    model_config = {"populate_by_name": True}


class TaskListResponse(BaseModel):
    tasks: List[TaskResponse]
    total: int


# ── Category Schemas ───────────────────────────────────────────────────────────

class CategoryCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    color: str = Field(default="#6366f1")      # hex color
    icon: Optional[str] = None


class CategoryUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    color: Optional[str] = None
    icon: Optional[str] = None


class CategoryResponse(BaseModel):
    id: str = Field(alias="_id")
    name: str
    color: str
    icon: Optional[str] = None
    task_count: int = 0
    created_at: datetime

    model_config = {"populate_by_name": True}


# ── Stats Schemas ──────────────────────────────────────────────────────────────

class DailyStats(BaseModel):
    date: str
    completed: int
    created: int


class StatsResponse(BaseModel):
    total_tasks: int
    completed_today: int
    due_today: int
    overdue: int
    completed_this_week: int
    completed_this_month: int
    completion_rate: float
    high_priority_completion_rate: float
    daily_stats: List[DailyStats]
    streak: int


# ── Generic Response ──────────────────────────────────────────────────────────

class MessageResponse(BaseModel):
    message: str
    success: bool = True
