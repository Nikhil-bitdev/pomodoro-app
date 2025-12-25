import { useLiveQuery } from 'dexie-react-hooks';
import { useCallback } from 'react';
import { db, Settings } from '../lib/database';

/**
 * Custom hook for managing app settings
 */
export function useSettings() {
  // Load settings from database
  const settings = useLiveQuery(() => db.settings.get(1));

  /**
   * Update settings
   */
  const updateSettings = useCallback(async (
    updates: Partial<Omit<Settings, 'id'>>
  ): Promise<void> => {
    await db.settings.update(1, updates);
  }, []);

  /**
   * Update work duration
   */
  const setWorkDuration = useCallback(async (minutes: number): Promise<void> => {
    await updateSettings({ workDuration: Math.max(5, Math.min(60, minutes)) });
  }, [updateSettings]);

  /**
   * Update short break duration
   */
  const setShortBreakDuration = useCallback(async (minutes: number): Promise<void> => {
    await updateSettings({ shortBreakDuration: Math.max(1, Math.min(30, minutes)) });
  }, [updateSettings]);

  /**
   * Update long break duration
   */
  const setLongBreakDuration = useCallback(async (minutes: number): Promise<void> => {
    await updateSettings({ longBreakDuration: Math.max(5, Math.min(60, minutes)) });
  }, [updateSettings]);

  /**
   * Update sessions before long break
   */
  const setSessionsBeforeLongBreak = useCallback(async (count: number): Promise<void> => {
    await updateSettings({ sessionsBeforeLongBreak: Math.max(2, Math.min(6, count)) });
  }, [updateSettings]);

  /**
   * Toggle auto-start breaks
   */
  const toggleAutoStartBreaks = useCallback(async (): Promise<void> => {
    if (settings) {
      await updateSettings({ autoStartBreaks: !settings.autoStartBreaks });
    }
  }, [settings, updateSettings]);

  /**
   * Toggle auto-start pomodoros
   */
  const toggleAutoStartPomodoros = useCallback(async (): Promise<void> => {
    if (settings) {
      await updateSettings({ autoStartPomodoros: !settings.autoStartPomodoros });
    }
  }, [settings, updateSettings]);

  /**
   * Toggle sound
   */
  const toggleSound = useCallback(async (): Promise<void> => {
    if (settings) {
      await updateSettings({ soundEnabled: !settings.soundEnabled });
    }
  }, [settings, updateSettings]);

  /**
   * Toggle theme
   */
  const toggleTheme = useCallback(async (): Promise<void> => {
    if (settings) {
      const newTheme = settings.theme === 'light' ? 'dark' : 'light';
      await updateSettings({ theme: newTheme });
      
      // Apply theme to document
      if (newTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, [settings, updateSettings]);

  /**
   * Set daily goal
   */
  const setDailyGoal = useCallback(async (goal: number): Promise<void> => {
    await updateSettings({ dailyGoal: Math.max(1, Math.min(12, goal)) });
  }, [updateSettings]);

  /**
   * Initialize theme on mount
   */
  const initializeTheme = useCallback(() => {
    if (settings) {
      if (settings.theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, [settings]);

  return {
    settings,
    updateSettings,
    setWorkDuration,
    setShortBreakDuration,
    setLongBreakDuration,
    setSessionsBeforeLongBreak,
    toggleAutoStartBreaks,
    toggleAutoStartPomodoros,
    toggleSound,
    toggleTheme,
    setDailyGoal,
    initializeTheme
  };
}
