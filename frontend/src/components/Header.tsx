import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Moon, Sun, Monitor, Menu, Zap, X, LogOut } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { taskApi } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { cn, formatDate } from '@/utils';
import type { Task } from '@/types';

interface HeaderProps {
  onAddTask: () => void;
  onMenuToggle: () => void;
}

type ThemeOption = 'light' | 'dark' | 'system';

export function Header({ onAddTask, onMenuToggle }: HeaderProps) {
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Task[]>([]);
  const [searching, setSearching] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  // Ctrl+K shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
        setTimeout(() => searchRef.current?.focus(), 50);
      }
      if (e.key === 'Escape') {
        setSearchOpen(false);
        setQuery('');
        setResults([]);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // Debounced search
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        setSearching(true);
        const data = await taskApi.list({ search: query, limit: 8 } as any);
        setResults(data.tasks);
      } catch { } finally {
        setSearching(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const themeOptions: { value: ThemeOption; icon: typeof Sun; label: string }[] = [
    { value: 'light', icon: Sun, label: 'Light' },
    { value: 'dark', icon: Moon, label: 'Dark' },
    { value: 'system', icon: Monitor, label: 'System' },
  ];

  const ThemeIcon = themeOptions.find((o) => o.value === theme)?.icon || Monitor;

  const cycleTheme = () => {
    const order: ThemeOption[] = ['light', 'dark', 'system'];
    const idx = order.indexOf(theme as ThemeOption);
    setTheme(order[(idx + 1) % 3]);
  };

  return (
    <>
      <header className="h-14 flex-shrink-0 flex items-center justify-between px-4 lg:px-6 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-surface-900">
        {/* Left */}
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuToggle}
            aria-label="Toggle menu"
            className="lg:hidden p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500"
          >
            <Menu className="w-5 h-5" />
          </button>
          {/* Logo on mobile */}
          <div className="flex items-center gap-2 lg:hidden">
            <div className="w-6 h-6 bg-primary-600 rounded-md flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
            </div>
            <span className="font-bold text-sm text-zinc-900 dark:text-white">FlowTodo</span>
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-2">
          {/* Search button */}
          <button
            onClick={() => { setSearchOpen(true); setTimeout(() => searchRef.current?.focus(), 50); }}
            aria-label="Search tasks (Ctrl+K)"
            className="flex items-center gap-2 px-3 py-1.5 text-sm text-zinc-400 bg-zinc-100 dark:bg-zinc-800 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
          >
            <Search className="w-3.5 h-3.5" />
            <span className="hidden sm:inline text-xs">Search</span>
            <kbd className="hidden sm:inline text-xs bg-white dark:bg-zinc-900 px-1 rounded border border-zinc-300 dark:border-zinc-600">⌘K</kbd>
          </button>

          {/* Theme toggle */}
          <button
            onClick={cycleTheme}
            aria-label={`Switch theme (current: ${theme})`}
            className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400 transition-colors"
          >
            <ThemeIcon className="w-4 h-4" />
          </button>

          <span className="hidden md:inline text-sm text-zinc-500 dark:text-zinc-400">{user?.username}</span>
          <button
            onClick={() => { logout(); navigate('/login', { replace: true }); }}
            aria-label="Log out"
            title="Log out"
            className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>

          {/* Add Task */}
          <button
            id="add-task-btn"
            onClick={onAddTask}
            className="btn-primary text-sm px-3 py-2"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Task</span>
          </button>
        </div>
      </header>

      {/* Search modal */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4" role="dialog" aria-label="Search">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => { setSearchOpen(false); setQuery(''); }} />
          <div className="relative w-full max-w-lg bg-white dark:bg-surface-850 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-700 overflow-hidden animate-slide-up">
            <div className="flex items-center gap-3 px-4 py-3 border-b border-zinc-100 dark:border-zinc-800">
              <Search className="w-4 h-4 text-zinc-400 flex-shrink-0" />
              <input
                ref={searchRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search tasks, tags, categories..."
                className="flex-1 bg-transparent text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none"
                aria-label="Search query"
              />
              <button onClick={() => { setSearchOpen(false); setQuery(''); }} aria-label="Close search">
                <X className="w-4 h-4 text-zinc-400" />
              </button>
            </div>
            <div className="max-h-80 overflow-y-auto">
              {searching && (
                <div className="px-4 py-6 text-center text-sm text-zinc-400">Searching…</div>
              )}
              {!searching && query && results.length === 0 && (
                <div className="px-4 py-6 text-center text-sm text-zinc-400">No tasks found for "{query}"</div>
              )}
              {results.map((task) => (
                <button
                  key={task._id}
                  onClick={() => {
                    navigate('/tasks');
                    setSearchOpen(false);
                    setQuery('');
                  }}
                  className="w-full flex items-start gap-3 px-4 py-3 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-left transition-colors"
                >
                  <span className={cn('w-2 h-2 rounded-full mt-1.5 flex-shrink-0', {
                    'bg-red-500': task.priority === 'high',
                    'bg-amber-500': task.priority === 'medium',
                    'bg-emerald-500': task.priority === 'low',
                  })} />
                  <div>
                    <p className={cn('text-sm font-medium text-zinc-900 dark:text-zinc-100', task.status === 'completed' && 'line-through text-zinc-400')}>
                      {task.title}
                    </p>
                    <p className="text-xs text-zinc-400">
                      {task.category && `${task.category} · `}{formatDate(task.due_date)}
                    </p>
                  </div>
                </button>
              ))}
              {!query && (
                <div className="px-4 py-6 text-center text-sm text-zinc-400">
                  Start typing to search tasks…
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
