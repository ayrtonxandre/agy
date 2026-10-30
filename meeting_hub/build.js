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
import { execSync } from 'child_process';

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

// NOTE: docs_cache is NOT bundled into the client JS to preserve client minutes privacy.
// Minutes are fetched live on demand via /api/docs/fetch.
const docsCacheJs = 'window.DOCS_CACHE = {};\n';

// Ensure missions_snapshot.js is generated from Missions/missions.yaml
const missionsYamlPath = path.resolve(ROOT_DIR, '..', 'Missions', 'missions.yaml');
const missionsSnapshotJsPath = path.join(MHUB_DIR, 'data', 'missions_snapshot.js');
let missionsSnapshotJs = 'var MISSIONS_SNAPSHOT = (typeof window !== "undefined" ? window : globalThis).MISSIONS_SNAPSHOT = { missions: [] };\n';
if (fs.existsSync(missionsYamlPath)) {
  try {
    const jsonStr = execSync(`python3 -c "import yaml, json, sys; print(json.dumps(yaml.safe_load(open(sys.argv[1]))))" "${missionsYamlPath}"`, { encoding: 'utf8' });
    const parsed = JSON.parse(jsonStr);
    missionsSnapshotJs = `// Auto-generated missions registry snapshot (file:// fallback)\nvar MISSIONS_SNAPSHOT = (typeof window !== "undefined" ? window : globalThis).MISSIONS_SNAPSHOT = ${JSON.stringify(parsed, null, 2)};\n`;
    fs.writeFileSync(missionsSnapshotJsPath, missionsSnapshotJs, 'utf8');
    console.log('✔ Updated data/missions_snapshot.js');
  } catch (err) {
    console.warn('⚠ Could not generate missions_snapshot.js:', err.message);
  }
} else if (fs.existsSync(missionsSnapshotJsPath)) {
  missionsSnapshotJs = fs.readFileSync(missionsSnapshotJsPath, 'utf8');
}

