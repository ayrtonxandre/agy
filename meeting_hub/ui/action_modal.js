/**
 * Action Edit Modal Component
 * 
 * Provides an inline / modal dialog allowing users to edit:
 * - Name / Description
 * - Sub-stream / Workstream
 * - Owner / Assignee
 * - Due Date
 * 
 * Persists directly into Missions/<Mission>/Actions.md via Store.updateAction.
 * Conforms strictly to Arty Design System: Lucide icons only, zero emojis.
 */
import { Icons } from './icons.js';

export class ActionModal {
  constructor(options = {}) {
    this.store = options.store || null;
    this.onSave = options.onSave || null;
    this.overlay = null;
    this._keyHandler = null;
  }

  /**
   * Opens the edit modal for a given action.
   * 
   * @param {Object} params
   * @param {Object} params.action - Action object ({ id, text/title, owner, workstream/org, dueDate/due })
   * @param {string} [params.missionId] - Mission identifier
   * @param {Function} [params.onSave] - Callback executed on successful save
   */
  async open({ action, missionId = null, onSave = null }) {
    if (!action || !action.id) {
      console.warn('[ActionModal] Cannot open edit modal without a valid action');
      return;
    }

    const currentTitle = action.title || action.text || action.description || '';
    const currentOwner = action.owner || '';
    const currentWs = action.workstream || action.substream || action.ownerOrg || action.org || '';
    const currentDue = action.dueDate || action.due || action.date || '';
    const targetMissionId = missionId || action.missionId || null;
    const saveCb = onSave || this.onSave;

    // Gather auto-complete suggestions from store if available
    let workstreamSuggestions = new Set();
    let ownerSuggestions = new Set(['Ayrton André', 'Camille Kugler', 'Thomas', 'Baptiste Pasquier']);

    if (currentWs) workstreamSuggestions.add(currentWs);
    if (currentOwner) ownerSuggestions.add(currentOwner);

    if (this.store) {
      try {
        const registry = await this.store.getMissionsRegistry();
        const mList = Array.isArray(registry) ? registry : (registry?.missions || []);
        
        // Find mission workstreams
        const targetM = targetMissionId ? mList.find(m => m.id === targetMissionId) : null;
        if (targetM && Array.isArray(targetM.workstreams)) {
          targetM.workstreams.forEach(ws => {
            if (ws.name) workstreamSuggestions.add(ws.name);
            if (ws.id) workstreamSuggestions.add(ws.id);
          });
        } else {
          // Add from all missions
          mList.forEach(m => {
            if (Array.isArray(m.workstreams)) {
              m.workstreams.forEach(ws => {
                if (ws.name) workstreamSuggestions.add(ws.name);
              });
            }
          });
        }

        // Find contacts from mission summary
        if (targetMissionId) {
          const summary = await this.store.getMissionSummary(targetMissionId);
          if (summary) {
            if (Array.isArray(summary.contacts)) {
              summary.contacts.forEach(c => {
                if (c.name) ownerSuggestions.add(c.name);
              });
            }
            if (Array.isArray(summary.actions)) {
              summary.actions.forEach(a => {
                if (a.owner) ownerSuggestions.add(a.owner);
                if (a.workstream) workstreamSuggestions.add(a.workstream);
              });
            }
          }
        }
      } catch (err) {
        console.warn('[ActionModal] Error fetching suggestions:', err);
      }
    }

    // Build modal overlay
    this.close(); // Clean up any existing instance

    const overlay = document.createElement('div');
    overlay.className = 'action-modal-overlay';
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(10, 15, 29, 0.75);
      backdrop-filter: blur(4px);
      -webkit-backdrop-filter: blur(4px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 99999;
      padding: 16px;
      box-sizing: border-box;
      animation: actionModalFadeIn 0.15s ease-out;
    `;

    const wsOptionsHtml = Array.from(workstreamSuggestions)
      .map(ws => `<option value="${this._escape(ws)}">`)
      .join('');

    const ownerOptionsHtml = Array.from(ownerSuggestions)
      .map(o => `<option value="${this._escape(o)}">`)
      .join('');

    overlay.innerHTML = `
      <div class="card action-modal-card" style="
        background: var(--card);
        border: 1px solid var(--border);
        border-radius: var(--r-md);
        box-shadow: 0 16px 36px rgba(0, 0, 0, 0.45);
        width: 100%;
        max-width: 520px;
        display: flex;
        flex-direction: column;
        overflow: hidden;
      " role="dialog" aria-modal="true" aria-labelledby="actionModalTitleHeader">
        
        <!-- Header -->
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 14px 18px; border-bottom: 1px solid var(--border); background: var(--navy-1);">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span class="badge" style="font-family: var(--font-mono); font-size: 11px; font-weight: 700; background: var(--muted);">${this._escape(action.id)}</span>
            <h3 id="actionModalTitleHeader" style="margin: 0; font-size: 14px; font-weight: 600; color: var(--foreground); display: flex; align-items: center; gap: 6px;">
              ${Icons.edit} Edit Action
            </h3>
          </div>
          <button class="btn-icon btn-close-action-modal" title="Close (Esc)" style="background: transparent; border: none; cursor: pointer; color: var(--muted-foreground); display: flex; align-items: center; justify-content: center; width: 28px; height: 28px; border-radius: 4px;">
            ${Icons.x}
          </button>
        </div>

        <!-- Body Form -->
        <form id="actionEditForm" style="padding: 16px 18px; display: flex; flex-direction: column; gap: 14px; margin: 0;">
          
          <!-- Name / Description -->
          <div style="display: flex; flex-direction: column; gap: 5px;">
            <label for="modalActionTitleInput" style="font-size: 11.5px; font-weight: 600; color: var(--muted-foreground); text-transform: uppercase; letter-spacing: 0.04em;">
              Action Name / Description <span style="color: var(--pink-600); font-weight: 700;">*</span>
            </label>
            <textarea class="in" id="modalActionTitleInput" rows="3" required placeholder="What needs to be done?" style="width: 100%; resize: vertical; min-height: 64px; font-size: 13px; line-height: 1.45;">${this._escape(currentTitle)}</textarea>
          </div>

          <!-- Sub-stream / Workstream & Owner (2-col grid) -->
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
            <!-- Sub-stream -->
            <div style="display: flex; flex-direction: column; gap: 5px;">
              <label for="modalActionWsInput" style="font-size: 11.5px; font-weight: 600; color: var(--muted-foreground); text-transform: uppercase; letter-spacing: 0.04em;">
                Sub-stream / Workstream
              </label>
              <input class="in" id="modalActionWsInput" list="modalActionWsDataList" placeholder="e.g. UC Wizard" value="${this._escape(currentWs)}" style="width: 100%;" />
              <datalist id="modalActionWsDataList">
                ${wsOptionsHtml}
              </datalist>
            </div>

            <!-- Owner -->
            <div style="display: flex; flex-direction: column; gap: 5px;">
              <label for="modalActionOwnerInput" style="font-size: 11.5px; font-weight: 600; color: var(--muted-foreground); text-transform: uppercase; letter-spacing: 0.04em;">
                Owner / Assignee
              </label>
              <input class="in" id="modalActionOwnerInput" list="modalActionOwnerDataList" placeholder="e.g. Ayrton André" value="${this._escape(currentOwner)}" style="width: 100%;" />
              <datalist id="modalActionOwnerDataList">
                ${ownerOptionsHtml}
              </datalist>
            </div>
          </div>

          <!-- Due Date -->
          <div style="display: flex; flex-direction: column; gap: 5px;">
            <label for="modalActionDueInput" style="font-size: 11.5px; font-weight: 600; color: var(--muted-foreground); text-transform: uppercase; letter-spacing: 0.04em;">
              Due Date
            </label>
            <div style="position: relative;">
              <input class="in" id="modalActionDueInput" placeholder="e.g. 2026-11-20, Novembre 2026, Fin Nov" value="${this._escape(currentDue)}" style="width: 100%; padding-left: 28px;" />
              <span style="position: absolute; left: 8px; top: 8px; color: var(--muted-foreground); pointer-events: none; display: flex; align-items: center;">
                ${Icons.clock}
              </span>
            </div>
          </div>

          <!-- Error Feedback Container -->
          <div id="modalActionErrorMsg" style="display: none; font-size: 12px; color: var(--pink-600); background: rgba(225, 29, 72, 0.08); padding: 8px 10px; border-radius: var(--r-sm); border: 1px solid rgba(225, 29, 72, 0.2);"></div>

          <!-- Actions Footer -->
          <div style="display: flex; justify-content: flex-end; align-items: center; gap: 8px; margin-top: 6px; padding-top: 12px; border-top: 1px solid var(--border);">
            <button type="button" class="btn sm btn-cancel-action-modal">Cancel</button>
            <button type="submit" class="btn sm pink btn-save-action-modal" style="display: inline-flex; align-items: center; gap: 6px;">
              ${Icons.check} Save Action
            </button>
          </div>
        </form>
      </div>
    `;

    document.body.appendChild(overlay);
    this.overlay = overlay;

    // Focus title input
    const titleInput = overlay.querySelector('#modalActionTitleInput');
    if (titleInput) {
      setTimeout(() => titleInput.focus(), 50);
    }

    // Wire close triggers
    overlay.querySelector('.btn-close-action-modal')?.addEventListener('click', () => this.close());
    overlay.querySelector('.btn-cancel-action-modal')?.addEventListener('click', () => this.close());
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) this.close();
    });

    this._keyHandler = (e) => {
      if (e.key === 'Escape') {
        this.close();
      }
    };
    window.addEventListener('keydown', this._keyHandler);

    // Wire submit
    const form = overlay.querySelector('#actionEditForm');
    const saveBtn = overlay.querySelector('.btn-save-action-modal');
    const errorDiv = overlay.querySelector('#modalActionErrorMsg');

    form?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const updatedTitle = titleInput?.value.trim();
      const updatedWs = overlay.querySelector('#modalActionWsInput')?.value.trim();
      const updatedOwner = overlay.querySelector('#modalActionOwnerInput')?.value.trim();
      const updatedDue = overlay.querySelector('#modalActionDueInput')?.value.trim();

      if (!updatedTitle) {
        if (errorDiv) {
          errorDiv.textContent = 'Action name/description cannot be empty.';
          errorDiv.style.display = 'block';
        }
        titleInput?.focus();
        return;
      }

      if (saveBtn) {
        saveBtn.disabled = true;
        saveBtn.innerHTML = `${Icons.refreshCw} Saving...`;
      }
      if (errorDiv) errorDiv.style.display = 'none';

      const updates = {
        title: updatedTitle,
        description: updatedTitle,
        text: updatedTitle,
        workstream: updatedWs,
        ownerOrg: updatedWs,
        owner: updatedOwner,
        dueDate: updatedDue,
        due: updatedDue
      };

      try {
        let result = null;
        if (this.store && typeof this.store.updateAction === 'function') {
          result = await this.store.updateAction(action.id, updates, targetMissionId);
        } else {
          // Direct fetch fallback
          const resp = await fetch('/api/actions/update', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ actionId: action.id, missionId: targetMissionId, updates })
          });
          if (!resp.ok) {
            const err = await resp.text();
            throw new Error(`Server returned HTTP ${resp.status}: ${err}`);
          }
          result = await resp.json();
        }

        this.close();

        if (typeof saveCb === 'function') {
          saveCb(result || { ...action, ...updates });
        }
      } catch (err) {
        console.error('[ActionModal] Failed to update action:', err);
        if (saveBtn) {
          saveBtn.disabled = false;
          saveBtn.innerHTML = `${Icons.check} Save Action`;
        }
        if (errorDiv) {
          errorDiv.textContent = `Failed to save: ${err.message || 'Unknown error'}`;
          errorDiv.style.display = 'block';
        }
      }
    });
  }

  /**
   * Closes and removes the modal from the DOM.
   */
  close() {
    if (this._keyHandler) {
      window.removeEventListener('keydown', this._keyHandler);
      this._keyHandler = null;
    }
    if (this.overlay && this.overlay.parentNode) {
      this.overlay.parentNode.removeChild(this.overlay);
    }
    this.overlay = null;
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
}

// Global modal instance helper
let _activeActionModal = null;

export function openActionEditModal({ action, missionId = null, store = null, onSave = null }) {
  if (!_activeActionModal) {
    _activeActionModal = new ActionModal({ store });
  } else if (store) {
    _activeActionModal.store = store;
  }
  return _activeActionModal.open({ action, missionId, onSave });
}
