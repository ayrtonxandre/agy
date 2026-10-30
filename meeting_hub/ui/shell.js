/**
 * Application Shell Component (Phase 2 Cockpit Rail)
 * 
 * Renders the persistent dark navy sidebar and sticky header,
 * manages mission rail navigation, Today strip, live calendar source sync status,
 * storage engine info, and theme toggle.
 */
import { Icons } from './icons.js';
import { getTodayDateStr, formatLongDate } from '../model/date_utils.js';

export class ShellUI {
  constructor({
    store = null,
    onNavigate,
    onModeChange,
    onNewMeeting,
    onTodayClick,
    onSyncTrigger,
    onSearch,
    onExportData,
    onImportData,
    getStorageEngine,
    onProjectChange,
    onConfirmSuggestedProject,
    onCreateProject,
    onTogglePanel,
    projects = [],
    activeProjectId = 'ge-enterprise',
    suggestedProjects = []
  } = {}) {
    this.store = store;
    this.onNavigate = onNavigate;
    this.onModeChange = onModeChange;
    this.onNewMeeting = onNewMeeting;
    this.onTodayClick = onTodayClick;
    this.onSyncTrigger = onSyncTrigger;
    this.onSearch = onSearch;
    this.onExportData = onExportData;
    this.onImportData = onImportData;
    this.getStorageEngine = getStorageEngine || (() => 'IndexedDB');
    this.onProjectChange = onProjectChange;
    this.onConfirmSuggestedProject = onConfirmSuggestedProject;
    this.onCreateProject = onCreateProject;
    this.onTogglePanel = onTogglePanel;

    this.projects = projects;
    this.activeProjectId = activeProjectId || 'ge-enterprise';
    this.suggestedProjects = suggestedProjects;
    this.isPanelCollapsed = false;

    this.currentView = 'mission';
    this.currentMode = 'all';
    this.isSyncing = false;
    this.syncStatus = null;
    this.railState = null;
    this.showArchived = false;
    this.theme = this.getInitialTheme();

    this.applyTheme(this.theme);
  }

  getInitialTheme() {
    try {
      const saved = localStorage.getItem('mhub_theme');
      if (saved) return saved;
    } catch (e) {}
    return 'dark';
  }

  applyTheme(theme) {
    this.theme = theme;
    const html = document.documentElement;
    if (theme === 'dark') {
      html.classList.add('dark');
      html.classList.remove('light');
    } else {
      html.classList.add('light');
      html.classList.remove('dark');
    }
    try {
      localStorage.setItem('mhub_theme', theme);
    } catch (e) {}
  }

  toggleTheme() {
    const next = this.theme === 'dark' ? 'light' : 'dark';
    this.applyTheme(next);
    this.renderThemeButton();
  }

  setSyncStatus(status) {
    this.syncStatus = status;
    this.renderSyncSection();
  }

  setRailState(railState) {
    this.railState = railState;
    this.renderSidebar();
  }

  async refreshRail() {
    if (this.store && typeof this.store.getRailState === 'function') {
      try {
        this.railState = await this.store.getRailState();
      } catch (e) {
        console.warn('[ShellUI] Failed to refresh rail state:', e);
      }
    }
    this.renderSidebar();
  }

  setActiveProjectId(id) {
    if (!id) return;
    this.activeProjectId = id;
    const aside = document.querySelector('aside');
    if (aside) {
      aside.querySelectorAll('.nav[data-nav-mission]').forEach(btn => {
        if (btn.dataset.navMission === id) {
          btn.classList.add('on');
        } else {
          btn.classList.remove('on');
        }
      });
    }
  }

  setProjects(projects, activeProjectId, suggestedProjects = []) {
    this.projects = projects || [];
    if (activeProjectId) this.activeProjectId = activeProjectId;
    this.suggestedProjects = suggestedProjects || [];
    this.renderSidebar();
  }

