import { useState, useEffect, useRef, useCallback } from 'react';
import { db, SessionType } from '../lib/database';
import { useSettings } from './useSettings';
import { showNotification } from '../lib/notifications';
import { enableFocusMode, disableFocusMode } from '../lib/focusMode';
import { getOrCreateDailyStats, updateDailyStats } from '../lib/database';
import { isToday } from '../utils/dateHelpers';

type TimerStatus = 'idle' | 'running' | 'paused';

const TIMER_STATE_KEY = 'pomodoro-timer-state';

interface TimerState {
  timeRemaining: number;
  status: TimerStatus;
  sessionType: SessionType;
  sessionCount: number;
  currentTaskId: number | null;
  lastUpdated: number;
}

export const usePomodoro = () => {
  const { settings } = useSettings();
  const [timeRemaining, setTimeRemaining] = useState(1500); // 25 minutes default
  const [status, setStatus] = useState<TimerStatus>('idle');
  const [sessionType, setSessionType] = useState<SessionType>('work');
  const [sessionCount, setSessionCount] = useState(0);
  const [currentTaskId, setCurrentTaskId] = useState<number | null>(null);
  
  const intervalRef = useRef<number | null>(null);
  const lastTickRef = useRef<number>(Date.now());
  const startTimeRef = useRef<number>(Date.now());

  // Load saved timer state on mount
  useEffect(() => {
    const savedState = localStorage.getItem(TIMER_STATE_KEY);
    if (savedState) {
      try {
        const state: TimerState = JSON.parse(savedState);
        // Calculate elapsed time since last update
        const elapsed = Math.floor((Date.now() - state.lastUpdated) / 1000);
        const newTimeRemaining = Math.max(0, state.timeRemaining - (state.status === 'running' ? elapsed : 0));
        
        setTimeRemaining(newTimeRemaining);
        setStatus(newTimeRemaining > 0 ? state.status : 'idle');
        setSessionType(state.sessionType);
        setSessionCount(state.sessionCount);
        setCurrentTaskId(state.currentTaskId);
      } catch (error) {
        console.error('Failed to load timer state:', error);
      }
    }
  }, []);

  // Save timer state whenever it changes
  useEffect(() => {
    const state: TimerState = {
      timeRemaining,
      status,
      sessionType,
      sessionCount,
      currentTaskId,
      lastUpdated: Date.now()
    };
    localStorage.setItem(TIMER_STATE_KEY, JSON.stringify(state));
  }, [timeRemaining, status, sessionType, sessionCount, currentTaskId]);

  // Initialize time remaining based on session type and settings
  useEffect(() => {
    if (!settings) return;
    
    if (status === 'idle') {
      const duration = sessionType === 'work'
        ? settings.workDuration
        : sessionType === 'break'
        ? settings.shortBreakDuration
        : settings.longBreakDuration;
      
      setTimeRemaining(duration * 60);
    }
  }, [sessionType, settings, status]);

  // Timer countdown logic with drift correction
  useEffect(() => {
    if (status !== 'running') {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    lastTickRef.current = Date.now();
    startTimeRef.current = Date.now();

    intervalRef.current = window.setInterval(() => {
      const now = Date.now();
      const actualElapsed = Math.floor((now - lastTickRef.current) / 1000);
      lastTickRef.current = now;

      setTimeRemaining(prev => {
        const newTime = Math.max(0, prev - actualElapsed);
        
        if (newTime === 0) {
          handleSessionComplete();
        }
        
        return newTime;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [status]);

  const handleSessionComplete = useCallback(async () => {
    if (!settings) return;

    // Save session to database
    const duration = sessionType === 'work'
      ? settings.workDuration
      : sessionType === 'break'
      ? settings.shortBreakDuration
      : settings.longBreakDuration;

    await db.sessions.add({
      type: sessionType,
      duration,
      completedAt: new Date(),
      taskId: currentTaskId || undefined
    });

    // Update daily stats if it's a work session
    if (sessionType === 'work') {
      const stats = await getOrCreateDailyStats();
      await updateDailyStats({
        completedPomodoros: stats.completedPomodoros + 1,
        minutesFocused: stats.minutesFocused + duration
      });

      // Update task pomodoro count
      if (currentTaskId) {
        const task = await db.tasks.get(currentTaskId);
        if (task) {
          await db.tasks.update(currentTaskId, {
            completedPomodoros: (task.completedPomodoros || 0) + 1
          });
        }
      }
    }

    // Show notification
    const nextSession = getNextSessionType();
    showNotification(
      `${sessionType === 'work' ? 'Work' : 'Break'} session complete!`,
      `Time for ${nextSession === 'work' ? 'a work session' : 'a break'}.`
    );

    // Auto-start next session if enabled
    if (settings.autoStartBreak && sessionType === 'work') {
      setSessionType(nextSession);
      setStatus('idle');
      setTimeout(() => setStatus('running'), 1000);
    } else if (settings.autoStartPomodoro && sessionType !== 'work') {
      setSessionType(nextSession);
      setStatus('idle');
      setTimeout(() => setStatus('running'), 1000);
    } else {
      setSessionType(nextSession);
      setStatus('idle');
    }
  }, [sessionType, sessionCount, currentTaskId, settings]);

  const getNextSessionType = useCallback((): SessionType => {
    if (!settings) return 'break';
    
    if (sessionType === 'work') {
      const nextCount = sessionCount + 1;
      setSessionCount(nextCount);
      return nextCount % settings.longBreakInterval === 0 ? 'longBreak' : 'break';
    }
    return 'work';
  }, [sessionType, sessionCount, settings]);

  const start = useCallback((taskId?: number) => {
    setStatus('running');
    if (taskId !== undefined) {
      setCurrentTaskId(taskId);
    }
    if (settings?.focusModeEnabled) {
      enableFocusMode();
    }
  }, [settings]);

  const pause = useCallback(() => {
    setStatus('paused');
    disableFocusMode();
  }, []);

  const reset = useCallback(() => {
    setStatus('idle');
    setCurrentTaskId(null);
    disableFocusMode();
    
    if (settings) {
      const duration = sessionType === 'work'
        ? settings.workDuration
        : sessionType === 'break'
        ? settings.shortBreakDuration
        : settings.longBreakDuration;
      
      setTimeRemaining(duration * 60);
    }
  }, [sessionType, settings]);

  const skip = useCallback(() => {
    setStatus('idle');
    disableFocusMode();
    setSessionType(getNextSessionType());
  }, [getNextSessionType]);

  const formatTime = useCallback((seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  return {
    timeRemaining,
    status,
    sessionType,
    sessionCount,
    currentTaskId,
    formattedTime: formatTime(timeRemaining),
    start,
    pause,
    reset,
    skip,
    settings
  };
};
