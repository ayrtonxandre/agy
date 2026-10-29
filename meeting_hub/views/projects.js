/**
 * Project Base & Knowledge View Component
 * 
 * Aggregates all meeting minutes, decisions, cross-meeting action matrix,
 * strategic workstreams, and connected Google Docs for a client initiative
 * (e.g. Clariane HDJ Planning Manager).
 */
import { Icons } from '../ui/icons.js';

export class ProjectsView {
  constructor({ container, store, onSelectMeeting }) {
    this.container = container;
    this.store = store;
    this.onSelectMeeting = onSelectMeeting;
    this.clientId = 'Clariane';
    this.currentSubTab = 'workstreams'; // 'workstreams' | 'decisions' | 'actions' | 'docs'
    this.actionOwnerFilter = 'all';
    this.actionStatusFilter = 'open';
    this.searchQuery = '';
  }

  setSearchQuery(q) {
    this.searchQuery = (q || '').trim().toLowerCase();
    this.render();
  }

  setClient(clientId) {
    this.clientId = clientId;
    this.render();
  }

  async render() {
    if (!this.container) return;

    // Build project base from store
    const project = await this.store.getProjectBase(this.clientId);
    const clients = ['Clariane', 'Artefact'];

    // Filter actions for matrix
    let matrixActions = project.actionMatrix || [];
    if (this.actionStatusFilter === 'open') {
      matrixActions = matrixActions.filter(a => !a.done);
    } else if (this.actionStatusFilter === 'done') {
      matrixActions = matrixActions.filter(a => a.done);
    }
    if (this.actionOwnerFilter !== 'all') {
      matrixActions = matrixActions.filter(a => a.ownerOrg.toLowerCase() === this.actionOwnerFilter.toLowerCase() || a.owner.toLowerCase().includes(this.actionOwnerFilter.toLowerCase()));
    }
    if (this.searchQuery) {
      matrixActions = matrixActions.filter(a => {
        const text = `${a.text} ${a.owner} ${a.facility} ${a.meetingTitle}`.toLowerCase();
        return text.includes(this.searchQuery);
      });
    }

    // Filter decisions
    let decisions = project.decisionRegister || [];
    if (this.searchQuery) {
      decisions = decisions.filter(d => {
        const text = `${d.statement} ${d.label} ${d.facility} ${d.context} ${d.meetingTitle}`.toLowerCase();
        return text.includes(this.searchQuery);
      });
    }

    this.container.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 16px;">
        <!-- Header & Project Switcher -->
        <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; flex-wrap: wrap;">
          <div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <span class="label">Project Base &amp; Intelligence Hub</span>
              <span class="badge ok" style="font-weight: 600;">Active Deployment</span>
              <span class="badge" style="font-family: var(--font-mono); font-size: 11px;">Foundry ↔ HM</span>
            </div>
            <h1 style="font: 600 24px/1.2 var(--font-sans); margin: 4px 0;">${this._escape(project.projectName)}</h1>
            <div class="sub" style="font-size: 12px;">
              Cross-meeting synthesis of minutes, cumulative decision register, and action matrix from Google Docs
            </div>
          </div>

          <!-- Project / Client Selector -->
          <div style="display: flex; gap: 6px; align-items: center;">
            <span class="sub" style="font-size: 11px;">Initiative:</span>
            <div style="display: flex; border: 1px solid var(--border); border-radius: var(--r-sm); overflow: hidden;">
              ${clients.map(c => `
                <button class="btn sm ${this.clientId.toLowerCase() === c.toLowerCase() ? 'pink' : ''}" data-select-client="${c}" style="border: 0; border-radius: 0; font-weight: 500;">
                  ${c}
                </button>
              `).join('')}
            </div>
          </div>
        </div>

        <!-- Top KPI Metric Strip -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 10px;">
          <div class="kpi-cell">
            <span class="kpi-num">${project.totalMeetings}</span>
            <span class="kpi-sub">Total Initiative Meetings · <b style="color: var(--ok);">${project.meetingsWithMinutes} with Minutes</b></span>
          </div>
          <div class="kpi-cell">
            <span class="kpi-num" style="color: var(--pink-600);">${project.actionStats.open}</span>
            <span class="kpi-sub">Open Actions (${project.actionStats.artefactOpen} Artefact · ${project.actionStats.clientOpen} Client)</span>
          </div>
          <div class="kpi-cell">
            <span class="kpi-num" style="color: var(--ok);">${project.decisionStats.total}</span>
            <span class="kpi-sub">Cumulative Validated Decisions</span>
          </div>
          <div class="kpi-cell">
            <span class="kpi-num">${project.connectedDocs.length}</span>
            <span class="kpi-sub">Connected Google Docs</span>
          </div>
        </div>

        <!-- Sub-Tabs Navigation -->
        <div class="tabs" style="margin-bottom: 0;">
          <button data-subtab="workstreams" class="${this.currentSubTab === 'workstreams' ? 'on' : ''}">
            Strategic Workstreams (${project.workstreams.length})
          </button>
          <button data-subtab="decisions" class="${this.currentSubTab === 'decisions' ? 'on' : ''}">
            Decision Register (${project.decisionRegister.length})
          </button>
          <button data-subtab="actions" class="${this.currentSubTab === 'actions' ? 'on' : ''}">
            Action Matrix (${project.actionStats.open} Open)
          </button>
          <button data-subtab="docs" class="${this.currentSubTab === 'docs' ? 'on' : ''}">
            Connected Docs (${project.connectedDocs.length})
          </button>
        </div>

        <!-- Sub-Tab Content -->
        <div id="projectTabBody">
          ${this._renderSubTabContent(project, matrixActions, decisions)}
        </div>
      </div>
    `;

    this._bindEvents(project);
  }

  _renderSubTabContent(project, matrixActions, decisions) {
    if (this.currentSubTab === 'workstreams') {
      return `
        <div style="display: grid; gap: 14px;">
          <!-- Active Strategic Workstreams -->
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(360px, 1fr)); gap: 12px;">
            ${project.workstreams.map(ws => `
              <div class="card" style="padding: 14px; display: flex; flex-direction: column; gap: 8px;">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 8px;">
                  <div>
                    <span class="badge info" style="font-size: 10px; font-weight: 600;">${this._escape(ws.badge)}</span>
                    <h3 style="font: 600 15px/1.3 var(--font-sans); margin: 4px 0 2px 0;">${this._escape(ws.title)}</h3>
                  </div>
                  <span class="badge ${ws.openActionsCount > 0 ? 'pink' : 'ok'}" style="font-size: 11px;">
                    ${ws.openActionsCount} open action${ws.openActionsCount > 1 ? 's' : ''}
                  </span>
                </div>
                <div class="sub" style="font-size: 12px; color: var(--foreground);">${this._escape(ws.summary)}</div>
                
                <div style="margin-top: 4px; padding-top: 6px; border-top: 1px solid var(--border);">
                  <div style="font-size: 11px; font-weight: 600; text-transform: uppercase; color: var(--muted-foreground); margin-bottom: 4px;">
                    Governing Architectural Rules:
                  </div>
                  <ul style="margin: 0; padding-left: 16px; font-size: 11.5px; color: var(--muted-foreground); display: grid; gap: 3px;">
                    ${ws.keyRules.map(r => `<li>${this._escape(r)}</li>`).join('')}
                  </ul>
                </div>

                <div style="display: flex; gap: 4px; align-items: center; margin-top: auto; padding-top: 8px;">
                  <span class="sub" style="font-size: 11px;">Sites:</span>
                  ${ws.facilities.map(f => `<span class="badge" style="font-size: 10px;">${this._escape(f)}</span>`).join('')}
                </div>
              </div>
            `).join('')}
          </div>

