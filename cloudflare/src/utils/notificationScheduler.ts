// ============================================================
// LexiFlow Notification Scheduler & IANA Timezone + DND Service
// ============================================================

export interface UserSchedule {
  uid: string;
  enabled: boolean;
  timeOfDay: string; // "HH:MM" e.g. "20:00"
  daysOfWeek: number[]; // 0=Sun, 1=Mon, ..., 6=Sat
  timezone: string; // IANA string e.g. "Asia/Ho_Chi_Minh"
  dndStart: string; // e.g. "22:00"
  dndEnd: string; // e.g. "07:00"
  lastSentAt?: string;
}

/**
 * Convert UTC date to local time components in target IANA timezone
 */
export function getLocalTimeInTimezone(utcDate: Date, timeZone: string): { hour: number; minute: number; dayOfWeek: number; localTimeStr: string } {
  try {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone,
      hour: 'numeric',
      minute: 'numeric',
      weekday: 'short',
      hour12: false
    });

    const parts = formatter.formatToParts(utcDate);
    let hour = 0;
    let minute = 0;
    let weekdayStr = '';

    for (const part of parts) {
      if (part.type === 'hour') hour = parseInt(part.value, 10) % 24;
      if (part.type === 'minute') minute = parseInt(part.value, 10);
      if (part.type === 'weekday') weekdayStr = part.value;
    }

    const dayMap: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
    const dayOfWeek = dayMap[weekdayStr] ?? utcDate.getUTCDay();
    const localTimeStr = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;

    return { hour, minute, dayOfWeek, localTimeStr };
  } catch (err) {
    // Fallback to UTC if timezone is invalid
    const hour = utcDate.getUTCHour();
    const minute = utcDate.getUTCMinutes();
    const dayOfWeek = utcDate.getUTCDay();
    return { hour, minute, dayOfWeek, localTimeStr: `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}` };
  }
}

/**
 * Check if given HH:MM time falls within Quiet Hours / DND range (supporting overnight span e.g. 22:00 - 07:00)
 */
export function isInQuietHours(localTimeStr: string, dndStart: string = '22:00', dndEnd: string = '07:00'): boolean {
  const [lH, lM] = localTimeStr.split(':').map(Number);
  const [sH, sM] = dndStart.split(':').map(Number);
  const [eH, eM] = dndEnd.split(':').map(Number);

  const localMins = lH * 60 + lM;
  const startMins = sH * 60 + sM;
  const endMins = eH * 60 + eM;

  if (startMins > endMins) {
    // Overnight DND (e.g. 22:00 to 07:00)
    return localMins >= startMins || localMins < endMins;
  } else {
    // Same day DND (e.g. 13:00 to 14:00)
    return localMins >= startMins && localMins < endMins;
  }
}

/**
 * Evaluates whether a notification should be dispatched right now
 */
export function shouldSendNotification(schedule: UserSchedule, utcNow: Date = new Date()): { shouldSend: boolean; reason: string } {
  if (!schedule.enabled) {
    return { shouldSend: false, reason: 'Notification disabled' };
  }

  const localInfo = getLocalTimeInTimezone(utcNow, schedule.timezone);

  // Check DND
  if (isInQuietHours(localInfo.localTimeStr, schedule.dndStart, schedule.dndEnd)) {
    return { shouldSend: false, reason: `Suppressed by Backend DND Quiet Hours (${schedule.dndStart} - ${schedule.dndEnd})` };
  }

  // Check Day of Week
  if (schedule.daysOfWeek.length > 0 && !schedule.daysOfWeek.includes(localInfo.dayOfWeek)) {
    return { shouldSend: false, reason: 'Day of week not matched' };
  }

  // Check Time of Day (within 15 min window)
  const [targetH, targetM] = schedule.timeOfDay.split(':').map(Number);
  const targetMins = targetH * 60 + targetM;
  const currentMins = localInfo.hour * 60 + localInfo.minute;

  const diffMins = Math.abs(currentMins - targetMins);
  if (diffMins > 15) {
    return { shouldSend: false, reason: `Time mismatch (Target: ${schedule.timeOfDay}, Current Local: ${localInfo.localTimeStr})` };
  }

  // Deduplication check
  if (schedule.lastSentAt) {
    const lastSentDate = new Date(schedule.lastSentAt);
    const hrsSinceLast = (utcNow.getTime() - lastSentDate.getTime()) / (1000 * 60 * 60);
    if (hrsSinceLast < 12) {
      return { shouldSend: false, reason: 'Already sent within 12 hours' };
    }
  }

  return { shouldSend: true, reason: 'Matched schedule & passed DND check' };
}
