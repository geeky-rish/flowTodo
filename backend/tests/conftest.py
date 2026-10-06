import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from unittest.mock import MagicMock
from bson import ObjectId
from datetime import datetime, timezone


@pytest.fixture(scope="session")
def anyio_backend():
    return "asyncio"


@pytest.fixture(autouse=True)
def mock_db(monkeypatch):
    mock_collection = MagicMock()
    mock_db_instance = MagicMock()
    mock_db_instance.__getitem__ = lambda self, key: mock_collection
    monkeypatch.setattr("app.database.connection._db", mock_db_instance)
    monkeypatch.setattr("app.database.connection._client", MagicMock())


@pytest_asyncio.fixture
async def client():
    from app.core.security import get_current_user
    from app.main import app

    app.dependency_overrides[get_current_user] = lambda: {
        "_id": ObjectId("507f1f77bcf86cd799439011"),
        "username": "test-user",
        "created_at": datetime.now(timezone.utc),
    }
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac
    app.dependency_overrides.clear()
