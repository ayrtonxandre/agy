/**
 * Meeting Hub Build Script
 * 
 * Compiles modular source files into a standalone `meeting_hub/meeting_hub.app.js` bundle
 * that executes seamlessly both under `file://` (Finder / browser double-click)
 * and `http://localhost:8080/meeting` without CORS or module loader restrictions.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const MHUB_DIR = path.resolve(ROOT_DIR, 'meeting_hub');

// Ensure initial_events.js is up to date
const eventsJsonPath = path.join(MHUB_DIR, 'data', 'initial_events.json');
const eventsJsPath = path.join(MHUB_DIR, 'data', 'initial_events.js');
if (fs.existsSync(eventsJsonPath)) {
  const jsonContent = fs.readFileSync(eventsJsonPath, 'utf8');
  fs.writeFileSync(eventsJsPath, `// Global Seed Events (immune to file:// CORS)\nwindow.INITIAL_EVENTS = ${jsonContent};\n`, 'utf8');
  console.log('✔ Updated initial_events.js');
}

// Ensure docs_cache is bundled for offline resilience
const docsCacheJsonPath = path.join(MHUB_DIR, 'data', 'docs_cache.json');
let docsCacheJs = 'window.DOCS_CACHE = {};\n';
if (fs.existsSync(docsCacheJsonPath)) {
  const docsContent = fs.readFileSync(docsCacheJsonPath, 'utf8');
  docsCacheJs = `window.DOCS_CACHE = ${docsContent};\n`;
}

// Order of modules to bundle
const sourceFiles = [
  'data/adapter.js',
  'data/db.js',
  'model/event.js',
  'model/series.js',
  'model/links.js',
  'model/project.js',
  'model/minutes_engine.js',
  'model/project_engine.js',
  'data/importer.js',
  'data/sync.js',
  'model/prep_score.js',
  'model/store.js',
  'ui/icons.js',
  'ui/shell.js',
  'ui/meeting_panel.js',
  'views/today.js',
  'views/week.js',
  'views/meetings.js',
  'views/actions.js',
  'views/series.js',
  'views/projects.js'
];

let bundleCode = `/**
 * Meeting Hub Compiled Application Bundle
 * Generated: ${new Date().toISOString()}
 */
