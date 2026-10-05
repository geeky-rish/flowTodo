import { useState, useMemo } from 'react';
import { Search, Filter, ChevronDown, X, ListTodo, Plus } from 'lucide-react';
import { useTasks } from '@/hooks/useTasks';
import { TaskCard, TaskCardSkeleton } from '@/components/TaskCard';
import { cn } from '@/utils';
import type { Task, Priority, TaskStatus, TaskFilters } from '@/types';

interface TasksPageProps {
  onAddTask: () => void;
  onEditTask: (task: Task) => void;
  initialCategory?: string;
}

const STATUS_TABS: { value: TaskStatus | ''; label: string }[] = [
  { value: '', label: 'All' },
  { value: 'todo', label: 'To Do' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
];

const PRIORITY_OPTIONS: { value: Priority | ''; label: string }[] = [
  { value: '', label: 'All' },
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
];

const SORT_OPTIONS = [
  { value: 'created_at', label: 'Created date' },
  { value: 'due_date', label: 'Due date' },
  { value: 'priority', label: 'Priority' },
  { value: 'title', label: 'Title' },
];

export function TasksPage({ onAddTask, onEditTask, initialCategory }: TasksPageProps) {
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<TaskStatus | ''>('');
  const [priority, setPriority] = useState<Priority | ''>('');
  const [category, setCategory] = useState(initialCategory || '');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState<1 | -1>(-1);
  const [showFilters, setShowFilters] = useState(false);

  const filters: TaskFilters = useMemo(() => ({
    status: status || undefined,
    priority: priority || undefined,
    category: category || undefined,
    search: search || undefined,
    sort_by: sortBy,
    sort_order: sortOrder,
  }), [status, priority, category, search, sortBy, sortOrder]);

  const { tasks, total, loading, error, toggleComplete, deleteTask } = useTasks(filters);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
  };

  const clearFilters = () => {
    setStatus('');
    setPriority('');
    setCategory('');
    setSearch('');
    setSearchInput('');
    setSortBy('created_at');
    setSortOrder(-1);
  };

  const hasFilters = status || priority || category || search;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <ListTodo className="w-5 h-5 text-primary-600" />
            All Tasks
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">{total} total tasks</p>
        </div>
        <button onClick={onAddTask} className="btn-primary text-sm">
          <Plus className="w-4 h-4" />Add Task
        </button>
      </div>

      {/* Search + filter controls */}
      <div className="card p-4 space-y-3">
        {/* Search */}
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search tasks by title, description, tag, category..."
              className="input pl-9"
              aria-label="Search tasks"
            />
          </div>
          <button type="submit" className="btn-primary text-sm">Search</button>
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className={cn('btn-secondary text-sm', showFilters && 'bg-primary-50 dark:bg-primary-950 text-primary-600 dark:text-primary-400')}
            aria-expanded={showFilters}
          >
            <Filter className="w-4 h-4" />
            <span className="hidden sm:inline">Filters</span>
            {hasFilters && <span className="w-2 h-2 rounded-full bg-primary-500" />}
          </button>
        </form>

        {/* Status tabs */}
        <div className="flex flex-wrap gap-1.5">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setStatus(tab.value as TaskStatus | '')}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                status === tab.value
                  ? 'bg-primary-600 text-white'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Expanded filters */}
        {showFilters && (
          <div className="flex flex-wrap gap-3 pt-3 border-t border-zinc-100 dark:border-zinc-800 animate-fade-in">
            {/* Priority */}
            <div>
              <label className="label">Priority</label>
              <div className="flex gap-1">
                {PRIORITY_OPTIONS.map((p) => (
                  <button
                    key={p.value}
                    onClick={() => setPriority(p.value as Priority | '')}
                    className={cn(
                      'px-2.5 py-1 rounded-lg text-xs font-medium transition-all',
                      priority === p.value
                        ? 'bg-primary-600 text-white'
                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                    )}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Sort */}
            <div>
              <label className="label">Sort by</label>
              <div className="flex items-center gap-2">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="input text-xs py-1 w-36"
                  aria-label="Sort by"
                >
                  {SORT_OPTIONS.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
                <button
                  onClick={() => setSortOrder(sortOrder === -1 ? 1 : -1)}
                  className="btn-secondary px-2 py-1 text-xs"
                  aria-label={`Sort ${sortOrder === -1 ? 'ascending' : 'descending'}`}
                >
                  {sortOrder === -1 ? '↓' : '↑'}
                </button>
              </div>
            </div>

            {hasFilters && (
              <div className="flex items-end">
                <button onClick={clearFilters} className="btn-ghost text-xs flex items-center gap-1 text-zinc-500">
                  <X className="w-3.5 h-3.5" />Clear filters
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Error state */}
      {error && (
        <div className="card p-4 border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950 text-sm text-red-600 dark:text-red-400">
          Failed to load tasks: {error}
        </div>
      )}

      {/* Tasks list */}
      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4].map((i) => <TaskCardSkeleton key={i} />)}
        </div>
      ) : tasks.length === 0 ? (
        <div className="card p-12 text-center">
          <ListTodo className="w-12 h-12 text-zinc-300 dark:text-zinc-600 mx-auto mb-4" />
          <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">No tasks found</p>
          <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">
            {hasFilters ? 'Try adjusting your filters.' : 'Create your first task to get started.'}
          </p>
          {!hasFilters && (
            <button onClick={onAddTask} className="btn-primary mt-4 text-xs">
              <Plus className="w-3.5 h-3.5" />New Task
            </button>
          )}
          {hasFilters && (
            <button onClick={clearFilters} className="btn-secondary mt-4 text-xs">
              Clear filters
            </button>
          )}
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
