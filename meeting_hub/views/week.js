/**
 * Week View Component
 * 
 * Multi-day calendar grid with:
 * 1. Thin all-day strip above columns.
 * 2. Day columns with time-ordered meetings.
 * 3. Weekly Review & KPIs panel (hours in meetings, prep completion rate, client breakdown).
 * 4. Mode filtering (Work / Life / All) with training overlay in Life mode.
 */
import { Icons } from '../ui/icons.js';
import { PrepScoreCalculator } from '../model/prep_score.js';

export class WeekView {
  constructor({ container, store, onSelectMeeting }) {
    this.container = container;
    this.store = store;
    this.onSelectMeeting = onSelectMeeting;
    this.selectedEventId = null;
    this.currentDate = '2026-10-28';
    this.weekStart = this._getMonday('2026-10-28');
    this.currentMode = 'all';
    this.showReview = true;
  }

  setDate(date) {
    this.currentDate = date;
    this.weekStart = this._getMonday(date);
    this.render();
  }

  setMode(mode) {
    this.currentMode = mode;
    this.render();
  }

  setSelectedEvent(id) {
    this.selectedEventId = id;
    this.render();
  }

  prevWeek() {
    const d = new Date(this.weekStart);
    d.setDate(d.getDate() - 7);
    this.weekStart = d.toISOString().slice(0, 10);
    this.render();
  }

  nextWeek() {
    const d = new Date(this.weekStart);
    d.setDate(d.getDate() + 7);
    this.weekStart = d.toISOString().slice(0, 10);
    this.render();
  }

  goToday() {
    this.currentDate = '2026-10-28';
    this.weekStart = this._getMonday('2026-10-28');
    this.render();
  }

