# FlowTodo — Calendar-Centric SaaS Task Management

FlowTodo is a production-grade, calendar-centric personal productivity and task management application designed with modern SaaS aesthetics inspired by tools like Linear and Notion.

---

## ⚡ Tech Stack & Architecture

### Backend
- **Framework**: FastAPI (Python 3.12+)
- **Database**: MongoDB (via `motor` async driver & `pymongo`)
- **Validation & Settings**: Pydantic v2 & `pydantic-settings`
- **Authentication**: JWT with Argon2 password hashing (`pwdlib`)
- **Testing**: `pytest`, `pytest-asyncio`, `httpx`
- **Logging**: `structlog` structured JSON logging
- **Observability**: OpenTelemetry (traces, metrics), Prometheus metrics, Grafana dashboards
- **Alerting**: Prometheus Alertmanager with on-call agent for automated remediation

### Frontend
- **Framework**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS v4 + CSS Custom Properties Design Tokens
- **Icons**: `lucide-react`
- **Charts & Data Viz**: `recharts` (14-day productivity trends, completion rates, category distributions)
- **Date Handling**: `date-fns`
- **Testing**: `vitest` (unit), `Playwright` (E2E)
- **State Management**: React hooks with optimistic updates

### Infrastructure
- **Containerization**: Docker multi-stage builds, Docker Compose
- **CI/CD**: GitHub Actions (tests, builds, pushes to GHCR)
- **Reverse Proxy**: nginx (SPA routing + API proxy)
- **Monitoring**: Prometheus, Grafana, Alertmanager
- **On-Call**: Custom Python agent for automated incident response

---

## 📂 Repository Structure

```
flowtodo/
├── AGENTS.md                    # Agent team & context management
├── SPEC.md                      # Product specification
├── .env.example                 # Environment variables template
├── docker-compose.yml           # Full stack orchestration
├── .github/workflows/ci.yml     # CI/CD pipeline
├── docs/
│   ├── adr/                     # Architecture Decision Records
│   ├── architecture.md          # System architecture
│   ├── api.md                   # API documentation
│   ├── deployment.md            # Deployment guide
│   ├── observability.md         # Observability setup
│   └── ai-development.md        # AI development documentation
├── backend/
│   ├── app/
│   │   ├── api/                 # FastAPI REST endpoints
│   │   │   ├── tasks.py         # Task CRUD + date-based queries
│   │   │   ├── categories.py    # Category management
│   │   │   ├── stats.py         # Productivity statistics
│   │   │   ├── auth.py          # Registration, login, profile
│   │   │   └── admin.py         # Admin endpoints for on-call agent
│   │   ├── core/
│   │   │   ├── config.py        # Pydantic settings
│   │   │   ├── security.py      # JWT, password hashing
│   │   │   └── observability.py # Structured logging, metrics, tracing
│   │   ├── database/            # Async MongoDB connection
│   │   ├── models/              # Domain enums (Priority, TaskStatus)
│   │   ├── schemas/             # Pydantic request/response models
│   │   └── services/            # Business logic layer
│   ├── tests/                   # Async integration test suite
│   ├── seed.py                  # Sample data generator
│   ├── pytest.ini               # Pytest configuration
│   └── requirements.txt         # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── components/          # TaskCard, Calendar, Header, Sidebar, TaskModal
│   │   ├── hooks/               # useTasks, useCategories, useTheme
│   │   ├── pages/               # Today, Upcoming, Calendar, Tasks, Stats, Completed, Settings, Login, Register
│   │   ├── services/            # Axios API client layer
│   │   ├── types/               # TypeScript interfaces
│   │   ├── utils/               # Helper functions
│   │   ├── context/             # AuthContext
│   │   ├── layouts/             # AppLayout
│   │   └── __tests__/           # Unit & E2E tests
│   ├── index.html
│   ├── vite.config.ts
│   ├── vitest.config.ts
│   ├── playwright.config.ts
│   └── package.json
├── docker/
│   ├── Dockerfile.backend       # Python 3.12 slim container
│   ├── Dockerfile.frontend      # Multi-stage build with Nginx
│   ├── nginx.conf               # SPA routing & API reverse proxy
│   ├── prometheus/              # Prometheus config & alert rules
│   ├── alertmanager/            # Alertmanager config
│   ├── grafana/                 # Grafana provisioning & dashboards
│   └── oncall-agent/            # On-call agent Dockerfile & code
└── README.md
```

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- Docker & Docker Compose (recommended)
- OR: Node.js 18+, Python 3.12+, MongoDB 7+

### 1. Clone and Configure

