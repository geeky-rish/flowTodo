import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { ThemeProvider } from '@/hooks/useTheme'
import { useTasks } from '@/hooks/useTasks'
import { useCategories } from '@/hooks/useCategories'
import { useTheme } from '@/hooks/useTheme'

// Mock the API services
vi.mock('@/services/api', () => ({
  taskApi: {
    list: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    complete: vi.fn(),
    byDate: vi.fn(),
  },
  categoryApi: {
    list: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  statsApi: {
    get: vi.fn(),
  },
}))

import { taskApi, categoryApi, statsApi } from '@/services/api'

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider>{children}</ThemeProvider>
)

describe('useTasks Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('fetches tasks on mount', async () => {
    const mockTasks = {
      tasks: [
        { _id: '1', title: 'Test Task', priority: 'high', status: 'todo', tags: [], created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
      ],
      total: 1
    }
    taskApi.list.mockResolvedValue(mockTasks)

    const { result } = renderHook(() => useTasks(), { wrapper })

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0))
    })

    expect(taskApi.list).toHaveBeenCalled()
    expect(result.current.tasks).toEqual(mockTasks.tasks)
    expect(result.current.total).toBe(1)
  })

  it('creates a task', async () => {
    const newTask = { _id: '2', title: 'New Task', priority: 'medium', status: 'todo', tags: [], created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
    taskApi.create.mockResolvedValue(newTask)

    const { result } = renderHook(() => useTasks(), { wrapper })

    await act(async () => {
      await result.current.createTask({ title: 'New Task', priority: 'medium' })
    })

    expect(taskApi.create).toHaveBeenCalledWith({ title: 'New Task', priority: 'medium' })
  })

  it('toggles task completion', async () => {
    const completedTask = { _id: '1', title: 'Test Task', priority: 'high', status: 'completed', tags: [], created_at: new Date().toISOString(), updated_at: new Date().toISOString(), completed_at: new Date().toISOString() }
    taskApi.complete.mockResolvedValue(completedTask)

    const { result } = renderHook(() => useTasks(), { wrapper })

    await act(async () => {
      await result.current.toggleComplete('1')
    })

    expect(taskApi.complete).toHaveBeenCalledWith('1')
  })
})

describe('useCategories Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('fetches categories on mount', async () => {
    const mockCategories = [
      { _id: '1', name: 'Work', color: '#6366f1', icon: 'briefcase', task_count: 5, created_at: new Date().toISOString() }
    ]
    categoryApi.list.mockResolvedValue(mockCategories)

    const { result } = renderHook(() => useCategories(), { wrapper })

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0))
    })

    expect(categoryApi.list).toHaveBeenCalled()
    expect(result.current.categories).toEqual(mockCategories)
  })
})

describe('useTheme Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  it('initializes with system theme', () => {
    const { result } = renderHook(() => useTheme(), { wrapper })
    expect(result.current.theme).toBe('system')
  })

  it('toggles theme', () => {
    const { result } = renderHook(() => useTheme(), { wrapper })

    act(() => {
      result.current.setTheme('dark')
    })

    expect(result.current.theme).toBe('dark')
    expect(localStorage.getItem('flowtodo-theme')).toBe('dark')
  })
})