// Order of modules to bundle
const sourceFiles = [
  'data/adapter.js',
  'data/db.js',
  'model/date_utils.js',
  'model/route_parser.js',
  'model/mission_matcher.js',
  'model/event.js',
  'model/series.js',
  'model/links.js',
  'model/project.js',
  'model/minutes_engine.js',
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
${missionsSnapshotJs}
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
  date: (typeof getTodayDateStr === 'function') ? getTodayDateStr() : new Date().toISOString().slice(0, 10),
  view: 'mission',
  calendarTab: 'today',
  missionId: null,
  tab: null,
  mode: 'all',
  selectedEventId: null,
  isPanelCollapsed: true
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

async function resolveDefaultMissionId() {
  try {
    const registry = await MeetingHub.store.getMissionsRegistry();
    const missions = registry?.missions || [];
    const activeMissions = missions.filter(m => !m.archived && m.status !== 'archived');
    const last = localStorage.getItem('mhub_last_mission');
    if (last && missions.some(m => m.id === last && !m.archived && m.status !== 'archived')) {
      return last;
    }
    if (activeMissions.length > 0) {
      return activeMissions[0].id;
    }
    if (missions.length > 0) {
      return missions[0].id;
    }
  } catch (e) {
    console.warn('[MeetingHub] Could not resolve missions registry:', e);
  }
  return 'ge-enterprise';
}

function selectMeeting(eventId, tab = null) {
  if (tab && meetingPanel) {
    meetingPanel.currentTab = tab;
  }
  AppState.selectedEventId = eventId;
  setPanelCollapsed(false);

  // If already in a mission context, preserve mission in URL
  if (AppState.view === 'mission' && AppState.missionId) {
    const targetHash = '#/p/' + encodeURIComponent(AppState.missionId) + '/m/' + encodeURIComponent(eventId);
    if (window.location.hash !== targetHash) {
      window.location.hash = targetHash;
    } else {
      if (meetingPanel) meetingPanel.setMeeting(eventId, tab);
    }
  } else if (AppState.view === 'calendar') {
    const sub = AppState.calendarTab && AppState.calendarTab !== 'today' ? '/' + AppState.calendarTab : '';
    const targetHash = '#/calendar' + sub + '/m/' + encodeURIComponent(eventId);
    if (window.location.hash !== targetHash) {
      window.location.hash = targetHash;
    } else {
      if (meetingPanel) meetingPanel.setMeeting(eventId, tab);
    }
  } else {
    // Try to match mission for this meeting
    const event = MeetingHub.store.getEvent(eventId);
    const registry = MeetingHub.store.missionsRegistry || { missions: [] };
    const match = (typeof matchMission === 'function')
      ? matchMission(event, registry)
      : (MeetingHub.matchMission ? MeetingHub.matchMission(event, registry) : null);
    if (match && match.missionId) {
      window.location.hash = '#/p/' + encodeURIComponent(match.missionId) + '/m/' + encodeURIComponent(eventId);
    } else {
      window.location.hash = '#/calendar/m/' + encodeURIComponent(eventId);
    }
  }

  if (todayView && AppState.view === 'calendar' && AppState.calendarTab === 'today') todayView.setSelectedEvent(eventId);
  if (weekView && AppState.view === 'calendar' && AppState.calendarTab === 'week') weekView.setSelectedEvent(eventId);
  if (meetingsView && AppState.view === 'calendar' && AppState.calendarTab === 'meetings') meetingsView.setSelectedEvent(eventId);
}

function renderActiveView() {
  const leftCol = document.querySelector('#left');
  if (!leftCol) return;

  shell.currentView = AppState.view;
  shell.renderSidebar(openActionsCount);

  if (AppState.view === 'mission') {
    const missionName = MeetingHub.store.getProjectName(AppState.missionId) || AppState.missionId;
    const tEl = document.querySelector('#title');
    const sEl = document.querySelector('#subtitle');
    if (tEl) tEl.textContent = missionName;
    if (sEl) sEl.textContent = 'Mission Cockpit & Knowledge Base';

    if (projectsView) {
      projectsView.container = leftCol;
      projectsView.render();
    }
    return;
  }

  if (AppState.view === 'inbox') {
    const tEl = document.querySelector('#title');
    const sEl = document.querySelector('#subtitle');
    if (tEl) tEl.textContent = 'Cross-Mission Inbox';
    if (sEl) sEl.textContent = 'Pending meeting minutes waiting to be folded';
    leftCol.innerHTML = \`
      <div class="card" style="padding: 24px;">
        <div class="label">Cross-Mission Inbox</div>
        <h2 style="margin: 8px 0;">Incoming Meeting Minutes</h2>
        <p class="sub" style="margin-bottom: 16px;">Past meeting minutes awaiting folding into durable mission notes.</p>
        <div id="inboxList">Loading inbox status...</div>
      </div>
    \`;
    (async () => {
      try {
        const reg = await MeetingHub.store.getMissionsRegistry();
        const missions = reg?.missions || [];
        const container = leftCol.querySelector('#inboxList');
        if (!container) return;
        let html = '';
        for (const m of missions) {
          const status = await MeetingHub.store.getInboxStatus(m.id);
          const pending = status?.pendingCount || 0;
          html += \`
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 14px; margin-bottom: 8px; border: 1px solid var(--border); border-radius: var(--r-md); background: var(--secondary);">
              <div>
                <strong>\${m.name}</strong>
                <div class="sub" style="font-size: 11px;">\${m.directory}</div>
              </div>
              <div>
                \${pending > 0 ? \`<span class="badge warn" style="color: var(--warn); font-weight: 600;">\${pending} pending</span>\` : '<span class="badge ok">0 pending</span>'}
              </div>
            </div>
          \`;
        }
        container.innerHTML = html;
      } catch (e) {}
    })();
    return;
  }

  if (AppState.view === 'my-actions') {
    const tEl = document.querySelector('#title');
    const sEl = document.querySelector('#subtitle');
    if (tEl) tEl.textContent = 'My Actions';
    if (sEl) sEl.textContent = 'Cross-mission action matrix';
    if (actionsView) {
      actionsView.container = leftCol;
      actionsView.render();
    }
    return;
  }

  if (AppState.view === 'calendar') {
    const todayFormatted = (typeof formatLongDate === 'function') ? formatLongDate(AppState.date) : AppState.date;
    const headerTitles = {
      today: { title: 'Today', sub: todayFormatted },
      week: { title: 'Week', sub: 'Multi-day review & meeting health' },
      meetings: { title: 'Meetings', sub: 'Searchable calendar directory (259 events)' },
      series: { title: 'Series & Links', sub: 'Recurring meeting series & linked lineages' }
    };
    const meta = headerTitles[AppState.calendarTab] || headerTitles.today;
    const tEl = document.querySelector('#title');
    const sEl = document.querySelector('#subtitle');
    if (tEl) tEl.textContent = meta.title;
    if (sEl) sEl.textContent = meta.sub;

    switch (AppState.calendarTab) {
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
      case 'series':
        if (seriesView) {
          seriesView.container = leftCol;
          seriesView.render();
        }
        break;
    }
    return;
  }
}

function showMissionSwitcher() {
  const existingModal = document.querySelector('#missionSwitcherModal');
  if (existingModal) {
    existingModal.remove();
    return;
  }

  const missions = MeetingHub.store.missionsRegistry?.missions || [];
  const activeMissions = missions.filter(m => !m.archived && m.status !== 'archived');
  const archivedMissions = missions.filter(m => m.archived || m.status === 'archived');

  const overlay = document.createElement('div');
  overlay.id = 'missionSwitcherModal';
  overlay.style.cssText = 'position: fixed; inset: 0; background: rgba(0,0,0,0.65); backdrop-filter: blur(4px); z-index: 9999; display: flex; align-items: flex-start; justify-content: center; padding-top: 15vh;';

  overlay.innerHTML = \`
    <div style="background: var(--card); border: 1px solid var(--border); border-radius: var(--r-lg); width: 100%; max-width: 520px; box-shadow: 0 16px 32px rgba(0,0,0,0.5); overflow: hidden; display: flex; flex-direction: column;">
      <div style="padding: 12px 16px; border-bottom: 1px solid var(--border); display: flex; align-items: center; gap: 10px;">
        <span style="font-family: var(--font-mono); font-size: 11px; color: var(--pink-600); font-weight: 600;">SWITCH MISSION</span>
        <input id="missionSearchInput" type="text" placeholder="Type to search active missions..." style="flex: 1; background: transparent; border: none; color: var(--foreground); font-family: var(--font-sans); font-size: 15px; outline: none;" autofocus autocomplete="off" />
        <span style="font-size: 11px; color: var(--muted-foreground); font-family: var(--font-mono);">[Esc] Close</span>
      </div>
      <div id="missionList" style="max-height: 360px; overflow-y: auto; padding: 8px;"></div>
    </div>
  \`;

  document.body.appendChild(overlay);

  const searchInput = overlay.querySelector('#missionSearchInput');
  const listContainer = overlay.querySelector('#missionList');
  let selectedIndex = 0;
  let filteredMissions = [...activeMissions, ...archivedMissions];

  function renderList() {
    if (filteredMissions.length === 0) {
      listContainer.innerHTML = '<div style="padding: 16px; text-align: center; color: var(--muted-foreground); font-size: 13px;">No matching mission found.</div>';
      return;
    }
    listContainer.innerHTML = filteredMissions.map((m, idx) => {
      const isSelected = idx === selectedIndex;
      const isArchived = m.archived || m.status === 'archived';
      const numLabel = idx < 9 && !isArchived ? \`<span style="font-family: var(--font-mono); font-size: 11px; background: var(--secondary); padding: 2px 6px; border-radius: 4px; margin-right: 8px; color: var(--muted-foreground);">\${idx + 1}</span>\` : '';
      return \`
        <div class="mission-item" data-id="\${m.id}" style="display: flex; align-items: center; justify-content: space-between; padding: 10px 12px; border-radius: var(--r-md); cursor: pointer; background: \${isSelected ? 'var(--secondary)' : 'transparent'}; border: 1px solid \${isSelected ? 'var(--pink-600)' : 'transparent'};">
          <div style="display: flex; align-items: center;">
            \${numLabel}
            <div>
              <div style="font-weight: 600; font-size: 14px; color: \${isSelected ? 'var(--foreground)' : 'var(--card-foreground)'};">\${m.name}</div>
              <div class="sub" style="font-size: 11px;">\${m.client || 'Artefact'} · \${m.directory}</div>
            </div>
          </div>
          <div>
            \${isArchived ? '<span class="badge sub" style="font-size: 10px;">Archived</span>' : '<span class="badge ok" style="font-size: 10px;">Active</span>'}
          </div>
        </div>
      \`;
    }).join('');

    listContainer.querySelectorAll('.mission-item').forEach((item) => {
      item.addEventListener('click', () => {
        const id = item.dataset.id;
        overlay.remove();
        window.location.hash = '#/p/' + encodeURIComponent(id);
      });
    });
  }

  function filter(query) {
    const q = query.toLowerCase().trim();
    if (!q) {
      filteredMissions = [...activeMissions, ...archivedMissions];
    } else {
      filteredMissions = [...activeMissions, ...archivedMissions].filter(m => {
        const text = \`\${m.name} \${m.id} \${m.directory} \${(m.clientMatch || []).join(' ')}\`.toLowerCase();
        return text.includes(q);
      });
    }
    selectedIndex = 0;
    renderList();
  }

  renderList();
  setTimeout(() => searchInput.focus(), 30);

  searchInput.addEventListener('input', (e) => filter(e.target.value));

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) overlay.remove();
  });

  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      overlay.remove();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      selectedIndex = Math.min(filteredMissions.length - 1, selectedIndex + 1);
      renderList();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      selectedIndex = Math.max(0, selectedIndex - 1);
      renderList();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const picked = filteredMissions[selectedIndex];
      if (picked) {
        overlay.remove();
        window.location.hash = '#/p/' + encodeURIComponent(picked.id);
      }
    }
  });
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
    const today = (typeof getTodayDateStr === 'function') ? getTodayDateStr() : new Date().toISOString().slice(0, 10);
    AppState.date = today;
    if (todayView) todayView.setDate(today);
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
  const parsed = (typeof parseRoute === 'function')
    ? parseRoute(hash)
    : (MeetingHub.parseRoute ? MeetingHub.parseRoute(hash) : { view: 'root' });

  // Handle legacy redirects
  if (parsed.isLegacy && parsed.redirectTo) {
    window.location.hash = parsed.redirectTo;
    return;
  }

  // Handle root route (#/ or empty)
  if (parsed.view === 'root') {
    resolveDefaultMissionId().then((defaultMissionId) => {
      window.location.hash = '#/p/' + encodeURIComponent(defaultMissionId);
    });
    return;
  }

  // Handle legacy meeting route: #/meeting/:eventId
  if (parsed.view === 'legacy-meeting' && parsed.eventId) {
    const event = MeetingHub.store.getEvent(parsed.eventId);
    const registryPromise = MeetingHub.store.missionsRegistry
      ? Promise.resolve(MeetingHub.store.missionsRegistry)
      : MeetingHub.store.getMissionsRegistry();
    registryPromise.then((registry) => {
      const match = (typeof matchMission === 'function')
        ? matchMission(event, registry)
        : (MeetingHub.matchMission ? MeetingHub.matchMission(event, registry) : null);
      if (match && match.missionId) {
        window.location.hash = '#/p/' + encodeURIComponent(match.missionId) + '/m/' + encodeURIComponent(parsed.eventId);
      } else {
        window.location.hash = '#/calendar/m/' + encodeURIComponent(parsed.eventId);
      }
    });
    return;
  }

  // Handle mission route: #/p/:missionId[/m/:eventId or /:tab]
  if (parsed.view === 'mission') {
    AppState.view = 'mission';
    AppState.missionId = parsed.missionId;
    AppState.tab = parsed.tab;
    try {
      localStorage.setItem('mhub_last_mission', parsed.missionId);
    } catch (e) {}

    if (parsed.eventId) {
      AppState.selectedEventId = parsed.eventId;
      setPanelCollapsed(false);
      if (meetingPanel) meetingPanel.setMeeting(parsed.eventId);
    } else {
      AppState.selectedEventId = null;
      setPanelCollapsed(true);
      if (meetingPanel) meetingPanel.setMeeting(null);
    }

    if (projectsView) {
      projectsView.setProject(parsed.missionId);
      if (parsed.tab && typeof projectsView.setTab === 'function') {
        projectsView.setTab(parsed.tab);
      }
    }
    renderActiveView();
    return;
  }

  // Handle inbox route: #/inbox
  if (parsed.view === 'inbox') {
    AppState.view = 'inbox';
    AppState.selectedEventId = null;
    setPanelCollapsed(true);
    if (meetingPanel) meetingPanel.setMeeting(null);
    renderActiveView();
    return;
  }

  // Handle my-actions route: #/my-actions
  if (parsed.view === 'my-actions') {
    AppState.view = 'my-actions';
    AppState.selectedEventId = null;
    setPanelCollapsed(true);
    if (meetingPanel) meetingPanel.setMeeting(null);
    renderActiveView();
    return;
  }

  // Handle calendar route: #/calendar[/:tab][/m/:eventId]
  if (parsed.view === 'calendar') {
    AppState.view = 'calendar';
    AppState.calendarTab = parsed.tab || 'today';

    if (parsed.eventId) {
      AppState.selectedEventId = parsed.eventId;
      setPanelCollapsed(false);
      if (meetingPanel) meetingPanel.setMeeting(parsed.eventId);
      if (todayView && AppState.calendarTab === 'today') todayView.setSelectedEvent(parsed.eventId);
      if (weekView && AppState.calendarTab === 'week') weekView.setSelectedEvent(parsed.eventId);
      if (meetingsView && AppState.calendarTab === 'meetings') meetingsView.setSelectedEvent(parsed.eventId);
    } else {
      AppState.selectedEventId = null;
      if (meetingPanel) meetingPanel.setMeeting(null);
      if (todayView) todayView.setSelectedEvent(null);
      if (weekView) weekView.setSelectedEvent(null);
      if (meetingsView) meetingsView.setSelectedEvent(null);
    }
    renderActiveView();
    return;
  }
}

// Global Keyboard Navigation (j, k, a, /, Escape, \\, g p, g i, g c, 1-9)
let lastLeaderKey = '';
let leaderTimeout = null;

window.addEventListener('keydown', (e) => {
  const activeEl = document.activeElement;
  const isInputActive = activeEl && (
    activeEl.tagName === 'INPUT' ||
    activeEl.tagName === 'TEXTAREA' ||
    activeEl.tagName === 'SELECT' ||
    activeEl.isContentEditable
  );

  // Esc order: blur input -> close drawer -> go back from tab to stream
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
      return;
    }
    if (!AppState.isPanelCollapsed) {
      setPanelCollapsed(true);
      if (AppState.view === 'mission' && AppState.missionId) {
        window.location.hash = '#/p/' + encodeURIComponent(AppState.missionId);
      } else if (AppState.view === 'calendar') {
        const sub = AppState.calendarTab && AppState.calendarTab !== 'today' ? '/' + AppState.calendarTab : '';
        window.location.hash = '#/calendar' + sub;
      }
      return;
    }
    if (AppState.view === 'mission' && AppState.tab) {
      window.location.hash = '#/p/' + encodeURIComponent(AppState.missionId);
      return;
    }
    return;
  }

  // Single-letter and sequence shortcuts only fire when not typing in editable fields
  if (isInputActive) return;

  // Leader sequence: g p, g i, g c
  if (lastLeaderKey === 'g') {
    lastLeaderKey = '';
    clearTimeout(leaderTimeout);
    if (e.key === 'p' || e.key === 'P') {
      e.preventDefault();
      showMissionSwitcher();
      return;
    }
    if (e.key === 'i' || e.key === 'I') {
      e.preventDefault();
      window.location.hash = '#/inbox';
      return;
    }
    if (e.key === 'c' || e.key === 'C') {
      e.preventDefault();
      window.location.hash = '#/calendar';
      return;
    }
  }

  if (e.key === 'g' || e.key === 'G') {
    lastLeaderKey = 'g';
    clearTimeout(leaderTimeout);
    leaderTimeout = setTimeout(() => { lastLeaderKey = ''; }, 1000);
    return;
  }

  // 1-9 jump to Nth active mission in rail
  if (e.key >= '1' && e.key <= '9' && !e.ctrlKey && !e.metaKey && !e.altKey) {
    const idx = parseInt(e.key, 10) - 1;
    const missions = MeetingHub.store.missionsRegistry?.missions || [];
    const activeMissions = missions.filter(m => !m.archived && m.status !== 'archived');
    if (activeMissions[idx]) {
      e.preventDefault();
      window.location.hash = '#/p/' + encodeURIComponent(activeMissions[idx].id);
      return;
    }
  }

  // '\\\\' -> toggle right meeting panel
  if (e.key === '\\\\') {
    e.preventDefault();
    setPanelCollapsed(!AppState.isPanelCollapsed);
    return;
  }

  // 'j' or ArrowDown -> next meeting (in stream or calendar)
  if (e.key === 'j' || e.key === 'ArrowDown') {
    e.preventDefault();
    if (AppState.view === 'mission') {
      if (projectsView && typeof projectsView.selectNextMeeting === 'function') {
        projectsView.selectNextMeeting();
      }
    } else if (todayView && AppState.view === 'calendar' && AppState.calendarTab === 'today') {
      todayView.selectNextMeeting();
    }
    return;
  }

  // 'k' or ArrowUp -> previous meeting (in stream or calendar)
  if (e.key === 'k' || e.key === 'ArrowUp') {
    e.preventDefault();
    if (AppState.view === 'mission') {
      if (projectsView && typeof projectsView.selectPreviousMeeting === 'function') {
        projectsView.selectPreviousMeeting();
      }
    } else if (todayView && AppState.view === 'calendar' && AppState.calendarTab === 'today') {
      todayView.selectPreviousMeeting();
    }
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
    const initialTodaySub = (typeof formatLongDate === 'function') ? formatLongDate(AppState.date) : AppState.date;
    shell.renderHeader('Today', initialTodaySub);

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
        if (AppState.view === 'mission' && AppState.missionId) {
          window.location.hash = '#/p/' + encodeURIComponent(AppState.missionId);
        } else if (AppState.view === 'calendar') {
          const sub = AppState.calendarTab && AppState.calendarTab !== 'today' ? '/' + AppState.calendarTab : '';
          window.location.hash = '#/calendar' + sub;
        } else {
          window.location.hash = AppState.view === 'today' ? '#/today' : '#/' + AppState.view;
        }
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

    // Handle initial route
    handleHashRoute();
    renderActiveView();

    const activeEngine = MeetingHub.store.db.engineName || 'IndexedDB';
    const initialEventsList = await MeetingHub.store.getAllEvents();
    console.log('[MeetingHub] Ready. ' + initialEventsList.length + ' events loaded via ' + activeEngine + '.');

    // Non-blocking background sync pass to pull fresh calendar changes from backend
    setTimeout(async () => {
      try {
        await MeetingHub.CalendarSyncService.syncAll(MeetingHub.store.db, MeetingHub.store);
        const freshStatus = await MeetingHub.CalendarSyncService.getSyncStatus(MeetingHub.store.db);
        shell.setSyncStatus(freshStatus);
      } catch (e) {
        // Silent background sync fail
      }
    }, 600);
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
