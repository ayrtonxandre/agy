/**
 * Project Base & Knowledge View Component
 * 
 * Aggregates all meeting minutes, decisions, cross-meeting action matrix,
 * strategic workstreams, and connected Google Docs for any configured initiative.
 * 
 * Features:
 * - Completely generic: driven by project configuration in DB
 * - Honest coverage bars ("X of Y meetings have minutes")
 * - Deduplicated decisions across meetings with "first decided on" and "restated on"
 * - Source quotes and meeting links on every action and decision
 * - Project Settings editor to view and edit project configuration
 */
import { Icons } from '../ui/icons.js';
import { ProjectModel } from '../model/project.js';

export class ProjectsView {
  constructor({ container, store, onSelectMeeting }) {
    this.container = container;
    this.store = store;
    this.onSelectMeeting = onSelectMeeting;
    this.currentProjectId = 'clariane';
    this.currentSubTab = 'workstreams'; // 'workstreams' | 'decisions' | 'actions' | 'docs' | 'settings'
    this.actionOwnerFilter = 'all';
    this.actionStatusFilter = 'open';
    this.searchQuery = '';
    this.settingsFeedback = null;
  }

  setSearchQuery(q) {
    this.searchQuery = (q || '').trim().toLowerCase();
    this.render();
  }

  setProject(projectId) {
    this.currentProjectId = projectId;
    this.settingsFeedback = null;
    this.render();
  }

  // Alias for backward compatibility
  setClient(clientId) {
    this.setProject(clientId);
  }

