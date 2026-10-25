# FlowTodo Agent Team & Context Management

This document describes the AI agent team, their roles, responsibilities, and how they collaborate on the FlowTodo project.

## Agent Team Specification

### 1. Backend Engineer Agent
**Role**: FastAPI backend development, database design, API implementation
**Responsibilities**:
- Design and implement REST API endpoints
- Manage MongoDB schemas, indexes, and migrations
- Implement business logic in service layer
- Write unit and integration tests
- Handle authentication, authorization, and security
- Optimize database queries and API performance

**Tools**: Python, FastAPI, Motor (async MongoDB), Pydantic, pytest, structlog

### 2. Frontend Engineer Agent
**Role**: React/TypeScript frontend development, UI/UX implementation
**Responsibilities**:
- Build responsive React components with Tailwind CSS
- Implement state management with React hooks
- Integrate with backend API via Axios
- Create data visualizations with Recharts
- Ensure accessibility and cross-browser compatibility
- Write component tests

**Tools**: React 19, TypeScript, Vite, Tailwind CSS v4, Axios, Recharts, date-fns, lucide-react

### 3. DevOps Engineer Agent
**Role**: Containerization, CI/CD, deployment, infrastructure
**Responsibilities**:
- Maintain Dockerfiles and docker-compose.yml
- Configure GitHub Actions workflows
- Manage deployment to production
- Set up monitoring, logging, and alerting
- Configure reverse proxy (nginx)
- Manage secrets and environment variables

**Tools**: Docker, Docker Compose, GitHub Actions, nginx, GitHub Container Registry

### 4. QA Engineer Agent
**Role**: Testing, quality assurance, test automation
**Responsibilities**:
- Write and maintain test suites (unit, integration, e2e)
- Set up test environments and fixtures
- Define test strategies and coverage targets
- Automate test execution in CI
- Perform manual exploratory testing

**Tools**: pytest, pytest-asyncio, httpx, Playwright (e2e), Vitest (frontend unit tests)

### 5. Observability Engineer Agent
**Role**: Monitoring, logging, tracing, alerting
**Responsibilities**:
- Implement structured logging with trace IDs
- Set up metrics collection (Prometheus/OpenTelemetry)
- Configure distributed tracing
- Create dashboards and visualizations
- Define and manage alert rules
- Implement on-call agent for incident response

**Tools**: structlog, OpenTelemetry, Prometheus, Grafana, Alertmanager

### 6. Product Manager Agent
**Role**: Requirements, specification, prioritization
**Responsibilities**:
- Maintain product specification (SPEC.md)
- Manage task tracker (GitHub Issues/Projects)
- Define acceptance criteria
- Prioritize features and bugs
- Coordinate between agents
- Review and approve pull requests

**Tools**: GitHub Issues, GitHub Projects, Markdown specs

---

## Agent Collaboration Process

### Workflow
1. **Product Manager** creates/updates SPEC.md and GitHub Issues with acceptance criteria
2. **Backend/Frontend Engineers** pick up issues, implement features
3. **QA Engineer** writes tests for new features
4. **DevOps Engineer** ensures CI/CD passes, handles deployment
5. **Observability Engineer** instruments new code, updates alerts
6. All agents review each other's PRs

### Communication
- All work tracked in GitHub Issues with labels: `backend`, `frontend`, `devops`, `qa`, `observability`, `docs`
- PRs reference related issues
- Daily standup via GitHub Project board updates
- Architectural decisions recorded in `docs/adr/` (Architecture Decision Records)

### Context Handoff
Each agent maintains context in:
- `AGENTS.md` (this file) - team structure and process
- `SPEC.md` - product requirements and acceptance criteria
- `docs/adr/` - architectural decisions
- GitHub Issues - task tracking with acceptance criteria
- Code comments and docstrings - implementation details

---

## Project Structure Reference

```
flowtodo/
├── AGENTS.md                 # This file - agent team & context
├── SPEC.md                   # Product specification
├── docs/
│   ├── adr/                  # Architecture Decision Records
│   ├── architecture.md       # System architecture
│   ├── api.md                # API documentation
│   ├── deployment.md         # Deployment guide
│   ├── observability.md      # Observability setup
│   └── ai-development.md     # AI development documentation
├── backend/
│   ├── app/
│   │   ├── api/              # FastAPI routes
│   │   ├── core/             # Config, security, logging
│   │   ├── database/         # MongoDB connection
│   │   ├── models/           # Domain models/enums
│   │   ├── schemas/          # Pydantic schemas
│   │   └── services/         # Business logic
│   ├── tests/                # Backend tests
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── hooks/            # Custom hooks
│   │   ├── pages/            # Page components
│   │   ├── services/         # API client
│   │   ├── types/            # TypeScript types
│   │   └── __tests__/        # Frontend tests
│   └── package.json
├── docker/
│   ├── Dockerfile.backend
│   ├── Dockerfile.frontend
│   └── nginx.conf
├── docker-compose.yml
├── .github/workflows/
│   └── ci.yml
└── README.md
```

---

## Development Commands

### Local Development
```bash
# Start all services (including MongoDB)
docker-compose up --build

# Or run individually:
# Backend
cd backend && pip install -r requirements.txt && python seed.py && uvicorn app.main:app --reload

# Frontend
cd frontend && npm install && npm run dev

# Run tests
cd backend && python -m pytest
cd frontend && npm run test
```

### Environment Variables
Copy `.env.example` to `.env` and fill in values:
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret for JWT tokens (generate with `openssl rand -hex 32`)
- `CORS_ORIGINS` - Comma-separated allowed origins
- `VITE_API_URL` - Backend API URL for frontend

---

## Key Architectural Decisions

See `docs/adr/` for full ADRs. Summary:
- **ADR-001**: FastAPI + MongoDB for async, scalable backend
- **ADR-002**: React + TypeScript + Vite for modern frontend
- **ADR-003**: JWT authentication with HttpOnly cookies alternative
- **ADR-004**: Docker multi-stage builds for production images
- **ADR-005**: Structured JSON logging with trace IDs for observability
- **ADR-006**: OpenTelemetry for metrics and distributed tracing