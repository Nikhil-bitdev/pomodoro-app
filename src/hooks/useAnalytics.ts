import { useLiveQuery } from 'dexie-react-hooks';
import { useCallback } from 'react';
import { db } from '../lib/database';
import {
  getTodayKey,
  getLastNDaysKeys,
  formatDateKey,
} from '../utils/dateHelpers';
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';

interface AnalyticsSummary {
  totalPomodoros: number;
  totalMinutes: number;
  totalTasks: number;
  currentStreak: number;
  longestStreak: number;
  completionRate: number;
}

interface HeatmapData {
  date: string;
  count: number;
}

interface ChartData {
  date: string;
  pomodoros: number;
  minutes: number;
  tasks: number;
}

/**
 * Custom hook for analytics and statistics
 */
export function useAnalytics() {
  // Load all daily stats
  const allStats = useLiveQuery(() =>
    db.dailyStats.orderBy('date').reverse().toArray()
  );

  // Load today's stats
  const todayStats = useLiveQuery(() =>
    db.dailyStats.where('date').equals(getTodayKey()).first()
  );

  // Load all sessions
  const allSessions = useLiveQuery(() =>
    db.sessions.orderBy('startTime').reverse().toArray()
  );

  /**
   * Get analytics summary for a date range
   */
  const getSummary = useCallback(async (days: number = 30): Promise<AnalyticsSummary> => {
    const dateKeys = getLastNDaysKeys(days);
    const stats = await db.dailyStats
      .where('date')
      .anyOf(dateKeys)
      .toArray();

    const totalPomodoros = stats.reduce((sum, s) => sum + s.completedPomodoros, 0);
    const totalMinutes = stats.reduce((sum, s) => sum + s.minutesFocused, 0);
    const totalTasks = stats.reduce((sum, s) => sum + s.tasksCompleted, 0);

    // Calculate streak
    const { currentStreak, longestStreak } = await calculateStreaks();

    // Calculate completion rate
    const daysWithData = stats.filter(s => s.completedPomodoros > 0).length;
    const completionRate = daysWithData / days;

    return {
      totalPomodoros,
      totalMinutes,
      totalTasks,
      currentStreak,
      longestStreak,
      completionRate
    };
  }, []);

  /**
   * Calculate current and longest streak
   */
  const calculateStreaks = useCallback(async (): Promise<{
    currentStreak: number;
    longestStreak: number;
  }> => {
    const stats = await db.dailyStats.orderBy('date').reverse().toArray();
    
    if (stats.length === 0) {
      return { currentStreak: 0, longestStreak: 0 };
    }

    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    
    const today = getTodayKey();
    let expectedDate = today;

    for (const stat of stats) {
      if (stat.date === expectedDate && stat.completedPomodoros > 0) {
        tempStreak++;
        if (stat.date === today || tempStreak > 1) {
          currentStreak = tempStreak;
        }
        longestStreak = Math.max(longestStreak, tempStreak);
        
        // Move to previous day
        const currentDate = new Date(stat.date);
        currentDate.setDate(currentDate.getDate() - 1);
        expectedDate = formatDateKey(currentDate);
      } else {
        // Streak broken
        if (stat.date !== today) {
          currentStreak = 0;
        }
        tempStreak = 0;
        break;
      }
    }

    return { currentStreak, longestStreak };
  }, []);

  /**
   * Get heatmap data for the last year
   */
  const getHeatmapData = useCallback(async (): Promise<HeatmapData[]> => {
    const dateKeys = getLastNDaysKeys(365);
    const stats = await db.dailyStats
      .where('date')
      .anyOf(dateKeys)
      .toArray();

    const statsMap = new Map(stats.map(s => [s.date, s.completedPomodoros]));

    return dateKeys.map(date => ({
      date,
      count: statsMap.get(date) || 0
    }));
  }, []);

  /**
   * Get chart data for a specific period
   */
  const getChartData = useCallback(async (days: number): Promise<ChartData[]> => {
    const dateKeys = getLastNDaysKeys(days);
    const stats = await db.dailyStats
      .where('date')
      .anyOf(dateKeys)
      .toArray();

    const statsMap = new Map(
      stats.map(s => [s.date, {
        pomodoros: s.completedPomodoros,
        minutes: s.minutesFocused,
        tasks: s.tasksCompleted
      }])
    );

    return dateKeys.map(date => ({
      date,
      pomodoros: statsMap.get(date)?.pomodoros || 0,
      minutes: statsMap.get(date)?.minutes || 0,
      tasks: statsMap.get(date)?.tasks || 0
    })).reverse();
  }, []);

  /**
   * Get stats for current week
   */
  const getWeekStats = useCallback(async (): Promise<AnalyticsSummary> => {
    const now = new Date();
    const weekStart = startOfWeek(now, { weekStartsOn: 1 }); // Monday
    const weekEnd = endOfWeek(now, { weekStartsOn: 1 });

    const stats = await db.dailyStats.toArray();
    const weekStats = stats.filter(s => {
      const date = new Date(s.date);
      return isWithinInterval(date, { start: weekStart, end: weekEnd });
    });

    const totalPomodoros = weekStats.reduce((sum, s) => sum + s.completedPomodoros, 0);
    const totalMinutes = weekStats.reduce((sum, s) => sum + s.minutesFocused, 0);
    const totalTasks = weekStats.reduce((sum, s) => sum + s.tasksCompleted, 0);

    const { currentStreak, longestStreak } = await calculateStreaks();
    const completionRate = weekStats.filter(s => s.completedPomodoros > 0).length / 7;

    return {
      totalPomodoros,
      totalMinutes,
      totalTasks,
      currentStreak,
      longestStreak,
      completionRate
    };
  }, [calculateStreaks]);

  /**
   * Get stats for current month
   */
  const getMonthStats = useCallback(async (): Promise<AnalyticsSummary> => {
    const now = new Date();
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);

    const stats = await db.dailyStats.toArray();
    const monthStats = stats.filter(s => {
      const date = new Date(s.date);
      return isWithinInterval(date, { start: monthStart, end: monthEnd });
    });

    const totalPomodoros = monthStats.reduce((sum, s) => sum + s.completedPomodoros, 0);
    const totalMinutes = monthStats.reduce((sum, s) => sum + s.minutesFocused, 0);
    const totalTasks = monthStats.reduce((sum, s) => sum + s.tasksCompleted, 0);

    const { currentStreak, longestStreak } = await calculateStreaks();
    const daysInMonth = monthEnd.getDate();
    const completionRate = monthStats.filter(s => s.completedPomodoros > 0).length / daysInMonth;

    return {
      totalPomodoros,
      totalMinutes,
      totalTasks,
      currentStreak,
      longestStreak,
      completionRate
    };
  }, [calculateStreaks]);

  /**
   * Get average pomodoros per day
   */
  const getAveragePomodoros = useCallback(async (days: number): Promise<number> => {
    const dateKeys = getLastNDaysKeys(days);
    const stats = await db.dailyStats
      .where('date')
      .anyOf(dateKeys)
      .toArray();

    if (stats.length === 0) return 0;

    const total = stats.reduce((sum, s) => sum + s.completedPomodoros, 0);
    return total / days;
  }, []);

  /**
   * Get most productive day of week
   */
  const getMostProductiveDay = useCallback(async (): Promise<string> => {
    const stats = await db.dailyStats.toArray();
    
    const dayTotals = new Map<number, number>();
    
    stats.forEach(stat => {
      const date = new Date(stat.date);
      const dayOfWeek = date.getDay();
      const current = dayTotals.get(dayOfWeek) || 0;
      dayTotals.set(dayOfWeek, current + stat.completedPomodoros);
    });

    let maxDay = 0;
    let maxPomodoros = 0;

    dayTotals.forEach((pomodoros, day) => {
      if (pomodoros > maxPomodoros) {
        maxPomodoros = pomodoros;
        maxDay = day;
      }
    });

    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[maxDay];
  }, []);

  return {
    allStats,
    todayStats,
    allSessions,
    getSummary,
    calculateStreaks,
    getHeatmapData,
    getChartData,
    getWeekStats,
    getMonthStats,
    getAveragePomodoros,
    getMostProductiveDay
  };
}
