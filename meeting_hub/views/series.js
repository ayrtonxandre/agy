/**
 * Series & Links View Component
 * 
 * Interactive timeline and graph representation of recurring meeting series
 * and cross-linked meeting webs.
 */
import { Icons } from '../ui/icons.js';
import { getTodayDateStr } from '../model/date_utils.js';

export class SeriesView {
  constructor({ container, store, onSelectMeeting }) {
    this.container = container;
    this.store = store;
    this.onSelectMeeting = onSelectMeeting;
    this.selectedSeriesId = null;
    this.searchQuery = '';
  }

  setSearchQuery(q) {
    this.searchQuery = (q || '').trim().toLowerCase();
    this.render();
  }

  async render() {
    if (!this.container) return;

    // Build series groups from events cache
    const seriesMap = new Map();
    for (const ev of this.store.eventsCache) {
      if (!ev.series) continue;
      if (!seriesMap.has(ev.series)) {
        seriesMap.set(ev.series, {
          seriesId: ev.series,
          title: ev.title,
          client: ev.client || 'Internal',
          events: []
        });
      }
      seriesMap.get(ev.series).events.push(ev);
    }

    const seriesList = Array.from(seriesMap.values());
    // Sort series by number of events descending
    seriesList.sort((a, b) => b.events.length - a.events.length);

    // Filter series list
    let filteredSeries = seriesList;
    if (this.searchQuery) {
      filteredSeries = filteredSeries.filter(s =>
        s.title.toLowerCase().includes(this.searchQuery) ||
        s.client.toLowerCase().includes(this.searchQuery) ||
        s.seriesId.toLowerCase().includes(this.searchQuery)
      );
    }

    // Default select the top series if none selected
    if (!this.selectedSeriesId && filteredSeries.length > 0) {
      this.selectedSeriesId = filteredSeries[0].seriesId;
    }

    const activeSeries = seriesMap.get(this.selectedSeriesId) || filteredSeries[0];
    const activeEvents = activeSeries ? [...activeSeries.events].sort((a, b) => a.date.localeCompare(b.date)) : [];

    const todayStr = typeof getTodayDateStr === 'function' ? getTodayDateStr() : new Date().toISOString().slice(0, 10);

    this.container.innerHTML = `
      <div class="view-header" style="margin-bottom: 16px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
          <div>
            <h2 style="font: 600 20px/1.2 var(--font-sans); margin: 0 0 2px;">Series &amp; Meeting Links</h2>
            <div class="sub" style="font-size: 12px;">Visual timeline of recurring series and linked session lineages</div>
          </div>
          <span class="badge" style="font-weight: 600;">${seriesList.length} Series Total</span>
        </div>
      </div>

      <div class="series-layout" style="display: grid; grid-template-columns: 280px 1fr; gap: 16px; min-height: 520px;">
        <!-- Left: Series Directory -->
        <div class="series-sidebar" style="border: 1px solid var(--border); border-radius: var(--r-md); background: var(--background); display: flex; flex-direction: column; overflow: hidden;">
          <div style="padding: 10px; border-bottom: 1px solid var(--border);">
            <div style="position: relative;">
              <input class="in" id="seriesSearchInput" placeholder="Search series..." value="${this._escape(this.searchQuery)}" style="width: 100%; font-size: 12px; padding-left: 28px;" />
              <span style="position: absolute; left: 8px; top: 7px; color: var(--muted-foreground);">${Icons.search}</span>
            </div>
          </div>

          <div class="series-items-list" style="overflow-y: auto; flex: 1; display: flex; flex-direction: column; gap: 2px; padding: 6px;">
            ${filteredSeries.map(s => {
              const isSelected = s.seriesId === this.selectedSeriesId;
              const dateSpan = `${s.events[0]?.date || ''} – ${s.events[s.events.length - 1]?.date || ''}`;
              return `
                <div class="series-nav-item ${isSelected ? 'selected' : ''}" data-select-series="${s.seriesId}" style="
                  padding: 8px 10px;
                  border-radius: var(--r-sm);
                  border: 1px solid ${isSelected ? 'var(--pink-600)' : 'transparent'};
                  background: ${isSelected ? 'color-mix(in oklab, var(--pink-600) 8%, var(--muted))' : 'transparent'};
                  cursor: pointer;
                  transition: background 0.15s ease;
                ">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2px;">
                    <b style="font-size: 12.5px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 180px;">${this._escape(s.title)}</b>
                    <span class="badge" style="font-size: 9px; padding: 1px 4px;">${s.events.length}</span>
                  </div>
                  <div style="font-size: 10.5px; color: var(--muted-foreground); display: flex; justify-content: space-between;">
                    <span>${this._escape(s.client)}</span>
                    <span style="font-family: var(--font-mono);">${dateSpan}</span>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <!-- Right: Timeline Graph of Active Series -->
        <div class="series-timeline-container" style="border: 1px solid var(--border); border-radius: var(--r-md); background: var(--background); padding: 16px; overflow-y: auto;">
          ${activeSeries ? `
            <div style="margin-bottom: 16px; padding-bottom: 12px; border-bottom: 1px solid var(--border); display: flex; justify-content: space-between; align-items: flex-start;">
              <div>
                <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 4px;">
                  <h3 style="font: 600 18px/1.2 var(--font-sans); margin: 0;">${this._escape(activeSeries.title)}</h3>
                  <span class="badge">${this._escape(activeSeries.client)}</span>
                </div>
                <div class="sub" style="font-size: 12px;">
                  Series ID: <code>${this._escape(activeSeries.seriesId)}</code> · ${activeEvents.length} occurrences
                </div>
              </div>
            </div>

            <!-- Vertical Timeline Chain -->
            <div class="series-chain" style="position: relative; padding-left: 28px; display: flex; flex-direction: column; gap: 14px;">
              <div style="position: absolute; left: 10px; top: 8px; bottom: 8px; width: 2px; background: var(--border);"></div>

              ${activeEvents.map(ev => {
                const isPast = ev.date < todayStr;
                const isToday = ev.date === todayStr;
                const isFuture = ev.date > todayStr;
                return `
                  <div class="timeline-node" style="position: relative;">
                    <!-- Dot indicator -->
                    <div style="
                      position: absolute;
                      left: -24px;
                      top: 10px;
                      width: 12px;
                      height: 12px;
                      border-radius: 50%;
                      background: ${isToday ? 'var(--pink-600)' : (isPast ? 'var(--ok)' : 'var(--muted-foreground)')};
                      border: 2px solid var(--background);
                      box-shadow: 0 0 0 2px ${isToday ? 'var(--pink-600)' : 'var(--border)'};
                    "></div>

                    <!-- Session card -->
                    <div class="card" style="padding: 10px 14px; margin: 0; background: ${isToday ? 'color-mix(in oklab, var(--pink-600) 4%, var(--background))' : 'var(--background)'};">
                      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                        <div style="display: flex; align-items: center; gap: 8px;">
                          <span style="font-family: var(--font-mono); font-size: 12px; font-weight: 600; color: ${isToday ? 'var(--pink-600)' : 'var(--foreground)'};">
                            ${ev.date}
                          </span>
                          <span style="font-family: var(--font-mono); font-size: 11px; color: var(--muted-foreground);">${ev.start}–${ev.end}</span>
                          ${isToday ? `<span class="badge pink" style="font-size: 9px; font-weight: 700;">TODAY</span>` : ''}
                          ${isPast ? `<span class="badge ok" style="font-size: 9px;">COMPLETED</span>` : ''}
                        </div>
                        <button class="btn sm" data-jump-meeting="${ev.id}">
                          Open Session
                        </button>
                      </div>

                      <div style="font-size: 13.5px; font-weight: 600; margin-bottom: 2px;">
                        ${this._escape(ev.title)}
                      </div>

                      <div style="font-size: 11.5px; color: var(--muted-foreground);">
                        ${ev.attendees && ev.attendees.length ? `Attendees: ${ev.attendees.join(', ')}` : 'Standalone session'}
                      </div>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          ` : `
            <div class="empty">Select a series on the left to inspect its timeline.</div>
          `}
        </div>
      </div>
    `;

    this._bindEvents();
  }

  _bindEvents() {
    const searchInput = this.container.querySelector('#seriesSearchInput');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value.trim().toLowerCase();
        this.render();
      });
    }

    this.container.querySelectorAll('[data-select-series]').forEach(el => {
      el.addEventListener('click', () => {
        this.selectedSeriesId = el.dataset.selectSeries;
        this.render();
      });
    });

    this.container.querySelectorAll('[data-jump-meeting]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.jumpMeeting;
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
