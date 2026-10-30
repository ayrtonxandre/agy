/**
 * Unit tests for pure Route Parser (Phase 1)
 */
import assert from 'assert';
import { parseRoute, formatRoute } from '../model/route_parser.js';

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`  ✔ ${name}`);
    passed++;
  } catch (err) {
    console.error(`  ✘ ${name}`);
    console.error(`    ${err.message}`);
    failed++;
  }
}

console.log('--- Running Route Parser Verification Tests ---');

// 1. Root Route
test('Root hash routes resolve to root view', () => {
  ['', '#', '#/', '#//', '   ', null, undefined].forEach(hash => {
    const r = parseRoute(hash);
    assert.strictEqual(r.view, 'root', `Failed on ${hash}`);
    assert.strictEqual(r.missionId, null);
    assert.strictEqual(r.eventId, null);
    assert.strictEqual(r.tab, null);
  });
});

// 2. Project Hub Routes
test('Project hub without drawer: #/p/:missionId', () => {
  const r = parseRoute('#/p/ge-enterprise');
  assert.strictEqual(r.view, 'mission');
  assert.strictEqual(r.missionId, 'ge-enterprise');
  assert.strictEqual(r.eventId, null);
  assert.strictEqual(r.tab, null);
});

test('Project hub with meeting drawer: #/p/:missionId/m/:eventId', () => {
  // Long Google event ID starting with '_'
  const googleEventId = '_60q30c1g60o30c1g60o30c1g60o30c1g60o30c1g60o30c1g60o30c1g60o30c1g';
  const r = parseRoute(`#/p/ge-enterprise/m/${googleEventId}`);
  assert.strictEqual(r.view, 'mission');
  assert.strictEqual(r.missionId, 'ge-enterprise');
  assert.strictEqual(r.eventId, googleEventId);
  assert.strictEqual(r.tab, null);
});

test('Project hub with encoded event ID and query params', () => {
  const r = parseRoute('#/p/healthcare-mandate/m/%5Fevent%2F123?ref=test');
  assert.strictEqual(r.view, 'mission');
  assert.strictEqual(r.missionId, 'healthcare-mandate');
  assert.strictEqual(r.eventId, '_event/123');
  assert.strictEqual(r.tab, null);
});

test('Project hub with knowledge tabs: #/p/:missionId/:tab', () => {
  const tabs = ['workstreams', 'decisions', 'actions', 'contacts', 'brief'];
  for (const tab of tabs) {
    const r = parseRoute(`#/p/pridefact/${tab}`);
    assert.strictEqual(r.view, 'mission');
    assert.strictEqual(r.missionId, 'pridefact');
    assert.strictEqual(r.eventId, null);
    assert.strictEqual(r.tab, tab);
  }
});

// 3. Cross-mission Routes
test('Cross-mission Inbox: #/inbox', () => {
  const r = parseRoute('#/inbox');
  assert.strictEqual(r.view, 'inbox');
  assert.strictEqual(r.missionId, null);
  assert.strictEqual(r.eventId, null);
});

test('Cross-mission My Actions: #/my-actions', () => {
  const r = parseRoute('#/my-actions');
  assert.strictEqual(r.view, 'my-actions');
  assert.strictEqual(r.missionId, null);
  assert.strictEqual(r.eventId, null);
});

// 4. Calendar Routes
test('Calendar views: #/calendar, #/calendar/week, #/calendar/meetings, #/calendar/series', () => {
  assert.strictEqual(parseRoute('#/calendar').view, 'calendar');
  assert.strictEqual(parseRoute('#/calendar').tab, 'today');

  assert.strictEqual(parseRoute('#/calendar/week').view, 'calendar');
  assert.strictEqual(parseRoute('#/calendar/week').tab, 'week');

  assert.strictEqual(parseRoute('#/calendar/meetings').view, 'calendar');
  assert.strictEqual(parseRoute('#/calendar/meetings').tab, 'meetings');

  assert.strictEqual(parseRoute('#/calendar/series').view, 'calendar');
  assert.strictEqual(parseRoute('#/calendar/series').tab, 'series');
});

test('Calendar with meeting drawer: #/calendar/m/:eventId', () => {
  const r = parseRoute('#/calendar/m/_some_event_123');
  assert.strictEqual(r.view, 'calendar');
  assert.strictEqual(r.tab, 'today');
  assert.strictEqual(r.eventId, '_some_event_123');
});

// 5. Legacy Route Aliases
test('Legacy aliases redirect to new equivalents', () => {
  const today = parseRoute('#/today');
  assert.strictEqual(today.isLegacy, true);
  assert.strictEqual(today.redirectTo, '#/calendar');

  const week = parseRoute('#/week');
  assert.strictEqual(week.isLegacy, true);
  assert.strictEqual(week.redirectTo, '#/calendar/week');

  const meetings = parseRoute('#/meetings');
  assert.strictEqual(meetings.isLegacy, true);
  assert.strictEqual(meetings.redirectTo, '#/calendar/meetings');

  const series = parseRoute('#/series');
  assert.strictEqual(series.isLegacy, true);
  assert.strictEqual(series.redirectTo, '#/calendar/series');

  const actions = parseRoute('#/actions');
  assert.strictEqual(actions.isLegacy, true);
  assert.strictEqual(actions.redirectTo, '#/my-actions');

  const projects = parseRoute('#/projects');
  assert.strictEqual(projects.isLegacy, true);
  assert.strictEqual(projects.redirectTo, '#/');
});

test('Legacy meeting route parses event ID correctly', () => {
  const googleId = '_60q30c1g60o30c1g60o30c1g60o30c1g';
  const r = parseRoute(`#/meeting/${googleId}`);
  assert.strictEqual(r.view, 'legacy-meeting');
  assert.strictEqual(r.isLegacy, true);
  assert.strictEqual(r.eventId, googleId);
});

// 6. formatRoute helper
test('formatRoute generates canonical URLs', () => {
  assert.strictEqual(formatRoute({ view: 'mission', missionId: 'ge-enterprise' }), '#/p/ge-enterprise');
  assert.strictEqual(formatRoute({ view: 'mission', missionId: 'ge-enterprise', eventId: '_evt1' }), '#/p/ge-enterprise/m/_evt1');
  assert.strictEqual(formatRoute({ view: 'mission', missionId: 'ge-enterprise', tab: 'decisions' }), '#/p/ge-enterprise/decisions');
  assert.strictEqual(formatRoute({ view: 'inbox' }), '#/inbox');
  assert.strictEqual(formatRoute({ view: 'my-actions' }), '#/my-actions');
  assert.strictEqual(formatRoute({ view: 'calendar' }), '#/calendar');
  assert.strictEqual(formatRoute({ view: 'calendar', tab: 'week' }), '#/calendar/week');
  assert.strictEqual(formatRoute({ view: 'calendar', eventId: '_evt1' }), '#/calendar/m/_evt1');
});

console.log(`\nResults: ${passed} passed, ${failed} failed.`);
if (failed > 0) process.exit(1);
console.log('✔ All Route Parser verification tests PASSED.');
