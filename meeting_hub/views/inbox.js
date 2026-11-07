/**
 * Cross-Mission Inbox View (Phase 5: Frictionless Capture)
 * 
 * Aggregates all incoming meeting notes across missions into three distinct groups:
 * 1. Needs a home: Ambiguous captures requiring mission assignment
 * 2. No minutes yet: Past fold-lane meetings across missions with inline drop zones
 * 3. Waiting to fold: Pending inbox files per mission + "Fold now" clipboard action
 */
import { Icons } from '../ui/icons.js';

export class InboxView {
  constructor({ container, store, onSelectMeeting, onNavigateMission } = {}) {
    this.container = container;
    this.store = store;
    this.onSelectMeeting = onSelectMeeting;
    this.onNavigateMission = onNavigateMission;
    this.isSyncingGranola = false;
    this.isAutoPulling = false;
  }

  _escape(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  async render() {
    if (!this.container) return;

    this.container.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 20px;">
        <div class="card" style="padding: 16px 20px; display: flex; justify-content: space-between; align-items: center;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <div class="sub" style="font-size: 13px;">Loading cross-mission inbox...</div>
          </div>
        </div>
      </div>
    `;

    // 1. Fetch registry and unassigned inbox
    const registry = await this.store.getMissionsRegistry();
    const missions = Array.isArray(registry) ? registry : (registry?.missions || []);
    const unassignedData = await this.store.getUnassignedInboxFiles();
    const unassignedFiles = Array.isArray(unassignedData) ? unassignedData : (unassignedData?.files || []);
    const granolaStatus = await this.store.getGranolaStatus();

    // 2. Fetch fold meetings and pending inbox per mission
    const foldMeetingsAcross = [];
    const waitingToFoldMissions = [];

    for (const m of missions) {
      try {
        const hubData = await this.store.getMissionHubData(m.id);
        const foldLane = hubData?.lanes?.fold || [];
        
        foldLane.forEach(meeting => {
          if (meeting.inboxState !== 'pending' && meeting.inboxState !== 'folded') {
            foldMeetingsAcross.push({
              ...meeting,
              missionId: m.id,
              missionName: m.name
            });
          }
        });

        const inboxStatus = hubData?.inboxStatus || {};
        const pendingFiles = inboxStatus.pending || inboxStatus.files || [];
        if (pendingFiles.length > 0) {
          waitingToFoldMissions.push({
            mission: m,
            pendingFiles,
            pendingCount: inboxStatus.pendingCount || pendingFiles.length
          });
        }
      } catch (err) {
        console.warn(`[InboxView] Failed to load data for mission ${m.id}:`, err);
      }
    }

    // Sort fold meetings: oldest first (most overdue on top)
    foldMeetingsAcross.sort((a, b) => {
      const cmpDate = (a.date || '').localeCompare(b.date || '');
      if (cmpDate !== 0) return cmpDate;
      return (a.start || '').localeCompare(b.start || '');
    });

    const totalWaiting = unassignedFiles.length + foldMeetingsAcross.length + waitingToFoldMissions.reduce((acc, m) => acc + m.pendingCount, 0);

    // 3. Render container HTML
    this.container.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 24px;">
        
        <!-- Header & Action Toolbar -->
        <div class="card" style="padding: 16px 20px; display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 14px;">
          <div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <span class="label" style="margin-bottom: 0;">Cross-Mission Hub</span>
              <span class="badge ${totalWaiting > 0 ? 'amber' : 'ok'}">
                ${totalWaiting} item${totalWaiting !== 1 ? 's' : ''} to review
              </span>
              ${granolaStatus.active ? `
                <span class="badge ok" style="font-size: 11px; display: inline-flex; align-items: center; gap: 4px;" title="Watched directory: ${this._escape(granolaStatus.folder || '_granola')}">
                  ${Icons.folder} Watched folder active
                </span>
              ` : ''}
            </div>
            <h1 style="font: 600 22px/1.2 var(--font-sans); margin: 6px 0 2px 0;">
              Incoming Meeting Minutes &amp; Capture Stream
            </h1>
            <div class="sub" style="font-size: 12px; color: var(--muted-foreground);">
              Route raw minutes, drop meeting transcripts, and trigger Antigravity folding.
            </div>
          </div>

          <div style="display: flex; gap: 8px; align-items: center;">
            <button class="btn sm" id="btnSyncGranola" ${this.isSyncingGranola ? 'disabled' : ''} style="display: inline-flex; align-items: center; gap: 6px;">
              ${Icons.refreshCw} <span>${this.isSyncingGranola ? 'Syncing...' : 'Sync Granola'}</span>
            </button>
            <button class="btn sm" id="btnAutoPullDocs" ${this.isAutoPulling ? 'disabled' : ''} style="display: inline-flex; align-items: center; gap: 6px;">
              ${Icons.download} <span>${this.isAutoPulling ? 'Pulling Docs...' : 'Auto-pull Docs'}</span>
            </button>
          </div>
        </div>

        <!-- Group 1: Needs a Home (Ambiguous Captures) -->
        <div class="stream-lane" style="border-color: ${unassignedFiles.length > 0 ? 'var(--pink-600)' : 'var(--border)'};">
          <div class="lane-header" style="color: ${unassignedFiles.length > 0 ? 'var(--pink-400)' : 'var(--muted-foreground)'}; display: flex; justify-content: space-between; align-items: center;">
            <span style="display: inline-flex; align-items: center; gap: 6px;">
              ${Icons.alertCircle} Needs a home
            </span>
            <span class="badge ${unassignedFiles.length > 0 ? 'pink' : 'ok'}">${unassignedFiles.length}</span>
          </div>

          ${unassignedFiles.length === 0 ? `
            <div class="empty-lane" style="border-left: 3px solid var(--ok); color: var(--ok);">
              <span style="display: inline-flex; align-items: center; gap: 6px;">
                ${Icons.check} All incoming notes assigned to a mission
              </span>
            </div>
          ` : `
            <div class="lane-cards" style="display: flex; flex-direction: column; gap: 10px;">
              ${unassignedFiles.map(f => this._renderUnassignedCard(f, missions)).join('')}
            </div>
          `}
        </div>

        <!-- Group 2: No Minutes Yet (Fold Lane Across Missions) -->
        <div class="stream-lane" style="border-color: ${foldMeetingsAcross.length > 0 ? 'oklch(0.78 0.16 75 / 45%)' : 'var(--border)'};">
          <div class="lane-header" style="color: ${foldMeetingsAcross.length > 0 ? 'oklch(0.85 0.16 75)' : 'var(--muted-foreground)'}; display: flex; justify-content: space-between; align-items: center;">
            <span style="display: inline-flex; align-items: center; gap: 6px;">
              ${Icons.clock} No minutes yet (past meetings across missions)
            </span>
            <span class="badge ${foldMeetingsAcross.length > 0 ? 'amber' : 'ok'}">${foldMeetingsAcross.length}</span>
          </div>

          ${foldMeetingsAcross.length === 0 ? `
            <div class="empty-lane" style="border-left: 3px solid var(--ok); color: var(--ok);">
              <span style="display: inline-flex; align-items: center; gap: 6px;">
                ${Icons.check} All past meetings have minutes attached
              </span>
            </div>
          ` : `
            <div class="lane-cards" style="display: flex; flex-direction: column; gap: 10px;">
              ${foldMeetingsAcross.map(m => this._renderNoMinutesCard(m)).join('')}
            </div>
          `}
        </div>

        <!-- Group 3: Waiting to Fold (Pending Files per Mission) -->
        <div class="stream-lane" style="border-color: ${waitingToFoldMissions.length > 0 ? 'oklch(0.7 0.14 200 / 45%)' : 'var(--border)'};">
          <div class="lane-header" style="color: ${waitingToFoldMissions.length > 0 ? 'oklch(0.8 0.14 200)' : 'var(--muted-foreground)'}; display: flex; justify-content: space-between; align-items: center;">
            <span style="display: inline-flex; align-items: center; gap: 6px;">
              ${Icons.fileText} Waiting to fold (pending inbox files per mission)
            </span>
            <span class="badge ${waitingToFoldMissions.length > 0 ? 'info' : 'ok'}">
              ${waitingToFoldMissions.reduce((acc, m) => acc + m.pendingCount, 0)} files in ${waitingToFoldMissions.length} mission${waitingToFoldMissions.length !== 1 ? 's' : ''}
            </span>
          </div>

          ${waitingToFoldMissions.length === 0 ? `
            <div class="empty-lane" style="border-left: 3px solid var(--ok); color: var(--ok);">
              <span style="display: inline-flex; align-items: center; gap: 6px;">
                ${Icons.check} No pending inbox files across missions
              </span>
            </div>
          ` : `
            <div style="display: grid; gap: 12px; grid-template-columns: repeat(auto-fit, minmax(360px, 1fr));">
              ${waitingToFoldMissions.map(item => this._renderWaitingMissionCard(item)).join('')}
            </div>
          `}
        </div>

      </div>
    `;

    // 4. Attach event listeners
    this._attachEventListeners(missions);
  }

  _renderUnassignedCard(f, missions) {
    const filename = f.filename || '';
    const title = f.title || filename;
    const date = f.date || '';
    const source = f.source || 'unassigned';
    const preview = (f.preview || f.text || '').slice(0, 180);

    return `
      <div class="card" style="padding: 14px; border-left: 3px solid var(--pink-600); display: flex; flex-direction: column; gap: 10px;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 10px;">
          <div>
            <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 4px;">
              <span class="badge pink" style="font-size: 10px;">Needs Mission Home</span>
              <span class="sub" style="font-size: 11px;">Source: ${this._escape(source)}</span>
              ${date ? `<span class="sub" style="font-size: 11px;">${this._escape(date)}</span>` : ''}
            </div>
            <h3 style="font: 600 15px/1.3 var(--font-sans); margin: 0;">${this._escape(title)}</h3>
          </div>
          <span style="font-family: var(--font-mono); font-size: 11px; color: var(--muted-foreground);">${this._escape(filename)}</span>
        </div>

        ${preview ? `
          <div style="font-size: 12px; color: var(--muted-foreground); line-height: 1.4; background: var(--secondary); padding: 8px 10px; border-radius: var(--r-sm);">
            ${this._escape(preview)}${preview.length >= 180 ? '...' : ''}
          </div>
        ` : ''}

        <!-- 1-Click Assignment Row -->
        <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin-top: 2px;">
          <label class="sub" style="font-size: 12px;">Assign to:</label>
          <select class="input sm" data-assign-select="${this._escape(filename)}" style="min-width: 220px; font-weight: 500;">
            <option value="">Select target mission...</option>
            ${missions.map(m => `
              <option value="${this._escape(m.id)}">${m.archived ? '[Archived] ' : ''}${this._escape(m.name)}</option>
            `).join('')}
          </select>
          <button class="btn sm" data-btn-assign="${this._escape(filename)}" style="display: inline-flex; align-items: center; gap: 4px;">
            ${Icons.check} Assign &amp; Move
          </button>
        </div>
      </div>
    `;
  }

  _renderNoMinutesCard(meeting) {
    return `
      <div class="meeting-card fold-card" data-inbox-meeting-id="${this._escape(meeting.id)}" data-inbox-mission-id="${this._escape(meeting.missionId)}" style="cursor: pointer;">
        <div class="meeting-card-head" style="margin-bottom: 8px;">
          <div>
            <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 2px;">
              <span class="badge" style="font-size: 10px; font-weight: 600;">${this._escape(meeting.missionName || meeting.missionId)}</span>
              <span class="meeting-card-time">${this._escape(meeting.date)} · ${this._escape(meeting.start)} - ${this._escape(meeting.end)}</span>
            </div>
            <span class="meeting-card-title">${this._escape(meeting.title)}</span>
          </div>
          <div style="display: flex; align-items: center; gap: 6px;">
            <span class="fold-state-pill empty" style="display: inline-flex; align-items: center; gap: 4px;">
              ${Icons.alertCircle} No minutes yet
            </span>
          </div>
        </div>

        <!-- Inline Drop & Browse Zone -->
        <div class="inbox-card-dropzone" data-inline-drop-event="${this._escape(meeting.id)}" data-inline-drop-mission="${this._escape(meeting.missionId)}" style="border: 1.5px dashed var(--border); border-radius: var(--r-sm); padding: 8px 12px; text-align: center; font-size: 11.5px; color: var(--muted-foreground); background: var(--secondary); transition: all 0.15s ease;">
          <span style="display: inline-flex; align-items: center; gap: 5px;">
            ${Icons.upload} Drop .md / .txt / .docx here or click to browse
          </span>
          <input type="file" data-inline-file-input="${this._escape(meeting.id)}" data-inline-file-mission="${this._escape(meeting.missionId)}" accept=".md,.txt,.docx" style="display: none;" />
        </div>
      </div>
    `;
  }

  _renderWaitingMissionCard(item) {
    const m = item.mission;
    const files = item.pendingFiles;
    const count = item.pendingCount;

    return `
      <div class="card" style="padding: 16px; display: flex; flex-direction: column; gap: 12px; border-left: 3px solid oklch(0.7 0.14 200);">
        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
          <div>
            <span class="badge info" style="font-size: 10px; margin-bottom: 4px;">${this._escape(m.client || 'Mission')}</span>
            <h3 style="font: 600 16px/1.3 var(--font-sans); margin: 2px 0;">${this._escape(m.name)}</h3>
            <div class="sub" style="font-size: 11px; display: inline-flex; align-items: center; gap: 4px;">
              ${Icons.folder} ${this._escape(m.directory)}/_inbox
            </div>
          </div>
          <span class="badge amber" style="font-size: 12px; font-weight: 600;">
            ${count} pending file${count !== 1 ? 's' : ''}
          </span>
        </div>

        <!-- File List -->
        <div style="background: var(--secondary); border-radius: var(--r-sm); padding: 8px 12px; max-height: 120px; overflow-y: auto;">
          <ul style="margin: 0; padding-left: 16px; font-size: 11.5px; font-family: var(--font-mono); color: var(--muted-foreground); display: grid; gap: 4px;">
            ${files.map(f => {
              const name = typeof f === 'string' ? f : (f.filename || f.title || 'inbox file');
              return `<li>${this._escape(name)}</li>`;
            }).join('')}
          </ul>
        </div>

        <!-- Action Row -->
        <div style="display: flex; justify-content: space-between; align-items: center; gap: 8px; margin-top: auto; padding-top: 4px;">
          <button class="btn sm" data-nav-cockpit="${this._escape(m.id)}" style="display: inline-flex; align-items: center; gap: 4px;">
            ${Icons.layers} Open Cockpit
          </button>
          <button class="btn sm" data-btn-fold-prompt="${this._escape(m.id)}" data-mission-name="${this._escape(m.name)}" data-mission-dir="${this._escape(m.directory)}" style="display: inline-flex; align-items: center; gap: 5px; font-weight: 600;">
            ${Icons.sparkles} Fold Now
          </button>
        </div>
      </div>
    `;
  }

  _attachEventListeners(missions) {
    // 1. Sync Granola button
    this.container.querySelector('#btnSyncGranola')?.addEventListener('click', async () => {
      this.isSyncingGranola = true;
      this.render();
      try {
        const res = await this.store.syncGranola();
        this._showToast(`Granola sync complete: ${res.processed || 0} processed, ${res.matched?.length || 0} matched`);
      } catch (e) {
        this._showToast(`Granola sync error: ${e.message}`);
      } finally {
        this.isSyncingGranola = false;
        this.render();
      }
    });

    // 2. Auto-pull Google Docs button
    this.container.querySelector('#btnAutoPullDocs')?.addEventListener('click', async () => {
      this.isAutoPulling = true;
      this.render();
      try {
        const res = await this.store.autoPullGoogleDocs();
        this._showToast(`Docs auto-pull complete: ${res.pulledCount || 0} pulled`);
      } catch (e) {
        this._showToast(`Auto-pull error: ${e.message}`);
      } finally {
        this.isAutoPulling = false;
        this.render();
      }
    });

    // 3. Assign unassigned card
    this.container.querySelectorAll('[data-btn-assign]').forEach(btn => {
      btn.addEventListener('click', async () => {
        const filename = btn.dataset.btnAssign;
        const select = this.container.querySelector(`[data-assign-select="${filename}"]`);
        const targetMission = select ? select.value : '';
        if (!targetMission) {
          alert('Please select a target mission first.');
          return;
        }

        btn.disabled = true;
        btn.textContent = 'Assigning...';
        try {
          await this.store.assignInboxFile(filename, targetMission);
          this._showToast(`Assigned ${filename} to ${targetMission}`);
          await this.render();
        } catch (e) {
          this._showToast(`Assignment failed: ${e.message}`);
          btn.disabled = false;
          btn.textContent = 'Assign & Move';
        }
      });
    });

    // 4. Meeting card clicks (opens meeting panel)
    this.container.querySelectorAll('[data-inbox-meeting-id]').forEach(card => {
      card.addEventListener('click', (e) => {
        if (e.target.closest('.inbox-card-dropzone')) return;
        const meetingId = card.dataset.inboxMeetingId;
        const missionId = card.dataset.inboxMissionId;
        if (meetingId && this.onSelectMeeting) {
          this.onSelectMeeting(meetingId, missionId);
        }
      });
    });

    // 5. Inline Drop & Browse Zones for meetings
    this.container.querySelectorAll('.inbox-card-dropzone').forEach(zone => {
      const eventId = zone.dataset.inlineDropEvent;
      const missionId = zone.dataset.inlineDropMission;
      const fileInput = this.container.querySelector(`[data-inline-file-input="${eventId}"]`);

      zone.addEventListener('click', (e) => {
        e.stopPropagation();
        fileInput?.click();
      });

      zone.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.stopPropagation();
        zone.style.borderColor = 'var(--pink-600)';
        zone.style.background = 'oklch(0.25 0.05 300 / 30%)';
      });

      zone.addEventListener('dragleave', (e) => {
        e.preventDefault();
        zone.style.borderColor = 'var(--border)';
        zone.style.background = 'var(--secondary)';
      });

      const handleFiles = async (files) => {
        if (!files || files.length === 0) return;
        const file = files[0];
        try {
          const text = await file.text();
          zone.innerHTML = `<span style="color: var(--ok);">${Icons.clock} Uploading to inbox...</span>`;
          await this.store.sendMinutesToInbox(eventId, missionId, {
            text,
            title: file.name,
            source: 'drag_and_drop'
          });
          this._showToast(`Captured ${file.name} to inbox for ${missionId}`);
          await this.render();
        } catch (err) {
          this._showToast(`Upload failed: ${err.message}`);
          zone.style.borderColor = 'var(--border)';
          zone.style.background = 'var(--secondary)';
        }
      };

      zone.addEventListener('drop', async (e) => {
        e.preventDefault();
        e.stopPropagation();
        zone.style.borderColor = 'var(--border)';
        zone.style.background = 'var(--secondary)';
        await handleFiles(e.dataTransfer.files);
      });

      fileInput?.addEventListener('change', async (e) => {
        e.stopPropagation();
        await handleFiles(fileInput.files);
      });
    });

