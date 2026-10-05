import { useState, useCallback } from 'react';
import { categoryApi } from '@/services/api';
import type { Category, CategoryCreate } from '@/types';
import { useEffect } from 'react';

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await categoryApi.list();
      setCategories(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const createCategory = useCallback(async (data: CategoryCreate) => {
    const cat = await categoryApi.create(data);
    setCategories((prev) => [...prev, cat]);
    return cat;
  }, []);

  const deleteCategory = useCallback(async (id: string) => {
    await categoryApi.delete(id);
    setCategories((prev) => prev.filter((c) => c._id !== id));
  }, []);

  return { categories, loading, error, refetch: fetchCategories, createCategory, deleteCategory };
}
