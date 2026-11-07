/**
 * Meeting Drawer Component (Phase 4 Meeting Drawer)
 * 
 * Replaces the legacy 5-tab drawer with a unified, lane-driven Cockpit Drawer:
 * 1. Header: Breadcrumb (Mission › Workstream › Meeting, clickable), date/time, attendees, Google Doc link.
 * 2. Automatic Mode Selection (based on meeting state, not user tabs):
 *    - Prep Mode (upcoming): Workstream open points & actions, last 3 decisions, previous series meeting,
 *      prep checklist (3-4 dots, NO percentage), and "My agenda notes" scratchpad.
 *    - Capture Mode (past, no minutes): Drop/paste zone, Fetch Google Doc, Upload file, instant confirmation banner.
 *    - In Inbox Mode (past, waiting to fold): File name/size/timestamp, 6-line preview, "Fold now" (copies Antigravity prompt), "Replace minutes".
 *    - Folded Mode (past, in notes): Decisions, actions, open points citing this meeting from notes system of record.
 * 3. Related Section: Collapsible section at the bottom of EVERY mode (series lineage + connected meetings).
 * 
 * Design Rules:
 * - Strictly Lucide SVG stroke icons from ui/icons.js (Zero emojis).
 * - System of record is Markdown notes in Missions/ directory.
 * - Prep checklist is dots-only, strictly NO percentages.
 */
import { Icons } from './icons.js';
import { PrepScoreCalculator } from '../model/prep_score.js';
import { openActionEditModal } from './action_modal.js';

export class MeetingPanelUI {
  constructor({ container, store, onOpenMeeting, onClose, onCollapse } = {}) {
    this.container = container;
    this.store = store;
    this.onOpenMeeting = onOpenMeeting;
    this.onClose = onClose;
    this.onCollapse = onCollapse;

    this.currentMeetingId = null;
    this.currentTab = 'prep'; // Kept for compatibility, modes are auto-selected
    this.isRelatedExpanded = false;
    this.isFetchingDoc = false;
    this.docFetchError = null;
    this.captureConfirmation = null; // Banner state after capture
    this.isReplaceMode = false;
    this.manualLinkSearchOpen = false;
  }

  setMeeting(meetingId, tab = null) {
    this.currentMeetingId = meetingId;
    this.captureConfirmation = null;
    this.isReplaceMode = false;
    this.docFetchError = null;
    if (tab) this.currentTab = tab;
    return this.render();
  }

  focusActionInput() {
    const input = this.container?.querySelector('#myAgendaNotes') || this.container?.querySelector('#captureNotesText');
    if (input) input.focus();
  }

