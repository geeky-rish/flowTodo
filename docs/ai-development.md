# AI Development Documentation

This document covers the AI tools, prompts, workflows, and practices used during the development of FlowTodo.

---

## 🛠️ AI Tools Used

### Primary Tools
- **Claude Code (Claude Opus 5.5)** - Main development agent for code generation, refactoring, testing, and documentation
- **GitHub Copilot** - IDE autocomplete and inline suggestions
- **Claude API** - For specific code analysis tasks

### Supporting Tools
- **pytest** - Test execution and validation
- **Playwright** - E2E test automation
- **Docker** - Containerization verification
- **GitHub Actions** - CI/CD pipeline validation

---

## 🎯 Development Workflow

### 1. Project Initialization
```
User: "Complete the DataTalks.Club AI Dev Tools Zoomcamp final project in this repository"
Agent: 
  1. Cloned repository and analyzed existing structure
  2. Read official project requirements (12 criteria, 24 points)
  3. Created implementation plan mapping requirements to tasks
  4. Started implementing missing components systematically
```

### 2. Requirements Analysis
The project requirements (from DataTalks.Club) specify 12 criteria:
1. **Problem Description** (2 pts) - README clearly describes problem
2. **Product Specification** (2 pts) - SPEC.md with public task tracker
3. **Agent Team Specification** (2 pts) - AGENTS.md with roles & process
4. **Context Management** (2 pts) - AGENTS.md + modular docs
5. **Application** (2 pts) - Full-stack working end-to-end
6. **Testing** (2 pts) - Unit + integration + E2E tests
7. **Containerization** (2 pts) - Docker Compose with single command
8. **Deployment** (2 pts) - Public URL or clear demo
9. **CI/CD** (3 pts) - Tests + CD + manual prod deploy
10. **Observability** (2 pts) - Metrics, traces, logs with trace ID
11. **Alerting** (1 pt) - At least one alert
12. **On-Call Agent** (2 pts) - Agent wakes on alert and fixes issue

**Target**: 10/24 points to pass

### 3. Implementation Strategy

#### Phase 1: Core Infrastructure (Completed)
- Added MongoDB to docker-compose.yml
- Created AGENTS.md for context management
- Created SPEC.md with detailed requirements
- Updated .env.example with all required variables

#### Phase 2: Observability Stack (Completed)
- Added OpenTelemetry instrumentation
- Structured logging with trace IDs (structlog)
- Prometheus metrics (request, DB, business)
- Grafana dashboards with provisioning
- Prometheus alert rules (10 alerts)
- Alertmanager configuration
- On-call agent with automated remediation

#### Phase 3: Testing (Completed)
- Backend: pytest with async support, 80%+ coverage target
- Frontend: Vitest for unit tests, Playwright for E2E
- CI/CD runs all test suites

#### Phase 4: CI/CD & Deployment (Completed)
- GitHub Actions: test → build → push → deploy
- Removed self-hosted runner dependency
- Multi-stage Docker builds with caching
- Staging (PR) and Production (main) deployments

#### Phase 5: Documentation (Completed)
- Comprehensive README with all sections
- AI development documentation (this file)
- API documentation via OpenAPI

---

## 📝 Key Prompts & Patterns Used

### Prompt Pattern 1: Structured Implementation
```
"Implement X based on requirements Y. Follow existing code patterns in Z.
Requirements:
- A
- B
- C
Use existing files: [list]
Create new files: [list]"
```

### Prompt Pattern 2: Test-First Development
```
"Write tests for X functionality. Use existing test patterns in Y.
Cover: happy path, edge cases, error conditions.
Run tests and fix any failures."
```

### Prompt Pattern 3: Code Review & Fix
```
"Review the changes in X for:
1. Correctness bugs
2. Security issues
3. Performance concerns
4. Code style consistency
Apply fixes directly."
```

### Prompt Pattern 4: Documentation Generation
```
"Create comprehensive documentation for X covering:
- Architecture
- Setup & execution
- API endpoints
- Configuration
- Troubleshooting
Follow the style of existing docs."
```

---

## 🔄 Agent Collaboration Patterns

### Context Handoff
Each agent maintains context in:
- `AGENTS.md` - Team structure and process
- `SPEC.md` - Product requirements
- `docs/adr/` - Architectural decisions
- GitHub Issues - Task tracking with acceptance criteria
- Code comments - Implementation details

