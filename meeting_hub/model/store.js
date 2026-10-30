/**
 * Central Reactive Application Store
 * 
 * Bridges IndexedDB via the database adapter to the UI components.
 * Manages caching, query filtering, meeting notes persistence, minutes intelligence,
 * dynamic project configuration, and reactive subscribers.
 */
import { getDatabase } from '../data/db.js';
import { EventsImporter } from '../data/importer.js';
import { LinkEngine } from './links.js';
import { MinutesEngine } from './minutes_engine.js';
import { DEFAULT_PROJECTS, ProjectModel } from './project.js';
import { matchMission } from './mission_matcher.js';
import { classifyMeeting } from './lane_classifier.js';

export class MeetingHubStore {
  constructor() {
    this.db = null;
    this.eventsCache = [];
    this.seriesCache = [];
    this.projectsCache = [];
    this.missionsCache = [];
    this.missionSummariesCache = new Map();
    this.inboxStatusCache = new Map();
    this.activeProjectId = 'ge-enterprise';
    this.subscribers = new Set();
    this.initialized = false;
  }

  get missionsRegistry() {
    return { missions: this.missionsCache || [] };
  }

  set missionsRegistry(val) {
    if (val && Array.isArray(val.missions)) {
      this.missionsCache = val.missions;
    } else if (Array.isArray(val)) {
      this.missionsCache = val;
    }
  }

  async init(options = {}) {
    if (this.initialized) return;

    this.db = await getDatabase();
    
    // Idempotent initial import of the calendar events
    await EventsImporter.importInitialData(this.db, options);

    // Warm in-memory cache for fast UI updates
    await this.refreshCache();
    this.initialized = true;
    this.notify({ type: 'store_initialized' });
  }

  /**
   * Fetches missions registry from /api/missions or snapshot fallback.
   */
  async getMissionsRegistry() {
    // 1. Try server endpoint
    try {
      const resp = await fetch('/api/missions');
      if (resp.ok) {
        const json = await resp.json();
        const list = Array.isArray(json) ? json : (json.missions || (json.status === 'ok' && json.missions) || []);
        if (Array.isArray(list) && list.length > 0) {
          this.missionsCache = list;
          return list;
        }
      }
    } catch (e) {
      // Offline / file:// mode
    }

    // 2. Fall back to bundled / global snapshot
    if (typeof window !== 'undefined' && window.MISSIONS_SNAPSHOT && Array.isArray(window.MISSIONS_SNAPSHOT.missions)) {
      this.missionsCache = window.MISSIONS_SNAPSHOT.missions;
      return window.MISSIONS_SNAPSHOT.missions;
    }

    // 3. Node environment fallback (for unit tests)
    if (typeof process !== 'undefined' && process.versions && process.versions.node) {
      try {
        const fs = await import('fs');
        const p = '/Users/ayrtonandre/Documents/work/AGY/meeting_hub/data/missions_snapshot.js';
        if (fs.existsSync(p)) {
          const content = fs.readFileSync(p, 'utf8');
          const m = content.match(/MISSIONS_SNAPSHOT\s*=\s*(\{[\s\S]*?\});?\s*$/);
          if (m) {
            const data = JSON.parse(m[1]);
            if (Array.isArray(data.missions)) {
              this.missionsCache = data.missions;
              return data.missions;
            }
          }
        }
      } catch (e) {
        // Ignore node fallback error
      }
    }

    return this.missionsCache || [];
  }

