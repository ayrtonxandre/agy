/**
 * Calendar Import Filtering & Meeting Deletion Tests
 */
import assert from 'assert';
import { EventModel } from '../model/event.js';
import { MeetingHubStore } from '../model/store.js';

async function runTests() {
  console.log('--- Running Calendar Import & Deletion Tests ---');
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

  test('EventModel.isDeletedOrDeclined detects deleted IDs, cancelled status, and self-declined attendees', () => {
    const deletedSet = new Set(['del-123']);
    assert.strictEqual(EventModel.isDeletedOrDeclined({ id: 'del-123', summary: 'Normal' }, deletedSet), true);
    assert.strictEqual(EventModel.isDeletedOrDeclined({ id: 'ok-1', status: 'cancelled' }, deletedSet), true);
    assert.strictEqual(EventModel.isDeletedOrDeclined({ id: 'ok-2', summary: 'Canceled: Point Hebdo' }, deletedSet), true);
    assert.strictEqual(EventModel.isDeletedOrDeclined({
      id: 'ok-3',
      summary: 'Team Sync',
      attendees: [{ email: 'ayrton.andre@artefact.com', self: true, status: 'declined' }]
    }, deletedSet), true);
    assert.strictEqual(EventModel.isDeletedOrDeclined({
      id: 'ok-4',
      summary: 'Active Sync',
      status: 'confirmed',
      attendees: [{ email: 'ayrton.andre@artefact.com', self: true, status: 'accepted' }]
    }, deletedSet), false);
  });

  const store = new MeetingHubStore();
  await store.init();

  await asyncTest('Clean snapshot has zero self-declined or stale deleted events', async () => {
    const events = store.getAllEvents();
    assert(events.length >= 150, `Expected at least 150 clean events, got ${events.length}`);
    const hasCareSlides = events.some(e => e.title.includes('[CARE DISPENSING] - Creating amazing slides'));
    assert.strictEqual(hasCareSlides, false, 'Deleted Care Dispensing slides meeting must not be present');
  });

  await asyncTest('store.deleteEvent removes meeting and store.restoreEvent restores it', async () => {
    const initialCount = store.getAllEvents().length;
    const target = store.getAllEvents()[0];
    assert(target && target.id, 'Must have a target event to delete');

    const deleted = await store.deleteEvent(target.id);
    assert(deleted, 'deleteEvent must return the deleted event object');
    assert.strictEqual(store.getEvent(target.id), null, 'Deleted event must no longer be in store');
    assert.strictEqual(store.getAllEvents().length, initialCount - 1);
    assert(store.getDeletedEventIds().includes(target.id), 'Deleted ID must be recorded in deletedEventIds');

    // Refresh cache should keep it deleted
    await store.refreshCache();
    assert.strictEqual(store.getEvent(target.id), null, 'Deleted event must stay deleted after refreshCache');

    // Restore
    const restored = await store.restoreEvent(deleted);
    assert(restored, 'restoreEvent must return the restored event');
    assert(store.getEvent(target.id), 'Restored event must be back in store');
    assert.strictEqual(store.getAllEvents().length, initialCount);
  });

  await asyncTest('store.getProjectName and getMissionHubData work for ge-enterprise', async () => {
    const name = store.getProjectName('ge-enterprise');
    assert.strictEqual(name, 'GE Enterprise & UC Wizard');
    const hubData = await store.getMissionHubData('ge-enterprise', new Date('2026-10-30T15:00:00Z'));
    assert(hubData && hubData.mission, 'Must return mission hub data for ge-enterprise');
    assert.strictEqual(hubData.mission.id, 'ge-enterprise');
  });

  console.log(`\nResults: ${passed} passed, ${failed} failed.`);
  if (failed > 0) process.exit(1);
  console.log('✔ All Calendar Import & Deletion tests PASSED.\n');
}

runTests();
