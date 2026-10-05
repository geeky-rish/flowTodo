import { useState, useCallback } from 'react';
import { Routes, Route, useSearchParams } from 'react-router-dom';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { TaskModal } from '@/components/TaskModal';
import { Dashboard } from '@/pages/Dashboard';
import { CalendarPage } from '@/pages/CalendarPage';
import { TasksPage } from '@/pages/TasksPage';
import { TodayPage } from '@/pages/TodayPage';
import { UpcomingPage } from '@/pages/UpcomingPage';
import { CompletedPage } from '@/pages/CompletedPage';
import { StatsPage } from '@/pages/StatsPage';
import { SettingsPage } from '@/pages/SettingsPage';
import { useCategories } from '@/hooks/useCategories';
import { taskApi } from '@/services/api';
import type { Task, TaskCreate, TaskUpdate } from '@/types';

export function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [defaultDate, setDefaultDate] = useState<string | undefined>();
  const [refreshKey, setRefreshKey] = useState(0);

  const { categories, refetch: refetchCategories } = useCategories();

  const openAddTask = useCallback((date?: string) => {
    setEditingTask(null);
    setDefaultDate(date);
    setModalOpen(true);
  }, []);

  const openEditTask = useCallback((task: Task) => {
    setEditingTask(task);
    setDefaultDate(undefined);
    setModalOpen(true);
  }, []);

  const handleSave = useCallback(async (data: TaskCreate | TaskUpdate) => {
    if (editingTask) {
      await taskApi.update(editingTask._id, data as TaskUpdate);
    } else {
      await taskApi.create(data as TaskCreate);
    }
    refetchCategories();
    setRefreshKey((k) => k + 1);
  }, [editingTask, refetchCategories]);

  return (
    <div className="flex h-screen overflow-hidden bg-surface-50 dark:bg-surface-950">
      {/* Sidebar */}
      <Sidebar
        categories={categories}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header onAddTask={() => openAddTask()} onMenuToggle={() => setSidebarOpen(true)} />

        {/* Page content */}
        <main className="flex-1 overflow-y-auto px-4 lg:px-6 py-6">
          <Routes>
            <Route path="/" element={
              <Dashboard key={`dash-${refreshKey}`} onAddTask={openAddTask} onEditTask={openEditTask} />
            } />
            <Route path="/calendar" element={
              <CalendarPage key={`cal-${refreshKey}`} onAddTask={openAddTask} onEditTask={openEditTask} />
            } />
            <Route path="/tasks" element={
              <TasksPage key={`tasks-${refreshKey}`} onAddTask={openAddTask} onEditTask={openEditTask} />
            } />
            <Route path="/today" element={
              <TodayPage key={`today-${refreshKey}`} onAddTask={openAddTask} onEditTask={openEditTask} />
            } />
            <Route path="/upcoming" element={
              <UpcomingPage key={`upcoming-${refreshKey}`} onAddTask={openAddTask} onEditTask={openEditTask} />
            } />
            <Route path="/completed" element={
              <CompletedPage key={`completed-${refreshKey}`} onAddTask={openAddTask} onEditTask={openEditTask} />
            } />
            <Route path="/stats" element={<StatsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </main>
      </div>

      {/* Task Modal */}
      <TaskModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditingTask(null); }}
        onSave={handleSave}
        task={editingTask}
        categories={categories}
        defaultDate={defaultDate}
      />
    </div>
  );
}