  setSyncing(syncing) {
    this.isSyncing = syncing;
    const syncBtn = document.querySelector('#sidebarSyncBtn');
    if (syncBtn) {
      if (syncing) {
        syncBtn.classList.add('syncing');
        syncBtn.innerHTML = `${Icons.refreshCw} Syncing...`;
      } else {
        syncBtn.classList.remove('syncing');
        syncBtn.innerHTML = `${Icons.refreshCw} Sync now`;
      }
    }
  }

  renderSidebar(openActionsCount = 0) {
    const aside = document.querySelector('aside');
    if (!aside) return;

    // Resolve missions from railState or fallback to this.projects / window.MISSIONS_SNAPSHOT
    let missionList = [];
    if (this.railState && Array.isArray(this.railState.missions) && this.railState.missions.length > 0) {
      missionList = this.railState.missions;
    } else if (this.projects && this.projects.length > 0) {
      missionList = this.projects.map(p => ({
        id: p.id,
        name: p.name,
        archived: Boolean(p.archived || p.status === 'archived'),
        foldCount: 0
      }));
    } else if (typeof window !== 'undefined' && window.MISSIONS_SNAPSHOT && Array.isArray(window.MISSIONS_SNAPSHOT.missions)) {
      missionList = window.MISSIONS_SNAPSHOT.missions.map(m => ({
        id: m.id,
        name: m.name,
        archived: Boolean(m.archived || m.status === 'archived'),
        foldCount: 0
      }));
    }

    const activeMissions = missionList.filter(m => !m.archived);
    const archivedMissions = missionList.filter(m => m.archived);

    // Today strip details
    const nextToday = this.railState?.todayNextMeeting;
    const todayStripHtml = nextToday ? `
      <div class="today-strip" id="railTodayStrip" title="Open next meeting today in its mission">
        <span class="today-strip-icon">${Icons.calendar}</span>
        <span class="today-strip-text">Next: <b>${this._escape(nextToday.timeStr)}</b> ${this._escape(nextToday.title)} · <span class="sub" style="font-size: 11px;">${this._escape(nextToday.missionName)}</span></span>
      </div>
    ` : `
      <div class="today-strip empty">
        <span class="today-strip-icon">${Icons.calendar}</span>
        <span class="today-strip-text">No more meetings today</span>
      </div>
    `;

    const inboxCount = this.railState?.inboxBadge ?? 0;
    const myActionsCount = this.railState?.myActionsBadge ?? openActionsCount;

    aside.innerHTML = `
      <div class="brand">
        <b>M</b>
        <div>Meeting Hub<small>Prep · Capture · Link</small></div>
      </div>

      <!-- Phase 2: Today Strip (Top, One Line) -->
      ${todayStripHtml}

      <!-- Missions Section -->
      <div class="grp">Missions</div>
      <div class="sidebar-missions-list">
        ${activeMissions.map(m => {
          const isSelected = (this.currentView === 'mission' && this.activeProjectId === m.id);
          return `
            <button class="nav ${isSelected ? 'on' : ''}" data-nav-mission="${this._escape(m.id)}" title="${this._escape(m.name)}">
              ${Icons.layers}
              <span style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap; flex: 1; text-align: left;">${this._escape(m.name)}</span>
              ${m.foldCount > 0 ? `<span class="n amber" title="${m.foldCount} meeting(s) to fold">${m.foldCount}</span>` : ''}
            </button>
          `;
        }).join('')}
      </div>

      <!-- Archived Missions Toggle -->
      ${archivedMissions.length > 0 ? `
        <button class="sidebar-archived-toggle" id="toggleArchivedMissionsBtn">
          ${this.showArchived ? '▾' : '▸'} Archived (${archivedMissions.length})
        </button>
        ${this.showArchived ? `
          <div class="sidebar-archived-list" style="margin-left: 8px; border-left: 1px solid var(--border); padding-left: 4px;">
            ${archivedMissions.map(m => {
              const isSelected = (this.currentView === 'mission' && this.activeProjectId === m.id);
              return `
                <button class="nav ${isSelected ? 'on' : ''}" data-nav-mission="${this._escape(m.id)}" title="Archived: ${this._escape(m.name)}" style="opacity: 0.85; font-size: 12px;">
                  ${Icons.archive || Icons.layers}
                  <span style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap; flex: 1; text-align: left;">${this._escape(m.name)}</span>
                  ${m.foldCount > 0 ? `<span class="n amber" title="${m.foldCount} to fold">${m.foldCount}</span>` : ''}
                </button>
              `;
            }).join('')}
          </div>
        ` : ''}
      ` : ''}

      <!-- Across Missions Section -->
      <div class="grp">Across</div>
      <button class="nav ${this.currentView === 'inbox' ? 'on' : ''}" data-nav-view="inbox" title="Cross-mission raw meeting minutes inbox">
        ${Icons.inbox || Icons.layers}Inbox
        ${inboxCount > 0 ? `<span class="n amber" title="${inboxCount} pending minutes">${inboxCount}</span>` : '<span class="n">0</span>'}
      </button>
      <button class="nav ${this.currentView === 'my-actions' ? 'on' : ''}" data-nav-view="my-actions" title="Actions assigned to you across missions">
        ${Icons.checkSquare}My actions
        <span class="n" id="navActions">${myActionsCount}</span>
      </button>
      <button class="nav ${this.currentView === 'calendar' ? 'on' : ''}" data-nav-view="calendar" title="Calendar Views">
        ${Icons.calendar}Calendar
      </button>

      <!-- Ecosystem Section -->
      <div class="grp">Ecosystem</div>
      <a class="nav" href="garmin_workout.html" target="_blank" rel="noopener">
        ${Icons.activity}ATHX Athlete
      </a>

      <div class="spacer"></div>

      <!-- Calendar Streams & Sync Section -->
      <div class="sidebar-sync" id="sidebarSyncContainer">
        <!-- Rendered by renderSyncSection -->
      </div>

      <!-- Theme Switcher & Storage Footer -->
      <div class="sidebar-footer">
        <div class="sidebar-storage-block" id="sidebarStorageBlock">
          <!-- Rendered by renderStorageSection -->
        </div>
        <button class="theme-toggle-btn" id="themeToggleBtn">
          <!-- Rendered by renderThemeButton -->
        </button>
      </div>
    `;

    // Today strip click
    const stripEl = aside.querySelector('#railTodayStrip');
    if (stripEl && nextToday) {
      stripEl.addEventListener('click', () => {
        if (nextToday.missionId) {
          window.location.hash = '#/p/' + encodeURIComponent(nextToday.missionId) + '/m/' + encodeURIComponent(nextToday.event.id);
        } else {
          window.location.hash = '#/calendar/m/' + encodeURIComponent(nextToday.event.id);
        }
      });
    }

    // Mission buttons click
    aside.querySelectorAll('[data-nav-mission]').forEach(btn => {
      btn.addEventListener('click', () => {
        const missionId = btn.dataset.navMission;
        this.activeProjectId = missionId;
        this.currentView = 'mission';
        window.location.hash = '#/p/' + encodeURIComponent(missionId);
      });
    });

    // Archived toggle click
    aside.querySelector('#toggleArchivedMissionsBtn')?.addEventListener('click', () => {
      this.showArchived = !this.showArchived;
      this.renderSidebar(openActionsCount);
    });

    // Across views click
    aside.querySelectorAll('[data-nav-view]').forEach(btn => {
      btn.addEventListener('click', () => {
        const view = btn.dataset.navView;
        this.currentView = view;
        if (view === 'inbox') {
          window.location.hash = '#/inbox';
        } else if (view === 'my-actions') {
          window.location.hash = '#/my-actions';
        } else if (view === 'calendar') {
          window.location.hash = '#/calendar';
        }
      });
    });

    this.renderSyncSection();
    this.renderStorageSection();
    this.renderThemeButton();
  }

