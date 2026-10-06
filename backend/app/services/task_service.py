from typing import Optional
from datetime import datetime, date, timezone
from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.schemas.task import TaskCreate, TaskUpdate, TaskResponse, TaskListResponse
from app.models.enums import TaskStatus


def _serialize_task(doc: dict) -> dict:
    """Convert MongoDB document to TaskResponse-compatible dict."""
    doc["_id"] = str(doc["_id"])
    return doc


class TaskService:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.collection = db["tasks"]

    async def create_task(self, user_id: str, data: TaskCreate) -> dict:
        now = datetime.now(timezone.utc)
        doc = {
            **data.model_dump(),
            "user_id": user_id,
            "created_at": now,
            "updated_at": now,
            "completed_at": None,
        }
        result = await self.collection.insert_one(doc)
        created = await self.collection.find_one({"_id": result.inserted_id})
        return _serialize_task(created)

    async def get_tasks(
        self,
        user_id: str,
        status: Optional[str] = None,
        priority: Optional[str] = None,
        category: Optional[str] = None,
        tag: Optional[str] = None,
        search: Optional[str] = None,
        sort_by: str = "created_at",
        sort_order: int = -1,
        skip: int = 0,
        limit: int = 100,
    ) -> dict:
        query: dict = {"user_id": user_id}
        if status:
            query["status"] = status
        if priority:
            query["priority"] = priority
        if category:
            query["category"] = {"$regex": category, "$options": "i"}
        if tag:
            query["tags"] = {"$in": [tag]}
        if search:
            query["$or"] = [
                {"title": {"$regex": search, "$options": "i"}},
                {"description": {"$regex": search, "$options": "i"}},
                {"tags": {"$in": [search]}},
                {"category": {"$regex": search, "$options": "i"}},
            ]

        total = await self.collection.count_documents(query)
        cursor = (
            self.collection.find(query)
            .sort(sort_by, sort_order)
            .skip(skip)
            .limit(limit)
        )
        tasks = [_serialize_task(doc) async for doc in cursor]
        return {"tasks": tasks, "total": total}

    async def get_task(self, user_id: str, task_id: str) -> Optional[dict]:
        if not ObjectId.is_valid(task_id):
            return None
        doc = await self.collection.find_one({"_id": ObjectId(task_id), "user_id": user_id})
        return _serialize_task(doc) if doc else None

    async def update_task(self, user_id: str, task_id: str, data: TaskUpdate) -> Optional[dict]:
        if not ObjectId.is_valid(task_id):
            return None
        update_data = {k: v for k, v in data.model_dump().items() if v is not None}
        if not update_data:
            return await self.get_task(user_id, task_id)
        update_data["updated_at"] = datetime.now(timezone.utc)
        result = await self.collection.find_one_and_update(
            {"_id": ObjectId(task_id), "user_id": user_id},
            {"$set": update_data},
            return_document=True,
        )
        return _serialize_task(result) if result else None

    async def delete_task(self, user_id: str, task_id: str) -> bool:
        if not ObjectId.is_valid(task_id):
            return False
        result = await self.collection.delete_one({"_id": ObjectId(task_id), "user_id": user_id})
        return result.deleted_count > 0

    async def complete_task(self, user_id: str, task_id: str) -> Optional[dict]:
        if not ObjectId.is_valid(task_id):
            return None
        doc = await self.collection.find_one({"_id": ObjectId(task_id), "user_id": user_id})
        if not doc:
            return None
        now = datetime.now(timezone.utc)
        if doc.get("status") == TaskStatus.COMPLETED:
            # Toggle back to todo
            update = {"status": TaskStatus.TODO, "completed_at": None, "updated_at": now}
        else:
            update = {"status": TaskStatus.COMPLETED, "completed_at": now, "updated_at": now}
        result = await self.collection.find_one_and_update(
            {"_id": ObjectId(task_id), "user_id": user_id},
            {"$set": update},
            return_document=True,
        )
        return _serialize_task(result) if result else None

    async def get_tasks_by_date(self, user_id: str, date_str: str) -> list:
        cursor = self.collection.find({"user_id": user_id, "due_date": date_str}).sort("due_time", 1)
        return [_serialize_task(doc) async for doc in cursor]

    async def get_stats(self, user_id: str) -> dict:
        from datetime import timedelta
        today = date.today().isoformat()
        now = datetime.now(timezone.utc)
        week_start = (date.today() - timedelta(days=date.today().weekday())).isoformat()
        month_start = date.today().replace(day=1).isoformat()

        owner = {"user_id": user_id}
        total = await self.collection.count_documents(owner)
        due_today = await self.collection.count_documents({**owner, "due_date": today, "status": {"$ne": "completed"}})
        completed_today = await self.collection.count_documents({
            "user_id": user_id, "status": "completed",
            "completed_at": {"$gte": now.replace(hour=0, minute=0, second=0, microsecond=0)}
        })
        overdue = await self.collection.count_documents({
            "user_id": user_id, "due_date": {"$lt": today},
            "status": {"$ne": "completed"},
        })
        completed_week = await self.collection.count_documents({
            "user_id": user_id, "status": "completed",
            "due_date": {"$gte": week_start},
        })
        completed_month = await self.collection.count_documents({
            "user_id": user_id, "status": "completed",
            "due_date": {"$gte": month_start},
        })

        total_completed = await self.collection.count_documents({**owner, "status": "completed"})
        completion_rate = round((total_completed / total * 100) if total > 0 else 0, 1)

        hp_total = await self.collection.count_documents({**owner, "priority": "high"})
        hp_completed = await self.collection.count_documents({**owner, "priority": "high", "status": "completed"})
        hp_rate = round((hp_completed / hp_total * 100) if hp_total > 0 else 0, 1)

        # Daily stats for the last 14 days
        daily_stats = []
        for i in range(13, -1, -1):
            d = (date.today() - timedelta(days=i)).isoformat()
            completed = await self.collection.count_documents({**owner, "status": "completed", "due_date": d})
            created = await self.collection.count_documents({**owner, "due_date": d})
            daily_stats.append({"date": d, "completed": completed, "created": created})

        # Calculate streak
        streak = 0
        for i in range(0, 30):
            d = (date.today() - timedelta(days=i)).isoformat()
            count = await self.collection.count_documents({**owner, "status": "completed", "due_date": d})
            if count > 0:
                streak += 1
            else:
                break

        return {
            "total_tasks": total,
            "completed_today": completed_today,
            "due_today": due_today,
            "overdue": overdue,
            "completed_this_week": completed_week,
            "completed_this_month": completed_month,
            "completion_rate": completion_rate,
            "high_priority_completion_rate": hp_rate,
            "daily_stats": daily_stats,
            "streak": streak,
        }
