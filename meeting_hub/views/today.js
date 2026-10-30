/**
 * Today View Component
 * 
 * Renders the Today agenda timeline with:
 * 1. Thin all-day event strip above the timeline.
 * 2. Next up card with 48-hour missing items checklist (agenda, last minutes, open actions)
 *    and wired Project Base context strip (open actions and decisions for this project).
 * 3. Daily timeline with missing checklist status and Life-mode training overlay.
 * 4. Step 3 Keyboard-First navigation helpers: getVisibleTimedEvents(), selectNextMeeting(), selectPreviousMeeting().
 * 5. Instant search filtering with `/` shortcut.
 */
import { Icons } from '../ui/icons.js';
import { PrepScoreCalculator } from '../model/prep_score.js';
import { getTodayDateStr, formatLongDate } from '../model/date_utils.js';

export class TodayView {
  constructor({ container, store, onSelectMeeting, onNavigateProject }) {
    this.container = container;
    this.store = store;
    this.onSelectMeeting = onSelectMeeting;
    this.onNavigateProject = onNavigateProject;
    this.selectedEventId = null;
    this.currentDate = typeof getTodayDateStr === 'function' ? getTodayDateStr() : new Date().toISOString().slice(0, 10);
    this.currentMode = 'all'; // 'all' | 'work' | 'life'
    this.searchQuery = '';
  }

  prevDay() {
    const [y, m, d] = this.currentDate.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    date.setDate(date.getDate() - 1);
    const pad = n => String(n).padStart(2, '0');
    this.setDate(`${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`);
  }

  nextDay() {
    const [y, m, d] = this.currentDate.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    date.setDate(date.getDate() + 1);
    const pad = n => String(n).padStart(2, '0');
    this.setDate(`${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`);
  }

  goToday() {
    const today = typeof getTodayDateStr === 'function' ? getTodayDateStr() : new Date().toISOString().slice(0, 10);
    this.setDate(today);
  }

  setDate(date) {
    this.currentDate = date;
    const subtitleEl = document.querySelector('#subtitle');
    if (subtitleEl && document.querySelector('#title')?.textContent === 'Today') {
      subtitleEl.textContent = typeof formatLongDate === 'function' ? formatLongDate(date) : date;
    }
    this.render();
  }

  setMode(mode) {
    this.currentMode = mode;
    this.render();
  }

  setSelectedEvent(id) {
    this.selectedEventId = id;
    this.render();
    this._scrollToSelected();
  }

  setSearchQuery(q) {
    this.searchQuery = (q || '').trim().toLowerCase();
    this.render();
  }

  getVisibleTimedEvents() {
    const allEvents = this.store.getEventsByDate(this.currentDate, 'all');
    let visible = allEvents.filter(ev => {
      if (this.currentMode === 'work') return ev.stream === 'work' && !ev.isTraining;
      if (this.currentMode === 'life') return ev.stream === 'life' || ev.isTraining;
      return true;
    }).filter(e => !e.isAllDay);

    if (this.searchQuery) {
      visible = visible.filter(e => {
        const text = `${e.title} ${e.client || ''} ${(e.attendees || []).join(' ')} ${(e.tags || []).join(' ')}`.toLowerCase();
        return text.includes(this.searchQuery);
      });
    }

    return visible.sort((a, b) => a.start.localeCompare(b.start));
  }

  selectNextMeeting() {
    const list = this.getVisibleTimedEvents();
    if (!list.length) return null;
    let idx = list.findIndex(e => e.id === this.selectedEventId);
    if (idx < 0) idx = 0;
    else idx = Math.min(idx + 1, list.length - 1);
    const target = list[idx];
    if (target) {
      if (this.onSelectMeeting) {
        this.onSelectMeeting(target.id);
      } else {
        this.setSelectedEvent(target.id);
      }
      return target;
    }
    return null;
  }

  selectPreviousMeeting() {
    const list = this.getVisibleTimedEvents();
    if (!list.length) return null;
    let idx = list.findIndex(e => e.id === this.selectedEventId);
    if (idx < 0) idx = 0;
    else idx = Math.max(idx - 1, 0);
    const target = list[idx];
    if (target) {
      if (this.onSelectMeeting) {
        this.onSelectMeeting(target.id);
      } else {
        this.setSelectedEvent(target.id);
      }
      return target;
    }
    return null;
  }