  _escape(str) {
    if (!str) return '';
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  renderSyncSection() {
    const container = document.querySelector('#sidebarSyncContainer');
    if (!container) return;

    const sources = this.syncStatus?.sources || {
      google: { name: 'Artefact', label: 'Google', dotClass: 'pink', status: 'active', relativeTime: 'Just now' },
      outlook: { name: 'Clariane', label: 'Outlook', dotClass: 'blue', status: 'active', relativeTime: 'Just now' },
      icloud: { name: 'Personal', label: 'iCloud', dotClass: 'green', status: 'active', relativeTime: 'Just now' },
      athx: { name: 'ATHX', label: 'Training', dotClass: 'amber', status: 'active', relativeTime: 'Just now' }
    };

    const renderSourceRow = (key, defaultTitle) => {
      const src = sources[key] || { name: key, dotClass: 'blue', status: 'active', relativeTime: 'Never' };
      const isErr = src.status === 'error';
      const tooltip = isErr ? `${src.name}: ${src.error || 'Connection failed'}` : defaultTitle;
      const dotCls = isErr ? 'sync-source-dot error' : `sync-source-dot ${src.dotClass}`;
      const timeDisplay = isErr ? 'Error' : src.relativeTime;

      return `
        <div class="sync-source-item ${isErr ? 'has-error' : ''}" title="${this._escape(tooltip)}">
          <div class="sync-source-info">
            <span class="${dotCls}"></span>
            <span>${this._escape(src.name)}</span>
          </div>
          <span class="sync-source-time ${isErr ? 'err-text' : ''}">${this._escape(timeDisplay)}</span>
        </div>
      `;
    };

    container.innerHTML = `
      <div class="sidebar-sync-header">
        <span class="sidebar-sync-title">Calendar Streams</span>
        <button class="sidebar-sync-btn ${this.isSyncing ? 'syncing' : ''}" id="sidebarSyncBtn" title="Sync all calendar streams">
          ${Icons.refreshCw} ${this.isSyncing ? 'Syncing...' : 'Sync now'}
        </button>
      </div>

      ${renderSourceRow('google', 'Google Calendar API (Work)')}
      ${renderSourceRow('outlook', 'Office 365 Outlook ICS (Client)')}
      ${renderSourceRow('icloud', 'iCloud CalDAV / ICS (Personal)')}
      ${renderSourceRow('athx', 'ATHX Garmin Training Microcycle')}
    `;

    container.querySelector('#sidebarSyncBtn')?.addEventListener('click', () => {
      if (this.onSyncTrigger && !this.isSyncing) {
        this.onSyncTrigger();
      }
    });
  }

  renderStorageSection() {
    const container = document.querySelector('#sidebarStorageBlock');
    if (!container) return;

    const engine = this.getStorageEngine ? this.getStorageEngine() : 'IndexedDB';
    const isIndexedDb = engine === 'IndexedDB';

    container.innerHTML = `
      <div class="storage-badge-row" title="Active local client storage engine">
        <span class="storage-badge ${isIndexedDb ? 'storage-ok' : 'storage-warn'}">
          ${Icons.database} Engine: ${this._escape(engine)}
        </span>
      </div>
      ${!isIndexedDb ? `
        <div class="storage-warning-banner" role="alert" title="Data stored in fallback storage">
          ${Icons.alertCircle} <span>Notes may be lost on browser clear</span>
        </div>
      ` : ''}
      <div class="storage-actions-row">
        <button class="btn-storage-action" id="exportDataBtn" title="Export all notes, items and links as JSON">
          ${Icons.download} Export JSON
        </button>
        <button class="btn-storage-action" id="importDataBtn" title="Import notes, items and links from JSON file">
          ${Icons.upload} Import JSON
        </button>
        <input type="file" id="importJsonFileInput" accept=".json,application/json" style="display: none;" />
      </div>
    `;

    container.querySelector('#exportDataBtn')?.addEventListener('click', () => {
      if (this.onExportData) this.onExportData();
    });

    const fileInput = container.querySelector('#importJsonFileInput');
    container.querySelector('#importDataBtn')?.addEventListener('click', () => {
      fileInput?.click();
    });

    fileInput?.addEventListener('change', (e) => {
      const file = e.target.files && e.target.files[0];
      if (file && this.onImportData) {
        const reader = new FileReader();
        reader.onload = (evt) => {
          this.onImportData(evt.target.result);
        };
        reader.readAsText(file);
      }
      e.target.value = '';
    });
  }

  renderThemeButton() {
    const btn = document.querySelector('#themeToggleBtn');
    if (!btn) return;

    if (this.theme === 'dark') {
      btn.innerHTML = `${Icons.sun} Light Mode`;
      btn.title = 'Switch to Light Theme';
    } else {
      btn.innerHTML = `${Icons.moon} Dark Mode`;
      btn.title = 'Switch to Dark Theme';
    }

    btn.onclick = () => this.toggleTheme();
  }

  renderHeader(title = 'Today', subtitle = null) {
    const header = document.querySelector('header');
    if (!header) return;

    const sub = subtitle !== null ? subtitle : (title === 'Today' ? (typeof formatLongDate === 'function' ? formatLongDate(typeof getTodayDateStr === 'function' ? getTodayDateStr() : new Date().toISOString().slice(0, 10)) : '') : '');

    // Notice: Phase 2 rule 2 removes the #modeSelector pills (Work/Life/All) from the global header.
    // They are now housed inside Calendar views.
    header.innerHTML = `
      <h1 id="title">${title}</h1>
      <span class="sub" id="subtitle">${sub}</span>
      <div class="spacer"></div>

      <div class="header-search">
        ${Icons.search}
        <input type="search" id="quickSearch" placeholder="Search (/)" />
      </div>

      <button class="btn sm" id="todayNavBtn" style="font-family: var(--font-mono); font-size: 11.5px;">Today</button>
      <button class="btn sm pink" id="newMeetingBtn">${Icons.plus} New Meeting</button>
      <button class="btn sm" id="togglePanelBtn" title="${this.isPanelCollapsed ? 'Expand meeting panel' : 'Collapse meeting panel'}" style="display: inline-flex; align-items: center; gap: 5px;">
        ${this.isPanelCollapsed ? Icons.panelRightOpen : Icons.panelRightClose}
        <span class="btn-text">Panel</span>
      </button>
    `;

    const searchInput = header.querySelector('#quickSearch');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        if (this.onSearch) this.onSearch(e.target.value);
      });
      searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          searchInput.value = '';
          if (this.onSearch) this.onSearch('');
          searchInput.blur();
        }
      });
    }

    header.querySelector('#todayNavBtn')?.addEventListener('click', () => {
      if (this.onTodayClick) this.onTodayClick();
    });

    header.querySelector('#newMeetingBtn')?.addEventListener('click', () => {
      if (this.onNewMeeting) this.onNewMeeting();
    });

    header.querySelector('#togglePanelBtn')?.addEventListener('click', () => {
      if (this.onTogglePanel) this.onTogglePanel();
    });
  }

  updatePanelToggle(isCollapsed) {
    this.isPanelCollapsed = isCollapsed;
    const btn = document.querySelector('#togglePanelBtn');
    if (btn) {
      btn.title = isCollapsed ? 'Expand meeting panel' : 'Collapse meeting panel';
      btn.innerHTML = `${isCollapsed ? Icons.panelRightOpen : Icons.panelRightClose} <span class="btn-text">Panel</span>`;
      if (isCollapsed) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    }
  }

  updateActionsBadge(count) {
    const badge = document.querySelector('#navActions');
    if (badge) badge.textContent = count;
  }
}
