import { Sun, Plus, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useTasks } from '@/hooks/useTasks';
import { TaskCard, TaskCardSkeleton } from '@/components/TaskCard';
import { getTodayISO, getTimeOfDay, isOverdue, formatTime } from '@/utils';
import type { Task } from '@/types';

interface TodayPageProps {
  onAddTask: (date?: string) => void;
  onEditTask: (task: Task) => void;
}

function TimeSection({ label, tasks, onToggle, onEdit, onDelete }: {
  label: string;
  tasks: Task[];
  onToggle: (id: string) => void;
  onEdit: (t: Task) => void;
  onDelete: (id: string) => void;
}) {
  if (tasks.length === 0) return null;
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">{label}</p>
        <div className="flex-1 h-px bg-zinc-100 dark:bg-zinc-800" />
        <span className="text-xs text-zinc-400">{tasks.length}</span>
      </div>
      <div className="space-y-2">
        {tasks.map((task) => (
          <TaskCard key={task._id} task={task} onToggle={onToggle} onEdit={onEdit} onDelete={onDelete} />
        ))}
      </div>
    </div>
  );
}

export function TodayPage({ onAddTask, onEditTask }: TodayPageProps) {
  const today = getTodayISO();
  const { tasks, loading, toggleComplete, deleteTask } = useTasks({ sort_by: 'due_time', sort_order: 1 });

  const overdue = tasks.filter((t) => isOverdue(t));
  const todayTasks = tasks.filter((t) => t.due_date === today);
  const completed = todayTasks.filter((t) => t.status === 'completed');
  const pending = todayTasks.filter((t) => t.status !== 'completed');

  const morning = pending.filter((t) => getTimeOfDay(t.due_time) === 'morning');
  const afternoon = pending.filter((t) => getTimeOfDay(t.due_time) === 'afternoon');
  const evening = pending.filter((t) => getTimeOfDay(t.due_time) === 'evening');
  const noTime = pending.filter((t) => getTimeOfDay(t.due_time) === 'none');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Sun className="w-5 h-5 text-amber-500" />
            Today
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
            {pending.length} remaining · {completed.length} done
          </p>
        </div>
        <button onClick={() => onAddTask(today)} className="btn-primary text-sm">
          <Plus className="w-4 h-4" />Add Task
        </button>
      </div>

      {/* Overdue */}
      {overdue.length > 0 && (
        <div className="card p-4 border-red-200 dark:border-red-900">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4 text-red-500" />
            <p className="text-sm font-semibold text-red-600 dark:text-red-400">Overdue ({overdue.length})</p>
          </div>
          <div className="space-y-2">
            {overdue.map((task) => (
              <TaskCard key={task._id} task={task} onToggle={toggleComplete} onEdit={onEditTask} onDelete={deleteTask} />
            ))}
          </div>
        </div>
      )}

      {loading ? (
        <div className="space-y-2">{[1, 2, 3].map((i) => <TaskCardSkeleton key={i} />)}</div>
      ) : todayTasks.length === 0 && overdue.length === 0 ? (
        <div className="card p-12 text-center">
          <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
          <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">No tasks today</p>
          <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">Your schedule is clear. Enjoy the free time.</p>
          <button onClick={() => onAddTask(today)} className="btn-primary mt-4 text-xs">
            <Plus className="w-3.5 h-3.5" />Add Task
          </button>
        </div>
      ) : (
        <div className="space-y-5">
          <TimeSection label="Morning" tasks={morning} onToggle={toggleComplete} onEdit={onEditTask} onDelete={deleteTask} />
          <TimeSection label="Afternoon" tasks={afternoon} onToggle={toggleComplete} onEdit={onEditTask} onDelete={deleteTask} />
          <TimeSection label="Evening" tasks={evening} onToggle={toggleComplete} onEdit={onEditTask} onDelete={deleteTask} />
          <TimeSection label="No time set" tasks={noTime} onToggle={toggleComplete} onEdit={onEditTask} onDelete={deleteTask} />

          {/* Completed */}
          {completed.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Done ({completed.length})</p>
                <div className="flex-1 h-px bg-zinc-100 dark:bg-zinc-800" />
              </div>
              <div className="space-y-2">
                {completed.map((task) => (
                  <TaskCard key={task._id} task={task} onToggle={toggleComplete} onEdit={onEditTask} onDelete={deleteTask} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
