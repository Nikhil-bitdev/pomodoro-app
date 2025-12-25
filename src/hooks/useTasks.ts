import { useLiveQuery } from 'dexie-react-hooks';
import { useCallback } from 'react';
import { db, Task, incrementTaskCompleted } from '../lib/database';
import { getTodayKey } from '../utils/dateHelpers';

export interface CreateTaskData {
  title: string;
  description?: string;
  estimatedPomodoros: number;
  tags?: string[];
}

/**
 * Custom hook for task management
 */
export function useTasks() {
  // Load all tasks
  const allTasks = useLiveQuery(() => 
    db.tasks.orderBy('createdAt').reverse().toArray()
  );

  // Load today's tasks (created today or incomplete)
  const todayTasks = useLiveQuery(async () => {
    const today = getTodayKey();
    const tasks = await db.tasks.toArray();
    
    return tasks.filter(task => {
      const taskDate = task.createdAt.toISOString().split('T')[0];
      return taskDate === today || !task.isCompleted;
    });
  });

  // Load active tasks (not completed)
  const activeTasks = useLiveQuery(() =>
    db.tasks.where('isCompleted').equals(0).toArray()
  );

  // Load completed tasks
  const completedTasks = useLiveQuery(() =>
    db.tasks.where('isCompleted').equals(1).toArray()
  );

  /**
   * Create a new task
   */
  const createTask = useCallback(async (data: CreateTaskData): Promise<number> => {
    const task: Task = {
      title: data.title,
      description: data.description,
      createdAt: new Date(),
      isCompleted: false,
      estimatedPomodoros: data.estimatedPomodoros,
      completedPomodoros: 0,
      tags: data.tags
    };

    return await db.tasks.add(task);
  }, []);

  /**
   * Update an existing task
   */
  const updateTask = useCallback(async (
    id: number,
    updates: Partial<Task>
  ): Promise<void> => {
    await db.tasks.update(id, updates);
  }, []);

  /**
   * Delete a task
   */
  const deleteTask = useCallback(async (id: number): Promise<void> => {
    await db.tasks.delete(id);
  }, []);

  /**
   * Mark task as completed
   */
  const completeTask = useCallback(async (id: number): Promise<void> => {
    const task = await db.tasks.get(id);
    if (!task) return;

    await db.tasks.update(id, {
      isCompleted: true,
      completedAt: new Date()
    });

    // Update daily stats
    await incrementTaskCompleted(getTodayKey());
  }, []);

  /**
   * Mark task as incomplete
   */
  const uncompleteTask = useCallback(async (id: number): Promise<void> => {
    await db.tasks.update(id, {
      isCompleted: false,
      completedAt: undefined
    });
  }, []);

  /**
   * Get a single task by ID
   */
  const getTask = useCallback(async (id: number): Promise<Task | undefined> => {
    return await db.tasks.get(id);
  }, []);

  /**
   * Search tasks by title or tags
   */
  const searchTasks = useCallback(async (query: string): Promise<Task[]> => {
    const lowerQuery = query.toLowerCase();
    const tasks = await db.tasks.toArray();
    
    return tasks.filter(task => {
      const titleMatch = task.title.toLowerCase().includes(lowerQuery);
      const tagsMatch = task.tags?.some(tag => 
        tag.toLowerCase().includes(lowerQuery)
      );
      return titleMatch || tagsMatch;
    });
  }, []);

  /**
   * Get tasks by tag
   */
  const getTasksByTag = useCallback(async (tag: string): Promise<Task[]> => {
    const tasks = await db.tasks.toArray();
    return tasks.filter(task => task.tags?.includes(tag));
  }, []);

  /**
   * Get all unique tags
   */
  const getAllTags = useLiveQuery(async () => {
    const tasks = await db.tasks.toArray();
    const tagsSet = new Set<string>();
    
    tasks.forEach(task => {
      task.tags?.forEach(tag => tagsSet.add(tag));
    });
    
    return Array.from(tagsSet).sort();
  });

  /**
   * Increment task pomodoros
   */
  const incrementPomodoros = useCallback(async (id: number): Promise<void> => {
    const task = await db.tasks.get(id);
    if (task) {
      await db.tasks.update(id, {
        completedPomodoros: task.completedPomodoros + 1
      });
    }
  }, []);

  return {
    allTasks,
    todayTasks,
    activeTasks,
    completedTasks,
    getAllTags,
    createTask,
    updateTask,
    deleteTask,
    completeTask,
    uncompleteTask,
    getTask,
    searchTasks,
    getTasksByTag,
    incrementPomodoros
  };
}
