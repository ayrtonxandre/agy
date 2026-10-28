/**
 * Application Shell Component
 * 
 * Renders the persistent dark navy sidebar and sticky header,
 * manages view/mode switching, handles dark/light theme toggle,
 * and displays live calendar source sync status with trigger.
 */
import { Icons } from './icons.js';

export class ShellUI {
  constructor({ onNavigate, onModeChange, onNewMeeting, onTodayClick, onSyncTrigger, onSearch }) {
    this.onNavigate = onNavigate;
    this.onModeChange = onModeChange;
    this.onNewMeeting = onNewMeeting;
    this.onTodayClick = onTodayClick;
    this.onSyncTrigger = onSyncTrigger;
    this.onSearch = onSearch;
    this.currentView = 'today';
    this.currentMode = 'all';
    this.isSyncing = false;
    this.syncStatus = null;
    this.theme = this.getInitialTheme();

    this.applyTheme(this.theme);
  }

  getInitialTheme() {
    try {
      const saved = localStorage.getItem('mhub_theme');
      if (saved) return saved;
    } catch (e) {}
    // Default to dark mode as requested
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

      <!-- Theme Switcher & System Footer -->
      <div class="sidebar-footer">
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

    this.renderSyncSection();
    this.renderThemeButton();
  }

  renderSyncSection() {
    const container = document.querySelector('#sidebarSyncContainer');
    if (!container) return;

    const sources = this.syncStatus?.sources || {
      google: { name: 'Artefact', label: 'Google', dotClass: 'pink', relativeTime: 'Just now' },
      outlook: { name: 'Clariane', label: 'Outlook', dotClass: 'blue', relativeTime: 'Just now' },
      icloud: { name: 'Personal', label: 'iCloud', dotClass: 'green', relativeTime: 'Just now' },
      athx: { name: 'ATHX', label: 'Training', dotClass: 'amber', relativeTime: 'Just now' }
    };

    container.innerHTML = `
      <div class="sidebar-sync-header">
        <span class="sidebar-sync-title">Calendar Streams</span>
        <button class="sidebar-sync-btn ${this.isSyncing ? 'syncing' : ''}" id="sidebarSyncBtn" title="Sync all calendar streams">
          ${Icons.refreshCw} ${this.isSyncing ? 'Syncing...' : 'Sync now'}
        </button>
      </div>

      <div class="sync-source-item" title="Google Calendar API (Work)">
        <div class="sync-source-info">
          <span class="sync-source-dot ${sources.google.dotClass}"></span>
          <span>${sources.google.name}</span>
        </div>
        <span class="sync-source-time" id="syncTimeGoogle">${sources.google.relativeTime}</span>
      </div>

      <div class="sync-source-item" title="Office 365 Outlook ICS (Client)">
        <div class="sync-source-info">
          <span class="sync-source-dot ${sources.outlook.dotClass}"></span>
          <span>${sources.outlook.name}</span>
        </div>
        <span class="sync-source-time" id="syncTimeOutlook">${sources.outlook.relativeTime}</span>
      </div>

      <div class="sync-source-item" title="iCloud CalDAV / ICS (Personal)">
        <div class="sync-source-info">
          <span class="sync-source-dot ${sources.icloud.dotClass}"></span>
          <span>${sources.icloud.name}</span>
        </div>
        <span class="sync-source-time" id="syncTimeIcloud">${sources.icloud.relativeTime}</span>
      </div>

      <div class="sync-source-item" title="ATHX Garmin Training Microcycle">
        <div class="sync-source-info">
          <span class="sync-source-dot ${sources.athx.dotClass}"></span>
          <span>${sources.athx.name}</span>
        </div>
        <span class="sync-source-time" id="syncTimeAthx">${sources.athx.relativeTime}</span>
      </div>
    `;

    container.querySelector('#sidebarSyncBtn')?.addEventListener('click', () => {
      if (this.onSyncTrigger && !this.isSyncing) {
        this.onSyncTrigger();
      }
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

    // Replace event listener cleanly
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
    `;

    // Search input handler
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

    // Mode switch handler
    header.querySelectorAll('.seg button').forEach(btn => {
      btn.addEventListener('click', () => {
        header.querySelectorAll('.seg button').forEach(b => b.classList.remove('on'));
        btn.classList.add('on');
        this.currentMode = btn.dataset.m;
        if (this.onModeChange) this.onModeChange(this.currentMode);
      });
    });

    // Today jump
    header.querySelector('#todayNavBtn')?.addEventListener('click', () => {
      if (this.onTodayClick) this.onTodayClick();
    });

    // New meeting trigger
    header.querySelector('#newMeetingBtn')?.addEventListener('click', () => {
      if (this.onNewMeeting) this.onNewMeeting();
    });
  }

  updateActionsBadge(count) {
    const badge = document.querySelector('#navActions');
    if (badge) badge.textContent = count;
  }
}