(function(window, document) {
'use strict';

${docsCacheJs}
window.MeetingHub = window.MeetingHub || {};
const MeetingHub = window.MeetingHub;
\n`;

for (const relPath of sourceFiles) {
  const filePath = path.join(MHUB_DIR, relPath);
  let code = fs.readFileSync(filePath, 'utf8');

  // Strip ES module imports
  code = code.replace(/import\s+[\s\S]*?from\s+['"][^'"]+['"];?/g, '');

  const exportedNames = [];

  // Transform 'export class X' -> 'class X'
  code = code.replace(/export\s+class\s+([A-Za-z0-9_]+)/g, (m, name) => {
    exportedNames.push(name);
    return `class ${name}`;
  });

  // Transform 'export const X' -> 'const X'
  code = code.replace(/export\s+const\s+([A-Za-z0-9_]+)/g, (m, name) => {
    exportedNames.push(name);
    return `const ${name}`;
  });

  // Transform 'export let X' -> 'let X'
  code = code.replace(/export\s+let\s+([A-Za-z0-9_]+)/g, (m, name) => {
    exportedNames.push(name);
    return `let ${name}`;
  });

  // Transform 'export (async )?function X' -> '(async )?function X'
  code = code.replace(/export\s+((?:async\s+)?function\s+([A-Za-z0-9_]+))/g, (m, fullFunc, name) => {
    exportedNames.push(name);
    return fullFunc;
  });

  // Strip 'export { ... }'
  code = code.replace(/export\s*\{[^}]*\};?/g, '');

  bundleCode += `/* === Module: ${relPath} === */\n` + code.trim() + '\n\n';

  for (const name of exportedNames) {
    bundleCode += `MeetingHub.${name} = ${name};\n`;
  }
  bundleCode += '\n';
}

// Add bootstrap and app controller
bundleCode += `
/* === App Controller & Bootstrap === */
const AppState = {
  date: '2026-10-28',
  view: 'today',
  mode: 'all',
  selectedEventId: null,
  isPanelCollapsed: false
};

let todayView;
let weekView;
let meetingsView;
let actionsView;
let seriesView;
let projectsView;
let meetingPanel;
let openActionsCount = 0;

function setPanelCollapsed(collapsed) {
  AppState.isPanelCollapsed = Boolean(collapsed);
  const bodyEl = document.querySelector('.body');
  if (bodyEl) {
    if (AppState.isPanelCollapsed) {
      bodyEl.classList.add('collapsed');
    } else {
      bodyEl.classList.remove('collapsed');
    }
  }
  if (shell && typeof shell.updatePanelToggle === 'function') {
    shell.updatePanelToggle(AppState.isPanelCollapsed);
  }
  try {
    localStorage.setItem('mhub_panel_collapsed', AppState.isPanelCollapsed ? 'true' : 'false');
  } catch (e) {}
}

function selectMeeting(eventId, tab = null) {
  if (tab && meetingPanel) {
    meetingPanel.currentTab = tab;
  }
  AppState.selectedEventId = eventId;
  setPanelCollapsed(false);
  const targetHash = '#/meeting/' + encodeURIComponent(eventId);
  if (window.location.hash !== targetHash) {
    window.location.hash = targetHash;
  } else {
    if (meetingPanel) meetingPanel.setMeeting(eventId, tab);
  }
  if (todayView && AppState.view === 'today') todayView.setSelectedEvent(eventId);
  if (weekView && AppState.view === 'week') weekView.setSelectedEvent(eventId);
  if (meetingsView && AppState.view === 'meetings') meetingsView.setSelectedEvent(eventId);
}

function renderActiveView() {
  const leftCol = document.querySelector('#left');
  if (!leftCol) return;

  shell.currentView = AppState.view;
  shell.renderSidebar(openActionsCount);

  const headerTitles = {
    today: { title: 'Today', sub: 'Wednesday 28 October 2026' },
    week: { title: 'Week', sub: 'Multi-day review & meeting health' },
    meetings: { title: 'Meetings', sub: 'Searchable calendar directory (259 events)' },
    actions: { title: 'Open Actions', sub: 'Action items grouped by client' },
    series: { title: 'Series & Links', sub: 'Recurring meeting series & linked lineages' },
    projects: { title: 'Projects & Knowledge', sub: 'Initiative intelligence & minutes synthesis' }
  };
  const meta = headerTitles[AppState.view] || headerTitles.today;
  const tEl = document.querySelector('#title');
  const sEl = document.querySelector('#subtitle');
  if (tEl) tEl.textContent = meta.title;
  if (sEl) sEl.textContent = meta.sub;

  switch (AppState.view) {
    case 'today':
      if (todayView) {
        todayView.container = leftCol;
        todayView.render();
      }
      break;
    case 'week':
      if (weekView) {
        weekView.container = leftCol;
        weekView.render();
      }
      break;
    case 'meetings':
      if (meetingsView) {
        meetingsView.container = leftCol;
        meetingsView.render();
      }
      break;
    case 'actions':
      if (actionsView) {
        actionsView.container = leftCol;
        actionsView.render();
      }
      break;
    case 'series':
      if (seriesView) {
        seriesView.container = leftCol;
        seriesView.render();
      }
      break;
    case 'projects':
      if (projectsView) {
        projectsView.container = leftCol;
        projectsView.render();
      }
      break;
  }
}

// Instantiate App Shell
const shell = new MeetingHub.ShellUI({
  onTogglePanel: () => {
    setPanelCollapsed(!AppState.isPanelCollapsed);
  },
  onNavigate: (viewName) => {
    AppState.view = viewName;
    if (viewName === 'today') {
      window.location.hash = AppState.selectedEventId ? '#/meeting/' + encodeURIComponent(AppState.selectedEventId) : '#/today';
    } else {
      window.location.hash = '#/' + viewName;
    }
    renderActiveView();
  },
  onProjectChange: async (projectId) => {
    MeetingHub.store.setActiveProjectId(projectId);
    if (projectsView) projectsView.setProject(projectId);
    if (AppState.view === 'projects') renderActiveView();
  },
  onConfirmSuggestedProject: async (suggestion) => {
    const p = await MeetingHub.store.confirmSuggestedProject(suggestion);
    MeetingHub.store.setActiveProjectId(p.id);
    const all = await MeetingHub.store.getAllProjects();
    const sug = await MeetingHub.store.getSuggestedProjects();
    shell.setProjects(all, p.id, sug);
    if (projectsView) projectsView.setProject(p.id);
    renderActiveView();
  },
  onCreateProject: async () => {
    const name = prompt('Enter new project name:');
    if (name && name.trim()) {
      const tag = prompt('Enter primary client or meeting tag to match events:', name.trim()) || name.trim();
      const p = await MeetingHub.store.confirmSuggestedProject({ name: name.trim(), clientMatch: [tag.trim()] });
      MeetingHub.store.setActiveProjectId(p.id);
      const all = await MeetingHub.store.getAllProjects();
      const sug = await MeetingHub.store.getSuggestedProjects();
      shell.setProjects(all, p.id, sug);
      if (projectsView) projectsView.setProject(p.id);
      renderActiveView();
    }
  },
  onModeChange: (newMode) => {
    AppState.mode = newMode;
    if (todayView) todayView.setMode(newMode);
    if (weekView) weekView.setMode(newMode);
    if (meetingsView) meetingsView.setMode(newMode);
  },
  onTodayClick: () => {
    AppState.date = '2026-10-28';
    if (todayView) todayView.setDate('2026-10-28');
    if (weekView) weekView.goToday();
    if (AppState.view !== 'today' && AppState.view !== 'week') {
      AppState.view = 'today';
      window.location.hash = '#/today';
      renderActiveView();
    }
  },
  onSearch: (query) => {
    if (AppState.view === 'today' && todayView) todayView.setSearchQuery(query);
    if (AppState.view === 'meetings' && meetingsView) meetingsView.setSearchQuery(query);
    if (AppState.view === 'actions' && actionsView) actionsView.setSearchQuery(query);
    if (AppState.view === 'series' && seriesView) seriesView.setSearchQuery(query);
    if (AppState.view === 'projects' && projectsView) projectsView.setSearchQuery(query);
  },
  onNewMeeting: () => {
    const title = prompt('Enter meeting title:');
    if (title && title.trim()) {
      const newId = 'custom-' + Date.now();
      MeetingHub.store.db.put('events', {
        id: newId,
        title: title.trim(),
        date: AppState.date,
        start: '10:00',
        end: '10:45',
        durationMin: 45,
        stream: AppState.mode === 'life' ? 'life' : 'work',
        client: 'Artefact',
        series: '',
        attendees: ['Ayrton A.'],
        tags: [],
        link: '',
        isAllDay: false,
        isTraining: false
      }).then(async () => {
        await MeetingHub.store.refreshCache();
        selectMeeting(newId);
      });
    }
  },
  onSyncTrigger: async () => {
    shell.setSyncing(true);
    try {
      await MeetingHub.CalendarSyncService.syncAll(MeetingHub.store.db, MeetingHub.store);
      const status = await MeetingHub.CalendarSyncService.getSyncStatus(MeetingHub.store.db);
      shell.setSyncStatus(status);
    } catch (err) {
      console.error('[MeetingHub] Sync error:', err);
    } finally {
      shell.setSyncing(false);
    }
  },
  getStorageEngine: () => MeetingHub.store ? MeetingHub.store.getStorageEngineName() : 'IndexedDB',
  onExportData: async () => {
    try {
      const json = await MeetingHub.store.exportUserDataJson();
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'meeting_hub_data_' + new Date().toISOString().slice(0, 10) + '.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('[MeetingHub] Export failed:', err);
    }
  },
  onImportData: async (jsonString) => {
    try {
      const res = await MeetingHub.store.importUserDataJson(jsonString);
      await MeetingHub.store.refreshCache();
      openActionsCount = await MeetingHub.store.getOpenActionsCount();
      shell.updateActionsBadge(openActionsCount);
      shell.renderSidebar(openActionsCount);
      renderActiveView();
      if (meetingPanel && AppState.selectedEventId) {
        meetingPanel.render();
      }
    } catch (err) {
      console.error('[MeetingHub] Import failed:', err);
    }
  }
});

function handleHashRoute() {
  const hash = window.location.hash || '';
  const meetingMatch = hash.match(/^#\\/meeting\\/([^/?#]+)/);
  if (meetingMatch) {
    const meetingId = decodeURIComponent(meetingMatch[1]);
    AppState.selectedEventId = meetingId;
    setPanelCollapsed(false);
    if (meetingPanel) meetingPanel.setMeeting(meetingId);
    if (todayView && AppState.view === 'today') todayView.setSelectedEvent(meetingId);
    if (weekView && AppState.view === 'week') weekView.setSelectedEvent(meetingId);
    if (meetingsView && AppState.view === 'meetings') meetingsView.setSelectedEvent(meetingId);
  } else if (hash === '#/today' || hash === '' || hash === '#/') {
    AppState.selectedEventId = null;
    if (meetingPanel) meetingPanel.setMeeting(null);
    if (AppState.view !== 'today') {
      AppState.view = 'today';
      renderActiveView();
    } else {
      if (todayView) todayView.setSelectedEvent(null);
    }
  } else {
    const viewMatch = hash.match(/^#\\/([a-z]+)/);
    if (viewMatch) {
      const v = viewMatch[1];
      if (['today', 'week', 'meetings', 'actions', 'series', 'projects'].includes(v)) {
        AppState.selectedEventId = null;
        if (meetingPanel) meetingPanel.setMeeting(null);
        if (AppState.view !== v) {
          AppState.view = v;
          renderActiveView();
        }
      }
    }
  }
}

// Global Keyboard Navigation (j, k, a, /, Escape, \)
window.addEventListener('keydown', (e) => {
  const activeEl = document.activeElement;
  const isInputActive = activeEl && (
    activeEl.tagName === 'INPUT' ||
    activeEl.tagName === 'TEXTAREA' ||
    activeEl.tagName === 'SELECT' ||
    activeEl.isContentEditable
  );

  // Esc clears quick search, collapses drawer or resets selected meeting
  if (e.key === 'Escape') {
    if (isInputActive) {
      const isSearch = activeEl.id === 'quickSearch';
      activeEl.blur();
      if (isSearch) {
        activeEl.value = '';
        if (AppState.view === 'today' && todayView) todayView.setSearchQuery('');
        if (AppState.view === 'meetings' && meetingsView) meetingsView.setSearchQuery('');
        if (AppState.view === 'actions' && actionsView) actionsView.setSearchQuery('');
        if (AppState.view === 'series' && seriesView) seriesView.setSearchQuery('');
      }
    } else if (!AppState.isPanelCollapsed) {
      setPanelCollapsed(true);
    } else if (AppState.selectedEventId) {
      window.location.hash = AppState.view === 'today' ? '#/today' : '#/' + AppState.view;
    }
    return;
  }

  // Single-letter shortcuts only fire when not typing in editable fields
  if (isInputActive) return;

  // '\\' -> toggle right meeting panel
  if (e.key === '\\\\') {
    e.preventDefault();
    setPanelCollapsed(!AppState.isPanelCollapsed);
    return;
  }

  // 'j' or ArrowDown -> next meeting
  if (e.key === 'j' || e.key === 'ArrowDown') {
    e.preventDefault();
    if (todayView && AppState.view === 'today') todayView.selectNextMeeting();
    return;
  }

  // 'k' or ArrowUp -> previous meeting
  if (e.key === 'k' || e.key === 'ArrowUp') {
    e.preventDefault();
    if (todayView && AppState.view === 'today') todayView.selectPreviousMeeting();
    return;
  }

  // 'a' -> focus action input
  if (e.key === 'a' || e.key === 'A') {
    e.preventDefault();
    if (!AppState.selectedEventId) {
      const list = todayView ? todayView.getVisibleTimedEvents() : [];
      if (list.length > 0) {
        selectMeeting(list[0].id);
        setTimeout(() => meetingPanel && meetingPanel.focusActionInput(), 80);
      }
    } else {
      if (meetingPanel) meetingPanel.focusActionInput();
    }
    return;
  }

  // '/' -> quick search
  if (e.key === '/') {
    e.preventDefault();
    const searchInput = document.querySelector('#quickSearch');
    if (searchInput) {
      searchInput.focus();
      searchInput.select();
    }
    return;
  }
});

window.addEventListener('hashchange', handleHashRoute);

async function bootstrap() {
  const leftCol = document.querySelector('#left');
  try {
    console.log('[MeetingHub] Initializing data layer...');
    
    // Safety check on store
    await MeetingHub.store.init();
    
    openActionsCount = await MeetingHub.store.getOpenActionsCount();
    shell.renderSidebar(openActionsCount);
    shell.renderHeader('Today', 'Wednesday 28 October 2026');

    // Retrieve & render initial sync status in sidebar
    try {
      const initialSyncStatus = await MeetingHub.CalendarSyncService.getSyncStatus(MeetingHub.store.db);
      shell.setSyncStatus(initialSyncStatus);
    } catch (e) {
      console.warn('[MeetingHub] Could not load sync status:', e);
    }

    // Refresh sync status relative times every 60s
    setInterval(async () => {
      try {
        const s = await MeetingHub.CalendarSyncService.getSyncStatus(MeetingHub.store.db);
        shell.setSyncStatus(s);
      } catch (e) {}
    }, 60000);

    // Initialize projects in shell
    const allProjects = await MeetingHub.store.getAllProjects();
    const suggestedProjects = await MeetingHub.store.getSuggestedProjects();
    const activeProjectId = MeetingHub.store.getActiveProjectId() || (allProjects[0] && allProjects[0].id) || 'clariane';
    shell.setProjects(allProjects, activeProjectId, suggestedProjects);

    todayView = new MeetingHub.TodayView({
      container: leftCol,
      store: MeetingHub.store,
      onSelectMeeting: (eventId, tab = null) => selectMeeting(eventId, tab),
      onNavigateProject: (projectId) => {
        AppState.view = 'projects';
        if (projectsView) projectsView.setProject(projectId);
        window.location.hash = '#/projects';
        renderActiveView();
      }
    });

    weekView = new MeetingHub.WeekView({
      container: leftCol,
      store: MeetingHub.store,
      onSelectMeeting: (eventId, tab = null) => selectMeeting(eventId, tab)
    });

    meetingsView = new MeetingHub.MeetingsView({
      container: leftCol,
      store: MeetingHub.store,
      onSelectMeeting: (eventId, tab = null) => selectMeeting(eventId, tab)
    });

    actionsView = new MeetingHub.ActionsView({
      container: leftCol,
      store: MeetingHub.store,
      onSelectMeeting: (eventId, tab = null) => selectMeeting(eventId, tab)
    });

    seriesView = new MeetingHub.SeriesView({
      container: leftCol,
      store: MeetingHub.store,
      onSelectMeeting: (eventId, tab = null) => selectMeeting(eventId, tab)
    });

    projectsView = new MeetingHub.ProjectsView({
      container: leftCol,
      store: MeetingHub.store,
      onSelectMeeting: (eventId, tab = null) => selectMeeting(eventId, tab)
    });

    meetingPanel = new MeetingHub.MeetingPanelUI({
      container: document.querySelector('#right'),
      store: MeetingHub.store,
      onOpenMeeting: (relatedEventId) => {
        selectMeeting(relatedEventId);
      },
      onClose: () => {
        setPanelCollapsed(true);
        window.location.hash = AppState.view === 'today' ? '#/today' : '#/' + AppState.view;
      },
      onCollapse: () => {
        setPanelCollapsed(true);
      }
    });

    const expandTab = document.querySelector('#expandPanelTab');
    if (expandTab) {
      expandTab.addEventListener('click', () => setPanelCollapsed(false));
    }

    // Subscribe to store updates
    MeetingHub.store.subscribe(async (payload) => {
      openActionsCount = await MeetingHub.store.getOpenActionsCount();
      shell.updateActionsBadge(openActionsCount);
      if (payload.type === 'project_updated' || payload.type === 'project_deleted' || payload.type === 'active_project_changed') {
        const all = await MeetingHub.store.getAllProjects();
        const sug = await MeetingHub.store.getSuggestedProjects();
        shell.setProjects(all, MeetingHub.store.getActiveProjectId(), sug);
        if (projectsView) projectsView.setProject(MeetingHub.store.getActiveProjectId());
      }
      if (payload.type === 'meeting_data_updated' || payload.type === 'sync_completed' || payload.type === 'project_updated') {
        renderActiveView();
        if (meetingPanel && AppState.selectedEventId) {
          meetingPanel.render();
        }
      }
    });

    try {
      const storedCollapsed = localStorage.getItem('mhub_panel_collapsed');
      if (storedCollapsed === 'true' && !window.location.hash.startsWith('#/meeting/')) {
        setPanelCollapsed(true);
      }
    } catch (e) {}

    // Handle initial route or default flagship meeting
    handleHashRoute();
    renderActiveView();

    if (!window.location.hash || window.location.hash === '#/' || window.location.hash === '#/today') {
      const todayEvents = MeetingHub.store.getEventsByDate(AppState.date, 'work');
      const defaultMeeting = todayEvents.find(e => e.title.includes('MO - Suivi anomalies')) || todayEvents[0];
      if (defaultMeeting && !AppState.isPanelCollapsed) {
        window.location.hash = '#/meeting/' + encodeURIComponent(defaultMeeting.id);
      }
    }

    const activeEngine = MeetingHub.store.db.engineName || 'IndexedDB';
    console.log('[MeetingHub] Ready. 259 events loaded via ' + activeEngine + '.');
  } catch (err) {
    console.error('[MeetingHub] Initialization error:', err);
    if (leftCol) {
      leftCol.innerHTML = '<div class="card" style="border-color: var(--destructive); margin-top: 20px;">' +
        '<div class="label" style="color: var(--destructive);">Data Layer Error</div>' +
        '<h2 style="margin: 8px 0;">Initialization Failed</h2>' +
        '<p class="sub">' + err.message + '</p>' +
        '<div style="margin-top: 12px; display: flex; gap: 8px;">' +
        '<button class="btn sm" onclick="localStorage.clear(); indexedDB.deleteDatabase(\\'MeetingHubDB\\'); location.reload();">Reset Storage & Retry</button>' +
        '</div></div>';
    }
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootstrap);
} else {
  bootstrap();
}

})(window, document);
`;

const bundlePath = path.join(MHUB_DIR, 'meeting_hub.app.js');
fs.writeFileSync(bundlePath, bundleCode, 'utf8');
console.log(`✔ Generated meeting_hub.app.js (${(fs.statSync(bundlePath).size / 1024).toFixed(1)} KB)`);
