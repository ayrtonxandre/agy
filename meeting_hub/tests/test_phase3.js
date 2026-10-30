/**
 * Phase 3 Integration Tests
 * 
 * Verifies:
 * 1. Store integration with missions registry and note summaries.
 * 2. Honest coverage computation (2 of 17 meetings folded).
 * 3. Note actions and decisions contract mapping (single source of truth).
 * 4. Meeting inbox status detection (folded vs not_sent).
 * 5. PrepScoreCalculator inbox pending evaluation.
 */
import assert from 'assert';
import { MeetingHubStore } from '../model/store.js';
import { PrepScoreCalculator } from '../model/prep_score.js';

async function runTests() {
  console.log('--- Running Phase 3 Verification Tests ---');
  let passed = 0;
  let failed = 0;

  function test(name, fn) {
    try {
      fn();
      console.log(`  ✔ ${name}`);
      passed++;
    } catch (err) {
      console.error(`  ✘ ${name}`);
      console.error(err);
      failed++;
    }
  }

  async function asyncTest(name, fn) {
    try {
      await fn();
      console.log(`  ✔ ${name}`);
      passed++;
    } catch (err) {
      console.error(`  ✘ ${name}`);
      console.error(err);
      failed++;
    }
  }

  const store = new MeetingHubStore();
  await store.init();

  // Test 1: Registry loading
  await asyncTest('Store: getMissionsRegistry returns clariane-hdj', async () => {
    const registry = await store.getMissionsRegistry();
    assert(Array.isArray(registry), 'Registry must be an array');
    assert(registry.length >= 1, 'Registry must contain at least 1 mission');
    const clariane = registry.find(m => m.id === 'clariane-hdj');
    assert(clariane, 'clariane-hdj must be registered');
    assert.strictEqual(clariane.name, 'Clariane HDJ Planning Manager');
  });

  // Test 2: Note summary parser
  await asyncTest('Store: getMissionSummary returns parsed markdown notes', async () => {
    const summary = await store.getMissionSummary('clariane-hdj');
    assert(summary, 'Summary must not be null');
    assert(Array.isArray(summary.workstreams), 'Must have workstreams');
    assert.strictEqual(summary.workstreams.length, 4, 'Must have 4 workstreams');
    assert(Array.isArray(summary.decisions), 'Must have decisions');
    assert.strictEqual(summary.decisions.length, 16, 'Must have 16 decisions');
    assert(Array.isArray(summary.actions), 'Must have actions');
    assert.strictEqual(summary.actions.length, 9, 'Must have 9 actions');
    assert(Array.isArray(summary.openPoints), 'Must have open points');
    assert.strictEqual(summary.openPoints.length, 16, 'Must have 16 open points');
  });

  // Test 3: ProjectBase contract mapping & honest coverage
  await asyncTest('Store: getProjectBase maps note summary to ProjectBase contract', async () => {
    const pb = await store.getProjectBase('clariane-hdj');
    assert(pb, 'ProjectBase must not be null');
    assert.strictEqual(pb.projectName, 'Clariane HDJ Planning Manager');
    assert.strictEqual(pb.coverageText, `2 of ${pb.totalMeetings} meetings folded`);
    assert.strictEqual(pb.actionStats.total, 9);
    assert.strictEqual(pb.actionStats.open, 7);
    assert.strictEqual(pb.actionStats.done, 2);
    assert.strictEqual(pb.actionStats.artefactOpen, 4);
    assert.strictEqual(pb.actionStats.clientOpen, 3);
    assert.strictEqual(pb.decisionStats.total, 16);
    assert.strictEqual(pb.openPointsStats.total, 16);
    assert.strictEqual(pb.workstreams.length, 4);
    // Workstream 0 (Coordination) should have open points attached
    assert(pb.workstreams[0].openPoints.length > 0, 'Workstream 0 must have open points');
  });

  // Test 4: Single source of truth action contract
  await asyncTest('Actions Single Source of Truth: Note actions point to Actions.md', async () => {
    const pb = await store.getProjectBase('clariane-hdj');
    const firstAct = pb.actionMatrix[0];
    assert(firstAct.id.startsWith('ACT-CLAR-'), `Action ID must start with ACT-CLAR-, got ${firstAct.id}`);
    assert.strictEqual(firstAct.file, 'Actions.md');
    assert(firstAct.owner, 'Action must have an owner');
    assert(firstAct.ownerOrg, 'Action must have an owner organization');
  });

  // Test 5: Meeting Inbox Status
  await asyncTest('Inbox Status: detects folded meeting and not_sent meeting', async () => {
    const arbellesMeetingId = '_60q30c1g60o30e1i60o4ac1g60rj8gpl88rj2c1h84s34h9g60s30c1g60o30c1g60o48h9m6gsj2d9m6l248h1g64o30c1g60o30c1g60o30c1g60o32c1g60o30c1g8or38d236kpj2c9m6co3ihhk6p0k2d1o651k2gi184ojeh1l8p30';
    const statusFolded = await store.getMeetingInboxStatus(arbellesMeetingId, 'clariane-hdj');
    assert.strictEqual(statusFolded, 'folded', 'Arbelles meeting must be detected as folded');

    const statusUnsent = await store.getMeetingInboxStatus('unknown-event-id-9999', 'clariane-hdj');
    assert.strictEqual(statusUnsent, 'not_sent', 'Unknown meeting must be not_sent');
  });

  // Test 6: PrepScoreCalculator inbox pending evaluation
  test('PrepScoreCalculator: flags pending inbox raw minutes', () => {
    const mockMeeting = { attendees: ['Ayrton André', 'Lucile Colin'] };
    const prepPending = PrepScoreCalculator.computeMeetingPrep(mockMeeting, {}, [], { inboxStatus: 'pending' });
    assert.strictEqual(prepPending.inbox.pending, true);
    assert.strictEqual(prepPending.inbox.label, 'Inbox pending');
    assert(prepPending.inbox.detail.includes('waiting to be folded'));

    const prepFolded = PrepScoreCalculator.computeMeetingPrep(mockMeeting, {}, [], { inboxStatus: 'folded' });
    assert.strictEqual(prepFolded.inbox.pending, false);
    assert.strictEqual(prepFolded.inbox.label, 'Folded');
  });

  console.log(`\nResults: ${passed} passed, ${failed} failed.`);
  if (failed > 0) process.exit(1);
  console.log('✔ All Phase 3 verification tests PASSED.\n');
}

runTests();
