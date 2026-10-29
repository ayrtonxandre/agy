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
import { ProjectEngine } from './project_engine.js';
import { DEFAULT_CLARIANE_PROJECT, DEFAULT_PROJECTS, ProjectModel } from './project.js';

export class MeetingHubStore {
  constructor() {
    this.db = null;
    this.eventsCache = [];
    this.seriesCache = [];
    this.projectsCache = [];
    this.activeProjectId = 'clariane';
    this.subscribers = new Set();
    this.initialized = false;
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

  async refreshCache() {
    this.eventsCache = await this.db.getAll('events');
    this.seriesCache = await this.db.getAll('series');

    // Load projects and ensure default projects are seeded
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
    this.projectsCache = projects;
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
    let list = await this.db.getAll('projects');
    if (!list || list.length === 0) {
      for (const p of DEFAULT_PROJECTS) {
        await this.db.put('projects', p);
      }
      list = await this.db.getAll('projects');
      this.projectsCache = list;
      return list;
    }
    const existingIds = new Set(list.map(p => p.id));
    let updated = false;
    for (const defProj of DEFAULT_PROJECTS) {
      if (!existingIds.has(defProj.id)) {
        await this.db.put('projects', defProj);
        updated = true;
      }
    }
    if (updated) {
      list = await this.db.getAll('projects');
      this.projectsCache = list;
    }
    return list;
  }

  async getProject(id) {
    if (!this.db) await this.init();
    if (!id) return null;
    const direct = await this.db.get('projects', id);
    if (direct) return direct;
    const all = await this.getAllProjects();
    return all.find(p => 
      p.id.toLowerCase() === id.toLowerCase() ||
      p.name.toLowerCase() === id.toLowerCase() ||
      (Array.isArray(p.clientMatch) && p.clientMatch.some(m => m.toLowerCase() === id.toLowerCase()))
    ) || null;
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
    const client = (meeting.client || '').toLowerCase().trim();
    const title = (meeting.title || '').toLowerCase().trim();
    const tags = (meeting.tags || []).map(t => t.toLowerCase().trim());
    const projects = this.projectsCache || [];

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
   * Fetches Google Doc text via orchestrator API with resilient fallback to local cache.
   */
  async fetchGoogleDoc(docRef) {
    if (!docRef) throw new Error('Missing document ID or URL');

    const cleanRef = docRef.trim();
    const docIdMatch = cleanRef.match(/\/d\/([a-zA-Z0-9_-]+)/);
    const docId = docIdMatch ? docIdMatch[1] : cleanRef.split('/')[0].split('?')[0].split('#')[0];

    // 1. Try orchestrator.py backend endpoint
    try {
      const resp = await fetch(`/api/docs/fetch?docId=${encodeURIComponent(docId)}`);
      if (resp.ok) {
        const json = await resp.json();
        if (json.status === 'success') {
          return json;
        }
      }
    } catch (e) {
      // Backend not running or offline, proceed to fallback
    }

    // 2. Check local docs_cache.json
    try {
      const cacheResp = await fetch('meeting_hub/data/docs_cache.json');
      if (cacheResp.ok) {
        const cache = await cacheResp.json();
        if (cache[docId]) {
          return {
            status: 'success',
            docId,
            title: cache[docId].title,
            content: cache[docId].content,
            source: 'local_cache'
          };
        }
      }
    } catch (e) {
      // Standalone fallback
    }

    // 3. Check window.DOCS_CACHE if bundled
    if (typeof window !== 'undefined' && window.DOCS_CACHE && window.DOCS_CACHE[docId]) {
      const item = window.DOCS_CACHE[docId];
      return {
        status: 'success',
        docId,
        title: item.title,
        content: item.content,
        source: 'bundled_cache'
      };
    }

    // 4. Node environment fallback (for unit tests)
    if (typeof process !== 'undefined' && process.versions && process.versions.node) {
      try {
        const fs = await import('fs');
        const p = '/Users/ayrtonandre/Documents/work/AGY/meeting_hub/data/docs_cache.json';
        if (fs.existsSync(p)) {
          const cache = JSON.parse(fs.readFileSync(p, 'utf8'));
          if (cache[docId]) {
            return {
              status: 'success',
              docId,
              title: cache[docId].title,
              content: cache[docId].content,
              source: 'node_fs_cache'
            };
          }
        }
      } catch (err) {}
    }

    throw new Error(`Google Doc ${docId} not found in live Drive API or local cache.`);
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

  /**
   * Computes the aggregated Project Base for a given project ID or client name.
   */
  async getProjectBase(projectIdOrClient = null) {
    const targetId = projectIdOrClient || this.activeProjectId || 'clariane';
    return ProjectEngine.buildProjectBase(targetId, this);
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
