import { cn, PRIORITY_CONFIG, STATUS_CONFIG, formatDate, formatTime, isOverdue, getCategoryIcon } from '@/utils';
import { Check, Circle, Trash2, Edit2, Clock, Tag, Flag } from 'lucide-react';
import type { Task } from '@/types';

interface TaskCardProps {
  task: Task;
  onToggle: (id: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  compact?: boolean;
}

export function TaskCard({ task, onToggle, onEdit, onDelete, compact = false }: TaskCardProps) {
  const isCompleted = task.status === 'completed';
  const overdue = isOverdue(task);
  const priority = PRIORITY_CONFIG[task.priority];

  return (
    <div
      className={cn(
        'card group flex items-start gap-3 p-4 hover:shadow-md transition-all duration-200 animate-fade-in',
        isCompleted && 'opacity-60',
        overdue && !isCompleted && 'border-red-200 dark:border-red-900'
      )}
    >
      {/* Completion toggle */}
      <button
        onClick={() => onToggle(task._id)}
        aria-label={isCompleted ? 'Mark incomplete' : 'Mark complete'}
        className={cn(
          'mt-0.5 flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200',
          isCompleted
            ? 'bg-emerald-500 border-emerald-500 text-white'
            : 'border-zinc-300 dark:border-zinc-600 hover:border-primary-500'
        )}
      >
        {isCompleted && <Check className="w-3 h-3" strokeWidth={3} />}
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p
            className={cn(
              'text-sm font-medium text-zinc-900 dark:text-zinc-100 leading-snug',
              isCompleted && 'line-through text-zinc-400 dark:text-zinc-500'
            )}
          >
            {task.title}
          </p>
          {/* Priority dot */}
          <span className={cn('flex-shrink-0 w-2 h-2 rounded-full mt-1.5', priority.dot)} />
        </div>

        {task.description && !compact && (
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2">
            {task.description}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-2 mt-2">
          {task.due_date && (
            <span
              className={cn(
                'flex items-center gap-1 text-xs',
                overdue && !isCompleted
                  ? 'text-red-600 dark:text-red-400 font-medium'
                  : 'text-zinc-400 dark:text-zinc-500'
              )}
            >
              <Clock className="w-3 h-3" />
              {formatDate(task.due_date)}
              {task.due_time && ` · ${formatTime(task.due_time)}`}
            </span>
          )}

          {task.category && (
            <span className="flex items-center gap-1 text-xs text-zinc-400 dark:text-zinc-500">
              {task.category}
            </span>
          )}

          {task.tags.slice(0, 2).map((tag) => (
            <span key={tag} className="text-xs px-1.5 py-0.5 bg-primary-50 dark:bg-primary-950 text-primary-600 dark:text-primary-400 rounded font-mono">
              #{tag}
            </span>
          ))}
          {task.tags.length > 2 && (
            <span className="text-xs text-zinc-400">+{task.tags.length - 2}</span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex-shrink-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => onEdit(task)}
          aria-label="Edit task"
          className="p-1.5 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
        >
          <Edit2 className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => onDelete(task._id)}
          aria-label="Delete task"
          className="p-1.5 rounded-md hover:bg-red-50 dark:hover:bg-red-950 text-zinc-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

// ── Skeleton Card ────────────────────────────────────────────────────────────

export function TaskCardSkeleton() {
  return (
    <div className="card p-4 space-y-3 animate-pulse">
      <div className="flex gap-3">
        <div className="skeleton w-5 h-5 rounded-full flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="skeleton h-4 w-3/4 rounded" />
          <div className="skeleton h-3 w-1/2 rounded" />
        </div>
      </div>
    </div>
  );
}