  async render() {
    if (!this.container) return;

    // Load all projects
    const allProjects = await this.store.getAllProjects();
    if (!allProjects.some(p => p.id === this.currentProjectId)) {
      this.currentProjectId = allProjects[0]?.id || 'clariane';
    }

    // Build project base from store
    const project = await this.store.getProjectBase(this.currentProjectId);

    // Filter actions for matrix
    let matrixActions = project.actionMatrix || [];
    if (this.actionStatusFilter === 'open') {
      matrixActions = matrixActions.filter(a => !a.done);
    } else if (this.actionStatusFilter === 'done') {
      matrixActions = matrixActions.filter(a => a.done);
    }
    if (this.actionOwnerFilter !== 'all') {
      matrixActions = matrixActions.filter(a => 
        (a.ownerOrg || '').toLowerCase() === this.actionOwnerFilter.toLowerCase() || 
        (a.owner || '').toLowerCase().includes(this.actionOwnerFilter.toLowerCase())
      );
    }
    if (this.searchQuery) {
      matrixActions = matrixActions.filter(a => {
        const text = `${a.text} ${a.owner} ${a.facility || ''} ${a.meetingTitle || ''} ${a.quote || ''}`.toLowerCase();
        return text.includes(this.searchQuery);
      });
    }

    // Filter decisions
    let decisions = project.decisionRegister || [];
    if (this.searchQuery) {
      decisions = decisions.filter(d => {
        const text = `${d.statement} ${d.label || ''} ${d.facility || ''} ${d.context || ''} ${d.quote || ''}`.toLowerCase();
        return text.includes(this.searchQuery);
      });
    }

    this.container.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 16px;">
        <!-- Header & Project Selector -->
        <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; flex-wrap: wrap;">
          <div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <span class="label">Project Base &amp; Intelligence Hub</span>
              <span class="badge ok" style="font-weight: 600;">Active Deployment</span>
              <span class="badge" style="font-family: var(--font-mono); font-size: 11px;">${this._escape(project.projectId)}</span>
            </div>
            <h1 style="font: 600 24px/1.2 var(--font-sans); margin: 4px 0;">${this._escape(project.projectName)}</h1>
            <div class="sub" style="font-size: 12px;">
              Cross-meeting synthesis of minutes, cumulative decision register, and action matrix from local client data
            </div>
          </div>

          <!-- Project Initiative Selector Dropdown -->
          <div style="display: flex; gap: 8px; align-items: center;">
            <label for="projectSelectDropdown" class="sub" style="font-size: 12px; font-weight: 500;">Initiative:</label>
            <select id="projectSelectDropdown" class="input" style="font-size: 13px; font-weight: 600; height: 34px; padding: 4px 10px; border-radius: var(--r-sm); min-width: 260px; cursor: pointer;">
              ${allProjects.map(p => `
                <option value="${this._escape(p.id)}" ${this.currentProjectId.toLowerCase() === p.id.toLowerCase() ? 'selected' : ''}>
                  ${this._escape(p.name)}
                </option>
              `).join('')}
            </select>
          </div>
        </div>

        <!-- Honest Coverage Card -->
        <div class="honest-coverage-card">
          <div style="display: flex; justify-content: space-between; align-items: baseline; gap: 8px;">
            <span class="label" style="margin-bottom: 0;">Minutes Coverage</span>
            <span style="font-family: var(--font-mono); font-size: 13px; font-weight: 600;">
              ${this._escape(project.coverageText)} (${project.coveragePercent}%)
            </span>
          </div>
          <div class="coverage-track">
            <div class="coverage-fill ${project.coveragePercent === 100 ? 'complete' : ''}" style="width: ${project.coveragePercent}%;"></div>
          </div>
          <div class="sub" style="font-size: 11.5px;">
            ${project.meetingsWithMinutes < project.totalMeetings ? `
              ${project.totalMeetings - project.meetingsWithMinutes} of ${project.totalMeetings} meetings do not have ingested minutes yet. Action matrix and decision register reflect only meetings with ingested minutes.
            ` : `
              All ${project.totalMeetings} meetings across this initiative have ingested minutes.
            `}
          </div>
        </div>

        <!-- KPI Metric Strip -->
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
          <button data-subtab="settings" class="${this.currentSubTab === 'settings' ? 'on' : ''}">
            Project Settings
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
                
                ${(ws.keyRules && ws.keyRules.length > 0) ? `
                  <div style="margin-top: 4px; padding-top: 6px; border-top: 1px solid var(--border);">
                    <div style="font-size: 11px; font-weight: 600; text-transform: uppercase; color: var(--muted-foreground); margin-bottom: 4px;">
                      Governing Architectural Rules:
                    </div>
                    <ul style="margin: 0; padding-left: 16px; font-size: 11.5px; color: var(--muted-foreground); display: grid; gap: 3px;">
                      ${ws.keyRules.map(r => `<li>${this._escape(r)}</li>`).join('')}
                    </ul>
                  </div>
                ` : ''}

                ${(ws.facilities && ws.facilities.length > 0) ? `
                  <div style="display: flex; gap: 4px; align-items: center; margin-top: auto; padding-top: 8px;">
                    <span class="sub" style="font-size: 11px;">Sites:</span>
                    ${ws.facilities.map(f => `<span class="badge" style="font-size: 10px;">${this._escape(f)}</span>`).join('')}
                  </div>
                ` : ''}
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
                ${project.stakeholders.length > 0 ? project.stakeholders.map(s => `
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
                `).join('') : '<div class="sub" style="font-size: 12px;">No attendees registered yet</div>'}
              </div>
            </div>

            <!-- Platform Architecture & Entities -->
            <div class="card" style="padding: 14px;">
              <div style="font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: var(--muted-foreground); margin-bottom: 10px;">
                Project Vocabulary &amp; Parser Hints
              </div>
              <div style="display: flex; flex-direction: column; gap: 8px;">
                <div>
                  <div style="font-size: 11px; color: var(--muted-foreground); margin-bottom: 4px;">Connected Systems &amp; Tools:</div>
                  <div style="display: flex; gap: 6px; flex-wrap: wrap;">
                    ${project.tools.length > 0 ? project.tools.map(t => `<span class="badge info" style="font-family: var(--font-mono); font-size: 11px;">${this._escape(t)}</span>`).join('') : '<span class="sub" style="font-size: 11px;">None configured</span>'}
                  </div>
                </div>
                <div>
                  <div style="font-size: 11px; color: var(--muted-foreground); margin-bottom: 4px;">Domain Protocols &amp; Concepts:</div>
                  <div style="display: grid; gap: 4px;">
                    ${project.concepts.length > 0 ? project.concepts.map(c => `
                      <div style="font-size: 11.5px; padding: 4px 6px; border-radius: var(--r-sm); background: var(--muted);">
                        <b>${this._escape(c.name)}:</b> <span style="color: var(--muted-foreground);">${this._escape(c.desc)}</span>
                      </div>
                    `).join('') : '<span class="sub" style="font-size: 11px;">None configured</span>'}
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
              Showing ${decisions.length} validated architecture and operational decisions from meeting minutes (deduplicated across meetings)
            </div>
          </div>

          <div style="display: grid; gap: 10px;">
            ${decisions.length > 0 ? decisions.map(d => {
              const firstMeeting = d.firstDecidedOn || {};
              const restatedList = d.restatedOn || [];

              return `
                <div class="card" style="padding: 12px 14px; border-left: 3px solid var(--ok); display: flex; flex-direction: column; gap: 8px;">
                  <div style="display: flex; justify-content: space-between; align-items: center; gap: 8px; flex-wrap: wrap;">
                    <div style="display: flex; align-items: center; gap: 6px;">
                      <span class="badge ok" style="font-weight: 600; font-size: 11px;">${this._escape(d.label || 'Decision')}</span>
                      ${d.facility ? `<span class="badge" style="font-size: 10px;">${this._escape(d.facility)}</span>` : ''}
                      ${d.context ? `<span class="sub" style="font-size: 11px;">${this._escape(d.context)}</span>` : ''}
                    </div>
                    ${firstMeeting.meetingId ? `
                      <div style="display: flex; gap: 6px; align-items: center;">
                        <span style="font-family: var(--font-mono); font-size: 11px; color: var(--muted-foreground);">${firstMeeting.meetingDate || ''}</span>
                        <button class="btn sm" data-open-meeting="${this._escape(firstMeeting.meetingId)}" style="padding: 2px 8px; font-size: 11px;">
                          View Meeting
                        </button>
                      </div>
                    ` : ''}
                  </div>

                  <div style="font-size: 13px; font-weight: 500; color: var(--foreground); line-height: 1.4;">
                    ${this._escape(d.statement)}
                  </div>

                  ${d.quote ? `
                    <div class="quote-box decision">
                      “${this._escape(d.quote)}”
                    </div>
                  ` : ''}

                  <div style="display: flex; flex-direction: column; gap: 4px; font-size: 11px; color: var(--muted-foreground); border-top: 1px solid var(--border); padding-top: 6px; margin-top: 2px;">
                    <div>
                      <b>First decided on:</b> ${this._escape(firstMeeting.meetingDate || 'Unknown')} · <i>${this._escape(firstMeeting.meetingTitle || 'Meeting')}</i>
                    </div>

                    ${restatedList.length > 0 ? `
                      <div style="margin-top: 2px;">
                        <b>Restated on ${restatedList.length} subsequent meeting${restatedList.length > 1 ? 's' : ''}:</b>
                        <ul style="margin: 2px 0 0 16px; padding: 0; display: grid; gap: 2px;">
                          ${restatedList.map(r => `
                            <li>
                              ${this._escape(r.meetingDate)} · <i>${this._escape(r.meetingTitle)}</i>
                              ${r.quote ? `<span style="font-style: italic; color: var(--foreground);"> — “${this._escape(r.quote)}”</span>` : ''}
                              <button class="btn sm" data-open-meeting="${this._escape(r.meetingId)}" style="padding: 1px 6px; font-size: 10px; margin-left: 4px;">
                                View
                              </button>
                            </li>
                          `).join('')}
                        </ul>
                      </div>
                    ` : ''}
                  </div>
                </div>
              `;
            }).join('') : '<div class="empty">No validated decisions extracted for this project yet.</div>'}
          </div>
        </div>
      `;
    }

    if (this.currentSubTab === 'actions') {
      const owners = ['All', 'Artefact', 'Client'];

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
            ${matrixActions.length > 0 ? matrixActions.map(act => `
              <div class="card" style="padding: 10px 12px; display: flex; align-items: flex-start; gap: 10px; transition: border-color 0.15s;">
                <button class="item-check-btn ${act.done ? 'checked' : ''}" data-action-id="${this._escape(act.id)}" data-meeting-id="${this._escape(act.meetingId)}" title="${act.done ? 'Mark open' : 'Mark done'}" style="margin-top: 3px;">
                  ${act.done ? Icons.check : ''}
                </button>

                <div style="flex: 1; min-width: 0;">
                  <div style="display: flex; gap: 6px; align-items: center; flex-wrap: wrap;">
                    <span class="chip-owner" style="font-weight: 600;">${this._escape(act.owner)}</span>
                    <span class="badge" style="font-size: 10px;">${this._escape(act.ownerOrg)}</span>
                    ${act.facility ? `<span class="badge" style="font-size: 10px;">${this._escape(act.facility)}</span>` : ''}
                    ${act.dueDate ? `<span class="chip-due" style="font-size: 10px;">${Icons.clock} ${this._escape(act.dueDate)}</span>` : ''}
                    ${(act.tags || []).map(t => `<span class="badge" style="font-size: 10px;">#${this._escape(t)}</span>`).join('')}
                  </div>
                  <div class="tx ${act.done ? 'done' : ''}" style="margin-top: 4px; font-size: 12.5px; line-height: 1.4;">
                    ${this._escape(act.text)}
                  </div>
                  ${act.quote ? `
                    <div class="quote-box" style="margin-top: 6px;">
                      “${this._escape(act.quote)}”
                    </div>
                  ` : ''}
                  <div class="sub" style="font-size: 11px; margin-top: 4px;">
                    ${act.meetingDate} · <i>${this._escape(act.meetingTitle)}</i>
                  </div>
                </div>

                <button class="btn sm" data-open-meeting="${this._escape(act.meetingId)}" style="flex-shrink: 0; font-size: 11px; margin-top: 2px;">
                  Open Meeting
                </button>
              </div>
            `).join('') : '<div class="empty">No matching actions found.</div>'}
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
            ${project.connectedDocs.length > 0 ? project.connectedDocs.map(doc => `
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
                    Open in Google Docs
                  </a>
                  <button class="btn sm" data-open-meeting="${this._escape(doc.meetingId)}">
                    View Meeting
                  </button>
                </div>
              </div>
            `).join('') : '<div class="empty">No connected Google Docs found for this initiative.</div>'}
          </div>
        </div>
      `;
    }

