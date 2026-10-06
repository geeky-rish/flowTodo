"""
Seed script to populate FlowTodo with realistic development data.
Run with: python seed.py
"""
import asyncio
import sys
import os
from datetime import date, timedelta, datetime, timezone

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.database.connection import connect_to_mongo, get_db, close_mongo_connection
from app.services.task_service import TaskService
from app.services.category_service import CategoryService
from app.services.auth_service import AuthService
from app.schemas.task import TaskCreate
from app.models.enums import Priority, TaskStatus


TODAY = date.today()


def d(offset: int) -> str:
    return (TODAY + timedelta(days=offset)).isoformat()


SAMPLE_TASKS = [
    # Today
    {"title": "Finish ML assignment", "description": "Complete the neural network implementation", "due_date": d(0), "due_time": "10:00", "priority": "high", "status": "todo", "category": "Study", "tags": ["ml", "college", "urgent"]},
    {"title": "Push project to GitHub", "description": "Push FlowTodo source code to the main branch", "due_date": d(0), "due_time": "12:30", "priority": "medium", "status": "completed", "category": "Projects", "tags": ["git", "coding"]},
    {"title": "Review Docker concepts", "description": "Study Docker networking, volumes, and multi-stage builds", "due_date": d(0), "due_time": "15:00", "priority": "high", "status": "todo", "category": "Study", "tags": ["docker", "devops"]},
    {"title": "Team standup meeting", "description": "Daily sync with the engineering team", "due_date": d(0), "due_time": "09:00", "priority": "medium", "status": "completed", "category": "Work", "tags": ["meeting"]},
    {"title": "Gym session", "description": "Chest and triceps workout", "due_date": d(0), "due_time": "19:00", "priority": "low", "status": "todo", "category": "Health", "tags": ["fitness"]},
    {"title": "Read research paper on transformers", "description": "Attention Is All You Need — annotated", "due_date": d(0), "due_time": "21:00", "priority": "medium", "status": "todo", "category": "Study", "tags": ["ml", "research"]},

    # Tomorrow
    {"title": "Code review sprint", "description": "Review 3 open PRs from teammates", "due_date": d(1), "due_time": "10:00", "priority": "high", "status": "todo", "category": "Work", "tags": ["review", "coding"]},
    {"title": "Data Structures revision", "description": "Review trees, graphs, and dynamic programming", "due_date": d(1), "due_time": "14:00", "priority": "medium", "status": "todo", "category": "Study", "tags": ["dsa", "college"]},
    {"title": "Grocery shopping", "description": "Buy weekly groceries", "due_date": d(1), "due_time": None, "priority": "low", "status": "todo", "category": "Personal", "tags": ["errands"]},

    # Day after
    {"title": "Write blog post on FastAPI", "description": "Draft a technical article on building APIs with FastAPI", "due_date": d(2), "due_time": "11:00", "priority": "medium", "status": "todo", "category": "Projects", "tags": ["writing", "fastapi"]},
    {"title": "Project meeting with stakeholders", "description": "Q4 roadmap discussion", "due_date": d(2), "due_time": "16:00", "priority": "high", "status": "todo", "category": "Work", "tags": ["meeting", "planning"]},

    # Later this week
    {"title": "Deploy backend to cloud", "description": "Set up CI/CD pipeline and deploy to production", "due_date": d(3), "due_time": "14:00", "priority": "high", "status": "todo", "category": "Projects", "tags": ["devops", "deployment"]},
    {"title": "Morning run", "description": "5km easy run", "due_date": d(3), "due_time": "07:00", "priority": "low", "status": "todo", "category": "Health", "tags": ["fitness", "running"]},
    {"title": "Operating Systems exam prep", "description": "Study process management and memory allocation", "due_date": d(4), "due_time": "09:00", "priority": "high", "status": "todo", "category": "Study", "tags": ["os", "college", "exam"]},
    {"title": "Catch up with mentor", "description": "Monthly career check-in call", "due_date": d(5), "due_time": "18:00", "priority": "medium", "status": "todo", "category": "Personal", "tags": ["career", "mentorship"]},
    {"title": "Portfolio website update", "description": "Add recent projects and update bio", "due_date": d(6), "due_time": None, "priority": "low", "status": "todo", "category": "Projects", "tags": ["portfolio", "web"]},

    # Overdue tasks
    {"title": "Submit college fee payment", "description": "Online payment via college portal", "due_date": d(-2), "due_time": "23:59", "priority": "high", "status": "todo", "category": "Personal", "tags": ["college", "urgent", "admin"]},
    {"title": "Fix login bug in API", "description": "Authentication token not refreshing properly", "due_date": d(-1), "due_time": "17:00", "priority": "high", "status": "todo", "category": "Work", "tags": ["bug", "auth", "coding"]},
    {"title": "Read DBMS chapter 5", "description": "Database normalization and transactions", "due_date": d(-3), "due_time": "20:00", "priority": "medium", "status": "completed", "category": "Study", "tags": ["dbms", "college"]},

    # Completed tasks (past)
    {"title": "Set up development environment", "description": "Install all tools and configure IDE", "due_date": d(-5), "due_time": None, "priority": "medium", "status": "completed", "category": "Work", "tags": ["setup", "tools"]},
    {"title": "Learn Pydantic v2", "description": "Study new features and migration guide", "due_date": d(-4), "due_time": "13:00", "priority": "medium", "status": "completed", "category": "Study", "tags": ["python", "pydantic"]},
    {"title": "Mock interview practice", "description": "LeetCode medium problems practice session", "due_date": d(-6), "due_time": "15:00", "priority": "high", "status": "completed", "category": "Study", "tags": ["interview", "dsa"]},
]


async def seed():
    print("Connecting to MongoDB…")
    await connect_to_mongo()
    db = get_db()

    auth_svc = AuthService(db)
    user = await auth_svc.get_or_create_seed_user()
    user_id = str(user["_id"])

    # Clear existing data
    await db["tasks"].delete_many({})
    print("Cleared existing tasks")

    cat_svc = CategoryService(db)
    await db["categories"].delete_many({})
    await cat_svc.seed_defaults(user_id)
    print("Seeded default categories")

    task_svc = TaskService(db)
    for task_data in SAMPLE_TASKS:
        status = task_data.pop("status", "todo")
        create_data = TaskCreate(**task_data)
        doc = await task_svc.create_task(user_id, create_data)

        # Mark as completed if needed
        if status == "completed":
            await task_svc.complete_task(user_id, doc["_id"])

    print(f"Seeded {len(SAMPLE_TASKS)} tasks successfully!")
    await close_mongo_connection()


if __name__ == "__main__":
    asyncio.run(seed())
