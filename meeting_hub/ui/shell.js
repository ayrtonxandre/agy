/**
 * Application Shell Component
 * 
 * Renders the persistent dark navy sidebar and sticky header,
 * manages view/mode switching, handles dark/light theme toggle,
 * sidebar project switcher with suggestions, and live calendar source sync status.
 */
import { Icons } from './icons.js';

export class ShellUI {
  constructor({
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
    activeProjectId = 'clariane',
    suggestedProjects = []
  }) {
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
    this.activeProjectId = activeProjectId;
    this.suggestedProjects = suggestedProjects;
    this.isProjectDropdownOpen = false;
    this.isPanelCollapsed = false;

    this.currentView = 'today';
    this.currentMode = 'all';
    this.isSyncing = false;
    this.syncStatus = null;
    this.theme = this.getInitialTheme();

    this.applyTheme(this.theme);

    // Global click listener to close project dropdown on outside click
    document.addEventListener('click', (e) => {
      if (this.isProjectDropdownOpen) {
        const selector = document.querySelector('.sidebar-project-selector');
        if (selector && !selector.contains(e.target)) {
          this.isProjectDropdownOpen = false;
          this.renderProjectSwitcher();
        }
      }
    });
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

  setProjects(projects, activeProjectId, suggestedProjects = []) {
    this.projects = projects || [];
    if (activeProjectId) this.activeProjectId = activeProjectId;
    this.suggestedProjects = suggestedProjects || [];
    this.renderProjectSwitcher();
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

    aside.innerHTML = `
      <div class="brand">
        <b>M</b>
        <div>Meeting Hub<small>Prep · Capture · Link</small></div>
      </div>

      <!-- Project Switcher & Initiative Scope -->
      <div class="sidebar-project-block" id="sidebarProjectContainer">
        <!-- Rendered by renderProjectSwitcher -->
      </div>

      <div class="grp">Work</div>
      <button class="nav ${this.currentView === 'today' ? 'on' : ''}" data-view="today">
        ${Icons.calendar}Today
      </button>
      <button class="nav ${this.currentView === 'week' ? 'on' : ''}" data-view="week">
        ${Icons.week}Week
      </button>
      <button class="nav ${this.currentView === 'meetings' ? 'on' : ''}" data-view="meetings">
        ${Icons.users}Meetings
      </button>
      <button class="nav ${this.currentView === 'actions' ? 'on' : ''}" data-view="actions">
        ${Icons.checkSquare}Open Actions
        <span class="n" id="navActions">${openActionsCount}</span>
      </button>
      <button class="nav ${this.currentView === 'series' ? 'on' : ''}" data-view="series">
        ${Icons.link}Series &amp; Links
      </button>
      <button class="nav ${this.currentView === 'projects' ? 'on' : ''}" data-view="projects">
        ${Icons.layers}Projects &amp; Knowledge
      </button>

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

    // Wire up sidebar view switches
    aside.querySelectorAll('.nav[data-view]').forEach(btn => {
      btn.addEventListener('click', () => {
        this.currentView = btn.dataset.view;
        this.renderSidebar(openActionsCount);
        if (this.onNavigate) this.onNavigate(this.currentView);
      });
    });

    this.renderProjectSwitcher();
    this.renderSyncSection();
    this.renderStorageSection();
    this.renderThemeButton();
  }

  renderProjectSwitcher() {
    const container = document.querySelector('#sidebarProjectContainer');
    if (!container) return;

    const activeProject = (this.projects && this.projects.length > 0)
      ? (this.projects.find(p => p.id === this.activeProjectId) || this.projects[0])
      : { id: 'clariane', name: 'Clariane' };

    container.innerHTML = `
      <div class="sidebar-project-selector">
        <button class="sidebar-project-trigger" id="sidebarProjectTrigger" title="Switch active project initiative">
          <span class="sidebar-project-icon">${Icons.layers}</span>
          <span class="sidebar-project-name">${this._escape(activeProject.name)}</span>
          <span class="sidebar-project-chevron ${this.isProjectDropdownOpen ? 'open' : ''}">${Icons.chevronDown || '▾'}</span>
        </button>

        ${this.isProjectDropdownOpen ? `
          <div class="sidebar-project-dropdown" id="sidebarProjectDropdown">
            <div class="sidebar-project-section-title">Projects</div>
            <div class="sidebar-project-list">
              ${(this.projects || []).map(p => `
                <button class="sidebar-project-option ${p.id === this.activeProjectId ? 'active' : ''}" data-project-id="${this._escape(p.id)}">
                  <span class="sidebar-project-opt-name">${this._escape(p.name)}</span>
                  ${p.id === this.activeProjectId ? `<span class="badge ok" style="font-size: 10px;">Active</span>` : ''}
                </button>
              `).join('')}
            </div>

            ${(this.suggestedProjects && this.suggestedProjects.length > 0) ? `
              <div class="sidebar-project-section-title" style="margin-top: 8px;">Suggested from Tags</div>
              <div class="sidebar-project-suggestions">
                ${this.suggestedProjects.map(sp => `
                  <div class="sidebar-project-suggest-row">
                    <div style="min-width: 0;">
                      <div class="sidebar-project-opt-name" style="font-weight: 500;">${this._escape(sp.name)}</div>
                      <div class="sub" style="font-size: 10px;">${sp.meetingCount} meeting${sp.meetingCount !== 1 ? 's' : ''}</div>
                    </div>
                    <button class="btn sm pink" data-confirm-suggested="${this._escape(sp.name)}" data-suggest-id="${this._escape(sp.id)}" style="font-size: 10px; padding: 2px 7px;">
                      Confirm
                    </button>
                  </div>
                `).join('')}
              </div>
            ` : ''}

            <div class="sidebar-project-actions">
              <button class="btn sm" id="sidebarNewProjectBtn" style="width: 100%; justify-content: center; font-size: 11px;">
                ${Icons.plus} New Project
              </button>
            </div>
          </div>
        ` : ''}
      </div>
    `;

    // Trigger toggle
    container.querySelector('#sidebarProjectTrigger')?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.isProjectDropdownOpen = !this.isProjectDropdownOpen;
      this.renderProjectSwitcher();
    });

    // Project selection
    container.querySelectorAll('[data-project-id]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.dataset.projectId;
        this.activeProjectId = id;
        this.isProjectDropdownOpen = false;
        this.renderProjectSwitcher();
        if (this.onProjectChange) this.onProjectChange(id);
      });
    });

    // Confirm suggested project
    container.querySelectorAll('[data-confirm-suggested]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.dataset.suggestId;
        const name = btn.dataset.confirmSuggested;
        const suggestion = (this.suggestedProjects || []).find(s => s.id === id) || { id, name, clientMatch: [name] };
        if (this.onConfirmSuggestedProject) {
          this.onConfirmSuggestedProject(suggestion);
        }
        this.isProjectDropdownOpen = false;
      });
    });

    // New project action
    container.querySelector('#sidebarNewProjectBtn')?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.isProjectDropdownOpen = false;
      if (this.onCreateProject) {
        this.onCreateProject();
      } else {
        const name = prompt('Enter new project name:');
        if (name && name.trim()) {
          const clientTag = prompt('Enter primary client/meeting tag for this project (optional):', name.trim()) || name.trim();
          if (this.onConfirmSuggestedProject) {
            this.onConfirmSuggestedProject({ name: name.trim(), clientMatch: [clientTag.trim()] });
          }
        }
      }
    });
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

  renderHeader(title = 'Today', subtitle = 'Wednesday 28 October 2026') {
    const header = document.querySelector('header');
    if (!header) return;

    header.innerHTML = `
      <h1 id="title">${title}</h1>
      <span class="sub" id="subtitle">${subtitle}</span>
      <div class="spacer"></div>

      <div class="header-search">
        ${Icons.search}
        <input type="search" id="quickSearch" placeholder="Search (/)" />
      </div>

      <div class="seg" id="modeSelector">
        <button data-m="all" class="${this.currentMode === 'all' ? 'on' : ''}">All</button>
        <button data-m="work" class="${this.currentMode === 'work' ? 'on' : ''}">Work</button>
        <button data-m="life" class="${this.currentMode === 'life' ? 'on' : ''}">Life</button>
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

    header.querySelectorAll('.seg button').forEach(btn => {
      btn.addEventListener('click', () => {
        header.querySelectorAll('.seg button').forEach(b => b.classList.remove('on'));
        btn.classList.add('on');
        this.currentMode = btn.dataset.m;
        if (this.onModeChange) this.onModeChange(this.currentMode);
      });
    });

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
