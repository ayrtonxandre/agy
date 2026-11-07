/**
 * Unit & Integration Test Suite for Phase 5: Frictionless Capture
 * 
 * Verifies:
 * 1. Capture Idempotency (created vs exists vs replaced)
 * 2. Unassigned Inbox capture, listing, and assignment
 * 3. Granola watched folder ingestion & mission matching
 * 4. Cross-Mission Inbox View rendering (3 distinct groups)
 */
import assert from 'assert';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import { MeetingHubStore } from '../model/store.js';
import { InboxView } from '../views/inbox.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const AGY_DIR = path.resolve(__dirname, '..', '..');
const MISSIONS_ROOT = path.resolve(AGY_DIR, '..', 'Missions');
const UNASSIGNED_DIR = path.join(MISSIONS_ROOT, '_inbox');
const GRANOLA_DIR = path.join(MISSIONS_ROOT, '_granola');

async function runPhase5Tests() {
  console.log('--- Running Phase 5: Frictionless Capture Test Suite ---');
  let passed = 0;
  let failed = 0;

  async function it(desc, fn) {
    try {
      await fn();
      console.log(`  ✔ ${desc}`);
      passed++;
    } catch (err) {
      console.error(`  ✘ ${desc}`);
      console.error(err);
      failed++;
    }
  }

  const store = new MeetingHubStore();
  await store.init();

  // Test 1: Python backend replacement idempotency (created, exists, replaced)
  await it('write_inbox_file implements replacement idempotency (created, exists, replaced)', async () => {
    const testEventId = 'test-idemp-001';
    const missionId = 'ge-enterprise';

    // Cleanup any leftovers from prior runs
    const geInboxDir = path.join(MISSIONS_ROOT, 'GE Enterprise', '_inbox');
    if (fs.existsSync(geInboxDir)) {
      fs.readdirSync(geInboxDir).forEach(f => {
        if (f.includes(testEventId)) {
          try { fs.unlinkSync(path.join(geInboxDir, f)); } catch (e) {}
        }
      });
    }

    // Step A: First write -> created
    const cmd1 = `python3 -c "import sys; sys.path.insert(0, '${AGY_DIR}'); import mission_notes, json; res = mission_notes.write_inbox_file('${missionId}', {'eventId': '${testEventId}', 'title': 'Idempotency Test 1', 'text': 'Version 1'}); print(json.dumps(res))"`;
    const res1 = JSON.parse(execSync(cmd1, { encoding: 'utf8' }));
    assert.strictEqual(res1.status, 'created');
    const createdPath = path.join(MISSIONS_ROOT, res1.path);
    assert.strictEqual(fs.existsSync(createdPath), true);
    const content1 = fs.readFileSync(createdPath, 'utf8');
    assert.strictEqual(content1.includes('Version 1'), true);

    // Step B: Second write with same content -> exists (idempotency)
    const cmd2 = `python3 -c "import sys; sys.path.insert(0, '${AGY_DIR}'); import mission_notes, json; res = mission_notes.write_inbox_file('${missionId}', {'eventId': '${testEventId}', 'title': 'Idempotency Test 1', 'text': 'Version 1'}); print(json.dumps(res))"`;
    const res2 = JSON.parse(execSync(cmd2, { encoding: 'utf8' }));
    assert.strictEqual(res2.status, 'exists');
    // Content should remain Version 1
    const content2 = fs.readFileSync(createdPath, 'utf8');
    assert.strictEqual(content2.includes('Version 1'), true);

    // Step C: Third write with modified text -> replaced (hash change replaces existing note)
    const cmd3 = `python3 -c "import sys; sys.path.insert(0, '${AGY_DIR}'); import mission_notes, json; res = mission_notes.write_inbox_file('${missionId}', {'eventId': '${testEventId}', 'title': 'Idempotency Test 1', 'text': 'Version 2'}); print(json.dumps(res))"`;
    const res3 = JSON.parse(execSync(cmd3, { encoding: 'utf8' }));
    assert.strictEqual(res3.status, 'replaced');
    const content3 = fs.readFileSync(createdPath, 'utf8');
    assert.strictEqual(content3.includes('Version 2'), true);

    // Clean up
    if (fs.existsSync(createdPath)) fs.unlinkSync(createdPath);
  });

  // Test 2: Unassigned inbox flow (capture, list, assign)
  await it('Unassigned inbox captures ambiguous notes and assigns to mission', async () => {
    // Cleanup any prior test unassigned files
    const unassignedDir = path.join(MISSIONS_ROOT, '_inbox');
    if (fs.existsSync(unassignedDir)) {
      fs.readdirSync(unassignedDir).forEach(f => {
        if (f.includes('ambiguous-strategy-discussion')) {
          try { fs.unlinkSync(path.join(unassignedDir, f)); } catch (e) {}
        }
      });
    }

    // Write an unassigned note
    const unassignedPayload = {
      title: 'Ambiguous Strategy Discussion',
      text: 'Discussion on cross-functional alignment and next steps.',
      date: '2026-10-30',
      source: 'test_phase5'
    };
    const writeResult = await store.writeUnassignedInboxFile(unassignedPayload);
    assert.strictEqual(writeResult.status, 'created');
    const filename = writeResult.filename;
    assert.ok(filename, 'Filename should be returned');

    // List unassigned inbox
    const listResult = await store.getUnassignedInboxFiles();
    const listCount = Array.isArray(listResult) ? listResult.length : (listResult.count || (listResult.files || []).length);
    assert.ok(listCount >= 1, 'Should list at least 1 unassigned inbox file');
    const files = Array.isArray(listResult) ? listResult : (listResult.files || []);
    const found = files.some(f => f.filename === filename);
    assert.strictEqual(found, true, 'File should appear in unassigned inbox listing');

    // Assign to ge-enterprise
    const assignResult = await store.assignInboxFile(filename, 'ge-enterprise');
    assert.strictEqual(assignResult.status, 'assigned');
    assert.strictEqual(assignResult.target_mission, 'ge-enterprise');

    // Verify file moved to ge-enterprise inbox
    const geInboxPath = path.join(MISSIONS_ROOT, assignResult.path);
    assert.strictEqual(fs.existsSync(geInboxPath), true, 'File should exist in GE Enterprise _inbox');

    // Clean up
    if (fs.existsSync(geInboxPath)) fs.unlinkSync(geInboxPath);
  });

  // Test 3: Granola watched folder ingestion
  await it('Granola watched folder ingests notes and routes to mission', async () => {
    if (!fs.existsSync(GRANOLA_DIR)) {
      fs.mkdirSync(GRANOLA_DIR, { recursive: true });
    }

    // Place a simulated Granola export file
    const granolaFile = path.join(GRANOLA_DIR, '2026-10-30_Weekly_Sync_Datastore_GE.md');
    fs.writeFileSync(granolaFile, '# Weekly Sync - Datastore GE\n\nAttendees: Ayrton Andre, GE Lead\n\nMinutes:\n- Reviewed UC Wizard prompts\n- Finalized dataset specs\n', 'utf8');

    // Trigger granola sync
    const syncResult = await store.syncGranola();
    assert.ok(syncResult.status === 'success' || syncResult.status === 'ok');
    assert.ok(syncResult.processed >= 1, 'Should have processed at least 1 granola file');

    // Verify it was moved out of _granola
    assert.strictEqual(fs.existsSync(granolaFile), false, 'Original granola file should be removed/moved');

    // Verify it landed in GE Enterprise inbox
    const geInboxDir = path.join(MISSIONS_ROOT, 'GE Enterprise', '_inbox');
    const files = fs.readdirSync(geInboxDir);
    const matched = files.filter(f => {
      try {
        const c = fs.readFileSync(path.join(geInboxDir, f), 'utf8');
        return c.includes('Reviewed UC Wizard prompts') || f.includes('weekly-sync');
      } catch (e) { return false; }
    });
    assert.ok(matched.length >= 1, 'File should have landed in GE Enterprise _inbox');

    // Clean up created files in _inbox
    matched.forEach(f => {
      try { fs.unlinkSync(path.join(geInboxDir, f)); } catch (e) {}
    });
  });

  // Test 4: InboxView rendering (3 distinct groups)
  await it('InboxView renders the 3 capture groups and Granola status', async () => {
    // Mock DOM container
    class MockElement {
      constructor(tagName = 'div') {
        this.tagName = tagName.toUpperCase();
        this.innerHTML = '';
        this._listeners = {};
        this.dataset = {};
      }
      addEventListener(evt, fn) {
        if (!this._listeners[evt]) this._listeners[evt] = [];
        this._listeners[evt].push(fn);
      }
      querySelector(sel) {
        const matches = this.querySelectorAll(sel);
        return matches.length > 0 ? matches[0] : null;
      }
      querySelectorAll(sel) {
        const list = [];
        if (sel === '#syncGranolaBtn') {
          const btn = new MockElement('button');
          btn.id = 'syncGranolaBtn';
          list.push(btn);
        }
        if (sel === '#autoPullDocsBtn') {
          const btn = new MockElement('button');
          btn.id = 'autoPullDocsBtn';
          list.push(btn);
        }
        if (sel === '[data-assign-btn]') {
          const btn = new MockElement('button');
          btn.dataset.assignBtn = 'true';
          btn.dataset.filename = 'test.md';
          list.push(btn);
        }
        if (sel === '[data-copy-fold-prompt]') {
          const btn = new MockElement('button');
          btn.dataset.copyFoldPrompt = 'ge-enterprise';
          list.push(btn);
        }
        return list;
      }
    }

    // Seed a pending inbox file so waiting to fold cards render
    const testInboxDir = path.join(MISSIONS_ROOT, 'GE Enterprise', '_inbox');
    const testPendingFile = path.join(testInboxDir, '2026-10-30_test_pending_fold.md');
    fs.writeFileSync(testPendingFile, '---\neventId: test_evt_fold\n---\nTest notes waiting to fold\n', 'utf8');

    const container = new MockElement('div');
    const inboxView = new InboxView({
      container,
      store,
      onSelectMeeting: () => {},
      onNavigateMission: () => {}
    });

    await inboxView.render();
    const html = container.innerHTML;

    // Clean up test pending file
    if (fs.existsSync(testPendingFile)) fs.unlinkSync(testPendingFile);

    // Check Group 1: Needs a home
    assert.strictEqual(html.includes('Needs a home'), true, 'Should render Group 1 Needs a home header');

    // Check Group 2: No minutes yet
    assert.strictEqual(html.includes('No minutes yet'), true, 'Should render Group 2 No minutes yet header');

    // Check Group 3: Waiting to fold
    assert.strictEqual(html.includes('Waiting to fold'), true, 'Should render Group 3 Waiting to fold header');

    // Check Granola status pill
    assert.strictEqual(html.includes('Watched folder active') || html.includes('Sync Granola'), true, 'Should render Granola watched folder status');

    // Check Fold Now Antigravity prompt copy button
    assert.strictEqual(html.includes('data-btn-fold-prompt'), true, 'Should render Fold Now prompt copy button');
  });

  console.log(`\nResults: ${passed} passed, ${failed} failed.\n`);
  if (failed > 0) process.exit(1);
}

runPhase5Tests().catch(err => {
  console.error('Fatal error running Phase 5 tests:', err);
  process.exit(1);
});
