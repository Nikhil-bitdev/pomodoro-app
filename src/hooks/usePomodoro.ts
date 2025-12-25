import { useState, useEffect, useCallback, useRef } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, Session, updateDailyStats } from '../lib/database';
import {
  showWorkCompleteNotification,
  showBreakCompleteNotification,
  showLongBreakCompleteNotification,
  playNotificationSound,
  requestNotificationPermission,
  showDailyGoalAchievedNotification
} from '../lib/notifications';
import {
  enableFocusMode,
  disableFocusMode,
  updatePageTitle,
  resetPageTitle,
  updateFavicon
} from '../lib/focusMode';
import { formatTime, getTodayKey } from '../utils/dateHelpers';

export type TimerStatus = 'idle' | 'running' | 'paused';
export type SessionType = 'work' | 'break' | 'longBreak';

interface TimerState {
  timeRemaining: number; // in seconds
  status: TimerStatus;
  sessionType: SessionType;
  sessionCount: number;
  currentTaskId: number | null;
  sessionStartTime: Date | null;
}

const TIMER_STATE_KEY = 'pomodoro_timer_state';

/**
 * Load timer state from localStorage
 */
function loadTimerState(): TimerState | null {
  try {
    const saved = localStorage.getItem(TIMER_STATE_KEY);
    if (saved) {
      const state = JSON.parse(saved);
      // Convert sessionStartTime back to Date if it exists
      if (state.sessionStartTime) {
        state.sessionStartTime = new Date(state.sessionStartTime);
      }
      return state;
    }
  } catch (error) {
    console.error('Failed to load timer state:', error);
  }
  return null;
}

/**
 * Save timer state to localStorage
 */
