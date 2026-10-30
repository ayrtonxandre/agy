/**
 * Meeting Panel Component
 * 
 * Manages the right-hand meeting drawer with tabs for:
 * Agenda, Minutes, Actions/Decisions/Questions, and Related (Minutes Intelligence).
 * 
 * Features:
 * - Kind-aware items (action, decision, question, topic) with owner and due date.
 * - Prep score calculation with dynamic indicator.
 * - Minutes intelligence: deterministic & LLM link discovery.
 * - Explicit Accept / Reject for suggestions (never auto-links silently).
 * - Connected prior meetings list with unlink action.
 * - Manual meeting linking over all calendar events.
 */
import { Icons } from './icons.js';
import { PrepScoreCalculator } from '../model/prep_score.js';

export class MeetingPanelUI {
  constructor({ container, store, onOpenMeeting, onClose, onCollapse }) {
    this.container = container;
    this.store = store;
    this.onOpenMeeting = onOpenMeeting;
    this.onClose = onClose;
    this.onCollapse = onCollapse;
    this.currentMeetingId = null;
    this.currentTab = 'agenda';
    this.llmActiveForMeeting = {};
    this.manualLinkSearchOpen = false;
    this.extractionResult = {};
    this.isFetchingDoc = false;
    this.docFetchError = null;
    this.manualDocInputOpen = false;
  }

  setMeeting(meetingId, tab = null) {
    this.currentMeetingId = meetingId;
    if (tab) this.currentTab = tab;
    return this.render();
  }

  focusActionInput() {
    if (this.currentTab !== 'actions') {
      this.currentTab = 'actions';
      this.render().then(() => {
        const input = this.container.querySelector('#newItemText');
        if (input) input.focus();
      });
    } else {
      const input = this.container.querySelector('#newItemText');
      if (input) input.focus();
    }
  }