    if (this.currentSubTab === 'settings') {
      const cfg = project.projectConfig || {};
      const clientMatchesStr = (cfg.clientMatch || []).join(', ');
      const toolsStr = ((cfg.parserHints && cfg.parserHints.tools) || []).join(', ');
      const decisionTriggersStr = ((cfg.parserHints && cfg.parserHints.decisionTriggers) || []).join(', ');

      return `
        <div class="card" style="padding: 16px; display: flex; flex-direction: column; gap: 16px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div>
              <h2 style="font-size: 16px; margin-bottom: 2px;">Project Configuration: ${this._escape(cfg.name || project.projectName)}</h2>
              <div class="sub" style="font-size: 12px;">Stored locally in IndexedDB projects database. Modify vocabulary and workstreams dynamically.</div>
            </div>
            ${this.settingsFeedback ? `
              <span class="badge ok" style="font-size: 11px; font-weight: 600;">${this._escape(this.settingsFeedback)}</span>
            ` : ''}
          </div>

          <form id="projectSettingsForm" style="display: flex; flex-direction: column; gap: 14px;">
            <div style="display: grid; grid-template-columns: 1fr 2fr; gap: 12px;">
              <div>
                <label class="label">Project ID</label>
                <input class="in" id="cfgProjectId" value="${this._escape(cfg.id || '')}" disabled style="font-family: var(--font-mono); opacity: 0.7;" />
              </div>
              <div>
                <label class="label">Project Name</label>
                <input class="in" id="cfgProjectName" value="${this._escape(cfg.name || '')}" required />
              </div>
            </div>

            <div>
              <label class="label">Client Match Tags (Comma-separated)</label>
              <input class="in" id="cfgClientMatch" value="${this._escape(clientMatchesStr)}" placeholder="e.g. Clariane, Les Arbelles, Mariéna" />
              <div class="sub" style="font-size: 11px; margin-top: 3px;">Events whose client or tags match any of these will associate with this project.</div>
            </div>

            <div style="border-top: 1px solid var(--border); padding-top: 12px;">
              <div class="label" style="margin-bottom: 6px;">Strategic Workstreams (${(cfg.workstreams || []).length})</div>
              <div id="workstreamsEditorList" style="display: flex; flex-direction: column; gap: 8px;">
                ${(cfg.workstreams || []).map((ws, idx) => `
                  <div class="card" style="padding: 10px; background: var(--muted); display: flex; flex-direction: column; gap: 6px;" data-ws-index="${idx}">
                    <div style="display: grid; grid-template-columns: 120px 1fr 60px; gap: 8px; align-items: center;">
                      <input class="in sm ws-badge" value="${this._escape(ws.badge)}" placeholder="Badge" />
                      <input class="in sm ws-title" value="${this._escape(ws.title)}" placeholder="Title" />
                      <button type="button" class="btn sm delete-ws-btn" data-del-idx="${idx}" style="justify-content: center; color: var(--destructive);">${Icons.trash || 'Delete'}</button>
                    </div>
                    <input class="in sm ws-summary" value="${this._escape(ws.summary)}" placeholder="Summary statement" />
                    <textarea class="in sm ws-rules" style="min-height: 50px; font-size: 11.5px;" placeholder="Governing rules (one per line)">${(ws.keyRules || []).join('\n')}</textarea>
                  </div>
                `).join('')}
              </div>
              <button type="button" class="btn sm" id="addWorkstreamBtn" style="margin-top: 8px;">
                ${Icons.plus} Add Workstream
              </button>
            </div>

            <div style="border-top: 1px solid var(--border); padding-top: 12px;">
              <div class="label" style="margin-bottom: 6px;">Domain Parser Hints &amp; Vocabulary</div>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                <div>
                  <label class="label" style="font-size: 11px;">Tools &amp; Clinical Systems (Comma-separated)</label>
                  <input class="in" id="cfgParserTools" value="${this._escape(toolsStr)}" placeholder="e.g. Foundry, HM, rTMS, Balnéo, Kiné, Ergo" />
                </div>
                <div>
                  <label class="label" style="font-size: 11px;">Decision Trigger Phrases (Comma-separated)</label>
                  <input class="in" id="cfgDecisionTriggers" value="${this._escape(decisionTriggersStr)}" placeholder="e.g. Arbitrage, Décision, Validé, Zéro Temps Mort" />
                </div>
              </div>
            </div>

            <div style="display: flex; justify-content: flex-end; gap: 8px; margin-top: 10px;">
              <button type="submit" class="btn pink" id="saveProjectSettingsBtn">
                Save Project Configuration
              </button>
            </div>
          </form>
        </div>
      `;
    }

