import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Calendar, ListTodo, Sun, Clock, CheckCircle2,
  Tag, BarChart2, Settings, ChevronRight, X, Zap,
} from 'lucide-react';
import { cn, getCategoryIcon } from '@/utils';
import type { Category } from '@/types';

interface SidebarProps {
  categories: Category[];
  isOpen?: boolean;
  onClose?: () => void;
}

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { to: '/calendar', label: 'Calendar', icon: Calendar },
  { to: '/tasks', label: 'All Tasks', icon: ListTodo },
  { to: '/today', label: 'Today', icon: Sun },
  { to: '/upcoming', label: 'Upcoming', icon: Clock },
  { to: '/completed', label: 'Completed', icon: CheckCircle2 },
];

export function Sidebar({ categories, isOpen, onClose }: SidebarProps) {
  const location = useLocation();

  const content = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center justify-between px-4 py-5 border-b border-zinc-100 dark:border-zinc-800">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-primary-600 rounded-lg flex items-center justify-center shadow-sm">
            <Zap className="w-4 h-4 text-white" strokeWidth={2.5} />
          </div>
          <span className="font-bold text-zinc-900 dark:text-white tracking-tight">FlowTodo</span>
        </div>
        {onClose && (
          <button onClick={onClose} aria-label="Close sidebar" className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 lg:hidden">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto" aria-label="Main navigation">
        {NAV_ITEMS.map(({ to, label, icon: Icon, exact }) => (
          <NavLink
            key={to}
            to={to}
            end={exact}
            onClick={onClose}
            className={({ isActive }) =>
              cn(isActive ? 'nav-item-active' : 'nav-item')
            }
            aria-label={label}
          >
            <Icon className="w-4 h-4 flex-shrink-0" />
            <span>{label}</span>
          </NavLink>
        ))}

        {/* Stats link */}
        <NavLink
          to="/stats"
          onClick={onClose}
          className={({ isActive }) => cn(isActive ? 'nav-item-active' : 'nav-item')}
        >
          <BarChart2 className="w-4 h-4 flex-shrink-0" />
          <span>Statistics</span>
        </NavLink>

        {/* Categories Section */}
        {categories.length > 0 && (
          <div className="pt-4">
            <p className="px-3 mb-1.5 text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
              Categories
            </p>
            {categories.map((cat) => (
              <NavLink
                key={cat._id}
                to={`/tasks?category=${encodeURIComponent(cat.name)}`}
                onClick={onClose}
                className={({ isActive }) => cn(isActive ? 'nav-item-active' : 'nav-item')}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: cat.color }}
                />
                <span className="flex-1 truncate">{cat.name}</span>
                <span className="text-xs text-zinc-400 dark:text-zinc-500 tabular-nums">
                  {cat.task_count}
                </span>
              </NavLink>
            ))}
          </div>
        )}
      </nav>

      {/* Settings */}
      <div className="border-t border-zinc-100 dark:border-zinc-800 px-3 py-3">
        <NavLink
          to="/settings"
          onClick={onClose}
          className={({ isActive }) => cn(isActive ? 'nav-item-active' : 'nav-item')}
        >
          <Settings className="w-4 h-4" />
          <span>Settings</span>
        </NavLink>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-56 flex-shrink-0 border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-surface-900 h-full">
        {content}
      </aside>

      {/* Mobile drawer */}
      {isOpen !== undefined && (
        <>
          {isOpen && (
            <div
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden animate-fade-in"
              onClick={onClose}
            />
          )}
          <aside
            className={cn(
              'fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-surface-900 border-r border-zinc-200 dark:border-zinc-800 lg:hidden transform transition-transform duration-300',
              isOpen ? 'translate-x-0' : '-translate-x-full'
            )}
          >
            {content}
          </aside>
        </>
      )}
    </>
  );
}
