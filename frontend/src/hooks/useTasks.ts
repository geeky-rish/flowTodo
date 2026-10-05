import { useState, useEffect, useCallback } from 'react';
import { taskApi } from '@/services/api';
import type { Task, TaskCreate, TaskUpdate, TaskFilters } from '@/types';

export function useTasks(filters: TaskFilters = {}) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await taskApi.list(filters);
      setTasks(data.tasks);
      setTotal(data.total);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(filters)]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const createTask = useCallback(async (data: TaskCreate) => {
    const task = await taskApi.create(data);
    setTasks((prev) => [task, ...prev]);
    setTotal((t) => t + 1);
    return task;
  }, []);

  const updateTask = useCallback(async (id: string, data: TaskUpdate) => {
    const updated = await taskApi.update(id, data);
    setTasks((prev) => prev.map((t) => (t._id === id ? updated : t)));
    return updated;
  }, []);

  const deleteTask = useCallback(async (id: string) => {
    await taskApi.delete(id);
    setTasks((prev) => prev.filter((t) => t._id !== id));
    setTotal((t) => t - 1);
  }, []);

  const toggleComplete = useCallback(async (id: string) => {
    const updated = await taskApi.complete(id);
    setTasks((prev) => prev.map((t) => (t._id === id ? updated : t)));
    return updated;
  }, []);

  return {
    tasks,
    total,
    loading,
    error,
    refetch: fetchTasks,
    createTask,
    updateTask,
    deleteTask,
    toggleComplete,
  };
}

export function useTasksByDate(date: string) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = useCallback(async () => {
    if (!date) return;
    try {
      setLoading(true);
      setError(null);
      const data = await taskApi.byDate(date);
      setTasks(data.tasks);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [date]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const toggleComplete = useCallback(async (id: string) => {
    const updated = await taskApi.complete(id);
    setTasks((prev) => prev.map((t) => (t._id === id ? updated : t)));
  }, []);

  return { tasks, loading, error, refetch: fetchTasks, toggleComplete };
}
