/**
 * Today View Component
 * 
 * Renders the Today agenda timeline with:
 * 1. Thin all-day event strip above the timeline.
 * 2. Next up card with computed prep status (agenda, last minutes, open actions, attendees).
 * 3. Daily timeline with Life-mode training overlay.
 * 4. Step 3 Keyboard-First navigation helpers: getVisibleTimedEvents(), selectNextMeeting(), selectPreviousMeeting().
 * 5. Instant search filtering with `/` shortcut.
 */
import { Icons } from '../ui/icons.js';
import { PrepScoreCalculator } from '../model/prep_score.js';

export class TodayView {
  constructor({ container, store, onSelectMeeting }) {
    this.container = container;
    this.store = store;
    this.onSelectMeeting = onSelectMeeting;
    this.selectedEventId = null;
    this.currentDate = '2026-10-28';
    this.currentMode = 'all'; // 'all' | 'work' | 'life'
    this.searchQuery = '';
  }

  setDate(date) {
    this.currentDate = date;
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

    // Compute dynamic prep score across all visible work meetings
    const collectionPrep = await PrepScoreCalculator.computeCollectionPrep(workMeetings, this.store);

    // Dynamic prep evaluation for Next up meeting
    let nextPrep = null;
    if (nextMeeting) {
      const data = await this.store.getMeetingData(nextMeeting.id);
      const links = await this.store.suggestLinks(nextMeeting);
      nextPrep = PrepScoreCalculator.computeMeetingPrep(nextMeeting, data, links);

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
          <div style="display: flex; gap: 8px; align-items: center;">
            <span class="label">Next up</span>
            <span class="badge info">${nextMeeting.start}–${nextMeeting.end}</span>
            ${nextMeeting.client ? `<span class="badge">${this._escape(nextMeeting.client)}</span>` : ''}
            <span class="badge ${nextPrep.badgeClass}" style="margin-left: auto;">${nextPrep.badgeText} · ${nextPrep.scorePercent}%</span>
          </div>

          <h2>${this._escape(nextMeeting.title)}</h2>

          <div class="prep-score-row">
            <div class="prep-score-label">
              <b>Prep Score</b>
              <span>${nextPrep.scorePercent}% (${nextPrep.metCount} of ${nextPrep.totalCount} criteria met)</span>
            </div>
            <div class="prep-bar-track">
              <div class="prep-bar-fill ${nextPrep.badgeClass}" style="width: ${nextPrep.scorePercent}%;"></div>
            </div>
          </div>

          <div class="prep">
            <div class="${nextPrep.agenda.ok ? '' : 'miss'}">
              <b>Agenda</b>
              <span>${this._escape(nextPrep.agenda.label)}</span>
              <span class="sub" style="font-size: 11px;">${this._escape(nextPrep.agenda.detail)}</span>
            </div>
            <div class="${nextPrep.lastMinutes.ok ? '' : 'miss'}">
              <b>Last minutes</b>
              <span>${this._escape(nextPrep.lastMinutes.label)}</span>
              <span class="sub" style="font-size: 11px;">${this._escape(nextPrep.lastMinutes.detail)}</span>
            </div>
            <div class="${nextPrep.openActions.ok ? '' : 'miss'}">
              <b>Open actions</b>
              <span>${this._escape(nextPrep.openActions.label)}</span>
              <span class="sub" style="font-size: 11px;">${this._escape(nextPrep.openActions.detail)}</span>
            </div>
            <div>
              <b>People</b>
              <span>${nextPrep.people.label}</span>
              <span class="sub" style="font-size: 11px;">${this._escape(nextMeeting.client || 'Work stream')}</span>
            </div>
          </div>

          <div style="display: flex; gap: 8px; margin-top: 4px;">
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
        <div class="label" style="margin-bottom: 0;">
          Timeline · Wednesday 28 October 2026
        </div>
        ${this.searchQuery ? `
          <div style="display: flex; align-items: center; gap: 6px;">
            <span class="sub" style="font-size: 12px;">Filtered by "${this._escape(this.searchQuery)}" (${timedEvents.length})</span>
            <button class="btn sm" id="clearFilterBtn" style="height: 22px; padding: 0 6px; font-size: 11px;">Clear</button>
          </div>
        ` : collectionPrep.total > 0 ? `
          <div style="display: flex; align-items: center; gap: 8px; font-size: 12px; color: var(--muted-foreground);">
            <span style="font-family: var(--font-mono);">Day Prep: ${collectionPrep.preparedCount}/${collectionPrep.total} prepared (${collectionPrep.averagePercent}%)</span>
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
                <span class="badge ${mPrep.badgeClass}" title="Prep score: ${mPrep.scorePercent}% (${mPrep.metCount}/${mPrep.totalCount} criteria met)">
                  ${mPrep.badgeText}
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
          <div class="empty">No scheduled meetings matching your filter for this mode.</div>
        `}
      </div>
    `;

    this._bindEvents();
  }

  _bindEvents() {
    // Clear search filter
    this.container.querySelector('#clearFilterBtn')?.addEventListener('click', () => {
      this.searchQuery = '';
      const searchIn = document.querySelector('#quickSearch');
      if (searchIn) searchIn.value = '';
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
