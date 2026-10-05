import { useState, useCallback } from 'react';
import {
  format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth,
  isToday, isSameDay, addMonths, subMonths, getDay, parseISO,
} from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/utils';
import type { Task } from '@/types';

interface CalendarProps {
  tasks: Task[];
  selectedDate: string;
  onDateSelect: (date: string) => void;
  loading?: boolean;
}

function getTasksForDay(tasks: Task[], date: Date): Task[] {
  const dateStr = format(date, 'yyyy-MM-dd');
  return tasks.filter((t) => t.due_date === dateStr);
}

function DayIndicators({ tasks }: { tasks: Task[] }) {
  if (tasks.length === 0) return null;
  const hasPending = tasks.some((t) => t.status !== 'completed');
  const hasCompleted = tasks.some((t) => t.status === 'completed');
  const hasOverdue = tasks.some((t) => {
    if (t.status === 'completed' || !t.due_date) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return parseISO(t.due_date) < today;
  });

  return (
    <div className="flex items-center justify-center gap-0.5 mt-0.5">
      {hasOverdue && <span className="w-1.5 h-1.5 rounded-full bg-red-500" />}
      {hasPending && !hasOverdue && <span className="w-1.5 h-1.5 rounded-full bg-primary-500" />}
      {hasCompleted && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
      {tasks.length > 2 && <span className="w-1.5 h-1.5 rounded-full bg-zinc-400" />}
    </div>
  );
}

export function Calendar({ tasks, selectedDate, onDateSelect, loading }: CalendarProps) {
  const [viewDate, setViewDate] = useState(new Date());

  const days = eachDayOfInterval({
    start: startOfMonth(viewDate),
    end: endOfMonth(viewDate),
  });

  // Calculate leading empty days (Monday = 0)
  const firstDay = getDay(startOfMonth(viewDate));
  const leadingEmpty = firstDay === 0 ? 6 : firstDay - 1;

  const goToPrev = () => setViewDate((d) => subMonths(d, 1));
  const goToNext = () => setViewDate((d) => addMonths(d, 1));
  const goToToday = () => {
    setViewDate(new Date());
    onDateSelect(format(new Date(), 'yyyy-MM-dd'));
  };

  return (
    <div className="card p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          {format(viewDate, 'MMMM yyyy')}
        </h2>
        <div className="flex items-center gap-1">
          <button
            onClick={goToToday}
            className="btn-ghost text-xs px-2 py-1"
            aria-label="Go to today"
          >
            Today
          </button>
          <button onClick={goToPrev} className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-lg transition-colors" aria-label="Previous month">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button onClick={goToNext} className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-lg transition-colors" aria-label="Next month">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Day Headers */}
      <div className="grid grid-cols-7 mb-2">
        {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map((d) => (
          <div key={d} className="text-center text-xs font-medium text-zinc-400 dark:text-zinc-500 py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-y-1">
        {/* Leading empty */}
        {Array.from({ length: leadingEmpty }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}

        {/* Days */}
        {days.map((day) => {
          const dateStr = format(day, 'yyyy-MM-dd');
          const dayTasks = getTasksForDay(tasks, day);
          const isSelected = selectedDate === dateStr;
          const todayDay = isToday(day);

          return (
            <button
              key={dateStr}
              onClick={() => onDateSelect(dateStr)}
              aria-label={`${format(day, 'MMMM d, yyyy')} - ${dayTasks.length} tasks`}
              className={cn(
                'flex flex-col items-center justify-start py-1.5 rounded-lg text-xs font-medium transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
                isSelected
                  ? 'bg-primary-600 text-white shadow-sm'
                  : todayDay
                  ? 'bg-primary-50 dark:bg-primary-950 text-primary-700 dark:text-primary-300 ring-1 ring-primary-300 dark:ring-primary-700'
                  : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
              )}
            >
              <span>{format(day, 'd')}</span>
              {!loading && <DayIndicators tasks={dayTasks} />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