  _scrollToSelected() {
    setTimeout(() => {
      if (!this.selectedEventId || !this.container) return;
      const el = this.container.querySelector ? this.container.querySelector(`.row[data-event-id="${this.selectedEventId}"]`) : null;
      if (el && typeof el.scrollIntoView === 'function') {
        el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }, 40);
  }

  async render() {
    if (!this.container) return;

    const allEvents = this.store.getEventsByDate(this.currentDate, 'all');

    // Filter events according to mode and training constraint
    let visibleEvents = allEvents.filter(ev => {
      if (this.currentMode === 'work') {
        return ev.stream === 'work' && !ev.isTraining;
      }
      if (this.currentMode === 'life') {
        return ev.stream === 'life' || ev.isTraining;
      }
      return true;
    });

    if (this.searchQuery) {
      visibleEvents = visibleEvents.filter(e => {
        const text = `${e.title} ${e.client || ''} ${(e.attendees || []).join(' ')} ${(e.tags || []).join(' ')}`.toLowerCase();
        return text.includes(this.searchQuery);
      });
    }

    // Partition all-day events vs timed events
    const allDayEvents = visibleEvents.filter(e => e.isAllDay);
    const timedEvents = visibleEvents.filter(e => !e.isAllDay).sort((a, b) => a.start.localeCompare(b.start));

    // Next up candidate
    const workMeetings = timedEvents.filter(e => e.stream === 'work');
    const nextMeeting = workMeetings.find(e => e.start >= '09:00') || workMeetings[0] || timedEvents[0];

    // Compute dynamic prep evaluations across all visible work meetings
    const collectionPrep = await PrepScoreCalculator.computeCollectionPrep(workMeetings, this.store);

    // Dynamic prep evaluation & Project Base wiring for Next up meeting
    let nextPrep = null;
    let nextProjectBase = null;
    let isNextWithin48h = false;

    if (nextMeeting) {
      const data = await this.store.getMeetingData(nextMeeting.id);
      const links = await this.store.suggestLinks(nextMeeting);
      const project = this.store.getProjectForMeeting(nextMeeting);
      let inboxStatus = 'not_sent';
      let missionSummary = null;

      // Wire Project Base into Next up
      if (project) {
        try {
          inboxStatus = await this.store.getMeetingInboxStatus(nextMeeting.id, project.id);
          missionSummary = await this.store.getMissionSummary(project.id);
          nextProjectBase = await this.store.getProjectBase(project.id);
        } catch (e) {
          console.warn('[TodayView] Could not load project base for next meeting:', e);
        }
      }

      nextPrep = PrepScoreCalculator.computeMeetingPrep(nextMeeting, data, links, { inboxStatus, missionSummary });
      isNextWithin48h = PrepScoreCalculator.isWithin48Hours(nextMeeting.date, nextMeeting.start, this.currentDate, '00:00');

      if (this.selectedEventId === undefined) {
        this.selectedEventId = nextMeeting.id;
      }
    }

    // Render HTML
    this.container.innerHTML = `
      ${allDayEvents.length > 0 ? `
        <div class="all-day-strip">
          <div class="label" style="font-size: 10px; margin-bottom: 2px;">All-Day Overview</div>
          ${allDayEvents.map(e => {
            let displayTitle = e.title;
            if (e.client && displayTitle.startsWith(e.client + ' ')) {
              displayTitle = displayTitle.slice(e.client.length + 1).trim();
            }
            return `
              <div class="all-day-item">
                <span class="badge ${e.stream === 'work' ? 'info' : ''}">${this._escape(e.client || 'General')}</span>
                <span>${this._escape(displayTitle)}</span>
                ${e.location ? `<span class="sub" style="font-size: 11px;">(${this._escape(e.location)})</span>` : ''}
              </div>
            `;
          }).join('')}
        </div>
      ` : ''}

      ${nextMeeting && !this.searchQuery && nextPrep ? `
        <div class="card next">
          <div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap;">
            <span class="label">Next up</span>
            <span class="badge info">${nextMeeting.start}–${nextMeeting.end}</span>
            ${nextMeeting.client ? `<span class="badge">${this._escape(nextMeeting.client)}</span>` : ''}
            <span class="badge ${nextPrep.missingCount === 0 ? 'ok' : 'warn'}" style="margin-left: auto;">
              ${nextPrep.missingCount === 0 ? 'Prepared' : `${nextPrep.missingCount} missing item${nextPrep.missingCount > 1 ? 's' : ''}`}
            </span>
          </div>

          <h2>${this._escape(nextMeeting.title)}</h2>

          <!-- 48h Missing Items Checklist -->
          ${isNextWithin48h ? `
            <div class="prep-checklist-block" style="display: flex; flex-direction: column; gap: 6px; padding: 10px 12px; background: var(--muted); border: 1px solid var(--border); border-radius: var(--r-sm); margin: 6px 0;">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span class="label" style="margin-bottom: 0;">48h Prep Checklist</span>
                <span class="sub" style="font-size: 11px; font-weight: 500;">
                  ${nextPrep.missingCount === 0 ? 'All criteria satisfied' : `${nextPrep.missingCount} item${nextPrep.missingCount > 1 ? 's' : ''} to complete before meeting`}
                </span>
              </div>

              <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(170px, 1fr)); gap: 8px; margin-top: 4px;">
                ${nextPrep.missingItems.map(item => `
                  <div style="display: flex; align-items: flex-start; gap: 6px; font-size: 11.5px; padding: 6px 8px; border-radius: var(--r-sm); background: var(--card); border: 1px solid ${item.ok ? 'color-mix(in oklab, var(--ok) 30%, var(--border))' : 'color-mix(in oklab, var(--destructive) 30%, var(--border))'};">
                    <span style="color: ${item.ok ? 'var(--ok)' : 'var(--destructive)'}; flex-shrink: 0; margin-top: 1px;">
                      ${item.ok ? Icons.check : Icons.alertCircle}
                    </span>
                    <div style="min-width: 0;">
                      <div style="font-weight: 600; color: var(--foreground);">${this._escape(item.label)}</div>
                      <div class="sub" style="font-size: 10.5px;">${this._escape(item.detail)}</div>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
          ` : `
            <div class="sub" style="font-size: 12px; margin: 6px 0;">
              Scheduled for ${this._escape(nextMeeting.date || 'later')} · Prep checklist activates 48 hours prior to start
            </div>
          `}

          ${nextPrep.inbox && nextPrep.inbox.pending ? `
            <div style="margin: 6px 0; padding: 6px 10px; background: color-mix(in oklab, #d97706 15%, var(--card)); border: 1px solid #d97706; border-radius: var(--r-sm); font-size: 11.5px; display: flex; align-items: center; gap: 8px;">
              <span style="color: #d97706; flex-shrink: 0;">${Icons.clock || '⏳'}</span>
              <span><b>Inbox pending:</b> Raw minutes waiting to be folded into mission notes.</span>
            </div>
          ` : ''}

          <!-- Wired Project Base Intelligence Strip -->
          ${nextProjectBase ? `
            <div class="next-project-strip">
              <div style="display: flex; align-items: center; gap: 8px; font-size: 12px; min-width: 0;">
                <span style="color: var(--pink-600); flex-shrink: 0;">${Icons.layers}</span>
                <div style="min-width: 0;">
                  <span style="font-weight: 600; color: var(--foreground);">${this._escape(nextProjectBase.projectName)}:</span>
                  <span class="sub" style="font-size: 11.5px; margin-left: 4px;">
                    Open actions and decisions for this project: <b>${nextProjectBase.actionStats.open}</b> open action${nextProjectBase.actionStats.open === 1 ? '' : 's'} · <b>${nextProjectBase.decisionStats.total}</b> validated decision${nextProjectBase.decisionStats.total === 1 ? '' : 's'}
                  </span>
                </div>
              </div>
              <button class="btn sm" data-open-project="${this._escape(nextProjectBase.projectId)}" style="font-size: 11px; padding: 2px 8px; flex-shrink: 0; margin-left: 8px;">
                View Project Hub
              </button>
            </div>

            <!-- Workstream Context (from Notes) -->
            ${((nextProjectBase.openPoints && nextProjectBase.openPoints.length > 0) || (nextProjectBase.decisionRegister && nextProjectBase.decisionRegister.length > 0)) ? `
              <div class="card" style="margin-top: 8px; padding: 10px 12px; background: var(--card); border: 1px solid var(--border); border-radius: var(--r-sm);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                  <span style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: var(--pink-600);">Workstream Context (from Notes)</span>
                  <span class="sub" style="font-size: 10.5px;">Single Source of Truth</span>
                </div>

                ${(nextProjectBase.openPoints && nextProjectBase.openPoints.length > 0) ? `
                  <div style="margin-bottom: 8px;">
                    <div style="font-size: 11px; font-weight: 600; margin-bottom: 4px; color: var(--foreground);">Open Points:</div>
                    <div style="display: flex; flex-direction: column; gap: 4px;">
                      ${nextProjectBase.openPoints.slice(0, 5).map(p => `
                        <div style="font-size: 11.5px; line-height: 1.35; display: flex; align-items: baseline; gap: 6px;">
                          <span class="badge" style="font-size: 9.5px; font-family: var(--font-mono); font-weight: 600; padding: 0 4px; flex-shrink: 0;">${this._escape(p.id)}</span>
                          <span style="flex: 1; min-width: 0;">${this._escape(p.point || p.description || '')}</span>
                          ${p.owner ? `<span class="chip-owner" style="font-size: 10px; padding: 0 4px; flex-shrink: 0;">${this._escape(p.owner)}</span>` : ''}
                        </div>
                      `).join('')}
                    </div>
                  </div>
                ` : ''}

                ${(nextProjectBase.decisionRegister && nextProjectBase.decisionRegister.length > 0) ? `
                  <div>
                    <div style="font-size: 11px; font-weight: 600; margin-bottom: 4px; color: var(--foreground);">Recent Validated Decisions:</div>
                    <div style="display: flex; flex-direction: column; gap: 4px;">
                      ${nextProjectBase.decisionRegister.slice(-3).reverse().map(d => `
                        <div style="font-size: 11.5px; line-height: 1.35; display: flex; align-items: baseline; gap: 6px;">
                          ${d.date ? `<span class="sub" style="font-size: 10.5px; font-family: var(--font-mono); flex-shrink: 0;">${this._escape(d.date)}:</span>` : ''}
                          <span style="flex: 1; min-width: 0;">${this._escape(d.statement || d.decision || '')}</span>
                          ${d.facility ? `<span class="badge" style="font-size: 9.5px; padding: 0 4px; flex-shrink: 0;">${this._escape(d.facility)}</span>` : ''}
                        </div>
                      `).join('')}
                    </div>
                  </div>
                ` : ''}
              </div>
            ` : ''}
          ` : ''}

          <div style="display: flex; gap: 8px; margin-top: 6px;">
            ${!nextPrep.agenda.ok ? `
              <button class="btn pink" data-open-prep="${nextMeeting.id}">Draft agenda</button>
            ` : !nextPrep.openActions.ok ? `
              <button class="btn pink" data-open-actions="${nextMeeting.id}">Review actions (${nextPrep.openActions.totalOpen})</button>
            ` : `
              <button class="btn pink" data-open-prep="${nextMeeting.id}">Open prep</button>
            `}
            <button class="btn" data-open-related="${nextMeeting.id}">View related</button>
          </div>
        </div>
      ` : ''}

      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
        <div style="display: flex; align-items: center; gap: 8px;">
          <div class="label" style="margin-bottom: 0;">
            Timeline · ${typeof formatLongDate === 'function' ? formatLongDate(this.currentDate) : this.currentDate}
          </div>
          <div style="display: inline-flex; align-items: center; gap: 2px;">
            <button class="btn sm" id="todayPrevDayBtn" title="Previous day" style="padding: 1px 6px; font-size: 11px; height: 20px;">‹</button>
            <button class="btn sm" id="todayCurrentDayBtn" title="Today" style="padding: 1px 6px; font-size: 10px; height: 20px;">Today</button>
            <button class="btn sm" id="todayNextDayBtn" title="Next day" style="padding: 1px 6px; font-size: 11px; height: 20px;">›</button>
          </div>
        </div>
        ${this.searchQuery ? `
          <div style="display: flex; align-items: center; gap: 6px;">
            <span class="sub" style="font-size: 12px;">Filtered by "${this._escape(this.searchQuery)}" (${timedEvents.length})</span>
            <button class="btn sm" id="clearFilterBtn" style="height: 22px; padding: 0 6px; font-size: 11px;">Clear</button>
          </div>
        ` : collectionPrep.total > 0 ? `
          <div style="display: flex; align-items: center; gap: 8px; font-size: 12px; color: var(--muted-foreground);">
            <span style="font-family: var(--font-mono);">${collectionPrep.preparedCount} of ${collectionPrep.total} prepared</span>
          </div>
        ` : ''}
      </div>

      <div class="day">
        ${timedEvents.length > 0 ? timedEvents.map(m => {
          const isSelected = m.id === this.selectedEventId;
          const isTraining = m.isTraining;
          const colorBar = isTraining ? 'oklch(0.76 0.18 154.1)' : m.client === 'Clariane' ? 'var(--pink-600)' : 'oklch(0.68 0.16 245)';
          const metaParts = [
            m.client,
            m.attendees && m.attendees.length ? `${m.attendees.length} attendee${m.attendees.length > 1 ? 's' : ''}` : null,
            m.link ? `Call (${m.link})` : null
          ].filter(Boolean);

          const mPrep = collectionPrep.evaluations.get(m.id);

          return `
            <button class="row ${isTraining ? 'training' : ''} ${isSelected ? 'sel' : ''}" data-event-id="${m.id}">
              <span class="t">${m.start}<br>${m.end}</span>
              <span class="bar" style="background: ${colorBar};"></span>
              <span>
                <div class="ttl">${this._escape(m.title)}</div>
                <div class="meta">${this._escape(metaParts.join(' · '))}</div>
              </span>
              ${m.stream === 'work' ? (mPrep ? `
                <span class="badge ${mPrep.missingCount === 0 ? 'ok' : 'warn'}" title="${mPrep.missingSummary}">
                  ${mPrep.missingCount === 0 ? 'Prepared' : `${mPrep.missingCount} missing`}
                </span>
              ` : `
                <span class="badge ${isSelected ? 'info' : ''}">Work</span>
              `) : isTraining ? `
                <span class="badge warn">ATHX Training</span>
              ` : `
                <span class="badge">Life</span>
              `}
            </button>
          `;
        }).join('') : `
          <div class="empty" style="padding: 40px 0;">
            ${Icons.calendar}
            <div style="margin-top: 8px;">No scheduled events matching current criteria.</div>
          </div>
        `}
      </div>
    `;

    this._bindEvents();
  }

  _bindEvents() {
    // Prev / Next day navigation
    this.container.querySelector('#todayPrevDayBtn')?.addEventListener('click', () => this.prevDay());
    this.container.querySelector('#todayCurrentDayBtn')?.addEventListener('click', () => this.goToday());
    this.container.querySelector('#todayNextDayBtn')?.addEventListener('click', () => this.nextDay());

    // Clear filter
    this.container.querySelector('#clearFilterBtn')?.addEventListener('click', () => {
      this.searchQuery = '';
      const input = document.querySelector('#quickSearch');
      if (input) input.value = '';
      this.render();
    });

    // Open prep button
    const openPrepBtn = this.container.querySelector('[data-open-prep]');
    if (openPrepBtn) {
      openPrepBtn.addEventListener('click', () => {
        const id = openPrepBtn.dataset.openPrep;
        if (id && this.onSelectMeeting) {
          this.onSelectMeeting(id, 'agenda');
        }
      });
    }

    // Open actions button
    const openActionsBtn = this.container.querySelector('[data-open-actions]');
    if (openActionsBtn) {
      openActionsBtn.addEventListener('click', () => {
        const id = openActionsBtn.dataset.openActions;
        if (id && this.onSelectMeeting) {
          this.onSelectMeeting(id, 'actions');
        }
      });
    }

    // View related button
    const openRelatedBtn = this.container.querySelector('[data-open-related]');
    if (openRelatedBtn) {
      openRelatedBtn.addEventListener('click', () => {
        const id = openRelatedBtn.dataset.openRelated;
        if (id && this.onSelectMeeting) {
          this.onSelectMeeting(id, 'related');
        }
      });
    }

    // Open project base button
    const openProjectBtn = this.container.querySelector('[data-open-project]');
    if (openProjectBtn) {
      openProjectBtn.addEventListener('click', () => {
        const projectId = openProjectBtn.dataset.openProject;
        if (this.onNavigateProject) {
          this.onNavigateProject(projectId);
        } else {
          window.location.hash = '#/projects';
        }
      });
    }

    // Timeline row click
    this.container.querySelectorAll('.row[data-event-id]').forEach(row => {
      row.addEventListener('click', () => {
        const id = row.dataset.eventId;
        this.selectedEventId = id;
        this.container.querySelectorAll('.row').forEach(r => r.classList.remove('sel'));
        row.classList.add('sel');
        if (this.onSelectMeeting) {
          this.onSelectMeeting(id);
        }
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