  async render() {
    if (!this.container) return;

    if (!this.currentMeetingId) {
      this.container.innerHTML = `
        <div style="display: flex; justify-content: flex-end; margin-bottom: 8px;">
          <button class="btn sm" id="collapsePanelEmptyBtn" title="Collapse meeting panel">
            ${Icons.panelRightClose} Collapse
          </button>
        </div>
        <div class="empty" style="padding-top: 60px;">
          ${Icons.calendar}
          <div style="margin-top: 8px;">Select a meeting from the timeline or press <code>j/k</code> to navigate.</div>
        </div>
      `;
      this.container.querySelector('#collapsePanelEmptyBtn')?.addEventListener('click', () => {
        if (this.onCollapse) this.onCollapse();
      });
      return;
    }

    const meeting = this.store.getEvent(this.currentMeetingId);
    if (!meeting) {
      this.container.innerHTML = `<div class="empty">Meeting not found.</div>`;
      return;
    }

    const meetingData = await this.store.getMeetingData(meeting.id);
    const matchedProject = this.store.getProjectForMeeting(meeting);
    const allProjects = await this.store.getAllProjects();
    const missions = allProjects.filter(p => p.isMission);
    const activeMission = (matchedProject && matchedProject.isMission) ? matchedProject : (missions[0] || null);
    const missionId = activeMission ? activeMission.id : 'clariane-hdj';
    const inboxStatus = await this.store.getMeetingInboxStatus(meeting.id, missionId);
    let missionSummary = null;
    try {
      missionSummary = await this.store.getMissionSummary(missionId);
    } catch (e) {
      console.warn('[MeetingPanel] Error loading mission summary:', e);
    }

    const isLlmActive = Boolean(this.llmActiveForMeeting[meeting.id]);
    const linkData = await this.store.getMeetingLinks(meeting, { includeLlm: isLlmActive });
    const relatedList = [...linkData.accepted, ...linkData.suggestions];
    const prep = PrepScoreCalculator.computeMeetingPrep(meeting, meetingData, relatedList, { missionSummary, inboxStatus });
    const tabs = ['agenda', 'minutes', 'actions', 'related'];

    const videoBadge = meeting.link ? `
      <a href="${meeting.videoUrl || '#'}" target="_blank" rel="noopener" class="btn sm" style="margin-left: auto;">
        ${Icons.video} Join ${this._escape(meeting.link)}
      </a>
    ` : '';

    let tabContent = '';

    if (this.currentTab === 'agenda') {
      tabContent = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
          <span class="label">Prep Objectives</span>
          <span class="agenda-status-indicator ${prep.agenda.ok ? 'ok' : 'missing'}">
            ${prep.agenda.ok ? Icons.check : Icons.alertCircle} ${prep.agenda.label}
          </span>
        </div>
        <textarea id="panelAgenda" placeholder="What are the key goals, decisions needed, or talking points for this meeting?">${this._escape(meetingData.agenda || '')}</textarea>
        <div class="sub" style="margin-top: 8px; font-size: 11.5px;">
          ${prep.agenda.ok ? 'Objectives drafted. Counts towards dynamic prep score.' : 'Add at least one talking point or goal to fulfill the agenda criterion.'}
        </div>
      `;
    } else if (this.currentTab === 'minutes') {
      const docUrl = meetingData.googleDocUrl || meeting.googleDocUrl || '';
      const extraction = this.extractionResult[meeting.id] || null;
      const minutesText = meetingData.minutes || '';
      const wordCount = minutesText.trim() ? minutesText.trim().split(/\s+/).length : 0;

      tabContent = `
        <div style="display: flex; flex-direction: column; gap: 10px;">
          <!-- Google Doc Connection Banner -->
          <div class="google-doc-card ${docUrl ? 'connected' : 'unconnected'}">
            <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px;">
              <div style="display: flex; align-items: center; gap: 8px; min-width: 0;">
                <span class="doc-icon">${Icons.fileText}</span>
                <div style="min-width: 0;">
                  <div style="font-weight: 600; font-size: 12.5px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                    ${docUrl ? 'Connected Google Doc' : 'No Google Doc Linked'}
                  </div>
                  ${docUrl ? `
                    <a href="${this._escape(docUrl)}" target="_blank" rel="noopener" class="sub" style="color: var(--pink-600); text-decoration: underline; font-size: 11px;">
                      Open document
                    </a>
                  ` : `
                    <div class="sub" style="font-size: 11px;">Link a collaborative doc to ingest minutes</div>
                  `}
                </div>
              </div>
              <div style="display: flex; gap: 6px; align-items: center; flex-shrink: 0;">
                ${docUrl ? `
                  <button class="btn sm ${this.isFetchingDoc ? 'loading' : 'pink'}" id="fetchGoogleDocBtn" ${this.isFetchingDoc ? 'disabled' : ''}>
                    ${this.isFetchingDoc ? 'Fetching...' : `${Icons.sparkles} Fetch from Google Doc`}
                  </button>
                  <button class="btn-icon" id="editDocUrlBtn" title="Change linked URL" style="padding: 2px 4px;">
                    ${Icons.settings || '⚙'}
                  </button>
                ` : `
                  <button class="btn sm" id="toggleDocInputBtn">
                    ${Icons.plus} Link Google Doc
                  </button>
                `}
              </div>
            </div>

            <!-- Manual Doc URL Input Form -->
            ${(this.manualDocInputOpen || (!docUrl && this.manualDocInputOpen)) ? `
              <div style="margin-top: 10px; padding-top: 8px; border-top: 1px solid var(--border); display: flex; gap: 6px;">
                <input class="in sm" id="inputGoogleDocUrl" placeholder="Paste Google Doc URL (https://docs.google.com/document/d/...)" value="${this._escape(docUrl)}" style="flex: 1; font-size: 11px;" />
                <button class="btn sm pink" id="saveGoogleDocUrlBtn">Connect</button>
                <button class="btn sm" id="cancelGoogleDocUrlBtn">${Icons.x}</button>
              </div>
            ` : ''}

            ${this.docFetchError ? `
              <div style="margin-top: 8px; font-size: 11.5px; color: var(--destructive); background: color-mix(in oklab, var(--destructive) 10%, transparent); padding: 6px 8px; border-radius: var(--r-sm);">
                ${this._escape(this.docFetchError)}
              </div>
            ` : ''}
          </div>

          <!-- Mission Inbox Status Strip -->
          <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 10px; background: var(--muted); border: 1px solid var(--border); border-radius: var(--r-sm); margin: 8px 0 10px;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="font-size: 11px; font-weight: 600; text-transform: uppercase; color: var(--muted-foreground);">Mission:</span>
              <select id="panelMissionSelect" class="in sm" style="font-size: 11.5px; padding: 2px 8px; max-width: 220px; height: 26px;">
                ${missions.map(m => `<option value="${this._escape(m.id)}" ${m.id === missionId ? 'selected' : ''}>${this._escape(m.name)}</option>`).join('')}
              </select>
            </div>
            <div>
              ${inboxStatus === 'folded' ? `
                <span class="badge ok" style="font-weight: 600; font-size: 11px;">✓ Folded into mission notes</span>
              ` : inboxStatus === 'pending' ? `
                <span class="badge" style="font-weight: 600; font-size: 11px; background: #d97706; color: #fff;">⏳ In inbox, waiting to be folded</span>
              ` : `
                <span class="badge" style="font-size: 11px; opacity: 0.8;">Not sent to mission inbox</span>
              `}
            </div>
          </div>

          <!-- Minutes Header & Actions -->
          <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 4px; flex-wrap: wrap; gap: 6px;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span class="label">Live Notes &amp; Minutes</span>
              <span class="sub" style="font-size: 11px;">${wordCount} words · Auto-saved</span>
            </div>
            <div style="display: flex; gap: 6px; align-items: center;">
              <label class="btn sm" style="cursor: pointer; margin: 0;" title="Import text/markdown file">
                ${Icons.upload || '↑'} Upload File
                <input type="file" id="minutesFileInput" accept=".txt,.md,.json" style="display: none;" />
              </label>
              ${minutesText.trim() ? `
                <button class="btn sm pink" id="sendToInboxBtn" title="Send raw minutes to mission _inbox/ for folding into Markdown notes">
                  ${Icons.send || '✉'} Send to mission inbox
                </button>
              ` : ''}
              ${minutesText.trim() ? `
                <button class="btn sm" id="extractMinutesBtn" title="Extract actions, decisions, and knowledge entities">
                  ${Icons.sparkles} Extract Preview
                </button>
              ` : ''}
            </div>
          </div>

          <!-- Textarea for minutes -->
          <textarea id="panelMinutes" style="min-height: 180px; font-family: var(--font-mono); font-size: 12px; line-height: 1.5;" placeholder="Paste meeting notes, transcript, or fetch from Google Docs...">${this._escape(minutesText)}</textarea>

          <!-- Extraction Review Card -->
          ${extraction ? `
            <div class="extraction-card" id="extractionReviewCard">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                <div style="display: flex; align-items: center; gap: 6px;">
                  <span class="badge info" style="font-weight: 600;">Extracted Intelligence Preview</span>
                  <span class="sub" style="font-size: 11px;">${extraction.actions.length} actions · ${extraction.decisions.length} decisions</span>
                </div>
                <button class="btn-icon" id="dismissExtractionBtn" title="Dismiss preview">${Icons.x}</button>
              </div>

              <!-- Extracted Actions -->
              ${extraction.actions.length > 0 ? `
                <div style="margin-bottom: 12px;">
                  <div style="font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: var(--foreground); margin-bottom: 6px;">
                    Proposed Actions (${extraction.actions.length})
                  </div>
                  <div style="display: grid; gap: 6px;">
                    ${extraction.actions.map((act, idx) => `
                      <label class="extracted-item-row" style="display: flex; align-items: flex-start; gap: 8px; font-size: 12px; cursor: pointer;">
                        <input type="checkbox" class="extract-action-cb" data-idx="${idx}" checked style="margin-top: 3px;" />
                        <div style="flex: 1;">
                          <div style="display: flex; gap: 6px; align-items: center; flex-wrap: wrap;">
                            <span class="chip-owner">${this._escape(act.owner)}</span>
                            ${act.dueDate ? `<span class="chip-due">${this._escape(act.dueDate)}</span>` : ''}
                            ${(act.tags || []).map(t => `<span class="badge" style="font-size: 10px;">#${this._escape(t)}</span>`).join('')}
                          </div>
                          <div style="margin-top: 3px; color: var(--foreground);">${this._escape(act.text)}</div>
                          ${act.quote ? `
                            <div class="quote-box" style="margin-top: 4px;">
                              “${this._escape(act.quote)}”
                            </div>
                          ` : ''}
                        </div>
                      </label>
                    `).join('')}
                  </div>
                </div>
              ` : ''}

              <!-- Extracted Decisions -->
              ${extraction.decisions.length > 0 ? `
                <div style="margin-bottom: 12px;">
                  <div style="font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: var(--foreground); margin-bottom: 6px;">
                    Extracted Decisions (${extraction.decisions.length})
                  </div>
                  <div style="display: grid; gap: 6px;">
                    ${extraction.decisions.map((dec, idx) => `
                      <label class="extracted-item-row" style="display: flex; align-items: flex-start; gap: 8px; font-size: 12px; cursor: pointer;">
                        <input type="checkbox" class="extract-decision-cb" data-idx="${idx}" checked style="margin-top: 3px;" />
                        <div style="flex: 1;">
                          <div style="display: flex; gap: 6px; align-items: center;">
                            <span class="badge" style="font-size: 10px; font-weight: 600; background: var(--ok-bg, rgba(16, 185, 129, 0.15)); color: var(--ok);">
                              ${this._escape(dec.label || 'Décision')}
                            </span>
                            <span class="sub" style="font-size: 11px;">${this._escape(dec.context || 'Général')}</span>
                          </div>
                          <div style="margin-top: 3px; color: var(--foreground);">${this._escape(dec.statement)}</div>
                          ${dec.quote ? `
                            <div class="quote-box decision" style="margin-top: 4px;">
                              “${this._escape(dec.quote)}”
                            </div>
                          ` : ''}
                        </div>
                      </label>
                    `).join('')}
                  </div>
                </div>
              ` : ''}

              <!-- Extracted Knowledge -->
              ${(extraction.knowledge && (extraction.knowledge.tools.length > 0 || extraction.knowledge.concepts.length > 0)) ? `
                <div style="margin-bottom: 12px; font-size: 11px;">
                  <div style="font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: var(--muted-foreground); margin-bottom: 4px;">
                    Domain Knowledge Entities
                  </div>
                  <div style="display: flex; gap: 4px; flex-wrap: wrap;">
                    ${extraction.knowledge.tools.map(t => `<span class="badge" style="font-size: 10px; font-family: var(--font-mono);">${this._escape(t.name)}</span>`).join('')}
                    ${extraction.knowledge.concepts.map(c => `<span class="badge" style="font-size: 10px;">${this._escape(c.name)}</span>`).join('')}
                  </div>
                </div>
              ` : ''}

              <div style="display: flex; gap: 8px; margin-top: 14px; border-top: 1px solid var(--border); padding-top: 10px;">
                <button class="btn sm pink" id="sendToInboxFromExtractionBtn" style="flex: 1; justify-content: center;">
                  ${Icons.send || '✉'} Send to mission inbox
                </button>
                <button class="btn sm" id="cancelExtractionBtn">Dismiss</button>
              </div>
            </div>
          ` : ''}
        </div>
      `;
    } else if (this.currentTab === 'actions') {
      const items = meetingData.items || [];
      const attendees = meeting.attendees || [];
      const attendeeOptions = attendees.map(a => `<option value="${this._escape(a)}">${this._escape(a)}</option>`).join('');

      // Filter note-derived decisions and actions
      const docUrl = meetingData.googleDocUrl || meeting.googleDocUrl || '';
      const citingDecisions = (missionSummary?.decisions || []).filter(d => {
        if (d.meetingId && d.meetingId === meeting.id) return true;
        if (d.source && d.source.includes(meeting.id)) return true;
        if (docUrl && d.source && d.source.includes(docUrl)) return true;
        return false;
      });

      const citingActions = (missionSummary?.actions || []).filter(a => {
        if (a.meetingId && a.meetingId === meeting.id) return true;
        if (a.source && a.source.includes(meeting.id)) return true;
        if (docUrl && a.source && a.source.includes(docUrl)) return true;
        return false;
      });

      const openMissionActions = (missionSummary?.actions || []).filter(a => !a.done && !citingActions.some(ca => ca.id === a.id));

      tabContent = `
        <div class="actions-review-banner ${prep.openActions.reviewed ? 'reviewed' : 'pending'}">
          <div style="display: flex; align-items: center; gap: 8px;">
            ${prep.openActions.reviewed ? Icons.check : Icons.alertCircle}
            <div>
              <b style="font-size: 12.5px;">${prep.openActions.reviewed ? 'Actions reviewed for this session' : (prep.openActions.totalOpen > 0 ? `${prep.openActions.totalOpen} open action${prep.openActions.totalOpen > 1 ? 's' : ''} require review` : 'Action review pending')}</b>
              <div style="font-size: 11.5px; color: var(--muted-foreground);">${this._escape(prep.openActions.detail)}</div>
            </div>
          </div>
          <button class="btn sm ${prep.openActions.reviewed ? '' : 'pink'}" id="toggleActionsReviewedBtn">
            ${prep.openActions.reviewed ? 'Mark unreviewed' : 'Mark reviewed'}
          </button>
        </div>

        ${(citingDecisions.length > 0 || citingActions.length > 0) ? `
          <!-- Folded Note Knowledge (Single Source of Truth) -->
          <div class="note-knowledge-section" style="margin-bottom: 16px; padding: 12px; background: color-mix(in oklab, var(--ok) 8%, var(--card)); border: 1px solid color-mix(in oklab, var(--ok) 35%, var(--border)); border-radius: var(--r-sm);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
              <div style="display: flex; align-items: center; gap: 6px;">
                <span class="badge ok" style="font-weight: 600; font-size: 11px;">✓ Folded into Mission Notes</span>
                <span class="sub" style="font-size: 11.5px; font-weight: 500;">${this._escape(activeMission ? activeMission.name : 'Mission')}</span>
              </div>
              <span class="sub" style="font-size: 11px;">System of Record</span>
            </div>

            ${citingDecisions.length > 0 ? `
              <div style="margin-bottom: 10px;">
                <div style="font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: var(--ok); margin-bottom: 6px;">
                  Validated Decisions (${citingDecisions.length})
                </div>
                <div style="display: grid; gap: 6px;">
                  ${citingDecisions.map(d => `
                    <div style="background: var(--card); border: 1px solid var(--border); border-left: 3px solid var(--ok); padding: 8px 10px; border-radius: var(--r-sm);">
                      <div style="display: flex; justify-content: space-between; align-items: baseline; gap: 6px;">
                        <span style="font-weight: 600; font-size: 12px; color: var(--foreground);">${this._escape(d.statement || d.decision)}</span>
                        <span class="badge" style="font-size: 10px; font-family: var(--font-mono);">${this._escape(d.noteFile || 'Decision')}</span>
                      </div>
                      ${d.why ? `<div class="sub" style="font-size: 11px; margin-top: 2px;">Why: ${this._escape(d.why)}</div>` : ''}
                      <div class="sub" style="font-size: 10.5px; margin-top: 4px; color: var(--muted-foreground);">
                        ${d.date ? `<span style="font-family: var(--font-mono);">${d.date}</span> · ` : ''}Source: ${this._escape(d.source || d.noteTitle || 'Mission notes')}
                      </div>
                    </div>
                  `).join('')}
                </div>
              </div>
            ` : ''}

            ${citingActions.length > 0 ? `
              <div>
                <div style="font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: var(--pink-600); margin-bottom: 6px;">
                  Mission Actions (${citingActions.length})
                </div>
                <div style="display: grid; gap: 6px;">
                  ${citingActions.map(a => `
                    <div style="background: var(--card); border: 1px solid var(--border); border-left: 3px solid var(--pink-600); padding: 8px 10px; border-radius: var(--r-sm); display: flex; justify-content: space-between; align-items: flex-start; gap: 8px;">
                      <div style="flex: 1; min-width: 0;">
                        <div style="display: flex; gap: 6px; align-items: center; flex-wrap: wrap;">
                          <span class="badge info" style="font-family: var(--font-mono); font-size: 10.5px; font-weight: 700;">${this._escape(a.id)}</span>
                          <span class="chip-owner" style="font-size: 11px;">${this._escape(a.owner)}</span>
                          ${a.due ? `<span class="chip-due" style="font-size: 10.5px;">${Icons.clock} ${this._escape(a.due)}</span>` : ''}
                          <span class="badge" style="font-size: 10px; font-family: var(--font-mono);">${this._escape(a.file || 'Actions.md')}</span>
                        </div>
                        <div style="font-size: 12px; margin-top: 4px; line-height: 1.4; color: var(--foreground);">${this._escape(a.text || a.description)}</div>
                      </div>
                      <button class="btn sm" data-copy-action-id="${this._escape(a.id)}" title="Copy action ID to clipboard to reference in notes" style="flex-shrink: 0; font-size: 10.5px; padding: 2px 6px;">
                        📋 Copy ID
                      </button>
                    </div>
                  `).join('')}
                </div>
              </div>
            ` : ''}
          </div>
        ` : (openMissionActions.length > 0) ? `
          <div style="margin-bottom: 14px; padding: 10px 12px; background: var(--muted); border: 1px solid var(--border); border-radius: var(--r-sm);">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <div style="display: flex; align-items: center; gap: 6px;">
                <span style="font-size: 11px; font-weight: 600; text-transform: uppercase; color: var(--muted-foreground);">Mission Action Matrix:</span>
                <span class="badge pink" style="font-size: 11px; font-weight: 600;">${openMissionActions.length} open in Actions.md</span>
              </div>
              <button class="btn sm" id="toggleMissionActionsListBtn" style="font-size: 11px; padding: 1px 6px;">
                ${this.showMissionActionsInPanel ? 'Hide' : 'Show top open'}
              </button>
            </div>
            ${this.showMissionActionsInPanel ? `
              <div style="display: grid; gap: 6px; margin-top: 8px;">
                ${openMissionActions.slice(0, 5).map(a => `
                  <div style="background: var(--card); border: 1px solid var(--border); padding: 6px 8px; border-radius: var(--r-sm); display: flex; justify-content: space-between; align-items: center; gap: 6px;">
                    <div style="font-size: 11.5px; min-width: 0;">
                      <span style="font-family: var(--font-mono); font-weight: 600; color: var(--pink-600);">${this._escape(a.id)}:</span>
                      <span>${this._escape(a.text || a.description)}</span>
                      <span class="sub" style="font-size: 10.5px;">(${this._escape(a.owner)})</span>
                    </div>
                    <button class="btn sm" data-copy-action-id="${this._escape(a.id)}" style="flex-shrink: 0; font-size: 10px; padding: 1px 5px;">Copy</button>
                  </div>
                `).join('')}
              </div>
            ` : ''}
          </div>
        ` : ''}

        <div style="font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: var(--muted-foreground); margin-bottom: 6px;">
          Session Local Items &amp; Scratchpad
        </div>

        <div class="item-form-box">
          <div style="display: flex; gap: 6px; margin-bottom: 8px;">
            <select id="itemKind" class="in" style="width: 110px; font-weight: 500;">
              <option value="action">Action</option>
              <option value="decision">Decision</option>
              <option value="question">Question</option>
              <option value="topic">Topic</option>
            </select>
            <input class="in" id="newItemText" placeholder="Add item... (Press 'a' anywhere to focus)" style="flex: 1;" />
          </div>
          <div style="display: flex; gap: 6px; align-items: center;">
            <select id="itemOwner" class="in" style="flex: 1; max-width: 170px; font-size: 12px;">
              <option value="Me">Owner: Me</option>
              ${attendeeOptions}
            </select>
            <input type="date" id="itemDueDate" class="in" style="width: 135px; font-size: 12px;" title="Due date (optional)" />
            <button class="btn sm pink" id="addItemBtn" style="margin-left: auto;">${Icons.plus} Add</button>
          </div>
        </div>

        <div class="items-list">
          ${items.length > 0 ? items.map(item => `
            <div class="item" data-item-id="${item.id}">
              <button class="item-check-btn ${item.done ? 'checked' : ''}" data-id="${item.id}" title="${item.done ? 'Mark open' : 'Mark done'}">
                ${item.done ? Icons.check : ''}
              </button>
              <span class="kind-badge ${item.kind}">${item.kind}</span>
              <div class="item-body">
                <span class="tx ${item.done ? 'done' : ''}">${this._escape(item.text)}</span>
                ${item.quote ? `
                  <div class="quote-box ${item.kind === 'decision' ? 'decision' : ''}" style="margin-top: 4px; font-size: 11px;">
                    “${this._escape(item.quote)}”
                  </div>
                ` : ''}
                <div class="item-meta">
                  ${item.owner ? `<span class="chip-owner">${this._escape(item.owner)}</span>` : ''}
                  ${item.dueDate ? `<span class="chip-due">${Icons.clock} ${this._formatDue(item.dueDate)}</span>` : ''}
                </div>
              </div>
              <button class="btn-icon item-delete-btn" data-id="${item.id}" title="Delete item">
                ${Icons.trash}
              </button>
            </div>
          `).join('') : '<div class="empty">No captured session items yet. Use form above to add one.</div>'}
        </div>
      `;
    } else if (this.currentTab === 'related') {
      tabContent = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
          <div>
            <div class="label">Minutes Intelligence</div>
            <div class="sub" style="font-size: 11px;">Link meetings to surface carried-over actions and prior decisions</div>
          </div>
          <button class="btn sm ${isLlmActive ? 'pink' : ''}" id="toggleLlmBtn" title="Run LLM semantic search over minutes and agendas">
            ${Icons.sparkles} ${isLlmActive ? 'LLM Active' : 'Run LLM Discovery'}
          </button>
        </div>

        ${linkData.accepted.length > 0 ? `
          <div style="margin-bottom: 16px;">
            <div style="font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: var(--ok); margin-bottom: 8px; display: flex; align-items: center; gap: 4px;">
              ${Icons.check} Connected Prior Meetings (${linkData.accepted.length})
            </div>
            <div style="display: grid; gap: 8px;">
              ${linkData.accepted.map(a => `
                <div class="link-card accepted">
                  <div class="link-card-header">
                    <span class="link-card-title" data-open-meeting="${a.id}">${this._escape(a.event.title)}</span>
                    <button class="btn-icon" data-unlink-meeting="${a.id}" title="Unlink this meeting" style="padding: 2px;">
                      ${Icons.unlink}
                    </button>
                  </div>
                  <div class="link-card-meta">
                    <span style="font-family: var(--font-mono);">${a.event.date}</span>
                    ${a.event.client ? `<span>·</span><span>${this._escape(a.event.client)}</span>` : ''}
                    <span>·</span><span style="color: var(--ok);">${this._escape(a.reason)}</span>
                    ${a.openActionsCount > 0 ? `<span>·</span><span style="color: var(--pink-600); font-weight: 600;">${a.openActionsCount} open action${a.openActionsCount > 1 ? 's' : ''}</span>` : ''}
                  </div>
                  ${a.lastMinutesSummary ? `
                    <div style="font-size: 12px; color: var(--muted-foreground); font-style: italic; background: var(--muted); padding: 6px 8px; border-radius: var(--r-sm);">
                      "${this._escape(a.lastMinutesSummary)}..."
                    </div>
                  ` : ''}
                  <div class="link-card-actions">
                    <button class="btn sm" data-open-meeting="${a.id}">Open Meeting</button>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}

        <div style="margin-bottom: 14px;">
          <div style="font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: var(--muted-foreground); margin-bottom: 8px; display: flex; justify-content: space-between; align-items: center;">
            <span>Suggestions (${linkData.suggestions.length})</span>
            <span style="font-size: 11px; text-transform: none; font-weight: 400;">Explicit review required</span>
          </div>

          ${linkData.suggestions.length > 0 ? `
            <div style="display: grid; gap: 8px;">
              ${linkData.suggestions.map(s => `
                <div class="link-card ${s.isLlm ? 'llm-suggested' : 'suggested'}">
                  <div class="link-card-header">
                    <span class="link-card-title" data-open-meeting="${s.id}">${this._escape(s.event.title)}</span>
                    <span class="badge ${s.isLlm ? 'info' : ''}" style="font-size: 10px; font-weight: 600;">
                      ${s.isLlm ? `${Icons.sparkles} ${s.matchPercent}% Match` : `${s.matchPercent}% Match`}
                    </span>
                  </div>
                  <div class="link-card-meta">
                    <span style="font-family: var(--font-mono);">${s.event.date}</span>
                    ${s.event.client ? `<span>·</span><span>${this._escape(s.event.client)}</span>` : ''}
                    <span>·</span><span style="color: var(--foreground);">${this._escape(s.reason)}</span>
                    ${s.openActionsCount > 0 ? `<span>·</span><span style="color: var(--pink-600); font-weight: 600;">${s.openActionsCount} open action${s.openActionsCount > 1 ? 's' : ''}</span>` : ''}
                  </div>
                  ${s.lastMinutesSummary ? `
                    <div style="font-size: 12px; color: var(--muted-foreground); font-style: italic; background: var(--muted); padding: 6px 8px; border-radius: var(--r-sm);">
                      "${this._escape(s.lastMinutesSummary)}..."
                    </div>
                  ` : ''}
                  <div class="link-card-actions">
                    <button class="btn sm pink" data-accept-link="${s.id}" data-reason="${this._escape(s.reason)}">
                      ${Icons.check} Accept Link
                    </button>
                    <button class="btn sm" data-reject-link="${s.id}">
                      ${Icons.x} Reject
                    </button>
                    <button class="btn sm" data-open-meeting="${s.id}" style="margin-left: auto;">
                      Preview
                    </button>
                  </div>
                </div>
              `).join('')}
            </div>
          ` : `
            <div class="empty" style="padding: 16px 0;">
              No pending suggestions found.
            </div>
          `}
        </div>

        <div style="margin-top: 14px; border-top: 1px solid var(--border); padding-top: 12px;">
          ${!this.manualLinkSearchOpen ? `
            <button class="btn sm" id="openManualLinkBtn" style="width: 100%; justify-content: center;">
              ${Icons.plus} Manually link another meeting
            </button>
          ` : `
            <div class="manual-link-picker">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span class="label" style="font-size: 11px;">Search Calendar (259 events)</span>
                <button class="btn sm" id="closeManualLinkBtn" style="padding: 0 4px;">${Icons.x}</button>
              </div>
              <input class="in" id="manualSearchInput" placeholder="Type title or client to link..." autofocus />
              <div id="manualSearchResults" style="max-height: 160px; overflow-y: auto; display: grid; gap: 4px; margin-top: 4px;"></div>
            </div>
          `}
        </div>
      `;
    }

    this.container.innerHTML = `
      <div style="display: flex; align-items: center; gap: 8px;">
        <span class="label">Meeting Details</span>
        ${meeting.client ? `<span class="badge">${this._escape(meeting.client)}</span>` : ''}
        <span class="badge ${prep.badgeClass}" title="Prep score computed from agenda, last minutes, open actions">
          ${prep.badgeText} · ${prep.scorePercent}%
        </span>
        ${videoBadge}
        <div style="margin-left: ${meeting.link ? '6px' : 'auto'}; display: flex; align-items: center; gap: 4px;">
          <button class="btn sm" id="collapsePanelBtn" title="Collapse meeting panel" style="padding: 0 6px;">
            ${Icons.panelRightClose}
          </button>
          <button class="btn sm" id="closePanelBtn" title="Close meeting drawer (Esc)" style="padding: 0 6px;">
            ${Icons.x}
          </button>
        </div>
      </div>

      <h2 style="font: 600 20px/1.25 var(--font-sans); margin: 6px 0;">${this._escape(meeting.title)}</h2>
      <div class="sub">
        ${meeting.date} · ${meeting.start}–${meeting.end}
        ${meeting.attendees && meeting.attendees.length ? ` · ${this._escape(meeting.attendees.join(', '))}` : ''}
      </div>

      ${meeting.tags && meeting.tags.length ? `
        <div style="display: flex; gap: 6px; margin-top: 8px; flex-wrap: wrap;">
          ${meeting.tags.map(t => `<span class="badge">#${this._escape(t)}</span>`).join('')}
        </div>
      ` : ''}

      <div class="tabs">
        ${tabs.map(t => `
          <button data-tab="${t}" class="${this.currentTab === t ? 'on' : ''}">
            ${t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        `).join('')}
      </div>

      <div class="tab-body">
        ${tabContent}
      </div>
    `;

    this._bindEvents(meeting, meetingData);
  }

  _bindEvents(meeting, meetingData) {
    // Collapse button
    this.container.querySelector('#collapsePanelBtn')?.addEventListener('click', () => {
      if (this.onCollapse) this.onCollapse();
    });

    // Close button
    this.container.querySelector('#closePanelBtn')?.addEventListener('click', () => {
      if (this.onClose) this.onClose();
    });

    // Tab switching
    this.container.querySelectorAll('.tabs button[data-tab]').forEach(btn => {
      btn.addEventListener('click', () => {
        this.currentTab = btn.dataset.tab;
        this.render();
      });
    });

    // Auto-save agenda
    const agendaEl = this.container.querySelector('#panelAgenda');
    if (agendaEl) {
      agendaEl.addEventListener('input', (e) => {
        this.store.saveMeetingData(meeting.id, { agenda: e.target.value });
      });
    }

    // Auto-save minutes
    const minutesEl = this.container.querySelector('#panelMinutes');
    if (minutesEl) {
      minutesEl.addEventListener('input', (e) => {
        this.store.saveMeetingData(meeting.id, { minutes: e.target.value });
      });
    }

    // Fetch Google Doc Button
    this.container.querySelector('#fetchGoogleDocBtn')?.addEventListener('click', async () => {
      const docUrl = meetingData.googleDocUrl || meeting.googleDocUrl || '';
      if (!docUrl) return;

      this.isFetchingDoc = true;
      this.docFetchError = null;
      await this.render();

      try {
        const fetched = await this.store.fetchGoogleDoc(docUrl);
        const content = fetched.content || '';
        await this.store.saveMeetingData(meeting.id, { minutes: content });

        // Auto-extract actions & context for immediate review
        const extracted = await this.store.extractMinutes(meeting.id, content);
        this.extractionResult[meeting.id] = extracted;
        this.isFetchingDoc = false;
        this.render();
      } catch (err) {
        console.error('[MeetingPanel] Failed to fetch Google Doc:', err);
        this.isFetchingDoc = false;
        this.docFetchError = err.message || 'Failed to fetch document';
        this.render();
      }
    });

    // Toggle Manual Doc Input
    this.container.querySelector('#toggleDocInputBtn')?.addEventListener('click', () => {
      this.manualDocInputOpen = !this.manualDocInputOpen;
      this.render();
    });

    this.container.querySelector('#editDocUrlBtn')?.addEventListener('click', () => {
      this.manualDocInputOpen = true;
      this.render();
    });

    this.container.querySelector('#cancelGoogleDocUrlBtn')?.addEventListener('click', () => {
      this.manualDocInputOpen = false;
      this.render();
    });

    // Save Manual Google Doc URL
    this.container.querySelector('#saveGoogleDocUrlBtn')?.addEventListener('click', async () => {
      const input = this.container.querySelector('#inputGoogleDocUrl');
      const val = input ? input.value.trim() : '';
      if (!val) return;

      await this.store.saveMeetingData(meeting.id, { googleDocUrl: val });
      this.manualDocInputOpen = false;
      this.render();
    });

    // Extract Minutes Action
    this.container.querySelector('#extractMinutesBtn')?.addEventListener('click', async () => {
      const currentText = meetingData.minutes || '';
      if (!currentText.trim()) return;

      const extracted = await this.store.extractMinutes(meeting.id, currentText);
      this.extractionResult[meeting.id] = extracted;
      this.render();
    });

    // Dismiss Extraction Card
    const dismissHandler = () => {
      this.extractionResult[meeting.id] = null;
      this.render();
    };
    this.container.querySelector('#dismissExtractionBtn')?.addEventListener('click', dismissHandler);
    this.container.querySelector('#cancelExtractionBtn')?.addEventListener('click', dismissHandler);

    // Send Minutes to Mission Inbox (_inbox/)
    const sendInboxHandler = async () => {
      const minutesEl = this.container.querySelector('#panelMinutes');
      const text = (minutesEl ? minutesEl.value : (meetingData.minutes || '')).trim();
      if (!text) {
        alert('Please write or paste minutes before sending to the mission inbox.');
        return;
      }
      const missionSelect = this.container.querySelector('#panelMissionSelect');
      const chosenMissionId = missionSelect ? missionSelect.value : (activeMission ? activeMission.id : 'clariane-hdj');

      const sendBtn = this.container.querySelector('#sendToInboxBtn') || this.container.querySelector('#sendToInboxFromExtractionBtn');
      const origText = sendBtn ? sendBtn.innerHTML : '';
      if (sendBtn) {
        sendBtn.disabled = true;
        sendBtn.innerHTML = `⏳ Sending...`;
      }

      try {
        await this.store.sendMinutesToInbox(meeting.id, chosenMissionId, {
          title: meeting.title,
          date: meeting.date,
          attendees: meeting.attendees || [],
          googleDocUrl: meetingData.googleDocUrl || meeting.googleDocUrl || '',
          text
        });
        await this.store.saveMeetingData(meeting.id, { minutes: text });
        this.extractionResult[meeting.id] = null;
        await this.render();
      } catch (err) {
        console.error('[MeetingPanel] Failed to send minutes to inbox:', err);
        alert(`Failed to send minutes to inbox: ${err.message}`);
        if (sendBtn) {
          sendBtn.disabled = false;
          sendBtn.innerHTML = origText;
        }
      }
    };

    this.container.querySelector('#sendToInboxBtn')?.addEventListener('click', sendInboxHandler);
    this.container.querySelector('#sendToInboxFromExtractionBtn')?.addEventListener('click', sendInboxHandler);

    // Copy Action ID button
    this.container.querySelectorAll('[data-copy-action-id]').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const actionId = btn.dataset.copyActionId;
        if (!actionId) return;
        try {
          if (navigator.clipboard && navigator.clipboard.writeText) {
            await navigator.clipboard.writeText(actionId);
          }
          const orig = btn.innerHTML;
          btn.innerHTML = '✓ Copied!';
          setTimeout(() => { btn.innerHTML = orig; }, 1500);
        } catch (err) {
          console.warn('[MeetingPanel] Clipboard error:', err);
        }
      });
    });

    // Toggle Mission Actions List
    this.container.querySelector('#toggleMissionActionsListBtn')?.addEventListener('click', () => {
      this.showMissionActionsInPanel = !this.showMissionActionsInPanel;
      this.render();
    });

    // Minutes File Upload
    const fileInput = this.container.querySelector('#minutesFileInput');
    if (fileInput) {
      fileInput.addEventListener('change', (e) => {
        const file = e.target.files && e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (evt) => {
          const content = evt.target.result;
          await this.store.saveMeetingData(meeting.id, { minutes: content });
          const extracted = await this.store.extractMinutes(meeting.id, content);
          this.extractionResult[meeting.id] = extracted;
          this.render();
        };
        reader.readAsText(file);
      });
    }

    // Toggle actions reviewed state
    this.container.querySelector('#toggleActionsReviewedBtn')?.addEventListener('click', async () => {
      const nextReviewed = !meetingData.actionsReviewed;
      await this.store.saveMeetingData(meeting.id, { actionsReviewed: nextReviewed });
      this.render();
    });

    // Add action/decision/question/topic
    const addBtn = this.container.querySelector('#addItemBtn');
    const inputEl = this.container.querySelector('#newItemText');
    const kindEl = this.container.querySelector('#itemKind');
    const ownerEl = this.container.querySelector('#itemOwner');
    const dueEl = this.container.querySelector('#itemDueDate');

    const handleAddItem = async () => {
      if (!inputEl) return;
      const text = inputEl.value.trim();
      if (!text) return;

      const items = [...(meetingData.items || [])];
      items.push({
        id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        kind: kindEl ? kindEl.value : 'action',
        text,
        owner: ownerEl ? ownerEl.value : 'Me',
        dueDate: dueEl && dueEl.value ? dueEl.value : null,
        done: false,
        createdAt: new Date().toISOString()
      });

      await this.store.saveMeetingData(meeting.id, { items });
      this.render().then(() => {
        const nextInput = this.container.querySelector('#newItemText');
        if (nextInput) nextInput.focus();
      });
    };

    if (addBtn) addBtn.addEventListener('click', handleAddItem);
    if (inputEl) {
      inputEl.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') handleAddItem();
      });
    }

