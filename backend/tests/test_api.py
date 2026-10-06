"""
Integration tests for the FlowTodo API.
Uses an in-memory mock depending on environment.

Run with: pytest tests/ -v
"""
import pytest
from datetime import datetime, timezone


# ── Health ────────────────────────────────────────────────────────────────────
@pytest.mark.anyio
async def test_health_endpoint(client):
    response = await client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["service"] == "flowtodo-api"


# ── Tasks CRUD ────────────────────────────────────────────────────────────────
TASK_PAYLOAD = {
    "title": "Test Task",
    "description": "A test description",
    "due_date": "2026-10-10",
    "due_time": "10:00",
    "priority": "high",
    "status": "todo",
    "category": "Work",
    "tags": ["test", "pytest"],
}


@pytest.mark.anyio
async def test_create_task(client, monkeypatch):
    """Task creation returns 201 with the created task."""
    from bson import ObjectId
    fake_id = str(ObjectId())
    now = datetime.now(timezone.utc)

    async def mock_create(self, user_id, data):
        return {
            "_id": fake_id,
            **TASK_PAYLOAD,
            "reminder_date": None,
            "reminder_time": None,
            "created_at": now,
            "updated_at": now,
            "completed_at": None,
        }

    monkeypatch.setattr("app.services.task_service.TaskService.create_task", mock_create)
    response = await client.post("/api/tasks", json=TASK_PAYLOAD)
    assert response.status_code == 201
    body = response.json()
    assert body["title"] == TASK_PAYLOAD["title"]
    assert body["priority"] == "high"


@pytest.mark.anyio
async def test_get_tasks(client, monkeypatch):
    """List tasks returns a list with total count."""
    async def mock_get_tasks(self, **kwargs):
        return {"tasks": [], "total": 0}

    monkeypatch.setattr("app.services.task_service.TaskService.get_tasks", mock_get_tasks)
    response = await client.get("/api/tasks")
    assert response.status_code == 200
    body = response.json()
    assert "tasks" in body
    assert "total" in body


@pytest.mark.anyio
async def test_get_task_not_found(client, monkeypatch):
    """Getting a non-existent task returns 404."""
    async def mock_get_task(self, user_id, task_id):
        return None

    monkeypatch.setattr("app.services.task_service.TaskService.get_task", mock_get_task)
    from bson import ObjectId
    response = await client.get(f"/api/tasks/{str(ObjectId())}")
    assert response.status_code == 404


@pytest.mark.anyio
async def test_update_task(client, monkeypatch):
    """Updating a task returns the updated task."""
    from bson import ObjectId
    fake_id = str(ObjectId())
    now = datetime.now(timezone.utc)

    async def mock_update(self, user_id, task_id, data):
        return {
            "_id": fake_id,
            **TASK_PAYLOAD,
            "title": "Updated Title",
            "reminder_date": None,
            "reminder_time": None,
            "created_at": now,
            "updated_at": now,
            "completed_at": None,
        }

    monkeypatch.setattr("app.services.task_service.TaskService.update_task", mock_update)
    response = await client.put(f"/api/tasks/{fake_id}", json={"title": "Updated Title"})
    assert response.status_code == 200
    assert response.json()["title"] == "Updated Title"


@pytest.mark.anyio
async def test_complete_task(client, monkeypatch):
    """Completing a task updates its status."""
    from bson import ObjectId
    fake_id = str(ObjectId())
    now = datetime.now(timezone.utc)

    async def mock_complete(self, user_id, task_id):
        return {
            "_id": fake_id,
            **TASK_PAYLOAD,
            "status": "completed",
            "reminder_date": None,
            "reminder_time": None,
            "created_at": now,
            "updated_at": now,
            "completed_at": now,
        }

    monkeypatch.setattr("app.services.task_service.TaskService.complete_task", mock_complete)
    response = await client.patch(f"/api/tasks/{fake_id}/complete")
    assert response.status_code == 200
    assert response.json()["status"] == "completed"


@pytest.mark.anyio
async def test_delete_task(client, monkeypatch):
    """Deleting a task returns success message."""
    from bson import ObjectId
    fake_id = str(ObjectId())

    async def mock_delete(self, user_id, task_id):
        return True

    monkeypatch.setattr("app.services.task_service.TaskService.delete_task", mock_delete)
    response = await client.delete(f"/api/tasks/{fake_id}")
    assert response.status_code == 200
    assert response.json()["success"] is True


@pytest.mark.anyio
async def test_get_tasks_by_date(client, monkeypatch):
    """Date-based task retrieval works correctly."""
    async def mock_get_by_date(self, user_id, date_str):
        return []

    monkeypatch.setattr("app.services.task_service.TaskService.get_tasks_by_date", mock_get_by_date)
    response = await client.get("/api/tasks/date/2026-10-05")
    assert response.status_code == 200
    body = response.json()
    assert "tasks" in body


@pytest.mark.anyio
async def test_create_task_validation(client, monkeypatch):
    """Task creation fails with invalid payload."""
    response = await client.post("/api/tasks", json={"title": ""})
    assert response.status_code == 422
