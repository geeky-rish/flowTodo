import { useMemo } from 'react';
import { format, addDays, isToday, isTomorrow, parseISO } from 'date-fns';
import { Clock, Plus } from 'lucide-react';
import { useTasks } from '@/hooks/useTasks';
import { TaskCard, TaskCardSkeleton } from '@/components/TaskCard';
import { getTodayISO, isOverdue } from '@/utils';
import type { Task } from '@/types';

interface UpcomingPageProps {
  onAddTask: (date?: string) => void;
  onEditTask: (task: Task) => void;
}

function groupByDate(tasks: Task[]): Map<string, Task[]> {
  const groups = new Map<string, Task[]>();
  for (const task of tasks) {
    const key = task.due_date || 'no-date';
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(task);
  }
  return groups;
}

function getGroupLabel(dateStr: string): string {
  if (dateStr === 'no-date') return 'No Date';
  const d = parseISO(dateStr);
  if (isToday(d)) return 'Today';
  if (isTomorrow(d)) return 'Tomorrow';
  return format(d, 'EEEE, MMMM d');
}

export function UpcomingPage({ onAddTask, onEditTask }: UpcomingPageProps) {
  const today = getTodayISO();
  const { tasks, loading, toggleComplete, deleteTask } = useTasks({
    sort_by: 'due_date',
    sort_order: 1,
  });

  const upcomingTasks = useMemo(() =>
    tasks.filter((t) => t.status !== 'completed' && t.due_date && t.due_date >= today),
    [tasks, today]
  );

  const groups = useMemo(() => groupByDate(upcomingTasks), [upcomingTasks]);
  const sortedKeys = Array.from(groups.keys()).sort();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary-600" />
            Upcoming
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">{upcomingTasks.length} tasks scheduled</p>
        </div>
        <button onClick={() => onAddTask()} className="btn-primary text-sm">
          <Plus className="w-4 h-4" />Add Task
        </button>
      </div>

      {loading ? (
        <div className="space-y-2">{[1, 2, 3, 4].map((i) => <TaskCardSkeleton key={i} />)}</div>
      ) : upcomingTasks.length === 0 ? (
        <div className="card p-12 text-center">
          <Clock className="w-12 h-12 text-zinc-300 dark:text-zinc-600 mx-auto mb-4" />
          <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">No upcoming tasks</p>
          <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">Plan ahead and add tasks with future dates.</p>
          <button onClick={() => onAddTask()} className="btn-primary mt-4 text-xs">
            <Plus className="w-3.5 h-3.5" />Add Task
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {sortedKeys.map((dateKey) => {
            const group = groups.get(dateKey)!;
            return (
              <div key={dateKey}>
                <div className="flex items-center gap-3 mb-3">
                  <div>
                    <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 uppercase tracking-wide">
                      {getGroupLabel(dateKey)}
                    </p>
                    <p className="text-xs text-zinc-400">{group.length} task{group.length !== 1 ? 's' : ''}</p>
                  </div>
                  <div className="flex-1 h-px bg-zinc-100 dark:bg-zinc-800" />
                  <button
                    onClick={() => onAddTask(dateKey !== 'no-date' ? dateKey : undefined)}
                    className="text-xs text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />Add
                  </button>
                </div>
                <div className="space-y-2">
                  {group.map((task) => (
                    <TaskCard
                      key={task._id}
                      task={task}
                      onToggle={toggleComplete}
                      onEdit={onEditTask}
                      onDelete={deleteTask}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
