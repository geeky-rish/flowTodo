# FlowTodo Product Specification

## Problem Statement

Individuals and small teams struggle to manage tasks effectively across multiple contexts (work, personal, study, health) because existing tools either:
- Lack calendar-centric views for time-blocking
- Don't provide actionable productivity analytics
- Have clunky, non-intuitive interfaces
- Don't integrate task management with visual scheduling

**FlowTodo** solves this by combining a calendar-centric task manager with productivity analytics in a clean, Linear/Notion-inspired interface.

---

## Target Users

- **Primary**: Knowledge workers, students, freelancers who juggle multiple projects
- **Secondary**: Small teams wanting lightweight task coordination
- **Tertiary**: Anyone wanting to visualize their productivity patterns

---

## Core Features & Acceptance Criteria

### 1. Authentication & User Management

| ID | Feature | Acceptance Criteria |
|----|---------|---------------------|
| AUTH-01 | User Registration | User can register with username, email, password; receives JWT token; default categories created |
| AUTH-02 | User Login | User can login with username/email + password; receives JWT token |
| AUTH-03 | Session Persistence | Token stored in localStorage; auto-refresh on app load; logout clears token |
| AUTH-04 | Protected Routes | Unauthenticated users redirected to /login; authenticated users redirected from /login to / |

### 2. Task Management

| ID | Feature | Acceptance Criteria |
|----|---------|---------------------|
| TASK-01 | Create Task | User can create task with title, description, due date/time, priority, category, tags, reminders |
| TASK-02 | List Tasks | User can view paginated, filterable, sortable list of their tasks |
| TASK-03 | View Task | User can view single task details |
| TASK-04 | Update Task | User can update any task field; updated_at timestamp updates |
| TASK-05 | Delete Task | User can delete task; returns success confirmation |
| TASK-06 | Toggle Complete | User can mark task complete/incomplete; completed_at timestamp set/cleared; status toggles |
| TASK-07 | Date-based View | User can view tasks for a specific date (YYYY-MM-DD) |
| TASK-08 | Task Filters | Filter by status, priority, category, tag, search text |
| TASK-09 | Task Sorting | Sort by created_at, due_date, priority, title (asc/desc) |
| TASK-10 | Data Isolation | Users only see their own tasks (enforced at API level) |

### 3. Category Management

| ID | Feature | Acceptance Criteria |
|----|---------|---------------------|
| CAT-01 | Default Categories | New users get 5 default categories (Personal, Work, Study, Projects, Health) |
| CAT-02 | List Categories | User sees categories with task counts |
| CAT-03 | Create Category | User can create custom category with name, color, icon |
| CAT-04 | Update Category | User can update category name, color, icon |
| CAT-05 | Delete Category | User can delete custom category (not defaults); tasks keep category name as string |

### 4. Calendar View

| ID | Feature | Acceptance Criteria |
|----|---------|---------------------|
| CAL-01 | Month Grid | Interactive calendar showing current month with day cells |
| CAL-02 | Task Counters | Each day shows count of tasks due |
| CAL-03 | Date Selection | Click day to view tasks for that date |
| CAL-04 | Navigation | Previous/next month, today button |
| CAL-05 | Visual Indicators | Overdue days highlighted; today highlighted |

### 5. Today View (Dashboard)

| ID | Feature | Acceptance Criteria |
|----|---------|---------------------|
| TODAY-01 | Time Sections | Tasks grouped: Morning (6-12), Afternoon (12-17), Evening (17-22), Flexible (no time) |
| TODAY-02 | Overdue Alert | Overdue tasks shown prominently at top |
| TODAY-03 | Quick Actions | Complete, edit, delete from today view |
| TODAY-04 | Stats Summary | Key stats: due today, completed today, overdue, streak |

### 6. Upcoming View

| ID | Feature | Acceptance Criteria |
|----|---------|---------------------|
| UP-01 | Future Tasks | Tasks with due dates grouped by date |
| UP-02 | Date Headers | Each date section shows day name, date, task count |
| UP-03 | Empty States | Friendly messaging when no upcoming tasks |

### 7. Tasks View (List)

| ID | Feature | Acceptance Criteria |
|----|---------|---------------------|
| TSK-01 | Master List | All tasks in sortable, filterable table/list |
| TSK-02 | Bulk Actions | Select multiple tasks for bulk complete/delete |
| TSK-03 | Inline Edit | Quick edit priority, status, category from list |

### 8. Completed View

| ID | Feature | Acceptance Criteria |
|----|---------|---------------------|
| CMP-01 | History | Chronological list of completed tasks |
| CMP-02 | Filters | Filter by date range, category |
| CMP-03 | Restore | Option to mark incomplete (move back to active) |

### 9. Statistics & Analytics

| ID | Feature | Acceptance Criteria |
|----|---------|---------------------|
| STAT-01 | Overview Cards | Total tasks, completed today, due today, overdue, streak |
| STAT-02 | Completion Rate | Overall and high-priority completion rates |
| STAT-03 | 14-Day Chart | Bar chart: daily completed vs created |
| STAT-04 | Category Distribution | Pie/donut chart: tasks by category |
| STAT-05 | Weekly Velocity | Tasks completed per week trend |
| STAT-06 | Priority Breakdown | Stacked bar: priority distribution |

### 10. Settings

| ID | Feature | Acceptance Criteria |
|----|---------|---------------------|
| SET-01 | Theme | Light/Dark/System preference; persists in localStorage |
| SET-02 | Profile | View username, email, member since |
| SET-03 | Danger Zone | Delete account (cascades to tasks, categories) |

---

## Non-Functional Requirements

