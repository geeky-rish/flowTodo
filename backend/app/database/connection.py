from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from app.core.config import get_settings
import logging

logger = logging.getLogger(__name__)

settings = get_settings()

_client: AsyncIOMotorClient | None = None
_db: AsyncIOMotorDatabase | None = None


async def connect_to_mongo() -> None:
    """Connect to MongoDB and create indexes."""
    global _client, _db
    try:
        _client = AsyncIOMotorClient(
            settings.MONGODB_URI,
            serverSelectionTimeoutMS=5000,
            connectTimeoutMS=5000,
        )
        _db = _client[settings.MONGODB_DATABASE]
        # Verify connection
        await _client.admin.command("ping")
        logger.info("Connected to MongoDB: %s", settings.MONGODB_DATABASE)
        await _create_indexes()
    except Exception as e:
        logger.error("Failed to connect to MongoDB: %s", e)
        raise


async def close_mongo_connection() -> None:
    """Close MongoDB connection."""
    global _client
    if _client:
        _client.close()
        logger.info("Closed MongoDB connection")


def get_db() -> AsyncIOMotorDatabase:
    """Return the database instance."""
    if _db is None:
        raise RuntimeError("Database not initialized. Call connect_to_mongo() first.")
    return _db


async def _create_indexes() -> None:
    """Create indexes for performance."""
    db = get_db()
    users = db["users"]
    await users.create_index("username", unique=True)
    await users.create_index("email", unique=True, sparse=True)

    tasks = db["tasks"]
    await tasks.create_index("user_id")
    await tasks.create_index([("user_id", 1), ("created_at", -1)])
    await tasks.create_index("due_date")
    await tasks.create_index("status")
    await tasks.create_index("category")
    await tasks.create_index("priority")
    await tasks.create_index("created_at")
    await tasks.create_index([("title", "text"), ("description", "text"), ("tags", "text")])

    categories = db["categories"]
    await categories.create_index([("user_id", 1), ("name", 1)], unique=True)
    logger.info("MongoDB indexes created")
