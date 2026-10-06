from datetime import datetime, timezone

import pytest
from bson import ObjectId

from app.core.security import get_current_user
from app.main import app
from app.services.auth_service import DuplicateUserError


USER_A_ID = ObjectId("507f1f77bcf86cd799439011")
USER_B_ID = ObjectId("507f1f77bcf86cd799439012")
NOW = datetime.now(timezone.utc)


def user_doc(user_id=USER_A_ID, username="alice"):
    return {
        "_id": user_id,
        "username": username,
        "email": f"{username}@example.com",
        "created_at": NOW,
        "password_hash": "hashed-password",
    }


@pytest.mark.anyio
async def test_register_success(client, monkeypatch):
    async def create_user(self, data):
        return user_doc()

    async def seed_defaults(self, user_id):
        assert user_id == str(USER_A_ID)

    monkeypatch.setattr("app.services.auth_service.AuthService.create_user", create_user)
    monkeypatch.setattr("app.services.category_service.CategoryService.seed_defaults", seed_defaults)
    from app.core.config import get_settings
    get_settings().JWT_SECRET = "test-secret"

    response = await client.post(
        "/api/auth/register",
        json={"username": "alice", "email": "alice@example.com", "password": "password123"},
    )

    assert response.status_code == 201
    assert response.json()["user"]["username"] == "alice"
    assert response.json()["access_token"]


@pytest.mark.anyio
async def test_duplicate_registration(client, monkeypatch):
    async def create_user(self, data):
        raise DuplicateUserError()

    monkeypatch.setattr("app.services.auth_service.AuthService.create_user", create_user)
    response = await client.post(
        "/api/auth/register",
        json={"username": "alice", "password": "password123"},
    )
    assert response.status_code == 409


@pytest.mark.anyio
async def test_login_success(client, monkeypatch):
    async def authenticate(self, identifier, password):
        return user_doc()

    monkeypatch.setattr("app.services.auth_service.AuthService.authenticate", authenticate)
    from app.core.config import get_settings
    get_settings().JWT_SECRET = "test-secret"

    response = await client.post(
        "/api/auth/login",
        json={"identifier": "alice", "password": "password123"},
    )
    assert response.status_code == 200
    assert response.json()["user"]["_id"] == str(USER_A_ID)


@pytest.mark.anyio
async def test_invalid_login(client, monkeypatch):
    async def authenticate(self, identifier, password):
        return None

    monkeypatch.setattr("app.services.auth_service.AuthService.authenticate", authenticate)
    response = await client.post(
        "/api/auth/login",
        json={"identifier": "alice", "password": "wrong-password"},
    )
    assert response.status_code == 401


@pytest.mark.anyio
async def test_authenticated_me(client):
    response = await client.get("/api/auth/me")
    assert response.status_code == 200
    assert response.json()["username"] == "test-user"


@pytest.mark.anyio
async def test_protected_endpoint_requires_auth(client):
    app.dependency_overrides.clear()
    response = await client.get("/api/tasks")
    assert response.status_code == 401


@pytest.mark.anyio
async def test_authenticated_task_creation_uses_current_user(client, monkeypatch):
    captured = {}

    async def create_task(self, user_id, data):
        captured["user_id"] = user_id
        return {
            "_id": str(ObjectId()),
            "title": data.title,
            "priority": data.priority,
            "status": data.status,
            "tags": [],
            "created_at": NOW,
            "updated_at": NOW,
            "completed_at": None,
        }

    monkeypatch.setattr("app.services.task_service.TaskService.create_task", create_task)
    response = await client.post("/api/tasks", json={"title": "Owned task"})
    assert response.status_code == 201
    assert captured["user_id"] == str(USER_A_ID)


@pytest.mark.anyio
async def test_user_cannot_access_another_users_task(client, monkeypatch):
    async def get_task(self, user_id, task_id):
        return {"_id": task_id} if user_id == str(USER_A_ID) else None

    monkeypatch.setattr("app.services.task_service.TaskService.get_task", get_task)
    app.dependency_overrides[get_current_user] = lambda: user_doc(USER_B_ID, "bob")
    response = await client.get(f"/api/tasks/{ObjectId()}")
    assert response.status_code == 404


@pytest.mark.anyio
async def test_user_cannot_update_or_delete_another_users_task(client, monkeypatch):
    async def update_task(self, user_id, task_id, data):
        return None

    async def delete_task(self, user_id, task_id):
        return False

    monkeypatch.setattr("app.services.task_service.TaskService.update_task", update_task)
    monkeypatch.setattr("app.services.task_service.TaskService.delete_task", delete_task)
    app.dependency_overrides[get_current_user] = lambda: user_doc(USER_B_ID, "bob")
    task_id = str(ObjectId())

    update_response = await client.put(f"/api/tasks/{task_id}", json={"title": "stolen"})
    delete_response = await client.delete(f"/api/tasks/{task_id}")

    assert update_response.status_code == 404
    assert delete_response.status_code == 404
