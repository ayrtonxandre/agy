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

    // Aggregate actions from registered missions (System of Record)
    try {
      const registry = await this.store.getMissionsRegistry();
      for (const mission of registry) {
        const summary = await this.store.getMissionSummary(mission.id);
        if (!summary) continue;

        const clientName = mission.name || 'Clariane';
        const rawActions = summary.actions || summary.actionMatrix || [];

        for (const act of rawActions) {
          // Resolve linked meeting if possible
          let linkedEvent = null;
          let mId = act.meetingId || null;
          if (!mId && act.source) {
            const m = act.source.match(/meeting\/([^ )]+)/);
            if (m) mId = m[1];
          }
          if (mId) {
            linkedEvent = eventsMap.get(mId);
          }
          if (!linkedEvent && act.source) {
            const lowerSrc = act.source.toLowerCase();
            linkedEvent = this.store.eventsCache.find(e =>
              (e.client && lowerSrc.includes(e.client.toLowerCase())) ||
              (e.title && lowerSrc.includes(e.title.toLowerCase()))
            );
          }

          aggregatedItems.push({
            id: act.id,
            text: act.text || act.description || '',
            owner: act.owner || 'Unassigned',
            ownerOrg: act.ownerOrg || act.org || ((act.owner || '').toLowerCase().includes('ayrton') ? 'Artefact' : 'Client'),
            dueDate: act.due || act.dueDate || null,
            done: Boolean(act.done || act.status === 'done' || act.status === 'completed' || act.status === 'clos'),
            kind: 'action',
            isNoteAction: true,
            sourceNote: act.file || 'Actions.md',
            missionId: mission.id,
            meetingId: linkedEvent ? linkedEvent.id : (mId || null),
            meetingTitle: linkedEvent ? linkedEvent.title : (act.source || `${clientName} Mission`),
            meetingDate: linkedEvent ? linkedEvent.date : '',
            client: clientName
          });
        }
      }
    } catch (e) {
      console.warn('Could not load mission note actions:', e);
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
                    <button class="item-check-btn ${item.done ? 'checked' : ''}" data-item-id="${this._escape(item.id)}" data-meeting-id="${this._escape(item.meetingId || '')}" data-is-note="${item.isNoteAction ? 'true' : 'false'}" data-note-file="${this._escape(item.sourceNote || '')}" title="${item.isNoteAction ? 'Markdown note action (Single Source of Truth)' : (item.done ? 'Mark open' : 'Mark done')}">
                      ${item.done ? Icons.check : ''}
                    </button>
                    <span class="kind-badge ${item.kind}">${item.kind}</span>
                    ${item.isNoteAction ? `
                      <span class="badge" style="background: var(--muted); font-size: 10px; font-family: var(--font-mono); font-weight: 600;">${this._escape(item.id)}</span>
                      <span class="badge" style="font-size: 10px; border-color: var(--pink-600); color: var(--pink-600);">[${this._escape(item.sourceNote || 'Actions.md')}]</span>
                    ` : ''}
                    <div class="item-body">
                      <span class="tx ${item.done ? 'done' : ''}">${this._escape(item.text)}</span>
                      <div class="item-meta" style="margin-top: 4px; display: flex; gap: 6px; align-items: center; flex-wrap: wrap;">
                        ${item.owner ? `<span class="chip-owner">${this._escape(item.owner)}</span>` : ''}
                        ${item.ownerOrg ? `<span class="badge" style="font-size: 10px;">${this._escape(item.ownerOrg)}</span>` : ''}
                        ${item.dueDate ? `<span class="chip-due">${Icons.clock} ${this._escape(item.dueDate)}</span>` : ''}
                        ${item.meetingId ? `
                          <button class="btn sm" data-nav-meeting="${this._escape(item.meetingId)}" style="padding: 1px 6px; font-size: 10.5px;">
                            ${this._escape(item.meetingTitle)} ${item.meetingDate ? `(${this._escape(item.meetingDate)})` : ''}
                          </button>
                        ` : `
                          <span class="sub" style="font-size: 10.5px;">
                            ${this._escape(item.meetingTitle)}
                          </span>
                        `}
                      </div>
                    </div>
                    ${item.isNoteAction ? `
                      <button class="btn sm" data-copy-note-action="${this._escape(item.id)}" data-note-file="${this._escape(item.sourceNote || 'Actions.md')}" title="Copy ID to mark done in ${this._escape(item.sourceNote || 'Actions.md')}" style="flex-shrink: 0; font-size: 10.5px; padding: 2px 8px;">
                        📋 Copy ID
                      </button>
                    ` : `
                      <button class="btn-icon delete-action-btn" data-item-id="${this._escape(item.id)}" data-meeting-id="${this._escape(item.meetingId || '')}" title="Delete action">
                        ${Icons.trash}
                      </button>
                    `}
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
        if (btn.dataset.isNote === 'true') {
          const noteFile = btn.dataset.noteFile || 'Actions.md';
          if (navigator.clipboard && navigator.clipboard.writeText) {
            await navigator.clipboard.writeText(itemId);
          }
          alert(`Copied ${itemId} to clipboard!\nTo mark this action done, edit ${noteFile} directly (Markdown notes are the single source of truth).`);
          return;
        }

        const meetingId = btn.dataset.meetingId;
        if (!meetingId) return;
        const note = await this.store.getMeetingData(meetingId);
        const updatedItems = (note.items || []).map(it => it.id === itemId ? { ...it, done: !it.done } : it);
        await this.store.saveMeetingData(meetingId, { items: updatedItems });
        this.render();
      });
    });

    // Copy note action ID button
    this.container.querySelectorAll('[data-copy-note-action]').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const actId = btn.dataset.copyNoteAction;
        const noteFile = btn.dataset.noteFile || 'Actions.md';
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(actId);
        }
        const orig = btn.innerHTML;
        btn.innerHTML = '✓ Copied!';
        alert(`Copied ${actId} to clipboard!\nOpen ${noteFile} in your editor to mark it done (notes are single source of truth).`);
        setTimeout(() => { btn.innerHTML = orig; }, 1500);
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
