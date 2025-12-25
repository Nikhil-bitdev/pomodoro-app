import Dexie, { Table } from 'dexie';

/**
 * Database schema interfaces
 */

export type SessionType = 'work' | 'break' | 'longBreak';

export interface Session {
  id?: number;
  startTime: Date;
  endTime: Date;
  duration: number; // in minutes
  type: SessionType;
  taskId?: number;
  completed: boolean;
  interrupted: boolean;
}

export interface Task {
  id?: number;
  title: string;
  description?: string;
  createdAt: Date;
  completedAt?: Date;
  isCompleted: boolean;
  estimatedPomodoros: number;
  completedPomodoros: number;
  tags?: string[];
}

export interface DailyStat {
  id?: number;
  date: string; // YYYY-MM-DD format
  completedPomodoros: number;
  completedSessions: number;
  plannedSessions: number;
  minutesFocused: number;
  focusMinutes: number;
  tasksCompleted: number;
}

export interface Settings {
  id: number; // Always 1
  workDuration: number; // in minutes
  shortBreakDuration: number;
  longBreakDuration: number;
  sessionsBeforeLongBreak: number;
  autoStartBreaks: boolean;
  autoStartPomodoros: boolean;
  soundEnabled: boolean;
  theme: 'light' | 'dark';
  dailyGoal: number;
}

/**
 * Dexie database class
 */
class PomodoroDatabase extends Dexie {
  sessions!: Table<Session, number>;
  tasks!: Table<Task, number>;
  dailyStats!: Table<DailyStat, number>;
  settings!: Table<Settings, number>;

  constructor() {
    super('PomodoroTrackerDB');
    
    this.version(1).stores({
      sessions: '++id, startTime, endTime, type, taskId, completed',
      tasks: '++id, createdAt, completedAt, isCompleted',
      dailyStats: '++id, &date',
      settings: 'id'
    });
  }
}

export const db = new PomodoroDatabase();

/**
 * Initialize default settings if none exist
 */
export async function initializeDefaultSettings(): Promise<void> {
  const existingSettings = await db.settings.get(1);
  
  if (!existingSettings) {
    await db.settings.add({
      id: 1,
      workDuration: 25,
      shortBreakDuration: 5,
      longBreakDuration: 15,
      sessionsBeforeLongBreak: 4,
      autoStartBreaks: false,
      autoStartPomodoros: false,
      soundEnabled: true,
      theme: 'light',
      dailyGoal: 8
    });
  }
}

/**
 * Get or create daily stats for a specific date
 */
export async function getOrCreateDailyStats(date: string): Promise<DailyStat> {
  let stats = await db.dailyStats.where('date').equals(date).first();
  
  if (!stats) {
    const id = await db.dailyStats.add({
      date,
      completedPomodoros: 0,
      completedSessions: 0,
      plannedSessions: 0,
      minutesFocused: 0,
      focusMinutes: 0,
      tasksCompleted: 0
    });
    
    stats = await db.dailyStats.get(id);
    if (!stats) {
      throw new Error('Failed to create daily stats');
    }
  }
  
  return stats;
}

/**
 * Update daily stats after a session completes
 */
export async function updateDailyStats(
  date: string,
  sessionType: SessionType,
  duration: number
): Promise<void> {
  const stats = await getOrCreateDailyStats(date);
  
  const updates: Partial<DailyStat> = {
    completedSessions: stats.completedSessions + 1
  };
  
  if (sessionType === 'work') {
    updates.completedPomodoros = stats.completedPomodoros + 1;
    updates.minutesFocused = stats.minutesFocused + duration;
    updates.focusMinutes = stats.focusMinutes + duration;
  }
  
  await db.dailyStats.update(stats.id!, updates);
}

/**
 * Increment task completed count for daily stats
 */
export async function incrementTaskCompleted(date: string): Promise<void> {
  const stats = await getOrCreateDailyStats(date);
  await db.dailyStats.update(stats.id!, {
    tasksCompleted: stats.tasksCompleted + 1
  });
}

/**
 * Clear all data from database
 */
export async function clearAllData(): Promise<void> {
  await Promise.all([
    db.sessions.clear(),
    db.tasks.clear(),
    db.dailyStats.clear()
  ]);
}

/**
 * Export all data as JSON
 */
export async function exportData(): Promise<string> {
  const [sessions, tasks, dailyStats, settings] = await Promise.all([
    db.sessions.toArray(),
    db.tasks.toArray(),
    db.dailyStats.toArray(),
    db.settings.toArray()
  ]);
  
  return JSON.stringify({
    version: 1,
    exportDate: new Date().toISOString(),
    sessions,
    tasks,
    dailyStats,
    settings
  }, null, 2);
}

/**
 * Import data from JSON
 */
export async function importData(jsonData: string): Promise<void> {
  try {
    const data = JSON.parse(jsonData);
    
    // Clear existing data
    await clearAllData();
    
    // Import new data
    if (data.sessions?.length > 0) {
      await db.sessions.bulkAdd(data.sessions);
    }
    if (data.tasks?.length > 0) {
      await db.tasks.bulkAdd(data.tasks);
    }
    if (data.dailyStats?.length > 0) {
      await db.dailyStats.bulkAdd(data.dailyStats);
    }
    if (data.settings?.length > 0) {
      // Delete existing settings first
      await db.settings.clear();
      await db.settings.bulkAdd(data.settings);
    }
  } catch (error) {
    console.error('Failed to import data:', error);
    throw new Error('Invalid data format');
  }
}
