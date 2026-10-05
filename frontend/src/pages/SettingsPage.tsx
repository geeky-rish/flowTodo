import { useState } from 'react';
import { Settings, Moon, Sun, Monitor, Plus, Trash2, Loader2 } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { useCategories } from '@/hooks/useCategories';
import { cn } from '@/utils';
import type { Theme } from '@/types';

const THEME_OPTIONS: { value: Theme; label: string; icon: typeof Sun }[] = [
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
  { value: 'system', label: 'System', icon: Monitor },
];

export function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { categories, createCategory, deleteCategory } = useCategories();
  const [newCat, setNewCat] = useState({ name: '', color: '#6366f1' });
  const [creating, setCreating] = useState(false);
  const [catError, setCatError] = useState<string | null>(null);

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCat.name.trim()) return;
    setCreating(true);
    setCatError(null);
    try {
      await createCategory({ name: newCat.name.trim(), color: newCat.color });
      setNewCat({ name: '', color: '#6366f1' });
    } catch (e: any) {
      setCatError(e.message);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
          <Settings className="w-5 h-5 text-primary-600" />
          Settings
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">Manage your preferences</p>
      </div>

      {/* Theme */}
      <div className="card p-6 space-y-4">
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Appearance</h2>
        <div>
          <label className="label">Theme</label>
          <div className="flex gap-2">
            {THEME_OPTIONS.map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                onClick={() => setTheme(value)}
                className={cn(
                  'flex-1 flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all text-xs font-medium',
                  theme === value
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-950 text-primary-700 dark:text-primary-300'
                    : 'border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600 text-zinc-600 dark:text-zinc-400'
                )}
                aria-pressed={theme === value}
              >
                <Icon className="w-5 h-5" />
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="card p-6 space-y-4">
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Categories</h2>

        {/* Existing categories */}
        <div className="space-y-2">
          {categories.map((cat) => (
            <div key={cat._id} className="flex items-center justify-between py-2 px-3 bg-zinc-50 dark:bg-zinc-800 rounded-lg">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                <span className="text-sm text-zinc-700 dark:text-zinc-300">{cat.name}</span>
                <span className="text-xs text-zinc-400">{cat.task_count} tasks</span>
              </div>
              <button
                onClick={() => deleteCategory(cat._id)}
                aria-label={`Delete ${cat.name}`}
                className="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-950 text-zinc-400 hover:text-red-500 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>

        {/* Add new category */}
        <form onSubmit={handleCreateCategory} className="space-y-3">
          <h3 className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Add Category</h3>
          <div className="flex gap-2">
            <input
              type="text"
              value={newCat.name}
              onChange={(e) => setNewCat((c) => ({ ...c, name: e.target.value }))}
              placeholder="Category name..."
              className="input flex-1"
              aria-label="New category name"
            />
            <input
              type="color"
              value={newCat.color}
              onChange={(e) => setNewCat((c) => ({ ...c, color: e.target.value }))}
              className="w-10 h-10 rounded-lg border border-zinc-300 dark:border-zinc-600 cursor-pointer"
              aria-label="Category color"
            />
            <button type="submit" disabled={creating || !newCat.name.trim()} className="btn-primary">
              {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            </button>
          </div>
          {catError && <p className="text-xs text-red-600 dark:text-red-400">{catError}</p>}
        </form>
      </div>

      {/* About */}
      <div className="card p-6">
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-3">About FlowTodo</h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          A calendar-centric task management application built with React, FastAPI, and MongoDB.
        </p>
        <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-2">Version 1.0.0</p>
      </div>
    </div>
  );
}
