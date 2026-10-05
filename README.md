# FlowTodo — Calendar-Centric SaaS Task Management

FlowTodo is a production-grade, calendar-centric personal productivity and task management application designed with modern SaaS aesthetics inspired by tools like Linear and Notion.

---

## ⚡ Tech Stack & Architecture

### Backend
- **Framework**: FastAPI (Python 3.12+ / 3.13)
- **Database**: MongoDB (via `motor` async driver & `pymongo`)
- **Validation & Settings**: Pydantic v2 & `pydantic-settings`
- **Testing**: `pytest`, `pytest-asyncio`, `httpx`
- **Logging**: `structlog` structured JSON logging

### Frontend
- **Framework**: React + TypeScript + Vite
- **Styling**: Tailwind CSS v4 + CSS Custom Properties Design Tokens
- **Icons**: `lucide-react`
- **Charts & Data Viz**: `recharts` (14-day productivity trends, completion rates, category distributions)
- **Date Handling**: `date-fns`

---

## 📂 Repository Structure

```
flowtodo/
├── backend/
│   ├── app/
│   │   ├── api/             # FastAPI REST endpoints (tasks, categories, stats, health)
│   │   ├── core/            # App configuration and logging setup
│   │   ├── database/        # Async MongoDB connection management
│   │   ├── models/          # Enum definitions and domain constants
│   │   ├── schemas/         # Pydantic validation request/response schemas
│   │   └── services/        # Business logic layer (TaskService, CategoryService, StatsService)
│   ├── tests/               # Async integration test suite
│   ├── seed.py              # Sample data generator for development
│   ├── pytest.ini           # Pytest test configuration
│   └── requirements.txt     # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── components/      # TaskCard, Calendar, Header, Sidebar, TaskModal, etc.
│   │   ├── hooks/           # useTasks, useCategories, useTheme custom hooks
│   │   ├── pages/           # Today, Upcoming, Calendar, Tasks, Stats, Completed, Settings
│   │   ├── services/        # Axios API client layer
│   │   └── types/           # TypeScript interfaces and types
│   ├── index.html
│   ├── vite.config.ts
│   └── package.json
├── docker/
│   ├── Dockerfile.backend   # Python 3.12 slim container setup
│   ├── Dockerfile.frontend  # Multi-stage build with Nginx runner
│   └── nginx.conf           # SPA routing & API reverse proxy configuration
├── docker-compose.yml       # Full stack local orchestration with healthchecks
└── README.md
```

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- Node.js (v18+) & npm
- Python 3.12+
- MongoDB instance running locally (`mongodb://localhost:27017`) or a MongoDB Atlas URI

### 1. Backend Setup

```bash
cd backend

# Install dependencies
pip install -r requirements.txt

# Run database seed script (populates realistic sample tasks)
python seed.py

# Run FastAPI dev server
uvicorn app.main:app --reload --port 8000
```
- API Docs available at: `http://localhost:8000/docs`
- Health check endpoint: `http://localhost:8000/api/health`

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start Vite development server
npm run dev
```
- Open application at: `http://localhost:5173`

---

## 🧪 Running Tests

### Backend Test Suite
```bash
cd backend
python -m pytest
```

### Frontend Type Check & Build Validation
```bash
cd frontend
npm run build
```

---

## 🐳 Docker Deployment

To run the complete production containerized stack with Docker Compose:

```bash
# Set environment variables (or copy .env.example)
docker-compose up --build
```

- **Frontend Application**: `http://localhost:5173`
- **Backend Service**: `http://localhost:8000`

---

## 🎨 Features & Highlights

1. **Calendar View**: Full interactive calendar grid with date selection, task counters per day, and real-time filtering.
2. **Today View**: Organized by time of day (Morning, Afternoon, Evening, Flexible) with overdue task alerts.
3. **Productivity Analytics**: Visual charts powered by Recharts tracking completion rates, weekly velocity, and category distribution.
4. **Dark & Light Mode**: Fluid custom CSS design token system with seamless persistence.
5. **Clean API Architecture**: Layered design separation between FastAPI routes, Async services, and Pydantic schemas.