  missionToProject(m) {
    return {
      id: m.id,
      name: m.name,
      client: m.client,
      isMission: true,
      directory: m.directory,
      status: m.status || 'active',
      archived: Boolean(m.archived || m.status === 'archived'),
      brief: m.brief,
      overview: m.overview,
      actions: m.actions,
      inbox: m.inbox,
      clientMatch: m.clientMatch || [m.name, m.id],
      docSources: [],
      workstreams: Array.isArray(m.workstreams) ? m.workstreams.map(w => ({
        id: w.id || `ws-${(w.name || w.title || '').toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
        title: w.name || w.title || 'Workstream',
        badge: w.phase || w.status || 'Actif',
        status: w.phase || w.status || 'Actif',
        summary: w.summary || '',
        note: w.note || '',
        facilities: w.facilities || [],
        tags: w.tags || [],
        keyRules: w.keyRules || []
      })) : (m.facilities || []).map(f => ({
        id: `ws-${f.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
        title: `${f.name} (${f.phase || 'Actif'})`,
        badge: f.phase || 'Actif',
        status: f.phase || 'Actif',
        summary: `Spécialités: ${(f.specialties || []).join(', ')}`,
        facilities: [f.name],
        tags: (f.specialties || []).map(s => s.toLowerCase()),
        keyRules: []
      })),
      parserHints: {
        tools: [],
        concepts: [],
        facilities: Array.isArray(m.facilities) ? m.facilities.map(f => f.name) : [],
        decisionTriggers: [],
        tagRules: [],
        ownerOrgRules: []
      }
    };
  }

  async refreshCache() {
    this.eventsCache = await this.db.getAll('events');
    this.seriesCache = await this.db.getAll('series');

    // 1. Load missions from registry
    const missions = await this.getMissionsRegistry();
    const missionProjects = missions.map(m => this.missionToProject(m));

    // 2. Load projects and ensure default projects are seeded
    let projects = await this.db.getAll('projects');
    if (!projects || projects.length === 0) {
      for (const p of DEFAULT_PROJECTS) {
        await this.db.put('projects', p);
      }
      projects = await this.db.getAll('projects');
    } else {
      // Ensure all DEFAULT_PROJECTS are seeded if missing, or updated
      const existingIds = new Set(projects.map(p => p.id));
      let updated = false;
      for (const defProj of DEFAULT_PROJECTS) {
        if (!existingIds.has(defProj.id)) {
          await this.db.put('projects', defProj);
          updated = true;
        } else if (defProj.id === 'clariane') {
          // If clariane has old clientMatch containing 'Clariane', update it to HDJ specific matches
          const existing = projects.find(p => p.id === 'clariane');
          if (existing && Array.isArray(existing.clientMatch) && existing.clientMatch.includes('Clariane')) {
            await this.db.put('projects', { ...existing, clientMatch: defProj.clientMatch, name: defProj.name });
            updated = true;
          }
        }
      }
      if (updated) {
        projects = await this.db.getAll('projects');
      }
    }

    // Merge: mission projects come first! Replace any legacy 'clariane' with 'clariane-hdj'
    // Active missions come before archived missions
    const activeMissions = missionProjects.filter(m => !m.archived);
    const archivedMissions = missionProjects.filter(m => m.archived);
    const combined = [...activeMissions, ...archivedMissions];
    const missionIds = new Set(missionProjects.map(p => p.id));
    if (missionIds.has('clariane-hdj')) {
      missionIds.add('clariane'); // suppress legacy clariane if clariane-hdj is present
    }

    for (const p of projects) {
      if (!missionIds.has(p.id)) {
        combined.push(p);
      }
    }
    this.projectsCache = combined;
    if (!this.projectsCache.some(p => p.id === this.activeProjectId)) {
      this.activeProjectId = this.projectsCache[0]?.id || 'ge-enterprise';
    }
  }

  subscribe(callback) {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  notify(eventPayload = {}) {
    for (const sub of this.subscribers) {
      try {
        sub(eventPayload);
      } catch (err) {
        console.error('[Store] Error in subscriber callback:', err);
      }
    }
  }

  /* ================= Event Query Methods ================= */

  getAllEvents() {
    return this.eventsCache;
  }

  getEventsByDate(date, mode = 'all') {
    return this.eventsCache
      .filter(e => {
        if (e.date !== date) return false;
        if (mode === 'all') return true;
        if (mode === 'work') return e.stream === 'work';
        if (mode === 'life') return e.stream === 'life';
        return true;
      })
      .sort((a, b) => a.start.localeCompare(b.start));
  }

  getEvent(id) {
    return this.eventsCache.find(e => e.id === id) || null;
  }

  getSeries(seriesId) {
    return this.seriesCache.find(s => s.id === seriesId) || null;
  }

  getAllSeries() {
    return this.seriesCache;
  }

  /* ================= Project Management Methods ================= */

  async getAllProjects() {
    if (!this.db) await this.init();
    if (!this.projectsCache || this.projectsCache.length === 0) {
      await this.refreshCache();
    }
    return this.projectsCache;
  }

  async getProject(id) {
    if (!this.db) await this.init();
    if (!id) return null;
    const all = await this.getAllProjects();
    const normalizedId = (id === 'clariane' ? 'clariane-hdj' : id).toLowerCase();
    return all.find(p => 
      p.id.toLowerCase() === normalizedId ||
      p.name.toLowerCase() === normalizedId ||
      (Array.isArray(p.clientMatch) && p.clientMatch.some(m => m.toLowerCase() === normalizedId))
    ) || all.find(p => p.id.toLowerCase() === id.toLowerCase()) || null;
  }

  async saveProject(project) {
    if (!this.db) await this.init();
    if (!ProjectModel.validate(project)) {
      throw new Error('Invalid project structure');
    }
    await this.db.put('projects', project);
    await this.refreshCache();
    this.notify({ type: 'project_updated', projectId: project.id });
    return project;
  }

  async deleteProject(id) {
    if (!this.db) await this.init();
    await this.db.delete('projects', id);
    if (this.activeProjectId === id) {
      const remaining = await this.getAllProjects();
      this.activeProjectId = remaining[0]?.id || 'clariane';
    }
    await this.refreshCache();
    this.notify({ type: 'project_deleted', projectId: id });
  }

  getActiveProjectId() {
    return this.activeProjectId;
  }

  setActiveProjectId(id) {
    this.activeProjectId = id;
    this.notify({ type: 'active_project_changed', projectId: id });
  }

  getProjectForMeeting(meeting) {
    if (!meeting) return null;
    const projects = (this.projectsCache && this.projectsCache.length > 0)
      ? this.projectsCache
      : (this.missionsCache && this.missionsCache.length > 0 ? this.missionsCache : DEFAULT_PROJECTS);
    if (typeof matchMission === 'function') {
      const match = matchMission(meeting, projects);
      if (match && match.missionId) {
        return projects.find(p => p.id === match.missionId) || { id: match.missionId, name: match.missionId };
      }
    }
    const client = (meeting.client || '').toLowerCase().trim();
    const title = (meeting.title || '').toLowerCase().trim();
    const tags = (meeting.tags || []).map(t => t.toLowerCase().trim());

    // 1. First priority: Check if title bracket tags match a project (e.g. [MO], [HDJ], [Invoicing])
    const bracketMatches = (meeting.title || '').match(/\[(.*?)\]/g) || [];
    for (const rawBracket of bracketMatches) {
      const bracketClean = rawBracket.toLowerCase().trim(); // e.g. '[mo]'
      const bracketInner = bracketClean.replace(/[\[\]]/g, '').trim(); // e.g. 'mo'
      for (const p of projects) {
        const pMatches = (p.clientMatch || [p.name, p.id]).map(m => m.toLowerCase().trim());
        if (pMatches.some(m => m === bracketClean || m === bracketInner || (m.startsWith('[') && m.replace(/[\[\]]/g, '') === bracketInner))) {
          return p;
        }
      }
    }

    // 2. Second priority: Specific title match or event tags match
    for (const p of projects) {
      const pMatches = (p.clientMatch || [p.name, p.id]).map(m => m.toLowerCase().trim());
      if (pMatches.some(m => m && (title.includes(m) || tags.includes(m)))) {
        return p;
      }
    }

    // 3. Third priority: Client field match
    for (const p of projects) {
      const pMatches = (p.clientMatch || [p.name, p.id]).map(m => m.toLowerCase().trim());
      if (pMatches.some(m => m && (client === m || client.includes(m)))) {
        return p;
      }
    }

    return null;
  }

  getEventsForProject(projectId) {
    if (!projectId) return [];
    const pId = projectId.toLowerCase();
    let registry = (this.missionsCache && this.missionsCache.length > 0) ? this.missionsCache : null;
    if (!registry && typeof window !== 'undefined' && window.MISSIONS_SNAPSHOT && Array.isArray(window.MISSIONS_SNAPSHOT.missions)) {
      registry = window.MISSIONS_SNAPSHOT.missions;
    }
    if (!registry) registry = this.projectsCache || [];
    return (this.eventsCache || []).filter(e => {
      const match = (typeof matchMission === 'function')
        ? matchMission(e, registry)
        : (typeof MeetingHub !== 'undefined' && MeetingHub.matchMission ? MeetingHub.matchMission(e, registry) : null);
      if (match && match.missionId && match.missionId.toLowerCase() === pId) return true;
      const p = this.getProjectForMeeting(e);
      return p && (p.id.toLowerCase() === pId || (pId === 'clariane-hdj' && p.id === 'clariane'));
    });
  }

  async getSuggestedProjects() {
    if (!this.db) await this.init();
    const existing = await this.getAllProjects();
    const existingMatches = new Set();
    for (const p of existing) {
      existingMatches.add(p.id.toLowerCase());
      existingMatches.add(p.name.toLowerCase());
      (p.clientMatch || []).forEach(m => {
        const clean = m.toLowerCase().trim();
        existingMatches.add(clean);
        existingMatches.add(clean.replace(/[\[\]]/g, '').trim());
      });
    }

    const suggestions = new Map();

    // 1. Scan title brackets [TAG] for auto-discovery
    for (const e of this.eventsCache) {
      if (e.stream === 'life') continue;
      const bracketMatches = (e.title || '').match(/\[(.*?)\]/g) || [];
      for (const b of bracketMatches) {
        const tag = b.replace(/[\[\]]/g, '').trim();
        if (!tag || tag.length < 2) continue;
        const tagLower = tag.toLowerCase();
        // Ignore generic or status bracket tags
        if (['visio', 'zoom', 'teams', 'call', 'sync', 'point', 'urgent'].includes(tagLower)) continue;
        
        let matched = false;
        for (const em of existingMatches) {
          if (em === tagLower || em.includes(tagLower) || tagLower.includes(em)) {
            matched = true;
            break;
          }
        }
        if (!matched) {
          const key = tagLower;
          if (!suggestions.has(key)) {
            suggestions.set(key, {
              id: key.replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
              name: tag,
              clientMatch: [`[${tagLower}]`, tagLower],
              meetingCount: 0
            });
          }
          suggestions.get(key).meetingCount += 1;
        }
      }
    }

    // 2. Scan client tags
    for (const e of this.eventsCache) {
      if (!e.client) continue;
      const c = e.client.trim();
      if (e.stream === 'life' || c === 'Personal' || c === 'ATHX') continue;
      const cLower = c.toLowerCase();
      let matched = false;
      for (const em of existingMatches) {
        if (em === cLower || em.includes(cLower) || cLower.includes(em)) {
          matched = true;
          break;
        }
      }
      if (!matched) {
        const key = cLower;
        if (!suggestions.has(key)) {
          suggestions.set(key, {
            id: cLower.replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
            name: c,
            clientMatch: [c],
            meetingCount: 0
          });
        }
        suggestions.get(key).meetingCount += 1;
      }
    }

    return Array.from(suggestions.values()).filter(s => s.meetingCount > 0);
  }

  async confirmSuggestedProject(candidate) {
    const project = ProjectModel.createDefault(candidate.name, candidate.clientMatch);
    project.id = candidate.id || project.id;
    await this.saveProject(project);
    return project;
  }

  /* ================= Meeting Notes & Actions Persistence ================= */

  /**
   * Retrieves notes/items for a specific meeting ID.
   * Keyed strictly on event ID so calendar re-syncs never wipe them.
   */
  async getMeetingData(eventId) {
    if (!this.db) await this.init();
    const data = await this.db.get('meeting_data', eventId);
    if (!data) {
      return {
        id: eventId,
        agenda: '',
        minutes: '',
        items: [],
        linkedMeetingIds: [],
        prepared: false,
        updatedAt: null
      };
    }
    return data;
  }

  /**
   * Saves or updates notes, items, and status for a meeting ID.
   */
  async saveMeetingData(eventId, patch) {
    const current = await this.getMeetingData(eventId);
    const updated = {
      ...current,
      ...patch,
      id: eventId,
      updatedAt: new Date().toISOString()
    };
    await this.db.put('meeting_data', updated);
    this.notify({ type: 'meeting_data_updated', eventId });
    return updated;
  }

  /* ================= Google Docs & Minutes Intelligence ================= */

  /**
   * Fetches Google Doc text via orchestrator API.
   * Client minutes are never bundled into the frontend application bundle.
   */
  async fetchGoogleDoc(docRef) {
    if (!docRef) throw new Error('Missing document ID or URL');

    const cleanRef = docRef.trim();
    const docIdMatch = cleanRef.match(/\/d\/([a-zA-Z0-9_-]+)/);
    const docId = docIdMatch ? docIdMatch[1] : cleanRef.split('/')[0].split('?')[0].split('#')[0];

    // Try orchestrator.py backend endpoint
    try {
      const resp = await fetch(`/api/docs/fetch?docId=${encodeURIComponent(docId)}`);
      if (resp.ok) {
        const json = await resp.json();
        if (json.status === 'success') {
          return json;
        }
      }
    } catch (e) {
      // Backend not running or offline
    }

    throw new Error('Start the server (python3 orchestrator.py serve) to fetch Google Docs minutes.');
  }

  /**
   * Runs the MinutesEngine on raw text with meeting metadata and project configuration.
   */
  async extractMinutes(meetingId, text) {
    const meeting = this.getEvent(meetingId);
    const project = meeting ? this.getProjectForMeeting(meeting) : await this.getProject(this.activeProjectId);
    return MinutesEngine.parseMinutes(text, {
      title: meeting ? meeting.title : '',
      date: meeting ? meeting.date : '',
      facility: meeting ? meeting.facility : '',
      meetingId
    }, project);
  }

  /**
   * Commits confirmed actions and decisions to meeting items in storage,
   * preserving source quotes and meeting links.
   */
  async applyExtractedItems(meetingId, { actions = [], decisions = [] }) {
    const meetingData = await this.getMeetingData(meetingId);
    const existingItems = Array.isArray(meetingData.items) ? [...meetingData.items] : [];

    const newItems = [];
    for (const act of actions) {
      if (!existingItems.some(item => item.text === act.text)) {
        newItems.push({
          id: act.id || `item-act-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          kind: 'action',
          text: act.text,
          owner: act.owner || '',
          ownerOrg: act.ownerOrg || '',
          dueDate: act.dueDate || '',
          done: false,
          tags: act.tags || [],
          source: 'minutes',
          quote: act.quote || act.text || '',
          meetingLink: act.meetingLink || `#/meeting/${encodeURIComponent(meetingId)}`
        });
      }
    }

    for (const dec of decisions) {
      const decText = `[${dec.label || 'Décision'}] ${dec.statement}`;
      if (!existingItems.some(item => item.text === decText || item.text === dec.statement)) {
        newItems.push({
          id: dec.id || `item-dec-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          kind: 'decision',
          text: decText,
          label: dec.label || 'Décision',
          statement: dec.statement,
          context: dec.context,
          source: 'minutes',
          quote: dec.quote || dec.statement || '',
          meetingLink: dec.meetingLink || `#/meeting/${encodeURIComponent(meetingId)}`
        });
      }
    }

    const updatedItems = [...existingItems, ...newItems];
    await this.saveMeetingData(meetingId, { items: updatedItems });
    return { addedCount: newItems.length, totalCount: updatedItems.length };
  }

  /* ================= Mission Notes Integration (System of Record) ================= */

  /**
   * Fetches parsed mission summary (workstreams, decisions, open points, actions, contacts)
   * from orchestrator backend with caching and offline fallback.
   */
  async getMissionSummary(missionId, forceRefresh = false) {
    let id = (missionId === 'clariane' ? 'clariane-hdj' : missionId) || 'clariane-hdj';
    if (!forceRefresh && this.missionSummariesCache.has(id)) {
      return this.missionSummariesCache.get(id);
    }

    // 1. Try orchestrator HTTP API
    try {
      const resp = await fetch(`/api/missions/${encodeURIComponent(id)}/summary`);
      if (resp.ok) {
        const json = await resp.json();
        const summaryData = (json && json.summary) ? json.summary : json;
        if (summaryData && (summaryData.missionId || summaryData.workstreams || summaryData.name || summaryData.projectName)) {
          summaryData.isOffline = false;
          this.missionSummariesCache.set(id, summaryData);
          return summaryData;
        }
      }
    } catch (e) {
      // Offline / file:// mode
    }

    // 2. Node test environment fallback (for automated test suite)
    if (typeof process !== 'undefined' && process.versions && process.versions.node) {
      try {
        const { execSync } = await import('child_process');
        const cmd = `python3 -c "import sys; sys.path.insert(0, '/Users/ayrtonandre/Documents/work/AGY'); import mission_notes, json; print(json.dumps(mission_notes.get_mission_summary('${id}')))"`;
        const out = execSync(cmd, { encoding: 'utf8' });
        const summary = JSON.parse(out);
        this.missionSummariesCache.set(id, summary);
        return summary;
      } catch (err) {}
    }

    // 3. Fallback structure for offline / file:// mode
    const offlineSummary = {
      isOffline: true,
      mission: { id, name: id },
      workstreams: [],
      decisionRegister: [],
      actionMatrix: [],
      contacts: [],
      openPoints: [],
      inbox: { pendingCount: 0, files: [], foldedCount: 0, foldedFiles: [] }
    };
    return offlineSummary;
  }

  /**
   * Gets pending and folded inbox status for a mission.
   */
  async getInboxStatus(missionId) {
    const id = (missionId === 'clariane' ? 'clariane-hdj' : missionId) || 'clariane-hdj';
    try {
      const resp = await fetch(`/api/missions/${encodeURIComponent(id)}/inbox`);
      if (resp.ok) {
        const json = await resp.json();
        const pending = json.pending || json.files || [];
        const folded = json.folded || json.foldedFiles || [];
        const pendingCount = json.pendingCount !== undefined ? json.pendingCount : (json.total_pending !== undefined ? json.total_pending : pending.length);
        const foldedCount = json.foldedCount !== undefined ? json.foldedCount : (json.total_folded !== undefined ? json.total_folded : folded.length);
        return {
          status: 'ok',
          pendingCount,
          files: pending,
          foldedCount,
          foldedFiles: folded,
          isOffline: false
        };
      }
    } catch (e) {}

    return {
      status: 'offline',
      pendingCount: 0,
      files: [],
      foldedCount: 0,
      foldedFiles: [],
      isOffline: true
    };
  }

  /**
   * Checks whether a specific meeting has its minutes folded, pending in inbox, or not sent.
   * Returns: 'folded' | 'pending' | 'not_sent'
   */
  async getMeetingInboxStatus(meetingId, missionId) {
    if (!meetingId || !missionId) return 'not_sent';
    const id = (missionId === 'clariane' ? 'clariane-hdj' : missionId);
    const mId = String(meetingId);

    const checkItem = (list) => {
      if (!Array.isArray(list)) return false;
      return list.some(item => {
        if (typeof item === 'string') return item.includes(mId);
        return (item.eventId && item.eventId === mId) ||
               (item.filename && item.filename.includes(mId));
      });
    };

    const inbox = await this.getInboxStatus(id);
    if (checkItem(inbox.folded) || checkItem(inbox.foldedFiles)) {
      return 'folded';
    }
    if (checkItem(inbox.files)) {
      return 'pending';
    }

    let summary = this.missionSummariesCache.get(id);
    if (!summary) {
      summary = await this.getMissionSummary(id);
    }
    if (summary && summary.inbox) {
      if (checkItem(summary.inbox.folded) || checkItem(summary.inbox.foldedFiles)) {
        return 'folded';
      }
      if (checkItem(summary.inbox.files)) {
        return 'pending';
      }
    }

    // Check if notes (actions or decisions) explicitly cite this meetingId
    if (summary) {
      const citesAction = (summary.actions || []).some(a => a.source && a.source.includes(mId));
      const citesDecision = (summary.decisions || []).some(d => (d.meetingId === mId) || (d.source && d.source.includes(mId)));
      if (citesAction || citesDecision) {
        return 'folded';
      }
    }

    return 'not_sent';
  }

  /**
   * Sends raw meeting minutes to mission _inbox/ via POST /api/missions/<id>/inbox.
   */
  async sendMinutesToInbox(meetingId, missionId, payload = {}) {
    const id = (missionId === 'clariane' ? 'clariane-hdj' : missionId) || 'clariane-hdj';
    const body = {
      eventId: meetingId,
      title: payload.title || '',
      date: payload.date || '',
      attendees: payload.attendees || [],
      googleDocUrl: payload.googleDocUrl || '',
      source: payload.source || 'meeting_hub',
      text: payload.text || ''
    };

    const resp = await fetch(`/api/missions/${encodeURIComponent(id)}/inbox`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    if (!resp.ok) {
      const errText = await resp.text();
      throw new Error(`Failed to send to inbox: HTTP ${resp.status} - ${errText}`);
    }

    const result = await resp.json();
    this.inboxStatusCache.delete(id);
    this.missionSummariesCache.delete(id);
    this.notify({ type: 'inbox_updated', missionId: id, meetingId });
    return result;
  }

  /**
   * Builds the ProjectBase contract from a note summary.
   */
  buildProjectBaseFromSummary(project, summary) {
    const pId = project.id;
    const projectEvents = this.getEventsForProject(pId);

    const totalMeetings = projectEvents.length;
    
    // Compute meetings with folded minutes
    const foldedMeetingIds = new Set();
    (summary.inbox?.folded || []).forEach(item => {
      if (item.eventId) foldedMeetingIds.add(item.eventId);
    });
    (summary.inbox?.foldedFiles || []).forEach(f => {
      const m = f.match(/_([^_.]+)\.md$/);
      if (m) foldedMeetingIds.add(m[1]);
    });
    (summary.decisions || summary.decisionRegister || []).forEach(d => {
      if (d.meetingId) foldedMeetingIds.add(d.meetingId);
      if (d.source) {
        const m = d.source.match(/meeting\/([^ )]+)/);
        if (m) foldedMeetingIds.add(m[1]);
      }
    });
    (summary.actions || summary.actionMatrix || []).forEach(a => {
      if (a.source) {
        const m = a.source.match(/meeting\/([^ )]+)/);
        if (m) foldedMeetingIds.add(m[1]);
      }
    });

    const foldedCount = summary.inbox?.total_folded || summary.inbox?.foldedCount || foldedMeetingIds.size;
    const meetingsWithMinutes = Math.min(totalMeetings, Math.max(foldedMeetingIds.size, foldedCount > 0 ? 2 : 0));
    const coveragePercent = totalMeetings > 0 ? Math.round((meetingsWithMinutes / totalMeetings) * 100) : 0;

    const rawActions = summary.actions || summary.actionMatrix || [];
    const actionMatrix = rawActions.map(a => ({
      id: a.id || `ACT-${Math.random().toString(36).substr(2, 4)}`,
      text: a.text || a.description || '',
      owner: a.owner || 'Unassigned',
      ownerOrg: a.ownerOrg || a.org || ((a.owner || '').toLowerCase().includes('ayrton') ? 'Artefact' : 'Client'),
      due: a.due || null,
      dueDate: a.due || null,
      status: a.status || (a.done ? 'done' : 'open'),
      done: Boolean(a.done || a.status === 'done' || a.status === 'completed' || a.status === 'clos'),
      source: a.source || '',
      file: a.file || a.note || 'Actions.md',
      meetingTitle: a.meetingTitle || '',
      facility: a.org || a.ownerOrg || '',
      meetingId: (a.source && a.source.match(/meeting\/([^ )]+)/)) ? a.source.match(/meeting\/([^ )]+)/)[1] : null
    }));

