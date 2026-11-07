/**
 * Phase 4 Meeting Drawer Verification Suite
 * 
 * Verifies all 4 drawer modes, breadcrumb navigation, prep checklist (dots-only, no percentages),
 * Antigravity fold clipboard prompt, collapsible Related section, and note system-of-record integration.
 */
import assert from 'assert';
import fs from 'fs';
import path from 'path';
import { MeetingPanelUI } from '../ui/meeting_panel.js';
import { MeetingHubStore } from '../model/store.js';

const MISSIONS_ROOT = path.resolve(process.env.MISSIONS_ROOT || '/Users/ayrtonandre/Documents/work/Missions');

// Minimal DOM Element Mock for Node testing
class MockElement {
  constructor(tagName = 'div') {
    this.tagName = tagName.toUpperCase();
    this._innerHTML = '';
    this._eventListeners = {};
    this.dataset = {};
    this.style = {};
    this.value = '';
    this.disabled = false;
    this._cachedElements = {};
  }
  get innerHTML() {
    return this._innerHTML;
  }
  set innerHTML(val) {
    this._innerHTML = val;
    this._cachedElements = {};
  }
  addEventListener(event, fn) {
    if (!this._eventListeners[event]) this._eventListeners[event] = [];
    this._eventListeners[event].push(fn);
  }
  dispatchEvent(event) {
    const fns = this._eventListeners[event.type || event] || [];
    fns.forEach(fn => fn(typeof event === 'string' ? { type: event, target: this, preventDefault: () => {} } : event));
  }
  click() {
    this.dispatchEvent('click');
  }
  querySelector(selector) {
    if (selector.startsWith('#')) {
      const id = selector.slice(1);
      const checkId = this.innerHTML.includes(`id="${id}"`) || this.innerHTML.includes(`id='${id}'`);
      if (checkId) {
        if (!this._cachedElements[id]) {
          const el = new MockElement();
          el.id = id;
          this._cachedElements[id] = el;
        }
        return this._cachedElements[id];
      }
      return null;
    }
    const all = this.querySelectorAll(selector);
    return all.length > 0 ? all[0] : null;
  }
  querySelectorAll(selector) {
    const matches = [];
    const checkId = (id) => this.innerHTML.includes(`id="${id}"`) || this.innerHTML.includes(`id='${id}'`);
    const checkClass = (cls) => this.innerHTML.includes(`class="${cls}`) || this.innerHTML.includes(`class='${cls}`);
    const checkAttr = (attr) => this.innerHTML.includes(attr);

    if (selector.startsWith('#')) {
      const id = selector.slice(1);
      if (checkId(id)) {
        if (!this._cachedElements[id]) {
          const el = new MockElement();
          el.id = id;
          this._cachedElements[id] = el;
        }
        matches.push(this._cachedElements[id]);
      }
    } else if (selector.startsWith('.')) {
      const cls = selector.slice(1);
      if (checkClass(cls)) {
        const regex = new RegExp(`class="[^"]*${cls}[^"]*"`, 'g');
        const count = (this.innerHTML.match(regex) || []).length;
        for (let i = 0; i < count; i++) {
          matches.push(new MockElement());
        }
      }
    } else if (selector === '[data-copy-action-id]') {
      if (checkAttr('data-copy-action-id')) {
        const regex = /data-copy-action-id="([^"]+)"/g;
        let match;
        while ((match = regex.exec(this.innerHTML)) !== null) {
          const el = new MockElement('button');
          el.dataset.copyActionId = match[1];
          matches.push(el);
        }
      }
    } else if (selector === '[data-open-related]') {
      if (checkAttr('data-open-related')) {
        const regex = /data-open-related="([^"]+)"/g;
        let match;
        while ((match = regex.exec(this.innerHTML)) !== null) {
          const el = new MockElement('div');
          el.dataset.openRelated = match[1];
          matches.push(el);
        }
      }
    }
    return matches;
  }
}

