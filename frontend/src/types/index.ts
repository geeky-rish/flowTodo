// ── Task Types ──────────────────────────────────────────────────────────────

export type Priority = 'low' | 'medium' | 'high';
export type TaskStatus = 'todo' | 'in_progress' | 'completed';

export interface Task {
  _id: string;
  title: string;
  description?: string;
  due_date?: string;       // YYYY-MM-DD
  due_time?: string;       // HH:MM
  priority: Priority;
  status: TaskStatus;
  category?: string;
  tags: string[];
  reminder_date?: string;
  reminder_time?: string;
  created_at: string;
  updated_at: string;
  completed_at?: string;
}

export interface TaskCreate {
  title: string;
  description?: string;
  due_date?: string;
  due_time?: string;
  priority: Priority;
  status?: TaskStatus;
  category?: string;
  tags?: string[];
  reminder_date?: string;
  reminder_time?: string;
}

export interface TaskUpdate extends Partial<TaskCreate> {}

export interface TaskListResponse {
  tasks: Task[];
  total: number;
}

export interface TaskFilters {
  status?: TaskStatus | '';
  priority?: Priority | '';
  category?: string;
  tag?: string;
  search?: string;
  sort_by?: string;
  sort_order?: 1 | -1;
}

// ── Category Types ──────────────────────────────────────────────────────────

export interface Category {
  _id: string;
  name: string;
  color: string;
  icon?: string;
  task_count: number;
  created_at: string;
}

export interface CategoryCreate {
  name: string;
  color: string;
  icon?: string;
}

// ── Stats Types ─────────────────────────────────────────────────────────────

export interface DailyStats {
  date: string;
  completed: number;
  created: number;
}

export interface Stats {
  total_tasks: number;
  completed_today: number;
  due_today: number;
  overdue: number;
  completed_this_week: number;
  completed_this_month: number;
  completion_rate: number;
  high_priority_completion_rate: number;
  daily_stats: DailyStats[];
  streak: number;
}

// ── UI Types ────────────────────────────────────────────────────────────────

export type Theme = 'light' | 'dark' | 'system';

export interface NavItem {
  label: string;
  path: string;
  icon: string;
}
