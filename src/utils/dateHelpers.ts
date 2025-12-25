import { format, startOfDay, endOfDay, subDays, isToday, differenceInCalendarDays, parseISO } from 'date-fns';

/**
 * Format date to YYYY-MM-DD string
 */
export function formatDateKey(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

/**
 * Get today's date key
 */
export function getTodayKey(): string {
  return formatDateKey(new Date());
}

/**
 * Format time remaining in MM:SS format
 */
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

/**
 * Get start and end of today
 */
export function getTodayRange(): { start: Date; end: Date } {
  const now = new Date();
  return {
    start: startOfDay(now),
    end: endOfDay(now)
  };
}

/**
 * Get date range for last N days
 */
export function getLastNDaysRange(days: number): { start: Date; end: Date } {
  const now = new Date();
  return {
    start: startOfDay(subDays(now, days - 1)),
    end: endOfDay(now)
  };
}

/**
 * Check if date is today
 */
export function isDateToday(date: Date): boolean {
  return isToday(date);
}

/**
 * Calculate days between two dates
 */
export function daysBetween(date1: Date, date2: Date): number {
  return Math.abs(differenceInCalendarDays(date1, date2));
}

/**
 * Parse date key string to Date
 */
export function parseDateKey(dateKey: string): Date {
  return parseISO(dateKey);
}

/**
 * Get array of date keys for last N days
 */
export function getLastNDaysKeys(days: number): string[] {
  const keys: string[] = [];
  const today = new Date();
  
  for (let i = days - 1; i >= 0; i--) {
    const date = subDays(today, i);
    keys.push(formatDateKey(date));
  }
  
  return keys;
}

/**
 * Format duration in minutes to readable string
 */
export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours === 0) {
    return `${mins}m`;
  }
  
  return mins === 0 ? `${hours}h` : `${hours}h ${mins}m`;
}

/**
 * Get day of week name
 */
export function getDayName(date: Date): string {
  return format(date, 'EEEE');
}

/**
 * Format date for display
 */
export function formatDisplayDate(date: Date): string {
  return format(date, 'MMM d, yyyy');
}
