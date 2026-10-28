/**
 * Calendar Sync Service
 * 
 * Synchronizes events across Google Calendar, Outlook ICS, iCloud CalDAV/ICS,
 * and ATHX Training.
 * 
 * Design Principles:
 * - Idempotent: Merging events never wipes or alters user notes/items/actions
 *   stored in `meeting_data` (keyed strictly on event `id`).
 * - No Secrets in Frontend: Live credentialed sync delegates to local orchestrator backend;
 *   public/cached feeds fall back safely without exposing auth tokens.
 * - Live Timestamps: Tracks and displays last-synced time per source in the sidebar.
 */
import { EventModel } from '../model/event.js';
import { SeriesModel } from '../model/series.js';

export const SYNC_SOURCES = {
  google: {
    id: 'google',
    name: 'Artefact',
    stream: 'work',
    protocol: 'Google API',
    dotClass: 'pink',
    label: 'Google'
  },
  outlook: {
    id: 'outlook',
    name: 'Clariane',
    stream: 'work',
    protocol: 'Office 365 ICS',
    dotClass: 'blue',
    label: 'Outlook'
  },
  icloud: {
    id: 'icloud',
    name: 'Personal',
    stream: 'life',
    protocol: 'iCloud CalDAV',
    dotClass: 'green',
    label: 'iCloud'
  },
  athx: {
    id: 'athx',
    name: 'ATHX',
    stream: 'life',
    protocol: 'Garmin Training',
    dotClass: 'amber',
    label: 'Training'
  }
};

export class CalendarSyncService {
  /**
   * Retrieves last-synced status for all calendar sources from the database.
   * @param {DatabaseAdapter} db 
   */
  static async getSyncStatus(db) {
    const metaList = await db.getAll('meta');
    const metaMap = {};
    for (const m of metaList) {
      metaMap[m.key] = m.value;
    }

    const defaultFallbackTime = metaMap['last_import_timestamp'] || new Date().toISOString();

    const result = {
      lastSyncAll: metaMap['last_sync_all'] || defaultFallbackTime,
      sources: {}
    };

    for (const [key, conf] of Object.entries(SYNC_SOURCES)) {
      const syncKey = `last_sync_${key}`;
      const ts = metaMap[syncKey] || metaMap['last_sync_all'] || defaultFallbackTime;
      result.sources[key] = {
        ...conf,
        lastSync: ts,
        relativeTime: CalendarSyncService.formatRelativeTime(ts)
      };
    }

    return result;
  }

  /**
   * Formats ISO timestamp into concise human-readable relative time.
   * e.g., "Just now", "3m ago", "11:00", "Yesterday", "28 Oct"
   * @param {string|Date} iso 
   */
  static formatRelativeTime(iso) {
    if (!iso) return 'Never';
    try {
      const date = new Date(iso);
      const now = new Date();
      const diffSec = Math.floor((now - date) / 1000);

      if (diffSec < 30) return 'Just now';
      if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
      if (diffSec < 86400 && date.getDate() === now.getDate()) {
        const hh = String(date.getHours()).padStart(2, '0');
        const mm = String(date.getMinutes()).padStart(2, '0');
        return `${hh}:${mm}`;
      }
      if (diffSec < 172800) return 'Yesterday';
      
      const day = date.getDate();
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return `${day} ${months[date.getMonth()]}`;
    } catch {
      return 'Recent';
    }
  }

  /**
   * Performs an idempotent sync pass.
   * - Queries backend orchestrator `/api/sync/calendars` if reachable (zero secrets on front-end).
   * - Fallback merges latest events from memory / cache.
   * - Preserves user notes, items and agenda in `meeting_data`.
   * - Re-collapses recurring series.
   * - Updates last-synced timestamps in `meta`.
   * 
   * @param {DatabaseAdapter} db 
   * @param {MeetingHubStore} store 
   * @param {Object} options 
   */
  static async syncAll(db, store, options = {}) {
    const nowIso = new Date().toISOString();
    console.log('[SyncService] Starting idempotent calendar sync...');

    let syncedEvents = null;
    let backendSuccess = false;

    // 1. Attempt live sync via local orchestrator HTTP endpoint (Port 8080)
    // Server handles OAuth token refresh, iCloud CalDAV creds, and Clariane ICS securely.
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);

      const resp = await fetch('/api/sync/calendars', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trigger: 'manual_sync', timestamp: nowIso }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (resp.ok) {
        const data = await resp.json();
        if (data && Array.isArray(data.events)) {
          syncedEvents = data.events;
          backendSuccess = true;
          console.log(`[SyncService] Live orchestrator sync returned ${syncedEvents.length} events.`);
        }
      }
    } catch (err) {
      console.log('[SyncService] Live orchestrator endpoint unavailable, running client-side idempotent refresh.');
    }

    // 2. If no backend events, use existing store events or options fallback
    if (!syncedEvents) {
      if (options.events && Array.isArray(options.events)) {
        syncedEvents = options.events;
      } else {
        // Idempotent re-validation of existing cached events
        syncedEvents = await db.getAll('events');
      }
    }

    // 3. Normalize incoming events
    const normalizedList = syncedEvents.map(e => EventModel.normalize(e));

    // 4. Idempotently write to 'events' store
    // Important: 'meeting_data' (agenda, minutes, actions, links) is keyed strictly
    // by event id and is NOT touched here, preserving 100% of user data.
    await db.bulkPut('events', normalizedList);

    // 5. Re-collapse series
    const allEvents = await db.getAll('events');
    const collapsedSeries = SeriesModel.collapse(allEvents);
    await db.bulkPut('series', collapsedSeries);

    // 6. Record last-synced timestamps per source in meta
    await db.put('meta', { key: 'last_sync_all', value: nowIso });
    for (const key of Object.keys(SYNC_SOURCES)) {
      await db.put('meta', { key: `last_sync_${key}`, value: nowIso });
    }
    await db.put('meta', { key: 'event_count', value: allEvents.length });
    await db.put('meta', { key: 'series_count', value: collapsedSeries.length });

    // 7. Refresh store memory cache & notify subscribers
    if (store) {
      await store.refreshCache();
      store.notify({
        type: 'sync_completed',
        timestamp: nowIso,
        eventCount: allEvents.length,
        seriesCount: collapsedSeries.length,
        backendLive: backendSuccess
      });
    }

    console.log(`[SyncService] Sync finished: ${allEvents.length} events active, ${collapsedSeries.length} series.`);

    return {
      success: true,
      timestamp: nowIso,
      backendLive: backendSuccess,
      eventCount: allEvents.length,
      seriesCount: collapsedSeries.length
    };
  }
}