function saveTimerState(state: TimerState): void {
  try {
    localStorage.setItem(TIMER_STATE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error('Failed to save timer state:', error);
  }
}

/**
 * Custom hook for Pomodoro timer logic
 */
export function usePomodoro() {
  // Load settings from database
  const settings = useLiveQuery(() => db.settings.get(1));

  // Load today's sessions for count
  const todaySessions = useLiveQuery(async () => {
    const today = getTodayKey();
    const stats = await db.dailyStats.where('date').equals(today).first();
    return stats?.completedSessions || 0;
  });

  // Initialize state from localStorage or defaults
  const [state, setState] = useState<TimerState>(() => {
    const saved = loadTimerState();
    if (saved) {
      return saved;
    }
    return {
      timeRemaining: 25 * 60, // Default 25 minutes
      status: 'idle',
      sessionType: 'work',
      sessionCount: 0,
      currentTaskId: null,
      sessionStartTime: null
    };
  });

  const intervalRef = useRef<number | null>(null);
  const lastTickRef = useRef<number>(Date.now());

  // Save state whenever it changes
  useEffect(() => {
    saveTimerState(state);
  }, [state]);

  // Update settings when they change
  useEffect(() => {
    if (settings && state.status === 'idle') {
      let duration: number;
      switch (state.sessionType) {
        case 'work':
          duration = settings.workDuration * 60;
          break;
        case 'break':
          duration = settings.shortBreakDuration * 60;
          break;
        case 'longBreak':
          duration = settings.longBreakDuration * 60;
          break;
      }
      
      if (state.timeRemaining !== duration) {
        setState(prev => ({ ...prev, timeRemaining: duration }));
      }
    }
  }, [settings, state.status, state.sessionType, state.timeRemaining]);

  // Update page title and favicon
  useEffect(() => {
    if (state.status === 'running' || state.status === 'paused') {
      const timeStr = formatTime(state.timeRemaining);
      const typeStr = state.sessionType === 'work' ? 'Focus' : 'Break';
      updatePageTitle(timeStr, typeStr);
      updateFavicon(state.sessionType);
    } else {
      resetPageTitle();
      updateFavicon('idle');
    }
  }, [state.timeRemaining, state.status, state.sessionType]);

  /**
   * Timer tick function with drift correction
   */
  const tick = useCallback(() => {
    const now = Date.now();
    const deltaSeconds = Math.floor((now - lastTickRef.current) / 1000);
    lastTickRef.current = now;

    setState(prev => {
      const newTime = Math.max(0, prev.timeRemaining - deltaSeconds);
      
      if (newTime === 0 && prev.timeRemaining > 0) {
        // Session completed
        handleSessionComplete(prev);
      }
      
      return {
        ...prev,
        timeRemaining: newTime
      };
    });
  }, []);

  /**
   * Start or resume timer
   */
  const start = useCallback(async (taskId?: number) => {
    if (!settings) return;

    // Request notification permission on first start
    await requestNotificationPermission();

    setState(prev => {
      const isNewSession = prev.status === 'idle';
      
      return {
        ...prev,
        status: 'running',
        sessionStartTime: isNewSession ? new Date() : prev.sessionStartTime,
        currentTaskId: taskId !== undefined ? taskId : prev.currentTaskId
      };
    });

    // Enable focus mode for work sessions
    if (state.sessionType === 'work') {
      await enableFocusMode();
    }

    // Start interval
    lastTickRef.current = Date.now();
    intervalRef.current = window.setInterval(tick, 1000);
  }, [settings, state.sessionType, tick]);

  /**
   * Pause timer
   */
  const pause = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setState(prev => ({ ...prev, status: 'paused' }));
  }, []);

  /**
   * Reset timer to initial state
   */
  const reset = useCallback(async () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (!settings) return;

    await disableFocusMode();

    let duration: number;
    switch (state.sessionType) {
      case 'work':
        duration = settings.workDuration * 60;
        break;
      case 'break':
        duration = settings.shortBreakDuration * 60;
        break;
      case 'longBreak':
        duration = settings.longBreakDuration * 60;
        break;
    }

    setState(prev => ({
      ...prev,
      timeRemaining: duration,
      status: 'idle',
      sessionStartTime: null
    }));
  }, [settings, state.sessionType]);

  /**
   * Skip to next session
   */
  const skip = useCallback(async () => {
    if (state.status === 'running' && state.sessionStartTime) {
      // Save interrupted session
      await saveSession(state, true);
    }
    
    await switchToNextSession();
  }, [state]);

  /**
   * Handle session completion
   */
  const handleSessionComplete = useCallback(async (completedState: TimerState) => {
    // Stop interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // Save completed session
    await saveSession(completedState, false);

    // Play sound if enabled
    if (settings?.soundEnabled) {
      playNotificationSound();
    }

    // Show notification
    if (completedState.sessionType === 'work') {
      const newCount = (todaySessions || 0) + 1;
      showWorkCompleteNotification(newCount);
      
      // Check if daily goal achieved
      if (settings && newCount === settings.dailyGoal) {
        showDailyGoalAchievedNotification(settings.dailyGoal);
      }

      // Increment task pomodoros if task is assigned
      if (completedState.currentTaskId) {
        await incrementTaskPomodoros(completedState.currentTaskId);
      }
    } else if (completedState.sessionType === 'break') {
      showBreakCompleteNotification();
    } else {
      showLongBreakCompleteNotification();
    }

    await disableFocusMode();

    // Switch to next session
    setTimeout(() => {
      switchToNextSession();
    }, 1000);
  }, [settings, todaySessions]);

  /**
   * Save session to database
   */
  const saveSession = async (sessionState: TimerState, interrupted: boolean): Promise<void> => {
    if (!sessionState.sessionStartTime || !settings) return;

    const endTime = new Date();
    const durationMinutes = Math.floor(
      (endTime.getTime() - sessionState.sessionStartTime.getTime()) / 60000
    );

    const session: Session = {
      startTime: sessionState.sessionStartTime,
      endTime,
      duration: durationMinutes,
      type: sessionState.sessionType,
      taskId: sessionState.currentTaskId || undefined,
      completed: !interrupted,
      interrupted
    };

    await db.sessions.add(session);

    // Update daily stats
    if (!interrupted) {
      await updateDailyStats(getTodayKey(), sessionState.sessionType, durationMinutes);
    }
  };

  /**
   * Increment task completed pomodoros
   */
  const incrementTaskPomodoros = async (taskId: number): Promise<void> => {
    const task = await db.tasks.get(taskId);
    if (task) {
      await db.tasks.update(taskId, {
        completedPomodoros: task.completedPomodoros + 1
      });
    }
  };

  /**
   * Switch to next session type
   */
  const switchToNextSession = useCallback(async () => {
    if (!settings) return;

    setState(prev => {
      let nextType: SessionType;
      let nextCount = prev.sessionCount;

      if (prev.sessionType === 'work') {
        nextCount += 1;
        // Check if it's time for long break
        if (nextCount % settings.sessionsBeforeLongBreak === 0) {
          nextType = 'longBreak';
        } else {
          nextType = 'break';
        }
      } else {
        // After any break, go back to work
        nextType = 'work';
      }

      let duration: number;
      switch (nextType) {
        case 'work':
          duration = settings.workDuration * 60;
          break;
        case 'break':
          duration = settings.shortBreakDuration * 60;
          break;
        case 'longBreak':
          duration = settings.longBreakDuration * 60;
          break;
      }

      const newState: TimerState = {
        timeRemaining: duration,
        status: 'idle',
        sessionType: nextType,
        sessionCount: nextCount,
        currentTaskId: nextType === 'work' ? prev.currentTaskId : null,
        sessionStartTime: null
      };

      // Auto-start if enabled
      if (
        (nextType === 'work' && settings.autoStartPomodoros) ||
        (nextType !== 'work' && settings.autoStartBreaks)
      ) {
        setTimeout(() => start(), 500);
      }

      return newState;
    });
  }, [settings, start]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Re-sync timer when page becomes visible (handles tab switching)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && state.status === 'running') {
        lastTickRef.current = Date.now();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [state.status]);

  return {
    timeRemaining: state.timeRemaining,
    status: state.status,
    sessionType: state.sessionType,
    sessionCount: state.sessionCount,
    currentTaskId: state.currentTaskId,
    formattedTime: formatTime(state.timeRemaining),
    start,
    pause,
    reset,
    skip,
    settings
  };
}