  _escape(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  _formatDate(dateStr) {
    if (!dateStr) return '';
    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
        return d.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
      }
    } catch (e) {}
    return dateStr;
  }

  _formatFileSize(bytes) {
    if (!bytes || isNaN(bytes)) return '0 B';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }

  _formatTimeAgo(isoStr) {
    if (!isoStr) return 'recently';
    try {
      const dt = new Date(isoStr);
      const now = new Date();
      const diffSec = Math.floor((now - dt) / 1000);
      if (diffSec < 60) return 'just now';
      if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
      if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
      return dt.toLocaleDateString();
    } catch (e) {
      return 'recently';
    }
  }

  /**
   * Matches meeting to a specific workstream within the mission.
   */
  _resolveWorkstream(meeting, summary) {
    const workstreams = summary?.workstreams || summary?.facilities || [];
    if (!workstreams || workstreams.length === 0) {
      return { id: 'general', name: 'General' };
    }

    const title = (meeting.title || '').toLowerCase();
    const tags = (meeting.tags || []).map(t => t.toLowerCase());

    for (const ws of workstreams) {
      const name = (ws.name || ws.id || '').toLowerCase();
      // Match keywords e.g. "Mariena", "Les Arbelles", "Glanum", "UC Wizard", "Datastore"
      const tokens = name.split(/[\s\-_(),]+/).filter(t => t.length > 2);
      for (const token of tokens) {
        if (title.includes(token) || tags.some(t => t.includes(token))) {
          return ws;
        }
      }
    }

    return workstreams[0] || { id: 'general', name: 'General' };
  }

  /**
   * Evaluates the automatic mode for the given meeting.
   * Returns: 'prep' | 'capture' | 'inbox' | 'folded'
   */
  _computeMeetingMode(meeting, inboxState, now = new Date()) {
    if (inboxState === 'folded') return 'folded';
    if (inboxState === 'pending') return 'inbox';

    // Neither folded nor in inbox: Check if upcoming (<= 48h or in future) vs past
    const todayStr = (typeof getTodayDateStr === 'function') ? getTodayDateStr(now) : now.toISOString().slice(0, 10);
    const nowTimeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const isUpcoming = (meeting.date > todayStr) || (meeting.date === todayStr && (meeting.start || '') >= nowTimeStr);
    return isUpcoming ? 'prep' : 'capture';
  }

  async render() {
    if (!this.container) return;

    if (!this.currentMeetingId) {
      this.container.innerHTML = `
        <div style="padding: 40px 24px; text-align: center; color: var(--muted-foreground);">
          <div style="margin-bottom: 12px; display: flex; justify-content: center; opacity: 0.5;">
            ${Icons.calendar}
          </div>
          <div style="font-weight: 500; font-size: 14px;">No meeting selected</div>
          <div style="font-size: 12px; margin-top: 4px;">Click any meeting card in the cockpit to inspect or capture</div>
        </div>
      `;
      return;
    }

    const meeting = this.store.getEvent(this.currentMeetingId);
    if (!meeting) {
      this.container.innerHTML = `
        <div style="padding: 24px; text-align: center;">
          <p class="sub">Meeting not found (ID: ${this._escape(this.currentMeetingId)})</p>
          <button class="btn sm" id="mhubDrawerCloseNotFound">Close</button>
        </div>
      `;
      this.container.querySelector('#mhubDrawerCloseNotFound')?.addEventListener('click', () => this.onClose && this.onClose());
      return;
    }

    const now = new Date();
    const meetingData = (await this.store.getMeetingData(meeting.id)) || {};
    const project = this.store.getProjectForMeeting(meeting);
    const missionId = project ? project.id : (typeof AppState !== 'undefined' && AppState.missionId ? AppState.missionId : 'ge-enterprise');
    const missionName = (typeof this.store.getProjectName === 'function' ? this.store.getProjectName(missionId) : missionId) || missionId;

    // Load mission summary & inbox status from system of record
    const summary = (await this.store.getMissionSummary(missionId)) || {};
    let inboxStatus = this.store.inboxStatusCache?.get(missionId);
    if (!inboxStatus) {
      try {
        inboxStatus = await this.store.getInboxStatus(missionId);
      } catch (e) {
        inboxStatus = { pendingCount: 0, files: [], foldedCount: 0, foldedFiles: [] };
      }
    }

    // Determine current inbox state
    const inboxState = this.store.meetingInboxState(meeting.id, inboxStatus, summary);
    let mode = this._computeMeetingMode(meeting, inboxState, now);
    if (this.isReplaceMode) {
      mode = 'capture';
    }

    // Find workstream context
    const workstream = this._resolveWorkstream(meeting, summary);
    const workstreamName = workstream?.name || 'General';

    // Find inbox file matching this meeting if in inbox
    const allInboxFiles = [...(inboxStatus.files || []), ...(inboxStatus.pending || [])];
    const meetingInboxFile = allInboxFiles.find(f => {
      if (typeof f === 'string') return f.includes(meeting.id);
      return f && ((f.eventId && f.eventId === meeting.id) || (f.filename && f.filename.includes(meeting.id)));
    }) || null;

    // Compute Cockpit Checklist for Prep mode (Dots only, strictly NO percentage)
    const checklistOptions = {
      seriesMeetings: this.store.getEventsForSeries ? this.store.getEventsForSeries(meeting.seriesId) : [],
      inboxStatus
    };
    const checklist = PrepScoreCalculator.computeCockpitChecklist(meeting, meetingData, checklistOptions);

    // Find previous meeting of same series
    let prevSeriesMeeting = null;
    let prevSeriesFolded = false;
    if (meeting.seriesId) {
      const seriesEvents = typeof this.store.getEventsForSeries === 'function' ? this.store.getEventsForSeries(meeting.seriesId) : [];
      const priorEvents = seriesEvents.filter(e => e.id !== meeting.id && (e.date < meeting.date || (e.date === meeting.date && e.start < meeting.start)));
      if (priorEvents.length > 0) {
        priorEvents.sort((a, b) => b.date.localeCompare(a.date) || b.start.localeCompare(a.start));
        prevSeriesMeeting = priorEvents[0];
        const prevInboxState = this.store.meetingInboxState(prevSeriesMeeting.id, inboxStatus, summary);
        prevSeriesFolded = (prevInboxState === 'folded');
      }
    }

    // Gather last 3 decisions for this mission / workstream
    const allDecisions = summary.decisions || summary.decisionRegister || [];
    const relevantDecisions = allDecisions
      .filter(d => !workstream.name || !d.workstream || d.workstream.toLowerCase() === workstreamName.toLowerCase() || d.workstream === 'General')
      .slice(0, 3);

    // Open points and actions for this workstream
    const wsOpenPoints = (summary.openPoints || []).filter(p => !p.workstream || p.workstream.toLowerCase() === workstreamName.toLowerCase() || p.workstream === 'General');
    const wsOpenActions = (summary.actions || summary.actionMatrix || []).filter(a => !a.done && (!a.workstream || a.workstream.toLowerCase() === workstreamName.toLowerCase() || a.workstream === 'General'));

    // Cited decisions and actions in system of record (for Folded mode)
    const citedDecisions = allDecisions.filter(d => d.meetingId === meeting.id || (d.source && String(d.source).includes(meeting.id)));
    const citedActions = (summary.actions || summary.actionMatrix || []).filter(a => a.source && String(a.source).includes(meeting.id));

    // Attendees list
    const attendeesList = meeting.attendees || [];
    const googleDocUrl = meeting.googleDocUrl || meetingData.googleDocUrl || this._extractGoogleDocUrl(meeting.description);

    this.container.innerHTML = `
      <div class="drawer-layout" style="display: flex; flex-direction: column; height: 100%; overflow: hidden; background: var(--card);">
        
        <!-- 1. Header: Breadcrumb (Mission > Workstream > Meeting) & Close -->
        <div class="drawer-header" style="padding: 14px 18px; border-bottom: 1px solid var(--border); display: flex; flex-direction: column; gap: 8px; background: var(--navy-2);">
          
          <div style="display: flex; justify-content: space-between; align-items: center; gap: 12px;">
            <!-- Clickable Breadcrumb -->
            <nav class="drawer-breadcrumb" style="display: flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 500; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
              <a href="#/p/${encodeURIComponent(missionId)}" class="breadcrumb-link" style="color: var(--pink-600); text-decoration: none; display: inline-flex; align-items: center; gap: 4px;">
                ${Icons.folder} ${this._escape(missionName)}
              </a>
              <span class="sub" style="opacity: 0.5;">${Icons.chevronRight}</span>
              <a href="#/p/${encodeURIComponent(missionId)}/workstreams" class="breadcrumb-link" style="color: var(--muted-foreground); text-decoration: none;">
                ${this._escape(workstreamName)}
              </a>
              <span class="sub" style="opacity: 0.5;">${Icons.chevronRight}</span>
              <span style="color: var(--foreground); font-weight: 600; overflow: hidden; text-overflow: ellipsis;">
                ${this._escape(meeting.title)}
              </span>
            </nav>

            <!-- Close Drawer Button -->
            <button id="drawerCloseBtn" class="btn sm" style="padding: 4px 8px; line-height: 1; border-radius: var(--r-sm);" title="Close drawer (returns to mission cockpit)" aria-label="Close drawer">
              ${Icons.x}
            </button>
          </div>

          <!-- Meeting Title & Mode Badge -->
          <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 12px;">
            <h2 style="font: 600 17px/1.3 var(--font-sans); margin: 0; color: var(--foreground);">
              ${this._escape(meeting.title)}
            </h2>
            
            <div style="flex-shrink: 0;">
              ${mode === 'prep' ? `
                <span class="badge ok" style="display: inline-flex; align-items: center; gap: 4px; font-weight: 600;">
                  ${Icons.sparkles} Prep Mode
                </span>
              ` : mode === 'inbox' ? `
                <span class="badge amber" style="display: inline-flex; align-items: center; gap: 4px; font-weight: 600;">
                  ${Icons.clock} In Inbox
                </span>
              ` : mode === 'folded' ? `
                <span class="badge ok" style="display: inline-flex; align-items: center; gap: 4px; font-weight: 600;">
                  ${Icons.check} Folded
                </span>
              ` : `
                <span class="badge sub" style="display: inline-flex; align-items: center; gap: 4px; font-weight: 600;">
                  ${Icons.upload} Capture Mode
                </span>
              `}
            </div>
          </div>

          <!-- Meta Row: Date, Time, Meet Link, Google Doc -->
          <div style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap; font-size: 12px; color: var(--muted-foreground);">
            <span style="display: inline-flex; align-items: center; gap: 4px;">
              ${Icons.calendar} ${this._formatDate(meeting.date)}
            </span>
            <span style="display: inline-flex; align-items: center; gap: 4px; font-family: var(--font-mono);">
              ${Icons.clock} ${this._escape(meeting.start)} - ${this._escape(meeting.end)}
            </span>
            ${meeting.videoUrl ? `
              <a href="${this._escape(meeting.videoUrl)}" target="_blank" rel="noopener" class="badge" style="display: inline-flex; align-items: center; gap: 4px; color: var(--pink-600); text-decoration: none;">
                ${Icons.video} Join Meet
              </a>
            ` : ''}
            ${googleDocUrl ? `
              <a href="${this._escape(googleDocUrl)}" target="_blank" rel="noopener" class="badge" style="display: inline-flex; align-items: center; gap: 4px; text-decoration: none;" title="Google Doc for this meeting">
                ${Icons.externalLink} Google Doc
              </a>
            ` : ''}
          </div>

          <!-- Attendees Bar -->
          ${attendeesList.length > 0 ? `
            <div style="display: flex; align-items: center; gap: 6px; flex-wrap: wrap; margin-top: 2px;">
              <span class="sub" style="font-size: 11px; display: inline-flex; align-items: center; gap: 3px;">
                ${Icons.users} Attendees:
              </span>
              ${attendeesList.slice(0, 6).map(a => `
                <span class="badge ${a.toLowerCase().includes('ayrton') ? 'ok' : 'sub'}" style="font-size: 11px; padding: 1px 6px;">
                  ${this._escape(a.split('@')[0])}
                </span>
              `).join('')}
              ${attendeesList.length > 6 ? `
                <span class="sub" style="font-size: 11px;">+${attendeesList.length - 6} more</span>
              ` : ''}
            </div>
          ` : ''}
        </div>

        <!-- Scrollable Body with Mode View -->
        <div class="drawer-body" style="flex: 1; overflow-y: auto; padding: 18px; display: flex; flex-direction: column; gap: 18px;">
          
          <!-- Confirmation Banner (if just saved) -->
          ${this.captureConfirmation ? `
            <div class="card" style="border-color: var(--ok); background: color-mix(in oklab, var(--ok) 10%, var(--card)); padding: 12px 14px;">
              <div style="display: flex; align-items: center; gap: 8px; font-weight: 600; color: var(--ok); font-size: 13px;">
                ${Icons.check} Minutes captured successfully
              </div>
              <div class="sub" style="font-size: 12px; margin-top: 4px;">
                ${this._escape(this.captureConfirmation)}
              </div>
            </div>
          ` : ''}

          <!-- MODE 1: PREP (Upcoming) -->
          ${mode === 'prep' ? this._renderPrepMode({ meeting, meetingData, checklist, prevSeriesMeeting, prevSeriesFolded, relevantDecisions, wsOpenPoints, wsOpenActions, workstreamName, missionName, missionId }) : ''}

          <!-- MODE 2: CAPTURE (Past, no minutes) -->
          ${mode === 'capture' ? this._renderCaptureMode({ meeting, meetingData, googleDocUrl, missionName, isReplace: this.isReplaceMode }) : ''}

          <!-- MODE 3: IN INBOX (Minutes waiting to fold) -->
          ${mode === 'inbox' ? this._renderInboxMode({ meeting, meetingInboxFile, missionName }) : ''}

          <!-- MODE 4: FOLDED (Past, in notes) -->
          ${mode === 'folded' ? this._renderFoldedMode({ meeting, citedDecisions, citedActions, workstreamName, missionName, summary, missionId }) : ''}

          <!-- 3. Related Meetings & Lineage Section (Collapsible in EVERY mode) -->
          ${this._renderRelatedSection(meeting)}
        </div>

      </div>
    `;

    this._bindEvents(meeting, mode, missionId, missionName, googleDocUrl);
  }

  /* -------------------------------------------------------------------------- */
  /*  MODE 1: PREP RENDERER                                                     */
  /* -------------------------------------------------------------------------- */
  _renderPrepMode({ meeting, meetingData, checklist, prevSeriesMeeting, prevSeriesFolded, relevantDecisions, wsOpenPoints, wsOpenActions, workstreamName, missionName, missionId }) {
    const agendaText = meetingData.agenda || '';
    const dots = checklist.dots || [];

    return `
      <!-- Prep Checklist (DOTS ONLY, STRICTLY NO PERCENTAGE) -->
      <div class="card" style="padding: 14px; background: var(--navy-2); border: 1px solid var(--border);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
          <div style="font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: var(--muted-foreground);">
            Prep Checklist
          </div>
          <div style="display: flex; align-items: center; gap: 6px;">
            ${dots.map(d => `
              <span class="prep-dot ${d.ok ? 'done' : ''}" style="width: 8px; height: 8px; border-radius: 50%; background: ${d.ok ? 'var(--ok)' : 'var(--border)'}; display: inline-block;" title="${this._escape(d.label)}: ${this._escape(d.detail)}"></span>
            `).join('')}
          </div>
        </div>

        <div style="display: flex; flex-direction: column; gap: 8px; font-size: 12.5px;">
          ${dots.map((d, idx) => `
            <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px;">
              <span style="display: inline-flex; align-items: center; gap: 6px; color: ${d.ok ? 'var(--foreground)' : 'var(--muted-foreground)'};">
                <span style="color: ${d.ok ? 'var(--ok)' : 'var(--border)'};">${d.ok ? Icons.check : Icons.alertCircle}</span>
                ${this._escape(d.label)} ${d.optional ? '<span class="sub" style="font-size: 11px;">(optional)</span>' : ''}
              </span>
              ${d.key === 'actionsReviewed' ? `
                <label style="display: inline-flex; align-items: center; gap: 4px; font-size: 11.5px; cursor: pointer;">
                  <input type="checkbox" id="chkActionsReviewed" ${meetingData.actionsReviewed ? 'checked' : ''} style="cursor: pointer;">
                  <span class="sub">${meetingData.actionsReviewed ? 'Reviewed' : 'Mark reviewed'}</span>
                </label>
              ` : `
                <span class="sub" style="font-family: var(--font-mono); font-size: 11px;">${this._escape(d.detail)}</span>
              `}
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Previous Meeting in Series (with Folded Badge) -->
      ${prevSeriesMeeting ? `
        <div class="card" style="padding: 12px 14px; border: 1px solid var(--border);">
          <div style="font-size: 11.5px; font-weight: 600; text-transform: uppercase; color: var(--muted-foreground); margin-bottom: 6px;">
            Previous in Series
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center; gap: 8px;">
            <div>
              <div style="font-weight: 600; font-size: 13px;">${this._escape(prevSeriesMeeting.title)}</div>
              <div class="sub" style="font-size: 11.5px;">${this._formatDate(prevSeriesMeeting.date)} · ${this._escape(prevSeriesMeeting.start)}</div>
            </div>
            <div>
              ${prevSeriesFolded ? `
                <span class="badge ok" style="font-size: 11px; display: inline-flex; align-items: center; gap: 3px;">
                  ${Icons.check} Folded
                </span>
              ` : `
                <span class="badge amber" style="font-size: 11px; display: inline-flex; align-items: center; gap: 3px;">
                  ${Icons.clock} To fold
                </span>
              `}
            </div>
          </div>
        </div>
      ` : ''}

      <!-- Workstream Open Points & Actions from Notes -->
      <div class="card" style="padding: 14px; border: 1px solid var(--border);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
          <div style="font-size: 12px; font-weight: 600; text-transform: uppercase; color: var(--muted-foreground);">
            ${this._escape(workstreamName)} · Open Context
          </div>
          <span class="sub" style="font-size: 11.5px;">from note system of record</span>
        </div>

        <div style="display: flex; flex-direction: column; gap: 10px;">
          <!-- Open points -->
          <div>
            <div style="font-size: 12px; font-weight: 600; margin-bottom: 4px; color: var(--foreground);">
              Open Points (${wsOpenPoints.length})
            </div>
            ${wsOpenPoints.length === 0 ? `
              <div class="sub" style="font-size: 12px;">No open points currently recorded.</div>
            ` : `
              <ul style="margin: 0; padding-left: 18px; font-size: 12.5px; color: var(--foreground); display: flex; flex-direction: column; gap: 4px;">
                ${wsOpenPoints.slice(0, 4).map(p => `
                  <li>${this._escape(p.text || p.title || p.statement)}</li>
                `).join('')}
              </ul>
            `}
          </div>

          <!-- Open actions -->
          <div style="border-top: 1px solid var(--border); padding-top: 8px;">
            <div style="font-size: 12px; font-weight: 600; margin-bottom: 4px; color: var(--foreground);">
              Open Actions (${wsOpenActions.length})
            </div>
            ${wsOpenActions.length === 0 ? `
              <div class="sub" style="font-size: 12px;">No pending actions for this workstream.</div>
            ` : `
              <div style="display: flex; flex-direction: column; gap: 6px;">
                ${wsOpenActions.slice(0, 5).map(a => `
                  <div style="display: flex; justify-content: space-between; align-items: center; gap: 8px; font-size: 12px; background: var(--navy-1); padding: 5px 8px; border-radius: var(--r-sm);">
                    <div style="display: flex; align-items: center; gap: 8px; overflow: hidden; flex: 1;">
                      <button class="item-check-btn action-toggle-btn ${a.done ? 'checked' : ''}" data-action-id="${this._escape(a.id)}" data-mission-id="${this._escape(missionId)}" title="${a.done ? 'Mark open' : 'Mark done'}" style="flex-shrink: 0; width: 18px; height: 18px; border-radius: 4px; border: 1px solid var(--border); background: var(--card); display: inline-flex; align-items: center; justify-content: center; cursor: pointer; padding: 0;">
                        ${a.done ? Icons.check : ''}
                      </button>
                      <div style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                        <span class="badge" style="font-size: 10px; font-family: var(--font-mono); margin-right: 4px;">${this._escape(a.id)}</span>
                        <span style="font-weight: 500;">${this._escape(a.text || a.description || a.title || a.id)}</span>
                      </div>
                    </div>
                    <div style="display: flex; align-items: center; gap: 6px; flex-shrink: 0;">
                      <span class="badge sub" style="font-size: 10.5px;">${this._escape(a.owner || 'Ayrton')}</span>
                      <button class="btn sm action-edit-btn" data-action-id="${this._escape(a.id)}" data-mission-id="${this._escape(missionId)}" title="Edit action: name, sub-stream, owner, due date" style="font-size: 10px; padding: 2px 5px; display: inline-flex; align-items: center; gap: 3px;">
                        ${Icons.edit}
                      </button>
                    </div>
                  </div>
                `).join('')}
              </div>
            `}
          </div>
        </div>
      </div>

      <!-- Last 3 Decisions from Notes -->
      <div class="card" style="padding: 14px; border: 1px solid var(--border);">
        <div style="font-size: 12px; font-weight: 600; text-transform: uppercase; color: var(--muted-foreground); margin-bottom: 8px;">
          Last 3 Decisions
        </div>
        ${relevantDecisions.length === 0 ? `
          <div class="sub" style="font-size: 12px;">No logged decisions found for this stream yet.</div>
        ` : `
          <div style="display: flex; flex-direction: column; gap: 8px;">
            ${relevantDecisions.map(d => `
              <div style="font-size: 12.5px; background: var(--navy-1); padding: 8px 10px; border-radius: var(--r-sm); border-left: 3px solid var(--ok);">
                <div style="font-weight: 500;">${this._escape(d.statement || d.title)}</div>
                <div class="sub" style="font-size: 11px; margin-top: 3px; display: flex; justify-content: space-between;">
                  <span>${this._escape(d.date || '')} · ${this._escape(d.workstream || workstreamName)}</span>
                  ${d.note ? `<span style="font-family: var(--font-mono);">${this._escape(d.note.split('/').pop())}</span>` : ''}
                </div>
              </div>
            `).join('')}
          </div>
        `}
      </div>

      <!-- "My Agenda Notes" Scratchpad (UI state only, prepended on capture) -->
      <div class="card" style="padding: 14px; border: 1px solid var(--border); display: flex; flex-direction: column; gap: 8px;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <label for="myAgendaNotes" style="font-size: 12px; font-weight: 600; text-transform: uppercase; color: var(--muted-foreground);">
            My Agenda Notes
          </label>
          <span class="sub" style="font-size: 11px;" id="agendaAutoSaveStatus">Auto-saved</span>
        </div>
        <p class="sub" style="font-size: 11.5px; margin: 0;">
          UI state only. Pre-meeting notes will automatically be prepended to minutes when capturing.
        </p>
        <textarea id="myAgendaNotes" class="input" style="min-height: 90px; width: 100%; font-family: var(--font-sans); font-size: 13px; line-height: 1.4; resize: vertical; padding: 8px;" placeholder="Points to raise, questions, quick reminders...">${this._escape(agendaText)}</textarea>
      </div>
    `;
  }

  /* -------------------------------------------------------------------------- */
  /*  MODE 2: CAPTURE RENDERER                                                  */
  /* -------------------------------------------------------------------------- */
  _renderCaptureMode({ meeting, meetingData, googleDocUrl, missionName, isReplace }) {
    const prefillAgenda = meetingData.agenda ? `## Agenda Notes\n${meetingData.agenda}\n\n## Minutes\n` : '';

    return `
      <div class="card" style="padding: 16px; border: 1px solid var(--border); display: flex; flex-direction: column; gap: 14px;">
        <div>
          <h3 style="font: 600 15px/1.3 var(--font-sans); margin: 0 0 4px 0;">
            ${isReplace ? 'Replace Meeting Minutes' : 'Capture Meeting Minutes'}
          </h3>
          <p class="sub" style="font-size: 12px; margin: 0;">
            Drop a markdown/text file, paste notes, or fetch directly from Google Docs to write into <code style="font-family: var(--font-mono);">${this._escape(missionName)}/_inbox/</code>.
          </p>
        </div>

        <!-- Large Drop / Paste Zone -->
        <div id="captureDropZone" style="border: 2px dashed var(--border); border-radius: var(--r-md); padding: 24px; text-align: center; background: var(--navy-1); transition: all 0.15s ease; cursor: pointer;">
          <div style="color: var(--muted-foreground); margin-bottom: 8px;">
            ${Icons.upload}
          </div>
          <div style="font-weight: 600; font-size: 13px; margin-bottom: 4px;">
            Drag & drop raw minutes file here, or click to upload
          </div>
          <div class="sub" style="font-size: 11.5px;">
            Supports .md, .txt, .doc, or paste plain text into the box below
          </div>
          <input type="file" id="captureFileInput" style="display: none;" accept=".md,.txt,.doc,.docx">
        </div>

        <!-- Google Doc Fetch Action if URL is present -->
        ${googleDocUrl ? `
          <div style="display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 10px 12px; background: var(--navy-2); border-radius: var(--r-sm); border: 1px solid var(--border);">
            <div style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 12.5px;">
              <span class="sub" style="margin-right: 6px;">${Icons.fileText}</span>
              <b>Google Doc detected</b>
            </div>
            <button id="btnFetchGoogleDoc" class="btn sm primary" style="flex-shrink: 0;" ${this.isFetchingDoc ? 'disabled' : ''}>
              ${this.isFetchingDoc ? 'Fetching...' : `${Icons.download} Fetch Doc Content`}
            </button>
          </div>
          ${this.docFetchError ? `
            <div class="sub" style="color: var(--destructive); font-size: 12px;">${this._escape(this.docFetchError)}</div>
          ` : ''}
        ` : ''}

        <!-- Paste / Direct Edit Zone -->
        <div style="display: flex; flex-direction: column; gap: 6px;">
          <label for="captureNotesText" class="sub" style="font-size: 12px; font-weight: 600;">
            Minutes Content (Markdown)
          </label>
          <textarea id="captureNotesText" class="input" style="min-height: 180px; width: 100%; font-family: var(--font-mono); font-size: 12.5px; line-height: 1.45; resize: vertical; padding: 10px;" placeholder="Paste meeting notes, takeaways, actions, decisions...">${this._escape(prefillAgenda)}</textarea>
        </div>

        <!-- Actions -->
        <div style="display: flex; justify-content: space-between; align-items: center; gap: 12px;">
          ${isReplace ? `
            <button id="btnCancelReplace" class="btn sm">Cancel</button>
          ` : `<span></span>`}
          <button id="btnSaveToInbox" class="btn primary" style="display: inline-flex; align-items: center; gap: 6px; font-weight: 600;">
            ${Icons.upload} Save to Mission Inbox
          </button>
        </div>
      </div>
    `;
  }

  /* -------------------------------------------------------------------------- */
  /*  MODE 3: IN INBOX RENDERER                                                 */
  /* -------------------------------------------------------------------------- */
  _renderInboxMode({ meeting, meetingInboxFile, missionName }) {
    const filename = meetingInboxFile?.filename || `${meeting.date}_${meeting.id}.md`;
    const size = meetingInboxFile?.size ? this._formatFileSize(meetingInboxFile.size) : 'Cached in _inbox';
    const capturedAt = meetingInboxFile?.captured_at ? this._formatTimeAgo(meetingInboxFile.captured_at) : 'recently';
    
    // Preview lines: take first 6 non-empty lines from server preview (string or array) or fallback
    let previewLines = [];
    if (meetingInboxFile && meetingInboxFile.preview) {
      if (Array.isArray(meetingInboxFile.preview)) {
        previewLines = meetingInboxFile.preview.slice(0, 6);
      } else if (typeof meetingInboxFile.preview === 'string') {
        previewLines = meetingInboxFile.preview.split(/\r?\n/).slice(0, 6);
      }
    }
    if (previewLines.length === 0) {
      previewLines = [
        `# ${meeting.title}`,
        `Date: ${meeting.date} · Attendees: ${(meeting.attendees || []).join(', ')}`,
        '',
        'Raw minutes waiting in inbox to be folded into authoritative notes.',
        'Click "Fold now" below to copy the folding prompt to your clipboard.'
      ];
    }

    const foldPrompt = `Fold the inbox for ${missionName} following Missions/_fold.md, then show me the change summary.`;

    return `
      <div class="card" style="padding: 16px; border: 1px solid var(--border); display: flex; flex-direction: column; gap: 14px;">
        
        <!-- Header Info -->
        <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 10px;">
          <div>
            <div style="font-size: 11.5px; font-weight: 600; text-transform: uppercase; color: var(--amber); letter-spacing: 0.05em; display: inline-flex; align-items: center; gap: 4px;">
              ${Icons.clock} In Inbox · Waiting to fold
            </div>
            <div style="font-family: var(--font-mono); font-size: 13px; font-weight: 600; color: var(--foreground); margin-top: 4px; word-break: break-all;">
              ${this._escape(filename)}
            </div>
            <div class="sub" style="font-size: 11.5px; margin-top: 2px;">
              Size: ${this._escape(size)} · Captured: ${this._escape(capturedAt)}
            </div>
          </div>
        </div>

        <!-- Preview Box (First 6 lines) -->
        <div style="background: var(--navy-1); border: 1px solid var(--border); border-radius: var(--r-sm); padding: 10px 12px; font-family: var(--font-mono); font-size: 11.5px; line-height: 1.45; color: var(--foreground); overflow-x: auto; max-height: 140px;">
          ${previewLines.map(line => `<div>${this._escape(line) || '&nbsp;'}</div>`).join('')}
        </div>

        <!-- Fold Now Antigravity Prompt Button -->
        <div style="display: flex; flex-direction: column; gap: 8px; background: color-mix(in oklab, var(--amber) 10%, var(--navy-2)); border: 1px solid color-mix(in oklab, var(--amber) 30%, transparent); border-radius: var(--r-md); padding: 12px 14px;">
          <div style="display: flex; justify-content: space-between; align-items: center; gap: 8px;">
            <div style="font-weight: 600; font-size: 13px; color: var(--foreground);">
              Ready to reconcile into notes?
            </div>
            <div style="display: inline-flex; gap: 8px;">
              <button id="btnFoldNow" class="btn primary" style="background: var(--amber); color: #000; font-weight: 600; border: none; display: inline-flex; align-items: center; gap: 6px;">
                ${Icons.sparkles} Fold now
              </button>
              <button id="btnCopyFoldPrompt" class="btn sm" style="display: inline-flex; align-items: center; gap: 4px;" title="Copy Antigravity fold prompt to clipboard">
                ${Icons.copy} Copy prompt
              </button>
            </div>
          </div>
          <p class="sub" style="font-size: 11.5px; margin: 0;">
            Reconciles raw minutes directly into notes, or copies agent prompt: <code style="font-family: var(--font-mono); font-size: 10.5px;">${this._escape(foldPrompt)}</code>
          </p>
          <div id="foldNowToast" style="display: none; font-size: 11.5px; color: var(--ok); font-weight: 600;">
            ${Icons.check} Copied Antigravity fold prompt to clipboard! Paste into your agent.
          </div>
        </div>

        <!-- Replace Minutes Button -->
        <div style="display: flex; justify-content: flex-end; pt: 4px;">
          <button id="btnTriggerReplaceMinutes" class="btn sm" style="display: inline-flex; align-items: center; gap: 4px;">
            ${Icons.edit} Replace minutes
          </button>
        </div>

      </div>
    `;
  }

  /* -------------------------------------------------------------------------- */
  /*  MODE 4: FOLDED RENDERER                                                   */
  /* -------------------------------------------------------------------------- */
  _renderFoldedMode({ meeting, citedDecisions, citedActions, workstreamName, missionName, summary, missionId }) {
    const overviewFile = summary?.overview || `${missionName}/Mission Overview.md`;

    return `
      <div class="card" style="padding: 16px; border: 1px solid var(--border); display: flex; flex-direction: column; gap: 14px;">
        
        <div>
          <div style="font-size: 11.5px; font-weight: 600; text-transform: uppercase; color: var(--ok); letter-spacing: 0.05em; display: inline-flex; align-items: center; gap: 4px;">
            ${Icons.check} Folded into System of Record
          </div>
          <h3 style="font: 600 15px/1.3 var(--font-sans); margin: 4px 0 2px 0;">
            Authoritative Notes Cite This Meeting
          </h3>
          <p class="sub" style="font-size: 12px; margin: 0;">
            Meeting notes have been reconciled into authoritative Markdown files in <code style="font-family: var(--font-mono);">${this._escape(missionName)}/</code>.
          </p>
        </div>

        <!-- Cited Decisions -->
        <div>
          <div style="font-size: 12px; font-weight: 600; margin-bottom: 6px; display: flex; justify-content: space-between; align-items: center;">
            <span>Cited Decisions (${citedDecisions.length})</span>
            <span class="sub" style="font-size: 11px;">System of Record</span>
          </div>
          ${citedDecisions.length === 0 ? `
            <div class="sub" style="font-size: 12px; background: var(--navy-1); padding: 8px 10px; border-radius: var(--r-sm);">
              Decisions folded in workstream note: <code style="font-family: var(--font-mono); font-size: 11px;">${this._escape(workstreamName)}.md</code>
            </div>
          ` : `
            <div style="display: flex; flex-direction: column; gap: 8px;">
              ${citedDecisions.map(d => `
                <div style="background: var(--navy-1); border-left: 3px solid var(--ok); padding: 8px 10px; border-radius: var(--r-sm); font-size: 12.5px;">
                  <div style="font-weight: 500;">${this._escape(d.statement || d.title)}</div>
                  <div class="sub" style="font-size: 11px; margin-top: 3px; display: flex; justify-content: space-between; align-items: center;">
                    <span>${this._escape(d.date || meeting.date)} · ${this._escape(d.workstream || workstreamName)}</span>
                    ${d.note ? `<span style="font-family: var(--font-mono); font-size: 10.5px;">${this._escape(d.note.split('/').pop())}</span>` : ''}
                  </div>
                </div>
              `).join('')}
            </div>
          `}
        </div>

        <!-- Cited Actions -->
        <div>
          <div style="font-size: 12px; font-weight: 600; margin-bottom: 6px; display: flex; justify-content: space-between; align-items: center;">
            <span>Cited Actions (${citedActions.length})</span>
            <span class="sub" style="font-size: 11px;">Actions.md</span>
          </div>
          ${citedActions.length === 0 ? `
            <div class="sub" style="font-size: 12px; background: var(--navy-1); padding: 8px 10px; border-radius: var(--r-sm);">
              Actions registered in <code style="font-family: var(--font-mono); font-size: 11px;">Actions.md</code>
            </div>
          ` : `
            <div style="display: flex; flex-direction: column; gap: 6px;">
              ${citedActions.map(a => `
                <div style="background: var(--navy-1); padding: 6px 10px; border-radius: var(--r-sm); font-size: 12px; display: flex; justify-content: space-between; align-items: center; gap: 8px;">
                  <div style="display: flex; align-items: center; gap: 8px; overflow: hidden; flex: 1;">
                    <button class="item-check-btn action-toggle-btn ${a.done ? 'checked' : ''}" data-action-id="${this._escape(a.id)}" data-mission-id="${this._escape(missionId)}" title="${a.done ? 'Mark open' : 'Mark done'}" style="flex-shrink: 0; width: 18px; height: 18px; border-radius: 4px; border: 1px solid var(--border); background: var(--card); display: inline-flex; align-items: center; justify-content: center; cursor: pointer; padding: 0;">
                      ${a.done ? Icons.check : ''}
                    </button>
                    <div style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                      <span class="badge" style="font-size: 10px; font-family: var(--font-mono); margin-right: 4px;">${this._escape(a.id)}</span>
                      <span style="font-weight: 500; ${a.done ? 'text-decoration: line-through; opacity: 0.7;' : ''}">${this._escape(a.text || a.description || a.title || a.id)}</span>
                      <span class="sub" style="margin-left: 6px;">(${this._escape(a.owner || 'Ayrton')})</span>
                    </div>
                  </div>
                  <div style="display: flex; align-items: center; gap: 4px; flex-shrink: 0;">
                    <button class="btn sm action-edit-btn" data-action-id="${this._escape(a.id || a.title)}" data-mission-id="${this._escape(missionId)}" title="Edit action: name, sub-stream, owner, due date" style="font-size: 10px; padding: 2px 5px; display: inline-flex; align-items: center; gap: 3px;">
                      ${Icons.edit} Edit
                    </button>
                    <button class="btn sm" data-copy-action-id="${this._escape(a.id || a.title)}" style="font-size: 10.5px; padding: 2px 6px; flex-shrink: 0;" title="Copy action ID">
                      Copy ID
                    </button>
                  </div>
                </div>
              `).join('')}
            </div>
          `}
        </div>

        <!-- Open Note Link Info -->
        <div style="border-top: 1px solid var(--border); padding-top: 10px; display: flex; justify-content: space-between; align-items: center;">
          <span class="sub" style="font-size: 11.5px;">Note location: <code style="font-family: var(--font-mono);">${this._escape(overviewFile)}</code></span>
          <button id="btnCopyNotePath" class="btn sm" data-note-path="${this._escape(overviewFile)}" style="font-size: 11px;">
            Copy Note Path
          </button>
        </div>

      </div>
    `;
  }

  /* -------------------------------------------------------------------------- */
  /*  COLLAPSIBLE RELATED SECTION (In EVERY Mode)                              */
  /* -------------------------------------------------------------------------- */
  _renderRelatedSection(meeting) {
    const isExpanded = this.isRelatedExpanded;
    const seriesEvents = (meeting.seriesId && typeof this.store.getEventsForSeries === 'function')
      ? this.store.getEventsForSeries(meeting.seriesId)
      : [];
    const priorOccurrences = seriesEvents.filter(e => e.id !== meeting.id);

    return `
      <div class="card" style="border: 1px solid var(--border); overflow: hidden; padding: 0;">
        
        <!-- Toggle Header -->
        <button id="btnToggleRelated" style="width: 100%; display: flex; justify-content: space-between; align-items: center; padding: 12px 14px; background: var(--navy-2); border: none; cursor: pointer; text-align: left; color: var(--foreground); font-size: 13px; font-weight: 600;">
          <span style="display: inline-flex; align-items: center; gap: 6px;">
            ${Icons.link} Related Meetings & Lineage (${priorOccurrences.length})
          </span>
          <span style="color: var(--muted-foreground);">
            ${isExpanded ? Icons.chevronUp : Icons.chevronDown}
          </span>
        </button>

        ${isExpanded ? `
          <div style="padding: 14px; display: flex; flex-direction: column; gap: 12px; border-top: 1px solid var(--border);">
            
            <!-- Recurring Series Lineage -->
            <div>
              <div style="font-size: 11.5px; font-weight: 600; text-transform: uppercase; color: var(--muted-foreground); margin-bottom: 6px;">
                Series Lineage (${meeting.series || 'Recurring'})
              </div>
              ${priorOccurrences.length === 0 ? `
                <div class="sub" style="font-size: 12px;">No other occurrences found in calendar.</div>
              ` : `
                <div style="display: flex; flex-direction: column; gap: 6px;">
                  ${priorOccurrences.slice(0, 5).map(occ => `
                    <div style="display: flex; justify-content: space-between; align-items: center; gap: 8px; font-size: 12px; background: var(--navy-1); padding: 6px 8px; border-radius: var(--r-sm); cursor: pointer;" data-open-related="${this._escape(occ.id)}">
                      <span>${this._formatDate(occ.date)} · ${this._escape(occ.start)}</span>
                      <span class="sub" style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 180px;">${this._escape(occ.title)}</span>
                    </div>
                  `).join('')}
                </div>
              `}
            </div>

            <!-- Manual link meeting -->
            <div style="border-top: 1px solid var(--border); padding-top: 10px;">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span class="sub" style="font-size: 11.5px;">Connected meetings</span>
                <button id="btnSearchLinkMeeting" class="btn sm" style="font-size: 11px;">
                  ${Icons.plus} Link meeting
                </button>
              </div>
            </div>

          </div>
        ` : ''}

      </div>
    `;
  }

  /* -------------------------------------------------------------------------- */
  /*  EVENT BINDINGS                                                            */
  /* -------------------------------------------------------------------------- */
  _bindEvents(meeting, mode, missionId, missionName, googleDocUrl) {
    // 1. Close button -> calls onClose (returns to #/p/<missionId>)
    this.container.querySelector('#drawerCloseBtn')?.addEventListener('click', () => {
      if (this.onClose) this.onClose();
    });

    // 2. Prep mode: Actions reviewed checkbox
    this.container.querySelector('#chkActionsReviewed')?.addEventListener('change', async (e) => {
      const isChecked = e.target.checked;
      await this.store.saveMeetingData(meeting.id, { actionsReviewed: isChecked });
      await this.render();
    });

    // 3. Prep mode: Agenda scratchpad auto-save (UI state)
    const agendaInput = this.container.querySelector('#myAgendaNotes');
    if (agendaInput) {
      let timer = null;
      agendaInput.addEventListener('input', () => {
        const val = agendaInput.value;
        const statusEl = this.container.querySelector('#agendaAutoSaveStatus');
        if (statusEl) statusEl.textContent = 'Saving...';
        clearTimeout(timer);
        timer = setTimeout(async () => {
          await this.store.saveMeetingData(meeting.id, { agenda: val });
          if (statusEl) statusEl.textContent = 'Saved';
        }, 400);
      });
    }

    // 4. Capture mode: File Drop and Upload
    const dropZone = this.container.querySelector('#captureDropZone');
    const fileInput = this.container.querySelector('#captureFileInput');
    if (dropZone && fileInput) {
      dropZone.addEventListener('click', () => fileInput.click());
      
      dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.style.borderColor = 'var(--pink-600)';
        dropZone.style.background = 'var(--navy-2)';
      });

      dropZone.addEventListener('dragleave', () => {
        dropZone.style.borderColor = 'var(--border)';
        dropZone.style.background = 'var(--navy-1)';
      });

      dropZone.addEventListener('drop', async (e) => {
        e.preventDefault();
        dropZone.style.borderColor = 'var(--border)';
        dropZone.style.background = 'var(--navy-1)';
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
          const file = e.dataTransfer.files[0];
          const text = await file.text();
          const textarea = this.container.querySelector('#captureNotesText');
          if (textarea) textarea.value = text;
        }
      });

      fileInput.addEventListener('change', async () => {
        if (fileInput.files && fileInput.files.length > 0) {
          const file = fileInput.files[0];
          const text = await file.text();
          const textarea = this.container.querySelector('#captureNotesText');
          if (textarea) textarea.value = text;
        }
      });
    }

    // 5. Capture mode: Fetch Google Doc button
    this.container.querySelector('#btnFetchGoogleDoc')?.addEventListener('click', async () => {
      if (!googleDocUrl) return;
      this.isFetchingDoc = true;
      this.docFetchError = null;
      await this.render();

      try {
        const resp = await fetch(`/api/docs/fetch?url=${encodeURIComponent(googleDocUrl)}`);
        if (resp.ok) {
          const data = await resp.json();
          if (data && data.text) {
            const textarea = this.container.querySelector('#captureNotesText');
            if (textarea) {
              const current = textarea.value.trim();
              textarea.value = current ? `${current}\n\n## Fetched from Google Doc\n${data.text}` : data.text;
            }
          } else {
            this.docFetchError = 'Could not extract text from Google Doc';
          }
        } else {
          this.docFetchError = `Server returned ${resp.status} when fetching Google Doc`;
        }
      } catch (err) {
        this.docFetchError = `Network error fetching doc: ${err.message}`;
      } finally {
        this.isFetchingDoc = false;
        await this.render();
      }
    });

    // 6. Capture mode: Save to Mission Inbox button
    this.container.querySelector('#btnSaveToInbox')?.addEventListener('click', async () => {
      const textarea = this.container.querySelector('#captureNotesText');
      const content = textarea ? textarea.value.trim() : '';
      if (!content) {
        alert('Please paste or type minutes content before saving.');
        return;
      }

      const saveBtn = this.container.querySelector('#btnSaveToInbox');
      if (saveBtn) {
        saveBtn.disabled = true;
        saveBtn.textContent = 'Saving to inbox...';
      }

      try {
        const result = await this.store.sendMinutesToInbox(meeting.id, missionId, {
          title: meeting.title,
          date: meeting.date,
          content,
          text: content,
          attendees: meeting.attendees || [],
          googleDocUrl
        });

        const savedFilename = result?.filename || result?.file || `${meeting.date}_${meeting.id}.md`;
        this.captureConfirmation = `Saved to ${missionName} inbox as ${savedFilename}`;
        this.isReplaceMode = false;
        
        // Refresh store caches and re-render
        if (this.store.inboxStatusCache) {
          this.store.inboxStatusCache.delete(missionId);
        }
        await this.render();
      } catch (err) {
        alert(`Failed to save minutes to inbox: ${err.message}`);
        if (saveBtn) {
          saveBtn.disabled = false;
          saveBtn.textContent = 'Save to Mission Inbox';
        }
      }
    });

    // 7. Cancel replace mode
    this.container.querySelector('#btnCancelReplace')?.addEventListener('click', async () => {
      this.isReplaceMode = false;
      await this.render();
    });

    // 8. In Inbox Mode: "Fold now" button -> executes fold via backend API, falls back to clipboard
    this.container.querySelector('#btnFoldNow')?.addEventListener('click', async () => {
      const foldBtn = this.container.querySelector('#btnFoldNow');
      const toast = this.container.querySelector('#foldNowToast');
      const foldPrompt = `Fold the inbox for ${missionName} following Missions/_fold.md, then show me the change summary.`;

      if (foldBtn) {
        foldBtn.disabled = true;
        foldBtn.textContent = 'Folding...';
      }

      if (missionId) {
        try {
          const resp = await fetch(`/api/missions/${encodeURIComponent(missionId)}/fold`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ apply: true })
          });
          if (resp.ok) {
            const data = await resp.json();
            if (data.status === 'success') {
              if (this.store && this.store.inboxStatusCache) {
                this.store.inboxStatusCache.clear();
                this.store.missionSummariesCache.clear();
              }
              if (toast) {
                toast.innerHTML = `${Icons.check} Successfully folded minutes into mission notes!`;
                toast.style.display = 'block';
              }
              setTimeout(async () => {
                await this.render();
              }, 1200);
              return;
            }
          }
        } catch (e) {
          // Backend offline or error -> fallback to copying prompt
        }
      }

      // Fallback: copy prompt to clipboard
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(foldPrompt);
      }
      if (toast) {
        toast.innerHTML = `${Icons.check} Copied Antigravity fold prompt to clipboard! Paste into your agent.`;
        toast.style.display = 'block';
        setTimeout(() => { if (toast) toast.style.display = 'none'; }, 4000);
      }
      if (foldBtn) {
        foldBtn.disabled = false;
        foldBtn.innerHTML = `${Icons.sparkles} Fold now`;
      }
    });

    // 8b. Copy fold prompt button
    this.container.querySelector('#btnCopyFoldPrompt')?.addEventListener('click', async () => {
      const foldPrompt = `Fold the inbox for ${missionName} following Missions/_fold.md, then show me the change summary.`;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(foldPrompt);
      }
      const toast = this.container.querySelector('#foldNowToast');
      if (toast) {
        toast.innerHTML = `${Icons.check} Copied Antigravity fold prompt to clipboard! Paste into your agent.`;
        toast.style.display = 'block';
        setTimeout(() => { if (toast) toast.style.display = 'none'; }, 4000);
      }
    });

    // 9. In Inbox Mode: "Replace minutes" button
    this.container.querySelector('#btnTriggerReplaceMinutes')?.addEventListener('click', async () => {
      this.isReplaceMode = true;
      await this.render();
    });

    // 10. Folded Mode: Copy action ID buttons
    this.container.querySelectorAll('[data-copy-action-id]').forEach(btn => {
      btn.addEventListener('click', async () => {
        const actId = btn.dataset.copyActionId;
        if (actId && navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(actId);
        }
        const orig = btn.innerHTML;
        btn.innerHTML = `<span style="display:inline-flex;align-items:center;gap:3px;">${Icons.check} Copied</span>`;
        setTimeout(() => { btn.innerHTML = orig; }, 1500);
      });
    });

    // 10b. Action toggle checkbox buttons (Prep and Folded modes)
    this.container.querySelectorAll('.action-toggle-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const actionId = btn.dataset.actionId;
        const targetMissionId = btn.dataset.missionId || missionId;
        if (!actionId) return;
        btn.disabled = true;
        try {
          await this.store.toggleAction(actionId, targetMissionId);
          await this.render();
        } catch (err) {
          console.error('[MeetingPanel] Toggle action failed:', err);
          btn.disabled = false;
        }
      });
    });

    // 10c. Action edit buttons (Prep and Folded modes)
    this.container.querySelectorAll('.action-edit-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const actionId = btn.dataset.actionId;
        const targetMissionId = btn.dataset.missionId || missionId;
        if (!actionId) return;

        let actionObj = null;
        try {
          const summary = await this.store.getMissionSummary(targetMissionId);
          if (summary && Array.isArray(summary.actions)) {
            actionObj = summary.actions.find(a => a.id === actionId);
          }
        } catch (err) {}

        if (!actionObj) {
          actionObj = { id: actionId, missionId: targetMissionId };
        }

        openActionEditModal({
          action: actionObj,
          missionId: targetMissionId,
          store: this.store,
          onSave: async () => {
            await this.render();
          }
        });
      });
    });

    // 11. Copy note path button
    this.container.querySelector('#btnCopyNotePath')?.addEventListener('click', async (e) => {
      const path = e.target.dataset.notePath;
      if (path && navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(path);
      }
      const orig = e.target.textContent;
      e.target.textContent = 'Path Copied!';
      setTimeout(() => { e.target.textContent = orig; }, 1500);
    });

    // 12. Toggle Related Section
    this.container.querySelector('#btnToggleRelated')?.addEventListener('click', async () => {
      this.isRelatedExpanded = !this.isRelatedExpanded;
      await this.render();
    });

    // 13. Open related meeting
    this.container.querySelectorAll('[data-open-related]').forEach(el => {
      el.addEventListener('click', () => {
        const relId = el.dataset.openRelated;
        if (relId && this.onOpenMeeting) {
          this.onOpenMeeting(relId);
        }
      });
    });
  }

  _extractGoogleDocUrl(description) {
    if (!description) return null;
    const match = description.match(/https:\/\/docs\.google\.com\/document\/d\/[a-zA-Z0-9_-]+/);
    return match ? match[0] : null;
  }
}