    return '';
  }

  _bindEvents(project) {
    // Project selection dropdown
    const projDropdown = this.container.querySelector('#projectSelectDropdown');
    if (projDropdown) {
      projDropdown.addEventListener('change', (e) => {
        const nextId = e.target.value;
        this.setProject(nextId);
        if (this.store && typeof this.store.setActiveProjectId === 'function') {
          this.store.setActiveProjectId(nextId);
        }
      });
    }

    // Project selection buttons (if any)
    this.container.querySelectorAll('[data-select-project]').forEach(btn => {
      btn.addEventListener('click', () => {
        this.setProject(btn.dataset.selectProject);
      });
    });

    // Sub-tab switching
    this.container.querySelectorAll('.tabs button[data-subtab]').forEach(btn => {
      btn.addEventListener('click', () => {
        this.currentSubTab = btn.dataset.subtab;
        this.settingsFeedback = null;
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

    // Project settings form submission
    const settingsForm = this.container.querySelector('#projectSettingsForm');
    if (settingsForm) {
      // Add workstream
      this.container.querySelector('#addWorkstreamBtn')?.addEventListener('click', () => {
        const list = this.container.querySelector('#workstreamsEditorList');
        if (!list) return;
        const newCard = document.createElement('div');
        newCard.className = 'card';
        newCard.style.cssText = 'padding: 10px; background: var(--muted); display: flex; flex-direction: column; gap: 6px;';
        newCard.innerHTML = `
          <div style="display: grid; grid-template-columns: 120px 1fr 60px; gap: 8px; align-items: center;">
            <input class="in sm ws-badge" value="WS" placeholder="Badge" />
            <input class="in sm ws-title" value="New Workstream" placeholder="Title" />
            <button type="button" class="btn sm delete-ws-btn" style="justify-content: center; color: var(--destructive);">${Icons.trash || 'Delete'}</button>
          </div>
          <input class="in sm ws-summary" value="" placeholder="Summary statement" />
          <textarea class="in sm ws-rules" style="min-height: 50px; font-size: 11.5px;" placeholder="Governing rules (one per line)"></textarea>
        `;
        newCard.querySelector('.delete-ws-btn')?.addEventListener('click', () => newCard.remove());
        list.appendChild(newCard);
      });

      // Delete workstream
      this.container.querySelectorAll('.delete-ws-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          btn.closest('.card')?.remove();
        });
      });

      settingsForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const baseProject = project.projectConfig || ProjectModel.createDefault(this.currentProjectId);
        
        const updatedName = this.container.querySelector('#cfgProjectName')?.value.trim() || baseProject.name;
        const clientMatches = (this.container.querySelector('#cfgClientMatch')?.value || '')
          .split(',')
          .map(s => s.trim())
          .filter(Boolean);

        const tools = (this.container.querySelector('#cfgParserTools')?.value || '')
          .split(',')
          .map(s => s.trim())
          .filter(Boolean);

        const decisionTriggers = (this.container.querySelector('#cfgDecisionTriggers')?.value || '')
          .split(',')
          .map(s => s.trim())
          .filter(Boolean);

        // Collect workstreams from UI
        const wsCards = this.container.querySelectorAll('#workstreamsEditorList .card');
        const updatedWorkstreams = [];
        wsCards.forEach(card => {
          const badge = card.querySelector('.ws-badge')?.value.trim() || 'WS';
          const title = card.querySelector('.ws-title')?.value.trim() || 'Workstream';
          const summary = card.querySelector('.ws-summary')?.value.trim() || '';
          const rules = (card.querySelector('.ws-rules')?.value || '')
            .split('\n')
            .map(r => r.trim())
            .filter(Boolean);

          updatedWorkstreams.push({
            id: badge.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
            badge,
            title,
            summary,
            keyRules: rules,
            facilities: []
          });
        });

        const updated = {
          ...baseProject,
          name: updatedName,
          clientMatch: clientMatches.length > 0 ? clientMatches : [updatedName],
          workstreams: updatedWorkstreams,
          parserHints: {
            ...(baseProject.parserHints || {}),
            tools: tools.length > 0 ? tools : (baseProject.parserHints?.tools || []),
            decisionTriggers: decisionTriggers.length > 0 ? decisionTriggers : (baseProject.parserHints?.decisionTriggers || [])
          }
        };

        try {
          await this.store.saveProject(updated);
          this.settingsFeedback = 'Project configuration saved successfully.';
          this.render();
        } catch (err) {
          console.error('[ProjectsView] Failed to save project:', err);
          alert('Failed to save project: ' + err.message);
        }
      });
    }
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