    // 6. Navigate to Cockpit button
    this.container.querySelectorAll('[data-nav-cockpit]').forEach(btn => {
      btn.addEventListener('click', () => {
        const mid = btn.dataset.navCockpit;
        if (mid && this.onNavigateMission) {
          this.onNavigateMission(mid);
        } else {
          window.location.hash = '#/p/' + encodeURIComponent(mid);
        }
      });
    });

    // 7. Fold Now prompt copy button
    this.container.querySelectorAll('[data-btn-fold-prompt]').forEach(btn => {
      btn.addEventListener('click', async () => {
        const mid = btn.dataset.btnFoldPrompt;
        const name = btn.dataset.missionName || mid;
        const dir = btn.dataset.missionDir || name;

        const promptText = `Please review and fold all raw minutes currently in "${dir}/_inbox/" for mission "${name}" (${mid}).\nFollow AGY system of record guidelines:\n1. Reconcile open actions into "${dir}/Actions.md"\n2. Reconcile key decisions into "${dir}/Mission Overview.md"\n3. Update relevant workstream files in "${dir}/"\n4. Move folded minutes from "${dir}/_inbox/" to "${dir}/_inbox/_folded/"`;

        try {
          await navigator.clipboard.writeText(promptText);
          this._showToast(`Copied Antigravity fold prompt for ${name} to clipboard`);
        } catch (e) {
          prompt('Copy Antigravity fold prompt:', promptText);
        }
      });
    });
  }

  _showToast(msg) {
    if (typeof window !== 'undefined' && typeof window.showHubToast === 'function') {
      window.showHubToast(msg);
    } else {
      console.log(`[Toast] ${msg}`);
    }
  }
}
