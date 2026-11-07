/**
 * Unit and integration tests for ProjectsView Cockpit & Race Condition Safety
 */
import assert from 'assert';
import { ProjectsView } from '../views/projects.js';
import { MeetingHubStore } from '../model/store.js';

async function runTests() {
  console.log('--- Running ProjectsView Cockpit Tests ---');
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

  // Test 1: getMissionHubData for ge-enterprise returns fold cards and actions
  await itAsync('store.getMissionHubData("ge-enterprise") returns correct counts and cards', async () => {
    const data = await store.getMissionHubData('ge-enterprise', new Date('2026-10-31T12:00:00Z'));
    assert.strictEqual(data.mission.id, 'ge-enterprise');
    assert.strictEqual(data.mission.name, 'GE Enterprise & UC Wizard');
    assert.strictEqual(typeof data.toFoldCount, 'number');
    assert(data.openActionsCount >= 4, `Expected at least 4 open actions, got ${data.openActionsCount}`);
    assert(Array.isArray(data.lanes.fold));
    assert(Array.isArray(data.lanes.folded));
    assert(data.lanes.folded.length >= 2, 'Expected folded meetings');
  });

  // Mock DOM container
  class MockElement {
    constructor(tagName = 'div') {
      this.tagName = tagName.toUpperCase();
      this.innerHTML = '';
      this._eventListeners = {};
      this.dataset = {};
    }
    addEventListener(event, fn) {
      if (!this._eventListeners[event]) this._eventListeners[event] = [];
      this._eventListeners[event].push(fn);
    }
    dispatchEvent(event) {
      const fns = this._eventListeners[event.type] || [];
      fns.forEach(fn => fn(event));
    }
    querySelector(selector) {
      const all = this.querySelectorAll(selector);
      return all.length > 0 ? all[0] : null;
    }
    querySelectorAll(selector) {
      const matches = [];
      if (selector === '#projectSelectDropdown' && this.innerHTML.includes('id="projectSelectDropdown"')) {
        const el = new MockElement('select');
        el.id = 'projectSelectDropdown';
        matches.push(el);
      }
      if (selector === '[data-close-cockpit-tab]' && this.innerHTML.includes('data-close-cockpit-tab')) {
        const el = new MockElement('button');
        el.dataset.closeCockpitTab = '';
        matches.push(el);
      }
      if (selector === '[data-cockpit-tab]' && this.innerHTML.includes('data-cockpit-tab')) {
        ['workstreams', 'decisions', 'actions', 'contacts', 'brief'].forEach(tab => {
          if (this.innerHTML.includes(`data-cockpit-tab="${tab}"`)) {
            const el = new MockElement('button');
            el.dataset.cockpitTab = tab;
            matches.push(el);
          }
        });
      }
      return matches;
    }
  }

  // Test 2: ProjectsView renders ge-enterprise correctly
  await itAsync('ProjectsView renders ge-enterprise with header, dropdown, and cockpit stream', async () => {
    const container = new MockElement('div');
    const view = new ProjectsView({ container, store, now: new Date('2026-10-31T12:00:00Z') });
    await view.render('ge-enterprise');

    assert(container.innerHTML.includes('GE Enterprise &amp; UC Wizard') || container.innerHTML.includes('GE Enterprise & UC Wizard'));
    assert(container.innerHTML.includes('open actions'));
    assert(container.innerHTML.includes('projectSelectDropdown'));
    assert(container.innerHTML.includes('stream-lane') || container.innerHTML.includes('folded-summary-strip'));
  });

  // Test 3: Knowledge tab rendering includes Close tab button and tab content
  await itAsync('ProjectsView renders close button and content when knowledge tab is open', async () => {
    const container = new MockElement('div');
    const view = new ProjectsView({ container, store });
    view.currentSubTab = 'workstreams';
    await view.render('ge-enterprise');

    assert(container.innerHTML.includes('id="cockpitTabContent"'), 'cockpitTabContent should be present');
    assert(container.innerHTML.includes('data-close-cockpit-tab'), 'Close tab button should be present');
    assert(container.innerHTML.includes('Close tab'), 'Text "Close tab" should be rendered');
    assert(container.innerHTML.includes('Datastore GE Drive'), 'Workstream title should be rendered');
  });

  // Test 4: Stale render cancellation token test
  await itAsync('ProjectsView discards stale async renders when superseded', async () => {
    const container = new MockElement('div');
    const view = new ProjectsView({ container, store });

    // Intentionally delay the first render
    const origGetMissionHubData = store.getMissionHubData.bind(store);
    store.getMissionHubData = async (id) => {
      if (id === 'healthcare-mandate') {
        await new Promise(r => setTimeout(r, 60)); // slow
      }
      return origGetMissionHubData(id);
    };

    const p1 = view.render('healthcare-mandate');
    const p2 = view.render('ge-enterprise'); // fast, runs second

    await Promise.all([p1, p2]);

    // GE Enterprise must win and remain in the DOM
    assert(container.innerHTML.includes('GE Enterprise'), 'GE Enterprise must remain rendered, not clobbered');
    assert(!container.innerHTML.includes('Healthcare Mandate & Care Dispensing'), 'Healthcare mandate must NOT clobber GE Enterprise');
  });

  console.log(`\nResults: ${passed} passed, ${failed} failed.`);
  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error(err);
  process.exit(1);
});
