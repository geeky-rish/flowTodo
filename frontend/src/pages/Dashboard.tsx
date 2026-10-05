import { useState } from 'react';
import { format } from 'date-fns';
import { CheckCircle2, Clock, AlertTriangle, TrendingUp, Plus, Loader2 } from 'lucide-react';
import { useTasks } from '@/hooks/useTasks';
import { TaskCard, TaskCardSkeleton } from '@/components/TaskCard';
import { Calendar } from '@/components/Calendar';
import { getGreeting, getTodayISO, calcProgressPercent, isOverdue } from '@/utils';
import type { Task } from '@/types';

interface DashboardProps {
  onAddTask: (date?: string) => void;
  onEditTask: (task: Task) => void;
}

function StatCard({ icon: Icon, label, value, color }: {
  icon: typeof CheckCircle2;
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="card p-4 flex items-center gap-4">
      <div className={`p-2.5 rounded-xl ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 tabular-nums">{value}</p>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">{label}</p>
      </div>
    </div>
  );
}

export function Dashboard({ onAddTask, onEditTask }: DashboardProps) {
  const today = getTodayISO();
  const [selectedDate, setSelectedDate] = useState(today);

  const { tasks: allTasks, loading, toggleComplete, deleteTask } = useTasks({ sort_by: 'due_date', sort_order: 1 });

  const todayTasks = allTasks.filter((t) => t.due_date === today);
  const completedToday = todayTasks.filter((t) => t.status === 'completed');
  const overdueTasks = allTasks.filter((t) => isOverdue(t));
  const upcomingTasks = allTasks.filter((t) => t.due_date && t.due_date > today && t.status !== 'completed');
  const progress = calcProgressPercent(completedToday.length, todayTasks.length);

  const selectedTasks = allTasks.filter((t) => t.due_date === selectedDate);

  const greeting = getGreeting();
  const dateDisplay = format(new Date(), 'EEEE, MMMM d');

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full">
      {/* Main content */}
      <div className="flex-1 space-y-6 min-w-0">
        {/* Greeting */}
        <div className="slide-up">
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            {greeting}, Rishi 👋
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">{dateDisplay}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
          <StatCard icon={Clock} label="Due today" value={todayTasks.filter(t => t.status !== 'completed').length} color="bg-primary-50 dark:bg-primary-950 text-primary-600 dark:text-primary-400" />
          <StatCard icon={CheckCircle2} label="Done today" value={completedToday.length} color="bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400" />
          <StatCard icon={AlertTriangle} label="Overdue" value={overdueTasks.length} color="bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400" />
          <StatCard icon={TrendingUp} label="Upcoming" value={upcomingTasks.length} color="bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400" />
        </div>

        {/* Progress */}
        <div className="card p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Today's Progress</p>
            <span className="text-sm font-bold text-primary-600 dark:text-primary-400 tabular-nums">{progress}%</span>
          </div>
          <div className="w-full h-2.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary-500 to-primary-600 rounded-full transition-all duration-700"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-zinc-400">
            {completedToday.length} of {todayTasks.length} tasks completed
          </p>
        </div>

        {/* Today's tasks */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Today's Tasks</h2>
            <button onClick={() => onAddTask(today)} className="btn-ghost text-xs px-2 py-1">
              <Plus className="w-3.5 h-3.5" />Add
            </button>
          </div>

          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => <TaskCardSkeleton key={i} />)}
            </div>
          ) : todayTasks.length === 0 ? (
            <div className="card p-8 text-center">
              <CheckCircle2 className="w-10 h-10 text-zinc-300 dark:text-zinc-600 mx-auto mb-3" />
              <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">No tasks today</p>
              <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">Your schedule is clear. Enjoy the free time.</p>
              <button onClick={() => onAddTask(today)} className="btn-primary mt-4 text-xs">
                <Plus className="w-3.5 h-3.5" />Add Task
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {todayTasks.map((task) => (
                <TaskCard
                  key={task._id}
                  task={task}
                  onToggle={toggleComplete}
                  onEdit={onEditTask}
                  onDelete={deleteTask}
                  compact
                />
              ))}
            </div>
          )}
        </div>

        {/* Overdue */}
        {overdueTasks.length > 0 && (
          <div>
            <h2 className="text-sm font-semibold text-red-600 dark:text-red-400 mb-3 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Overdue ({overdueTasks.length})
            </h2>
            <div className="space-y-2">
              {overdueTasks.slice(0, 3).map((task) => (
                <TaskCard
                  key={task._id}
                  task={task}
                  onToggle={toggleComplete}
                  onEdit={onEditTask}
                  onDelete={deleteTask}
                  compact
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Right panel: Calendar + selected day tasks */}
      <div className="lg:w-72 xl:w-80 space-y-4 flex-shrink-0">
        <Calendar
          tasks={allTasks}
          selectedDate={selectedDate}
          onDateSelect={setSelectedDate}
          loading={loading}
        />

        {/* Selected date tasks */}
        <div className="card p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
              {selectedDate === today ? "Today's Tasks" : format(new Date(selectedDate + 'T00:00:00'), 'MMM d')}
            </h3>
            <span className="text-xs text-zinc-400">{selectedTasks.length} tasks</span>
          </div>

          {loading ? (
            <div className="space-y-2">{[1, 2].map((i) => <TaskCardSkeleton key={i} />)}</div>
          ) : selectedTasks.length === 0 ? (
            <div className="py-4 text-center">
              <p className="text-xs text-zinc-400 dark:text-zinc-500">No tasks on this day</p>
              <button onClick={() => onAddTask(selectedDate)} className="mt-2 text-xs text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1 mx-auto">
                <Plus className="w-3 h-3" />Add task
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {selectedTasks.map((task) => (
                <TaskCard
                  key={task._id}
                  task={task}
                  onToggle={toggleComplete}
                  onEdit={onEditTask}
                  onDelete={deleteTask}
                  compact
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