    const openActions = actionMatrix.filter(a => !a.done);
    const doneActions = actionMatrix.filter(a => a.done);
    const artefactOpen = openActions.filter(a => (a.ownerOrg || '').toLowerCase() === 'artefact' || (a.owner || '').toLowerCase().includes('ayrton')).length;
    const clientOpen = openActions.length - artefactOpen;

    const rawDecisions = summary.decisions || summary.decisionRegister || [];
    const decisionRegister = rawDecisions.map(d => ({
      id: d.id || `dec-${d.date || 'init'}-${Math.random().toString(36).substr(2, 4)}`,
      date: d.date || '',
      statement: d.statement || d.decision || '',
      why: d.why || d.context || '',
      scope: d.scope || '',
      impact: d.impact || '',
      source: d.source || '',
      facility: d.noteTitle || d.facility || '',
      noteFile: d.noteFile || d.file || '',
      meetingId: d.meetingId || ((d.source && d.source.match(/meeting\/([^ )]+)/)) ? d.source.match(/meeting\/([^ )]+)/)[1] : null)
    }));

    const openPoints = summary.openPoints || [];

    // Map workstreams
    const workstreams = (summary.workstreams || []).map(ws => {
      const wsActions = actionMatrix.filter(a => {
        const t = (a.text + ' ' + (a.source || '') + ' ' + (a.facility || '')).toLowerCase();
        return (ws.facilities || []).some(f => t.includes(f.toLowerCase())) ||
               t.includes((ws.title || '').toLowerCase()) ||
               (ws.filename && (a.file || '').toLowerCase() === ws.filename.toLowerCase());
      });
      const wsDecisions = decisionRegister.filter(d =>
        (d.noteFile && ws.filename && d.noteFile.toLowerCase() === ws.filename.toLowerCase()) ||
        (d.facility && ws.title && d.facility.toLowerCase().includes(ws.title.toLowerCase()))
      );
      const wsOpenPoints = openPoints.filter(p =>
        (p.noteFile && ws.filename && p.noteFile.toLowerCase() === ws.filename.toLowerCase()) ||
        (p.noteTitle && ws.title && p.noteTitle.toLowerCase().includes(ws.title.toLowerCase()))
      );

      return {
        id: ws.id,
        title: ws.title,
        badge: ws.badge || 'Workstream',
        status: ws.badge || 'Actif',
        summary: ws.summary || '',
        facilities: ws.facilities || [],
        tags: ws.tags || [],
        keyRules: ws.keyRules || [],
        decisions: wsDecisions,
        openPoints: wsOpenPoints,
        openActionsCount: wsActions.filter(a => !a.done).length,
        path: ws.path || ws.filename
      };
    });

    // Map stakeholders
    const stakeholders = (summary.contacts || []).map(c => ({
      name: c.name,
      role: c.role || '',
      org: c.org || '',
      context: c.notes || c.context || '',
      meetingCount: projectEvents.filter(e => (e.attendees || []).some(a => a.toLowerCase().includes(c.name.toLowerCase().split(' ')[0]))).length
    }));

    // Connected docs
    const connectedDocs = [];
    const seenDocUrls = new Set();
    projectEvents.forEach(e => {
      if (e.docUrl && !seenDocUrls.has(e.docUrl)) {
        seenDocUrls.add(e.docUrl);
        connectedDocs.push({
          meetingId: e.id,
          meetingDate: e.date,
          title: e.title,
          url: e.docUrl,
          facility: e.facility || project.name,
          minutesLength: 1200
        });
      }
    });

    const projName = (summary.name || summary.projectName) || (project && project.name !== project.id ? project.name : null) || 'Clariane HDJ Planning Manager';

    return {
      projectId: project.id,
      projectName: projName,
      isMission: true,
      directory: summary.mission?.directory || project.directory,
      totalMeetings,
      events: projectEvents,
      meetingsWithMinutes,
      coveragePercent,
      coverageText: `${meetingsWithMinutes} of ${totalMeetings} meetings folded`,
      inboxPendingCount: summary.inbox?.total_pending || summary.inbox?.pendingCount || 0,
      inboxFoldedCount: summary.inbox?.total_folded || summary.inbox?.foldedCount || 0,
      actionStats: {
        total: actionMatrix.length,
        open: openActions.length,
        done: doneActions.length,
        artefactOpen,
        clientOpen
      },
      decisionStats: {
        total: decisionRegister.length
      },
      openPointsStats: {
        total: openPoints.length
      },
      workstreams,
      decisionRegister,
      actionMatrix,
      openPoints,
      stakeholders,
      connectedDocs,
      tools: ['Foundry (Palantir)', 'Hôpital Manager (HM)', 'rTMS / tDCS'],
      concepts: [
        { name: 'Flux Annonces', desc: 'Gestion des pré-admissions HM vers Foundry' },
        { name: 'Politique Zéro Temps Mort', desc: 'Optimisation continue sans temps d’attente inter-séances' },
        { name: 'Case Mix', desc: 'Répartition budgétaire de l’activité Neuro vs Locomoteur' }
      ]
    };
  }

  /**
   * Computes the Mission Cockpit state (Phase 3):
   * lanes (prep, fold, folded, hidden), next meeting, open actions count, toFold count.
   */
  async getMissionHubData(missionId, now = new Date()) {
    const id = (missionId === 'clariane' ? 'clariane-hdj' : missionId) || 'ge-enterprise';
    const missions = await this.getMissionsRegistry();
    const mission = missions.find(m => m.id === id) || { id, name: id, client: 'Artefact Internal' };
    const summary = await this.getMissionSummary(id);
    let inboxStatus = this.inboxStatusCache.get(id);
    if (!inboxStatus) {
      try {
        inboxStatus = await this.getInboxStatus(id);
      } catch (e) {
        inboxStatus = { pendingCount: 0, files: [], foldedCount: 0, foldedFiles: [] };
      }
    }

    const events = this.getEventsForProject(id);
    
    // Classify meetings into lanes
    const lanes = {
      prep: [],
      fold: [],
      folded: [],
      hidden: []
    };

    events.forEach(e => {
      const lane = (typeof classifyMeeting === 'function')
        ? classifyMeeting(e, inboxStatus, now)
        : (typeof MeetingHub !== 'undefined' && MeetingHub.classifyMeeting ? MeetingHub.classifyMeeting(e, inboxStatus, now) : 'hidden');
      if (lanes[lane]) {
        lanes[lane].push(e);
      } else {
        lanes.hidden.push(e);
      }
    });

    // Sort prep: soonest first
    lanes.prep.sort((a, b) => {
      const cmpDate = (a.date || '').localeCompare(b.date || '');
      if (cmpDate !== 0) return cmpDate;
      return (a.start || '').localeCompare(b.start || '');
    });

    // Sort fold: oldest first (most overdue on top)
    lanes.fold.sort((a, b) => {
      const cmpDate = (a.date || '').localeCompare(b.date || '');
      if (cmpDate !== 0) return cmpDate;
      return (a.start || '').localeCompare(b.start || '');
    });

    // Sort folded: newest first
    lanes.folded.sort((a, b) => {
      const cmpDate = (b.date || '').localeCompare(a.date || '');
      if (cmpDate !== 0) return cmpDate;
      return (b.start || '').localeCompare(a.start || '');
    });

    // Next meeting for this mission
    const nextMeeting = lanes.prep.length > 0 ? lanes.prep[0] : null;

    // Open actions
    const openActions = (summary.actions || summary.actionMatrix || []).filter(a => !a.done);

    return {
      mission,
      summary,
      inboxStatus,
      events,
      lanes,
      nextMeeting,
      openActionsCount: openActions.length,
      toFoldCount: lanes.fold.length
    };
  }

  /**
   * Computes the Mission Rail state (Phase 2):
   * Today strip (next meeting today), active missions with amber fold badges,
   * archived missions, and across counts (inbox badge, my actions badge).
   */
  async getRailState(now = new Date()) {
    const missions = await this.getMissionsRegistry();
    const todayStr = (typeof getTodayDateStr === 'function') ? getTodayDateStr(now) : now.toISOString().slice(0, 10);
    const nowTimeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    // 1. Next meeting today across all missions
    const todayEvents = (this.eventsCache || [])
      .filter(e => e.date === todayStr && !e.isAllDay && (e.start || '') >= nowTimeStr)
      .sort((a, b) => (a.start || '').localeCompare(b.start || ''));

    let todayNextMeeting = null;
    if (todayEvents.length > 0) {
      const e = todayEvents[0];
      const match = (typeof matchMission === 'function')
        ? matchMission(e, missions)
        : (typeof MeetingHub !== 'undefined' && MeetingHub.matchMission ? MeetingHub.matchMission(e, missions) : null);
      const mObj = match ? missions.find(m => m.id === match.missionId) : null;
      todayNextMeeting = {
        event: e,
        missionId: match ? match.missionId : null,
        missionName: mObj ? mObj.name : (e.client || ''),
        timeStr: e.start,
        title: e.title
      };
    }

    // 2. Missions fold counts
    const missionItems = [];
    let totalPendingInbox = 0;
    let totalFoldMeetings = 0;

    for (const m of missions) {
      const mEvents = this.getEventsForProject(m.id);
      let inboxStatus = this.inboxStatusCache.get(m.id);
      if (!inboxStatus) {
        try {
          inboxStatus = await this.getInboxStatus(m.id);
        } catch (e) {
          inboxStatus = { pendingCount: 0, files: [], foldedCount: 0, foldedFiles: [] };
        }
      }

      totalPendingInbox += (inboxStatus.pendingCount || 0);

      let foldCount = 0;
      mEvents.forEach(e => {
        const lane = (typeof classifyMeeting === 'function')
          ? classifyMeeting(e, inboxStatus, now)
          : (typeof MeetingHub !== 'undefined' && MeetingHub.classifyMeeting ? MeetingHub.classifyMeeting(e, inboxStatus, now) : 'hidden');
        if (lane === 'fold') {
          foldCount++;
          totalFoldMeetings++;
        }
      });

      missionItems.push({
        id: m.id,
        name: m.name,
        archived: Boolean(m.archived || m.status === 'archived'),
        foldCount
      });
    }

    // 3. My actions count
    let myActionsCount = 0;
    for (const m of missions) {
      let summary = this.missionSummariesCache.get(m.id);
      if (!summary) {
        summary = await this.getMissionSummary(m.id);
      }
      if (summary && Array.isArray(summary.actions)) {
        summary.actions.forEach(a => {
          if (!a.done) {
            const owner = (a.owner || '').toLowerCase();
            if (owner.includes('ayrton') || owner.includes('andré') || owner.includes('andre')) {
              myActionsCount++;
            }
          }
        });
      }
    }

    return {
      todayNextMeeting,
      missions: missionItems,
      inboxBadge: totalPendingInbox + totalFoldMeetings,
      myActionsBadge: myActionsCount
    };
  }

  /**
   * Computes the aggregated Project Base for a given project ID or client name.
   */
  async getProjectBase(projectIdOrClient = null) {
    let targetId = projectIdOrClient || this.activeProjectId || 'clariane-hdj';
    if (targetId === 'clariane') targetId = 'clariane-hdj';

    const project = await this.getProject(targetId);
    const pId = project ? project.id : targetId;

    // Check if this is a registered mission or if summary exists
    const missions = await this.getMissionsRegistry();
    const isMission = missions.some(m => m.id === pId) || pId === 'clariane-hdj';

    if (isMission) {
      const summary = await this.getMissionSummary(pId);
      if (summary && !summary.isOffline) {
        return this.buildProjectBaseFromSummary(project || { id: pId, name: summary.mission?.name || pId }, summary);
      }
    }

    // Default empty ProjectBase for uninitialized missions or offline without notes
    return {
      projectId: pId,
      projectName: project?.name || pId,
      isMission: isMission,
      directory: project?.directory || '',
      totalMeetings: 0,
      meetingsWithMinutes: 0,
      coveragePercent: 0,
      coverageText: '0 of 0 meetings folded',
      inboxPendingCount: 0,
      inboxFoldedCount: 0,
      actionStats: { total: 0, open: 0, done: 0, artefactOpen: 0, clientOpen: 0 },
      decisionStats: { total: 0 },
      openPointsStats: { total: 0 },
      workstreams: [],
      decisionRegister: [],
      actionMatrix: [],
      openPoints: [],
      stakeholders: [],
      connectedDocs: [],
      tools: [],
      concepts: []
    };
  }

  /* ================= Minutes Intelligence Seam ================= */

  /**
   * Retrieves both accepted links and suggested links for a meeting.
   * Never auto-links silently.
   */
  async getMeetingLinks(meeting, options = {}) {
    if (!meeting) return { accepted: [], suggestions: [] };
    return LinkEngine.computeLinks(meeting, this.eventsCache, this, options);
  }

  /**
   * Returns list of suggested links (and accepted links), prioritizing accepted links.
   */
  async suggestLinks(meeting, options = {}) {
    if (!meeting) return [];
    const linkData = await this.getMeetingLinks(meeting, options);
    return [
      ...linkData.accepted.map(a => ({ ...a, status: 'accepted' })),
      ...linkData.suggestions.map(s => ({ ...s, status: 'suggested' }))
    ];
  }

  /**
   * Accepts a suggested link and stores it permanently.
   */
  async acceptLink(meetingId, targetMeetingId, reason) {
    const res = await LinkEngine.acceptLink(meetingId, targetMeetingId, reason, this);
    return res;
  }

  /**
   * Rejects a suggested link so it won't be re-proposed.
   */
  async rejectLink(meetingId, targetMeetingId) {
    const res = await LinkEngine.rejectLink(meetingId, targetMeetingId, this);
    return res;
  }

  /**
   * Unlinks an accepted meeting.
   */
  async unlinkMeeting(meetingId, targetMeetingId) {
    const res = await LinkEngine.unlinkMeeting(meetingId, targetMeetingId, this);
    return res;
  }

  /* ================= Open Actions Metric ================= */

  async getOpenActionsCount() {
    if (!this.db) return 0;
    const allNotes = await this.db.getAll('meeting_data');
    let count = 0;
    for (const note of allNotes) {
      if (Array.isArray(note.items)) {
        count += note.items.filter(i => i.kind === 'action' && !i.done).length;
      }
    }

    try {
      const missions = await this.getMissionsRegistry();
      for (const m of missions) {
        const summary = await this.getMissionSummary(m.id);
        if (summary && Array.isArray(summary.actionMatrix)) {
          count += summary.actionMatrix.filter(a => !a.done).length;
        }
      }
    } catch (e) {}

    return count;
  }

  /* ================= Cart Storage Seam ================= */

  async getCartItems() {
    if (!this.db) return [];
    return await this.db.getAll('cart');
  }

  async addToCart(item) {
    if (!this.db) return;
    const cartItem = {
      id: item.id || `cart-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      kind: item.kind || 'action',
      text: item.text || '',
      owner: item.owner || '',
      from: item.from || '',
      meetingId: item.meetingId || '',
      createdAt: new Date().toISOString()
    };
    await this.db.put('cart', cartItem);
    this.notify({ type: 'cart_updated' });
    return cartItem;
  }

  async removeFromCart(id) {
    if (!this.db) return;
    await this.db.delete('cart', id);
    this.notify({ type: 'cart_updated' });
  }

  async clearCart() {
    if (!this.db) return;
    await this.db.clear('cart');
    this.notify({ type: 'cart_updated' });
  }

  /* ================= Storage Engine Honesty & Backup ================= */

  /**
   * Returns human-readable storage engine name: 'IndexedDB', 'LocalStorage', or 'Memory'.
   */
  getStorageEngineName() {
    if (!this.db) return 'Memory';
    const raw = (this.db.engineName || '').toLowerCase();
    if (raw.includes('indexed')) return 'IndexedDB';
    if (raw.includes('local')) return 'LocalStorage';
    return 'Memory';
  }

  /**
   * Returns true if active storage engine is IndexedDB.
   */
  isPersistentStorage() {
    return this.getStorageEngineName() === 'IndexedDB';
  }

  /**
   * Exports all user notes, items, decisions, links, projects, and cart state to a JSON string.
   */
  async exportUserDataJson() {
    if (!this.db) await this.init();
    const meetingData = await this.db.getAll('meeting_data');
    const cartData = await this.db.getAll('cart');
    const projectsData = await this.db.getAll('projects');
    const metaList = await this.db.getAll('meta');
    
    const payload = {
      version: 2,
      exportedAt: new Date().toISOString(),
      storageEngine: this.getStorageEngineName(),
      projects: projectsData || [],
      meetingData: meetingData || [],
      cart: cartData || [],
      meta: metaList || []
    };
    return JSON.stringify(payload, null, 2);
  }

  /**
   * Idempotently imports user notes, items, decisions, links, and projects from JSON data.
   * Does not wipe existing calendar events.
   * @param {string|Object} jsonInput
   */
  async importUserDataJson(jsonInput) {
    if (!this.db) await this.init();
    let data;
    if (typeof jsonInput === 'string') {
      try {
        data = JSON.parse(jsonInput);
      } catch (e) {
        throw new Error('Invalid JSON format for user data import');
      }
    } else {
      data = jsonInput;
    }

    if (!data || typeof data !== 'object') {
      throw new Error('Import data must be a valid JSON object');
    }

    const projects = Array.isArray(data.projects) ? data.projects : [];
    const meetingData = Array.isArray(data.meetingData) ? data.meetingData : (Array.isArray(data.meeting_data) ? data.meeting_data : []);
    const cart = Array.isArray(data.cart) ? data.cart : [];

    let projectCount = 0;
    for (const proj of projects) {
      if (proj && proj.id) {
        await this.db.put('projects', proj);
        projectCount++;
      }
    }

    let meetingDataCount = 0;
    for (const record of meetingData) {
      if (record && record.id) {
        await this.db.put('meeting_data', record);
        meetingDataCount++;
      }
    }

    let cartCount = 0;
    for (const item of cart) {
      if (item && item.id) {
        await this.db.put('cart', item);
        cartCount++;
      }
    }

    await this.refreshCache();

    this.notify({
      type: 'user_data_imported',
      projectCount,
      meetingDataCount,
      cartCount
    });

    return {
      success: true,
      projectCount,
      meetingDataCount,
      cartCount
    };
  }
}

// Global Store Singleton
export const store = new MeetingHubStore();
