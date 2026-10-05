import { CheckCircle2, Plus } from 'lucide-react';
import { useTasks } from '@/hooks/useTasks';
import { TaskCard, TaskCardSkeleton } from '@/components/TaskCard';
import type { Task } from '@/types';

interface CompletedPageProps {
  onAddTask: () => void;
  onEditTask: (task: Task) => void;
}

export function CompletedPage({ onAddTask, onEditTask }: CompletedPageProps) {
  const { tasks, loading, toggleComplete, deleteTask } = useTasks({
    status: 'completed',
    sort_by: 'completed_at',
    sort_order: -1,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            Completed
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">{tasks.length} tasks completed</p>
        </div>
        <button onClick={onAddTask} className="btn-primary text-sm">
          <Plus className="w-4 h-4" />Add Task
        </button>
      </div>

      {loading ? (
        <div className="space-y-2">{[1, 2, 3].map((i) => <TaskCardSkeleton key={i} />)}</div>
      ) : tasks.length === 0 ? (
        <div className="card p-12 text-center">
          <CheckCircle2 className="w-12 h-12 text-zinc-300 dark:text-zinc-600 mx-auto mb-4" />
          <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">No completed tasks yet</p>
          <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">Start completing tasks to see them here.</p>
          <button onClick={onAddTask} className="btn-primary mt-4 text-xs">
            <Plus className="w-3.5 h-3.5" />Add Task
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {tasks.map((task) => (
            <TaskCard
              key={task._id}
              task={task}
              onToggle={toggleComplete}
              onEdit={onEditTask}
              onDelete={deleteTask}
            />
          ))}
        </div>
      )}
    </div>
  );
}
