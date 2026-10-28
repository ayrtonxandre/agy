/**
 * Open Actions View Component
 * 
 * Aggregates all open action items across all meetings,
 * grouped by client (Artefact, Clariane, Internal, etc.).
 * Allows inline completion toggling, filtering by owner, and direct navigation.
 */
import { Icons } from '../ui/icons.js';

export class ActionsView {
  constructor({ container, store, onSelectMeeting }) {
    this.container = container;
    this.store = store;
    this.onSelectMeeting = onSelectMeeting;
    this.ownerFilter = 'all'; // 'all' | 'me'
    this.statusFilter = 'open'; // 'open' | 'all'
    this.searchQuery = '';
  }

  setSearchQuery(q) {
    this.searchQuery = (q || '').trim().toLowerCase();
    this.render();
  }

  async render() {
    if (!this.container) return;

    // Fetch all meeting notes records
    const allNotes = await this.store.db.getAll('meeting_data');
    const eventsMap = new Map(this.store.eventsCache.map(e => [e.id, e]));

    const aggregatedItems = [];

    for (const note of allNotes) {
      const event = eventsMap.get(note.id);
      const items = Array.isArray(note.items) ? note.items : [];
      for (const item of items) {
        aggregatedItems.push({
          ...item,
          meetingId: note.id,
          meetingTitle: event ? event.title : 'Unassigned Meeting',
          meetingDate: event ? event.date : 'Unknown Date',
          client: (event && event.client) ? event.client : 'Internal'
        });
      }
    }

    // Filter items
    let filtered = aggregatedItems;
    if (this.statusFilter === 'open') {
      filtered = filtered.filter(i => !i.done);
    }
    if (this.ownerFilter === 'me') {
      filtered = filtered.filter(i => (i.owner || '').toLowerCase() === 'me' || (i.owner || '').includes('Ayrton'));
    }
    if (this.searchQuery) {
      filtered = filtered.filter(i => {
        const text = `${i.text} ${i.owner || ''} ${i.client} ${i.meetingTitle}`.toLowerCase();
        return text.includes(this.searchQuery);
      });
    }

    // Group by Client
    const groups = {};
    for (const item of filtered) {
      const client = item.client || 'Internal';
      if (!groups[client]) groups[client] = [];
      groups[client].push(item);
    }

    const totalOpen = aggregatedItems.filter(i => !i.done && i.kind === 'action').length;
    const totalDone = aggregatedItems.filter(i => i.done).length;

    this.container.innerHTML = `
      <div class="view-header" style="margin-bottom: 16px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; flex-wrap: wrap; gap: 8px;">
          <div>
            <h2 style="font: 600 20px/1.2 var(--font-sans); margin: 0 0 2px;">Open Actions by Client</h2>
            <div class="sub" style="font-size: 12px;">${totalOpen} open actions across all client engagements</div>
          </div>
          <div style="display: flex; gap: 6px;">
            <button class="btn sm ${this.statusFilter === 'open' ? 'pink' : ''}" id="toggleStatusOpenBtn">Open Only</button>
            <button class="btn sm ${this.statusFilter === 'all' ? 'pink' : ''}" id="toggleStatusAllBtn">All Items (${aggregatedItems.length})</button>
            <button class="btn sm ${this.ownerFilter === 'me' ? 'pink' : ''}" id="toggleOwnerMeBtn">Assigned to Me</button>
          </div>
        </div>

        <div style="position: relative; margin-bottom: 14px;">
          <input class="in" id="actionsSearchInput" placeholder="Filter actions by text, owner, meeting..." value="${this._escape(this.searchQuery)}" style="width: 100%; padding-left: 30px;" />
          <span style="position: absolute; left: 10px; top: 8px; color: var(--muted-foreground);">${Icons.search}</span>
        </div>
      </div>

      <div class="client-actions-groups" style="display: flex; flex-direction: column; gap: 16px;">
        ${Object.keys(groups).length > 0 ? Object.entries(groups).map(([client, items]) => {
          const clientOpenCount = items.filter(i => !i.done).length;
          return `
            <div class="card" style="padding: 14px 16px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 1px solid var(--border);">
                <div style="display: flex; align-items: center; gap: 8px;">
                  <span class="badge" style="font-weight: 600; font-size: 11px;">${this._escape(client)}</span>
                  <span style="font-size: 12.5px; font-weight: 600;">${items.length} item${items.length > 1 ? 's' : ''}</span>
                </div>
                <span style="font-size: 11.5px; color: ${clientOpenCount > 0 ? 'var(--pink-600)' : 'var(--ok)'}; font-weight: 600;">
                  ${clientOpenCount} open
                </span>
              </div>

              <div style="display: flex; flex-direction: column; gap: 8px;">
                ${items.map(item => `
                  <div class="item" style="border: 1px solid var(--border); border-radius: var(--r-sm); padding: 8px 10px; background: var(--background);">
                    <button class="item-check-btn ${item.done ? 'checked' : ''}" data-item-id="${item.id}" data-meeting-id="${item.meetingId}" title="${item.done ? 'Mark open' : 'Mark done'}">
                      ${item.done ? Icons.check : ''}
                    </button>
                    <span class="kind-badge ${item.kind}">${item.kind}</span>
                    <div class="item-body">
                      <span class="tx ${item.done ? 'done' : ''}">${this._escape(item.text)}</span>
                      <div class="item-meta" style="margin-top: 4px;">
                        ${item.owner ? `<span class="chip-owner">${this._escape(item.owner)}</span>` : ''}
                        ${item.dueDate ? `<span class="chip-due">${Icons.clock} ${item.dueDate}</span>` : ''}
                        <button class="btn sm" data-nav-meeting="${item.meetingId}" style="padding: 1px 6px; font-size: 10.5px; margin-left: 4px;">
                          ${this._escape(item.meetingTitle)} (${item.meetingDate})
                        </button>
                      </div>
                    </div>
                    <button class="btn-icon delete-action-btn" data-item-id="${item.id}" data-meeting-id="${item.meetingId}" title="Delete action">
                      ${Icons.trash}
                    </button>
                  </div>
                `).join('')}
              </div>
            </div>
          `;
        }).join('') : `
          <div class="empty" style="padding: 40px 0;">
            No open actions found. Walk out of meetings with actions captured to populate this list.
          </div>
        `}
      </div>
    `;

    this._bindEvents();
  }

