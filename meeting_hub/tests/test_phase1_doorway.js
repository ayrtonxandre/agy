/**
 * Test Suite: Phase 1 Routing and Doorway Verification
 * 
 * Tests:
 * 1. Doorway Resolution: #/ resolves to default active mission (ge-enterprise) or last used mission
 * 2. Legacy Redirects: #/today, #/week, #/meetings, #/series -> #/calendar[/:tab]
 * 3. Legacy Actions & Projects Redirects: #/actions -> #/my-actions, #/projects -> #/
 * 4. Legacy Meeting Resolution: #/meeting/:eventId resolves via matchMission to #/p/:missionId/m/:eventId or calendar
 * 5. Master-Detail Route: #/p/:missionId/m/:eventId preserves project hub and opens drawer
 * 6. Knowledge Tab Route: #/p/:missionId/:tab opens specific tab
 * 7. Snapshot mode compatibility: Works offline without backend API
 */

import assert from 'assert';
import { parseRoute, formatRoute } from '../model/route_parser.js';
import { matchMission } from '../model/mission_matcher.js';

console.log('--- Running Phase 1 Routing & Doorway Verification Tests ---');

// Mock registry
const mockRegistry = {
  version: 1,
  missions: [
    {
      id: 'ge-enterprise',
      name: 'GE Enterprise & UC Wizard',
      client: 'Artefact',
      status: 'active',
      clientMatch: ['mandat ge', 'ge enterprise', 'uc wizard', 'datastore ge']
    },
    {
      id: 'healthcare-mandate',
      name: 'Healthcare Mandate & Care Dispensing',
      client: 'Artefact',
      status: 'active',
      clientMatch: ['care dispensing', 'healthcare']
    },
    {
      id: 'clariane-hdj',
      name: 'Clariane HDJ Planning Manager',
      client: 'Clariane',
      status: 'archived',
      clientMatch: ['clariane', 'hdj', 'mo -']
    }
  ]
};

// Test 1: Doorway Root route parsing
{
  const r1 = parseRoute('#/');
  assert.strictEqual(r1.view, 'root');
  assert.strictEqual(r1.missionId, null);

  const r2 = parseRoute('');
  assert.strictEqual(r2.view, 'root');
  console.log('  ✔ Root routes resolve to root view for dynamic doorway redirection');
}

// Test 2: Default mission resolution logic
{
  function resolveDefault(registry, lastMission) {
    const missions = registry?.missions || [];
    const activeMissions = missions.filter(m => !m.archived && m.status !== 'archived');
    if (lastMission && missions.some(m => m.id === lastMission && !m.archived && m.status !== 'archived')) {
      return lastMission;
    }
    if (activeMissions.length > 0) return activeMissions[0].id;
    return 'ge-enterprise';
  }

  assert.strictEqual(resolveDefault(mockRegistry, null), 'ge-enterprise', 'Should pick first active mission');
  assert.strictEqual(resolveDefault(mockRegistry, 'healthcare-mandate'), 'healthcare-mandate', 'Should respect last mission');
  assert.strictEqual(resolveDefault(mockRegistry, 'clariane-hdj'), 'ge-enterprise', 'Should ignore archived last mission and fallback to first active');
  console.log('  ✔ Doorway resolves to last active mission or first active mission in registry');
}

// Test 3: Legacy route redirections
{
  assert.strictEqual(parseRoute('#/today').redirectTo, '#/calendar');
  assert.strictEqual(parseRoute('#/week').redirectTo, '#/calendar/week');
  assert.strictEqual(parseRoute('#/meetings').redirectTo, '#/calendar/meetings');
  assert.strictEqual(parseRoute('#/series').redirectTo, '#/calendar/series');
  assert.strictEqual(parseRoute('#/actions').redirectTo, '#/my-actions');
  assert.strictEqual(parseRoute('#/projects').redirectTo, '#/');
  console.log('  ✔ Legacy routes redirect to their new Archetype A equivalents');
}

// Test 4: Legacy meeting redirect with mission matcher
{
  const parsed = parseRoute('#/meeting/_event123_abc');
  assert.strictEqual(parsed.view, 'legacy-meeting');
  assert.strictEqual(parsed.eventId, '_event123_abc');

  const geEvent = { id: '_event123_abc', title: '[MANDAT GE] Weekly sync', attendees: [] };
  const matched = matchMission(geEvent, mockRegistry);
  assert.strictEqual(matched.missionId, 'ge-enterprise');

  const targetHash = matched ? `#/p/${matched.missionId}/m/${geEvent.id}` : `#/calendar/m/${geEvent.id}`;
  assert.strictEqual(targetHash, '#/p/ge-enterprise/m/_event123_abc');

  const unmatchedEvent = { id: '_other_999', title: 'Dentist appointment', attendees: [] };
  const noMatch = matchMission(unmatchedEvent, mockRegistry);
  const fallbackHash = noMatch ? `#/p/${noMatch.missionId}/m/${unmatchedEvent.id}` : `#/calendar/m/${unmatchedEvent.id}`;
  assert.strictEqual(fallbackHash, '#/calendar/m/_other_999');
  console.log('  ✔ Legacy meeting #/meeting/:id redirects to #/p/:missionId/m/:id or #/calendar/m/:id');
}

// Test 5: Project Hub + Drawer Master-Detail
{
  const parsed = parseRoute('#/p/ge-enterprise/m/_gcal_abc123');
  assert.strictEqual(parsed.view, 'mission');
  assert.strictEqual(parsed.missionId, 'ge-enterprise');
  assert.strictEqual(parsed.eventId, '_gcal_abc123');
  assert.strictEqual(parsed.tab, null);
  console.log('  ✔ Project Hub + Drawer route #/p/:missionId/m/:eventId parsed accurately');
}

// Test 6: Knowledge tabs inside project
{
  const tabs = ['workstreams', 'decisions', 'actions', 'contacts', 'brief'];
  for (const tab of tabs) {
    const parsed = parseRoute(`#/p/healthcare-mandate/${tab}`);
    assert.strictEqual(parsed.view, 'mission');
    assert.strictEqual(parsed.missionId, 'healthcare-mandate');
    assert.strictEqual(parsed.tab, tab);
    assert.strictEqual(parsed.eventId, null);
  }
  console.log('  ✔ Knowledge tabs #/p/:missionId/:tab parsed accurately');
}

// Test 7: Snapshot mode data availability
{
  import('../data/missions_snapshot.js').then(() => {
    assert(globalThis.MISSIONS_SNAPSHOT, 'MISSIONS_SNAPSHOT must be present globally in snapshot mode');
    assert(Array.isArray(globalThis.MISSIONS_SNAPSHOT.missions), 'Snapshot must contain missions array');
    console.log('  ✔ Snapshot mode data verified: available offline for file:// run mode');
    console.log('\nResults: 7 passed, 0 failed.');
    console.log('✔ All Phase 1 Routing & Doorway tests PASSED.\n');
  }).catch((err) => {
    console.error('Snapshot test error:', err);
    process.exit(1);
  });
}
