/**
 * Mission Cockpit & Knowledge View Component (Phase 3 Project Hub)
 * 
 * Replaces legacy KPI project base with an actionable Mission Cockpit:
 * - Dynamic Header: Title, status, open actions count, amber "to fold" count, next meeting
 * - Meeting Stream (always open, default view):
 *     1. Up next: prep (<=48h) with workstream context & prep checklist dots
 *     2. Just happened: fold (amber) with distinct capture/inbox states
 *     3. Folded: collapsed 1-line strip, expandable
 * - Knowledge Tabs below the stream (collapsed by default):
 *     Workstreams, Decisions, Actions, Contacts, Brief
 */
import { Icons } from '../ui/icons.js';

export class ProjectsView {
  constructor({ container, store, onSelectMeeting } = {}) {
    this.container = container;
    this.store = store;
    this.onSelectMeeting = onSelectMeeting;
    this.currentProjectId = 'ge-enterprise';
    this.currentSubTab = null; // 'workstreams' | 'decisions' | 'actions' | 'contacts' | 'brief'
    this.isFoldedOpen = false;
    this.actionOwnerFilter = 'all';
    this.actionStatusFilter = 'open';
    this.decisionWsFilter = 'all';
    this.searchQuery = '';
  }

  setSearchQuery(q) {
    this.searchQuery = (q || '').trim().toLowerCase();
    this.render();
  }

  setProject(projectId) {
    if (!projectId) return;
    this.currentProjectId = projectId;
    this.render();
  }

  setTab(tab) {
    this.currentSubTab = tab || null;
    this.render();
  }

  // Alias for backward compatibility
  setClient(clientId) {
    this.setProject(clientId);
  }

  selectNextMeeting() {
    const cards = Array.from(this.container.querySelectorAll('[data-event-id]'));
    if (cards.length === 0) return;
    const currentId = this.store?.selectedEventId;
    let nextIdx = 0;
    if (currentId) {
      const idx = cards.findIndex(c => c.dataset.eventId === currentId);
      if (idx >= 0 && idx < cards.length - 1) {
        nextIdx = idx + 1;
      }
    }
    const nextCard = cards[nextIdx];
    if (nextCard && this.onSelectMeeting) {
      this.onSelectMeeting(nextCard.dataset.eventId);
    }
  }

  selectPreviousMeeting() {
    const cards = Array.from(this.container.querySelectorAll('[data-event-id]'));
    if (cards.length === 0) return;
    const currentId = this.store?.selectedEventId;
    let prevIdx = 0;
    if (currentId) {
      const idx = cards.findIndex(c => c.dataset.eventId === currentId);
      if (idx > 0) {
        prevIdx = idx - 1;
      } else {
        prevIdx = cards.length - 1;
      }
    }
    const prevCard = cards[prevIdx];
    if (prevCard && this.onSelectMeeting) {
      this.onSelectMeeting(prevCard.dataset.eventId);
    }
  }