  _bindEvents() {
    this.container.querySelector('#toggleStatusOpenBtn')?.addEventListener('click', () => {
      this.statusFilter = 'open';
      this.render();
    });
    this.container.querySelector('#toggleStatusAllBtn')?.addEventListener('click', () => {
      this.statusFilter = 'all';
      this.render();
    });
    this.container.querySelector('#toggleOwnerMeBtn')?.addEventListener('click', () => {
      this.ownerFilter = this.ownerFilter === 'me' ? 'all' : 'me';
      this.render();
    });

    const searchInput = this.container.querySelector('#actionsSearchInput');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value.trim().toLowerCase();
        this.render();
      });
    }

    // Toggle item completion
    this.container.querySelectorAll('.item-check-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const itemId = btn.dataset.itemId;
        const meetingId = btn.dataset.meetingId;
        const note = await this.store.getMeetingData(meetingId);
        const updatedItems = (note.items || []).map(it => it.id === itemId ? { ...it, done: !it.done } : it);
        await this.store.saveMeetingData(meetingId, { items: updatedItems });
        this.render();
      });
    });

    // Delete item
    this.container.querySelectorAll('.delete-action-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const itemId = btn.dataset.itemId;
        const meetingId = btn.dataset.meetingId;
        const note = await this.store.getMeetingData(meetingId);
        const updatedItems = (note.items || []).filter(it => it.id !== itemId);
        await this.store.saveMeetingData(meetingId, { items: updatedItems });
        this.render();
      });
    });

    // Navigate to origin meeting
    this.container.querySelectorAll('[data-nav-meeting]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.navMeeting;
        if (id && this.onSelectMeeting) {
          this.onSelectMeeting(id, 'actions');
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