          <!-- Stakeholder Matrix & Knowledge Directory -->
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 6px;">
            <!-- Stakeholders Directory -->
            <div class="card" style="padding: 14px;">
              <div style="font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: var(--muted-foreground); margin-bottom: 10px;">
                Stakeholders Directory (${project.stakeholders.length})
              </div>
              <div style="display: grid; gap: 6px; max-height: 220px; overflow-y: auto;">
                ${project.stakeholders.map(s => `
                  <div style="display: flex; justify-content: space-between; align-items: center; padding: 6px 8px; border-radius: var(--r-sm); background: var(--muted);">
                    <div>
                      <div style="font-size: 12px; font-weight: 500;">${this._escape(s.name)}</div>
                      <div style="font-size: 11px; color: var(--muted-foreground);">${this._escape(s.role)}</div>
                    </div>
                    <div style="text-align: right;">
                      <span class="badge" style="font-size: 10px;">${this._escape(s.org)}</span>
                      <div style="font-size: 10px; color: var(--muted-foreground); margin-top: 2px;">${s.meetingCount} session${s.meetingCount > 1 ? 's' : ''}</div>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>

            <!-- Platform Architecture & Entities -->
            <div class="card" style="padding: 14px;">
              <div style="font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: var(--muted-foreground); margin-bottom: 10px;">
                Platform Architecture &amp; Clinical Concepts
              </div>
              <div style="display: flex; flex-direction: column; gap: 8px;">
                <div>
                  <div style="font-size: 11px; color: var(--muted-foreground); margin-bottom: 4px;">Connected Systems:</div>
                  <div style="display: flex; gap: 6px; flex-wrap: wrap;">
                    ${project.tools.map(t => `<span class="badge info" style="font-family: var(--font-mono); font-size: 11px;">${this._escape(t)}</span>`).join('')}
                  </div>
                </div>
                <div>
                  <div style="font-size: 11px; color: var(--muted-foreground); margin-bottom: 4px;">Domain Protocols &amp; Concepts:</div>
                  <div style="display: grid; gap: 4px;">
                    ${project.concepts.map(c => `
                      <div style="font-size: 11.5px; padding: 4px 6px; border-radius: var(--r-sm); background: var(--muted);">
                        <b>${this._escape(c.name)}:</b> <span style="color: var(--muted-foreground);">${this._escape(c.desc)}</span>
                      </div>
                    `).join('')}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;
    }

    if (this.currentSubTab === 'decisions') {
      return `
        <div style="display: flex; flex-direction: column; gap: 10px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div class="sub" style="font-size: 12px;">
              Showing ${decisions.length} validated architecture and operational decisions from meeting minutes
            </div>
          </div>

          <div style="display: grid; gap: 8px;">
            ${decisions.map(d => `
              <div class="card" style="padding: 12px 14px; border-left: 3px solid var(--ok); display: flex; flex-direction: column; gap: 6px;">
                <div style="display: flex; justify-content: space-between; align-items: center; gap: 8px;">
                  <div style="display: flex; align-items: center; gap: 6px;">
                    <span class="badge ok" style="font-weight: 600; font-size: 11px;">${this._escape(d.label)}</span>
                    <span class="badge" style="font-size: 10px;">${this._escape(d.facility)}</span>
                    <span class="sub" style="font-size: 11px;">${this._escape(d.context)}</span>
                  </div>
                  <div style="display: flex; gap: 6px; align-items: center;">
                    <span style="font-family: var(--font-mono); font-size: 11px; color: var(--muted-foreground);">${d.meetingDate}</span>
                    <button class="btn sm" data-open-meeting="${d.meetingId}" style="padding: 2px 8px; font-size: 11px;">
                      View Meeting ${Icons.externalLink}
                    </button>
                  </div>
                </div>
                <div style="font-size: 13px; font-weight: 500; color: var(--foreground); line-height: 1.4;">
                  ${this._escape(d.statement)}
                </div>
                <div class="sub" style="font-size: 11px;">
                  Source: <i>${this._escape(d.meetingTitle)}</i>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }

    if (this.currentSubTab === 'actions') {
      const owners = ['All', 'Artefact', 'Les Arbelles', 'Mariéna', 'Client / Équipe'];

      return `
        <div style="display: flex; flex-direction: column; gap: 10px;">
          <!-- Action Filters Toolbar -->
          <div style="display: flex; justify-content: space-between; align-items: center; gap: 8px; flex-wrap: wrap;">
            <div style="display: flex; gap: 6px; align-items: center;">
              <span class="sub" style="font-size: 11px;">Owner:</span>
              <div style="display: flex; border: 1px solid var(--border); border-radius: var(--r-sm); overflow: hidden;">
                ${owners.map(o => `
                  <button class="btn sm ${this.actionOwnerFilter.toLowerCase() === o.toLowerCase() ? 'pink' : ''}" data-filter-owner="${o}" style="border: 0; border-radius: 0; font-size: 11px;">
                    ${o}
                  </button>
                `).join('')}
              </div>
            </div>

            <div style="display: flex; gap: 6px; align-items: center;">
              <span class="sub" style="font-size: 11px;">Status:</span>
              <div style="display: flex; border: 1px solid var(--border); border-radius: var(--r-sm); overflow: hidden;">
                <button class="btn sm ${this.actionStatusFilter === 'open' ? 'pink' : ''}" data-filter-status="open" style="border: 0; border-radius: 0; font-size: 11px;">Open</button>
                <button class="btn sm ${this.actionStatusFilter === 'done' ? 'pink' : ''}" data-filter-status="done" style="border: 0; border-radius: 0; font-size: 11px;">Done</button>
                <button class="btn sm ${this.actionStatusFilter === 'all' ? 'pink' : ''}" data-filter-status="all" style="border: 0; border-radius: 0; font-size: 11px;">All</button>
              </div>
            </div>
          </div>

          <!-- Actions List -->
          <div style="display: grid; gap: 6px;">
            ${matrixActions.map(act => `
              <div class="card" style="padding: 10px 12px; display: flex; align-items: center; gap: 10px; transition: border-color 0.15s;">
                <button class="item-check-btn ${act.done ? 'checked' : ''}" data-action-id="${act.id}" data-meeting-id="${act.meetingId}" title="${act.done ? 'Mark open' : 'Mark done'}">
                  ${act.done ? Icons.check : ''}
                </button>

                <div style="flex: 1; min-width: 0;">
                  <div style="display: flex; gap: 6px; align-items: center; flex-wrap: wrap;">
                    <span class="chip-owner" style="font-weight: 600;">${this._escape(act.owner)}</span>
                    <span class="badge" style="font-size: 10px;">${this._escape(act.ownerOrg)}</span>
                    <span class="badge" style="font-size: 10px;">${this._escape(act.facility)}</span>
                    ${act.dueDate ? `<span class="chip-due" style="font-size: 10px;">${Icons.clock} ${this._escape(act.dueDate)}</span>` : ''}
                    ${(act.tags || []).map(t => `<span class="badge" style="font-size: 10px;">#${this._escape(t)}</span>`).join('')}
                  </div>
                  <div class="tx ${act.done ? 'done' : ''}" style="margin-top: 4px; font-size: 12.5px; line-height: 1.4;">
                    ${this._escape(act.text)}
                  </div>
                  <div class="sub" style="font-size: 11px; margin-top: 2px;">
                    ${act.meetingDate} · <i>${this._escape(act.meetingTitle)}</i>
                  </div>
                </div>

                <button class="btn sm" data-open-meeting="${act.meetingId}" style="flex-shrink: 0; font-size: 11px;">
                  Open Meeting
                </button>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }

    if (this.currentSubTab === 'docs') {
      return `
        <div style="display: flex; flex-direction: column; gap: 10px;">
          <div class="sub" style="font-size: 12px;">
            Google Docs attached to meetings across this initiative
          </div>

          <div style="display: grid; gap: 8px;">
            ${project.connectedDocs.map(doc => `
              <div class="card" style="padding: 12px 14px; display: flex; justify-content: space-between; align-items: center; gap: 12px;">
                <div style="display: flex; align-items: center; gap: 10px; min-width: 0;">
                  <span class="doc-icon">${Icons.fileText}</span>
                  <div style="min-width: 0;">
                    <div style="font-weight: 600; font-size: 13px;">${this._escape(doc.title)}</div>
                    <div class="sub" style="font-size: 11px; margin-top: 2px;">
                      ${doc.meetingDate} · ${this._escape(doc.facility)} · <span style="color: var(--ok); display: inline-flex; align-items: center; gap: 3px;">${Icons.check} Minutes Ingested (${doc.minutesLength} chars)</span>
                    </div>
                  </div>
                </div>

                <div style="display: flex; gap: 6px; align-items: center; flex-shrink: 0;">
                  <a href="${this._escape(doc.url)}" target="_blank" rel="noopener" class="btn sm pink">
                    Open in Google Docs ${Icons.externalLink}
                  </a>
                  <button class="btn sm" data-open-meeting="${doc.meetingId}">
                    View Meeting
                  </button>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }

    return '';
  }

  _bindEvents(project) {
    // Client selection
    this.container.querySelectorAll('[data-select-client]').forEach(btn => {
      btn.addEventListener('click', () => {
        this.setClient(btn.dataset.selectClient);
      });
    });

    // Sub-tab switching
    this.container.querySelectorAll('.tabs button[data-subtab]').forEach(btn => {
      btn.addEventListener('click', () => {
        this.currentSubTab = btn.dataset.subtab;
        this.render();
      });
    });

    // Open meeting
    this.container.querySelectorAll('[data-open-meeting]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.openMeeting;
        if (id && this.onSelectMeeting) {
          this.onSelectMeeting(id);
        }
      });
    });

    // Owner filter in actions
    this.container.querySelectorAll('[data-filter-owner]').forEach(btn => {
      btn.addEventListener('click', () => {
        this.actionOwnerFilter = btn.dataset.filterOwner;
        this.render();
      });
    });

    // Status filter in actions
    this.container.querySelectorAll('[data-filter-status]').forEach(btn => {
      btn.addEventListener('click', () => {
        this.actionStatusFilter = btn.dataset.filterStatus;
        this.render();
      });
    });

    // Toggle action done state in matrix
    this.container.querySelectorAll('.item-check-btn[data-action-id]').forEach(btn => {
      btn.addEventListener('click', async () => {
        const actId = btn.dataset.actionId;
        const mId = btn.dataset.meetingId;
        if (!mId) return;

        const mData = await this.store.getMeetingData(mId);
        const items = (mData.items || []).map(it => it.id === actId ? { ...it, done: !it.done } : it);
        await this.store.saveMeetingData(mId, { items });
        this.render();
      });
    });
  }

  _escape(str) {
    return String(str || '').replace(/[&<>"']/g, c => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    }[c]));
  }
}
