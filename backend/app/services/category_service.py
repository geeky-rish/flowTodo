from typing import Optional, List
from datetime import datetime, timezone
from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.schemas.task import CategoryCreate, CategoryUpdate


DEFAULT_CATEGORIES = [
    {"name": "Personal", "color": "#10b981", "icon": "user"},
    {"name": "Work", "color": "#6366f1", "icon": "briefcase"},
    {"name": "Study", "color": "#f59e0b", "icon": "book"},
    {"name": "Projects", "color": "#ec4899", "icon": "folder"},
    {"name": "Health", "color": "#ef4444", "icon": "heart"},
]


def _serialize(doc: dict) -> dict:
    doc["_id"] = str(doc["_id"])
    return doc


class CategoryService:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.collection = db["categories"]
        self.tasks = db["tasks"]

    async def seed_defaults(self, user_id: str):
        """Insert default categories if none exist."""
        count = await self.collection.count_documents({"user_id": user_id})
        if count == 0:
            now = datetime.now(timezone.utc)
            docs = [{**c, "user_id": user_id, "created_at": now} for c in DEFAULT_CATEGORIES]
            await self.collection.insert_many(docs)

    async def get_categories(self, user_id: str) -> list:
        cursor = self.collection.find({"user_id": user_id}).sort("name", 1)
        results = []
        async for doc in cursor:
            cat = _serialize(doc)
            task_count = await self.tasks.count_documents(
                {"user_id": user_id, "category": {"$regex": f"^{cat['name']}$", "$options": "i"}}
            )
            cat["task_count"] = task_count
            results.append(cat)
        return results

    async def create_category(self, user_id: str, data: CategoryCreate) -> dict:
        now = datetime.now(timezone.utc)
        doc = {**data.model_dump(), "user_id": user_id, "created_at": now}
        result = await self.collection.insert_one(doc)
        created = await self.collection.find_one({"_id": result.inserted_id})
        cat = _serialize(created)
        cat["task_count"] = 0
        return cat

    async def update_category(self, user_id: str, cat_id: str, data: CategoryUpdate) -> Optional[dict]:
        if not ObjectId.is_valid(cat_id):
            return None
        update_data = {k: v for k, v in data.model_dump().items() if v is not None}
        result = await self.collection.find_one_and_update(
            {"_id": ObjectId(cat_id), "user_id": user_id},
            {"$set": update_data},
            return_document=True,
        )
        return _serialize(result) if result else None

    async def delete_category(self, user_id: str, cat_id: str) -> bool:
        if not ObjectId.is_valid(cat_id):
            return False
        result = await self.collection.delete_one({"_id": ObjectId(cat_id), "user_id": user_id})
        return result.deleted_count > 0
