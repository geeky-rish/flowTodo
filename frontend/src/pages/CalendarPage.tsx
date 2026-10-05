import { useState } from 'react';
import { format, addDays } from 'date-fns';
import { Calendar as CalendarIcon, Plus } from 'lucide-react';
import { Calendar } from '@/components/Calendar';
import { TaskCard, TaskCardSkeleton } from '@/components/TaskCard';
import { useTasksByDate } from '@/hooks/useTasks';
import { useTasks } from '@/hooks/useTasks';
import { getTodayISO, formatDate } from '@/utils';
import type { Task } from '@/types';

interface CalendarPageProps {
  onAddTask: (date?: string) => void;
  onEditTask: (task: Task) => void;
}

export function CalendarPage({ onAddTask, onEditTask }: CalendarPageProps) {
  const today = getTodayISO();
  const [selectedDate, setSelectedDate] = useState(today);

  const { tasks: allTasks, loading: allLoading } = useTasks({ sort_by: 'due_date', sort_order: 1 });
  const { tasks: dayTasks, loading: dayLoading, toggleComplete, refetch } = useTasksByDate(selectedDate);

  const handleDelete = async (id: string) => {
    const { taskApi } = await import('@/services/api');
    await taskApi.delete(id);
    refetch();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-primary-600" />
            Calendar
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">View and manage tasks by date</p>
        </div>
        <button onClick={() => onAddTask(selectedDate)} className="btn-primary text-sm">
          <Plus className="w-4 h-4" />Add Task
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Calendar */}
        <div className="lg:w-80 xl:w-96 flex-shrink-0">
          <Calendar
            tasks={allTasks}
            selectedDate={selectedDate}
            onDateSelect={setSelectedDate}
            loading={allLoading}
          />

          {/* Legend */}
          <div className="mt-3 card p-3 flex flex-wrap gap-3 text-xs text-zinc-500 dark:text-zinc-400">
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-500" />Overdue</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-primary-500" />Pending</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500" />Completed</span>
          </div>
        </div>

        {/* Day tasks panel */}
        <div className="flex-1 min-w-0">
          <div className="card p-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  {selectedDate === today ? 'Today' : formatDate(selectedDate)}
                </h2>
                <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">
                  {format(new Date(selectedDate + 'T00:00:00'), 'EEEE, MMMM d, yyyy')}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-400">{dayTasks.length} tasks</span>
                <button onClick={() => onAddTask(selectedDate)} className="btn-ghost text-xs px-2 py-1">
                  <Plus className="w-3.5 h-3.5" />Add
                </button>
              </div>
            </div>

            {dayLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => <TaskCardSkeleton key={i} />)}
              </div>
            ) : dayTasks.length === 0 ? (
              <div className="py-12 text-center">
                <CalendarIcon className="w-10 h-10 text-zinc-300 dark:text-zinc-600 mx-auto mb-3" />
                <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">No tasks on this day</p>
                <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">Click below to add a task for this date.</p>
                <button onClick={() => onAddTask(selectedDate)} className="btn-primary mt-4 text-xs">
                  <Plus className="w-3.5 h-3.5" />Add Task
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {dayTasks.map((task) => (
                  <TaskCard
                    key={task._id}
                    task={task}
                    onToggle={toggleComplete}
                    onEdit={onEditTask}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