  async render() {
    if (!this.container) return;

    const days = this._getWeekDays(this.weekStart);
    const weekEvents = [];
    const dayEventsMap = {};

    for (const d of days) {
      const evs = this.store.getEventsByDate(d.dateStr, 'all').filter(ev => {
        if (this.currentMode === 'work') return ev.stream === 'work' && !ev.isTraining;
        if (this.currentMode === 'life') return ev.stream === 'life' || ev.isTraining;
        return true;
      });
      dayEventsMap[d.dateStr] = evs;
      weekEvents.push(...evs);
    }

    // Dynamic Weekly Review KPIs
    const timedMeetings = weekEvents.filter(e => !e.isAllDay && !e.isTraining);
    const totalMinutes = timedMeetings.reduce((acc, e) => acc + (e.durationMin || 45), 0);
    const totalHours = Math.round((totalMinutes / 60) * 10) / 10;
    
    // Prep metrics across the week
    const prepCollection = await PrepScoreCalculator.computeCollectionPrep(timedMeetings, this.store);
    
    // Client breakdown
    const clientCounts = {};
    timedMeetings.forEach(e => {
      const c = e.client || 'Internal';
      clientCounts[c] = (clientCounts[c] || 0) + 1;
    });

    const weekRangeLabel = `${days[0].dayNum} ${days[0].monthShort} – ${days[6].dayNum} ${days[6].monthShort} ${days[6].year}`;

    this.container.innerHTML = `
      <div class="view-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; flex-wrap: wrap; gap: 8px;">
        <div style="display: flex; align-items: center; gap: 8px;">
          <h2 style="font: 600 18px/1.2 var(--font-sans); margin: 0;">${weekRangeLabel}</h2>
          <div style="display: flex; gap: 4px;">
            <button class="btn sm" id="prevWeekBtn" title="Previous week">${Icons.arrowRight ? '<svg class="i" viewBox="0 0 24 24" style="transform: rotate(180deg);"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>' : '‹'}</button>
            <button class="btn sm" id="todayWeekBtn">Today</button>
            <button class="btn sm" id="nextWeekBtn" title="Next week">${Icons.arrowRight || '›'}</button>
          </div>
        </div>
        <button class="btn sm ${this.showReview ? 'pink' : ''}" id="toggleReviewBtn">
          ${Icons.activity} ${this.showReview ? 'Hide Weekly Review' : 'Weekly Review & KPIs'}
        </button>
      </div>

      ${this.showReview ? `
        <div class="card" style="margin-bottom: 16px; padding: 14px 16px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
            <span class="label">Weekly Review &amp; Meeting Health</span>
            <span class="sub" style="font-size: 11px;">Computed across ${timedMeetings.length} sessions</span>
          </div>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 12px;">
            <div class="kpi-cell">
              <div class="kpi-num">${totalHours}h</div>
              <div class="kpi-sub">Total Meeting Time</div>
            </div>
            <div class="kpi-cell">
              <div class="kpi-num">${timedMeetings.length}</div>
              <div class="kpi-sub">Scheduled Meetings</div>
            </div>
            <div class="kpi-cell">
              <div class="kpi-num" style="color: ${prepCollection.averagePercent >= 70 ? 'var(--ok)' : 'var(--warn)'};">
                ${prepCollection.averagePercent}%
              </div>
              <div class="kpi-sub">Prep Rate (${prepCollection.preparedCount}/${prepCollection.total})</div>
            </div>
            <div class="kpi-cell">
              <div class="kpi-num" style="font-size: 13px; font-weight: 600; line-height: 1.4; display: flex; flex-direction: column; justify-content: center; height: 100%;">
                ${Object.entries(clientCounts).map(([client, count]) => `
                  <span>${this._escape(client)}: <b style="color: var(--pink-600);">${count}</b></span>
                `).join('')}
              </div>
              <div class="kpi-sub">Client Allocation</div>
            </div>
          </div>
        </div>
      ` : ''}

      <!-- All-Day Events Thin Strip -->
      <div class="all-day-strip" style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 6px; margin-bottom: 10px;">
        ${days.map(d => {
          const allDayEvs = (dayEventsMap[d.dateStr] || []).filter(e => e.isAllDay);
          return `
            <div style="min-height: 24px; padding: 4px 6px; border-radius: var(--r-sm); background: var(--muted); border: 1px solid var(--border); font-size: 11px;">
              ${allDayEvs.map(e => `
                <div style="font-weight: 500; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${this._escape(e.title)}">
                  ${this._escape(e.title)}
                </div>
              `).join('')}
            </div>
          `;
        }).join('')}
      </div>

      <!-- 7-Day Columns Grid -->
      <div class="week-grid" style="display: grid; grid-template-columns: repeat(7, minmax(130px, 1fr)); gap: 8px; overflow-x: auto; padding-bottom: 16px;">
        ${days.map(d => {
          const evs = (dayEventsMap[d.dateStr] || []).filter(e => !e.isAllDay);
          const isToday = d.dateStr === '2026-10-28';
          return `
            <div class="week-day-col ${isToday ? 'today-col' : ''}" style="border: 1px solid ${isToday ? 'var(--pink-600)' : 'var(--border)'}; border-radius: var(--r-md); background: var(--background); padding: 8px; display: flex; flex-direction: column; min-height: 480px;">
              <div class="week-day-header" style="padding-bottom: 8px; margin-bottom: 8px; border-bottom: 1px solid var(--border); text-align: center;">
                <div style="font-size: 11px; text-transform: uppercase; color: var(--muted-foreground); font-weight: 600;">${d.dayName}</div>
                <div style="font-size: 18px; font-weight: 700; color: ${isToday ? 'var(--pink-600)' : 'var(--foreground)'};">${d.dayNum}</div>
              </div>

              <div class="week-day-events" style="display: flex; flex-direction: column; gap: 6px; flex: 1;">
                ${evs.length > 0 ? evs.map(e => {
                  const isSelected = e.id === this.selectedEventId;
                  return `
                    <div class="week-event-card ${isSelected ? 'selected' : ''} ${e.isTraining ? 'training' : ''}" data-event-id="${e.id}" style="
                      padding: 8px;
                      border-radius: var(--r-sm);
                      border: 1px solid ${isSelected ? 'var(--pink-600)' : 'var(--border)'};
                      background: ${isSelected ? 'color-mix(in oklab, var(--pink-600) 8%, var(--muted))' : 'var(--muted)'};
                      cursor: pointer;
                      transition: border-color 0.15s ease;
                    ">
                      <div style="display: flex; justify-content: space-between; align-items: center; font-size: 10.5px; font-family: var(--font-mono); color: var(--muted-foreground); margin-bottom: 4px;">
                        <span>${e.start}–${e.end}</span>
                        ${e.client ? `<span class="badge" style="font-size: 9px; padding: 1px 4px;">${this._escape(e.client)}</span>` : ''}
                      </div>
                      <div style="font-size: 12px; font-weight: 600; line-height: 1.25; margin-bottom: 4px;">
                        ${this._escape(e.title)}
                      </div>
                      ${e.series ? `<div style="font-size: 10px; color: var(--muted-foreground); margin-bottom: 2px;">Series: ${this._escape(e.series.slice(0, 10))}...</div>` : ''}
                    </div>
                  `;
                }).join('') : `
                  <div style="padding: 20px 0; text-align: center; color: var(--muted-foreground); font-size: 11px;">
                    No meetings
                  </div>
                `}
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;

    this._bindEvents();
  }

  _bindEvents() {
    this.container.querySelector('#prevWeekBtn')?.addEventListener('click', () => this.prevWeek());
    this.container.querySelector('#nextWeekBtn')?.addEventListener('click', () => this.nextWeek());
    this.container.querySelector('#todayWeekBtn')?.addEventListener('click', () => this.goToday());
    this.container.querySelector('#toggleReviewBtn')?.addEventListener('click', () => {
      this.showReview = !this.showReview;
      this.render();
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

  _getMonday(dateStr) {
    const d = new Date(dateStr);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    d.setDate(diff);
    return d.toISOString().slice(0, 10);
  }

  _getWeekDays(mondayStr) {
    const res = [];
    const base = new Date(mondayStr);
    const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    for (let i = 0; i < 7; i++) {
      const d = new Date(base);
      d.setDate(base.getDate() + i);
      const dateStr = d.toISOString().slice(0, 10);
      res.push({
        dateStr,
        dayNum: d.getDate(),
        dayName: dayNames[i],
        monthShort: monthNames[d.getMonth()],
        year: d.getFullYear()
      });
    }
    return res;
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
