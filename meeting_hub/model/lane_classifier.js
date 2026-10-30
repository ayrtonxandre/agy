/**
 * Meeting Lane Classifier
 * 
 * Pure function that classifies a mission meeting into one of 4 lanes:
 * 1. 'prep': Mission meetings starting in the next 48h (or in progress)
 * 2. 'fold': Meetings ended in the last 14 days with uncaptured minutes or pending in inbox
 * 3. 'folded': Meetings whose minutes are folded into mission notes
 * 4. 'hidden': Older than 14 days uncaptured, cancelled, or > 48h away
 * 
 * @param {Object} event - Normalized meeting event
 * @param {string|Object} inboxStatus - 'folded' | 'pending' | 'not_sent' or status object
 * @param {Date|string|number} now - Reference time (default: current Date)
 * @param {number} prepWindowHours - Hours ahead to include in prep (default: 48)
 * @returns {'prep' | 'fold' | 'folded' | 'hidden'}
 */

export function classifyMeeting(event, inboxStatus, now = new Date(), prepWindowHours = 48) {
  if (!event) return 'hidden';

  // Check cancelled or declined status
  if (event.status === 'cancelled' || event.status === 'declined') {
    return 'hidden';
  }

  // Check folded status
  const isFolded = typeof inboxStatus === 'string'
    ? inboxStatus === 'folded'
    : Boolean(inboxStatus && (inboxStatus.status === 'folded' || inboxStatus.isFolded));

  if (isFolded) {
    return 'folded';
  }

  const nowDate = now instanceof Date ? now : new Date(now);
  const nowMs = nowDate.getTime();

  // Helper to parse date consistently
  const parseTime = (dateStr, timeStr) => {
    if (timeStr && typeof timeStr === 'string' && timeStr.includes('T')) {
      const parsed = new Date(timeStr);
      if (!isNaN(parsed.getTime())) return parsed.getTime();
    }
    if (dateStr) {
      const parts = String(dateStr).split('-').map(Number);
      if (parts.length === 3) {
        const timeParts = String(timeStr || '00:00').split(':').map(Number);
        const d = new Date(parts[0], parts[1] - 1, parts[2], timeParts[0] || 0, timeParts[1] || 0, 0);
        return d.getTime();
      }
    }
    return 0;
  };

  let startMs = parseTime(event.date, event.start);
  let endMs = parseTime(event.date, event.end);

  if (!startMs) {
    return 'hidden';
  }
  if (!endMs || endMs <= startMs) {
    endMs = startMs + (event.durationMin || 45) * 60 * 1000;
  }

  const prepWindowMs = prepWindowHours * 60 * 60 * 1000;
  const foldWindowMs = 14 * 24 * 60 * 60 * 1000;

  // Case 1: Event has ended
  if (endMs <= nowMs) {
    const timeSinceEnd = nowMs - endMs;
    if (timeSinceEnd <= foldWindowMs) {
      return 'fold';
    }
    return 'hidden';
  }

  // Case 2: Event is in progress or starts in the next 48h
  if (startMs <= nowMs + prepWindowMs) {
    return 'prep';
  }

  // Case 3: Future event beyond prep window
  return 'hidden';
}
