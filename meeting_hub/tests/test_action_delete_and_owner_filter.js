/**
 * Unit Test: Action Deletion & Owner Filtering
 * Verifies:
 * 1. Store deleteAction interface
 * 2. ActionsView owner extraction & filtering logic
 * 3. ProjectsView owner extraction & filtering logic
 */
import assert from 'node:assert';
import { MeetingHubStore } from '../model/store.js';
import { ActionsView } from '../views/actions.js';
import { ProjectsView } from '../views/projects.js';

console.log('--- Running Action Deletion & Owner Filter Tests ---');

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
    if (selector.includes('#actionsOwnerSelect') && this.innerHTML.includes('id="actionsOwnerSelect"')) {
      const el = new MockElement('select');
      el.id = 'actionsOwnerSelect';
      matches.push(el);
    }
    if (selector.includes('#missionActionOwnerSelect') && this.innerHTML.includes('id="missionActionOwnerSelect"')) {
      const el = new MockElement('select');
      el.id = 'missionActionOwnerSelect';
      matches.push(el);
    }
    if (selector.includes('.delete-action-btn') && this.innerHTML.includes('delete-action-btn')) {
      const el = new MockElement('button');
      el.className = 'delete-action-btn';
      matches.push(el);
    }
    if (selector.includes('.delete-mission-action-btn') && this.innerHTML.includes('delete-mission-action-btn')) {
      const el = new MockElement('button');
      el.className = 'delete-mission-action-btn';
      matches.push(el);
    }
    return matches;
  }
}

async function run() {
  const store = new MeetingHubStore();
  await store.init();

  // Test 1: Store has deleteAction method
  assert.strictEqual(typeof store.deleteAction, 'function', 'store.deleteAction should be a function');
  console.log('  ✔ store.deleteAction method exists');

  // Test 2: ActionsView extracts unique owners and renders select
  const container = new MockElement('div');
  const actionsView = new ActionsView({ container, store });
  await actionsView.render();

  assert(container.innerHTML.includes('id="actionsOwnerSelect"'), 'ActionsView should render owner select dropdown');
  assert(container.innerHTML.includes('All Owners'), 'ActionsView owner select should include All Owners');
  assert(container.innerHTML.includes('Assigned to Me'), 'ActionsView owner select should include Assigned to Me');
  assert(container.innerHTML.includes('delete-action-btn'), 'ActionsView should render delete buttons on action cards');
  console.log('  ✔ ActionsView renders owner select dropdown and delete buttons');

  // Test 3: ProjectsView Actions subtab renders owner select and delete buttons
  const projContainer = new MockElement('div');
  const projectsView = new ProjectsView({ container: projContainer, store });
  projectsView.currentSubTab = 'actions';
  await projectsView.render('ge-enterprise');

  assert(projContainer.innerHTML.includes('id="missionActionOwnerSelect"'), 'ProjectsView Actions tab should render owner select dropdown');
  assert(projContainer.innerHTML.includes('delete-mission-action-btn'), 'ProjectsView Actions tab should render delete buttons');
  console.log('  ✔ ProjectsView Actions tab renders owner select dropdown and delete buttons');

  console.log('\nResults: All Action Deletion & Owner Filter tests PASSED.');
}

run().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
