from datetime import datetime, timezone
from typing import Optional

from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase
from pymongo.errors import DuplicateKeyError

from app.core.security import hash_password, verify_password
from app.schemas.auth import RegisterRequest


class DuplicateUserError(Exception):
    pass


class AuthService:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.collection = db["users"]

    async def create_user(self, data: RegisterRequest) -> dict:
        username = data.username.strip().lower()
        email = data.email.strip().lower() if data.email else None
        existing = await self.collection.find_one(
            {"$or": [{"username": username}, {"email": email}]} if email else {"username": username}
        )
        if existing:
            raise DuplicateUserError()

        doc = {
            "username": username,
            "email": email,
            "password_hash": hash_password(data.password),
            "created_at": datetime.now(timezone.utc),
        }
        try:
            result = await self.collection.insert_one(doc)
        except DuplicateKeyError as exc:
            raise DuplicateUserError() from exc
        created = await self.collection.find_one({"_id": result.inserted_id})
        return created

    async def authenticate(self, identifier: str, password: str) -> Optional[dict]:
        identifier = identifier.strip().lower()
        user = await self.collection.find_one(
            {"$or": [{"username": identifier}, {"email": identifier}]}
        )
        if not user or not verify_password(password, user["password_hash"]):
            return None
        return user

    async def get_or_create_seed_user(self) -> dict:
        user = await self.collection.find_one({"username": "demo"})
        if user:
            return user
        return await self.create_user(
            RegisterRequest(username="demo", email=None, password="demo-password-change-me")
        )


def serialize_user(user: dict) -> dict:
    return {
        "_id": str(user["_id"]),
        "username": user["username"],
        "email": user.get("email"),
        "created_at": user["created_at"],
    }