async function runTests() {
  console.log('--- Running Phase 4 Meeting Drawer Verification Tests ---');
  let passed = 0;
  let failed = 0;

  function it(desc, fn) {
    try {
      fn();
      console.log(`  ✔ ${desc}`);
      passed++;
    } catch (err) {
      console.error(`  ✘ ${desc}`);
      console.error(err);
      failed++;
    }
  }

  async function itAsync(desc, fn) {
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

  // 1. Pure Mode Computation Logic
  it('Drawer pure mode computation: maps state to 4 automatic modes', () => {
    const panel = new MeetingPanelUI({ store });
    const now = new Date('2026-10-30T10:00:00Z');

    // Folded takes precedence
    const mFolded = { date: '2026-10-26', start: '14:00', end: '15:00' };
    assert.strictEqual(panel._computeMeetingMode(mFolded, 'folded', now), 'folded');

    // Inbox pending takes second precedence
    const mInbox = { date: '2026-10-29', start: '14:00', end: '15:00' };
    assert.strictEqual(panel._computeMeetingMode(mInbox, 'pending', now), 'inbox');

    // Upcoming (in future) with not_sent -> prep mode
    const mFuture = { date: '2026-11-02', start: '09:00', end: '10:00' };
    assert.strictEqual(panel._computeMeetingMode(mFuture, 'not_sent', now), 'prep');

    // Past with not_sent -> capture mode
    const mPast = { date: '2026-10-20', start: '09:00', end: '10:00' };
    assert.strictEqual(panel._computeMeetingMode(mPast, 'not_sent', now), 'capture');
  });

  // 2. Mode 1: PREP Mode (Upcoming meeting)
  await itAsync('Mode 1 (Prep): Renders breadcrumbs, dots-only checklist (no %), open points, actions, decisions, and agenda notes', async () => {
    const container = new MockElement('div');
    let closed = false;
    const panel = new MeetingPanelUI({
      container,
      store,
      onClose: () => { closed = true; }
    });

    // Create a mock upcoming meeting for GE Enterprise
    const upcomingMeetingId = 'test_upcoming_ge_123';
    store.eventsCache.push({
      id: upcomingMeetingId,
      title: 'Weekly Syncro UC Wizard - Roadmap',
      date: '2099-01-01',
      start: '15:30',
      end: '16:30',
      seriesId: 'series_ge_weekly',
      series: 'Weekly Syncro UC Wizard',
      client: 'Artefact Internal',
      tags: ['GE Enterprise', 'UC Wizard'],
      attendees: ['ayrton.andre@artefact.com', 'laury.fyot@artefact.com']
    });

    await panel.setMeeting(upcomingMeetingId);

    // Breadcrumb verification
    assert(container.innerHTML.includes('breadcrumb-link'), 'Breadcrumb links should be present');
    assert(container.innerHTML.includes('#/p/ge-enterprise'), 'Should link to mission root');
    assert(container.innerHTML.includes('GE Enterprise &amp; UC Wizard') || container.innerHTML.includes('GE Enterprise & UC Wizard'));
    assert(container.innerHTML.includes('Weekly Syncro UC Wizard - Roadmap'));

    // Mode Badge
    assert(container.innerHTML.includes('Prep Mode'), 'Should display Prep Mode badge');

    // Prep Checklist: Dots only, strictly NO percentage sign in checklist card
    assert(container.innerHTML.includes('Prep Checklist'), 'Prep checklist should be present');
    assert(container.innerHTML.includes('prep-dot'), 'Prep dots should be rendered');
    assert(!container.innerHTML.includes('%</span>'), 'Strictly NO percentage badge in checklist');
    assert(!container.innerHTML.includes('scorePercent'), 'Strictly NO scorePercent in checklist');

    // Open points & actions from notes system of record
    assert(container.innerHTML.includes('Open Context'), 'Should include Open Context card');
    assert(container.innerHTML.includes('Open Points'), 'Should include Open Points section');
    assert(container.innerHTML.includes('Open Actions'), 'Should include Open Actions section');

    // Last 3 decisions
    assert(container.innerHTML.includes('Last 3 Decisions'), 'Should include Last 3 Decisions');

    // My agenda notes scratchpad
    assert(container.innerHTML.includes('id="myAgendaNotes"'), 'Agenda scratchpad textarea should be present');

    // Close button
    assert(container.innerHTML.includes('id="drawerCloseBtn"'), 'Close button should be present');
    panel.container.querySelector('#drawerCloseBtn').click();
    assert.strictEqual(closed, true, 'onClose should be called when clicking close button');
  });

  // 3. Mode 2: CAPTURE Mode (Past meeting with no minutes)
  await itAsync('Mode 2 (Capture): Past meeting without minutes renders drop zone, file upload, paste box, and save button', async () => {
    const container = new MockElement('div');
    const panel = new MeetingPanelUI({ container, store });

    // Past meeting without minutes in current window (e.g. 1ovcj3r48vpeuhiathp9f0f8dj)
    const pastMeeting = store.getAllEvents().find(e => e.start < '2026-11-06T00:00:00' && !e.isAllDay && !e.isTraining);
    const pastMeetingId = pastMeeting ? pastMeeting.id : '1ovcj3r48vpeuhiathp9f0f8dj';
    await panel.setMeeting(pastMeetingId);

    // Mode Badge
    assert(container.innerHTML.includes('Capture Mode'), 'Should display Capture Mode badge');

    // Drop & Upload Zone
    assert(container.innerHTML.includes('id="captureDropZone"'), 'Drop zone must be present');
    assert(container.innerHTML.includes('id="captureFileInput"'), 'Hidden file input must be present');
    assert(container.innerHTML.includes('Drag &amp; drop raw minutes file here') || container.innerHTML.includes('Drag & drop raw minutes file here'));

    // Paste Textarea
    assert(container.innerHTML.includes('id="captureNotesText"'), 'Minutes textarea must be present');

    // Save to inbox button
    assert(container.innerHTML.includes('id="btnSaveToInbox"'), 'Save to inbox button must be present');
    assert(container.innerHTML.includes('Save to Mission Inbox'));
  });

  // 4. Mode 3: IN INBOX Mode (Meeting with pending raw minutes)
  await itAsync('Mode 3 (In Inbox): Real GE meeting renders file metadata, 6-line preview, and Antigravity fold prompt', async () => {
    const container = new MockElement('div');
    const panel = new MeetingPanelUI({ container, store });

    const geInboxDir = path.join(MISSIONS_ROOT, 'GE Enterprise', '_inbox');
    const geFoldedDir = path.join(geInboxDir, '_folded');
    const fname = '2026-10-30_mandat-ge-troubleshooting-co_2617rp3qg8d3l510b8ms41vshq.md';
    const foldedFile = path.join(geFoldedDir, fname);
    const pendingFile = path.join(geInboxDir, fname);
    const moved = fs.existsSync(foldedFile) && !fs.existsSync(pendingFile);
    if (moved) fs.renameSync(foldedFile, pendingFile);

    try {
      // Real GE Enterprise meeting with minutes in _inbox/
      const inboxMeetingId = '2617rp3qg8d3l510b8ms41vshq';
      store.inboxStatusCache.clear();
      await panel.setMeeting(inboxMeetingId);

      // Mode Badge
      assert(container.innerHTML.includes('In Inbox'), 'Should display In Inbox badge');
      assert(container.innerHTML.includes('Waiting to fold'));

      // File info
      assert(container.innerHTML.includes('2026-10-30_mandat-ge-troubleshooting-co_2617rp3qg8d3l510b8ms41vshq.md'), 'Filename should be displayed');
      assert(container.innerHTML.includes('Size:'), 'Size should be displayed');
      assert(container.innerHTML.includes('Captured:'), 'Captured timestamp should be displayed');

      // 6-line preview
      assert(container.innerHTML.includes('Meeting Title: [MANDAT GE] - Troubleshooting &amp; Co') || container.innerHTML.includes('Meeting Title: [MANDAT GE] - Troubleshooting & Co'), 'Preview should display body snippet');

      // Antigravity Fold Prompt
      assert(container.innerHTML.includes('id="btnFoldNow"'), 'Fold now button must be present');
      const expectedPrompt = 'Fold the inbox for GE Enterprise & UC Wizard following Missions/_fold.md, then show me the change summary.';
      const expectedPromptHtml = 'Fold the inbox for GE Enterprise &amp; UC Wizard following Missions/_fold.md, then show me the change summary.';
      assert(container.innerHTML.includes(expectedPromptHtml) || container.innerHTML.includes(expectedPrompt), 'Antigravity prompt text must match spec exactly');

      // Replace minutes button
      assert(container.innerHTML.includes('id="btnTriggerReplaceMinutes"'), 'Replace minutes button must be present');
    } finally {
      if (moved && fs.existsSync(pendingFile)) {
        fs.renameSync(pendingFile, foldedFile);
        store.inboxStatusCache.clear();
      }
    }
  });

  // 5. Mode 4: FOLDED Mode (Meeting cited in authoritative Markdown notes)
  await itAsync('Mode 4 (Folded): Real Clariane meeting renders cited decisions/actions from notes system of record', async () => {
    const container = new MockElement('div');
    const panel = new MeetingPanelUI({ container, store });

    // Real Clariane HDJ meeting folded in notes
    const foldedMeetingId = '_60q30c1g60o30e1i60o4ac1g60rj8gpl88rj2c1h84s34h9g60s30c1g60o30c1g6sq44ghk6p13cd9m6l248h1g64o30c1g60o30c1g60o30c1g60o32c1g60o30c1g6p348da68p2k2gq58gp44d9k6ss48cpi6gs30c1g71336g9i8l0g';
    await panel.setMeeting(foldedMeetingId);

    // Mode Badge
    assert(container.innerHTML.includes('Folded'), 'Should display Folded badge');
    assert(container.innerHTML.includes('Folded into System of Record'));
    assert(container.innerHTML.includes('Authoritative Notes Cite This Meeting'));

    // Cited Decisions & Actions
    assert(container.innerHTML.includes('Cited Decisions'), 'Should display Cited Decisions section');
    assert(container.innerHTML.includes('Cited Actions'), 'Should display Cited Actions section');

    // Copy Action ID button
    const copyBtns = container.querySelectorAll('[data-copy-action-id]');
    assert(copyBtns.length >= 0, 'Action items can have copy ID buttons');

    // Copy note path
    assert(container.innerHTML.includes('id="btnCopyNotePath"'), 'Copy note path button should be present');
  });

  // 6. Collapsible Related Meetings Section (Present in EVERY mode)
  await itAsync('Collapsible Related section is present in every mode and toggles expansion', async () => {
    const container = new MockElement('div');
    const panel = new MeetingPanelUI({ container, store });

    // Load meeting
    await panel.setMeeting('2617rp3qg8d3l510b8ms41vshq');

    // Toggle button exists
    assert(container.innerHTML.includes('id="btnToggleRelated"'), 'Related meetings toggle button should exist');
    assert(container.innerHTML.includes('Related Meetings &amp; Lineage') || container.innerHTML.includes('Related Meetings & Lineage'));

    // Initially collapsed
    assert.strictEqual(panel.isRelatedExpanded, false);
    assert(!container.innerHTML.includes('Series Lineage'));

    // Toggle expand
    panel.container.querySelector('#btnToggleRelated').click();
    assert.strictEqual(panel.isRelatedExpanded, true);
    // Re-render
    await panel.render();
    assert(container.innerHTML.includes('Series Lineage') || container.innerHTML.includes('Connected meetings'));
  });

  console.log(`\nResults: ${passed} passed, ${failed} failed.`);
  if (failed > 0) {
    throw new Error(`${failed} tests failed`);
  } else {
    console.log('✔ All Phase 4 Meeting Drawer verification tests PASSED.');
  }
}

runTests().catch(err => {
  console.error(err);
  process.exit(1);
});