```bash
git clone https://github.com/geeky-rish/flowTodo
cd flowTodo

# Copy environment template
cp .env.example .env

# Generate secrets (run once)
openssl rand -hex 32  # For JWT_SECRET
openssl rand -hex 32  # For ADMIN_TOKEN
# Edit .env and paste the generated values
```

### 2. Start with Docker Compose (Recommended)

```bash
# Start all services (MongoDB, Backend, Frontend, Prometheus, Grafana, Alertmanager, On-Call Agent)
docker-compose up --build

# Services will be available at:
# Frontend:     http://localhost:5173
# Backend API:  http://localhost:8000
# API Docs:     http://localhost:8000/api/docs
# Prometheus:   http://localhost:9090
# Grafana:      http://localhost:3000 (admin/admin)
# Alertmanager: http://localhost:9093
# On-Call Agent: http://localhost:8080/health
```

### 3. Manual Setup (Alternative)

#### Backend
```bash
cd backend

# Install dependencies
pip install -r requirements.txt

# Run database seed (populates realistic sample tasks)
python seed.py

# Run FastAPI dev server
uvicorn app.main:app --reload --port 8000
```

#### Frontend
```bash
cd frontend

# Install dependencies
npm install

# Start Vite development server
npm run dev
```

---

## 🧪 Running Tests

### Backend Tests
```bash
cd backend
python -m pytest -v
python -m pytest --cov=app --cov-report=html  # With coverage
```

### Frontend Unit Tests
```bash
cd frontend
npm run test           # Run once
npm run test:watch     # Watch mode
npm run test:ui        # With UI
```

### Frontend E2E Tests
```bash
cd frontend
npm run test:e2e       # Headless
npm run test:e2e:ui    # With UI
```

### All Tests (CI Simulation)
```bash
# From root directory
docker-compose -f docker-compose.yml -f docker-compose.test.yml up --build --abort-on-container-exit
```

---

## 🐳 Docker Deployment

### Production Build
```bash
# Set environment variables
export IMAGE_TAG=v1.0.0
export JWT_SECRET=your-production-secret
export ADMIN_TOKEN=your-admin-token
export GRAFANA_PASSWORD=secure-password

# Build and push images (handled by CI/CD)
docker-compose build
docker-compose push
```

### Production Deploy
```bash
# On production server
docker-compose pull
docker-compose up -d

# Verify health
curl http://localhost:8000/api/health
curl http://localhost:5173
```

### Docker Services
| Service | Port | Description |
|---------|------|-------------|
| mongodb | 27017 | Database |
| backend | 8000, 9090 | FastAPI + Prometheus metrics |
| frontend | 5173 | React app via Nginx |
| prometheus | 9090 | Metrics collection |
| alertmanager | 9093 | Alert routing |
| grafana | 3000 | Dashboards |
| oncall-agent | 8080 | Automated incident response |

---

## 📡 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get current user profile |

### Tasks
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tasks` | List tasks (with filters, pagination, sorting) |
| POST | `/api/tasks` | Create task |
| GET | `/api/tasks/date/{date}` | Get tasks by date (YYYY-MM-DD) |
| GET | `/api/tasks/{id}` | Get single task |
| PUT | `/api/tasks/{id}` | Update task |
| DELETE | `/api/tasks/{id}` | Delete task |
| PATCH | `/api/tasks/{id}/complete` | Toggle completion |

### Categories
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/categories` | List categories with task counts |
| POST | `/api/categories` | Create category |
| PUT | `/api/categories/{id}` | Update category |
| DELETE | `/api/categories/{id}` | Delete category |

### Statistics
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/stats` | Get productivity statistics |

### Health & Observability
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| GET | `/metrics` | Prometheus metrics |
| GET | `/api/openapi.json` | OpenAPI 3.0 spec |

### Admin (On-Call Agent)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/admin/restart-service` | Restart service (requires ADMIN_TOKEN) |
| POST | `/api/admin/clear-db-pool` | Clear DB connection pool |
| GET | `/api/admin/health` | Admin health check |

---

## 📊 Observability

### Metrics (Prometheus)
- **HTTP**: Request rate, latency (p50, p95, p99), error rate, active requests
- **Database**: Query rate, latency by operation/collection
- **Business**: Task operations, user registrations, logins
- **System**: CPU, memory, disk (via node-exporter/cadvisor)

### Dashboards (Grafana)
- **FlowTodo Overview**: Service health, request rates, error rates, latency, DB metrics, business metrics
- Access at `http://localhost:3000` (admin/admin)

### Logging
- Structured JSON logs with trace IDs
- Correlation via `traceparent` header
- Log levels: DEBUG, INFO, WARNING, ERROR

### Distributed Tracing
- OpenTelemetry instrumentation for FastAPI, HTTPX, PyMongo
- Trace context propagation via W3C TraceContext
- Export to OTLP endpoint (Jaeger, Tempo, Grafana Cloud)

