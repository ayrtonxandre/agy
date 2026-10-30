/**
 * Meetings View Component
 * 
 * Searchable, filterable directory of all 259 calendar meetings.
 * Filters by search keyword, client, stream, and temporal horizon.
 */
import { Icons } from '../ui/icons.js';
import { PrepScoreCalculator } from '../model/prep_score.js';
import { getTodayDateStr } from '../model/date_utils.js';

export class MeetingsView {
  constructor({ container, store, onSelectMeeting }) {
    this.container = container;
    this.store = store;
    this.onSelectMeeting = onSelectMeeting;
    this.searchQuery = '';
    this.selectedClient = 'all';
    this.selectedStream = 'all';
    this.timeFilter = 'all'; // 'all' | 'upcoming' | 'past'
    this.selectedEventId = null;
  }

  setMode(mode) {
    this.selectedStream = mode;
    this.render();
  }

  setSelectedEvent(id) {
    this.selectedEventId = id;
    this.render();
  }

  setSearchQuery(q) {
    this.searchQuery = (q || '').trim().toLowerCase();
    this.render();
  }

  async render() {
    if (!this.container) return;

    let events = [...this.store.eventsCache];

    // Stream filter
    if (this.selectedStream === 'work') {
      events = events.filter(e => e.stream === 'work' && !e.isTraining);
    } else if (this.selectedStream === 'life') {
      events = events.filter(e => e.stream === 'life' || e.isTraining);
    }

    // Client filter
    if (this.selectedClient !== 'all') {
      events = events.filter(e => e.client === this.selectedClient);
    }

    // Time filter (relative to current date)
    const todayStr = typeof getTodayDateStr === 'function' ? getTodayDateStr() : new Date().toISOString().slice(0, 10);
    if (this.timeFilter === 'upcoming') {
      events = events.filter(e => e.date >= todayStr);
    } else if (this.timeFilter === 'past') {
      events = events.filter(e => e.date < todayStr);
    }

    // Text search
    if (this.searchQuery) {
      events = events.filter(e => {
        const text = `${e.title} ${e.client || ''} ${(e.attendees || []).join(' ')} ${(e.tags || []).join(' ')} ${e.series || ''}`.toLowerCase();
        return text.includes(this.searchQuery);
      });
    }

    // Sort: earliest date first for upcoming, latest first for past/all
    events.sort((a, b) => {
      const cmp = a.date.localeCompare(b.date);
      if (cmp !== 0) return cmp;
      return (a.start || '').localeCompare(b.start || '');
    });

    // Unique clients for filter pills
    const allClients = Array.from(new Set(this.store.eventsCache.map(e => e.client).filter(Boolean)));

    this.container.innerHTML = `
      <div class="view-header" style="margin-bottom: 16px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; flex-wrap: wrap; gap: 8px;">
          <div>
            <h2 style="font: 600 20px/1.2 var(--font-sans); margin: 0 0 2px;">Meetings Directory</h2>
            <div class="sub" style="font-size: 12px;">Showing ${events.length} of ${this.store.eventsCache.length} calendar meetings</div>
          </div>
          <div style="display: flex; gap: 6px;">
            <select id="timeFilterSelect" class="in" style="width: 120px; font-size: 12px;">
              <option value="all" ${this.timeFilter === 'all' ? 'selected' : ''}>All Dates</option>
              <option value="upcoming" ${this.timeFilter === 'upcoming' ? 'selected' : ''}>Upcoming</option>
              <option value="past" ${this.timeFilter === 'past' ? 'selected' : ''}>Past Sessions</option>
            </select>
          </div>
        </div>

        <div style="display: flex; gap: 8px; margin-bottom: 12px;">
          <div style="position: relative; flex: 1;">
            <input class="in" id="meetingsSearchInput" placeholder="Filter by title, client, attendee, series..." value="${this._escape(this.searchQuery)}" style="width: 100%; padding-left: 30px;" />
            <span style="position: absolute; left: 10px; top: 8px; color: var(--muted-foreground);">${Icons.search}</span>
          </div>
        </div>

        <div style="display: flex; gap: 6px; flex-wrap: wrap; align-items: center;">
          <span style="font-size: 11px; text-transform: uppercase; font-weight: 600; color: var(--muted-foreground); margin-right: 4px;">Client:</span>
          <button class="badge ${this.selectedClient === 'all' ? 'on' : ''}" data-client="all" style="cursor: pointer;">All</button>
          ${allClients.map(c => `
            <button class="badge ${this.selectedClient === c ? 'on' : ''}" data-client="${this._escape(c)}" style="cursor: pointer;">
              ${this._escape(c)}
            </button>
          `).join('')}
        </div>
      </div>

      <div class="meetings-list" style="display: flex; flex-direction: column; gap: 6px;">
        ${events.length > 0 ? events.map(e => {
          const isSelected = e.id === this.selectedEventId;
          const isToday = e.date === todayStr;
          return `
            <div class="meeting-row ${isSelected ? 'selected' : ''}" data-event-id="${e.id}" style="
              display: flex;
              align-items: center;
              gap: 12px;
              padding: 10px 14px;
              border: 1px solid ${isSelected ? 'var(--pink-600)' : 'var(--border)'};
              border-radius: var(--r-md);
              background: ${isSelected ? 'color-mix(in oklab, var(--pink-600) 6%, var(--background))' : 'var(--background)'};
              cursor: pointer;
              transition: border-color 0.15s ease;
            ">
              <div style="min-width: 95px; font-family: var(--font-mono); font-size: 11.5px; color: var(--muted-foreground);">
                <div style="font-weight: 600; color: ${isToday ? 'var(--pink-600)' : 'var(--foreground)'};">${e.date}</div>
                <div>${e.start}–${e.end}</div>
              </div>

              <div style="flex: 1; min-width: 0;">
                <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 2px;">
                  <b style="font-size: 13.5px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${this._escape(e.title)}</b>
                  ${e.client ? `<span class="badge" style="font-size: 9.5px; padding: 1px 5px;">${this._escape(e.client)}</span>` : ''}
                  ${e.isAllDay ? `<span class="badge" style="font-size: 9.5px;">All Day</span>` : ''}
                </div>
                <div style="font-size: 11.5px; color: var(--muted-foreground); overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                  ${e.attendees && e.attendees.length ? `${e.attendees.join(', ')}` : 'Standalone session'}
                  ${e.series ? ` · Series: ${this._escape(e.series.slice(0, 16))}...` : ''}
                </div>
              </div>

              <div style="display: flex; align-items: center; gap: 8px;">
                ${e.link ? `<span title="Video call">${Icons.video}</span>` : ''}
                <button class="btn sm" data-open-id="${e.id}">Open</button>
              </div>
            </div>
          `;
        }).join('') : `
          <div class="empty" style="padding: 40px 0;">
            No meetings matched your search criteria.
          </div>
        `}
      </div>
    `;

    this._bindEvents();
  }

  _bindEvents() {
    const searchInput = this.container.querySelector('#meetingsSearchInput');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value.trim().toLowerCase();
        this.render();
      });
    }

    const timeSelect = this.container.querySelector('#timeFilterSelect');
    if (timeSelect) {
      timeSelect.addEventListener('change', (e) => {
        this.timeFilter = e.target.value;
        this.render();
      });
    }

    this.container.querySelectorAll('[data-client]').forEach(btn => {
      btn.addEventListener('click', () => {
        this.selectedClient = btn.dataset.client;
        this.render();
      });
    });

    this.container.querySelectorAll('[data-event-id]').forEach(el => {
      el.addEventListener('click', () => {
        const id = el.dataset.eventId;
        if (id && this.onSelectMeeting) {
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
