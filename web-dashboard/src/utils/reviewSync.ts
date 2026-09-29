// ============================================================
// Web Client Offline Review Queue & Settings Sync Manager
// ============================================================

export interface OfflineReviewEvent {
  review_id: string;
  card_id: string;
  rating: number; // 1=Again, 2=Hard, 3=Good, 4=Easy
  client_time: string;
  device_id: string;
}

const QUEUE_KEY = 'lexiflow_offline_review_queue';
const SETTINGS_KEY = 'lexiflow_user_settings_cache';

export function getDeviceId(): string {
  let devId = localStorage.getItem('lexiflow_device_id');
  if (!devId) {
    devId = `web-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    localStorage.setItem('lexiflow_device_id', devId);
  }
  return devId;
}

export function getOfflineQueue(): OfflineReviewEvent[] {
  try {
    const raw = localStorage.getItem(QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (_) {
    return [];
  }
}

export function enqueueReviewEvent(event: Omit<OfflineReviewEvent, 'device_id'>): OfflineReviewEvent {
  const fullEvent: OfflineReviewEvent = {
    ...event,
    device_id: getDeviceId(),
  };

  const queue = getOfflineQueue();
  queue.push(fullEvent);
  localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));

  // Attempt background sync if online
  if (navigator.onLine) {
    flushReviewQueue().catch(console.error);
  }

  return fullEvent;
}

export async function flushReviewQueue(baseUrl: string = '/api/v1'): Promise<boolean> {
  const queue = getOfflineQueue();
  if (queue.length === 0) return true;

  try {
    const res = await fetch(`${baseUrl}/flashcards/review-events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ events: queue }),
    });

    if (res.ok) {
      // Successfully synced all queued events
      localStorage.setItem(QUEUE_KEY, JSON.stringify([]));
      return true;
    }
  } catch (err) {
    console.warn('[ReviewSync] Offline or server error during flush:', err);
  }

  return false;
}

// User Settings Synchronization (Dark mode, auto-play IPA, etc.)
export async function syncUserSettings(
  settings: Record<string, string>,
  baseUrl: string = '/api/v1',
  uid?: string
): Promise<Record<string, { value: string; updated_at: string }>> {
  const payload = Object.entries(settings).map(([key, value]) => ({
    key,
    value,
    updated_at: new Date().toISOString(),
  }));

  try {
    const res = await fetch(`${baseUrl}/users/settings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ uid, settings: payload }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.settings) {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(data.settings));
        return data.settings;
      }
    }
  } catch (err) {
    console.warn('[SettingsSync] Failed to sync settings:', err);
  }

  // Fallback to local cache
  try {
    const cached = localStorage.getItem(SETTINGS_KEY);
    return cached ? JSON.parse(cached) : {};
  } catch (_) {
    return {};
  }
}

// Register auto sync on online event
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    flushReviewQueue().catch(console.error);
  });
}
