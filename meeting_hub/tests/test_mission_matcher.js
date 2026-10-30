/**
 * Unit tests for Mission Matcher (Phase 1 / Phase 3.1)
 */
import assert from 'assert';
import { matchMission } from '../model/mission_matcher.js';

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

console.log('--- Running Mission Matcher Verification Tests ---');

const mockRegistry = [
  {
    id: 'ge-enterprise',
    name: 'GE Enterprise & UC Wizard',
    clientMatch: ['ge enterprise', 'uc wizard', 'datastore ge', 'weekly sync - ge enterprise', '[mandat ge]', 'mandat ge']
  },
  {
    id: 'healthcare-mandate',
    name: 'Healthcare Mandate & Care Dispensing',
    clientMatch: ['care dispensing', '[care dispensing]', 'healthcare', 'healthoween']
  },
  {
    id: 'pridefact',
    name: 'PrideFact - Mandat RSE',
    clientMatch: ['pridefact', '[pridefact]', 'mandat rse', 'charte du cercle']
  },
  {
    id: 'counseling',
    name: 'Counseling & People Governance',
    clientMatch: ['counseling', 'peer reviews'],
    contacts: ['Roland Juilhard', 'Jamila NASRI']
  },
  {
    id: 'clariane-hdj',
    name: 'Clariane HDJ Planning Manager',
    clientMatch: ['[mo]', '[hdj]', '[invoicing]', 'clariane', 'suivi anomalies']
  }
];

// 1. Bracket Title Tags (Priority 1)
test('Priority 1: Matches [MANDAT GE] to ge-enterprise', () => {
  const event = { title: '[MANDAT GE] Synchronisation transverse', client: 'Artefact' };
  const res = matchMission(event, mockRegistry);
  assert.strictEqual(res.missionId, 'ge-enterprise');
  assert.strictEqual(res.confidence, 'high');
});

test('Priority 1: Matches [CARE DISPENSING] to healthcare-mandate', () => {
  const event = { title: '[CARE DISPENSING] - Creation & cadrage offre', client: 'Artefact' };
  const res = matchMission(event, mockRegistry);
  assert.strictEqual(res.missionId, 'healthcare-mandate');
  assert.strictEqual(res.confidence, 'high');
});

test('Priority 1: Matches [PrideFact] to pridefact', () => {
  const event = { title: '[PrideFact] Session de travail Charte', client: 'Artefact' };
  const res = matchMission(event, mockRegistry);
  assert.strictEqual(res.missionId, 'pridefact');
  assert.strictEqual(res.confidence, 'high');
});

test('Priority 1: Matches [MO] to clariane-hdj', () => {
  const event = { title: '[MO] Point de suivi interne', client: 'Clariane' };
  const res = matchMission(event, mockRegistry);
  assert.strictEqual(res.missionId, 'clariane-hdj');
  assert.strictEqual(res.confidence, 'high');
});

// 2. Keyword & clientMatch (Priority 2)
test('Priority 2: Matches "Weekly sync - GE Enterprise" without brackets', () => {
  const event = { title: 'Weekly sync - GE Enterprise', client: 'Artefact' };
  const res = matchMission(event, mockRegistry);
  assert.strictEqual(res.missionId, 'ge-enterprise');
  assert.ok(res.confidence === 'high' || res.confidence === 'medium');
});

test('Priority 2: Matches event tags or client field', () => {
  const event = { title: 'Atelier de restitution', tags: ['care dispensing'] };
  const res = matchMission(event, mockRegistry);
  assert.strictEqual(res.missionId, 'healthcare-mandate');
});

// 3. Attendee Overlap (Priority 3)
test('Priority 3: Matches attendee Jamila NASRI to counseling', () => {
  const event = { title: 'Café - Mentoring', attendees: ['Ayrton André', 'Jamila NASRI'] };
  const res = matchMission(event, mockRegistry);
  assert.strictEqual(res.missionId, 'counseling');
  assert.strictEqual(res.confidence, 'medium');
});

test('Priority 3: Matches attendee Roland Juilhard to counseling', () => {
  const event = { title: 'Point carrière Q4', attendees: ['Ayrton André', 'Roland Juilhard'] };
  const res = matchMission(event, mockRegistry);
  assert.strictEqual(res.missionId, 'counseling');
  assert.strictEqual(res.confidence, 'medium');
});

// 4. Unmatched event
test('Unmatched event returns null', () => {
  const event = { title: 'TECHDREDI 5pm', client: '', attendees: ['Equipe Tech'] };
  const res = matchMission(event, mockRegistry);
  assert.strictEqual(res, null);
});

console.log(`\nResults: ${passed} passed, ${failed} failed.`);
if (failed > 0) process.exit(1);
console.log('✔ All Mission Matcher verification tests PASSED.');