### Performance
- API response time < 200ms for 95th percentile
- Frontend load time < 3s on 3G
- Support 10,000+ tasks per user without degradation

### Security
- JWT tokens with 60-min expiry
- Passwords hashed with Argon2 (via pwdlib)
- CORS configured for known origins only
- Input validation on all endpoints
- No sensitive data in logs

### Reliability
- 99.9% uptime target
- Graceful degradation if MongoDB unavailable
- Health check endpoints for all services
- Automated backups for production MongoDB

### Accessibility
- WCAG 2.1 AA compliance
- Keyboard navigation for all interactive elements
- Semantic HTML, ARIA labels where needed
- Color contrast ratios met in both themes

### Browser Support
- Chrome 120+, Firefox 120+, Safari 17+, Edge 120+

---

## Data Model

### User
```json
{
  "_id": "ObjectId",
  "username": "string (unique, lowercase)",
  "email": "string (unique, lowercase, optional)",
  "password_hash": "string (argon2)",
  "created_at": "datetime"
}
```

### Task
```json
{
  "_id": "ObjectId",
  "user_id": "ObjectId (ref: User)",
  "title": "string (1-500 chars)",
  "description": "string (optional, max 5000)",
  "due_date": "string (YYYY-MM-DD, optional)",
  "due_time": "string (HH:MM, optional)",
  "priority": "enum: low|medium|high",
  "status": "enum: todo|in_progress|completed",
  "category": "string (optional, max 100)",
  "tags": "array of strings",
  "reminder_date": "string (YYYY-MM-DD, optional)",
  "reminder_time": "string (HH:MM, optional)",
  "created_at": "datetime",
  "updated_at": "datetime",
  "completed_at": "datetime (optional)"
}
```

### Category
```json
{
  "_id": "ObjectId",
  "user_id": "ObjectId (ref: User)",
  "name": "string (1-100 chars, unique per user)",
  "color": "string (hex, e.g. #6366f1)",
  "icon": "string (optional, lucide icon name)",
  "created_at": "datetime"
}
```

---

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user profile

### Tasks
- `GET /api/tasks` - List tasks (with filters, pagination, sorting)
- `POST /api/tasks` - Create task
- `GET /api/tasks/date/{date}` - Get tasks by date
- `GET /api/tasks/{id}` - Get single task
- `PUT /api/tasks/{id}` - Update task
- `DELETE /api/tasks/{id}` - Delete task
- `PATCH /api/tasks/{id}/complete` - Toggle completion

### Categories
- `GET /api/categories` - List categories with task counts
- `POST /api/categories` - Create category
- `PUT /api/categories/{id}` - Update category
- `DELETE /api/categories/{id}` - Delete category

### Statistics
- `GET /api/stats` - Get productivity statistics

### Health
- `GET /api/health` - Health check

---

## UI/UX Requirements

### Design System
- **Colors**: CSS custom properties (design tokens) for light/dark themes
- **Typography**: System font stack, consistent scale
- **Spacing**: 4px base unit
- **Border Radius**: 8px default, 4px small, 12px large
- **Shadows**: 3 elevation levels
- **Icons**: Lucide React icons

### Responsive Breakpoints
- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

### Key Interactions
- Drag-and-drop task reordering (future)
- Keyboard shortcuts (/, n for new task, cmd+k for search)
- Optimistic UI updates
- Toast notifications for actions

---

## Task Tracker

**Public GitHub Project**: https://github.com/users/geeky-rish/projects/1 (or repository Issues)

### Issue Labels
- `type:feature` - New functionality
- `type:bug` - Defect
- `type:chore` - Maintenance
- `type:docs` - Documentation
- `area:backend` - Backend related
- `area:frontend` - Frontend related
- `area:devops` - Infrastructure
- `area:observability` - Monitoring/alerting
- `priority:high/medium/low` - Priority
- `status:ready` - Ready for work
- `status:in-progress` - Being worked on
- `status:review` - In code review
- `status:done` - Completed

### Milestones
- **M1: MVP** - Auth, Tasks, Categories, Calendar, Today view
- **M2: Analytics** - Stats page, charts, streak tracking
- **M3: Polish** - Settings, dark mode, accessibility, performance
- **M4: Production** - Deployment, observability, alerting, docs

---

## Acceptance Test Scenarios

### Scenario 1: New User Onboarding
1. User visits app → redirected to /login
2. User clicks "Register" → fills form → submits
3. User receives token, redirected to / (Today view)
4. Default categories visible in sidebar
5. Empty state shown (no tasks yet)

### Scenario 2: Task Lifecycle
1. User creates task "Finish report" with due date today, high priority, Work category
2. Task appears in Today view under Morning section
3. User clicks complete → task moves to completed, streak increments
4. Task appears in Completed view
5. Stats update: completed today +1, completion rate updates

### Scenario 3: Calendar Navigation
1. User navigates to Calendar page
2. Current month displayed with task counters
3. User clicks tomorrow → tasks for tomorrow shown
4. User clicks "Today" button → returns to current date

### Scenario 4: Cross-Device Sync
1. User creates task on desktop
2. User opens app on mobile (same account)
3. Task visible immediately (after refresh or real-time sync)

---

## Release Criteria

- [ ] All M1-M3 features implemented and tested
- [ ] Backend test coverage > 80%
- [ ] Frontend test coverage > 70%
- [ ] E2E tests for critical paths pass
- [ ] Docker Compose starts all services with one command
- [ ] CI/CD pipeline passes on main branch
- [ ] Application deployed and accessible at public URL
- [ ] Observability stack collecting metrics, logs, traces
- [ ] At least one alert configured and tested
- [ ] On-call agent responds to test alert
- [ ] README complete with all sections
- [ ] AI development documentation complete