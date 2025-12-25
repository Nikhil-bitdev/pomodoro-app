/**
 * Focus mode utilities for web
 */

let wakeLock: WakeLockSentinel | null = null;

/**
 * Check if Screen Wake Lock API is supported
 */
export function isWakeLockSupported(): boolean {
  return 'wakeLock' in navigator;
}

/**
 * Request screen wake lock to prevent screen from dimming
 */
export async function requestWakeLock(): Promise<boolean> {
  if (!isWakeLockSupported()) {
    return false;
  }

  try {
    wakeLock = await navigator.wakeLock.request('screen');
    
    wakeLock.addEventListener('release', () => {
      console.log('Wake Lock released');
    });

    return true;
  } catch (error) {
    console.error('Failed to request wake lock:', error);
    return false;
  }
}

/**
 * Release screen wake lock
 */
export async function releaseWakeLock(): Promise<void> {
  if (wakeLock) {
    try {
      await wakeLock.release();
      wakeLock = null;
    } catch (error) {
      console.error('Failed to release wake lock:', error);
    }
  }
}

/**
 * Enter fullscreen mode
 */
export async function enterFullscreen(): Promise<boolean> {
  if (!document.fullscreenElement) {
    try {
      await document.documentElement.requestFullscreen();
      return true;
    } catch (error) {
      console.error('Failed to enter fullscreen:', error);
      return false;
    }
  }
  return true;
}

/**
 * Exit fullscreen mode
 */
export async function exitFullscreen(): Promise<void> {
  if (document.fullscreenElement) {
    try {
      await document.exitFullscreen();
    } catch (error) {
      console.error('Failed to exit fullscreen:', error);
    }
  }
}

/**
 * Check if currently in fullscreen
 */
export function isFullscreen(): boolean {
  return !!document.fullscreenElement;
}

/**
 * Update page title with timer status
 */
export function updatePageTitle(timeRemaining: string, sessionType: string): void {
  document.title = `${timeRemaining} - ${sessionType} | Focus Tracker`;
}

/**
 * Reset page title to default
 */
export function resetPageTitle(): void {
  document.title = 'Focus Tracker - Pomodoro Timer';
}

/**
 * Change favicon based on session type
 */
export function updateFavicon(sessionType: 'work' | 'break' | 'longBreak' | 'idle'): void {
  const link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
  if (!link) return;

  // You would have different favicon files for each state
  const faviconMap: Record<typeof sessionType, string> = {
    work: '/favicon-work.ico',
    break: '/favicon-break.ico',
    longBreak: '/favicon-break.ico',
    idle: '/favicon.ico'
  };

  link.href = faviconMap[sessionType] || faviconMap.idle;
}

/**
 * Enable focus mode features
 */
export async function enableFocusMode(): Promise<void> {
  await requestWakeLock();
  // Could add more focus mode features here
}

/**
 * Disable focus mode features
 */
export async function disableFocusMode(): Promise<void> {
  await releaseWakeLock();
  await exitFullscreen();
  resetPageTitle();
  updateFavicon('idle');
}