  async render() {
    if (!this.container) return;

    // Retrieve full cockpit data from system of record
    const data = await this.store.getMissionHubData(this.currentProjectId);
    const mission = data.mission || { id: this.currentProjectId, name: this.currentProjectId };
    const summary = data.summary || {};
    const lanes = data.lanes || { prep: [], fold: [], folded: [], hidden: [] };
    const inboxStatus = data.inboxStatus || { pendingCount: 0, files: [] };

    // Registry missions for dropdown
    const registry = await this.store.getMissionsRegistry();
    const allMissions = registry?.missions || [];

    // Filter lanes by search query if present
    let prepMeetings = lanes.prep;
    let foldMeetings = lanes.fold;
    let foldedMeetings = lanes.folded;

    if (this.searchQuery) {
      const q = this.searchQuery;
      const matchMeeting = (m) => {
        return (m.title || '').toLowerCase().includes(q) ||
               (m.series || '').toLowerCase().includes(q) ||
               (m.attendees || []).some(a => a.toLowerCase().includes(q));
      };
      prepMeetings = prepMeetings.filter(matchMeeting);
      foldMeetings = foldMeetings.filter(matchMeeting);
      foldedMeetings = foldedMeetings.filter(matchMeeting);
    }

    // Workstreams lookup map
    const workstreams = summary.workstreams || [];
    const openPoints = summary.openPoints || [];
    const actions = summary.actions || summary.actionMatrix || [];
    const decisions = summary.decisionRegister || summary.decisions || [];
    const contacts = summary.contacts || [];

    // Next meeting display text
    let nextMeetingText = 'No upcoming meeting in ≤48h';
    if (data.nextMeeting) {
      nextMeetingText = `${data.nextMeeting.date} ${data.nextMeeting.start} · ${data.nextMeeting.title}`;
    }

    this.container.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 16px;">
        
        <!-- 3.2 Cockpit Header -->
        <div class="cockpit-header">
          <div style="flex: 1; min-width: 280px;">
            <div class="cockpit-title-row">
              <span class="label" style="margin-bottom: 0;">Mission Cockpit</span>
              <span class="badge ${mission.archived ? 'sub' : 'ok'}" style="font-weight: 600;">
                ${mission.archived ? 'Archived' : 'Active Mission'}
              </span>
              <span class="badge" style="font-family: var(--font-mono); font-size: 11px;">
                ${this._escape(mission.id)}
              </span>
            </div>
            <h1 style="font: 600 24px/1.2 var(--font-sans); margin: 6px 0 2px 0;">
              ${this._escape(mission.name)}
            </h1>
            <div class="cockpit-meta-row">
              <span class="badge ${data.openActionsCount > 0 ? '' : 'ok'}">
                ${data.openActionsCount} open action${data.openActionsCount !== 1 ? 's' : ''}
              </span>
              ${data.toFoldCount > 0 ? `
                <span class="badge amber" title="${data.toFoldCount} meeting(s) waiting to be folded into mission notes">
                  ${data.toFoldCount} to fold
                </span>
              ` : `
                <span class="badge ok" style="font-size: 11px;">All folded</span>
              `}
              <span style="font-family: var(--font-mono); font-size: 11.5px;">
                Next: <b>${this._escape(nextMeetingText)}</b>
              </span>
              <span class="sub" style="font-size: 11px;" title="Mission notes folder in system of record">
                📁 ${this._escape(mission.directory || mission.id)}
              </span>
            </div>
          </div>

          <!-- Mission Switcher Dropdown (Updates URL directly) -->
          <div style="display: flex; gap: 8px; align-items: center;">
            <label for="projectSelectDropdown" class="sub" style="font-size: 12px; font-weight: 500;">Mission:</label>
            <select id="projectSelectDropdown" class="input" style="font-size: 13px; font-weight: 600; height: 34px; padding: 4px 10px; border-radius: var(--r-sm); min-width: 250px; cursor: pointer;">
              ${allMissions.map(m => `
                <option value="${this._escape(m.id)}" ${this.currentProjectId.toLowerCase() === m.id.toLowerCase() ? 'selected' : ''}>
                  ${m.archived ? '[Archived] ' : ''}${this._escape(m.name)}
                </option>
              `).join('')}
            </select>
          </div>
        </div>

        <!-- 3.3 Meeting Stream (Always visible, default content) -->
        <div class="stream-container">
          
          <!-- Lane 1: Up next: prep (<=48h) -->
          <div class="stream-lane">
            <div class="lane-header">
              <span>Up next: prep (≤48h)</span>
              <span class="badge ${prepMeetings.length > 0 ? 'pink' : ''}">${prepMeetings.length}</span>
            </div>
            ${prepMeetings.length === 0 ? `
              <div class="empty-lane">Nothing in the next 48h for this mission</div>
            ` : `
              <div class="lane-cards">
                ${prepMeetings.map(m => this._renderPrepCard(m, summary, inboxStatus)).join('')}
              </div>
            `}
          </div>

          <!-- Lane 2: Just happened: fold (amber) -->
          <div class="stream-lane" style="border-color: ${foldMeetings.length > 0 ? 'oklch(0.78 0.16 75 / 45%)' : 'var(--border)'};">
            <div class="lane-header" style="color: ${foldMeetings.length > 0 ? 'oklch(0.85 0.16 75)' : 'var(--muted-foreground)'};">
              <span>Just happened: fold</span>
              <span class="badge ${foldMeetings.length > 0 ? 'amber' : 'ok'}">${foldMeetings.length}</span>
            </div>
            ${foldMeetings.length === 0 ? `
              <div class="empty-lane" style="border-left: 3px solid var(--ok); color: var(--ok);">All minutes folded</div>
            ` : `
              <div class="lane-cards">
                ${foldMeetings.map(m => this._renderFoldCard(m, inboxStatus)).join('')}
              </div>
            `}
          </div>

          <!-- Lane 3: Folded (collapsed 1-line strip, expandable) -->
          ${foldedMeetings.length > 0 ? `
            <div class="folded-summary-strip" id="toggleFoldedStripBtn" title="Click to ${this.isFoldedOpen ? 'collapse' : 'expand'} folded meetings">
              <span style="font-weight: 600;">✔ ${foldedMeetings.length} folded meeting${foldedMeetings.length !== 1 ? 's' : ''}</span>
              <span style="font-size: 11.5px; opacity: 0.85;">
                ${this.isFoldedOpen ? '▲ Click to collapse' : '▼ Click to show folded meetings'}
              </span>
            </div>
            ${this.isFoldedOpen ? `
              <div class="lane-cards" style="margin-top: 8px;">
                ${foldedMeetings.map(m => `
                  <div class="meeting-card" data-event-id="${this._escape(m.id)}" style="opacity: 0.85;">
                    <div class="meeting-card-head">
                      <div>
                        <span class="meeting-card-time">${this._escape(m.date)} ${this._escape(m.start)}</span>
                        <span class="meeting-card-title">${this._escape(m.title)}</span>
                      </div>
                      <span class="badge ok" style="font-size: 10px;">Folded in notes</span>
                    </div>
                  </div>
                `).join('')}
              </div>
            ` : ''}
          ` : ''}

          <!-- Hidden older meetings notice -->
          ${lanes.hidden.length > 0 ? `
            <div class="sub" style="font-size: 11px; margin-top: 4px; color: var(--muted-foreground);">
              ${lanes.hidden.length} older meeting${lanes.hidden.length !== 1 ? 's' : ''} without minutes (archived)
            </div>
          ` : ''}
        </div>

        <!-- 3.4 Knowledge Tabs (below the stream, collapsed to tab bar by default) -->
        <div class="tabs" style="margin-top: 12px; margin-bottom: 0;">
          <button data-cockpit-tab="workstreams" class="${this.currentSubTab === 'workstreams' ? 'on' : ''}">
            Workstreams (${workstreams.length})
          </button>
          <button data-cockpit-tab="decisions" class="${this.currentSubTab === 'decisions' ? 'on' : ''}">
            Decisions (${decisions.length})
          </button>
          <button data-cockpit-tab="actions" class="${this.currentSubTab === 'actions' ? 'on' : ''}">
            Actions (${data.openActionsCount} Open)
          </button>
          <button data-cockpit-tab="contacts" class="${this.currentSubTab === 'contacts' ? 'on' : ''}">
            Contacts (${contacts.length})
          </button>
          <button data-cockpit-tab="brief" class="${this.currentSubTab === 'brief' ? 'on' : ''}">
            Brief
          </button>
        </div>

        <!-- Tab Body (Only rendered when a tab is selected) -->
        ${this.currentSubTab ? `
          <div id="cockpitTabContent" style="background: var(--card); border: 1px solid var(--border); border-radius: var(--r-md); padding: 16px;">
            ${this._renderTabBody(summary, data)}
          </div>
        ` : ''}

      </div>
    `;

    this._bindEvents(data);
  }

  _renderPrepCard(meeting, summary, inboxStatus) {
    // Match workstream
    const titleLower = (meeting.title || '').toLowerCase();
    const ws = (summary.workstreams || []).find(w => 
      titleLower.includes((w.badge || '').toLowerCase()) ||
      titleLower.includes((w.title || '').toLowerCase()) ||
      titleLower.includes((w.id || '').toLowerCase())
    );

    // Collect 3 open points / actions from notes (prioritaire first)
    const allActions = summary.actions || summary.actionMatrix || [];
    const openActs = allActions.filter(a => !a.done);
    
    // Sort blocking / prioritaire first
    openActs.sort((a, b) => {
      const aPrio = (a.deadline || '').toLowerCase().includes('prioritaire') || (a.text || '').toLowerCase().includes('prioritaire');
      const bPrio = (b.deadline || '').toLowerCase().includes('prioritaire') || (b.text || '').toLowerCase().includes('prioritaire');
      if (aPrio && !bPrio) return -1;
      if (!aPrio && bPrio) return 1;
      return 0;
    });

    const displayPoints = openActs.slice(0, 3);

    // Prep dots: 1: agenda, 2: last minutes folded, 3: actions reviewed
    const dot1 = Boolean(meeting.notes && meeting.notes.trim().length > 0);
    const dot2 = inboxStatus.pendingCount === 0;
    const dot3 = openActs.length === 0;

    return `
      <div class="meeting-card" data-event-id="${this._escape(meeting.id)}">
        <div class="meeting-card-head">
          <div style="display: flex; align-items: baseline; gap: 8px; flex-wrap: wrap;">
            <span class="meeting-card-time">${this._escape(meeting.date)} · ${this._escape(meeting.start)} - ${this._escape(meeting.end)}</span>
            <span class="meeting-card-title">${this._escape(meeting.title)}</span>
            ${ws ? `<span class="badge info" style="font-size: 10px;">${this._escape(ws.badge || ws.title)}</span>` : ''}
          </div>
          <div class="prep-dots" title="Prep Checklist: (1) Agenda drafted, (2) Previous folded, (3) Actions clear">
            <span class="prep-dot ${dot1 ? 'ok' : ''}"></span>
            <span class="prep-dot ${dot2 ? 'ok' : ''}"></span>
            <span class="prep-dot ${dot3 ? 'ok' : ''}"></span>
          </div>
        </div>

        ${displayPoints.length > 0 ? `
          <ul class="meeting-card-points">
            ${displayPoints.map(p => `
              <li>
                <b style="font-family: var(--font-mono); color: var(--pink-600);">${this._escape(p.id)}:</b>
                ${this._escape(p.text || p.description)}
                ${p.owner ? `<span class="sub" style="font-size: 10.5px;">(${this._escape(p.owner)})</span>` : ''}
              </li>
            `).join('')}
          </ul>
        ` : `
          <div class="sub" style="font-size: 11px; margin-top: 2px;">No blocking actions pending for this stream.</div>
        `}
      </div>
    `;
  }

  _renderFoldCard(meeting, inboxStatus) {
    // Check if a file is already in inbox for this meeting
    const hasInboxFile = (inboxStatus.files || []).some(f => 
      f.includes(meeting.id) ||
      f.toLowerCase().includes((meeting.title || '').slice(0, 15).toLowerCase().replace(/[^a-z0-9]+/g, '_'))
    );

    return `
      <div class="meeting-card fold-card" data-event-id="${this._escape(meeting.id)}">
        <div class="meeting-card-head">
          <div>
            <span class="meeting-card-time">${this._escape(meeting.date)} · ${this._escape(meeting.start)} - ${this._escape(meeting.end)}</span>
            <span class="meeting-card-title">${this._escape(meeting.title)}</span>
          </div>
          ${hasInboxFile ? `
            <div class="fold-state-pill inbox">⏳ In inbox, waiting to fold</div>
          ` : `
            <div class="fold-state-pill empty">⚠️ No minutes yet · Drop or paste</div>
          `}
        </div>
      </div>
    `;
  }

  _renderTabBody(summary, data) {
    if (this.currentSubTab === 'workstreams') {
      const wsList = summary.workstreams || [];
      return `
        <div style="display: grid; gap: 12px; grid-template-columns: repeat(auto-fit, minmax(340px, 1fr));">
          ${wsList.length > 0 ? wsList.map(w => `
            <div class="card" style="padding: 14px; display: flex; flex-direction: column; gap: 8px;">
              <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 8px;">
                <div>
                  <span class="badge info" style="font-size: 10px;">${this._escape(w.badge || 'Workstream')}</span>
                  <h3 style="font: 600 15px/1.3 var(--font-sans); margin: 4px 0 2px 0;">${this._escape(w.title)}</h3>
                </div>
                <span class="badge" style="font-size: 11px;">
                  ${w.openPointsCount || 0} open points
                </span>
              </div>
              <div class="sub" style="font-size: 12px; color: var(--foreground);">${this._escape(w.summary)}</div>
              ${(w.keyRules && w.keyRules.length > 0) ? `
                <div style="margin-top: 4px; padding-top: 6px; border-top: 1px solid var(--border);">
                  <div style="font-size: 11px; font-weight: 600; text-transform: uppercase; color: var(--muted-foreground); margin-bottom: 4px;">
                    Key Rules &amp; Directives:
                  </div>
                  <ul style="margin: 0; padding-left: 16px; font-size: 11.5px; color: var(--muted-foreground); display: grid; gap: 3px;">
                    ${w.keyRules.map(r => `<li>${this._escape(r)}</li>`).join('')}
                  </ul>
                </div>
              ` : ''}
              <div style="margin-top: auto; padding-top: 6px; font-size: 11px; color: var(--muted-foreground);">
                Source note: <span style="font-family: var(--font-mono);">${this._escape(w.filename || '')}</span>
              </div>
            </div>
          `).join('') : '<div class="sub">No strategic workstream notes found for this mission.</div>'}
        </div>
      `;
    }

    if (this.currentSubTab === 'decisions') {
      const decList = summary.decisionRegister || summary.decisions || [];
      return `
        <div style="display: flex; flex-direction: column; gap: 10px;">
          <div class="sub" style="font-size: 12px; margin-bottom: 4px;">
            Cumulative decision register across mission notes (${decList.length} total, newest first).
          </div>
          <div style="display: grid; gap: 8px;">
            ${decList.length > 0 ? decList.map(d => `
              <div class="card" style="padding: 10px 12px; display: flex; flex-direction: column; gap: 4px;">
                <div style="display: flex; justify-content: space-between; align-items: baseline; gap: 8px;">
                  <span style="font-family: var(--font-mono); font-size: 11.5px; font-weight: 600; color: var(--ok);">${this._escape(d.date || 'Validated')}</span>
                  ${d.noteTitle ? `<span class="badge" style="font-size: 10px;">${this._escape(d.noteTitle)}</span>` : ''}
                </div>
                <div style="font-size: 13px; font-weight: 500; color: var(--foreground);">${this._escape(d.statement || d.decision)}</div>
                ${d.source ? `<div class="sub" style="font-size: 11px;">Source / Context: ${this._escape(d.source)}</div>` : ''}
              </div>
            `).join('') : '<div class="sub">No validated decisions in notes yet.</div>'}
          </div>
        </div>
      `;
    }

    if (this.currentSubTab === 'actions') {
      let actList = summary.actions || summary.actionMatrix || [];
      if (this.actionStatusFilter === 'open') {
        actList = actList.filter(a => !a.done);
      } else if (this.actionStatusFilter === 'done') {
        actList = actList.filter(a => a.done);
      }
      return `
        <div style="display: flex; flex-direction: column; gap: 10px;">
          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
            <div class="sub" style="font-size: 12px;">
              Read-only view from <span style="font-family: var(--font-mono);">Actions.md</span> (single source of truth).
            </div>
            <div style="display: flex; gap: 6px;">
              <button class="btn sm ${this.actionStatusFilter === 'open' ? 'active' : ''}" data-act-filter="open">Open</button>
              <button class="btn sm ${this.actionStatusFilter === 'done' ? 'active' : ''}" data-act-filter="done">Closed</button>
              <button class="btn sm ${this.actionStatusFilter === 'all' ? 'active' : ''}" data-act-filter="all">All</button>
            </div>
          </div>

          <div style="display: grid; gap: 8px;">
            ${actList.length > 0 ? actList.map(a => `
              <div class="card" style="padding: 10px 12px; display: flex; justify-content: space-between; align-items: flex-start; gap: 12px;">
                <div style="flex: 1;">
                  <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
                    <span class="badge ${a.done ? 'ok' : 'pink'}" style="font-family: var(--font-mono); font-size: 10.5px; font-weight: 600;">
                      ${this._escape(a.id)}
                    </span>
                    <span style="font-size: 12px; font-weight: 600; color: var(--foreground);">${this._escape(a.owner || 'Unassigned')}</span>
                    ${a.ownerOrg ? `<span class="badge" style="font-size: 10px;">${this._escape(a.ownerOrg)}</span>` : ''}
                    ${a.deadline ? `<span class="sub" style="font-size: 11px;">Due: ${this._escape(a.deadline)}</span>` : ''}
                  </div>
                  <div style="font-size: 13px; color: var(--foreground); line-height: 1.4;">${this._escape(a.text || a.description)}</div>
                </div>
                <div>
                  <button class="btn sm" data-copy-action-id="${this._escape(a.id)}" style="font-size: 10.5px; padding: 2px 6px;">
                    Copy ID
                  </button>
                </div>
              </div>
            `).join('') : '<div class="sub">No matching actions.</div>'}
          </div>
        </div>
      `;
    }

    if (this.currentSubTab === 'contacts') {
      const contactList = summary.contacts || [];
      return `
        <div style="display: flex; flex-direction: column; gap: 10px;">
          <div class="sub" style="font-size: 12px; margin-bottom: 4px;">
            Stakeholders &amp; contacts from <span style="font-family: var(--font-mono);">Contacts.md</span>.
          </div>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 8px;">
            ${contactList.length > 0 ? contactList.map(c => `
              <div class="card" style="padding: 10px 12px; display: flex; justify-content: space-between; align-items: center;">
                <div>
                  <div style="font-size: 13px; font-weight: 600;">${this._escape(c.name)}</div>
                  <div class="sub" style="font-size: 11.5px;">${this._escape(c.role || '')}</div>
                  ${c.email ? `<div class="sub" style="font-size: 11px; font-family: var(--font-mono);">${this._escape(c.email)}</div>` : ''}
                </div>
                <div style="text-align: right;">
                  <span class="badge" style="font-size: 10px;">${this._escape(c.org || 'Stakeholder')}</span>
                </div>
              </div>
            `).join('') : '<div class="sub">No contacts recorded in Contacts.md yet.</div>'}
          </div>
        </div>
      `;
    }

    if (this.currentSubTab === 'brief') {
      return `
        <div class="card" style="padding: 16px; display: flex; flex-direction: column; gap: 10px;">
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border); padding-bottom: 8px;">
            <div class="label" style="margin: 0;">Agent Brief &amp; Mission Directives</div>
            <span class="sub" style="font-size: 11px;">Agent brief.md (Read-only)</span>
          </div>
          <div style="font-size: 12.5px; line-height: 1.5; color: var(--foreground); white-space: pre-wrap;">
Mission System of Record:
Every decision, workstream parameter, and open action for this mission is stored directly in durable markdown notes inside the mission repository folder.

Iron Rules:
1. Notes are the single source of truth.
2. Meeting Hub captures raw minutes to _inbox/.
3. Folding folds inbox files into mission notes according to Missions/_fold.md.
4. UI never stores knowledge in browser localStorage or IndexedDB.
          </div>
        </div>
      `;
    }

    return '';
  }

  _bindEvents(data) {
    // 1. Mission switcher dropdown
    const projDropdown = this.container.querySelector('#projectSelectDropdown');
    if (projDropdown) {
      projDropdown.addEventListener('change', (e) => {
        const nextId = e.target.value;
        window.location.hash = '#/p/' + encodeURIComponent(nextId);
      });
    }

    // 2. Meeting card clicks -> selects meeting & opens drawer
    this.container.querySelectorAll('[data-event-id]').forEach(card => {
      card.addEventListener('click', () => {
        const eventId = card.dataset.eventId;
        if (eventId && this.onSelectMeeting) {
          this.onSelectMeeting(eventId);
        }
      });
    });

    // 3. Folded summary strip toggle
    this.container.querySelector('#toggleFoldedStripBtn')?.addEventListener('click', () => {
      this.isFoldedOpen = !this.isFoldedOpen;
      this.render();
    });

    // 4. Knowledge tabs click
    this.container.querySelectorAll('[data-cockpit-tab]').forEach(btn => {
      btn.addEventListener('click', () => {
        const tab = btn.dataset.cockpitTab;
        if (this.currentSubTab === tab) {
          // Toggle close
          this.currentSubTab = null;
          window.location.hash = '#/p/' + encodeURIComponent(this.currentProjectId);
        } else {
          this.currentSubTab = tab;
          window.location.hash = '#/p/' + encodeURIComponent(this.currentProjectId) + '/' + encodeURIComponent(tab);
        }
      });
    });

    // 5. Actions filters
    this.container.querySelectorAll('[data-act-filter]').forEach(btn => {
      btn.addEventListener('click', () => {
        this.actionStatusFilter = btn.dataset.actFilter;
        this.render();
      });
    });

    // 6. Copy Action ID button
    this.container.querySelectorAll('[data-copy-action-id]').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const actId = btn.dataset.copyActionId;
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(actId);
        }
        const orig = btn.innerHTML;
        btn.innerHTML = '✓ Copied';
        alert(`Copied action ID "${actId}" to clipboard.\nEdit Actions.md directly in your editor to modify (notes are the single source of truth).`);
        setTimeout(() => { btn.innerHTML = orig; }, 1200);
      });
    });
  }

  _escape(str) {
    if (!str) return '';
    return String(str).replace(/[&<>"']/g, c => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    }[c]));
  }
}
