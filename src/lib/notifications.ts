/**
 * Web Notifications API wrapper
 */

export type NotificationPermissionStatus = 'granted' | 'denied' | 'default';

/**
 * Check if notifications are supported
 */
export function isNotificationSupported(): boolean {
  return 'Notification' in window;
}

/**
 * Get current notification permission status
 */
export function getNotificationPermission(): NotificationPermissionStatus {
  if (!isNotificationSupported()) {
    return 'denied';
  }
  return Notification.permission;
}

/**
 * Request notification permission
 */
export async function requestNotificationPermission(): Promise<NotificationPermissionStatus> {
  if (!isNotificationSupported()) {
    return 'denied';
  }

  if (Notification.permission === 'granted') {
    return 'granted';
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission;
  }

  return Notification.permission;
}

/**
 * Show a notification
 */
export function showNotification(
  title: string,
  options?: NotificationOptions
): Notification | null {
  if (!isNotificationSupported() || Notification.permission !== 'granted') {
    return null;
  }

  try {
    const notification = new Notification(title, {
      badge: '/favicon.ico',
      icon: '/pwa-192x192.png',
      ...options
    });

    // Focus window when notification is clicked
    notification.onclick = () => {
      window.focus();
      notification.close();
    };

    return notification;
  } catch (error) {
    console.error('Failed to show notification:', error);
    return null;
  }
}

/**
 * Show work session complete notification
 */
export function showWorkCompleteNotification(sessionCount: number): void {
  showNotification('🎉 Work Session Complete!', {
    body: `Great focus! Time for a break. Sessions completed: ${sessionCount}`,
    tag: 'session-complete',
    requireInteraction: false
  });
}

/**
 * Show break complete notification
 */
export function showBreakCompleteNotification(): void {
  showNotification('✅ Break Over!', {
    body: 'Ready for another focused session?',
    tag: 'break-complete',
    requireInteraction: false
  });
}

/**
 * Show long break complete notification
 */
export function showLongBreakCompleteNotification(): void {
  showNotification('🌟 Long Break Complete!', {
    body: 'Feeling refreshed? Let\'s get back to work!',
    tag: 'break-complete',
    requireInteraction: false
  });
}

/**
 * Show daily goal achieved notification
 */
export function showDailyGoalAchievedNotification(goal: number): void {
  showNotification('🏆 Daily Goal Achieved!', {
    body: `Amazing! You've completed ${goal} sessions today!`,
    tag: 'goal-achieved',
    requireInteraction: false
  });
}

/**
 * Show streak milestone notification
 */
export function showStreakMilestoneNotification(streak: number): void {
  let emoji = '🔥';
  let message = `You're on a ${streak}-day streak!`;

  if (streak === 7) {
    emoji = '📅';
    message = 'Week streak achieved!';
  } else if (streak === 30) {
    emoji = '🏅';
    message = 'Month streak achieved!';
  } else if (streak === 100) {
    emoji = '🏆';
    message = '100-day streak! Legendary!';
  }

  showNotification(`${emoji} Streak Milestone!`, {
    body: message,
    tag: 'streak-milestone',
    requireInteraction: false
  });
}

/**
 * Play notification sound
 */
export function playNotificationSound(): void {
  try {
    const audio = new Audio('/notification.mp3');
    audio.volume = 0.5;
    audio.play().catch(err => {
      console.warn('Failed to play notification sound:', err);
    });
  } catch (error) {
    console.warn('Audio not supported:', error);
  }
}
