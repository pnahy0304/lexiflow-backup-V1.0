// ============================================================
// Deterministic SM-2 Spaced Repetition Engine
// Recalculates card state from append-only review_logs timeline
// ============================================================

export interface ReviewEvent {
  review_id: string;
  uid: string;
  card_id: string;
  rating: number; // 1=Again, 2=Hard, 3=Good, 4=Easy
  client_time: string;
  server_time?: string;
  device_id?: string;
  is_undone?: number;
}

export interface SM2State {
  interval: number;
  easeFactor: number;
  repetitions: number;
  nextReview: string;
}

/**
 * Calculates SM-2 state transition for a single rating event.
 * Rating: 1 = Again, 2 = Hard, 3 = Good, 4 = Easy
 */
export function calculateNextSM2State(currentState: SM2State, rating: number, eventTimeISO: string): SM2State {
  let { interval, easeFactor, repetitions } = currentState;
  const eventDate = new Date(eventTimeISO);
  const baseTime = isNaN(eventDate.getTime()) ? new Date() : eventDate;

  if (rating === 1) {
    // Again: reset repetitions, interval = 1 day, decrease ease factor
    repetitions = 0;
    interval = 1;
    easeFactor = Math.max(1.3, easeFactor - 0.2);
  } else if (rating === 2) {
    // Hard: increment repetitions, small interval increase, decrease ease factor slightly
    repetitions += 1;
    interval = interval === 0 ? 1 : Math.round(interval * 1.2);
    easeFactor = Math.max(1.3, easeFactor - 0.15);
  } else if (rating === 3) {
    // Good: increment repetitions, standard interval scale by easeFactor
    repetitions += 1;
    if (interval === 0) {
      interval = 1;
    } else if (interval === 1) {
      interval = 6;
    } else {
      interval = Math.round(interval * easeFactor);
    }
  } else if (rating === 4) {
    // Easy: increment repetitions, bonus interval scale, increase ease factor
    repetitions += 1;
    if (interval === 0) {
      interval = 2;
    } else if (interval === 1) {
      interval = 6;
    } else {
      interval = Math.round(interval * easeFactor * 1.3);
    }
    easeFactor = easeFactor + 0.15;
  }

  // Calculate next_review date = event_time + interval (in days)
  const nextReviewDate = new Date(baseTime.getTime() + interval * 24 * 60 * 60 * 1000);
  const nextReview = nextReviewDate.toISOString();

  return {
    interval,
    easeFactor,
    repetitions,
    nextReview
  };
}

/**
 * Recalculates card SM-2 state from all non-undone review events in chronological order.
 */
export function recalculateSM2FromEvents(events: ReviewEvent[]): SM2State {
  // Initial default state
  let state: SM2State = {
    interval: 0,
    easeFactor: 2.5,
    repetitions: 0,
    nextReview: new Date().toISOString()
  };

  // Sort events chronologically by server_time or client_time
  const validEvents = events
    .filter(e => !e.is_undone)
    .sort((a, b) => {
      const timeA = new Date(a.server_time || a.client_time).getTime();
      const timeB = new Date(b.server_time || b.client_time).getTime();
      return timeA - timeB;
    });

  for (const evt of validEvents) {
    const timeISO = evt.client_time || evt.server_time || new Date().toISOString();
    state = calculateNextSM2State(state, evt.rating, timeISO);
  }

  return state;
}