    // Toggle item completion
    this.container.querySelectorAll('.item-check-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.dataset.id;
        const items = (meetingData.items || []).map(it => it.id === id ? { ...it, done: !it.done } : it);
        await this.store.saveMeetingData(meeting.id, { items });
        this.render();
      });
    });

    // Delete item
    this.container.querySelectorAll('.item-delete-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.dataset.id;
        const items = (meetingData.items || []).filter(it => it.id !== id);
        await this.store.saveMeetingData(meeting.id, { items });
        this.render();
      });
    });

    // Accept suggested link
    this.container.querySelectorAll('[data-accept-link]').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const targetId = btn.dataset.acceptLink;
        const reason = btn.dataset.reason || 'Accepted suggestion';
        await this.store.acceptLink(meeting.id, targetId, reason);
        this.render();
      });
    });

    // Reject suggested link
    this.container.querySelectorAll('[data-reject-link]').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const targetId = btn.dataset.rejectLink;
        await this.store.rejectLink(meeting.id, targetId);
        this.render();
      });
    });

    // Unlink meeting
    this.container.querySelectorAll('[data-unlink-meeting]').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const targetId = btn.dataset.unlinkMeeting;
        await this.store.unlinkMeeting(meeting.id, targetId);
        this.render();
      });
    });

    // Toggle LLM pass
    this.container.querySelector('#toggleLlmBtn')?.addEventListener('click', () => {
      this.llmActiveForMeeting[meeting.id] = !this.llmActiveForMeeting[meeting.id];
      this.render();
    });

    // Manual Link Search Trigger & Execution
    const openManualBtn = this.container.querySelector('#openManualLinkBtn');
    if (openManualBtn) {
      openManualBtn.addEventListener('click', () => {
        this.manualLinkSearchOpen = true;
        this.render();
      });
    }
    const closeManualBtn = this.container.querySelector('#closeManualLinkBtn');
    if (closeManualBtn) {
      closeManualBtn.addEventListener('click', () => {
        this.manualLinkSearchOpen = false;
        this.render();
      });
    }

    const manualSearchInput = this.container.querySelector('#manualSearchInput');
    const manualResults = this.container.querySelector('#manualSearchResults');
    if (manualSearchInput && manualResults) {
      manualSearchInput.addEventListener('input', (e) => {
        const q = e.target.value.trim().toLowerCase();
        if (!q) {
          manualResults.innerHTML = '';
          return;
        }
        const candidates = this.store.eventsCache.filter(ev =>
          ev.id !== meeting.id &&
          (ev.title.toLowerCase().includes(q) || (ev.client && ev.client.toLowerCase().includes(q)))
        ).slice(0, 6);

        if (candidates.length === 0) {
          manualResults.innerHTML = '<div style="font-size: 11px; color: var(--muted-foreground); padding: 4px;">No matching meetings found.</div>';
          return;
        }

        manualResults.innerHTML = candidates.map(c => `
          <div style="display: flex; justify-content: space-between; align-items: center; padding: 6px 8px; border: 1px solid var(--border); border-radius: var(--r-sm); background: var(--background);">
            <div>
              <div style="font-size: 12px; font-weight: 500;">${this._escape(c.title)}</div>
              <div style="font-size: 10px; color: var(--muted-foreground);">${c.date} · ${c.client || 'General'}</div>
            </div>
            <button class="btn sm pink" data-manual-link-id="${c.id}">Link</button>
          </div>
        `).join('');

        manualResults.querySelectorAll('[data-manual-link-id]').forEach(linkBtn => {
          linkBtn.addEventListener('click', async () => {
            const tId = linkBtn.dataset.manualLinkId;
            await this.store.acceptLink(meeting.id, tId, 'Explicit manual link');
            this.manualLinkSearchOpen = false;
            this.render();
          });
        });
      });
    }

    // Open related meeting in panel
    this.container.querySelectorAll('[data-open-meeting]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.openMeeting;
        if (id && this.onOpenMeeting) {
          this.onOpenMeeting(id);
        }
      });
    });
  }

  _formatDue(dateStr) {
    if (!dateStr) return '';
    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const mIdx = parseInt(parts[1], 10) - 1;
        return `${parseInt(parts[2], 10)} ${months[mIdx] || ''}`;
      }
      return dateStr;
    } catch {
      return dateStr;
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
