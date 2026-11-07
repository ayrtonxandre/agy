/**
 * Automated JS verification for Action Editing
 */
import assert from 'assert';
import { MeetingHubStore } from '../model/store.js';
import { ActionModal } from '../ui/action_modal.js';

async function runTests() {
  console.log('--- Testing Store.updateAction ---');
  const store = new MeetingHubStore();
  
  // Test updating ACT-PRF-05
  const origSummary = await store.getMissionSummary('pridefact');
  const actPrf = (origSummary.actions || []).find(a => a.id === 'ACT-PRF-05');
  assert(actPrf, 'ACT-PRF-05 must exist in pridefact');

  const updateResult = await store.updateAction('ACT-PRF-05', {
    title: 'Envoyer le budget actualisé test store',
    owner: 'Ayrton André',
    workstream: 'Synchro Mandat & Direction',
    dueDate: '2026-11-25'
  }, 'pridefact');

  assert.strictEqual(updateResult.actionId, 'ACT-PRF-05');
  assert.strictEqual(updateResult.title, 'Envoyer le budget actualisé test store');
  assert.strictEqual(updateResult.owner, 'Ayrton André');
  assert.strictEqual(updateResult.workstream, 'Synchro Mandat & Direction');
  assert.strictEqual(updateResult.due, '2026-11-25');

  // Verify cache invalidation and updated summary
  const refreshedSummary = await store.getMissionSummary('pridefact');
  const refreshedAct = (refreshedSummary.actions || []).find(a => a.id === 'ACT-PRF-05');
  assert.strictEqual(refreshedAct.title, 'Envoyer le budget actualisé test store');
  assert.strictEqual(refreshedAct.due, '2026-11-25');

  // Restore
  await store.updateAction('ACT-PRF-05', {
    title: actPrf.title,
    owner: actPrf.owner,
    workstream: actPrf.workstream,
    dueDate: actPrf.due
  }, 'pridefact');

  const restoredSummary = await store.getMissionSummary('pridefact');
  const restoredAct = (restoredSummary.actions || []).find(a => a.id === 'ACT-PRF-05');
  assert.strictEqual(restoredAct.title, actPrf.title);
  assert.strictEqual(restoredAct.due, actPrf.due);

  console.log('✔ Store.updateAction test passed!');

  console.log('--- Testing ActionModal API ---');
  const modal = new ActionModal({ store });
  assert(typeof modal.open === 'function');
  assert(typeof modal.close === 'function');
  console.log('✔ ActionModal API test passed!');

  console.log('All Action Editing tests passed successfully!');
}

runTests().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
