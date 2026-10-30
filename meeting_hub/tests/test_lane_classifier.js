/**
 * Unit Tests for Meeting Lane Classifier (Phase 3.3)
 */
import { classifyMeeting } from '../model/lane_classifier.js';

function runTests() {
  console.log('Testing classifyMeeting pure function...');

  // October 30, 2026 12:00:00 Local Time
  const refNow = new Date(2026, 9, 30, 12, 0, 0);

  // 1. Folded meeting always goes to 'folded' lane
  const foldedEv = { id: 'm1', date: '2026-10-28', start: '10:00', end: '11:00' };
  assert(classifyMeeting(foldedEv, 'folded', refNow) === 'folded', 'Folded status routes to folded lane');
  assert(classifyMeeting(foldedEv, { status: 'folded' }, refNow) === 'folded', 'Folded status object routes to folded lane');

  // 2. Upcoming meeting within 48h goes to 'prep'
  const upcomingSoon = { id: 'm2', date: '2026-10-31', start: '10:00', end: '11:00' }; // 22h away
  assert(classifyMeeting(upcomingSoon, 'not_sent', refNow) === 'prep', 'Meeting 22h away routes to prep');

  const upcomingEdge = { id: 'm3', date: '2026-11-01', start: '11:00', end: '12:00' }; // 47h away
  assert(classifyMeeting(upcomingEdge, 'not_sent', refNow) === 'prep', 'Meeting 47h away routes to prep');

  // 3. Upcoming meeting beyond 48h is hidden
  const upcomingFar = { id: 'm4', date: '2026-11-05', start: '10:00', end: '11:00' }; // 6 days away
  assert(classifyMeeting(upcomingFar, 'not_sent', refNow) === 'hidden', 'Meeting > 48h away is hidden from stream');

  // 4. Meeting in progress routes to 'prep'
  const inProgress = { id: 'm5', date: '2026-10-30', start: '11:30', end: '12:30' };
  assert(classifyMeeting(inProgress, 'not_sent', refNow) === 'prep', 'Meeting currently in progress routes to prep');

  // 5. Past meeting ended in last 14 days without minutes goes to 'fold'
  const recentPast = { id: 'm6', date: '2026-10-29', start: '14:00', end: '15:00' }; // Yesterday
  assert(classifyMeeting(recentPast, 'not_sent', refNow) === 'fold', 'Yesterday meeting with uncaptured minutes routes to fold');
  assert(classifyMeeting(recentPast, 'pending', refNow) === 'fold', 'Yesterday meeting pending in inbox routes to fold');

  // 6. Past meeting ended 12 days ago goes to 'fold'
  const twelveDaysAgo = { id: 'm7', date: '2026-10-18', start: '10:00', end: '11:00' };
  assert(classifyMeeting(twelveDaysAgo, 'not_sent', refNow) === 'fold', 'Meeting 12 days ago routes to fold');

  // 7. Past meeting ended > 14 days ago without minutes is hidden
  const fifteenDaysAgo = { id: 'm8', date: '2026-10-15', start: '10:00', end: '11:00' };
  assert(classifyMeeting(fifteenDaysAgo, 'not_sent', refNow) === 'hidden', 'Meeting 15 days ago without minutes is hidden');

  // 8. Cancelled / declined meetings are hidden
  const cancelled = { id: 'm9', date: '2026-10-31', start: '10:00', end: '11:00', status: 'cancelled' };
  assert(classifyMeeting(cancelled, 'not_sent', refNow) === 'hidden', 'Cancelled meeting is hidden');

  const declined = { id: 'm10', date: '2026-10-31', start: '10:00', end: '11:00', status: 'declined' };
  assert(classifyMeeting(declined, 'not_sent', refNow) === 'hidden', 'Declined meeting is hidden');

  console.log('✔ All 10 lane_classifier tests passed successfully.');
}

function assert(condition, message) {
  if (!condition) {
    console.error(`FAIL: ${message}`);
    process.exit(1);
  }
}

runTests();
