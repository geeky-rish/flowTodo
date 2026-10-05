import { useEffect, useRef, useState } from 'react';
import { X, Calendar, Clock, Flag, Tag, AlignLeft, Plus, Loader2 } from 'lucide-react';
import { cn } from '@/utils';
import type { Task, TaskCreate, TaskUpdate, Category, Priority, TaskStatus } from '@/types';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: TaskCreate | TaskUpdate) => Promise<void>;
  task?: Task | null;
  categories: Category[];
  defaultDate?: string;
}

const PRIORITIES: { value: Priority; label: string; color: string }[] = [
  { value: 'high', label: 'High', color: 'text-red-600 dark:text-red-400' },
  { value: 'medium', label: 'Medium', color: 'text-amber-600 dark:text-amber-400' },
  { value: 'low', label: 'Low', color: 'text-emerald-600 dark:text-emerald-400' },
];

const STATUSES: { value: TaskStatus; label: string }[] = [
  { value: 'todo', label: 'To Do' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
];

export function TaskModal({ isOpen, onClose, onSave, task, categories, defaultDate }: TaskModalProps) {
  const titleRef = useRef<HTMLInputElement>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tagInput, setTagInput] = useState('');

  const [form, setForm] = useState<TaskCreate>({
    title: '',
    description: '',
    due_date: defaultDate || '',
    due_time: '',
    priority: 'medium',
    status: 'todo',
    category: '',
    tags: [],
    reminder_date: '',
    reminder_time: '',
  });

  // Populate form when editing
  useEffect(() => {
    if (task) {
      setForm({
        title: task.title,
        description: task.description || '',
        due_date: task.due_date || '',
        due_time: task.due_time || '',
        priority: task.priority,
        status: task.status,
        category: task.category || '',
        tags: task.tags || [],
        reminder_date: task.reminder_date || '',
        reminder_time: task.reminder_time || '',
      });
    } else {
      setForm({
        title: '',
        description: '',
        due_date: defaultDate || '',
        due_time: '',
        priority: 'medium',
        status: 'todo',
        category: '',
        tags: [],
        reminder_date: '',
        reminder_time: '',
      });
    }
    setError(null);
    setTagInput('');
  }, [task, isOpen, defaultDate]);

  // Focus title on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => titleRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Keyboard: Escape to close
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    setSaving(true);
    setError(null);
    try {
      const payload = {
        ...form,
        title: form.title.trim(),
        description: form.description || undefined,
        due_date: form.due_date || undefined,
        due_time: form.due_time || undefined,
        category: form.category || undefined,
        reminder_date: form.reminder_date || undefined,
        reminder_time: form.reminder_time || undefined,
      };
      await onSave(payload);
      onClose();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const addTag = () => {
    const tag = tagInput.trim().toLowerCase().replace(/^#/, '');
    if (tag && !form.tags?.includes(tag)) {
      setForm((f) => ({ ...f, tags: [...(f.tags || []), tag] }));
    }
    setTagInput('');
  };

  const removeTag = (tag: string) => {
    setForm((f) => ({ ...f, tags: (f.tags || []).filter((t) => t !== tag) }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4" role="dialog" aria-modal="true" aria-label={task ? 'Edit task' : 'Create task'}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full sm:max-w-lg bg-white dark:bg-surface-850 rounded-t-2xl sm:rounded-2xl shadow-2xl animate-slide-up max-h-[90vh] overflow-y-auto border border-zinc-200 dark:border-zinc-700">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-zinc-100 dark:border-zinc-800">
          <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
            {task ? 'Edit Task' : 'New Task'}
          </h2>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
          {/* Title */}
          <div>
            <input
              ref={titleRef}
              id="task-title"
              type="text"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="Task title..."
              className="w-full text-base font-medium bg-transparent border-0 border-b-2 border-zinc-200 dark:border-zinc-700 focus:border-primary-500 dark:focus:border-primary-400 rounded-none pb-2 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none transition-colors"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="label" htmlFor="task-desc">
              <AlignLeft className="w-3 h-3 inline mr-1" />Description
            </label>
            <textarea
              id="task-desc"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="Add a description..."
              rows={2}
              className="input resize-none"
            />
          </div>

          {/* Date + Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label" htmlFor="task-date">
                <Calendar className="w-3 h-3 inline mr-1" />Due Date
              </label>
              <input
                id="task-date"
                type="date"
                value={form.due_date}
                onChange={(e) => setForm((f) => ({ ...f, due_date: e.target.value }))}
                className="input"
              />
            </div>
            <div>
              <label className="label" htmlFor="task-time">
                <Clock className="w-3 h-3 inline mr-1" />Due Time
              </label>
              <input
                id="task-time"
                type="time"
                value={form.due_time}
                onChange={(e) => setForm((f) => ({ ...f, due_time: e.target.value }))}
                className="input"
              />
            </div>
          </div>

          {/* Priority + Status */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label" htmlFor="task-priority">
                <Flag className="w-3 h-3 inline mr-1" />Priority
              </label>
              <select
                id="task-priority"
                value={form.priority}
                onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value as Priority }))}
                className="input"
              >
                {PRIORITIES.map((p) => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label" htmlFor="task-status">Status</label>
              <select
                id="task-status"
                value={form.status}
                onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as TaskStatus }))}
                className="input"
              >
                {STATUSES.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="label" htmlFor="task-category">Category</label>
            <select
              id="task-category"
              value={form.category}
              onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
              className="input"
            >
              <option value="">No category</option>
              {categories.map((c) => (
                <option key={c._id} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Tags */}
          <div>
            <label className="label">
              <Tag className="w-3 h-3 inline mr-1" />Tags
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {(form.tags || []).map((tag) => (
                <span key={tag} className="flex items-center gap-1 text-xs px-2 py-0.5 bg-primary-50 dark:bg-primary-950 text-primary-600 dark:text-primary-400 rounded-full font-mono">
                  #{tag}
                  <button type="button" onClick={() => removeTag(tag)} className="hover:text-red-500 transition-colors" aria-label={`Remove tag ${tag}`}>×</button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ',') {
                    e.preventDefault();
                    addTag();
                  }
                }}
                placeholder="Add tag..."
                className="input flex-1 text-xs"
                aria-label="Add tag"
              />
              <button type="button" onClick={addTag} className="btn-secondary px-3 py-2">
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Reminder */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label" htmlFor="reminder-date">Reminder Date</label>
              <input
                id="reminder-date"
                type="date"
                value={form.reminder_date}
                onChange={(e) => setForm((f) => ({ ...f, reminder_date: e.target.value }))}
                className="input"
              />
            </div>
            <div>
              <label className="label" htmlFor="reminder-time">Reminder Time</label>
              <input
                id="reminder-time"
                type="time"
                value={form.reminder_time}
                onChange={(e) => setForm((f) => ({ ...f, reminder_time: e.target.value }))}
                className="input"
              />
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-600 dark:text-red-400">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={saving || !form.title.trim()} className="btn-primary">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {task ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