### Workflow
1. **Product Manager Agent** → Creates/updates SPEC.md and GitHub Issues
2. **Backend/Frontend Engineers** → Pick up issues, implement features
3. **QA Engineer** → Writes tests for new features
4. **DevOps Engineer** → Ensures CI/CD passes, handles deployment
5. **Observability Engineer** → Instruments new code, updates alerts
6. All agents review each other's PRs

---

## 🧪 Verification & Quality Assurance

### Automated Checks (CI Pipeline)
```yaml
# Backend
- pytest with coverage
- Type checking (mypy if configured)
- Linting (ruff)

# Frontend
- vitest unit tests
- Playwright E2E tests
- TypeScript compilation
- ESLint/Oxlint

# Docker
- Multi-stage build verification
- Health check validation
```

### Manual Verification Steps
1. **Local Development**: `docker-compose up --build`
2. **API Testing**: `curl http://localhost:8000/api/health`
3. **Frontend Access**: `http://localhost:5173`
4. **Observability**: `http://localhost:9090` (Prometheus), `http://localhost:3000` (Grafana)
5. **Alert Testing**: Trigger test alert via Alertmanager API

---

## 📋 Code Review Checklist

### Backend
- [ ] All endpoints have input validation (Pydantic)
- [ ] Authentication required for protected routes
- [ ] Database queries use indexes
- [ ] Error handling returns appropriate status codes
- [ ] Structured logging with trace IDs
- [ ] Metrics recorded for key operations
- [ ] Tests cover happy path + edge cases

### Frontend
- [ ] Components are typed with TypeScript
- [ ] API calls use centralized service layer
- [ ] Error boundaries for graceful degradation
- [ ] Accessibility attributes (ARIA, semantic HTML)
- [ ] Responsive design works on mobile/tablet/desktop
- [ ] Unit tests for hooks and utilities
- [ ] E2E tests for critical user journeys

### Infrastructure
- [ ] Docker images build successfully
- [ ] Health checks pass for all services
- [ ] Secrets not committed (use .env)
- [ ] Resource limits set in docker-compose
- [ ] Alert rules have runbook URLs
- [ ] On-call agent handles test alerts

---

## 🚀 Deployment Checklist

### Pre-Deploy
- [ ] All tests pass in CI
- [ ] Docker images built and pushed to GHCR
- [ ] Environment variables configured for target
- [ ] Database migrations (if any) ready
- [ ] Rollback plan documented

### Deploy
- [ ] Pull new images on target server
- [ ] `docker-compose up -d`
- [ ] Wait for health checks
- [ ] Run smoke tests against deployed URL
- [ ] Verify metrics in Grafana

### Post-Deploy
- [ ] Monitor error rates for 10 minutes
- [ ] Verify alerts are firing correctly
- [ ] Update deployment status in GitHub
- [ ] Notify stakeholders

---

## 🎓 Lessons Learned

### What Worked Well
1. **Structured logging with trace IDs** - Made debugging distributed requests trivial
2. **OpenTelemetry auto-instrumentation** - Minimal code changes for full observability
3. **Docker Compose for local dev** - Single command starts entire stack
4. **Test-driven development** - Caught regressions early
5. **Agent team documentation** - Clear handoff points between work sessions

### Challenges Overcome
1. **Self-hosted runner in CI** - Replaced with cloud-agnostic deployment steps
2. **MongoDB in CI** - Used `supercharge/mongodb-github-action`
3. **Frontend E2E in CI** - Configured Playwright with webServer
4. **Trace ID propagation** - Implemented middleware + structlog contextvars

### Future Improvements
1. Add Kubernetes deployment manifests
2. Implement real-time updates (WebSockets/SSE)
3. Add database migration tooling
4. Implement feature flags
5. Add more granular alert routing

---

## 📚 References

- [DataTalks.Club Project Requirements](https://github.com/DataTalksClub/ai-dev-tools-zoomcamp/tree/main/project)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [OpenTelemetry Python](https://opentelemetry.io/docs/instrumentation/python/)
- [Prometheus Alerting](https://prometheus.io/docs/alerting/latest/)
- [Grafana Provisioning](https://grafana.com/docs/grafana/latest/administration/provisioning/)
- [Playwright Testing](https://playwright.dev/docs/intro)
- [Vitest Guide](https://vitest.dev/guide/)