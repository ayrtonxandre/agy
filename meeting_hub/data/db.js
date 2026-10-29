/**
 * Application Database Configuration & Schema
 */
import { IndexedDBAdapter, LocalStorageAdapter, MemoryAdapter } from './adapter.js';

export const DB_NAME = 'MeetingHubDB';
export const DB_VERSION = 2;

export const DB_SCHEMA = {
  // Configured projects
  projects: {
    keyPath: 'id'
  },

  // Calendar events imported and synced from external feeds
  events: {
    keyPath: 'id',
    indexes: {
      date: { keyPath: 'date', unique: false },
      stream: { keyPath: 'stream', unique: false },
      client: { keyPath: 'client', unique: false },
      series: { keyPath: 'series', unique: false }
    }
  },

  // Collapsed recurring series definitions
  series: {
    keyPath: 'id',
    indexes: {
      client: { keyPath: 'client', unique: false },
      stream: { keyPath: 'stream', unique: false }
    }
  },

  // User notes, agenda, minutes, items (actions/decisions/questions/topics),
  // and linked meetings. ALWAYS keyed on event ID so re-syncing never wipes them!
  meeting_data: {
    keyPath: 'id',
    indexes: {
      updatedAt: { keyPath: 'updatedAt', unique: false }
    }
  },

  // Persistent cart basket
  cart: {
    keyPath: 'id',
    indexes: {
      createdAt: { keyPath: 'createdAt', unique: false },
      kind: { keyPath: 'kind', unique: false }
    }
  },

  // Meta & sync timestamps
  meta: {
    keyPath: 'key'
  }
};

let dbInstance = null;

export async function getDatabase(preferredAdapter = null) {
  if (dbInstance) return dbInstance;

  if (preferredAdapter) {
    await preferredAdapter.open(DB_NAME, DB_VERSION, DB_SCHEMA);
    dbInstance = preferredAdapter;
    return dbInstance;
  }

  // Attempt IndexedDB first if supported in browser environment
  const hasIndexedDB = typeof window !== 'undefined' && 'indexedDB' in window && window.indexedDB !== null;
  if (hasIndexedDB) {
    try {
      const idb = new IndexedDBAdapter();
      await idb.open(DB_NAME, DB_VERSION, DB_SCHEMA);
      dbInstance = idb;
      console.log('[MeetingHubDB] Storage engine initialized: IndexedDB');
      return dbInstance;
    } catch (err) {
      console.warn('[MeetingHubDB] IndexedDB failed or timed out, activating LocalStorage fallback:', err);
    }
  }

  // Fallback to LocalStorage if window is available
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const ls = new LocalStorageAdapter();
      await ls.open(DB_NAME, DB_VERSION, DB_SCHEMA);
      dbInstance = ls;
      console.log('[MeetingHubDB] Storage engine initialized: LocalStorage fallback');
      return dbInstance;
    } catch (err) {
      console.warn('[MeetingHubDB] LocalStorage failed, activating Memory fallback:', err);
    }
  }

  // In-memory fallback
  const mem = new MemoryAdapter();
  await mem.open(DB_NAME, DB_VERSION, DB_SCHEMA);
  dbInstance = mem;
  console.log('[MeetingHubDB] Storage engine initialized: MemoryAdapter');
  return dbInstance;
}

export function resetDatabaseInstance() {
  dbInstance = null;
}
