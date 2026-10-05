import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, isToday, isTomorrow, isYesterday, isPast, parseISO } from 'date-fns';
import type { Task, Priority, TaskStatus } from '@/types';

// ── Class Utility ──────────────────────────────────────────────────────────

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ── Date Utilities ─────────────────────────────────────────────────────────

export function formatDate(dateStr: string | undefined): string {
  if (!dateStr) return '';
  try {
    const d = parseISO(dateStr);
    if (isToday(d)) return 'Today';
    if (isTomorrow(d)) return 'Tomorrow';
    if (isYesterday(d)) return 'Yesterday';
    return format(d, 'MMM d, yyyy');
  } catch {
    return dateStr;
  }
}

export function formatTime(timeStr: string | undefined): string {
  if (!timeStr) return '';
  try {
    const [hours, minutes] = timeStr.split(':').map(Number);
    const d = new Date();
    d.setHours(hours, minutes);
    return format(d, 'h:mm a');
  } catch {
    return timeStr;
  }
}

export function isOverdue(task: Task): boolean {
  if (!task.due_date || task.status === 'completed') return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = parseISO(task.due_date);
  return due < today;
}

export function getDueDateLabel(task: Task): string {
  if (!task.due_date) return '';
  if (isOverdue(task)) return 'Overdue';
  return formatDate(task.due_date);
}

export function getTodayISO(): string {
  return format(new Date(), 'yyyy-MM-dd');
}

export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export function getTimeOfDay(timeStr: string | undefined): 'morning' | 'afternoon' | 'evening' | 'none' {
  if (!timeStr) return 'none';
  const [hours] = timeStr.split(':').map(Number);
  if (hours < 12) return 'morning';
  if (hours < 17) return 'afternoon';
  return 'evening';
}

// ── Priority Utilities ─────────────────────────────────────────────────────

export const PRIORITY_CONFIG: Record<Priority, { label: string; color: string; dot: string }> = {
  high: { label: 'High', color: 'badge-high', dot: 'bg-red-500' },
  medium: { label: 'Medium', color: 'badge-medium', dot: 'bg-amber-500' },
  low: { label: 'Low', color: 'badge-low', dot: 'bg-emerald-500' },
};

export const STATUS_CONFIG: Record<TaskStatus, { label: string; color: string }> = {
  todo: { label: 'To Do', color: 'badge-todo' },
  in_progress: { label: 'In Progress', color: 'badge-in_progress' },
  completed: { label: 'Completed', color: 'badge-completed' },
};

// ── Category Utilities ─────────────────────────────────────────────────────

export const CATEGORY_ICONS: Record<string, string> = {
  user: '👤',
  briefcase: '💼',
  book: '📚',
  folder: '📁',
  heart: '❤️',
};

export function getCategoryIcon(icon: string | undefined): string {
  if (!icon) return '📋';
  return CATEGORY_ICONS[icon] || '📋';
}

// ── Theme Utilities ────────────────────────────────────────────────────────

export function getSystemTheme(): 'light' | 'dark' {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

// ── Stats Utilities ────────────────────────────────────────────────────────

export function calcProgressPercent(done: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((done / total) * 100);
}