### Alerting
| Alert | Severity | Condition |
|-------|----------|-----------|
| ServiceDown | Critical | Backend down > 1min |
| HighErrorRate | Critical | 5xx rate > 5% for 2min |
| HighLatency | Warning | P95 latency > 1s for 5min |
| DatabaseConnectionFailures | Critical | No DB queries for 1min |
| HighDatabaseLatency | Warning | P95 DB latency > 500ms for 5min |
| HighMemoryUsage | Warning | Memory > 85% for 5min |
| AuthFailureSpike | Warning | >10 failed logins/sec for 2min |

### On-Call Agent
Automated remediation for common alerts:
- Service restart on crash/high error rate
- DB connection pool clearing on connection failures
- Notifications via webhook (Slack, Discord, etc.)

---

## 🚨 Alerting & On-Call

### Alert Flow
1. Prometheus evaluates alert rules every 30s
2. Firing alerts sent to Alertmanager
3. Alertmanager routes to receivers (on-call agent, email)
4. On-call agent receives webhook, determines action
5. Agent executes remediation (restart, clear pool, notify)
6. Agent posts result back to Alertmanager

### Testing Alerts
```bash
# Trigger test alert
curl -X POST http://localhost:9093/api/v1/alerts \
  -H "Content-Type: application/json" \
  -d '[{"labels":{"alertname":"TestAlert","severity":"warning"},"annotations":{"summary":"Test alert"},"status":"firing"}]'
```

---

## 🔧 Configuration

### Environment Variables
| Variable | Description | Default |
|----------|-------------|---------|
| MONGODB_URI | MongoDB connection string | mongodb://localhost:27017 |
| MONGODB_DATABASE | Database name | flowtodo |
| JWT_SECRET | JWT signing secret (32+ chars) | **required** |
| JWT_EXPIRE_MINUTES | Token expiry | 60 |
| CORS_ORIGINS | Allowed origins | http://localhost:5173,http://localhost:3000 |
| DEBUG | Enable debug mode | false |
| OTEL_EXPORTER_OTLP_ENDPOINT | OTLP collector endpoint | (empty = console) |
| ADMIN_TOKEN | On-call agent auth token | **required** |
| ALERT_WEBHOOK_URL | Webhook for notifications | (optional) |
| GRAFANA_PASSWORD | Grafana admin password | admin |
| VITE_API_URL | Backend URL for frontend | http://localhost:8000 |

### Generate Secrets
```bash
# JWT_SECRET and ADMIN_TOKEN
openssl rand -hex 32
```

---

## 📈 Productivity Features

### Views
- **Today**: Time-blocked view (Morning/Afternoon/Evening/Flexible) with overdue alerts
- **Calendar**: Monthly grid with task counters, date selection
- **Upcoming**: Future tasks grouped by date
- **Tasks**: Master list with filters, sorting, bulk actions
- **Completed**: History with restore capability
- **Stats**: Completion rates, 14-day charts, category distribution, streak tracking

### Analytics
- Overall & high-priority completion rates
- Daily completed vs created (14-day bar chart)
- Category distribution (pie chart)
- Weekly velocity trends
- Current streak counter

---

## 🔐 Security

- JWT tokens with 60-min expiry, HS256 algorithm
- Argon2 password hashing via `pwdlib`
- CORS restricted to configured origins
- Input validation on all endpoints (Pydantic)
- No sensitive data in logs (trace IDs only)
- Admin endpoints protected by separate token
- Security headers via nginx (X-Frame-Options, XSS Protection, etc.)

---

## 📚 Documentation

- [Product Specification](SPEC.md) - Requirements & acceptance criteria
- [Agent Team](AGENTS.md) - AI agent roles & collaboration process
- [Architecture](docs/architecture.md) - System design
- [API Reference](docs/api.md) - Detailed API docs
- [Deployment Guide](docs/deployment.md) - Production deployment
- [Observability](docs/observability.md) - Monitoring setup
- [AI Development](docs/ai-development.md) - AI tools & workflows

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Make changes with tests
4. Run tests: `docker-compose up --build` (or individual test commands)
5. Commit: `git commit -m 'Add amazing feature'`
6. Push: `git push origin feature/amazing-feature`
7. Open Pull Request

### Code Quality
```bash
# Backend
cd backend && python -m pytest && python -m black . && python -m ruff check .

# Frontend
cd frontend && npm run lint && npm run test && npm run build
```

---

## 📄 License

MIT License - see LICENSE file for details.

---

## 🙏 Acknowledgments

- DataTalks.Club AI Dev Tools Zoomcamp for project structure
- FastAPI, React, MongoDB communities
- Linear & Notion for design inspiration