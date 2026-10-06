import axios, { AxiosError } from 'axios';
import type {
  Task, TaskCreate, TaskUpdate, TaskListResponse, TaskFilters,
  Category, CategoryCreate, Stats,
} from '@/types';

const BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// ── Error Handling ──────────────────────────────────────────────────────────

api.interceptors.response.use(
  (res) => res,
  (error: AxiosError) => {
    const detail = (error.response?.data as any)?.detail;
    const message =
      typeof detail === 'string'
        ? detail
        : Array.isArray(detail)
        ? detail.map((e: any) => e.msg).join(', ')
        : error.message || 'An unexpected error occurred';
    return Promise.reject(new Error(message));
  }
);

// ── Health ──────────────────────────────────────────────────────────────────

export const checkHealth = () =>
  api.get<{ status: string; service: string }>('/health').then((r) => r.data);

// ── Tasks ───────────────────────────────────────────────────────────────────

export const taskApi = {
  list: (filters: TaskFilters = {}) => {
    const params: Record<string, any> = {};
    if (filters.status) params.status = filters.status;
    if (filters.priority) params.priority = filters.priority;
    if (filters.category) params.category = filters.category;
    if (filters.tag) params.tag = filters.tag;
    if (filters.search) params.search = filters.search;
    if (filters.sort_by) params.sort_by = filters.sort_by;
    if (filters.sort_order !== undefined) params.sort_order = filters.sort_order;
    return api.get<TaskListResponse>('/tasks', { params }).then((r) => r.data);
  },

  get: (id: string) =>
    api.get<Task>(`/tasks/${id}`).then((r) => r.data),

  create: (data: TaskCreate) =>
    api.post<Task>('/tasks', data).then((r) => r.data),

  update: (id: string, data: TaskUpdate) =>
    api.put<Task>(`/tasks/${id}`, data).then((r) => r.data),

  delete: (id: string) =>
    api.delete(`/tasks/${id}`).then((r) => r.data),

  complete: (id: string) =>
    api.patch<Task>(`/tasks/${id}/complete`).then((r) => r.data),

  byDate: (date: string) =>
    api.get<TaskListResponse>(`/tasks/date/${date}`).then((r) => r.data),
};

// ── Categories ──────────────────────────────────────────────────────────────

export const categoryApi = {
  list: () =>
    api.get<Category[]>('/categories').then((r) => r.data),

  create: (data: CategoryCreate) =>
    api.post<Category>('/categories', data).then((r) => r.data),

  update: (id: string, data: Partial<CategoryCreate>) =>
    api.put<Category>(`/categories/${id}`, data).then((r) => r.data),

  delete: (id: string) =>
    api.delete(`/categories/${id}`).then((r) => r.data),
};

// ── Stats ───────────────────────────────────────────────────────────────────

export const statsApi = {
  get: () => api.get<Stats>('/stats').then((r) => r.data),
};
