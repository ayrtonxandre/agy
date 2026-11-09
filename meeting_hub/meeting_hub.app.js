/**
 * Meeting Hub Compiled Application Bundle
 * Generated: 2026-11-09T08:47:00.360Z
 */
(function(window, document) {
'use strict';

window.DOCS_CACHE = {};

// Auto-generated missions registry snapshot (file:// fallback)
var MISSIONS_SNAPSHOT = (typeof window !== "undefined" ? window : globalThis).MISSIONS_SNAPSHOT = {
  "missions": [
    {
      "id": "leclerc-siplec",
      "name": "Leclerc : Siplec Referential and AI Augmentation",
      "client": "E.Leclerc / Siplec",
      "directory": "Leclerc Siplec",
      "status": "active",
      "archived": false,
      "brief": "Leclerc Siplec/Agent brief.md",
      "overview": "Leclerc Siplec/Mission Overview.md",
      "actions": "Leclerc Siplec/Actions.md",
      "inbox": "Leclerc Siplec/_inbox",
      "clientMatch": [
        "siplec",
        "leclerc",
        "entretien siplec",
        "calypso",
        "helios",
        "ulysse",
        "tata platform",
        "[main mission]",
        "main mission"
      ],
      "contacts": [
        "jérôme harousseau",
        "jerome harousseau",
        "qing zhou",
        "juliette lacroix",
        "gaëtan",
        "zineb",
        "guilhem"
      ],
      "workstreams": [
        {
          "id": "ws-data-industrialization",
          "name": "Data Architecture & Industrialization",
          "phase": "Actif",
          "summary": "Migration des cas d'usage sandbox vers la plateforme cible (Collect -> Data -> Expo, GitLab, DBT, GCP)",
          "note": "Leclerc Siplec/Data Architecture & Industrialization.md"
        },
        {
          "id": "ws-match-merge",
          "name": "Referential Quality & Match-Merge",
          "phase": "Actif",
          "summary": "Qualité de données et déduplication des 4 000 doublons usines/fournisseurs dans Calypso / Helios",
          "note": "Leclerc Siplec/Referential Quality & Match-Merge.md"
        },
        {
          "id": "ws-ai-textile-composition",
          "name": "AI Textile Product Composition",
          "phase": "Actif",
          "summary": "Extraction automatisée par IA des compositions textiles à partir de données non structurées",
          "note": "Leclerc Siplec/AI Textile Product Composition.md"
        }
      ]
    },
    {
      "id": "ge-enterprise",
      "name": "GE Enterprise & UC Wizard",
      "client": "Artefact Internal",
      "directory": "GE Enterprise",
      "status": "active",
      "archived": false,
      "brief": "GE Enterprise/Agent brief.md",
      "overview": "GE Enterprise/Mission Overview.md",
      "actions": "GE Enterprise/Actions.md",
      "inbox": "GE Enterprise/_inbox",
      "clientMatch": [
        "ge enterprise",
        "ge-enterprise",
        "uc wizard",
        "uc-wizard",
        "datastore ge",
        "weekly sync - ge enterprise",
        "[mandat ge]",
        "mandat ge",
        "mo & ge",
        "updates mo & ge",
        "dyoc",
        "one pager",
        "one pager generation",
        "edward",
        "feedback edward",
        "[ge]",
        "ge",
        "team work",
        "[team work]"
      ],
      "contacts": [
        "louis bechu",
        "edward toulemonde",
        "paul bouche",
        "camille kugler"
      ],
      "workstreams": [
        {
          "id": "ws-ge-stream",
          "name": "GE Enterprise Stream",
          "phase": "Actif",
          "summary": "Mandat principal : Datastore GE Drive, gouvernance transverse & livrables",
          "note": "GE Enterprise/GE Enterprise Stream.md"
        },
        {
          "id": "ws-uc-wizard",
          "name": "UC Wizard Development",
          "phase": "Actif",
          "summary": "Sub-stream : architecture technique, prompt engineering, interface utilisateur",
          "note": "GE Enterprise/UC Wizard Development.md"
        }
      ]
    },
    {
      "id": "healthcare-mandate",
      "name": "Healthcare Mandate & Care Dispensing",
      "client": "Artefact Internal",
      "directory": "Healthcare Mandate",
      "status": "active",
      "archived": false,
      "brief": "Healthcare Mandate/Agent brief.md",
      "overview": "Healthcare Mandate/Mission Overview.md",
      "actions": "Healthcare Mandate/Actions.md",
      "inbox": "Healthcare Mandate/_inbox",
      "clientMatch": [
        "care dispensing",
        "[care dispensing]",
        "healthcare",
        "[healthcare]",
        "healthoween",
        "healthcare practice"
      ],
      "workstreams": [
        {
          "id": "ws-healthcare-team",
          "name": "Healthcare Team & Community",
          "phase": "Actif",
          "summary": "Mandat principal : animation de la practice santé, Healthoween, rituels collectifs",
          "note": "Healthcare Mandate/Healthcare Team & Community.md"
        },
        {
          "id": "ws-care-dispensing",
          "name": "Care Dispensing",
          "phase": "Actif",
          "summary": "Sub-stream d'Ayrton : conception de l'offre Care Dispensing, slides clients et architecture",
          "note": "Healthcare Mandate/Care Dispensing.md"
        }
      ]
    },
    {
      "id": "pridefact",
      "name": "PrideFact - Mandat RSE",
      "client": "Artefact Internal",
      "directory": "PrideFact",
      "status": "active",
      "archived": false,
      "brief": "PrideFact/Agent brief.md",
      "overview": "PrideFact/Mission Overview.md",
      "actions": "PrideFact/Actions.md",
      "inbox": "PrideFact/_inbox",
      "clientMatch": [
        "pridefact",
        "[pridefact]",
        "mandat rse",
        "charte du cercle",
        "l'autre cercle",
        "women@artefact & pridefact"
      ],
      "workstreams": [
        {
          "id": "ws-pridefact-synchro",
          "name": "Synchro Mandat RSE",
          "phase": "Actif",
          "summary": "Mandat principal : gouvernance bimensuelle du collectif, sessions d'onboarding nouveaux arrivants",
          "note": "PrideFact/Synchro Mandat RSE.md"
        },
        {
          "id": "ws-charte-cercle",
          "name": "Charte du Cercle",
          "phase": "Actif",
          "summary": "Sub-stream stratégique : adhésion et signature de la charte d'engagement LGBT+ de L'Autre Cercle",
          "note": "PrideFact/Charte du Cercle.md"
        }
      ]
    },
    {
      "id": "counseling",
      "name": "Counseling & People Governance",
      "client": "Artefact Internal",
      "directory": "Counseling",
      "status": "active",
      "archived": false,
      "brief": "Counseling/Agent brief.md",
      "overview": "Counseling/Mission Overview.md",
      "actions": "Counseling/Actions.md",
      "inbox": "Counseling/_inbox",
      "clientMatch": [
        "counseling",
        "counselling",
        "counselor",
        "counselee",
        "[counseling/hr]",
        "counseling/hr",
        "[counseling]",
        "roland juilhard",
        "jamila nasri",
        "eval h2",
        "eval h2 2026",
        "[itw] - slot"
      ],
      "contacts": [
        "roland juilhard",
        "jamila nasri",
        "roland j.",
        "jamila n."
      ],
      "workstreams": [
        {
          "id": "ws-counseling-roland",
          "name": "Counselee - Roland Juilhard",
          "phase": "Actif",
          "summary": "Mentorat opérationnel, coaching de compétences, suivi 1:1 et préparation des comités d'évaluation",
          "note": "Counseling/Counselee - Roland Juilhard.md"
        },
        {
          "id": "ws-counseling-jamila",
          "name": "Counselor - Jamila NASRI",
          "phase": "Actif",
          "summary": "Accompagnement de carrière d'Ayrton, deep dive peer reviews et soutenance de progression",
          "note": "Counseling/Counselor - Jamila NASRI.md"
        },
        {
          "id": "ws-counseling-eval",
          "name": "Comités d'Évaluation & Peer Reviews",
          "phase": "Actif",
          "summary": "Campagne Eval H2 2026, sessions d'information counselors et entretiens de recrutement",
          "note": "Counseling/Comités d'Évaluation & Peer Reviews.md"
        }
      ]
    },
    {
      "id": "clariane-hdj",
      "name": "Clariane HDJ Planning Manager",
      "client": "Clariane / Inicea",
      "directory": "Clariane HDJ Planning Manager",
      "status": "archived",
      "archived": true,
      "brief": "Clariane HDJ Planning Manager/Agent brief.md",
      "overview": "Clariane HDJ Planning Manager/Mission Overview.md",
      "actions": "Clariane HDJ Planning Manager/Actions.md",
      "inbox": "Clariane HDJ Planning Manager/_inbox",
      "clientMatch": [
        "[planning hdj]",
        "[planning manager]",
        "[clariane]",
        "planning hdj",
        "planning manager",
        "planification des interventions",
        "hdj",
        "arbelles",
        "mariena",
        "mariéna",
        "glanum",
        "inicea"
      ],
      "facilities": [
        {
          "name": "Glanum",
          "specialties": [
            "Locomoteur"
          ],
          "phase": "Hypercare",
          "note": "Clariane HDJ Planning Manager/Glanum (Hypercare).md"
        },
        {
          "name": "Les Arbelles",
          "specialties": [
            "Locomoteur",
            "Neurologie"
          ],
          "phase": "Onboarding & Paramétrage",
          "note": "Clariane HDJ Planning Manager/Les Arbelles (Onboarding & Paramétrage).md"
        },
        {
          "name": "Mariéna",
          "specialties": [
            "Locomoteur",
            "Neurologie"
          ],
          "phase": "Onboarding & Paramétrage",
          "note": "Clariane HDJ Planning Manager/Mariéna (Onboarding & Paramétrage).md"
        }
      ],
      "transversal": {
        "name": "Transversal SIH HM & Moteur Foundry",
        "note": "Clariane HDJ Planning Manager/Transversal SIH HM & Moteur Foundry.md"
      }
    }
  ]
};

window.MeetingHub = window.MeetingHub || {};
const MeetingHub = window.MeetingHub;

/* === Module: data/adapter.js === */
/**
 * Database Adapter Interface & Implementations
 * 
 * Provides a thin adapter layer so the data store can be backed by:
 * - IndexedDB (default browser persistent storage)
 * - LocalStorageAdapter (zero-hang fallback if IndexedDB is blocked or times out)
 * - MemoryAdapter (in-memory mock for sandbox or headless testing)
 * - SQLite WASM / Remote API (future Step roadmap)
 */

class DatabaseAdapter {
  constructor() {
    this.engineName = 'abstract';
  }
  async open(name, version, schema) {
    throw new Error('open() not implemented');
  }
  async get(storeName, key) {
    throw new Error('get() not implemented');
  }
  async getAll(storeName, options = {}) {
    throw new Error('getAll() not implemented');
  }
  async put(storeName, value) {
    throw new Error('put() not implemented');
  }
  async bulkPut(storeName, values) {
    throw new Error('bulkPut() not implemented');
  }
  async delete(storeName, key) {
    throw new Error('delete() not implemented');
  }
  async clear(storeName) {
    throw new Error('clear() not implemented');
  }
  async count(storeName) {
    throw new Error('count() not implemented');
  }
}

/**
 * IndexedDB Implementation with Timeout & Auto-Blocked Handling
 */
class IndexedDBAdapter extends DatabaseAdapter {
  constructor() {
    super();
    this.engineName = 'indexeddb';
    this.db = null;
    this.name = null;
    this.version = null;
  }

  async open(name, version, schema) {
    this.name = name;
    this.version = version;

    return new Promise((resolve, reject) => {
      if (typeof window === 'undefined' || !window.indexedDB) {
        return reject(new Error('IndexedDB is not supported in this environment.'));
      }

      // 2000ms safety timeout: reject if browser hangs on blocked connection
      let finished = false;
      const timer = setTimeout(() => {
        if (!finished) {
          finished = true;
          reject(new Error(`IndexedDB open('${name}', v${version}) timed out after 2000ms.`));
        }
      }, 2000);

      try {
        const request = indexedDB.open(name, version);

        request.onblocked = () => {
          console.warn(`[IndexedDB] Database '${name}' open blocked by another tab or connection.`);
        };

        request.onupgradeneeded = (event) => {
          const db = event.target.result;
          for (const [storeName, config] of Object.entries(schema)) {
            let store;
            if (!db.objectStoreNames.contains(storeName)) {
              store = db.createObjectStore(storeName, {
                keyPath: config.keyPath,
                autoIncrement: config.autoIncrement || false
              });
            } else {
              store = request.transaction.objectStore(storeName);
            }

            if (config.indexes) {
              for (const [indexName, indexConfig] of Object.entries(config.indexes)) {
                if (!store.indexNames.contains(indexName)) {
                  store.createIndex(
                    indexName,
                    indexConfig.keyPath || indexName,
                    { unique: indexConfig.unique || false, multiEntry: indexConfig.multiEntry || false }
                  );
                }
              }
            }
          }
        };

        request.onsuccess = (event) => {
          if (finished) return;
          finished = true;
          clearTimeout(timer);
          this.db = event.target.result;

          this.db.onversionchange = () => {
            console.warn('[IndexedDB] Database version change detected, closing connection.');
            this.db.close();
          };

          resolve(this);
        };

        request.onerror = (event) => {
          if (finished) return;
          finished = true;
          clearTimeout(timer);
          const err = event.target.error;
          reject(new Error(`IndexedDB open('${name}') error: ${err ? err.message || err.name : 'Unknown'}`));
        };
      } catch (err) {
        if (finished) return;
        finished = true;
        clearTimeout(timer);
        reject(err);
      }
    });
  }

  _tx(storeName, mode = 'readonly') {
    if (!this.db) throw new Error('Database is not initialized. Call open() first.');
    return this.db.transaction(storeName, mode).objectStore(storeName);
  }

  async get(storeName, key) {
    return new Promise((resolve, reject) => {
      try {
        const store = this._tx(storeName, 'readonly');
        const req = store.get(key);
        req.onsuccess = () => resolve(req.result || null);
        req.onerror = () => reject(req.error);
      } catch (err) {
        reject(err);
      }
    });
  }

  async getAll(storeName, options = {}) {
    return new Promise((resolve, reject) => {
      try {
        const store = this._tx(storeName, 'readonly');
        let target = store;
        if (options.index) {
          target = store.index(options.index);
        }
        const req = options.query ? target.getAll(options.query, options.count) : target.getAll();
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => reject(req.error);
      } catch (err) {
        reject(err);
      }
    });
  }

  async put(storeName, value) {
    return new Promise((resolve, reject) => {
      try {
        const tx = this.db.transaction(storeName, 'readwrite');
        const store = tx.objectStore(storeName);
        const req = store.put(value);
        tx.oncomplete = () => resolve(req.result);
        tx.onerror = () => reject(tx.error);
        tx.onabort = () => reject(tx.error || new Error('Transaction aborted'));
      } catch (err) {
        reject(err);
      }
    });
  }

  async bulkPut(storeName, values) {
    if (!values || values.length === 0) return 0;
    return new Promise((resolve, reject) => {
      try {
        const tx = this.db.transaction(storeName, 'readwrite');
        const store = tx.objectStore(storeName);
        for (const val of values) {
          store.put(val);
        }
        tx.oncomplete = () => resolve(values.length);
        tx.onerror = () => reject(tx.error);
        tx.onabort = () => reject(tx.error || new Error('Bulk transaction aborted'));
      } catch (err) {
        reject(err);
      }
    });
  }

  async delete(storeName, key) {
    return new Promise((resolve, reject) => {
      try {
        const tx = this.db.transaction(storeName, 'readwrite');
        const store = tx.objectStore(storeName);
        store.delete(key);
        tx.oncomplete = () => resolve(true);
        tx.onerror = () => reject(tx.error);
      } catch (err) {
        reject(err);
      }
    });
  }

  async clear(storeName) {
    return new Promise((resolve, reject) => {
      try {
        const tx = this.db.transaction(storeName, 'readwrite');
        const store = tx.objectStore(storeName);
        store.clear();
        tx.oncomplete = () => resolve(true);
        tx.onerror = () => reject(tx.error);
      } catch (err) {
        reject(err);
      }
    });
  }

  async count(storeName) {
    return new Promise((resolve, reject) => {
      try {
        const store = this._tx(storeName, 'readonly');
        const req = store.count();
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      } catch (err) {
        reject(err);
      }
    });
  }
}

/**
 * Robust LocalStorage Adapter (Zero-hang Fallback)
 * Persists data to window.localStorage with an in-memory Map cache.
 */
class LocalStorageAdapter extends DatabaseAdapter {
  constructor() {
    super();
    this.engineName = 'localstorage';
    this.name = 'MeetingHubDB';
    this.schema = {};
    this.tables = {};
  }

  async open(name, version, schema) {
    this.name = name;
    this.schema = schema;
    for (const [storeName, config] of Object.entries(schema)) {
      this.tables[storeName] = new Map();
      const storageKey = `mhub_${this.name}_${storeName}`;
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          const raw = window.localStorage.getItem(storageKey);
          if (raw) {
            const list = JSON.parse(raw);
            const keyPath = config.keyPath || 'id';
            for (const item of list) {
              const k = item[keyPath];
              if (k !== undefined) {
                this.tables[storeName].set(k, item);
              }
            }
          }
        }
      } catch (e) {
        console.warn(`[LocalStorageAdapter] Failed reading ${storageKey}:`, e);
      }
    }
    return this;
  }

  _persist(storeName) {
    if (typeof window === 'undefined' || !window.localStorage) return;
    const storageKey = `mhub_${this.name}_${storeName}`;
    try {
      const list = Array.from(this.tables[storeName].values());
      window.localStorage.setItem(storageKey, JSON.stringify(list));
    } catch (e) {
      console.warn(`[LocalStorageAdapter] Quota exceeded or error saving ${storeName}:`, e);
    }
  }

  async get(storeName, key) {
    const table = this.tables[storeName];
    if (!table) return null;
    return table.get(key) || null;
  }

  async getAll(storeName, options = {}) {
    const table = this.tables[storeName];
    if (!table) return [];
    return Array.from(table.values());
  }

  async put(storeName, value) {
    const table = this.tables[storeName];
    if (!table) throw new Error(`Unknown store: ${storeName}`);
    const keyPath = this.schema[storeName]?.keyPath || 'id';
    const key = value[keyPath];
    if (key === undefined) throw new Error(`Missing keyPath '${keyPath}' on record`);
    table.set(key, value);
    this._persist(storeName);
    return key;
  }

  async bulkPut(storeName, values) {
    const table = this.tables[storeName];
    if (!table) throw new Error(`Unknown store: ${storeName}`);
    const keyPath = this.schema[storeName]?.keyPath || 'id';
    for (const val of values) {
      const key = val[keyPath];
      if (key !== undefined) {
        table.set(key, val);
      }
    }
    this._persist(storeName);
    return values.length;
  }

  async delete(storeName, key) {
    const table = this.tables[storeName];
    if (!table) return false;
    const res = table.delete(key);
    this._persist(storeName);
    return res;
  }

  async clear(storeName) {
    const table = this.tables[storeName];
    if (!table) return true;
    table.clear();
    this._persist(storeName);
    return true;
  }

  async count(storeName) {
    const table = this.tables[storeName];
    return table ? table.size : 0;
  }
}

/**
 * Memory Adapter (Fast in-memory mock for sandbox or headless testing)
 */
class MemoryAdapter extends DatabaseAdapter {
  constructor() {
    super();
    this.engineName = 'memory';
    this.schema = {};
    this.tables = {};
  }

  async open(name, version, schema) {
    this.schema = schema;
    for (const storeName of Object.keys(schema)) {
      this.tables[storeName] = new Map();
    }
    return this;
  }

  async get(storeName, key) {
    return this.tables[storeName]?.get(key) || null;
  }

  async getAll(storeName) {
    return Array.from(this.tables[storeName]?.values() || []);
  }

  async put(storeName, value) {
    const keyPath = this.schema[storeName]?.keyPath || 'id';
    const key = value[keyPath];
    this.tables[storeName].set(key, value);
    return key;
  }

  async bulkPut(storeName, values) {
    const keyPath = this.schema[storeName]?.keyPath || 'id';
    for (const val of values) {
      this.tables[storeName].set(val[keyPath], val);
    }
    return values.length;
  }

  async delete(storeName, key) {
    return this.tables[storeName]?.delete(key) || false;
  }

  async clear(storeName) {
    this.tables[storeName]?.clear();
    return true;
  }

  async count(storeName) {
    return this.tables[storeName]?.size || 0;
  }
}

MeetingHub.DatabaseAdapter = DatabaseAdapter;
MeetingHub.IndexedDBAdapter = IndexedDBAdapter;
MeetingHub.LocalStorageAdapter = LocalStorageAdapter;
MeetingHub.MemoryAdapter = MemoryAdapter;

/* === Module: data/db.js === */
/**
 * Application Database Configuration & Schema
 */


const DB_NAME = 'MeetingHubDB';
const DB_VERSION = 2;

const DB_SCHEMA = {
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

async function getDatabase(preferredAdapter = null) {
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

function resetDatabaseInstance() {
  dbInstance = null;
}

MeetingHub.DB_NAME = DB_NAME;
MeetingHub.DB_VERSION = DB_VERSION;
MeetingHub.DB_SCHEMA = DB_SCHEMA;
MeetingHub.getDatabase = getDatabase;
MeetingHub.resetDatabaseInstance = resetDatabaseInstance;

/* === Module: model/date_utils.js === */
/**
 * Date Utility Module for Meeting Hub
 * 
 * Provides timezone-safe date extraction and formatting.
 */

function getTodayDateStr(d = new Date()) {
  const pad = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function formatLongDate(dateStr) {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  const weekday = date.toLocaleDateString('en-US', { weekday: 'long' });
  const month = date.toLocaleDateString('en-US', { month: 'long' });
  return `${weekday} ${d} ${month} ${y}`;
}

function getMondayOfWeek(dateStr) {
  if (!dateStr) dateStr = getTodayDateStr();
  const [y, m, day] = dateStr.split('-').map(Number);
  const d = new Date(y, m - 1, day);
  const dow = d.getDay();
  const diff = d.getDate() - dow + (dow === 0 ? -6 : 1);
  d.setDate(diff);
  const pad = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

MeetingHub.getTodayDateStr = getTodayDateStr;
MeetingHub.formatLongDate = formatLongDate;
MeetingHub.getMondayOfWeek = getMondayOfWeek;

/* === Module: model/route_parser.js === */
/**
 * Meeting Hub Route Parser
 * 
 * Pure function parsing and formatting application routes for the Project-Centric Cockpit.
 * Handles both new Archetype A routes and legacy aliases.
 * 
 * Supported Routes:
 * - #/                                -> Root landing (resolves to last or first active mission)
 * - #/p/<missionId>                   -> Project hub, drawer closed
 * - #/p/<missionId>/m/<eventId>       -> Project hub + drawer on that meeting
 * - #/p/<missionId>/<tab>             -> Project hub with knowledge tab open (workstreams, decisions, actions, contacts, brief)
 * - #/inbox                           -> Cross-mission inbox
 * - #/my-actions                      -> Cross-mission actions
 * - #/calendar                        -> Calendar today view
 * - #/calendar/<tab>                  -> Calendar tab (week, meetings, series)
 * - #/calendar[/<tab>]/m/<eventId>    -> Calendar with drawer on that meeting
 * 
 * Legacy Aliases:
 * - #/meeting/<eventId>               -> Legacy meeting (resolves to mission or calendar)
 * - #/today, #/week, #/meetings, #/series -> Calendar views
 * - #/actions                         -> My actions
 * - #/projects                        -> Project root redirect
 */

const KNOWLEDGE_TABS = ['workstreams', 'decisions', 'actions', 'contacts', 'brief'];
const CALENDAR_TABS = ['today', 'week', 'meetings', 'series'];

function parseRoute(hash) {
  const result = {
    view: 'root',
    missionId: null,
    eventId: null,
    tab: null,
    isLegacy: false,
    redirectTo: null
  };

  if (!hash || typeof hash !== 'string') {
    return result;
  }

  // Strip query parameters and trim
  const clean = hash.replace(/\?.*$/, '').trim();

  // Normalize: remove leading # and leading/trailing slashes
  let path = clean;
  if (path.startsWith('#')) path = path.slice(1);
  if (path.startsWith('/')) path = path.slice(1);
  path = path.replace(/\/+$/, '');

  // 1. Root route: '' or '/'
  if (!path) {
    result.view = 'root';
    return result;
  }

  // 2. Project routes: p/:missionId...
  if (path.startsWith('p/')) {
    result.view = 'mission';
    const parts = path.slice(2).split('/');
    result.missionId = decodeURIComponent(parts[0]);

    if (parts.length === 1) {
      // #/p/:missionId
      return result;
    }

    if (parts[1] === 'm' && parts.length >= 3) {
      // #/p/:missionId/m/:eventId
      // Join remaining parts in case eventId had unencoded slashes
      result.eventId = decodeURIComponent(parts.slice(2).join('/'));
      return result;
    }

    if (KNOWLEDGE_TABS.includes(parts[1])) {
      // #/p/:missionId/:tab
      result.tab = parts[1];
      return result;
    }

    // Default fallback for unknown sub-segment
    result.tab = parts[1];
    return result;
  }

  // 3. Cross-mission Inbox
  if (path === 'inbox') {
    result.view = 'inbox';
    return result;
  }

  // 4. Cross-mission My Actions
  if (path === 'my-actions') {
    result.view = 'my-actions';
    return result;
  }

  // 5. Calendar routes: calendar...
  if (path === 'calendar' || path.startsWith('calendar/')) {
    result.view = 'calendar';
    const parts = path.split('/');

    if (parts.length === 1) {
      // #/calendar
      result.tab = 'today';
      return result;
    }

    // Check for #/calendar/m/:eventId
    if (parts[1] === 'm' && parts.length >= 3) {
      result.tab = 'today';
      result.eventId = decodeURIComponent(parts.slice(2).join('/'));
      return result;
    }

    // Check for #/calendar/:tab[/m/:eventId]
    if (CALENDAR_TABS.includes(parts[1])) {
      result.tab = parts[1];
      if (parts[2] === 'm' && parts.length >= 4) {
        result.eventId = decodeURIComponent(parts.slice(3).join('/'));
      }
      return result;
    }

    result.tab = parts[1] || 'today';
    return result;
  }

  // 6. Legacy meeting route: #/meeting/:eventId
  if (path.startsWith('meeting/')) {
    result.view = 'legacy-meeting';
    result.eventId = decodeURIComponent(path.slice(8));
    result.isLegacy = true;
    return result;
  }

  // 7. Legacy calendar aliases
  if (path === 'today') {
    result.view = 'calendar';
    result.tab = 'today';
    result.isLegacy = true;
    result.redirectTo = '#/calendar';
    return result;
  }

  if (path === 'week') {
    result.view = 'calendar';
    result.tab = 'week';
    result.isLegacy = true;
    result.redirectTo = '#/calendar/week';
    return result;
  }

  if (path === 'meetings') {
    result.view = 'calendar';
    result.tab = 'meetings';
    result.isLegacy = true;
    result.redirectTo = '#/calendar/meetings';
    return result;
  }

  if (path === 'series') {
    result.view = 'calendar';
    result.tab = 'series';
    result.isLegacy = true;
    result.redirectTo = '#/calendar/series';
    return result;
  }

  // 8. Legacy actions alias
  if (path === 'actions') {
    result.view = 'my-actions';
    result.isLegacy = true;
    result.redirectTo = '#/my-actions';
    return result;
  }

  // 9. Legacy projects alias
  if (path === 'projects') {
    result.view = 'projects-legacy';
    result.isLegacy = true;
    result.redirectTo = '#/';
    return result;
  }

  // Default fallback for any unrecognized hash
  result.view = 'root';
  return result;
}

function formatRoute({ view, missionId, eventId, tab }) {
  if (view === 'mission' && missionId) {
    if (eventId) {
      return `#/p/${encodeURIComponent(missionId)}/m/${encodeURIComponent(eventId)}`;
    }
    if (tab && KNOWLEDGE_TABS.includes(tab)) {
      return `#/p/${encodeURIComponent(missionId)}/${encodeURIComponent(tab)}`;
    }
    return `#/p/${encodeURIComponent(missionId)}`;
  }

  if (view === 'inbox') {
    return '#/inbox';
  }

  if (view === 'my-actions') {
    return '#/my-actions';
  }

  if (view === 'calendar') {
    const sub = tab && tab !== 'today' ? `/${tab}` : '';
    if (eventId) {
      return `#/calendar${sub}/m/${encodeURIComponent(eventId)}`;
    }
    return `#/calendar${sub}`;
  }

  return '#/';
}

MeetingHub.parseRoute = parseRoute;
MeetingHub.formatRoute = formatRoute;

/* === Module: model/mission_matcher.js === */
/**
 * Mission ↔ Meeting Matcher
 * 
 * Pure function that resolves which mission an event belongs to.
 * Priority:
 * 1. Bracket title tags (e.g. [MANDAT GE], [CARE DISPENSING], [PrideFact], [HDJ], [MO])
 * 2. Visual Calendar Color Tags (e.g. [MAIN MISSION], [COUNSELING/HR], Team Work / [GE], [HEALTHCARE], [PRIDEFACT])
 * 3. clientMatch entries from missions.yaml against title, tags, or client field
 * 4. Attendee overlap with the mission's contacts
 * Ambiguous matches return confidence: 'ambiguous'.
 */

const CALENDAR_COLOR_TAGS = {
  '1': '[ARTEFACT INTERNAL]',
  '2': '[COUNSELING/HR]',
  '3': '[ARTEFACT INTERNAL]',
  '4': '[PRIDEFACT]',
  '5': '[HEALTHCARE]',
  '6': 'Team Work',
  '7': '[MAIN MISSION]',
  '8': 'Me-time',
  '9': '[ARTEFACT INTERNAL]',
  '10': '[COUNSELING/HR]',
  '11': '[PRIDEFACT]'
};

function matchMission(event, registry) {
  if (!event) return null;
  const missions = Array.isArray(registry) ? registry : (registry?.missions || []);
  if (!missions.length) return null;

  const rawTitle = (event.title || event.summary || '').trim();
  const title = rawTitle.toLowerCase();
  const client = (event.client || '').toLowerCase().trim();
  const tags = (Array.isArray(event.tags) ? event.tags : []).map(t => String(t).toLowerCase().trim());
  const attendees = (Array.isArray(event.attendees) ? event.attendees : []).map(a => {
    if (typeof a === 'string') return a.toLowerCase().trim();
    return (a.name || a.email || '').toLowerCase().trim();
  });

  // 0. Priority 0: Explicit mission/project ID on event
  if (event.projectId || event.missionId) {
    const explicitId = (event.projectId || event.missionId).toLowerCase().trim();
    const explicitMission = missions.find(m => m.id.toLowerCase() === explicitId);
    if (explicitMission) {
      return {
        missionId: explicitMission.id,
        confidence: 'high',
        reason: `Explicit mission assignment (${explicitMission.id})`
      };
    }
  }

  // 1. First priority: Bracket title tags (e.g. [MANDAT GE], [CARE DISPENSING], [PrideFact], [HDJ], [MO])
  const bracketMatches = rawTitle.match(/\[(.*?)\]/g) || [];
  if (bracketMatches.length > 0) {
    const bracketHits = [];
    for (const rawBracket of bracketMatches) {
      const bracketClean = rawBracket.toLowerCase().trim();
      const bracketInner = bracketClean.replace(/[\[\]]/g, '').trim();
      for (const m of missions) {
        const patterns = (m.clientMatch || [m.name, m.id]).map(s => String(s).toLowerCase().trim());
        if (patterns.some(pattern => {
          const cleanPat = pattern.replace(/[\[\]]/g, '').trim();
          return pattern === bracketClean || pattern === bracketInner || cleanPat === bracketInner;
        })) {
          bracketHits.push({ mission: m, tag: rawBracket });
        }
      }
    }

    if (bracketHits.length === 1) {
      return {
        missionId: bracketHits[0].mission.id,
        confidence: 'high',
        reason: `Bracket tag "${bracketHits[0].tag}" matched mission "${bracketHits[0].mission.name}"`
      };
    } else if (bracketHits.length > 1) {
      const uniqueMissionIds = [...new Set(bracketHits.map(h => h.mission.id))];
      if (uniqueMissionIds.length === 1) {
        return {
          missionId: uniqueMissionIds[0],
          confidence: 'high',
          reason: `Bracket tag matched mission "${bracketHits[0].mission.name}"`
        };
      } else {
        return {
          missionId: bracketHits[0].mission.id,
          confidence: 'ambiguous',
          reason: `Ambiguous bracket tags matched multiple missions: ${uniqueMissionIds.join(', ')}`
        };
      }
    }
  }

  // 2. Second priority: Calendar Color Tag (visual color assigned in Google Calendar)
  const colorId = event.colorId !== undefined && event.colorId !== null ? String(event.colorId) : '';
  const colorTag = (event.colorTag || (colorId && CALENDAR_COLOR_TAGS[colorId]) || '').trim();
  if (colorTag) {
    const colorClean = colorTag.toLowerCase().trim();
    const colorInner = colorClean.replace(/[\[\]]/g, '').trim();
    const colorHits = [];

    for (const m of missions) {
      const patterns = (m.clientMatch || [m.name, m.id]).map(s => String(s).toLowerCase().trim());
      if (patterns.some(pattern => {
        const cleanPat = pattern.replace(/[\[\]]/g, '').trim();
        return pattern === colorClean || pattern === colorInner || cleanPat === colorInner;
      })) {
        colorHits.push(m);
      }
    }

    // Check if title explicitly specifies a different client/mission (e.g. "Échange mission Leclerc" miscolored)
    const titleOverrides = [];
    for (const m of missions) {
      const patterns = (m.clientMatch || [m.name, m.id]).map(s => String(s).toLowerCase().trim());
      for (const pat of patterns) {
        const cleanPat = pat.replace(/[\[\]]/g, '').trim();
        if (cleanPat && cleanPat.length >= 4 && !cleanPat.startsWith('main mission') && !cleanPat.startsWith('team work')) {
          // Check whole word or clear substring in title
          if (title.includes(cleanPat)) {
            titleOverrides.push(m);
            break;
          }
        }
      }
    }

    if (colorHits.length === 1) {
      if (titleOverrides.length === 1 && titleOverrides[0].id !== colorHits[0].id) {
        return {
          missionId: titleOverrides[0].id,
          confidence: 'high',
          reason: `Title keyword match "${titleOverrides[0].name}" overrides calendar color tag "${colorTag}"`
        };
      }
      return {
        missionId: colorHits[0].id,
        confidence: 'high',
        reason: `Calendar color tag "${colorTag}" (colorId ${colorId}) matched mission "${colorHits[0].name}"`
      };
    } else if (colorHits.length > 1) {
      const uniqueIds = [...new Set(colorHits.map(m => m.id))];
      if (uniqueIds.length === 1) {
        if (titleOverrides.length === 1 && titleOverrides[0].id !== uniqueIds[0]) {
          return {
            missionId: titleOverrides[0].id,
            confidence: 'high',
            reason: `Title keyword match "${titleOverrides[0].name}" overrides calendar color tag "${colorTag}"`
          };
        }
        return {
          missionId: uniqueIds[0],
          confidence: 'high',
          reason: `Calendar color tag "${colorTag}" matched mission "${colorHits[0].name}"`
        };
      }
    }
  }

  // 3. Third priority: clientMatch entries, title match, event tags, client field
  const scoredMissions = [];
  for (const m of missions) {
    let score = 0;
    const matchReasons = [];
    const patterns = (m.clientMatch || [m.name, m.id]).map(s => String(s).toLowerCase().trim());

    for (const pat of patterns) {
      const cleanPat = pat.replace(/[\[\]]/g, '').trim();
      if (!cleanPat) continue;

      // Exact phrase in title
      if (title.includes(pat) || title.includes(cleanPat)) {
        score += 10;
        matchReasons.push(`Title matches "${pat}"`);
      }
      // Tag match
      if (tags.some(t => t === pat || t === cleanPat || t.includes(cleanPat))) {
        score += 6;
        matchReasons.push(`Tag matches "${pat}"`);
      }
      // Client field match
      if (client && (client === pat || client === cleanPat || client.includes(cleanPat))) {
        score += 5;
        matchReasons.push(`Client field matches "${pat}"`);
      }
    }

    if (score > 0) {
      scoredMissions.push({
        mission: m,
        score,
        reason: matchReasons.join(', ')
      });
    }
  }

  if (scoredMissions.length > 0) {
    scoredMissions.sort((a, b) => b.score - a.score);
    const top = scoredMissions[0];
    const runnerUp = scoredMissions[1];

    if (runnerUp && runnerUp.score === top.score && runnerUp.mission.id !== top.mission.id) {
      return {
        missionId: top.mission.id,
        confidence: 'ambiguous',
        reason: `Ambiguous match between "${top.mission.name}" and "${runnerUp.mission.name}"`
      };
    }

    return {
      missionId: top.mission.id,
      confidence: top.score >= 10 ? 'high' : 'medium',
      reason: top.reason
    };
  }

  // 4. Fourth priority: Attendee overlap with mission contacts if available
  for (const m of missions) {
    const contactNames = (m.contacts || []).map(c => (typeof c === 'string' ? c : c.name || '').toLowerCase().trim());
    const matchedContacts = attendees.filter(att => 
      contactNames.some(c => c && (att.includes(c) || c.includes(att)))
    );
    if (matchedContacts.length > 0) {
      return {
        missionId: m.id,
        confidence: 'medium',
        reason: `Attendee overlap matched: ${matchedContacts.join(', ')}`
      };
    }
  }

  return null;
}

MeetingHub.CALENDAR_COLOR_TAGS = CALENDAR_COLOR_TAGS;
MeetingHub.matchMission = matchMission;

/* === Module: model/lane_classifier.js === */
/**
 * Meeting Lane Classifier
 * 
 * Pure function that classifies a mission meeting into one of 4 lanes:
 * 1. 'prep': Mission meetings starting in the next 48h (or in progress)
 * 2. 'fold': Meetings ended in the last 14 days with uncaptured minutes or pending in inbox
 * 3. 'folded': Meetings whose minutes are folded into mission notes
 * 4. 'hidden': Older than 14 days uncaptured, cancelled, or > 48h away
 * 
 * @param {Object} event - Normalized meeting event
 * @param {string|Object} inboxStatus - 'folded' | 'pending' | 'not_sent' or status object
 * @param {Date|string|number} now - Reference time (default: current Date)
 * @param {number} prepWindowHours - Hours ahead to include in prep (default: 48)
 * @returns {'prep' | 'fold' | 'folded' | 'hidden'}
 */

function classifyMeeting(event, inboxStatus, now = new Date(), prepWindowHours = 48) {
  if (!event) return 'hidden';

  // Check cancelled or declined status
  if (event.status === 'cancelled' || event.status === 'declined') {
    return 'hidden';
  }

  // Check folded status
  const isFolded = typeof inboxStatus === 'string'
    ? inboxStatus === 'folded'
    : Boolean(inboxStatus && (inboxStatus.status === 'folded' || inboxStatus.isFolded));

  if (isFolded) {
    return 'folded';
  }

  const nowDate = now instanceof Date ? now : new Date(now);
  const nowMs = nowDate.getTime();

  // Helper to parse date consistently
  const parseTime = (dateStr, timeStr) => {
    if (timeStr && typeof timeStr === 'string' && timeStr.includes('T')) {
      const parsed = new Date(timeStr);
      if (!isNaN(parsed.getTime())) return parsed.getTime();
    }
    if (dateStr) {
      const parts = String(dateStr).split('-').map(Number);
      if (parts.length === 3) {
        const timeParts = String(timeStr || '00:00').split(':').map(Number);
        const d = new Date(parts[0], parts[1] - 1, parts[2], timeParts[0] || 0, timeParts[1] || 0, 0);
        return d.getTime();
      }
    }
    return 0;
  };

  let startMs = parseTime(event.date, event.start);
  let endMs = parseTime(event.date, event.end);

  if (!startMs) {
    return 'hidden';
  }
  if (!endMs || endMs <= startMs) {
    endMs = startMs + (event.durationMin || 45) * 60 * 1000;
  }

  const prepWindowMs = prepWindowHours * 60 * 60 * 1000;
  const foldWindowMs = 14 * 24 * 60 * 60 * 1000;

  // Case 1: Event has ended
  if (endMs <= nowMs) {
    // Minutes waiting in the inbox always need folding, however old the meeting is
    const isPending = typeof inboxStatus === 'string'
      ? inboxStatus === 'pending'
      : Boolean(inboxStatus && inboxStatus.status === 'pending');
    if (isPending) return 'fold';
    const timeSinceEnd = nowMs - endMs;
    if (timeSinceEnd <= foldWindowMs) {
      return 'fold';
    }
    return 'hidden';
  }

  // Case 2: Event is in progress or starts in the next 48h
  if (startMs <= nowMs + prepWindowMs) {
    return 'prep';
  }

  // Case 3: Future event beyond prep window
  return 'hidden';
}

MeetingHub.classifyMeeting = classifyMeeting;

/* === Module: model/event.js === */
/**
 * Event Model & Normalization
 * 
 * Maps raw multi-calendar events (Google, Outlook ICS, iCloud, ATHX) into
 * the clean, standardized Meeting Hub domain model.
 */




class EventModel {
  static isDeletedOrDeclined(raw, deletedIdsSet = null) {
    if (!raw || typeof raw !== 'object') return true;
    const id = String(raw.id || '');
    if (deletedIdsSet && id && deletedIdsSet.has(id)) {
      return true;
    }
    const status = String(raw.status || '').toLowerCase();
    if (status === 'cancelled' || status === 'canceled' || status === 'declined') {
      return true;
    }
    const summary = String(raw.summary || raw.title || '').trim().toLowerCase();
    if (
      summary.startsWith('canceled:') ||
      summary.startsWith('cancelled:') ||
      summary.startsWith('annulé:') ||
      summary.startsWith('annulé :')
    ) {
      return true;
    }
    if (Array.isArray(raw.attendees)) {
      for (const att of raw.attendees) {
        if (att && typeof att === 'object') {
          const isSelf = Boolean(att.self) || String(att.email || '').toLowerCase().includes('ayrton.andre');
          const attStatus = String(att.status || att.responseStatus || '').toLowerCase();
          if (isSelf && attStatus === 'declined') {
            return true;
          }
        }
      }
    }
    return false;
  }

  static normalize(raw) {
    let id = raw.id || '';
    const recurrenceId = raw.recurrenceId || raw.recurrence_id || raw.recurrence || (raw.originalStartTime && (raw.originalStartTime.dateTime || raw.originalStartTime.date)) || '';
    if (recurrenceId) {
      const cleanRecurrence = String(recurrenceId).replace(/[^a-zA-Z0-9]/g, '');
      if (cleanRecurrence && !id.includes(cleanRecurrence)) {
        id = `${id}_${cleanRecurrence}`;
      }
    }
    const summary = (raw.summary || raw.title || '(Untitled)').trim();
    const source = raw.source || '';
    const desc = raw.description || '';
    const location = raw.location || '';
    const isAllDay = Boolean(raw.isAllDay || raw.is_all_day);

    // Extract start and end times
    let date = raw.date || '';
    let start = raw.start || raw.startTime || '00:00';
    let end = raw.end || raw.endTime || '00:00';

    if (typeof start === 'string' && start.includes('T')) {
      date = start.slice(0, 10);
      start = start.slice(11, 16);
    }
    if (typeof end === 'string' && end.includes('T')) {
      end = end.slice(11, 16);
    }

    const durationMin = raw.durationMin !== undefined ? raw.durationMin : EventModel.calculateDuration(start, end);
    const colorId = raw.colorId !== undefined && raw.colorId !== null
      ? String(raw.colorId)
      : (raw.color_id !== undefined && raw.color_id !== null ? String(raw.color_id) : '');
    const colorTag = raw.colorTag || (colorId && CALENDAR_COLOR_TAGS[colorId]) || '';

    const { stream, client, isTraining } = EventModel.detectStreamAndClient(summary, source, desc, location, raw.attendees, raw.organizer, colorId, colorTag);
    const series = raw.series || EventModel.extractSeriesId(id, summary);
    const tags = Array.isArray(raw.tags) ? [...raw.tags] : EventModel.extractTags(`${summary} ${desc}`);
    if (colorTag) {
      if (!tags.includes(colorTag)) tags.push(colorTag);
      const cleanTag = colorTag.replace(/[\[\]]/g, '').trim().toLowerCase().replace(/[^a-z0-9]+/g, '-');
      if (cleanTag && !tags.includes(cleanTag)) tags.push(cleanTag);
    }
    const attendees = Array.isArray(raw.attendees) ? EventModel.formatAttendees(raw.attendees) : [];
    const videoUrl = raw.videoUrl || raw.video_link || raw.videoLink || '';
    const link = raw.link || EventModel.detectVideoPlatform(videoUrl);
    const docMatch = (desc + ' ' + (Array.isArray(raw.attachments) ? raw.attachments.map(a => a.fileUrl || '').join(' ') : '')).match(/https:\/\/docs\.google\.com\/document\/d\/[a-zA-Z0-9_-]+/);
    const googleDocUrl = raw.googleDocUrl || (docMatch ? docMatch[0] : '');

    return {
      id,
      date,
      start,
      end,
      durationMin,
      title: summary,
      stream,
      client,
      series,
      attendees,
      tags,
      link,
      videoUrl,
      googleDocUrl,
      isAllDay,
      isTraining,
      isCustom: Boolean(raw.isCustom || String(id).startsWith('custom-') || String(id).startsWith('evt-')),
      status: raw.status || 'confirmed',
      location,
      description: desc,
      source,
      colorId,
      colorTag
    };
  }

  static calculateDuration(start, end) {
    try {
      const [sh, sm] = start.split(':').map(Number);
      const [eh, em] = end.split(':').map(Number);
      let diff = (eh * 60 + em) - (sh * 60 + sm);
      if (diff < 0) diff += 1440;
      return diff;
    } catch {
      return 0;
    }
  }

  static detectStreamAndClient(summary, source, desc, location, attendees = [], organizer = {}, colorId = '', colorTag = '') {
    const cId = String(colorId || '');
    const cTag = String(colorTag || (cId && CALENDAR_COLOR_TAGS[cId]) || '');

    // Calendar Color Tag has explicit precedence when set
    if (cId === '8' || cTag === 'Me-time') {
      return { stream: 'life', client: 'ATHX', isTraining: true };
    }
    if (cId === '7' || cTag === '[MAIN MISSION]') {
      return { stream: 'work', client: 'Leclerc / Siplec', isTraining: false };
    }
    if (cId === '2' || cId === '10' || cTag === '[COUNSELING/HR]') {
      return { stream: 'work', client: 'Counseling', isTraining: false };
    }
    if (cId === '5' || cTag === '[HEALTHCARE]') {
      return { stream: 'work', client: 'Healthcare', isTraining: false };
    }
    if (cId === '4' || cId === '11' || cTag === '[PRIDEFACT]') {
      return { stream: 'work', client: 'PrideFact', isTraining: false };
    }
    if (cId === '6' || cTag === 'Team Work' || cTag === '[GE]') {
      return { stream: 'work', client: 'GE Enterprise', isTraining: false };
    }
    if (cId === '3' || cId === '1' || cId === '9' || cTag === '[ARTEFACT INTERNAL]') {
      return { stream: 'work', client: 'Artefact Internal', isTraining: false };
    }

    const orgEmail = (organizer && organizer.email) || '';
    const attEmails = Array.isArray(attendees) ? attendees.map(a => (typeof a === 'string' ? a : a.email || '')).join(' ') : '';
    const corpus = `${summary} ${source} ${desc} ${location} ${orgEmail} ${attEmails}`.toLowerCase();

    if (corpus.includes('athx') || corpus.includes('training') || corpus.includes('wod') || corpus.includes('crossfit')) {
      return { stream: 'life', client: 'ATHX', isTraining: true };
    }
    if (corpus.includes('siplec') || corpus.includes('leclerc')) {
      return { stream: 'work', client: 'Leclerc / Siplec', isTraining: false };
    }
    if (corpus.includes('clariane') || corpus.includes('inicea') || corpus.includes('estela') || corpus.includes('@clariane.fr') ||
        corpus.includes('hdj') || corpus.includes('netsoins') || corpus.includes('molécules onéreuses') || corpus.includes('molecules onereuses') ||
        corpus.includes('care dispensing') || corpus.includes('updates mo') || corpus.includes('questions mo') || corpus.includes('[invoicing]')) {
      return { stream: 'work', client: 'Clariane', isTraining: false };
    }
    if (corpus.includes('personal') || corpus.includes('ma vie') || corpus.includes('icloud')) {
      return { stream: 'life', client: 'Personal', isTraining: false };
    }
    return { stream: 'work', client: 'Artefact', isTraining: false };
  }

  static extractSeriesId(id, summary) {
    // Google Calendar & ICS recurrence format: <base_id>_<timestamp>
    const match = id.match(/^(.*)_(\d{8}(?:T\d{4,6}Z?)?)$/);
    if (match) {
      return match[1];
    }
    // Clean recurring summary as fallback series key
    const clean = summary
      .replace(/\[.*?\]/g, '')
      .replace(/[^a-zA-Z0-9]+/g, '-')
      .toLowerCase()
      .replace(/^-+|-+$/g, '');
    return clean ? `series-${clean}` : `series-${id}`;
  }

  static extractTags(text) {
    const tags = new Set();
    const lower = text.toLowerCase();
    const keywords = [
      'f360', 'invoicing', 'hdj', 'anomalies', 'netsoins', 'palantir',
      'crossfit', 'wod', 'run', 'planning', 'staffing', 'eom', 'knowledge',
      'roadmap', 'data-quality', 'training', 'sprint'
    ];
    for (const kw of keywords) {
      if (lower.includes(kw)) tags.add(kw);
    }
    // Bracketed tokens e.g. [INVOICING], [PLANNING HDJ]
    const brackets = text.match(/\[(.*?)\]/g) || [];
    for (const b of brackets) {
      const clean = b.slice(1, -1).trim().toLowerCase().replace(/[^a-z0-9]+/g, '-');
      if (clean && clean.length > 2) tags.add(clean);
    }
    return Array.from(tags).sort();
  }

  static formatAttendees(attendees) {
    return attendees.map(a => {
      if (typeof a === 'string') return a;
      const name = a.name || (a.email ? a.email.split('@')[0] : '');
      const parts = name.trim().split(/\s+/);
      if (parts.length >= 2) {
        return `${parts[0]} ${parts[1][0]}.`;
      }
      return name;
    }).filter(Boolean);
  }

  static detectVideoPlatform(url) {
    if (!url) return '';
    if (url.includes('teams.microsoft.com')) return 'Teams';
    if (url.includes('meet.google.com')) return 'Meet';
    if (url.includes('zoom.us')) return 'Zoom';
    return 'Video';
  }
}

MeetingHub.EventModel = EventModel;

/* === Module: model/series.js === */
/**
 * Series Model & Recurrence Collapsing Engine
 * 
 * Collapses recurring instances of meetings into unified series entities
 * for lineage, minutes intelligence, and series overview.
 */

class SeriesModel {
  /**
   * Groups a list of events into collapsed Series definitions.
   * @param {Array} events - Normalized event objects
   * @returns {Array} List of collapsed series objects
   */
  static collapse(events) {
    const seriesMap = new Map();

    for (const ev of events) {
      const sid = ev.series || `series-${ev.id}`;
      if (!seriesMap.has(sid)) {
        seriesMap.set(sid, {
          id: sid,
          title: ev.title,
          client: ev.client,
          stream: ev.stream,
          tags: new Set(),
          attendeesMap: new Map(),
          eventIds: [],
          dates: [],
          firstDate: ev.date,
          lastDate: ev.date,
        });
      }

      const s = seriesMap.get(sid);
      s.eventIds.push(ev.id);
      if (ev.date) s.dates.push(ev.date);

      // Union tags
      for (const t of (ev.tags || [])) {
        s.tags.add(t);
      }

      // Track attendee frequency
      for (const a of (ev.attendees || [])) {
        s.attendeesMap.set(a, (s.attendeesMap.get(a) || 0) + 1);
      }
    }

    const result = [];
    for (const [id, s] of seriesMap.entries()) {
      s.dates.sort();
      // Most frequent attendees
      const topAttendees = Array.from(s.attendeesMap.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(entry => entry[0]);

      result.push({
        id,
        title: s.title,
        client: s.client,
        stream: s.stream,
        tags: Array.from(s.tags),
        sampleAttendees: topAttendees,
        instanceCount: s.eventIds.length,
        isRecurring: s.eventIds.length > 1,
        eventIds: s.eventIds,
        firstDate: s.dates[0] || '',
        lastDate: s.dates[s.dates.length - 1] || ''
      });
    }

    return result.sort((a, b) => b.instanceCount - a.instanceCount);
  }

  /**
   * Given an event and all events in the same series, finds previous instances
   * that happened before this event's date.
   */
  static getPreviousInstances(currentEvent, allEvents) {
    if (!currentEvent.series) return [];
    return allEvents
      .filter(e => e.series === currentEvent.series && e.id !== currentEvent.id && e.date <= currentEvent.date)
      .sort((a, b) => b.date.localeCompare(a.date));
  }
}

MeetingHub.SeriesModel = SeriesModel;

/* === Module: model/links.js === */
/**
 * Link Engine & Minutes Intelligence Module
 * 
 * Provides deterministic and semantic (LLM) meeting link discovery.
 * Rules:
 * - Deterministic first (series, shared attendees, shared tags, date precedence).
 * - Optional LLM pass that proposes links from minutes and agenda text.
 * - Every suggestion has a clear reason and Accept / Reject actions.
 * - Never auto-links silently.
 */

class LinkEngine {
  /**
   * Generates link suggestions for a target meeting.
   * 
   * @param {Object} meeting The focal calendar event
   * @param {Array} allEvents All calendar events
   * @param {Object} store MeetingHubStore instance
   * @param {Object} options Options: { includeLlm: boolean }
   * @returns {Promise<Object>} { accepted: Array, suggestions: Array }
   */
  static async computeLinks(meeting, allEvents = [], store, options = {}) {
    if (!meeting) return { accepted: [], suggestions: [] };

    const meetingData = await store.getMeetingData(meeting.id);
    const storedLinks = this._normalizeLinks(meetingData.links);

    const acceptedIds = new Set(storedLinks.accepted.map(l => l.id));
    const rejectedIds = new Set(storedLinks.rejected);

    // 1. Fetch details for accepted links
    const accepted = [];
    for (const linkRecord of storedLinks.accepted) {
      const targetEvent = allEvents.find(e => e.id === linkRecord.id);
      if (targetEvent) {
        const targetData = await store.getMeetingData(linkRecord.id);
        const openActions = (targetData.items || []).filter(i => i.kind === 'action' && !i.done);
        accepted.push({
          id: linkRecord.id,
          event: targetEvent,
          reason: linkRecord.reason || 'Manually linked',
          linkedAt: linkRecord.linkedAt,
          openActionsCount: openActions.length,
          openActions,
          lastMinutesSummary: targetData.minutes ? targetData.minutes.trim().slice(0, 160) : '',
          decisions: (targetData.items || []).filter(i => i.kind === 'decision')
        });
      }
    }

    // Sort accepted links: most recent first
    accepted.sort((a, b) => b.event.date.localeCompare(a.event.date));

    // 2. Discover deterministic candidates
    // Exclude current meeting, accepted, and rejected
    const candidateEvents = allEvents.filter(e => 
      e.id !== meeting.id &&
      !acceptedIds.has(e.id) &&
      !rejectedIds.has(e.id)
    );

    const scoredSuggestions = [];

    for (const cand of candidateEvents) {
      let score = 0;
      const reasons = [];

      // A. Series match (highest weight)
      if (meeting.series && cand.series && meeting.series === cand.series) {
        score += 5.0;
        reasons.push(cand.date < meeting.date ? 'Prior session in series' : 'Recurring series session');
      }

      // B. Shared attendees
      const focalAttendees = meeting.attendees || [];
      const candAttendees = cand.attendees || [];
      const sharedAttendees = focalAttendees.filter(a => candAttendees.includes(a));
      if (sharedAttendees.length > 0) {
        score += sharedAttendees.length * 1.6;
        reasons.push(`${sharedAttendees.length} shared attendee${sharedAttendees.length > 1 ? 's' : ''} (${sharedAttendees.slice(0, 2).join(', ')}${sharedAttendees.length > 2 ? '...' : ''})`);
      }

      // C. Shared tags
      const focalTags = meeting.tags || [];
      const candTags = cand.tags || [];
      const sharedTags = focalTags.filter(t => candTags.includes(t));
      if (sharedTags.length > 0) {
        score += sharedTags.length * 1.3;
        reasons.push(`Shared tags: #${sharedTags.join(' #')}`);
      }

      // D. Same client & category
      if (meeting.client && cand.client && meeting.client === cand.client) {
        score += 0.8;
      }

      // E. Date precedence & recency boost
      if (cand.date <= meeting.date) {
        score += 1.0;
        const daysDiff = Math.abs((new Date(meeting.date) - new Date(cand.date)) / (1000 * 60 * 60 * 24));
        if (daysDiff <= 7) {
          score += 1.5;
        } else if (daysDiff <= 14) {
          score += 0.8;
        }
      }

      if (score >= 2.5) {
        const candData = await store.getMeetingData(cand.id);
        const openActions = (candData.items || []).filter(i => i.kind === 'action' && !i.done);
        scoredSuggestions.push({
          id: cand.id,
          event: cand,
          score: Math.round(score * 10) / 10,
          matchPercent: Math.min(98, Math.round(score * 12)),
          reason: reasons.join(' · ') || 'Related topic and attendees',
          source: 'deterministic',
          isLlm: false,
          openActionsCount: openActions.length,
          lastMinutesSummary: candData.minutes ? candData.minutes.trim().slice(0, 140) : '',
          decisionsCount: (candData.items || []).filter(i => i.kind === 'decision').length
        });
      }
    }

    // 3. Optional LLM Pass (semantic analysis of minutes and agenda)
    if (options.includeLlm) {
      const llmMatches = await this.runLlmProposalPass(meeting, candidateEvents, store, scoredSuggestions);
      for (const match of llmMatches) {
        // If candidate is already in suggestions, merge LLM insights and boost score
        const existing = scoredSuggestions.find(s => s.id === match.id);
        if (existing) {
          existing.score += match.boostScore;
          existing.matchPercent = Math.min(99, existing.matchPercent + 15);
          existing.reason = `[AI] ${match.llmReason} · ${existing.reason}`;
          existing.isLlm = true;
        } else {
          scoredSuggestions.push(match);
        }
      }
    }

    // Sort suggestions by score descending
    scoredSuggestions.sort((a, b) => b.score - a.score);

    return {
      accepted,
      suggestions: scoredSuggestions.slice(0, 6)
    };
  }

  /**
   * LLM Pass: Discovers semantic connections from minutes and agenda texts.
   * Can evaluate keywords, action follow-ups, and project entities.
   */
  static async runLlmProposalPass(meeting, candidateEvents, store, existingSuggestions) {
    const meetingData = await store.getMeetingData(meeting.id);
    const focalText = `${meeting.title} ${meetingData.agenda || ''} ${meetingData.minutes || ''}`.toLowerCase();

    // Extract significant terms (words >= 4 chars, ignoring common stop words)
    const stopWords = new Set([
      'with', 'from', 'this', 'that', 'have', 'more', 'about', 'meeting', 'update',
      'review', 'sync', 'call', 'artefact', 'discussion', 'daily', 'weekly', 'team',
      'projet', 'point', 'pour', 'dans', 'avec', 'suivi'
    ]);
    const terms = (focalText.match(/[a-z0-9à-ÿ]{4,}/g) || [])
      .filter(w => !stopWords.has(w));
    const termFreq = {};
    terms.forEach(t => { termFreq[t] = (termFreq[t] || 0) + 1; });
    const topKeywords = Object.keys(termFreq).sort((a, b) => termFreq[b] - termFreq[a]).slice(0, 8);

    if (topKeywords.length === 0) return [];

    const llmProposals = [];

    for (const cand of candidateEvents) {
      const candData = await store.getMeetingData(cand.id);
      const candText = `${cand.title} ${candData.agenda || ''} ${candData.minutes || ''}`.toLowerCase();

      // Check for follow-up triggers or keyword intersection
      const matchedKeywords = topKeywords.filter(k => candText.includes(k));
      const hasFollowUpCue = focalText.includes('follow up') || focalText.includes('suivi') ||
                             focalText.includes('anomalies') || focalText.includes('actions') ||
                             focalText.includes('previous') || focalText.includes('schema freeze');

      if (matchedKeywords.length >= 2 || (matchedKeywords.length >= 1 && hasFollowUpCue)) {
        const openActions = (candData.items || []).filter(i => i.kind === 'action' && !i.done);
        llmProposals.push({
          id: cand.id,
          event: cand,
          score: 4.5 + (matchedKeywords.length * 1.5),
          boostScore: 3.5,
          matchPercent: 88 + Math.min(10, matchedKeywords.length * 3),
          reason: `AI Topic Link: Mentions ${matchedKeywords.map(k => `"${k}"`).join(', ')}`,
          llmReason: `Semantic match on topics: ${matchedKeywords.join(', ')}`,
          source: 'llm',
          isLlm: true,
          openActionsCount: openActions.length,
          lastMinutesSummary: candData.minutes ? candData.minutes.trim().slice(0, 140) : '',
          decisionsCount: (candData.items || []).filter(i => i.kind === 'decision').length
        });
      }
    }

    return llmProposals;
  }

  /**
   * Accepts a suggested link.
   */
  static async acceptLink(meetingId, targetMeetingId, reason, store) {
    const meetingData = await store.getMeetingData(meetingId);
    const links = this._normalizeLinks(meetingData.links);

    // Remove from rejected if present
    links.rejected = links.rejected.filter(id => id !== targetMeetingId);

    // Add to accepted if not already there
    if (!links.accepted.some(l => l.id === targetMeetingId)) {
      links.accepted.push({
        id: targetMeetingId,
        reason: reason || 'Accepted suggestion',
        linkedAt: new Date().toISOString()
      });
    }

    await store.saveMeetingData(meetingId, { links });
    return links;
  }

  /**
   * Rejects a suggested link (never shown again as pending suggestion).
   */
  static async rejectLink(meetingId, targetMeetingId, store) {
    const meetingData = await store.getMeetingData(meetingId);
    const links = this._normalizeLinks(meetingData.links);

    // Remove from accepted if present
    links.accepted = links.accepted.filter(l => l.id !== targetMeetingId);

    // Add to rejected
    if (!links.rejected.includes(targetMeetingId)) {
      links.rejected.push(targetMeetingId);
    }

    await store.saveMeetingData(meetingId, { links });
    return links;
  }

  /**
   * Unlinks an accepted meeting.
   */
  static async unlinkMeeting(meetingId, targetMeetingId, store) {
    const meetingData = await store.getMeetingData(meetingId);
    const links = this._normalizeLinks(meetingData.links);

    links.accepted = links.accepted.filter(l => l.id !== targetMeetingId);
    await store.saveMeetingData(meetingId, { links });
    return links;
  }

  /**
   * Normalizes stored links structure.
   */
  static _normalizeLinks(rawLinks) {
    if (!rawLinks || typeof rawLinks !== 'object') {
      return { accepted: [], rejected: [] };
    }
    return {
      accepted: Array.isArray(rawLinks.accepted) ? rawLinks.accepted : [],
      rejected: Array.isArray(rawLinks.rejected) ? rawLinks.rejected : []
    };
  }
}

MeetingHub.LinkEngine = LinkEngine;

/* === Module: model/project.js === */
/**
 * Project Model & Configuration Schema
 * 
 * Defines the generic project contract and validation helpers.
 * Note: Hardcoded projects have been deprecated in favor of the Missions System of Record.
 * Legacy project constants are preserved in meeting_hub/_deprecated/project.js.
 */

const DEFAULT_PROJECTS = [];

class ProjectModel {
  static createDefault(name, clientMatch = []) {
    const slug = (name || 'project').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const clientList = clientMatch.length > 0 ? clientMatch : [name];
    return {
      id: slug || `proj-${Date.now()}`,
      name: name || 'New Project',
      clientMatch: clientList,
      docSources: [],
      workstreams: [],
      parserHints: {
        tools: [],
        concepts: [],
        facilities: [],
        decisionTriggers: [],
        tagRules: [],
        ownerOrgRules: []
      }
    };
  }

  static validate(project) {
    if (!project || typeof project !== 'object') return false;
    if (!project.id || typeof project.id !== 'string') return false;
    if (!project.name || typeof project.name !== 'string') return false;
    if (!Array.isArray(project.clientMatch)) project.clientMatch = [];
    if (!Array.isArray(project.docSources)) project.docSources = [];
    if (!Array.isArray(project.workstreams)) project.workstreams = [];
    if (!project.parserHints || typeof project.parserHints !== 'object') {
      project.parserHints = {
        tools: [],
        concepts: [],
        facilities: [],
        decisionTriggers: [],
        tagRules: [],
        ownerOrgRules: []
      };
    }
    return true;
  }
}

MeetingHub.ProjectModel = ProjectModel;
MeetingHub.DEFAULT_PROJECTS = DEFAULT_PROJECTS;

/* === Module: model/minutes_engine.js === */
/**
 * Meeting Minutes Intelligence Engine
 * 
 * Generic high-precision parser for structured meeting minutes.
 * Decoupled from any domain knowledge or client-specific vocabulary.
 * All clinical/business concepts, tools, workstream tags, and decision triggers
 * are driven dynamically by the project configuration.
 */

class MinutesEngine {
  /**
   * Main parsing entry point.
   * @param {string} rawText Raw plain text or markdown from Google Doc / notes
   * @param {object} meta Optional contextual metadata (e.g. event summary, date, meetingId)
   * @param {object} projectConfig Optional Project configuration object containing parserHints
   * @returns {object} Structured minutes intelligence
   */
  static parseMinutes(rawText, meta = {}, projectConfig = null) {
    if (!rawText || typeof rawText !== 'string') {
      return {
        title: meta.title || 'Untitled Meeting',
        date: meta.date || '',
        facility: meta.facility || '',
        meetingId: meta.meetingId || '',
        participants: [],
        topics: [],
        actions: [],
        decisions: [],
        knowledge: { tools: [], concepts: [], facilities: [] },
        rawLength: 0
      };
    }

    // Normalize text: remove BOM, normalize line endings
    const cleanText = rawText.replace(/^\uFEFF/, '').replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    const lines = cleanText.split('\n');

    const hints = projectConfig?.parserHints || {};
    const date = MinutesEngine.extractDate(cleanText, meta.date);
    const facility = MinutesEngine.extractFacility(cleanText, meta.title, hints.facilities);
    const title = MinutesEngine.extractTitle(cleanText, meta.title);
    const participants = MinutesEngine.extractParticipants(lines, hints.ownerOrgRules);
    const topics = MinutesEngine.extractTopics(lines);
    const actions = MinutesEngine.extractActions(lines, date, hints, meta);
    const decisions = MinutesEngine.extractDecisions(cleanText, topics, hints, meta);
    const knowledge = MinutesEngine.extractKnowledge(cleanText, facility, hints);

    return {
      title,
      date,
      facility,
      meetingId: meta.meetingId || '',
      participants,
      topics,
      actions,
      decisions,
      knowledge,
      rawLength: cleanText.length
    };
  }

  /* ================= Metadata Extraction ================= */

  static extractDate(text, fallbackDate = '') {
    const match = text.match(/Date\s*[:|]\s*([^\n\r]+)/i);
    if (match && match[1].trim()) {
      return match[1].trim();
    }
    const frDateMatch = text.match(/\b(\d{1,2})\s+(Janvier|Février|Mars|Avril|Mai|Juin|Juillet|Août|Septembre|Octobre|Novembre|Décembre)\s+(\d{4})\b/i);
    if (frDateMatch) {
      return frDateMatch[0];
    }
    const isoMatch = text.match(/\b(\d{4}-\d{2}-\d{2})\b/);
    if (isoMatch) {
      return isoMatch[1];
    }
    return fallbackDate || '';
  }

  static extractFacility(text, fallbackTitle = '', configuredFacilities = []) {
    const combined = `${text.slice(0, 600)} ${fallbackTitle}`.toLowerCase();
    
    // Check against configured project facilities
    if (Array.isArray(configuredFacilities) && configuredFacilities.length > 0) {
      for (const fac of configuredFacilities) {
        if (fac && combined.includes(fac.toLowerCase())) {
          return fac;
        }
      }
    }

    return '';
  }

  static extractTitle(text, fallbackTitle = '') {
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
    for (let i = 0; i < Math.min(lines.length, 5); i++) {
      const line = lines[i];
      if (/compte\s*rendu|minutes|ordre\s+du\s+jour|meeting|reunion|réunion|atelier/i.test(line)) {
        return line.replace(/^#+\s*/, '').trim();
      }
    }
    return fallbackTitle || (lines[0] ? lines[0].replace(/^#+\s*/, '').trim() : 'Meeting Minutes');
  }

  /* ================= Participants Extraction ================= */

  static extractParticipants(lines, ownerOrgRules = []) {
    const participants = [];
    let inSection = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      if (/^#*\s*(Participants|Attendees|Présents|Presences|Présences)\b/i.test(line)) {
        inSection = true;
        continue;
      }

      if (inSection) {
        // Break out on next major header
        if (/^#*\s*(Points\s+abord[ée]s|Prochaines\s+[ée]tapes|Actions|Ordre\s+du\s+jour|Agenda|Minutes|Next\s+steps)/i.test(line)) {
          break;
        }

        if (/^[*\-•]/.test(line)) {
          const raw = line.replace(/^[*\-•]\s*/, '').trim();
          let name = raw;
          let role = '';
          let org = '';

          if (raw.includes('|')) {
            const parts = raw.split('|').map(p => p.trim());
            name = parts[0];
            role = parts[1] || '';
          } else if (raw.includes(':')) {
            const parts = raw.split(':').map(p => p.trim());
            name = parts[0];
            role = parts[1] || '';
          } else if (raw.includes('(') && raw.includes(')')) {
            const m = raw.match(/^(.*?)\((.*?)\)$/);
            if (m) {
              name = m[1].trim();
              role = m[2].trim();
            }
          }

          // Classify organization from rules
          const lowerRole = role.toLowerCase();
          const lowerName = name.toLowerCase();
          if (Array.isArray(ownerOrgRules)) {
            for (const rule of ownerOrgRules) {
              const kws = rule.keywords || rule.match || [];
              if (kws.some(k => lowerRole.includes(k.toLowerCase()) || lowerName.includes(k.toLowerCase()))) {
                org = rule.org;
                break;
              }
            }
          }

          participants.push({ name, role, org, raw });
        }
      }
    }

    return participants;
  }

  /* ================= Topics Extraction ================= */

  static extractTopics(lines) {
    const topics = [];
    let inSection = false;
    let currentTopic = null;

    for (let i = 0; i < lines.length; i++) {
      const rawLine = lines[i];
      const trimmed = rawLine.trim();
      if (!trimmed) continue;

      if (/^#*\s*(Points\s+abord[ée]s|Discussion|Topics|Ordre\s+du\s+jour|Notes)/i.test(trimmed)) {
        inSection = true;
        continue;
      }

      if (inSection) {
        // Stop on next steps / actions header
        if (/^#*\s*((?:Les\s+)?prochaines\s+[ée]tapes|Actions|Next\s+Steps)/i.test(trimmed)) {
          break;
        }

        const isBullet = /^[*\-•]/.test(trimmed);
        const hasColonEnd = /:\s*$/.test(trimmed);
        const indentLevel = rawLine.search(/\S|$/);

        if ((!isBullet && trimmed.length < 80 && !trimmed.endsWith('.')) ||
            (isBullet && hasColonEnd && indentLevel <= 2) ||
            /^#{2,4}\s+/.test(trimmed)) {
          
          if (currentTopic) {
            topics.push(currentTopic);
          }

          const topicTitle = trimmed
            .replace(/^#+\s*/, '')
            .replace(/^[*\-•]\s*/, '')
            .replace(/:\s*$/, '')
            .trim();

          currentTopic = {
            title: topicTitle,
            points: []
          };
          continue;
        }

        if (currentTopic) {
          const cleanPoint = trimmed.replace(/^[*\-•]\s*/, '').trim();
          if (cleanPoint) {
            currentTopic.points.push(cleanPoint);
          }
        } else if (trimmed) {
          currentTopic = {
            title: 'General',
            points: [trimmed.replace(/^[*\-•]\s*/, '').trim()]
          };
        }
      }
    }

    if (currentTopic) {
      topics.push(currentTopic);
    }

    return topics;
  }

  /* ================= Actions Extraction ================= */

  static extractActions(lines, contextDate = '', hints = {}, meta = {}) {
    const actions = [];
    let inSection = false;
    const meetingLink = meta.meetingId ? `#/meeting/${encodeURIComponent(meta.meetingId)}` : '';

    const tagRules = hints.tagRules || [];
    const ownerOrgRules = hints.ownerOrgRules || [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      if (/^#*\s*((?:Les\s+)?prochaines\s+[ée]tapes|Actions|Next\s+Steps)/i.test(line)) {
        inSection = true;
        continue;
      }

      if (inSection) {
        // Stop if hitting a major new section
        if (/^#+\s+[A-Z]/.test(line) && !line.includes('étape') && !line.includes('action')) {
          break;
        }

        if (/^[*\-•]/.test(line)) {
          let raw = line.replace(/^[*\-•]\s*/, '').trim();
          let isDone = false;

          // Strip checkbox markdown if present: [ ] or [x] or [X]
          if (/^\[([ xX])\]\s*/.test(raw)) {
            const cbMatch = raw.match(/^\[([ xX])\]\s*/);
            if (cbMatch[1].toLowerCase() === 'x') isDone = true;
            raw = raw.replace(/^\[([ xX])\]\s*/, '').trim();
          }

          let owner = 'Team';
          let text = raw;
          let dueDate = '';

          // Look for "Owner : Action" or "Owner | Action"
          const colonMatch = raw.match(/^([A-Za-zÀ-ÿ0-9\s/.'-]+)\s*[:|]\s*(.+)$/);
          if (colonMatch) {
            const potentialOwner = colonMatch[1].trim();
            const actionText = colonMatch[2].trim();

            if (potentialOwner.toLowerCase().includes('prochain point') || potentialOwner.toLowerCase().includes('suivi') || potentialOwner.toLowerCase().includes('next sync')) {
              owner = 'Team';
              text = `${potentialOwner} : ${actionText}`;
              dueDate = actionText;
            } else {
              owner = potentialOwner;
              text = actionText;
            }
          }

          // Due timing inference
          const contextYear = contextDate ? (contextDate.match(/\b(\d{4})\b/) ? contextDate.match(/\b(\d{4})\b/)[1] : new Date().getFullYear()) : new Date().getFullYear();
          const isoDateMatch = text.match(/\b(\d{4}-\d{2}-\d{2})\b/);
          const slashDateMatch = text.match(/(?:avant le|pour le|le|by|due|before)?\s*(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?/i);

          if (isoDateMatch) {
            dueDate = isoDateMatch[1];
          } else if (slashDateMatch) {
            const d = slashDateMatch[1].padStart(2, '0');
            const m = slashDateMatch[2].padStart(2, '0');
            const y = slashDateMatch[3] ? (slashDateMatch[3].length === 2 ? `20${slashDateMatch[3]}` : slashDateMatch[3]) : contextYear;
            dueDate = `${y}-${m}-${d}`;
          }

          if (!dueDate) {
            const lowerText = text.toLowerCase();
            if (lowerText.includes('mardi matin') || lowerText.includes('semaine prochaine') || lowerText.includes('next week')) {
              dueDate = 'Next week';
            } else if (lowerText.includes('dans la semaine') || lowerText.includes('this week')) {
              dueDate = 'This week';
            } else if (lowerText.includes('dès que') || lowerText.includes('urgent') || lowerText.includes('prioritaire')) {
              dueDate = 'Priority';
            }
          }

          // Dynamic workstream tags from project parser hints
          const tags = [];
          const lowerText = text.toLowerCase();
          for (const rule of tagRules) {
            const kws = rule.keywords || rule.match || [];
            if (kws.some(k => lowerText.includes(k.toLowerCase()))) {
              tags.push(rule.tag);
            }
          }

          // Dynamic owner organization from project parser hints
          let ownerOrg = 'Team';
          const lowerOwner = owner.toLowerCase();
          for (const rule of ownerOrgRules) {
            const kws = rule.keywords || rule.match || [];
            if (kws.some(k => lowerOwner.includes(k.toLowerCase()) || lowerText.includes(k.toLowerCase()))) {
              ownerOrg = rule.org;
              break;
            }
          }

          actions.push({
            id: `act-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            owner,
            ownerOrg,
            text,
            dueDate,
            tags,
            done: isDone,
            source: 'minutes',
            quote: line,
            meetingLink
          });
        }
      }
    }

    return actions;
  }

  /* ================= Decisions Extraction (DEPRECATED) ================= */
  // Deprecated as part of Phase 4: Decisions are authoritatively maintained in
  // mission Markdown notes (Decisions.md) via the fold workflow.
  static extractDecisions(cleanText, topics = [], hints = {}, meta = {}) {
    return [];
  }

  static findContextTopic(line, topics) {
    for (const t of topics) {
      if (t.points.some(p => p.includes(line) || line.includes(p))) {
        return t.title;
      }
    }
    return 'General';
  }

  /* ================= Knowledge Extraction (DEPRECATED) ================= */
  // Deprecated as part of Phase 4: Knowledge, tools, and concepts are authoritatively
  // captured in mission Markdown notes (Overview.md, Workstreams.md) via the fold workflow.
  static extractKnowledge(text, facility = '', hints = {}) {
    return {
      tools: [],
      concepts: [],
      facilities: []
    };
  }

  /* ================= Formatting & Conversion ================= */

  /**
   * Converts extracted actions and decisions into Meeting Hub item models.
   */
  static toMeetingItems(parsed) {
    const items = [];

    // Actions
    if (Array.isArray(parsed.actions)) {
      for (const act of parsed.actions) {
        items.push({
          id: act.id || `item-act-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          kind: 'action',
          text: act.text,
          owner: act.owner || '',
          ownerOrg: act.ownerOrg || '',
          dueDate: act.dueDate || '',
          done: false,
          tags: act.tags || [],
          source: 'minutes',
          quote: act.quote || '',
          meetingLink: act.meetingLink || ''
        });
      }
    }

    // Decisions
    if (Array.isArray(parsed.decisions)) {
      for (const dec of parsed.decisions) {
        items.push({
          id: dec.id || `item-dec-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          kind: 'decision',
          text: `[${dec.label}] ${dec.statement}`,
          label: dec.label,
          statement: dec.statement,
          context: dec.context,
          source: 'minutes',
          quote: dec.quote || '',
          meetingLink: dec.meetingLink || ''
        });
      }
    }

    return items;
  }
}

MeetingHub.MinutesEngine = MinutesEngine;

/* === Module: data/importer.js === */
/**
 * One-Time Events Importer & Recurrence Collapser
 * 
 * Imports existing calendar events once into storage, collapses them
 * into series, and seeds initial meeting notes without ever overwriting user data.
 */



class EventsImporter {
  /**
   * Performs an idempotent initial import of events.
   * @param {DatabaseAdapter} db - Active database adapter
   * @param {Object} options - { force: boolean, dataUrl: string, rawEvents: Array }
   */
  static async _loadDeletedIdsSet(db) {
    const set = new Set();
    try {
      const meta = await db.get('meta', 'deleted_event_ids');
      if (meta && Array.isArray(meta.value)) {
        for (const id of meta.value) if (id) set.add(String(id));
      }
    } catch (e) {}
    try {
      if (typeof localStorage !== 'undefined') {
        const raw = localStorage.getItem('mhub_deleted_events');
        if (raw) {
          const arr = JSON.parse(raw);
          if (Array.isArray(arr)) {
            for (const id of arr) if (id) set.add(String(id));
          }
        }
      }
    } catch (e) {}
    return set;
  }

  static async importInitialData(db, options = {}) {
    const existingCount = await db.count('events');
    const seedVersionMeta = await db.get('meta', 'seed_version');
    const currentSeedVersion = 6; // version 6 refreshes live calendar seeds for Nov 2026
    const deletedIdsSet = await EventsImporter._loadDeletedIdsSet(db);

    let rawList = options.rawEvents;
    if (!rawList && typeof window !== 'undefined' && window.INITIAL_EVENTS && Array.isArray(window.INITIAL_EVENTS)) {
      rawList = window.INITIAL_EVENTS;
    }

    // If store already has events and up-to-date seed version, ensure no baseline events are missing
    if (existingCount > 0 && !options.force && seedVersionMeta && seedVersionMeta.value >= currentSeedVersion) {
      if (deletedIdsSet.size > 0) {
        const currentEvents = await db.getAll('events');
        for (const ev of currentEvents) {
          if (EventModel.isDeletedOrDeclined(ev, deletedIdsSet)) {
            await db.delete('events', ev.id);
          }
        }
      }

      // Self-healing: verify that baseline events from initial snapshot are present
      if (rawList && Array.isArray(rawList)) {
        const currentEvents = await db.getAll('events');
        const currentIds = new Set(currentEvents.map(e => e.id));
        const missingBaseline = rawList
          .filter(e => !EventModel.isDeletedOrDeclined(e, deletedIdsSet))
          .map(e => EventModel.normalize(e))
          .filter(e => !currentIds.has(e.id));
        if (missingBaseline.length > 0) {
          console.log(`[Importer] Ingesting ${missingBaseline.length} missing baseline mission events...`);
          await db.bulkPut('events', missingBaseline);
          const updatedEvents = await db.getAll('events');
          const updatedSeries = SeriesModel.collapse(updatedEvents);
          await db.bulkPut('series', updatedSeries);
        }
      }

      console.log(`[Importer] Store already populated with ${existingCount} events (seed v${seedVersionMeta.value}).`);
      return { skipped: true, eventCount: existingCount };
    }

    console.log('[Importer] Checking for initial calendar events import...');

    // 1. Check window.INITIAL_EVENTS (fastest, immune to file:// CORS)
    if (!rawList && typeof window !== 'undefined' && window.INITIAL_EVENTS && Array.isArray(window.INITIAL_EVENTS)) {
      rawList = window.INITIAL_EVENTS;
      console.log(`[Importer] Loaded ${rawList.length} events from window.INITIAL_EVENTS.`);
    }

    // 2. Check window.RAW_EVENTS (legacy fallback from calendar_dashboard.html)
    if (!rawList && typeof window !== 'undefined' && window.RAW_EVENTS && Array.isArray(window.RAW_EVENTS)) {
      rawList = window.RAW_EVENTS;
      console.log(`[Importer] Loaded ${rawList.length} events from window.RAW_EVENTS.`);
    }

    // 3. Attempt fetch if served via HTTP
    if (!rawList) {
      const dataUrl = options.dataUrl || 'meeting_hub/data/initial_events.json';
      try {
        const resp = await fetch(dataUrl);
        if (resp.ok) {
          rawList = await resp.json();
          console.log(`[Importer] Fetched ${rawList.length} events from ${dataUrl}.`);
        }
      } catch (err) {
        // Safe to ignore if snapshot file is retired
      }
    }

    // 4. Node environment fallback (for automated tests and SSR)
    if (!rawList && typeof process !== 'undefined' && process.versions && process.versions.node) {
      try {
        const fs = await import('fs');
        const candidatePaths = [
          'meeting_hub/data/initial_events.json',
          './meeting_hub/data/initial_events.json',
          '/Users/ayrtonandre/Documents/work/AGY/meeting_hub/data/initial_events.json'
        ];
        for (const p of candidatePaths) {
          if (fs.existsSync(p)) {
            rawList = JSON.parse(fs.readFileSync(p, 'utf8'));
            break;
          }
        }
      } catch (e) {
        // Node fallback error ignored
      }
    }

    if (!rawList || !Array.isArray(rawList)) {
      if (existingCount > 0) {
        return { skipped: true, eventCount: existingCount };
      }
      console.warn('[Importer] No snapshot events provided. Waiting for live sync or JSON import.');
      return { skipped: true, eventCount: 0 };
    }

    // 1. Filter out deleted/declined events and normalize
    const activeRawList = rawList.filter(e => !EventModel.isDeletedOrDeclined(e, deletedIdsSet));
    const normalizedEvents = activeRawList.filter(e => !EventModel.isDeletedOrDeclined(e, deletedIdsSet)).map(e => EventModel.normalize(e)).filter(e => !EventModel.isDeletedOrDeclined(e, deletedIdsSet));
    const validIds = new Set(normalizedEvents.map(e => e.id));

    // Prune stale non-custom calendar events that are no longer in the clean seed or were deleted
    if (existingCount > 0 && !options.rawEvents) {
      const existingEvents = await db.getAll('events');
      for (const oldEv of existingEvents) {
        const isCustom = Boolean(oldEv.isCustom || String(oldEv.id || '').startsWith('custom-') || String(oldEv.id || '').startsWith('evt-'));
        if (deletedIdsSet.has(oldEv.id) || EventModel.isDeletedOrDeclined(oldEv, deletedIdsSet) || (!isCustom && validIds.size > 0 && !validIds.has(oldEv.id))) {
          await db.delete('events', oldEv.id);
        }
      }
    }

    // 2. Collapse into series
    const collapsedSeries = SeriesModel.collapse(normalizedEvents);

    // 3. Batch put into database
    await db.bulkPut('events', normalizedEvents);
    await db.bulkPut('series', collapsedSeries);

    // 4. Seed initial rich meeting intelligence for flagship meetings
    // ONLY IF the meeting doesn't already have user-saved notes!
    await EventsImporter._seedFlagshipNotes(db, normalizedEvents);

    // 5. Update meta
    await db.put('meta', { key: 'initial_import_done', value: true });
    await db.put('meta', { key: 'seed_version', value: currentSeedVersion });
    await db.put('meta', { key: 'last_import_timestamp', value: new Date().toISOString() });
    await db.put('meta', { key: 'event_count', value: normalizedEvents.length });
    await db.put('meta', { key: 'series_count', value: collapsedSeries.length });

    console.log(`[Importer] Import complete: ${normalizedEvents.length} events, ${collapsedSeries.length} collapsed series.`);

    return {
      skipped: false,
      eventCount: normalizedEvents.length,
      seriesCount: collapsedSeries.length,
      recurringCount: collapsedSeries.filter(s => s.isRecurring).length
    };
  }

  /**
   * Seeds demo items/agenda on key events to demonstrate the prep workflow,
   * strictly protecting existing records.
   */
  static async _seedFlagshipNotes(db, events) {
    // Find key meetings on 2026-10-28
    const moMeeting = events.find(e => e.date === '2026-10-28' && e.title.includes('MO - Suivi anomalies'));
    const invoicingMeeting = events.find(e => e.date === '2026-10-28' && e.title.includes('INVOICING'));
    const f360Past = events.find(e => e.title.includes('MO - Suivi anomalies') && e.date < '2026-10-28');

    if (moMeeting) {
      const existing = await db.get('meeting_data', moMeeting.id);
      if (!existing) {
        await db.put('meeting_data', {
          id: moMeeting.id,
          agenda: '1. Review unresolved claims and Netsoins ingestion errors\n2. Clarify ownership of GLANUM pharmacy feeds\n3. Agree on patch deployment schedule for V2',
          minutes: '',
          items: [
            { id: 'item-mo-1', kind: 'action', text: 'Send updated anomalies list to Sophie G.', owner: 'Ayrton', done: false },
            { id: 'item-mo-2', kind: 'question', text: 'Who validates the F360 schema freeze?', owner: 'Claire', done: false },
            { id: 'item-mo-3', kind: 'topic', text: 'Palantir traceability ingestion timeline', owner: '', done: false }
          ],
          linkedMeetingIds: f360Past ? [f360Past.id] : [],
          prepared: true,
          updatedAt: new Date().toISOString()
        });
      }
    }

    if (f360Past) {
      const existing = await db.get('meeting_data', f360Past.id);
      if (!existing) {
        await db.put('meeting_data', {
          id: f360Past.id,
          agenda: 'Review sprint progress on hospital data ingestion.',
          minutes: 'Reviewed data quality issues on residents referential. Agreed to freeze schema until Nov. Claire to lead validation on pharmacy endpoints.',
          items: [
            { id: 'item-p1-1', kind: 'decision', text: 'Freeze referential schema until November', owner: '', done: true },
            { id: 'item-p1-2', kind: 'action', text: 'Draft Palantir mapping documentation', owner: 'Ayrton', done: true }
          ],
          linkedMeetingIds: [],
          prepared: true,
          updatedAt: new Date().toISOString()
        });
      }
    }

    // Seed Clariane HDJ Planning Meetings (Mariéna & Les Arbelles)
    const arbellesMeeting = events.find(e => e.date === '2026-10-21' && e.title.includes('Arbelles'));
    const marienaMeeting = events.find(e => e.date === '2026-10-26' && e.title.includes('Mariéna'));

    if (arbellesMeeting) {
      const existing = await db.get('meeting_data', arbellesMeeting.id);
      if (!existing || !existing.minutes) {
        await db.put('meeting_data', {
          id: arbellesMeeting.id,
          googleDocUrl: 'https://docs.google.com/document/d/1jDunJURx26Di9c6k4vjhmA84w3Hh_zCCmCxnU0kcFjY/edit?tab=t.0',
          agenda: '1. Présentation de la vue centralisée des vacations par salle et intervenant\n2. Cadrage du flux Annonce dans HM pour Foundry\n3. Modélisation des programmes thérapeutiques (contrainte zéro temps mort)',
          minutes: `HDJ Planning Manager\nParamétrage des programmes thérapeutiques et organisation - Les Arbelles\n________________\n\nDate | 21 Octobre 2026\n\nParticipants\n* FERRIER Fabien | Cadre de rééducation - Les Arbelles\n* CUVELIER Delphine | Agent administratif - Les Arbelles\n* DE GIROLAMO Benjamin | Data Analyst\n* ANDRE Ayrton | Data Analyst\n\nPoints abordés\n* Vue Vacations et Visibilité :\n   * Présentation de la vue centralisée des plannings par salle et par intervenant.\n   * Les noms et prénoms des patients seront bien visibles pour le personnel médical habilité.\n   * À terme, l'outil pourrait offrir un accès en lecture seule aux praticiens pour consulter spécifiquement leurs propres vacations.\n* Processus d'Admission et flux "Annonce" :\n   * Actuellement, Les Arbelles n'utilise pas les annonces dans HM ; les patients "potentiels" sont gérés au travers d'une liste d'attente sur un agenda papier.\n   * Pour maximiser l'efficacité du calcul de disponibilité dans Foundry, il a été proposé de saisir les patients au statut "Annonce" dans HM dès la confirmation de la demande.\n* Contraintes des Programmes Thérapeutiques :\n   * Les Arbelles gèrent des programmes "carrés" (Dos, Parkinson) mais font aussi du sur-mesure complexe pour la neuro et le locomoteur.\n   * Politique zéro temps mort : Par manque d'espace d'attente, les patients ne doivent avoir aucun "trou" entre leurs séances.\n   * Bilans et spécificités : Les bilans d'entrée et de sortie se font en individuel.\n* Analytique et Reporting Budgétaire :\n   * Fabien a souligné un besoin métier majeur : pouvoir extraire le case mix réel (% Neuro vs Locomoteur) pour la construction budgétaire.\n\nProchaines étapes\n   * Les Arbelles | Modéliser "sur papier" la structure de leurs différents programmes thérapeutiques pour préparer le paramétrage.\n   * Les Arbelles | Se connecter à l'outil dans la semaine pour le prendre en main et remonter les premiers retours.\n   * Artefact | Se renseigner sur les champs obligatoires minimaux requis dans HM pour créer une "Annonce".\n   * Artefact | Ajuster les filtres de la vue vacation pour bien séparer les médecins, les psychologues et les neuropsychologues.\n   * Artefact | S'assurer que la plateforme permet de modéliser facilement les séances de bilan ciblées et les séances périodiques.`,
          items: [],
          linkedMeetingIds: [],
          prepared: true,
          updatedAt: new Date().toISOString()
        });
      }
    }

    if (marienaMeeting) {
      const existing = await db.get('meeting_data', marienaMeeting.id);
      if (!existing || !existing.minutes) {
        await db.put('meeting_data', {
          id: marienaMeeting.id,
          googleDocUrl: 'https://docs.google.com/document/d/1eLUVhYG6hwiqOzauSEDZoGJHu_B9jQuC5Pmbg-8bd_8/edit?tab=t.0',
          agenda: '1. Démonstration des vues Vacations et Disponibilité Foundry\n2. Clarification du circuit de validation avec Hôpital Manager (HM)\n3. Prise en compte du flux Annonces et des séances périodiques complexes (rTMS)',
          minutes: `HDJ Planning Manager\nParamétrage des programmes thérapeutiques et organisation - Marienia\n________________\n\nDate | 26 Octobre 2026\n\nParticipants\n* GAILLET Claire | IDE - Marienia\n* DE GIROLAMO Benjamin | Data Analyst\n* ANDRE Ayrton | Data Analyst\n\nPoints Abordés\nContexte et Approche du projet\n* Rappel de l'outil et mécanisme de synchronisation\n   * Démonstration des vues "Vacations" et "Disponibilité".\n   * Clarification du workflow de validation : la validation d'un circuit sur Foundry le passe au statut "En attente HM". Une fois les créneaux saisis manuellement dans Hôpital Manager (HM), l'algorithme fait le rapprochement et valide le rendez-vous en "Réel".\n* Processus d'Admission (Flux Annonces)\n   * À Mariéna, le flux "Annonces" est utilisé pour tous les patients (HDJ et HC), et c'est le médecin qui détermine ensuite s'il s'agit d'une prise en charge HDJ.\n   * L'outil a été adapté avec un onglet permettant d'inclure ou d'exclure facilement les annonces/pré-admissions pour isoler celles concernant l'HDJ.\n* Modélisation des Parcours Thérapeutiques\n   * Gestion des imprévus de placement : démonstration de la fonctionnalité permettant de "forcer" un placement via le surbooking et du changement manuel d'intervenant.\n   * Parcours complexes (ex: Parcours Douloureux) : Analyse du cas des patients venant toutes les 3 semaines pour des séances de rTMS / tDCS le lundi. La solution retenue est de créer des vacations isolées/dédiées pour ce groupe, avec une fréquence de récurrence paramétrée à 3 semaines dans l'outil.\n* Anomalies techniques en cours de résolution\n   * Certaines vacations (Kiné, Balnéo, Ergo collective) ne remontent pas encore dans la disponibilité Foundry en raison d'un paramétrage HM en cours d'investigation.\n\nLes prochaines étapes\n   * Claire GAILLET : Modéliser sur papier ou fichier Excel les parcours thérapeutiques complexes pour préparer le paramétrage.\n   * Artefact : Résoudre le problème de remontée des vacations depuis HM (Kiné, Balnéo, Ergo) et prévenir Claire.\n   * Artefact : Développer un système d'alerte (alerting) dans l'outil pour signaler lorsqu'un patient est positionné sur deux vacations en même temps.\n   * Prochain point de suivi : Mardi matin de la semaine prochaine pour avancer sur la modélisation des parcours.`,
          items: [],
          linkedMeetingIds: arbellesMeeting ? [arbellesMeeting.id] : [],
          prepared: true,
          updatedAt: new Date().toISOString()
        });
      }
    }
  }
}

MeetingHub.EventsImporter = EventsImporter;

/* === Module: data/sync.js === */
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



const SYNC_SOURCES = {
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

class CalendarSyncService {
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

    // Attempt lightweight backend check if served over HTTP
    if (typeof fetch !== 'undefined') {
      try {
        const ctrl = new AbortController();
        const tid = setTimeout(() => ctrl.abort(), 2000);
        const res = await fetch('/api/sync/status', { signal: ctrl.signal }).catch(() => null);
        clearTimeout(tid);
        if (res && res.ok) {
          const remoteStatus = await res.json();
          if (remoteStatus && remoteStatus.sources) {
            for (const [k, v] of Object.entries(remoteStatus.sources)) {
              if (v.last_sync && !metaMap[`last_sync_${k}`]) {
                metaMap[`last_sync_${k}`] = v.last_sync;
              }
              if (v.status) {
                metaMap[`sync_status_${k}`] = v.status;
              }
              if (v.error) {
                metaMap[`sync_error_${k}`] = v.error;
              }
            }
            if (remoteStatus.last_sync && !metaMap['last_sync_all']) {
              metaMap['last_sync_all'] = remoteStatus.last_sync;
            }
          }
        }
      } catch (e) {
        // Backend unavailable, silently fallback to local IndexedDB meta
      }
    }

    const defaultFallbackTime = metaMap['last_import_timestamp'] || new Date().toISOString();

    const result = {
      lastSyncAll: metaMap['last_sync_all'] || defaultFallbackTime,
      sources: {}
    };

    for (const [key, conf] of Object.entries(SYNC_SOURCES)) {
      const syncKey = `last_sync_${key}`;
      const statusKey = `sync_status_${key}`;
      const errKey = `sync_error_${key}`;
      const ts = metaMap[syncKey] || metaMap['last_sync_all'] || defaultFallbackTime;
      const status = metaMap[statusKey] || 'active';
      const error = metaMap[errKey] || null;
      result.sources[key] = {
        ...conf,
        lastSync: ts,
        status: status,
        error: error,
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
    let backendSources = null;

    // 1. Attempt live sync via local orchestrator HTTP endpoint (Port 8080)
    // Server handles OAuth token refresh, iCloud CalDAV creds, and Clariane ICS securely.
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      let resp = await fetch('/api/sync/calendars', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trigger: 'manual_sync', timestamp: nowIso }),
        signal: controller.signal
      }).catch(() => null);

      clearTimeout(timeoutId);

      if (!resp || !resp.ok) {
        // Fallback to GET on orchestrator calendar events feed
        const getController = new AbortController();
        const getTimeoutId = setTimeout(() => getController.abort(), 5000);
        resp = await fetch('/api/sync/calendars', { signal: getController.signal }).catch(() => null);
        clearTimeout(getTimeoutId);
      }

      if (resp && resp.ok) {
        const data = await resp.json();
        if (data && Array.isArray(data.events)) {
          syncedEvents = data.events;
          backendSuccess = true;
          if (data.sources) {
            backendSources = data.sources;
          }
          if (Array.isArray(data.deletedIds) && store && typeof store.mergeDeletedEventIds === 'function') {
            await store.mergeDeletedEventIds(data.deletedIds);
          }
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

    const deletedIdsSet = new Set();
    if (store && typeof store.getDeletedEventIds === 'function') {
      for (const id of store.getDeletedEventIds()) deletedIdsSet.add(String(id));
    }
    try {
      const metaDel = await db.get('meta', 'deleted_event_ids');
      if (metaDel && Array.isArray(metaDel.value)) {
        for (const id of metaDel.value) if (id) deletedIdsSet.add(String(id));
      }
    } catch (e) {}

    // 3. Filter and normalize incoming events
    const activeRaw = syncedEvents.filter(e => !EventModel.isDeletedOrDeclined(e, deletedIdsSet));
    const normalizedList = activeRaw
      .map(e => EventModel.normalize(e))
      .filter(e => !EventModel.isDeletedOrDeclined(e, deletedIdsSet));
    const syncedIds = new Set(normalizedList.map(e => e.id));

    // Prune stale non-custom events when backend sync succeeds, and always prune deleted/declined events
    const currentEvents = await db.getAll('events');
    for (const oldEv of currentEvents) {
      const isCustom = Boolean(oldEv.isCustom || String(oldEv.id || '').startsWith('custom-') || String(oldEv.id || '').startsWith('evt-'));
      if (
        deletedIdsSet.has(oldEv.id) ||
        EventModel.isDeletedOrDeclined(oldEv, deletedIdsSet) ||
        (backendSuccess && !isCustom && syncedIds.size > 0 && !syncedIds.has(oldEv.id))
      ) {
        await db.delete('events', oldEv.id);
      }
    }

    // 4. Idempotently write to 'events' store
    // Important: 'meeting_data' (agenda, minutes, actions, links) is keyed strictly
    // by event id and is NOT touched here, preserving 100% of user data.
    await db.bulkPut('events', normalizedList);

    // 5. Re-collapse series
    const allEvents = await db.getAll('events');
    const collapsedSeries = SeriesModel.collapse(allEvents);
    await db.bulkPut('series', collapsedSeries);

    // 6. Record last-synced timestamps and per-source status in meta
    await db.put('meta', { key: 'last_sync_all', value: nowIso });
    for (const key of Object.keys(SYNC_SOURCES)) {
      const srcMeta = backendSources && backendSources[key];
      const srcTs = (srcMeta && srcMeta.last_sync) || nowIso;
      const srcStatus = (srcMeta && srcMeta.status) || 'active';
      const srcErr = (srcMeta && srcMeta.error) || '';

      await db.put('meta', { key: `last_sync_${key}`, value: srcTs });
      await db.put('meta', { key: `sync_status_${key}`, value: srcStatus });
      await db.put('meta', { key: `sync_error_${key}`, value: srcErr });
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

MeetingHub.CalendarSyncService = CalendarSyncService;
MeetingHub.SYNC_SOURCES = SYNC_SOURCES;

/* === Module: model/prep_score.js === */
/**
 * Prep Score Calculator
 * 
 * Computes dynamic meeting preparedness without any hard-coded numbers.
 * Evaluates the 3 core criteria:
 * 1. Agenda written
 * 2. Last minutes found / linked
 * 3. Open actions reviewed
 */


class PrepScoreCalculator {
  /**
   * Computes the prep score and status for a single meeting.
   * 
   * @param {Object} meeting Calendar event
   * @param {Object} meetingData Stored notes and items for this meeting
   * @param {Array} relatedLinks Suggested/linked prior meetings
   * @param {Object} options Optional context flags (inboxStatus, missionSummary)
   * @returns {Object} Detailed prep evaluation
   */
  static computeMeetingPrep(meeting, meetingData = {}, relatedLinks = [], options = {}) {
    if (!meeting) {
      return {
        scorePercent: 0,
        metCount: 0,
        totalCount: 3,
        status: 'needs_prep',
        badgeClass: 'warn',
        badgeText: 'Needs prep',
        agenda: { ok: false, label: 'Missing', detail: 'No objectives drafted' },
        lastMinutes: { ok: false, label: 'None found', detail: 'No prior meeting found' },
        openActions: { ok: false, label: 'Missing', detail: 'Unreviewed' },
        inbox: { pending: false, label: 'Folded', detail: 'Notes up to date' },
        people: { count: 0 }
      };
    }

    // 1. Agenda Criterion
    const hasAgenda = Boolean(meetingData.agenda && meetingData.agenda.trim().length > 0);
    const agenda = {
      ok: hasAgenda,
      label: hasAgenda ? 'Written' : 'Missing',
      detail: hasAgenda ? 'Objectives defined' : 'Objectives needed'
    };

    // 2. Last Minutes Criterion
    const topLink = Array.isArray(relatedLinks) && relatedLinks.length > 0 ? relatedLinks[0] : null;
    let lastMinutesOk = false;
    let lastMinutesLabel = 'None found';
    let lastMinutesDetail = 'No linked prior meetings';

    if (topLink) {
      if (topLink.linkedAt || topLink.status === 'accepted') {
        lastMinutesOk = true;
        lastMinutesLabel = 'Linked';
        lastMinutesDetail = topLink.reason || 'Connected meeting';
      } else if (topLink.lastMinutesSummary && topLink.lastMinutesSummary.trim().length > 0) {
        lastMinutesOk = true;
        lastMinutesLabel = 'Linked';
        lastMinutesDetail = topLink.reason || 'Prior minutes available';
      } else if (topLink.score >= 3) {
        lastMinutesOk = true;
        lastMinutesLabel = 'Linked';
        lastMinutesDetail = topLink.reason || 'Same series match';
      } else {
        lastMinutesOk = false;
        lastMinutesLabel = 'Needs notes';
        lastMinutesDetail = 'Linked meeting has no minutes';
      }
    } else if (!meeting.series && (!meeting.attendees || meeting.attendees.length <= 1)) {
      // First meeting or standalone session
      lastMinutesOk = true;
      lastMinutesLabel = 'First meeting';
      lastMinutesDetail = 'No prior history expected';
    } else {
      lastMinutesOk = false;
      lastMinutesLabel = 'None found';
      lastMinutesDetail = 'No previous meeting linked';
    }

    const lastMinutes = {
      ok: lastMinutesOk,
      label: lastMinutesLabel,
      detail: lastMinutesDetail,
      link: topLink
    };

    // 3. Open Actions Criterion
    const carriedOverCount = Array.isArray(relatedLinks)
      ? relatedLinks.reduce((acc, l) => acc + (l.openActionsCount || 0), 0)
      : 0;
    const meetingItems = Array.isArray(meetingData.items) ? meetingData.items : [];
    const meetingOpenActions = meetingItems.filter(i => i.kind === 'action' && !i.done).length;
    const totalOpenActions = carriedOverCount + meetingOpenActions;

    const isReviewed = Boolean(meetingData.actionsReviewed);
    const actionsOk = isReviewed;
    let actionsLabel = 'Unreviewed';
    let actionsDetail = 'Action review pending';

    if (isReviewed) {
      actionsLabel = 'Reviewed';
      actionsDetail = totalOpenActions === 0 ? 'All clear (0 open)' : `${totalOpenActions} open (reviewed)`;
    } else {
      if (totalOpenActions === 0) {
        actionsLabel = 'Unreviewed';
        actionsDetail = '0 open · Review pending';
      } else {
        actionsLabel = `${totalOpenActions} to review`;
        actionsDetail = `${totalOpenActions} open action${totalOpenActions > 1 ? 's' : ''} need review`;
      }
    }

    const openActions = {
      ok: actionsOk,
      label: actionsLabel,
      detail: actionsDetail,
      totalOpen: totalOpenActions,
      carriedOverCount,
      meetingOpenActions,
      reviewed: isReviewed
    };

    // People info
    const attendees = Array.isArray(meeting.attendees) ? meeting.attendees : [];
    const people = {
      count: attendees.length,
      label: `${attendees.length} attendee${attendees.length !== 1 ? 's' : ''}`
    };

    // Scoring computation
    const totalCount = 3;
    const metCount = (agenda.ok ? 1 : 0) + (lastMinutes.ok ? 1 : 0) + (openActions.ok ? 1 : 0);
    const scorePercent = Math.round((metCount / totalCount) * 100);

    let status = 'needs_prep';
    let badgeClass = 'warn';
    let badgeText = 'Needs prep';

    if (scorePercent === 100) {
      status = 'prepared';
      badgeClass = 'ok';
      badgeText = 'Prepared';
    } else if (metCount > 0) {
      status = 'in_progress';
      badgeClass = 'info';
      badgeText = `Prep ${metCount}/${totalCount}`;
    }

    // Missing items checklist
    const missingItems = [
      {
        key: 'agenda',
        label: 'Agenda',
        ok: agenda.ok,
        statusText: agenda.ok ? 'Agenda drafted' : 'Missing agenda',
        detail: agenda.detail
      },
      {
        key: 'lastMinutes',
        label: 'Prior minutes',
        ok: lastMinutes.ok,
        statusText: lastMinutes.ok ? 'Prior minutes connected' : 'Missing prior minutes',
        detail: lastMinutes.detail
      },
      {
        key: 'openActions',
        label: 'Open actions',
        ok: openActions.ok,
        statusText: openActions.ok ? 'Open actions reviewed' : 'Missing action review',
        detail: openActions.detail
      }
    ];

    // Inbox evaluation from mission notes system of record
    const hasPendingInbox = options.inboxStatus === 'pending' || Boolean(options.missionSummary?.inbox?.total_pending > 0);
    const inbox = {
      pending: hasPendingInbox,
      status: options.inboxStatus || (hasPendingInbox ? 'pending' : 'folded'),
      label: hasPendingInbox ? 'Inbox pending' : 'Folded',
      detail: hasPendingInbox ? 'Inbox pending: raw minutes waiting to be folded' : 'Notes up to date'
    };

    const missingCount = missingItems.filter(i => !i.ok).length;
    const missingSummary = missingCount === 0
      ? 'All items prepared'
      : `Missing: ${missingItems.filter(i => !i.ok).map(i => i.label).join(' · ')}`;

    return {
      scorePercent,
      metCount,
      totalCount,
      status,
      badgeClass,
      badgeText,
      agenda,
      lastMinutes,
      openActions,
      inbox,
      people,
      missingItems,
      missingCount,
      missingSummary
    };
  }

  /**
   * Evaluates the Phase 4 prep checklist (from notes and meeting context only, 3-4 dots, NO percentage):
   * 1. previous meeting of this series folded
   * 2. mission inbox has nothing older than this meeting's previous occurrence
   * 3. open actions for this workstream reviewed (UI tick, UI state)
   * 4. agenda notes written (optional)
   */
  static computeCockpitChecklist(meeting, meetingData = {}, options = {}) {
    const { prevMeeting = null, prevMeetingFolded = false, inboxStatus = null, missionSummary = null } = options;

    // 1. Previous meeting of this series folded (or standalone/first meeting)
    const dot1Ok = !prevMeeting || Boolean(prevMeetingFolded);
    const dot1 = {
      key: 'prevFolded',
      label: 'Previous meeting folded',
      ok: dot1Ok,
      detail: !prevMeeting ? 'First occurrence / standalone' : (dot1Ok ? 'Previous session folded' : 'Previous session not folded')
    };

    // 2. Mission inbox has nothing older than this meeting's previous occurrence
    let dot2Ok = true;
    let dot2Detail = 'Inbox up to date';
    if (inboxStatus && Array.isArray(inboxStatus.files) && inboxStatus.files.length > 0) {
      if (prevMeeting && prevMeeting.date) {
        const hasOlder = inboxStatus.files.some(f => {
          const fDate = f.date || (typeof f === 'string' && f.slice(0, 10)) || (f.filename && f.filename.slice(0, 10));
          return fDate && fDate <= prevMeeting.date;
        });
        if (hasOlder) {
          dot2Ok = false;
          dot2Detail = 'Pending inbox file from prior cycle';
        }
      } else {
        dot2Detail = `${inboxStatus.pendingCount || inboxStatus.files.length} pending in inbox`;
      }
    }
    const dot2 = {
      key: 'cleanInbox',
      label: 'Inbox clean',
      ok: dot2Ok,
      detail: dot2Detail
    };

    // 3. Open actions for this workstream reviewed (UI tick, UI state)
    const dot3Ok = Boolean(meetingData.actionsReviewed);
    const dot3 = {
      key: 'actionsReviewed',
      label: 'Actions reviewed',
      ok: dot3Ok,
      detail: dot3Ok ? 'Reviewed' : 'Review pending'
    };

    // 4. Agenda notes written (optional)
    const hasAgenda = Boolean(meetingData.agenda && meetingData.agenda.trim().length > 0);
    const dot4 = {
      key: 'agendaDrafted',
      label: 'Agenda notes',
      ok: hasAgenda,
      optional: true,
      detail: hasAgenda ? 'Drafted' : 'Optional scratchpad'
    };

    return {
      dots: [dot1, dot2, dot3, dot4],
      allRequiredMet: dot1Ok && dot2Ok && dot3Ok
    };
  }

  /**
   * Helper to check if a meeting is scheduled within the next 48 hours.
   */
  static isWithin48Hours(meetingDate, meetingStart = '00:00', refDateStr = null, refTimeStr = '00:00') {
    if (!meetingDate) return false;
    try {
      const actualRefDate = refDateStr || (typeof getTodayDateStr === 'function' ? getTodayDateStr() : new Date().toISOString().slice(0, 10));
      const meetTime = new Date(`${meetingDate}T${meetingStart || '00:00'}:00`).getTime();
      const refTime = new Date(`${actualRefDate}T${refTimeStr || '00:00'}:00`).getTime();
      const diffMs = meetTime - refTime;
      const diffHours = diffMs / (1000 * 60 * 60);
      return diffHours >= 0 && diffHours <= 48;
    } catch (e) {
      return true;
    }
  }

  /**
   * Computes aggregate prep metrics for a collection of meetings.
   * 
   * @param {Array} meetings List of calendar events
   * @param {Object} store Data store
   * @returns {Promise<Object>} Aggregate summary
   */
  static async computeCollectionPrep(meetings, store) {
    if (!meetings || meetings.length === 0) {
      return {
        total: 0,
        preparedCount: 0,
        partialCount: 0,
        needsPrepCount: 0,
        averagePercent: 0,
        evaluations: new Map()
      };
    }

    const evaluations = new Map();
    let preparedCount = 0;
    let partialCount = 0;
    let needsPrepCount = 0;
    let sumPercents = 0;

    for (const m of meetings) {
      const data = await store.getMeetingData(m.id);
      const links = await store.suggestLinks(m);
      const prep = this.computeMeetingPrep(m, data, links);
      evaluations.set(m.id, prep);

      sumPercents += prep.scorePercent;
      if (prep.status === 'prepared') preparedCount++;
      else if (prep.status === 'in_progress') partialCount++;
      else needsPrepCount++;
    }

    const total = meetings.length;
    const averagePercent = Math.round(sumPercents / total);

    return {
      total,
      preparedCount,
      partialCount,
      needsPrepCount,
      averagePercent,
      evaluations
    };
  }
}

MeetingHub.PrepScoreCalculator = PrepScoreCalculator;

/* === Module: model/store.js === */
/**
 * Central Reactive Application Store
 * 
 * Bridges IndexedDB via the database adapter to the UI components.
 * Manages caching, query filtering, meeting notes persistence, minutes intelligence,
 * dynamic project configuration, and reactive subscribers.
 */










class MeetingHubStore {
  constructor() {
    this.db = null;
    this.eventsCache = [];
    this.seriesCache = [];
    this.projectsCache = [];
    this.missionsCache = [];
    this.missionSummariesCache = new Map();
    this.inboxStatusCache = new Map();
    this.deletedEventIds = new Set();
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

  async _loadDeletedIds() {
    try {
      const meta = await this.db.get('meta', 'deleted_event_ids');
      if (meta && Array.isArray(meta.value)) {
        for (const id of meta.value) if (id) this.deletedEventIds.add(String(id));
      }
    } catch (e) {}
    try {
      if (typeof localStorage !== 'undefined') {
        const raw = localStorage.getItem('mhub_deleted_events');
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            for (const id of parsed) if (id) this.deletedEventIds.add(String(id));
          }
        }
      }
    } catch (e) {}
  }

  async _persistDeletedIds() {
    const arr = Array.from(this.deletedEventIds);
    try {
      if (this.db) {
        await this.db.put('meta', { key: 'deleted_event_ids', value: arr });
      }
    } catch (e) {}
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('mhub_deleted_events', JSON.stringify(arr));
      }
    } catch (e) {}
  }

  getDeletedEventIds() {
    return Array.from(this.deletedEventIds);
  }

  async mergeDeletedEventIds(ids = []) {
    if (!Array.isArray(ids)) return;
    let changed = false;
    for (const id of ids) {
      if (id && !this.deletedEventIds.has(String(id))) {
        this.deletedEventIds.add(String(id));
        changed = true;
      }
    }
    if (changed) {
      await this._persistDeletedIds();
    }
  }

  async refreshCache() {
    await this._loadDeletedIds();
    const allRawEvents = await this.db.getAll('events');
    const activeEvents = [];
    for (const ev of allRawEvents) {
      if (EventModel.isDeletedOrDeclined(ev, this.deletedEventIds)) {
        try {
          await this.db.delete('events', ev.id);
        } catch (e) {}
      } else {
        activeEvents.push(ev);
      }
    }
    this.eventsCache = activeEvents;
    this.seriesCache = SeriesModel.collapse(this.eventsCache);

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

  getEventsForSeries(seriesId) {
    if (!seriesId) return [];
    return (this.eventsCache || []).filter(e => e.seriesId === seriesId);
  }

  getAllSeries() {
    return this.seriesCache;
  }

  /**
   * Deletes an event from the dashboard, persists its ID in deletedEventIds so future syncs/imports
   * do not resurrect it, notifies backend /api/calendar/delete if reachable, and emits 'event_deleted'.
   */
  async deleteEvent(eventId) {
    if (!eventId) return null;
    if (!this.db) await this.init();
    const idStr = String(eventId);
    const deletedEvent = this.getEvent(idStr);

    this.deletedEventIds.add(idStr);
    await this._persistDeletedIds();

    try {
      await this.db.delete('events', idStr);
    } catch (e) {}

    this.eventsCache = this.eventsCache.filter(e => String(e.id) !== idStr);
    this.seriesCache = SeriesModel.collapse(this.eventsCache);

    if (typeof fetch !== 'undefined') {
      fetch('/api/calendar/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId: idStr })
      }).catch(() => {});
    }

    this.notify({ type: 'event_deleted', eventId: idStr, deletedEvent });
    return deletedEvent;
  }

  /**
   * Restores a previously deleted event (Undo support).
   */
  async restoreEvent(eventObj) {
    if (!eventObj || !eventObj.id) return null;
    if (!this.db) await this.init();
    const idStr = String(eventObj.id);

    this.deletedEventIds.delete(idStr);
    await this._persistDeletedIds();

    const normalized = EventModel.normalize(eventObj);
    await this.db.put('events', normalized);

    if (!this.eventsCache.some(e => String(e.id) === idStr)) {
      this.eventsCache.push(normalized);
    }
    this.seriesCache = SeriesModel.collapse(this.eventsCache);

    if (typeof fetch !== 'undefined') {
      fetch('/api/calendar/restore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId: idStr })
      }).catch(() => {});
    }

    this.notify({ type: 'event_restored', eventId: idStr, event: normalized });
    return normalized;
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

  getProjectName(id) {
    if (!id) return '';
    const norm = (id === 'clariane' ? 'clariane-hdj' : id).toLowerCase();
    let registry = (this.missionsCache && this.missionsCache.length > 0) ? this.missionsCache : null;
    if (!registry && typeof window !== 'undefined' && window.MISSIONS_SNAPSHOT && Array.isArray(window.MISSIONS_SNAPSHOT.missions)) {
      registry = window.MISSIONS_SNAPSHOT.missions;
    }
    const list = [...(registry || []), ...(this.projectsCache || []), ...DEFAULT_PROJECTS];
    const found = list.find(p => p && String(p.id || '').toLowerCase() === norm);
    return found ? found.name : id;
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

  getEventsForProject(projectId, registryOverride = null) {
    if (!projectId) return [];
    const pId = projectId.toLowerCase();
    let registry = registryOverride || ((this.missionsCache && this.missionsCache.length > 0) ? this.missionsCache : null);
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

  /**
   * Alias for saveMeetingData (used by meeting_panel.js and tests).
   */
  async updateMeetingData(eventId, patch) {
    return this.saveMeetingData(eventId, patch);
  }

  /* ================= Google Docs & Minutes Intelligence ================= */

  /**
   * Fetches Google Doc text via orchestrator API.
   * Client minutes are never bundled into the frontend application bundle.
   */
  async fetchGoogleDoc(docRef) {
    const rawStr = (typeof docRef === 'object' && docRef !== null)
      ? (docRef.url || docRef.docId || '')
      : String(docRef || '').trim();
    if (!rawStr) throw new Error('Missing document ID or URL');

    const docIdMatch = rawStr.match(/\/d\/([a-zA-Z0-9_-]+)/);
    const docId = docIdMatch ? docIdMatch[1] : rawStr.split('/')[0].split('?')[0].split('#')[0];

    // Try GET endpoint first
    try {
      const resp = await fetch(`/api/docs/fetch?docId=${encodeURIComponent(docId)}`);
      if (resp.ok) {
        const json = await resp.json();
        if (json.status === 'success') {
          return { ...json, text: json.content || json.text || '' };
        }
      }
    } catch (e) {
      // Backend not running or offline
    }

    // Fallback to POST endpoint
    try {
      const resp = await fetch('/api/docs/fetch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ docId, url: rawStr })
      });
      if (resp.ok) {
        const json = await resp.json();
        if (json.status === 'success') {
          return { ...json, text: json.content || json.text || '' };
        }
      }
    } catch (e) {}

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

    // Node test environment fallback (for automated test suite)
    if (typeof process !== 'undefined' && process.versions && process.versions.node) {
      try {
        const { execSync } = await import('child_process');
        const cmd = `python3 -c "import sys; sys.path.insert(0, '/Users/ayrtonandre/Documents/work/AGY'); import mission_notes, json; print(json.dumps(mission_notes.list_inbox_files('${id}')))"`;
        const out = execSync(cmd, { encoding: 'utf8' });
        const res = JSON.parse(out);
        return {
          status: 'ok',
          pendingCount: res.total_pending !== undefined ? res.total_pending : (res.pending || []).length,
          files: res.pending || [],
          foldedCount: res.total_folded !== undefined ? res.total_folded : (res.folded || []).length,
          foldedFiles: res.folded || [],
          isOffline: false
        };
      } catch (err) {}
    }

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
  /**
   * Synchronous per-meeting inbox state from an already-loaded mission inbox and summary.
   * Inbox entries may be strings (filenames) or objects ({ filename, eventId, ... }).
   * Returns: 'folded' | 'pending' | 'not_sent'
   */
  meetingInboxState(meetingId, inboxStatus, summary = null) {
    if (!meetingId) return 'not_sent';
    const mId = String(meetingId);
    const has = (list) => Array.isArray(list) && list.some(item => {
      if (typeof item === 'string') return item.includes(mId);
      return Boolean(item) && ((item.eventId && item.eventId === mId) ||
             (item.filename && item.filename.includes(mId)));
    });
    const inbox = inboxStatus || {};
    if (has(inbox.foldedFiles) || has(inbox.folded)) return 'folded';
    if (has(inbox.files) || has(inbox.pending)) return 'pending';
    if (summary) {
      const citesAction = (summary.actions || []).some(a => a.source && String(a.source).includes(mId));
      const citesDecision = (summary.decisions || []).some(d => d.meetingId === mId || (d.source && String(d.source).includes(mId)));
      if (citesAction || citesDecision) return 'folded';
    }
    return 'not_sent';
  }

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
    const textContent = payload.text || payload.content || '';
    const body = {
      eventId: meetingId,
      title: payload.title || '',
      date: payload.date || '',
      attendees: payload.attendees || [],
      googleDocUrl: payload.googleDocUrl || '',
      source: payload.source || 'meeting_hub',
      text: textContent,
      content: textContent
    };

    try {
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
    } catch (e) {
      if (typeof process !== 'undefined' && process.versions && process.versions.node) {
        try {
          const { execSync } = await import('child_process');
          const escapedBody = JSON.stringify(body).replace(/"/g, '\\"');
          const cmd = `python3 -c "import sys; sys.path.insert(0, '/Users/ayrtonandre/Documents/work/AGY'); import mission_notes, json; res = mission_notes.write_inbox_file('${id}', json.loads('${escapedBody}')); print(json.dumps(res))"`;
          const out = execSync(cmd, { encoding: 'utf8' });
          const res = JSON.parse(out);
          this.inboxStatusCache.delete(id);
          this.missionSummariesCache.delete(id);
          this.notify({ type: 'inbox_updated', missionId: id, meetingId });
          return res;
        } catch (err) {}
      }
      throw e;
    }
  }

  /**
   * Toggles or sets an action's completion state (Open <-> Done) in mission Actions.md.
   * Invalidates mission summaries cache and notifies subscribers.
   */
  async toggleAction(actionId, missionId = null, done = null) {
    if (!actionId) throw new Error("Missing actionId");
    const id = (missionId === 'clariane' ? 'clariane-hdj' : missionId) || null;
    const body = { actionId, missionId: id, done };

    try {
      const resp = await fetch('/api/actions/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      if (!resp.ok) {
        const errText = await resp.text();
        throw new Error(`Failed to toggle action: HTTP ${resp.status} - ${errText}`);
      }
      const result = await resp.json();
      const targetMission = result.missionId || id;
      if (targetMission) {
        this.missionSummariesCache.delete(targetMission);
      } else {
        this.missionSummariesCache.clear();
      }
      this.notify({ type: 'action_toggled', actionId, missionId: targetMission, done: result.done });
      return result;
    } catch (e) {
      if (typeof process !== 'undefined' && process.versions && process.versions.node) {
        try {
          const { execSync } = await import('child_process');
          const mArg = id ? `'${id}'` : 'None';
          const dArg = done === null ? 'None' : (done ? 'True' : 'False');
          const cmd = `python3 -c "import sys; sys.path.insert(0, '/Users/ayrtonandre/Documents/work/AGY'); import mission_notes, json; res = mission_notes.toggle_action('${actionId}', done=${dArg}, mission_id=${mArg}); print(json.dumps(res))"`;
          const out = execSync(cmd, { encoding: 'utf8' });
          const res = JSON.parse(out);
          const targetMission = res.missionId || id;
          if (targetMission) {
            this.missionSummariesCache.delete(targetMission);
          } else {
            this.missionSummariesCache.clear();
          }
          this.notify({ type: 'action_toggled', actionId, missionId: targetMission, done: res.done });
          return res;
        } catch (err) {}
      }
      throw e;
    }
  }

  /**
   * Updates an action's attributes (title, owner, workstream, due date, status) in mission Actions.md.
   * Invalidates mission summaries cache and notifies subscribers.
   */
  async updateAction(actionId, updates = {}, missionId = null) {
    if (!actionId) throw new Error("Missing actionId");
    const id = (missionId === 'clariane' ? 'clariane-hdj' : missionId) || null;
    const body = { actionId, missionId: id, updates };

    try {
      const url = (typeof window === 'undefined') ? 'http://localhost:8080/api/actions/update' : '/api/actions/update';
      const resp = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      if (!resp.ok) {
        const errText = await resp.text();
        throw new Error(`Failed to update action: HTTP ${resp.status} - ${errText}`);
      }
      const result = await resp.json();
      const targetMission = result.missionId || id;
      if (targetMission) {
        this.missionSummariesCache.delete(targetMission);
      } else {
        this.missionSummariesCache.clear();
      }
      this.notify({ type: 'action_updated', actionId, missionId: targetMission, action: result, updates });
      return result;
    } catch (e) {
      if (typeof process !== 'undefined' && process.versions && process.versions.node) {
        try {
          const { execSync } = await import('child_process');
          const mArg = id ? `'${id}'` : 'None';
          const b64 = Buffer.from(JSON.stringify(updates), 'utf8').toString('base64');
          const cmd = `python3 -c "import sys, base64, json; sys.path.insert(0, '/Users/ayrtonandre/Documents/work/AGY'); import mission_notes; u = json.loads(base64.b64decode('${b64}').decode('utf-8')); res = mission_notes.update_action('${actionId}', u, mission_id=${mArg}); print(json.dumps(res))"`;
          const out = execSync(cmd, { encoding: 'utf8' });
          const res = JSON.parse(out);
          const targetMission = res.missionId || id;
          if (targetMission) {
            this.missionSummariesCache.delete(targetMission);
          } else {
            this.missionSummariesCache.clear();
          }
          this.notify({ type: 'action_updated', actionId, missionId: targetMission, action: res, updates });
          return res;
        } catch (err) {}
      }
      throw e;
    }
  }

  /**
   * Lists unassigned inbox files awaiting a mission home (Phase 5).
   */
  async getUnassignedInboxFiles() {
    try {
      const resp = await fetch('/api/inbox/unassigned');
      if (resp.ok) {
        return await resp.json();
      }
    } catch (e) {}

    if (typeof process !== 'undefined' && process.versions && process.versions.node) {
      try {
        const { execSync } = await import('child_process');
        const cmd = `python3 -c "import sys; sys.path.insert(0, '/Users/ayrtonandre/Documents/work/AGY'); import mission_notes, json; print(json.dumps(mission_notes.list_unassigned_inbox_files()))"`;
        const out = execSync(cmd, { encoding: 'utf8' });
        return JSON.parse(out);
      } catch (err) {}
    }
    return { count: 0, files: [] };
  }

  /**
   * Writes an ambiguous capture to unassigned inbox (Phase 5).
   */
  async writeUnassignedInboxFile(payload = {}) {
    const body = {
      title: payload.title || 'Untitled note',
      text: payload.text || '',
      date: payload.date || new Date().toISOString().slice(0, 10),
      time: payload.time || '',
      attendees: payload.attendees || [],
      source: payload.source || 'paste_anywhere',
      docUrl: payload.docUrl || ''
    };

    try {
      const resp = await fetch('/api/inbox/unassigned', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      if (resp.ok) {
        const result = await resp.json();
        this.notify({ type: 'unassigned_inbox_updated' });
        return result;
      }
    } catch (e) {}

    if (typeof process !== 'undefined' && process.versions && process.versions.node) {
      try {
        const { execSync } = await import('child_process');
        const escapedBody = JSON.stringify(body).replace(/"/g, '\\"');
        const cmd = `python3 -c "import sys; sys.path.insert(0, '/Users/ayrtonandre/Documents/work/AGY'); import mission_notes, json; res = mission_notes.write_unassigned_inbox_file(json.loads('${escapedBody}')); print(json.dumps(res))"`;
        const out = execSync(cmd, { encoding: 'utf8' });
        const res = JSON.parse(out);
        this.notify({ type: 'unassigned_inbox_updated' });
        return res;
      } catch (err) {}
    }
    throw new Error('Failed to write unassigned inbox file');
  }

  /**
   * Assigns an unassigned capture to target mission and optional event (Phase 5).
   */
  async assignInboxFile(filename, targetMissionId, targetEventId = null) {
    const body = { filename, missionId: targetMissionId, eventId: targetEventId };
    try {
      const resp = await fetch('/api/inbox/assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      if (resp.ok) {
        const res = await resp.json();
        this.inboxStatusCache.delete(targetMissionId);
        this.missionSummariesCache.delete(targetMissionId);
        this.notify({ type: 'inbox_assigned', filename, missionId: targetMissionId });
        return res;
      }
    } catch (e) {}

    if (typeof process !== 'undefined' && process.versions && process.versions.node) {
      try {
        const { execSync } = await import('child_process');
        const cmd = `python3 -c "import sys; sys.path.insert(0, '/Users/ayrtonandre/Documents/work/AGY'); import mission_notes, json; print(json.dumps(mission_notes.assign_inbox_file('${filename}', '${targetMissionId}', ${targetEventId ? `'${targetEventId}'` : 'None'})))"`;
        const out = execSync(cmd, { encoding: 'utf8' });
        const res = JSON.parse(out);
        this.inboxStatusCache.delete(targetMissionId);
        this.missionSummariesCache.delete(targetMissionId);
        this.notify({ type: 'inbox_assigned', filename, missionId: targetMissionId });
        return res;
      } catch (err) {}
    }
    throw new Error('Failed to assign inbox file');
  }

  /**
   * Granola status check (Phase 5).
   */
  async getGranolaStatus() {
    try {
      const resp = await fetch('/api/granola/status');
      if (resp.ok) {
        return await resp.json();
      }
    } catch (e) {}
    return { configured: false, active: false, folder: null, pendingFilesCount: 0 };
  }

  /**
   * Triggers Granola watched folder processing (Phase 5).
   */
  async syncGranola(events = null) {
    const body = { events: events || this.eventsCache || [] };
    try {
      const resp = await fetch('/api/granola/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      if (resp.ok) {
        const res = await resp.json();
        this.inboxStatusCache.clear();
        this.missionSummariesCache.clear();
        this.notify({ type: 'granola_synced', result: res });
        return res;
      }
    } catch (e) {}

    if (typeof process !== 'undefined' && process.versions && process.versions.node) {
      try {
        const { execSync } = await import('child_process');
        const cmd = `python3 -c "import sys; sys.path.insert(0, '/Users/ayrtonandre/Documents/work/AGY'); import mission_notes, json; print(json.dumps(mission_notes.process_granola_folder()))"`;
        const out = execSync(cmd, { encoding: 'utf8' });
        const res = JSON.parse(out);
        this.inboxStatusCache.clear();
        this.missionSummariesCache.clear();
        this.notify({ type: 'granola_synced', result: res });
        return res;
      } catch (err) {}
    }
    return { status: 'skipped', error: 'Sync unavailable' };
  }

  /**
   * Triggers Google Docs auto-pull for opted-in missions (Phase 5).
   */
  async autoPullGoogleDocs(events = null) {
    const body = { events: events || this.eventsCache || [] };
    try {
      const resp = await fetch('/api/docs/auto-pull', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      if (resp.ok) {
        const res = await resp.json();
        this.inboxStatusCache.clear();
        this.missionSummariesCache.clear();
        this.notify({ type: 'docs_auto_pulled', result: res });
        return res;
      }
    } catch (e) {}
    return { status: 'skipped', pulledCount: 0 };
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
    const registry = await this.getMissionsRegistry();
    const missions = Array.isArray(registry) ? registry : (registry?.missions || []);
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

    const events = this.getEventsForProject(id, missions);
    
    // Classify meetings into lanes
    const lanes = {
      prep: [],
      fold: [],
      folded: [],
      hidden: []
    };

    events.forEach(e => {
      // classifyMeeting expects the per-meeting state, not the mission-level inbox object
      const inboxState = this.meetingInboxState(e.id, inboxStatus, summary);
      const lane = (typeof classifyMeeting === 'function')
        ? classifyMeeting(e, inboxState, now)
        : (typeof MeetingHub !== 'undefined' && MeetingHub.classifyMeeting ? MeetingHub.classifyMeeting(e, inboxState, now) : 'hidden');
      const item = { ...e, inboxState };
      if (lanes[lane]) {
        lanes[lane].push(item);
      } else {
        lanes.hidden.push(item);
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

    // 1. Next meeting today across all missions (work meetings only)
    const todayEvents = (this.eventsCache || [])
      .filter(e => e.date === todayStr && !e.isAllDay && !e.isTraining && e.stream !== 'life' && (e.start || '') >= nowTimeStr)
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

      const mSummary = this.missionSummariesCache.get(m.id) || null;
      let foldCount = 0;
      mEvents.forEach(e => {
        const inboxState = this.meetingInboxState(e.id, inboxStatus, mSummary);
        const lane = (typeof classifyMeeting === 'function')
          ? classifyMeeting(e, inboxState, now)
          : (typeof MeetingHub !== 'undefined' && MeetingHub.classifyMeeting ? MeetingHub.classifyMeeting(e, inboxState, now) : 'hidden');
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
const store = new MeetingHubStore();

MeetingHub.MeetingHubStore = MeetingHubStore;
MeetingHub.store = store;

/* === Module: ui/icons.js === */
/**
 * Stroke SVG Icons (Arty Design System)
 * Strictly Lucide/Tabler stroke icons. No emojis.
 */

const Icons = {
  calendar: `<svg class="i" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>`,
  week: `<svg class="i" viewBox="0 0 24 24"><path d="M3 6h18M3 12h18M3 18h18"/></svg>`,
  users: `<svg class="i" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
  checkSquare: `<svg class="i" viewBox="0 0 24 24"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>`,
  link: `<svg class="i" viewBox="0 0 24 24"><path d="M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1"/><path d="M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1"/></svg>`,
  activity: `<svg class="i" viewBox="0 0 24 24"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>`,
  plus: `<svg class="i" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>`,
  cart: `<svg class="i" viewBox="0 0 24 24"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6"/></svg>`,
  externalLink: `<svg class="i" viewBox="0 0 24 24"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>`,
  video: `<svg class="i" viewBox="0 0 24 24"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>`,
  clock: `<svg class="i" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
  check: `<svg class="i" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>`,
  alertCircle: `<svg class="i" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
  arrowRight: `<svg class="i" viewBox="0 0 24 24"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>`,
  trash: `<svg class="i" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>`,
  refreshCw: `<svg class="i" viewBox="0 0 24 24"><path d="M23 4v6h-6M1 20v-6h6"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>`,
  sun: `<svg class="i" viewBox="0 0 24 24"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`,
  moon: `<svg class="i" viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`,
  search: `<svg class="i" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`,
  x: `<svg class="i" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
  sparkles: `<svg class="i" viewBox="0 0 24 24"><path d="M12 3l1.9 5.8a2 2 0 0 0 1.3 1.3L21 12l-5.8 1.9a2 2 0 0 0-1.3 1.3L12 21l-1.9-5.8a2 2 0 0 0-1.3-1.3L3 12l5.8-1.9a2 2 0 0 0 1.3-1.3L12 3z"/></svg>`,
  unlink: `<svg class="i" viewBox="0 0 24 24"><path d="M18.84 12.25l1.72-1.71a4.84 4.84 0 0 0-6.84-6.85l-1.72 1.72"/><path d="M5.16 11.75l-1.72 1.71a4.84 4.84 0 0 0 6.84 6.85l1.72-1.72"/><line x1="2" y1="2" x2="22" y2="22"/></svg>`,
  layers: `<svg class="i" viewBox="0 0 24 24"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>`,
  fileText: `<svg class="i" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>`,
  download: `<svg class="i" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>`,
  upload: `<svg class="i" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>`,
  database: `<svg class="i" viewBox="0 0 24 24"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>`,
  chevronDown: `<svg class="i" viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"/></svg>`,
  chevronUp: `<svg class="i" viewBox="0 0 24 24"><polyline points="18 15 12 9 6 15"/></svg>`,
  edit: `<svg class="i" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`,
  folder: `<svg class="i" viewBox="0 0 24 24"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>`,
  panelRightClose: `<svg class="i" viewBox="0 0 24 24"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M15 3v18"/><path d="m8 9 3 3-3 3"/></svg>`,
  panelRightOpen: `<svg class="i" viewBox="0 0 24 24"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M15 3v18"/><path d="m11 15-3-3 3-3"/></svg>`,
  chevronRight: `<svg class="i" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>`
};

MeetingHub.Icons = Icons;

/* === Module: ui/action_modal.js === */
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


class ActionModal {
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

function openActionEditModal({ action, missionId = null, store = null, onSave = null }) {
  if (!_activeActionModal) {
    _activeActionModal = new ActionModal({ store });
  } else if (store) {
    _activeActionModal.store = store;
  }
  return _activeActionModal.open({ action, missionId, onSave });
}

MeetingHub.ActionModal = ActionModal;
MeetingHub.openActionEditModal = openActionEditModal;

/* === Module: ui/shell.js === */
/**
 * Application Shell Component (Phase 2 Cockpit Rail)
 * 
 * Renders the persistent dark navy sidebar and sticky header,
 * manages mission rail navigation, Today strip, live calendar source sync status,
 * storage engine info, and theme toggle.
 */



class ShellUI {
  constructor({
    store = null,
    onNavigate,
    onModeChange,
    onNewMeeting,
    onTodayClick,
    onSyncTrigger,
    onSearch,
    onExportData,
    onImportData,
    getStorageEngine,
    onProjectChange,
    onConfirmSuggestedProject,
    onCreateProject,
    onTogglePanel,
    projects = [],
    activeProjectId = 'ge-enterprise',
    suggestedProjects = []
  } = {}) {
    this.store = store;
    this.onNavigate = onNavigate;
    this.onModeChange = onModeChange;
    this.onNewMeeting = onNewMeeting;
    this.onTodayClick = onTodayClick;
    this.onSyncTrigger = onSyncTrigger;
    this.onSearch = onSearch;
    this.onExportData = onExportData;
    this.onImportData = onImportData;
    this.getStorageEngine = getStorageEngine || (() => 'IndexedDB');
    this.onProjectChange = onProjectChange;
    this.onConfirmSuggestedProject = onConfirmSuggestedProject;
    this.onCreateProject = onCreateProject;
    this.onTogglePanel = onTogglePanel;

    this.projects = projects;
    this.activeProjectId = activeProjectId || 'ge-enterprise';
    this.suggestedProjects = suggestedProjects;
    this.isPanelCollapsed = false;

    this.currentView = 'mission';
    this.currentMode = 'all';
    this.isSyncing = false;
    this.syncStatus = null;
    this.railState = null;
    this.showArchived = false;
    this.theme = this.getInitialTheme();

    this.applyTheme(this.theme);
  }

  getInitialTheme() {
    try {
      const saved = localStorage.getItem('mhub_theme');
      if (saved) return saved;
    } catch (e) {}
    return 'dark';
  }

  applyTheme(theme) {
    this.theme = theme;
    const html = document.documentElement;
    if (theme === 'dark') {
      html.classList.add('dark');
      html.classList.remove('light');
    } else {
      html.classList.add('light');
      html.classList.remove('dark');
    }
    try {
      localStorage.setItem('mhub_theme', theme);
    } catch (e) {}
  }

  toggleTheme() {
    const next = this.theme === 'dark' ? 'light' : 'dark';
    this.applyTheme(next);
    this.renderThemeButton();
  }

  setSyncStatus(status) {
    this.syncStatus = status;
    this.renderSyncSection();
  }

  setRailState(railState) {
    this.railState = railState;
    this.renderSidebar();
  }

  async refreshRail() {
    if (this.store && typeof this.store.getRailState === 'function') {
      try {
        this.railState = await this.store.getRailState();
      } catch (e) {
        console.warn('[ShellUI] Failed to refresh rail state:', e);
      }
    }
    this.renderSidebar();
  }

  setActiveProjectId(id) {
    if (!id) return;
    this.activeProjectId = id;
    const aside = document.querySelector('aside');
    if (aside) {
      aside.querySelectorAll('.nav[data-nav-mission]').forEach(btn => {
        if (btn.dataset.navMission === id) {
          btn.classList.add('on');
        } else {
          btn.classList.remove('on');
        }
      });
    }
  }

  setProjects(projects, activeProjectId, suggestedProjects = []) {
    this.projects = projects || [];
    if (activeProjectId) this.activeProjectId = activeProjectId;
    this.suggestedProjects = suggestedProjects || [];
    this.renderSidebar();
  }

  setSyncing(syncing) {
    this.isSyncing = syncing;
    const syncBtn = document.querySelector('#sidebarSyncBtn');
    if (syncBtn) {
      if (syncing) {
        syncBtn.classList.add('syncing');
        syncBtn.innerHTML = `${Icons.refreshCw} Syncing...`;
      } else {
        syncBtn.classList.remove('syncing');
        syncBtn.innerHTML = `${Icons.refreshCw} Sync now`;
      }
    }
  }

  renderSidebar(openActionsCount = 0) {
    const aside = document.querySelector('aside');
    if (!aside) return;

    // Resolve missions from railState or fallback to this.projects / window.MISSIONS_SNAPSHOT
    let missionList = [];
    if (this.railState && Array.isArray(this.railState.missions) && this.railState.missions.length > 0) {
      missionList = this.railState.missions;
    } else if (this.projects && this.projects.length > 0) {
      missionList = this.projects.map(p => ({
        id: p.id,
        name: p.name,
        archived: Boolean(p.archived || p.status === 'archived'),
        foldCount: 0
      }));
    } else if (typeof window !== 'undefined' && window.MISSIONS_SNAPSHOT && Array.isArray(window.MISSIONS_SNAPSHOT.missions)) {
      missionList = window.MISSIONS_SNAPSHOT.missions.map(m => ({
        id: m.id,
        name: m.name,
        archived: Boolean(m.archived || m.status === 'archived'),
        foldCount: 0
      }));
    }

    const activeMissions = missionList.filter(m => !m.archived);
    const archivedMissions = missionList.filter(m => m.archived);

    // Today strip details
    const nextToday = this.railState?.todayNextMeeting;
    const todayStripHtml = nextToday ? `
      <div class="today-strip" id="railTodayStrip" title="Open next meeting today in its mission">
        <span class="today-strip-icon">${Icons.calendar}</span>
        <span class="today-strip-text">Next: <b>${this._escape(nextToday.timeStr)}</b> ${this._escape(nextToday.title)} · <span class="sub" style="font-size: 11px;">${this._escape(nextToday.missionName)}</span></span>
      </div>
    ` : `
      <div class="today-strip empty">
        <span class="today-strip-icon">${Icons.calendar}</span>
        <span class="today-strip-text">No more meetings today</span>
      </div>
    `;

    const inboxCount = this.railState?.inboxBadge ?? 0;
    const myActionsCount = this.railState?.myActionsBadge ?? openActionsCount;

    aside.innerHTML = `
      <div class="brand">
        <b>M</b>
        <div>Meeting Hub<small>Prep · Capture · Link</small></div>
      </div>

      <!-- Phase 2: Today Strip (Top, One Line) -->
      ${todayStripHtml}

      <!-- Missions Section -->
      <div class="grp">Missions</div>
      <div class="sidebar-missions-list">
        ${activeMissions.map(m => {
          const isSelected = (this.currentView === 'mission' && this.activeProjectId === m.id);
          return `
            <button class="nav ${isSelected ? 'on' : ''}" data-nav-mission="${this._escape(m.id)}" title="${this._escape(m.name)}">
              ${Icons.layers}
              <span style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap; flex: 1; text-align: left;">${this._escape(m.name)}</span>
              ${m.foldCount > 0 ? `<span class="n amber" title="${m.foldCount} meeting(s) to fold">${m.foldCount}</span>` : ''}
            </button>
          `;
        }).join('')}
      </div>

      <!-- Archived Missions Toggle -->
      ${archivedMissions.length > 0 ? `
        <button class="sidebar-archived-toggle" id="toggleArchivedMissionsBtn">
          ${this.showArchived ? '▾' : '▸'} Archived (${archivedMissions.length})
        </button>
        ${this.showArchived ? `
          <div class="sidebar-archived-list" style="margin-left: 8px; border-left: 1px solid var(--border); padding-left: 4px;">
            ${archivedMissions.map(m => {
              const isSelected = (this.currentView === 'mission' && this.activeProjectId === m.id);
              return `
                <button class="nav ${isSelected ? 'on' : ''}" data-nav-mission="${this._escape(m.id)}" title="Archived: ${this._escape(m.name)}" style="opacity: 0.85; font-size: 12px;">
                  ${Icons.archive || Icons.layers}
                  <span style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap; flex: 1; text-align: left;">${this._escape(m.name)}</span>
                  ${m.foldCount > 0 ? `<span class="n amber" title="${m.foldCount} to fold">${m.foldCount}</span>` : ''}
                </button>
              `;
            }).join('')}
          </div>
        ` : ''}
      ` : ''}

      <!-- Across Missions Section -->
      <div class="grp">Across</div>
      <button class="nav ${this.currentView === 'inbox' ? 'on' : ''}" data-nav-view="inbox" title="Cross-mission raw meeting minutes inbox">
        ${Icons.inbox || Icons.layers}Inbox
        ${inboxCount > 0 ? `<span class="n amber" title="${inboxCount} pending minutes">${inboxCount}</span>` : '<span class="n">0</span>'}
      </button>
      <button class="nav ${this.currentView === 'my-actions' ? 'on' : ''}" data-nav-view="my-actions" title="Actions assigned to you across missions">
        ${Icons.checkSquare}My actions
        <span class="n" id="navActions">${myActionsCount}</span>
      </button>
      <button class="nav ${this.currentView === 'calendar' ? 'on' : ''}" data-nav-view="calendar" title="Calendar Views">
        ${Icons.calendar}Calendar
      </button>

      <!-- Ecosystem Section -->
      <div class="grp">Ecosystem</div>
      <a class="nav" href="garmin_workout.html" target="_blank" rel="noopener">
        ${Icons.activity}ATHX Athlete
      </a>

      <div class="spacer"></div>

      <!-- Calendar Streams & Sync Section -->
      <div class="sidebar-sync" id="sidebarSyncContainer">
        <!-- Rendered by renderSyncSection -->
      </div>

      <!-- Theme Switcher & Storage Footer -->
      <div class="sidebar-footer">
        <div class="sidebar-storage-block" id="sidebarStorageBlock">
          <!-- Rendered by renderStorageSection -->
        </div>
        <button class="theme-toggle-btn" id="themeToggleBtn">
          <!-- Rendered by renderThemeButton -->
        </button>
      </div>
    `;

    // Today strip click
    const stripEl = aside.querySelector('#railTodayStrip');
    if (stripEl && nextToday) {
      stripEl.addEventListener('click', () => {
        if (nextToday.missionId) {
          window.location.hash = '#/p/' + encodeURIComponent(nextToday.missionId) + '/m/' + encodeURIComponent(nextToday.event.id);
        } else {
          window.location.hash = '#/calendar/m/' + encodeURIComponent(nextToday.event.id);
        }
      });
    }

    // Mission buttons click
    aside.querySelectorAll('[data-nav-mission]').forEach(btn => {
      btn.addEventListener('click', () => {
        const missionId = btn.dataset.navMission;
        this.activeProjectId = missionId;
        this.currentView = 'mission';
        const target = '#/p/' + encodeURIComponent(missionId);
        if (window.location.hash === target) {
          if (typeof handleHashRoute === 'function') handleHashRoute();
        } else {
          window.location.hash = target;
        }
      });
    });

    // Archived toggle click
    aside.querySelector('#toggleArchivedMissionsBtn')?.addEventListener('click', () => {
      this.showArchived = !this.showArchived;
      this.renderSidebar(openActionsCount);
    });

    // Across views click
    aside.querySelectorAll('[data-nav-view]').forEach(btn => {
      btn.addEventListener('click', () => {
        const view = btn.dataset.navView;
        this.currentView = view;
        let target = '';
        if (view === 'inbox') {
          target = '#/inbox';
        } else if (view === 'my-actions') {
          target = '#/my-actions';
        } else if (view === 'calendar') {
          target = '#/calendar';
        }
        if (target) {
          if (window.location.hash === target) {
            if (typeof handleHashRoute === 'function') handleHashRoute();
          } else {
            window.location.hash = target;
          }
        }
      });
    });

    this.renderSyncSection();
    this.renderStorageSection();
    this.renderThemeButton();
  }

  _escape(str) {
    if (!str) return '';
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  renderSyncSection() {
    const container = document.querySelector('#sidebarSyncContainer');
    if (!container) return;

    const sources = this.syncStatus?.sources || {
      google: { name: 'Artefact', label: 'Google', dotClass: 'pink', status: 'active', relativeTime: 'Just now' },
      outlook: { name: 'Clariane', label: 'Outlook', dotClass: 'blue', status: 'active', relativeTime: 'Just now' },
      icloud: { name: 'Personal', label: 'iCloud', dotClass: 'green', status: 'active', relativeTime: 'Just now' },
      athx: { name: 'ATHX', label: 'Training', dotClass: 'amber', status: 'active', relativeTime: 'Just now' }
    };

    const renderSourceRow = (key, defaultTitle) => {
      const src = sources[key] || { name: key, dotClass: 'blue', status: 'active', relativeTime: 'Never' };
      const isErr = src.status === 'error';
      const tooltip = isErr ? `${src.name}: ${src.error || 'Connection failed'}` : defaultTitle;
      const dotCls = isErr ? 'sync-source-dot error' : `sync-source-dot ${src.dotClass}`;
      const timeDisplay = isErr ? 'Error' : src.relativeTime;

      return `
        <div class="sync-source-item ${isErr ? 'has-error' : ''}" title="${this._escape(tooltip)}">
          <div class="sync-source-info">
            <span class="${dotCls}"></span>
            <span>${this._escape(src.name)}</span>
          </div>
          <span class="sync-source-time ${isErr ? 'err-text' : ''}">${this._escape(timeDisplay)}</span>
        </div>
      `;
    };

    container.innerHTML = `
      <div class="sidebar-sync-header">
        <span class="sidebar-sync-title">Calendar Streams</span>
        <button class="sidebar-sync-btn ${this.isSyncing ? 'syncing' : ''}" id="sidebarSyncBtn" title="Sync all calendar streams">
          ${Icons.refreshCw} ${this.isSyncing ? 'Syncing...' : 'Sync now'}
        </button>
      </div>

      ${renderSourceRow('google', 'Google Calendar API (Work)')}
      ${renderSourceRow('outlook', 'Office 365 Outlook ICS (Client)')}
      ${renderSourceRow('icloud', 'iCloud CalDAV / ICS (Personal)')}
      ${renderSourceRow('athx', 'ATHX Garmin Training Microcycle')}
    `;

    container.querySelector('#sidebarSyncBtn')?.addEventListener('click', () => {
      if (this.onSyncTrigger && !this.isSyncing) {
        this.onSyncTrigger();
      }
    });
  }

  renderStorageSection() {
    const container = document.querySelector('#sidebarStorageBlock');
    if (!container) return;

    const engine = this.getStorageEngine ? this.getStorageEngine() : 'IndexedDB';
    const isIndexedDb = engine === 'IndexedDB';

    container.innerHTML = `
      <div class="storage-badge-row" title="Active local client storage engine">
        <span class="storage-badge ${isIndexedDb ? 'storage-ok' : 'storage-warn'}">
          ${Icons.database} Engine: ${this._escape(engine)}
        </span>
      </div>
      ${!isIndexedDb ? `
        <div class="storage-warning-banner" role="alert" title="Data stored in fallback storage">
          ${Icons.alertCircle} <span>Notes may be lost on browser clear</span>
        </div>
      ` : ''}
      <div class="storage-actions-row">
        <button class="btn-storage-action" id="exportDataBtn" title="Export all notes, items and links as JSON">
          ${Icons.download} Export JSON
        </button>
        <button class="btn-storage-action" id="importDataBtn" title="Import notes, items and links from JSON file">
          ${Icons.upload} Import JSON
        </button>
        <input type="file" id="importJsonFileInput" accept=".json,application/json" style="display: none;" />
      </div>
    `;

    container.querySelector('#exportDataBtn')?.addEventListener('click', () => {
      if (this.onExportData) this.onExportData();
    });

    const fileInput = container.querySelector('#importJsonFileInput');
    container.querySelector('#importDataBtn')?.addEventListener('click', () => {
      fileInput?.click();
    });

    fileInput?.addEventListener('change', (e) => {
      const file = e.target.files && e.target.files[0];
      if (file && this.onImportData) {
        const reader = new FileReader();
        reader.onload = (evt) => {
          this.onImportData(evt.target.result);
        };
        reader.readAsText(file);
      }
      e.target.value = '';
    });
  }

  renderThemeButton() {
    const btn = document.querySelector('#themeToggleBtn');
    if (!btn) return;

    if (this.theme === 'dark') {
      btn.innerHTML = `${Icons.sun} Light Mode`;
      btn.title = 'Switch to Light Theme';
    } else {
      btn.innerHTML = `${Icons.moon} Dark Mode`;
      btn.title = 'Switch to Dark Theme';
    }

    btn.onclick = () => this.toggleTheme();
  }

  renderHeader(title = 'Today', subtitle = null) {
    const header = document.querySelector('header');
    if (!header) return;

    const sub = subtitle !== null ? subtitle : (title === 'Today' ? (typeof formatLongDate === 'function' ? formatLongDate(typeof getTodayDateStr === 'function' ? getTodayDateStr() : new Date().toISOString().slice(0, 10)) : '') : '');

    // Notice: Phase 2 rule 2 removes the #modeSelector pills (Work/Life/All) from the global header.
    // They are now housed inside Calendar views.
    header.innerHTML = `
      <h1 id="title">${title}</h1>
      <span class="sub" id="subtitle">${sub}</span>
      <div class="spacer"></div>

      <div class="header-search">
        ${Icons.search}
        <input type="search" id="quickSearch" placeholder="Search (/)" />
      </div>

      <button class="btn sm" id="todayNavBtn" style="font-family: var(--font-mono); font-size: 11.5px;">Today</button>
      <button class="btn sm pink" id="newMeetingBtn">${Icons.plus} New Meeting</button>
      <button class="btn sm" id="togglePanelBtn" title="${this.isPanelCollapsed ? 'Expand meeting panel' : 'Collapse meeting panel'}" style="display: inline-flex; align-items: center; gap: 5px;">
        ${this.isPanelCollapsed ? Icons.panelRightOpen : Icons.panelRightClose}
        <span class="btn-text">Panel</span>
      </button>
    `;

    const searchInput = header.querySelector('#quickSearch');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        if (this.onSearch) this.onSearch(e.target.value);
      });
      searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          searchInput.value = '';
          if (this.onSearch) this.onSearch('');
          searchInput.blur();
        }
      });
    }

    header.querySelector('#todayNavBtn')?.addEventListener('click', () => {
      if (this.onTodayClick) this.onTodayClick();
    });

    header.querySelector('#newMeetingBtn')?.addEventListener('click', () => {
      if (this.onNewMeeting) this.onNewMeeting();
    });

    header.querySelector('#togglePanelBtn')?.addEventListener('click', () => {
      if (this.onTogglePanel) this.onTogglePanel();
    });
  }

  updatePanelToggle(isCollapsed) {
    this.isPanelCollapsed = isCollapsed;
    const btn = document.querySelector('#togglePanelBtn');
    if (btn) {
      btn.title = isCollapsed ? 'Expand meeting panel' : 'Collapse meeting panel';
      btn.innerHTML = `${isCollapsed ? Icons.panelRightOpen : Icons.panelRightClose} <span class="btn-text">Panel</span>`;
      if (isCollapsed) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    }
  }

  updateActionsBadge(count) {
    const badge = document.querySelector('#navActions');
    if (badge) badge.textContent = count;
  }
}

MeetingHub.ShellUI = ShellUI;

/* === Module: ui/meeting_panel.js === */
/**
 * Meeting Drawer Component (Phase 4 Meeting Drawer)
 * 
 * Replaces the legacy 5-tab drawer with a unified, lane-driven Cockpit Drawer:
 * 1. Header: Breadcrumb (Mission › Workstream › Meeting, clickable), date/time, attendees, Google Doc link.
 * 2. Automatic Mode Selection (based on meeting state, not user tabs):
 *    - Prep Mode (upcoming): Workstream open points & actions, last 3 decisions, previous series meeting,
 *      prep checklist (3-4 dots, NO percentage), and "My agenda notes" scratchpad.
 *    - Capture Mode (past, no minutes): Drop/paste zone, Fetch Google Doc, Upload file, instant confirmation banner.
 *    - In Inbox Mode (past, waiting to fold): File name/size/timestamp, 6-line preview, "Fold now" (copies Antigravity prompt), "Replace minutes".
 *    - Folded Mode (past, in notes): Decisions, actions, open points citing this meeting from notes system of record.
 * 3. Related Section: Collapsible section at the bottom of EVERY mode (series lineage + connected meetings).
 * 
 * Design Rules:
 * - Strictly Lucide SVG stroke icons from ui/icons.js (Zero emojis).
 * - System of record is Markdown notes in Missions/ directory.
 * - Prep checklist is dots-only, strictly NO percentages.
 */




class MeetingPanelUI {
  constructor({ container, store, onOpenMeeting, onClose, onCollapse } = {}) {
    this.container = container;
    this.store = store;
    this.onOpenMeeting = onOpenMeeting;
    this.onClose = onClose;
    this.onCollapse = onCollapse;

    this.currentMeetingId = null;
    this.currentTab = 'prep'; // Kept for compatibility, modes are auto-selected
    this.isRelatedExpanded = false;
    this.isFetchingDoc = false;
    this.docFetchError = null;
    this.captureConfirmation = null; // Banner state after capture
    this.isReplaceMode = false;
    this.manualLinkSearchOpen = false;
  }

  setMeeting(meetingId, tab = null) {
    this.currentMeetingId = meetingId;
    this.captureConfirmation = null;
    this.isReplaceMode = false;
    this.docFetchError = null;
    if (tab) this.currentTab = tab;
    return this.render();
  }

  focusActionInput() {
    const input = this.container?.querySelector('#myAgendaNotes') || this.container?.querySelector('#captureNotesText');
    if (input) input.focus();
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

  _formatDate(dateStr) {
    if (!dateStr) return '';
    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
        return d.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
      }
    } catch (e) {}
    return dateStr;
  }

  _formatFileSize(bytes) {
    if (!bytes || isNaN(bytes)) return '0 B';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }

  _formatTimeAgo(isoStr) {
    if (!isoStr) return 'recently';
    try {
      const dt = new Date(isoStr);
      const now = new Date();
      const diffSec = Math.floor((now - dt) / 1000);
      if (diffSec < 60) return 'just now';
      if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
      if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
      return dt.toLocaleDateString();
    } catch (e) {
      return 'recently';
    }
  }

  /**
   * Matches meeting to a specific workstream within the mission.
   */
  _resolveWorkstream(meeting, summary) {
    const workstreams = summary?.workstreams || summary?.facilities || [];
    if (!workstreams || workstreams.length === 0) {
      return { id: 'general', name: 'General' };
    }

    const title = (meeting.title || '').toLowerCase();
    const tags = (meeting.tags || []).map(t => t.toLowerCase());

    for (const ws of workstreams) {
      const name = (ws.name || ws.id || '').toLowerCase();
      // Match keywords e.g. "Mariena", "Les Arbelles", "Glanum", "UC Wizard", "Datastore"
      const tokens = name.split(/[\s\-_(),]+/).filter(t => t.length > 2);
      for (const token of tokens) {
        if (title.includes(token) || tags.some(t => t.includes(token))) {
          return ws;
        }
      }
    }

    return workstreams[0] || { id: 'general', name: 'General' };
  }

  /**
   * Evaluates the automatic mode for the given meeting.
   * Returns: 'prep' | 'capture' | 'inbox' | 'folded'
   */
  _computeMeetingMode(meeting, inboxState, now = new Date()) {
    if (inboxState === 'folded') return 'folded';
    if (inboxState === 'pending') return 'inbox';

    // Neither folded nor in inbox: Check if upcoming (<= 48h or in future) vs past
    const todayStr = (typeof getTodayDateStr === 'function') ? getTodayDateStr(now) : now.toISOString().slice(0, 10);
    const nowTimeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const isUpcoming = (meeting.date > todayStr) || (meeting.date === todayStr && (meeting.start || '') >= nowTimeStr);
    return isUpcoming ? 'prep' : 'capture';
  }

  async render() {
    if (!this.container) return;

    if (!this.currentMeetingId) {
      this.container.innerHTML = `
        <div style="padding: 40px 24px; text-align: center; color: var(--muted-foreground);">
          <div style="margin-bottom: 12px; display: flex; justify-content: center; opacity: 0.5;">
            ${Icons.calendar}
          </div>
          <div style="font-weight: 500; font-size: 14px;">No meeting selected</div>
          <div style="font-size: 12px; margin-top: 4px;">Click any meeting card in the cockpit to inspect or capture</div>
        </div>
      `;
      return;
    }

    const meeting = this.store.getEvent(this.currentMeetingId);
    if (!meeting) {
      this.container.innerHTML = `
        <div style="padding: 24px; text-align: center;">
          <p class="sub">Meeting not found (ID: ${this._escape(this.currentMeetingId)})</p>
          <button class="btn sm" id="mhubDrawerCloseNotFound">Close</button>
        </div>
      `;
      this.container.querySelector('#mhubDrawerCloseNotFound')?.addEventListener('click', () => this.onClose && this.onClose());
      return;
    }

    const now = new Date();
    const meetingData = (await this.store.getMeetingData(meeting.id)) || {};
    const project = this.store.getProjectForMeeting(meeting);
    const missionId = project ? project.id : (typeof AppState !== 'undefined' && AppState.missionId ? AppState.missionId : 'ge-enterprise');
    const missionName = (typeof this.store.getProjectName === 'function' ? this.store.getProjectName(missionId) : missionId) || missionId;

    // Load mission summary & inbox status from system of record
    const summary = (await this.store.getMissionSummary(missionId)) || {};
    let inboxStatus = this.store.inboxStatusCache?.get(missionId);
    if (!inboxStatus) {
      try {
        inboxStatus = await this.store.getInboxStatus(missionId);
      } catch (e) {
        inboxStatus = { pendingCount: 0, files: [], foldedCount: 0, foldedFiles: [] };
      }
    }

    // Determine current inbox state
    const inboxState = this.store.meetingInboxState(meeting.id, inboxStatus, summary);
    let mode = this._computeMeetingMode(meeting, inboxState, now);
    if (this.isReplaceMode) {
      mode = 'capture';
    }

    // Find workstream context
    const workstream = this._resolveWorkstream(meeting, summary);
    const workstreamName = workstream?.name || 'General';

    // Find inbox file matching this meeting if in inbox
    const allInboxFiles = [...(inboxStatus.files || []), ...(inboxStatus.pending || [])];
    const meetingInboxFile = allInboxFiles.find(f => {
      if (typeof f === 'string') return f.includes(meeting.id);
      return f && ((f.eventId && f.eventId === meeting.id) || (f.filename && f.filename.includes(meeting.id)));
    }) || null;

    // Compute Cockpit Checklist for Prep mode (Dots only, strictly NO percentage)
    const checklistOptions = {
      seriesMeetings: this.store.getEventsForSeries ? this.store.getEventsForSeries(meeting.seriesId) : [],
      inboxStatus
    };
    const checklist = PrepScoreCalculator.computeCockpitChecklist(meeting, meetingData, checklistOptions);

    // Find previous meeting of same series
    let prevSeriesMeeting = null;
    let prevSeriesFolded = false;
    if (meeting.seriesId) {
      const seriesEvents = typeof this.store.getEventsForSeries === 'function' ? this.store.getEventsForSeries(meeting.seriesId) : [];
      const priorEvents = seriesEvents.filter(e => e.id !== meeting.id && (e.date < meeting.date || (e.date === meeting.date && e.start < meeting.start)));
      if (priorEvents.length > 0) {
        priorEvents.sort((a, b) => b.date.localeCompare(a.date) || b.start.localeCompare(a.start));
        prevSeriesMeeting = priorEvents[0];
        const prevInboxState = this.store.meetingInboxState(prevSeriesMeeting.id, inboxStatus, summary);
        prevSeriesFolded = (prevInboxState === 'folded');
      }
    }

    // Gather last 3 decisions for this mission / workstream
    const allDecisions = summary.decisions || summary.decisionRegister || [];
    const relevantDecisions = allDecisions
      .filter(d => !workstream.name || !d.workstream || d.workstream.toLowerCase() === workstreamName.toLowerCase() || d.workstream === 'General')
      .slice(0, 3);

    // Open points and actions for this workstream
    const wsOpenPoints = (summary.openPoints || []).filter(p => !p.workstream || p.workstream.toLowerCase() === workstreamName.toLowerCase() || p.workstream === 'General');
    const wsOpenActions = (summary.actions || summary.actionMatrix || []).filter(a => !a.done && (!a.workstream || a.workstream.toLowerCase() === workstreamName.toLowerCase() || a.workstream === 'General'));

    // Cited decisions and actions in system of record (for Folded mode)
    const citedDecisions = allDecisions.filter(d => d.meetingId === meeting.id || (d.source && String(d.source).includes(meeting.id)));
    const citedActions = (summary.actions || summary.actionMatrix || []).filter(a => a.source && String(a.source).includes(meeting.id));

    // Attendees list
    const attendeesList = meeting.attendees || [];
    const googleDocUrl = meeting.googleDocUrl || meetingData.googleDocUrl || this._extractGoogleDocUrl(meeting.description);

    this.container.innerHTML = `
      <div class="drawer-layout" style="display: flex; flex-direction: column; height: 100%; overflow: hidden; background: var(--card);">
        
        <!-- 1. Header: Breadcrumb (Mission > Workstream > Meeting) & Close -->
        <div class="drawer-header" style="padding: 14px 18px; border-bottom: 1px solid var(--border); display: flex; flex-direction: column; gap: 8px; background: var(--navy-2);">
          
          <div style="display: flex; justify-content: space-between; align-items: center; gap: 12px;">
            <!-- Clickable Breadcrumb -->
            <nav class="drawer-breadcrumb" style="display: flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 500; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
              <a href="#/p/${encodeURIComponent(missionId)}" class="breadcrumb-link" style="color: var(--pink-600); text-decoration: none; display: inline-flex; align-items: center; gap: 4px;">
                ${Icons.folder} ${this._escape(missionName)}
              </a>
              <span class="sub" style="opacity: 0.5;">${Icons.chevronRight}</span>
              <a href="#/p/${encodeURIComponent(missionId)}/workstreams" class="breadcrumb-link" style="color: var(--muted-foreground); text-decoration: none;">
                ${this._escape(workstreamName)}
              </a>
              <span class="sub" style="opacity: 0.5;">${Icons.chevronRight}</span>
              <span style="color: var(--foreground); font-weight: 600; overflow: hidden; text-overflow: ellipsis;">
                ${this._escape(meeting.title)}
              </span>
            </nav>

            <!-- Close Drawer Button -->
            <button id="drawerCloseBtn" class="btn sm" style="padding: 4px 8px; line-height: 1; border-radius: var(--r-sm);" title="Close drawer (returns to mission cockpit)" aria-label="Close drawer">
              ${Icons.x}
            </button>
          </div>

          <!-- Meeting Title & Mode Badge -->
          <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 12px;">
            <h2 style="font: 600 17px/1.3 var(--font-sans); margin: 0; color: var(--foreground);">
              ${this._escape(meeting.title)}
            </h2>
            
            <div style="flex-shrink: 0;">
              ${mode === 'prep' ? `
                <span class="badge ok" style="display: inline-flex; align-items: center; gap: 4px; font-weight: 600;">
                  ${Icons.sparkles} Prep Mode
                </span>
              ` : mode === 'inbox' ? `
                <span class="badge amber" style="display: inline-flex; align-items: center; gap: 4px; font-weight: 600;">
                  ${Icons.clock} In Inbox
                </span>
              ` : mode === 'folded' ? `
                <span class="badge ok" style="display: inline-flex; align-items: center; gap: 4px; font-weight: 600;">
                  ${Icons.check} Folded
                </span>
              ` : `
                <span class="badge sub" style="display: inline-flex; align-items: center; gap: 4px; font-weight: 600;">
                  ${Icons.upload} Capture Mode
                </span>
              `}
            </div>
          </div>

          <!-- Meta Row: Date, Time, Meet Link, Google Doc -->
          <div style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap; font-size: 12px; color: var(--muted-foreground);">
            <span style="display: inline-flex; align-items: center; gap: 4px;">
              ${Icons.calendar} ${this._formatDate(meeting.date)}
            </span>
            <span style="display: inline-flex; align-items: center; gap: 4px; font-family: var(--font-mono);">
              ${Icons.clock} ${this._escape(meeting.start)} - ${this._escape(meeting.end)}
            </span>
            ${meeting.videoUrl ? `
              <a href="${this._escape(meeting.videoUrl)}" target="_blank" rel="noopener" class="badge" style="display: inline-flex; align-items: center; gap: 4px; color: var(--pink-600); text-decoration: none;">
                ${Icons.video} Join Meet
              </a>
            ` : ''}
            ${googleDocUrl ? `
              <a href="${this._escape(googleDocUrl)}" target="_blank" rel="noopener" class="badge" style="display: inline-flex; align-items: center; gap: 4px; text-decoration: none;" title="Google Doc for this meeting">
                ${Icons.externalLink} Google Doc
              </a>
            ` : ''}
          </div>

          <!-- Attendees Bar -->
          ${attendeesList.length > 0 ? `
            <div style="display: flex; align-items: center; gap: 6px; flex-wrap: wrap; margin-top: 2px;">
              <span class="sub" style="font-size: 11px; display: inline-flex; align-items: center; gap: 3px;">
                ${Icons.users} Attendees:
              </span>
              ${attendeesList.slice(0, 6).map(a => `
                <span class="badge ${a.toLowerCase().includes('ayrton') ? 'ok' : 'sub'}" style="font-size: 11px; padding: 1px 6px;">
                  ${this._escape(a.split('@')[0])}
                </span>
              `).join('')}
              ${attendeesList.length > 6 ? `
                <span class="sub" style="font-size: 11px;">+${attendeesList.length - 6} more</span>
              ` : ''}
            </div>
          ` : ''}
        </div>

        <!-- Scrollable Body with Mode View -->
        <div class="drawer-body" style="flex: 1; overflow-y: auto; padding: 18px; display: flex; flex-direction: column; gap: 18px;">
          
          <!-- Confirmation Banner (if just saved) -->
          ${this.captureConfirmation ? `
            <div class="card" style="border-color: var(--ok); background: color-mix(in oklab, var(--ok) 10%, var(--card)); padding: 12px 14px;">
              <div style="display: flex; align-items: center; gap: 8px; font-weight: 600; color: var(--ok); font-size: 13px;">
                ${Icons.check} Minutes captured successfully
              </div>
              <div class="sub" style="font-size: 12px; margin-top: 4px;">
                ${this._escape(this.captureConfirmation)}
              </div>
            </div>
          ` : ''}

          <!-- MODE 1: PREP (Upcoming) -->
          ${mode === 'prep' ? this._renderPrepMode({ meeting, meetingData, checklist, prevSeriesMeeting, prevSeriesFolded, relevantDecisions, wsOpenPoints, wsOpenActions, workstreamName, missionName, missionId }) : ''}

          <!-- MODE 2: CAPTURE (Past, no minutes) -->
          ${mode === 'capture' ? this._renderCaptureMode({ meeting, meetingData, googleDocUrl, missionName, isReplace: this.isReplaceMode }) : ''}

          <!-- MODE 3: IN INBOX (Minutes waiting to fold) -->
          ${mode === 'inbox' ? this._renderInboxMode({ meeting, meetingInboxFile, missionName }) : ''}

          <!-- MODE 4: FOLDED (Past, in notes) -->
          ${mode === 'folded' ? this._renderFoldedMode({ meeting, citedDecisions, citedActions, workstreamName, missionName, summary, missionId }) : ''}

          <!-- 3. Related Meetings & Lineage Section (Collapsible in EVERY mode) -->
          ${this._renderRelatedSection(meeting)}
        </div>

      </div>
    `;

    this._bindEvents(meeting, mode, missionId, missionName, googleDocUrl);
  }

  /* -------------------------------------------------------------------------- */
  /*  MODE 1: PREP RENDERER                                                     */
  /* -------------------------------------------------------------------------- */
  _renderPrepMode({ meeting, meetingData, checklist, prevSeriesMeeting, prevSeriesFolded, relevantDecisions, wsOpenPoints, wsOpenActions, workstreamName, missionName, missionId }) {
    const agendaText = meetingData.agenda || '';
    const dots = checklist.dots || [];

    return `
      <!-- Prep Checklist (DOTS ONLY, STRICTLY NO PERCENTAGE) -->
      <div class="card" style="padding: 14px; background: var(--navy-2); border: 1px solid var(--border);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
          <div style="font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: var(--muted-foreground);">
            Prep Checklist
          </div>
          <div style="display: flex; align-items: center; gap: 6px;">
            ${dots.map(d => `
              <span class="prep-dot ${d.ok ? 'done' : ''}" style="width: 8px; height: 8px; border-radius: 50%; background: ${d.ok ? 'var(--ok)' : 'var(--border)'}; display: inline-block;" title="${this._escape(d.label)}: ${this._escape(d.detail)}"></span>
            `).join('')}
          </div>
        </div>

        <div style="display: flex; flex-direction: column; gap: 8px; font-size: 12.5px;">
          ${dots.map((d, idx) => `
            <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px;">
              <span style="display: inline-flex; align-items: center; gap: 6px; color: ${d.ok ? 'var(--foreground)' : 'var(--muted-foreground)'};">
                <span style="color: ${d.ok ? 'var(--ok)' : 'var(--border)'};">${d.ok ? Icons.check : Icons.alertCircle}</span>
                ${this._escape(d.label)} ${d.optional ? '<span class="sub" style="font-size: 11px;">(optional)</span>' : ''}
              </span>
              ${d.key === 'actionsReviewed' ? `
                <label style="display: inline-flex; align-items: center; gap: 4px; font-size: 11.5px; cursor: pointer;">
                  <input type="checkbox" id="chkActionsReviewed" ${meetingData.actionsReviewed ? 'checked' : ''} style="cursor: pointer;">
                  <span class="sub">${meetingData.actionsReviewed ? 'Reviewed' : 'Mark reviewed'}</span>
                </label>
              ` : `
                <span class="sub" style="font-family: var(--font-mono); font-size: 11px;">${this._escape(d.detail)}</span>
              `}
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Previous Meeting in Series (with Folded Badge) -->
      ${prevSeriesMeeting ? `
        <div class="card" style="padding: 12px 14px; border: 1px solid var(--border);">
          <div style="font-size: 11.5px; font-weight: 600; text-transform: uppercase; color: var(--muted-foreground); margin-bottom: 6px;">
            Previous in Series
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center; gap: 8px;">
            <div>
              <div style="font-weight: 600; font-size: 13px;">${this._escape(prevSeriesMeeting.title)}</div>
              <div class="sub" style="font-size: 11.5px;">${this._formatDate(prevSeriesMeeting.date)} · ${this._escape(prevSeriesMeeting.start)}</div>
            </div>
            <div>
              ${prevSeriesFolded ? `
                <span class="badge ok" style="font-size: 11px; display: inline-flex; align-items: center; gap: 3px;">
                  ${Icons.check} Folded
                </span>
              ` : `
                <span class="badge amber" style="font-size: 11px; display: inline-flex; align-items: center; gap: 3px;">
                  ${Icons.clock} To fold
                </span>
              `}
            </div>
          </div>
        </div>
      ` : ''}

      <!-- Workstream Open Points & Actions from Notes -->
      <div class="card" style="padding: 14px; border: 1px solid var(--border);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
          <div style="font-size: 12px; font-weight: 600; text-transform: uppercase; color: var(--muted-foreground);">
            ${this._escape(workstreamName)} · Open Context
          </div>
          <span class="sub" style="font-size: 11.5px;">from note system of record</span>
        </div>

        <div style="display: flex; flex-direction: column; gap: 10px;">
          <!-- Open points -->
          <div>
            <div style="font-size: 12px; font-weight: 600; margin-bottom: 4px; color: var(--foreground);">
              Open Points (${wsOpenPoints.length})
            </div>
            ${wsOpenPoints.length === 0 ? `
              <div class="sub" style="font-size: 12px;">No open points currently recorded.</div>
            ` : `
              <ul style="margin: 0; padding-left: 18px; font-size: 12.5px; color: var(--foreground); display: flex; flex-direction: column; gap: 4px;">
                ${wsOpenPoints.slice(0, 4).map(p => `
                  <li>${this._escape(p.text || p.title || p.statement)}</li>
                `).join('')}
              </ul>
            `}
          </div>

          <!-- Open actions -->
          <div style="border-top: 1px solid var(--border); padding-top: 8px;">
            <div style="font-size: 12px; font-weight: 600; margin-bottom: 4px; color: var(--foreground);">
              Open Actions (${wsOpenActions.length})
            </div>
            ${wsOpenActions.length === 0 ? `
              <div class="sub" style="font-size: 12px;">No pending actions for this workstream.</div>
            ` : `
              <div style="display: flex; flex-direction: column; gap: 6px;">
                ${wsOpenActions.slice(0, 5).map(a => `
                  <div style="display: flex; justify-content: space-between; align-items: center; gap: 8px; font-size: 12px; background: var(--navy-1); padding: 5px 8px; border-radius: var(--r-sm);">
                    <div style="display: flex; align-items: center; gap: 8px; overflow: hidden; flex: 1;">
                      <button class="item-check-btn action-toggle-btn ${a.done ? 'checked' : ''}" data-action-id="${this._escape(a.id)}" data-mission-id="${this._escape(missionId)}" title="${a.done ? 'Mark open' : 'Mark done'}" style="flex-shrink: 0; width: 18px; height: 18px; border-radius: 4px; border: 1px solid var(--border); background: var(--card); display: inline-flex; align-items: center; justify-content: center; cursor: pointer; padding: 0;">
                        ${a.done ? Icons.check : ''}
                      </button>
                      <div style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                        <span class="badge" style="font-size: 10px; font-family: var(--font-mono); margin-right: 4px;">${this._escape(a.id)}</span>
                        <span style="font-weight: 500;">${this._escape(a.text || a.description || a.title || a.id)}</span>
                      </div>
                    </div>
                    <div style="display: flex; align-items: center; gap: 6px; flex-shrink: 0;">
                      <span class="badge sub" style="font-size: 10.5px;">${this._escape(a.owner || 'Ayrton')}</span>
                      <button class="btn sm action-edit-btn" data-action-id="${this._escape(a.id)}" data-mission-id="${this._escape(missionId)}" title="Edit action: name, sub-stream, owner, due date" style="font-size: 10px; padding: 2px 5px; display: inline-flex; align-items: center; gap: 3px;">
                        ${Icons.edit}
                      </button>
                    </div>
                  </div>
                `).join('')}
              </div>
            `}
          </div>
        </div>
      </div>

      <!-- Last 3 Decisions from Notes -->
      <div class="card" style="padding: 14px; border: 1px solid var(--border);">
        <div style="font-size: 12px; font-weight: 600; text-transform: uppercase; color: var(--muted-foreground); margin-bottom: 8px;">
          Last 3 Decisions
        </div>
        ${relevantDecisions.length === 0 ? `
          <div class="sub" style="font-size: 12px;">No logged decisions found for this stream yet.</div>
        ` : `
          <div style="display: flex; flex-direction: column; gap: 8px;">
            ${relevantDecisions.map(d => `
              <div style="font-size: 12.5px; background: var(--navy-1); padding: 8px 10px; border-radius: var(--r-sm); border-left: 3px solid var(--ok);">
                <div style="font-weight: 500;">${this._escape(d.statement || d.title)}</div>
                <div class="sub" style="font-size: 11px; margin-top: 3px; display: flex; justify-content: space-between;">
                  <span>${this._escape(d.date || '')} · ${this._escape(d.workstream || workstreamName)}</span>
                  ${d.note ? `<span style="font-family: var(--font-mono);">${this._escape(d.note.split('/').pop())}</span>` : ''}
                </div>
              </div>
            `).join('')}
          </div>
        `}
      </div>

      <!-- "My Agenda Notes" Scratchpad (UI state only, prepended on capture) -->
      <div class="card" style="padding: 14px; border: 1px solid var(--border); display: flex; flex-direction: column; gap: 8px;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <label for="myAgendaNotes" style="font-size: 12px; font-weight: 600; text-transform: uppercase; color: var(--muted-foreground);">
            My Agenda Notes
          </label>
          <span class="sub" style="font-size: 11px;" id="agendaAutoSaveStatus">Auto-saved</span>
        </div>
        <p class="sub" style="font-size: 11.5px; margin: 0;">
          UI state only. Pre-meeting notes will automatically be prepended to minutes when capturing.
        </p>
        <textarea id="myAgendaNotes" class="input" style="min-height: 90px; width: 100%; font-family: var(--font-sans); font-size: 13px; line-height: 1.4; resize: vertical; padding: 8px;" placeholder="Points to raise, questions, quick reminders...">${this._escape(agendaText)}</textarea>
      </div>
    `;
  }

  /* -------------------------------------------------------------------------- */
  /*  MODE 2: CAPTURE RENDERER                                                  */
  /* -------------------------------------------------------------------------- */
  _renderCaptureMode({ meeting, meetingData, googleDocUrl, missionName, isReplace }) {
    const prefillAgenda = meetingData.agenda ? `## Agenda Notes\n${meetingData.agenda}\n\n## Minutes\n` : '';

    return `
      <div class="card" style="padding: 16px; border: 1px solid var(--border); display: flex; flex-direction: column; gap: 14px;">
        <div>
          <h3 style="font: 600 15px/1.3 var(--font-sans); margin: 0 0 4px 0;">
            ${isReplace ? 'Replace Meeting Minutes' : 'Capture Meeting Minutes'}
          </h3>
          <p class="sub" style="font-size: 12px; margin: 0;">
            Drop a markdown/text file, paste notes, or fetch directly from Google Docs to write into <code style="font-family: var(--font-mono);">${this._escape(missionName)}/_inbox/</code>.
          </p>
        </div>

        <!-- Large Drop / Paste Zone -->
        <div id="captureDropZone" style="border: 2px dashed var(--border); border-radius: var(--r-md); padding: 24px; text-align: center; background: var(--navy-1); transition: all 0.15s ease; cursor: pointer;">
          <div style="color: var(--muted-foreground); margin-bottom: 8px;">
            ${Icons.upload}
          </div>
          <div style="font-weight: 600; font-size: 13px; margin-bottom: 4px;">
            Drag & drop raw minutes file here, or click to upload
          </div>
          <div class="sub" style="font-size: 11.5px;">
            Supports .md, .txt, .doc, or paste plain text into the box below
          </div>
          <input type="file" id="captureFileInput" style="display: none;" accept=".md,.txt,.doc,.docx">
        </div>

        <!-- Google Doc Fetch Action if URL is present -->
        ${googleDocUrl ? `
          <div style="display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 10px 12px; background: var(--navy-2); border-radius: var(--r-sm); border: 1px solid var(--border);">
            <div style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 12.5px;">
              <span class="sub" style="margin-right: 6px;">${Icons.fileText}</span>
              <b>Google Doc detected</b>
            </div>
            <button id="btnFetchGoogleDoc" class="btn sm primary" style="flex-shrink: 0;" ${this.isFetchingDoc ? 'disabled' : ''}>
              ${this.isFetchingDoc ? 'Fetching...' : `${Icons.download} Fetch Doc Content`}
            </button>
          </div>
          ${this.docFetchError ? `
            <div class="sub" style="color: var(--destructive); font-size: 12px;">${this._escape(this.docFetchError)}</div>
          ` : ''}
        ` : ''}

        <!-- Paste / Direct Edit Zone -->
        <div style="display: flex; flex-direction: column; gap: 6px;">
          <label for="captureNotesText" class="sub" style="font-size: 12px; font-weight: 600;">
            Minutes Content (Markdown)
          </label>
          <textarea id="captureNotesText" class="input" style="min-height: 180px; width: 100%; font-family: var(--font-mono); font-size: 12.5px; line-height: 1.45; resize: vertical; padding: 10px;" placeholder="Paste meeting notes, takeaways, actions, decisions...">${this._escape(prefillAgenda)}</textarea>
        </div>

        <!-- Actions -->
        <div style="display: flex; justify-content: space-between; align-items: center; gap: 12px;">
          ${isReplace ? `
            <button id="btnCancelReplace" class="btn sm">Cancel</button>
          ` : `<span></span>`}
          <button id="btnSaveToInbox" class="btn primary" style="display: inline-flex; align-items: center; gap: 6px; font-weight: 600;">
            ${Icons.upload} Save to Mission Inbox
          </button>
        </div>
      </div>
    `;
  }

  /* -------------------------------------------------------------------------- */
  /*  MODE 3: IN INBOX RENDERER                                                 */
  /* -------------------------------------------------------------------------- */
  _renderInboxMode({ meeting, meetingInboxFile, missionName }) {
    const filename = meetingInboxFile?.filename || `${meeting.date}_${meeting.id}.md`;
    const size = meetingInboxFile?.size ? this._formatFileSize(meetingInboxFile.size) : 'Cached in _inbox';
    const capturedAt = meetingInboxFile?.captured_at ? this._formatTimeAgo(meetingInboxFile.captured_at) : 'recently';
    
    // Preview lines: take first 6 non-empty lines from server preview (string or array) or fallback
    let previewLines = [];
    if (meetingInboxFile && meetingInboxFile.preview) {
      if (Array.isArray(meetingInboxFile.preview)) {
        previewLines = meetingInboxFile.preview.slice(0, 6);
      } else if (typeof meetingInboxFile.preview === 'string') {
        previewLines = meetingInboxFile.preview.split(/\r?\n/).slice(0, 6);
      }
    }
    if (previewLines.length === 0) {
      previewLines = [
        `# ${meeting.title}`,
        `Date: ${meeting.date} · Attendees: ${(meeting.attendees || []).join(', ')}`,
        '',
        'Raw minutes waiting in inbox to be folded into authoritative notes.',
        'Click "Fold now" below to copy the folding prompt to your clipboard.'
      ];
    }

    const foldPrompt = `Fold the inbox for ${missionName} following Missions/_fold.md, then show me the change summary.`;

    return `
      <div class="card" style="padding: 16px; border: 1px solid var(--border); display: flex; flex-direction: column; gap: 14px;">
        
        <!-- Header Info -->
        <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 10px;">
          <div>
            <div style="font-size: 11.5px; font-weight: 600; text-transform: uppercase; color: var(--amber); letter-spacing: 0.05em; display: inline-flex; align-items: center; gap: 4px;">
              ${Icons.clock} In Inbox · Waiting to fold
            </div>
            <div style="font-family: var(--font-mono); font-size: 13px; font-weight: 600; color: var(--foreground); margin-top: 4px; word-break: break-all;">
              ${this._escape(filename)}
            </div>
            <div class="sub" style="font-size: 11.5px; margin-top: 2px;">
              Size: ${this._escape(size)} · Captured: ${this._escape(capturedAt)}
            </div>
          </div>
        </div>

        <!-- Preview Box (First 6 lines) -->
        <div style="background: var(--navy-1); border: 1px solid var(--border); border-radius: var(--r-sm); padding: 10px 12px; font-family: var(--font-mono); font-size: 11.5px; line-height: 1.45; color: var(--foreground); overflow-x: auto; max-height: 140px;">
          ${previewLines.map(line => `<div>${this._escape(line) || '&nbsp;'}</div>`).join('')}
        </div>

        <!-- Fold Now Antigravity Prompt Button -->
        <div style="display: flex; flex-direction: column; gap: 8px; background: color-mix(in oklab, var(--amber) 10%, var(--navy-2)); border: 1px solid color-mix(in oklab, var(--amber) 30%, transparent); border-radius: var(--r-md); padding: 12px 14px;">
          <div style="display: flex; justify-content: space-between; align-items: center; gap: 8px;">
            <div style="font-weight: 600; font-size: 13px; color: var(--foreground);">
              Ready to reconcile into notes?
            </div>
            <div style="display: inline-flex; gap: 8px;">
              <button id="btnFoldNow" class="btn primary" style="background: var(--amber); color: #000; font-weight: 600; border: none; display: inline-flex; align-items: center; gap: 6px;">
                ${Icons.sparkles} Fold now
              </button>
              <button id="btnCopyFoldPrompt" class="btn sm" style="display: inline-flex; align-items: center; gap: 4px;" title="Copy Antigravity fold prompt to clipboard">
                ${Icons.copy} Copy prompt
              </button>
            </div>
          </div>
          <p class="sub" style="font-size: 11.5px; margin: 0;">
            Reconciles raw minutes directly into notes, or copies agent prompt: <code style="font-family: var(--font-mono); font-size: 10.5px;">${this._escape(foldPrompt)}</code>
          </p>
          <div id="foldNowToast" style="display: none; font-size: 11.5px; color: var(--ok); font-weight: 600;">
            ${Icons.check} Copied Antigravity fold prompt to clipboard! Paste into your agent.
          </div>
        </div>

        <!-- Replace Minutes Button -->
        <div style="display: flex; justify-content: flex-end; pt: 4px;">
          <button id="btnTriggerReplaceMinutes" class="btn sm" style="display: inline-flex; align-items: center; gap: 4px;">
            ${Icons.edit} Replace minutes
          </button>
        </div>

      </div>
    `;
  }

  /* -------------------------------------------------------------------------- */
  /*  MODE 4: FOLDED RENDERER                                                   */
  /* -------------------------------------------------------------------------- */
  _renderFoldedMode({ meeting, citedDecisions, citedActions, workstreamName, missionName, summary, missionId }) {
    const overviewFile = summary?.overview || `${missionName}/Mission Overview.md`;

    return `
      <div class="card" style="padding: 16px; border: 1px solid var(--border); display: flex; flex-direction: column; gap: 14px;">
        
        <div>
          <div style="font-size: 11.5px; font-weight: 600; text-transform: uppercase; color: var(--ok); letter-spacing: 0.05em; display: inline-flex; align-items: center; gap: 4px;">
            ${Icons.check} Folded into System of Record
          </div>
          <h3 style="font: 600 15px/1.3 var(--font-sans); margin: 4px 0 2px 0;">
            Authoritative Notes Cite This Meeting
          </h3>
          <p class="sub" style="font-size: 12px; margin: 0;">
            Meeting notes have been reconciled into authoritative Markdown files in <code style="font-family: var(--font-mono);">${this._escape(missionName)}/</code>.
          </p>
        </div>

        <!-- Cited Decisions -->
        <div>
          <div style="font-size: 12px; font-weight: 600; margin-bottom: 6px; display: flex; justify-content: space-between; align-items: center;">
            <span>Cited Decisions (${citedDecisions.length})</span>
            <span class="sub" style="font-size: 11px;">System of Record</span>
          </div>
          ${citedDecisions.length === 0 ? `
            <div class="sub" style="font-size: 12px; background: var(--navy-1); padding: 8px 10px; border-radius: var(--r-sm);">
              Decisions folded in workstream note: <code style="font-family: var(--font-mono); font-size: 11px;">${this._escape(workstreamName)}.md</code>
            </div>
          ` : `
            <div style="display: flex; flex-direction: column; gap: 8px;">
              ${citedDecisions.map(d => `
                <div style="background: var(--navy-1); border-left: 3px solid var(--ok); padding: 8px 10px; border-radius: var(--r-sm); font-size: 12.5px;">
                  <div style="font-weight: 500;">${this._escape(d.statement || d.title)}</div>
                  <div class="sub" style="font-size: 11px; margin-top: 3px; display: flex; justify-content: space-between; align-items: center;">
                    <span>${this._escape(d.date || meeting.date)} · ${this._escape(d.workstream || workstreamName)}</span>
                    ${d.note ? `<span style="font-family: var(--font-mono); font-size: 10.5px;">${this._escape(d.note.split('/').pop())}</span>` : ''}
                  </div>
                </div>
              `).join('')}
            </div>
          `}
        </div>

        <!-- Cited Actions -->
        <div>
          <div style="font-size: 12px; font-weight: 600; margin-bottom: 6px; display: flex; justify-content: space-between; align-items: center;">
            <span>Cited Actions (${citedActions.length})</span>
            <span class="sub" style="font-size: 11px;">Actions.md</span>
          </div>
          ${citedActions.length === 0 ? `
            <div class="sub" style="font-size: 12px; background: var(--navy-1); padding: 8px 10px; border-radius: var(--r-sm);">
              Actions registered in <code style="font-family: var(--font-mono); font-size: 11px;">Actions.md</code>
            </div>
          ` : `
            <div style="display: flex; flex-direction: column; gap: 6px;">
              ${citedActions.map(a => `
                <div style="background: var(--navy-1); padding: 6px 10px; border-radius: var(--r-sm); font-size: 12px; display: flex; justify-content: space-between; align-items: center; gap: 8px;">
                  <div style="display: flex; align-items: center; gap: 8px; overflow: hidden; flex: 1;">
                    <button class="item-check-btn action-toggle-btn ${a.done ? 'checked' : ''}" data-action-id="${this._escape(a.id)}" data-mission-id="${this._escape(missionId)}" title="${a.done ? 'Mark open' : 'Mark done'}" style="flex-shrink: 0; width: 18px; height: 18px; border-radius: 4px; border: 1px solid var(--border); background: var(--card); display: inline-flex; align-items: center; justify-content: center; cursor: pointer; padding: 0;">
                      ${a.done ? Icons.check : ''}
                    </button>
                    <div style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                      <span class="badge" style="font-size: 10px; font-family: var(--font-mono); margin-right: 4px;">${this._escape(a.id)}</span>
                      <span style="font-weight: 500; ${a.done ? 'text-decoration: line-through; opacity: 0.7;' : ''}">${this._escape(a.text || a.description || a.title || a.id)}</span>
                      <span class="sub" style="margin-left: 6px;">(${this._escape(a.owner || 'Ayrton')})</span>
                    </div>
                  </div>
                  <div style="display: flex; align-items: center; gap: 4px; flex-shrink: 0;">
                    <button class="btn sm action-edit-btn" data-action-id="${this._escape(a.id || a.title)}" data-mission-id="${this._escape(missionId)}" title="Edit action: name, sub-stream, owner, due date" style="font-size: 10px; padding: 2px 5px; display: inline-flex; align-items: center; gap: 3px;">
                      ${Icons.edit} Edit
                    </button>
                    <button class="btn sm" data-copy-action-id="${this._escape(a.id || a.title)}" style="font-size: 10.5px; padding: 2px 6px; flex-shrink: 0;" title="Copy action ID">
                      Copy ID
                    </button>
                  </div>
                </div>
              `).join('')}
            </div>
          `}
        </div>

        <!-- Open Note Link Info -->
        <div style="border-top: 1px solid var(--border); padding-top: 10px; display: flex; justify-content: space-between; align-items: center;">
          <span class="sub" style="font-size: 11.5px;">Note location: <code style="font-family: var(--font-mono);">${this._escape(overviewFile)}</code></span>
          <button id="btnCopyNotePath" class="btn sm" data-note-path="${this._escape(overviewFile)}" style="font-size: 11px;">
            Copy Note Path
          </button>
        </div>

      </div>
    `;
  }

  /* -------------------------------------------------------------------------- */
  /*  COLLAPSIBLE RELATED SECTION (In EVERY Mode)                              */
  /* -------------------------------------------------------------------------- */
  _renderRelatedSection(meeting) {
    const isExpanded = this.isRelatedExpanded;
    const seriesEvents = (meeting.seriesId && typeof this.store.getEventsForSeries === 'function')
      ? this.store.getEventsForSeries(meeting.seriesId)
      : [];
    const priorOccurrences = seriesEvents.filter(e => e.id !== meeting.id);

    return `
      <div class="card" style="border: 1px solid var(--border); overflow: hidden; padding: 0;">
        
        <!-- Toggle Header -->
        <button id="btnToggleRelated" style="width: 100%; display: flex; justify-content: space-between; align-items: center; padding: 12px 14px; background: var(--navy-2); border: none; cursor: pointer; text-align: left; color: var(--foreground); font-size: 13px; font-weight: 600;">
          <span style="display: inline-flex; align-items: center; gap: 6px;">
            ${Icons.link} Related Meetings & Lineage (${priorOccurrences.length})
          </span>
          <span style="color: var(--muted-foreground);">
            ${isExpanded ? Icons.chevronUp : Icons.chevronDown}
          </span>
        </button>

        ${isExpanded ? `
          <div style="padding: 14px; display: flex; flex-direction: column; gap: 12px; border-top: 1px solid var(--border);">
            
            <!-- Recurring Series Lineage -->
            <div>
              <div style="font-size: 11.5px; font-weight: 600; text-transform: uppercase; color: var(--muted-foreground); margin-bottom: 6px;">
                Series Lineage (${meeting.series || 'Recurring'})
              </div>
              ${priorOccurrences.length === 0 ? `
                <div class="sub" style="font-size: 12px;">No other occurrences found in calendar.</div>
              ` : `
                <div style="display: flex; flex-direction: column; gap: 6px;">
                  ${priorOccurrences.slice(0, 5).map(occ => `
                    <div style="display: flex; justify-content: space-between; align-items: center; gap: 8px; font-size: 12px; background: var(--navy-1); padding: 6px 8px; border-radius: var(--r-sm); cursor: pointer;" data-open-related="${this._escape(occ.id)}">
                      <span>${this._formatDate(occ.date)} · ${this._escape(occ.start)}</span>
                      <span class="sub" style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 180px;">${this._escape(occ.title)}</span>
                    </div>
                  `).join('')}
                </div>
              `}
            </div>

            <!-- Manual link meeting -->
            <div style="border-top: 1px solid var(--border); padding-top: 10px;">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span class="sub" style="font-size: 11.5px;">Connected meetings</span>
                <button id="btnSearchLinkMeeting" class="btn sm" style="font-size: 11px;">
                  ${Icons.plus} Link meeting
                </button>
              </div>
            </div>

          </div>
        ` : ''}

      </div>
    `;
  }

  /* -------------------------------------------------------------------------- */
  /*  EVENT BINDINGS                                                            */
  /* -------------------------------------------------------------------------- */
  _bindEvents(meeting, mode, missionId, missionName, googleDocUrl) {
    // 1. Close button -> calls onClose (returns to #/p/<missionId>)
    this.container.querySelector('#drawerCloseBtn')?.addEventListener('click', () => {
      if (this.onClose) this.onClose();
    });

    // 2. Prep mode: Actions reviewed checkbox
    this.container.querySelector('#chkActionsReviewed')?.addEventListener('change', async (e) => {
      const isChecked = e.target.checked;
      await this.store.saveMeetingData(meeting.id, { actionsReviewed: isChecked });
      await this.render();
    });

    // 3. Prep mode: Agenda scratchpad auto-save (UI state)
    const agendaInput = this.container.querySelector('#myAgendaNotes');
    if (agendaInput) {
      let timer = null;
      agendaInput.addEventListener('input', () => {
        const val = agendaInput.value;
        const statusEl = this.container.querySelector('#agendaAutoSaveStatus');
        if (statusEl) statusEl.textContent = 'Saving...';
        clearTimeout(timer);
        timer = setTimeout(async () => {
          await this.store.saveMeetingData(meeting.id, { agenda: val });
          if (statusEl) statusEl.textContent = 'Saved';
        }, 400);
      });
    }

    // 4. Capture mode: File Drop and Upload
    const dropZone = this.container.querySelector('#captureDropZone');
    const fileInput = this.container.querySelector('#captureFileInput');
    if (dropZone && fileInput) {
      dropZone.addEventListener('click', () => fileInput.click());
      
      dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.style.borderColor = 'var(--pink-600)';
        dropZone.style.background = 'var(--navy-2)';
      });

      dropZone.addEventListener('dragleave', () => {
        dropZone.style.borderColor = 'var(--border)';
        dropZone.style.background = 'var(--navy-1)';
      });

      dropZone.addEventListener('drop', async (e) => {
        e.preventDefault();
        dropZone.style.borderColor = 'var(--border)';
        dropZone.style.background = 'var(--navy-1)';
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
          const file = e.dataTransfer.files[0];
          const text = await file.text();
          const textarea = this.container.querySelector('#captureNotesText');
          if (textarea) textarea.value = text;
        }
      });

      fileInput.addEventListener('change', async () => {
        if (fileInput.files && fileInput.files.length > 0) {
          const file = fileInput.files[0];
          const text = await file.text();
          const textarea = this.container.querySelector('#captureNotesText');
          if (textarea) textarea.value = text;
        }
      });
    }

    // 5. Capture mode: Fetch Google Doc button
    this.container.querySelector('#btnFetchGoogleDoc')?.addEventListener('click', async () => {
      if (!googleDocUrl) return;
      this.isFetchingDoc = true;
      this.docFetchError = null;
      await this.render();

      try {
        const resp = await fetch(`/api/docs/fetch?url=${encodeURIComponent(googleDocUrl)}`);
        if (resp.ok) {
          const data = await resp.json();
          if (data && data.text) {
            const textarea = this.container.querySelector('#captureNotesText');
            if (textarea) {
              const current = textarea.value.trim();
              textarea.value = current ? `${current}\n\n## Fetched from Google Doc\n${data.text}` : data.text;
            }
          } else {
            this.docFetchError = 'Could not extract text from Google Doc';
          }
        } else {
          this.docFetchError = `Server returned ${resp.status} when fetching Google Doc`;
        }
      } catch (err) {
        this.docFetchError = `Network error fetching doc: ${err.message}`;
      } finally {
        this.isFetchingDoc = false;
        await this.render();
      }
    });

    // 6. Capture mode: Save to Mission Inbox button
    this.container.querySelector('#btnSaveToInbox')?.addEventListener('click', async () => {
      const textarea = this.container.querySelector('#captureNotesText');
      const content = textarea ? textarea.value.trim() : '';
      if (!content) {
        alert('Please paste or type minutes content before saving.');
        return;
      }

      const saveBtn = this.container.querySelector('#btnSaveToInbox');
      if (saveBtn) {
        saveBtn.disabled = true;
        saveBtn.textContent = 'Saving to inbox...';
      }

      try {
        const result = await this.store.sendMinutesToInbox(meeting.id, missionId, {
          title: meeting.title,
          date: meeting.date,
          content,
          text: content,
          attendees: meeting.attendees || [],
          googleDocUrl
        });

        const savedFilename = result?.filename || result?.file || `${meeting.date}_${meeting.id}.md`;
        this.captureConfirmation = `Saved to ${missionName} inbox as ${savedFilename}`;
        this.isReplaceMode = false;
        
        // Refresh store caches and re-render
        if (this.store.inboxStatusCache) {
          this.store.inboxStatusCache.delete(missionId);
        }
        await this.render();
      } catch (err) {
        alert(`Failed to save minutes to inbox: ${err.message}`);
        if (saveBtn) {
          saveBtn.disabled = false;
          saveBtn.textContent = 'Save to Mission Inbox';
        }
      }
    });

    // 7. Cancel replace mode
    this.container.querySelector('#btnCancelReplace')?.addEventListener('click', async () => {
      this.isReplaceMode = false;
      await this.render();
    });

    // 8. In Inbox Mode: "Fold now" button -> executes fold via backend API, falls back to clipboard
    this.container.querySelector('#btnFoldNow')?.addEventListener('click', async () => {
      const foldBtn = this.container.querySelector('#btnFoldNow');
      const toast = this.container.querySelector('#foldNowToast');
      const foldPrompt = `Fold the inbox for ${missionName} following Missions/_fold.md, then show me the change summary.`;

      if (foldBtn) {
        foldBtn.disabled = true;
        foldBtn.textContent = 'Folding...';
      }

      if (missionId) {
        try {
          const resp = await fetch(`/api/missions/${encodeURIComponent(missionId)}/fold`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ apply: true })
          });
          if (resp.ok) {
            const data = await resp.json();
            if (data.status === 'success') {
              if (this.store && this.store.inboxStatusCache) {
                this.store.inboxStatusCache.clear();
                this.store.missionSummariesCache.clear();
              }
              if (toast) {
                toast.innerHTML = `${Icons.check} Successfully folded minutes into mission notes!`;
                toast.style.display = 'block';
              }
              setTimeout(async () => {
                await this.render();
              }, 1200);
              return;
            }
          }
        } catch (e) {
          // Backend offline or error -> fallback to copying prompt
        }
      }

      // Fallback: copy prompt to clipboard
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(foldPrompt);
      }
      if (toast) {
        toast.innerHTML = `${Icons.check} Copied Antigravity fold prompt to clipboard! Paste into your agent.`;
        toast.style.display = 'block';
        setTimeout(() => { if (toast) toast.style.display = 'none'; }, 4000);
      }
      if (foldBtn) {
        foldBtn.disabled = false;
        foldBtn.innerHTML = `${Icons.sparkles} Fold now`;
      }
    });

    // 8b. Copy fold prompt button
    this.container.querySelector('#btnCopyFoldPrompt')?.addEventListener('click', async () => {
      const foldPrompt = `Fold the inbox for ${missionName} following Missions/_fold.md, then show me the change summary.`;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(foldPrompt);
      }
      const toast = this.container.querySelector('#foldNowToast');
      if (toast) {
        toast.innerHTML = `${Icons.check} Copied Antigravity fold prompt to clipboard! Paste into your agent.`;
        toast.style.display = 'block';
        setTimeout(() => { if (toast) toast.style.display = 'none'; }, 4000);
      }
    });

    // 9. In Inbox Mode: "Replace minutes" button
    this.container.querySelector('#btnTriggerReplaceMinutes')?.addEventListener('click', async () => {
      this.isReplaceMode = true;
      await this.render();
    });

    // 10. Folded Mode: Copy action ID buttons
    this.container.querySelectorAll('[data-copy-action-id]').forEach(btn => {
      btn.addEventListener('click', async () => {
        const actId = btn.dataset.copyActionId;
        if (actId && navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(actId);
        }
        const orig = btn.innerHTML;
        btn.innerHTML = `<span style="display:inline-flex;align-items:center;gap:3px;">${Icons.check} Copied</span>`;
        setTimeout(() => { btn.innerHTML = orig; }, 1500);
      });
    });

    // 10b. Action toggle checkbox buttons (Prep and Folded modes)
    this.container.querySelectorAll('.action-toggle-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const actionId = btn.dataset.actionId;
        const targetMissionId = btn.dataset.missionId || missionId;
        if (!actionId) return;
        btn.disabled = true;
        try {
          await this.store.toggleAction(actionId, targetMissionId);
          await this.render();
        } catch (err) {
          console.error('[MeetingPanel] Toggle action failed:', err);
          btn.disabled = false;
        }
      });
    });

    // 10c. Action edit buttons (Prep and Folded modes)
    this.container.querySelectorAll('.action-edit-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const actionId = btn.dataset.actionId;
        const targetMissionId = btn.dataset.missionId || missionId;
        if (!actionId) return;

        let actionObj = null;
        try {
          const summary = await this.store.getMissionSummary(targetMissionId);
          if (summary && Array.isArray(summary.actions)) {
            actionObj = summary.actions.find(a => a.id === actionId);
          }
        } catch (err) {}

        if (!actionObj) {
          actionObj = { id: actionId, missionId: targetMissionId };
        }

        openActionEditModal({
          action: actionObj,
          missionId: targetMissionId,
          store: this.store,
          onSave: async () => {
            await this.render();
          }
        });
      });
    });

    // 11. Copy note path button
    this.container.querySelector('#btnCopyNotePath')?.addEventListener('click', async (e) => {
      const path = e.target.dataset.notePath;
      if (path && navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(path);
      }
      const orig = e.target.textContent;
      e.target.textContent = 'Path Copied!';
      setTimeout(() => { e.target.textContent = orig; }, 1500);
    });

    // 12. Toggle Related Section
    this.container.querySelector('#btnToggleRelated')?.addEventListener('click', async () => {
      this.isRelatedExpanded = !this.isRelatedExpanded;
      await this.render();
    });

    // 13. Open related meeting
    this.container.querySelectorAll('[data-open-related]').forEach(el => {
      el.addEventListener('click', () => {
        const relId = el.dataset.openRelated;
        if (relId && this.onOpenMeeting) {
          this.onOpenMeeting(relId);
        }
      });
    });
  }

  _extractGoogleDocUrl(description) {
    if (!description) return null;
    const match = description.match(/https:\/\/docs\.google\.com\/document\/d\/[a-zA-Z0-9_-]+/);
    return match ? match[0] : null;
  }
}

MeetingHub.MeetingPanelUI = MeetingPanelUI;

/* === Module: views/today.js === */
/**
 * Today View Component
 * 
 * Renders the Today agenda timeline with:
 * 1. Thin all-day event strip above the timeline.
 * 2. Next up card with 48-hour missing items checklist (agenda, last minutes, open actions)
 *    and wired Project Base context strip (open actions and decisions for this project).
 * 3. Daily timeline with missing checklist status and Life-mode training overlay.
 * 4. Step 3 Keyboard-First navigation helpers: getVisibleTimedEvents(), selectNextMeeting(), selectPreviousMeeting().
 * 5. Instant search filtering with `/` shortcut.
 */




class TodayView {
  constructor({ container, store, onSelectMeeting, onNavigateProject }) {
    this.container = container;
    this.store = store;
    this.onSelectMeeting = onSelectMeeting;
    this.onNavigateProject = onNavigateProject;
    this.selectedEventId = null;
    this.currentDate = typeof getTodayDateStr === 'function' ? getTodayDateStr() : new Date().toISOString().slice(0, 10);
    this.currentMode = 'all'; // 'all' | 'work' | 'life'
    this.searchQuery = '';
  }

  prevDay() {
    const [y, m, d] = this.currentDate.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    date.setDate(date.getDate() - 1);
    const pad = n => String(n).padStart(2, '0');
    this.setDate(`${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`);
  }

  nextDay() {
    const [y, m, d] = this.currentDate.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    date.setDate(date.getDate() + 1);
    const pad = n => String(n).padStart(2, '0');
    this.setDate(`${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`);
  }

  goToday() {
    const today = typeof getTodayDateStr === 'function' ? getTodayDateStr() : new Date().toISOString().slice(0, 10);
    this.setDate(today);
  }

  setDate(date) {
    this.currentDate = date;
    const subtitleEl = document.querySelector('#subtitle');
    if (subtitleEl && document.querySelector('#title')?.textContent === 'Today') {
      subtitleEl.textContent = typeof formatLongDate === 'function' ? formatLongDate(date) : date;
    }
    this.render();
  }

  setMode(mode) {
    this.currentMode = mode;
    this.render();
  }

  setSelectedEvent(id) {
    this.selectedEventId = id;
    this.render();
    this._scrollToSelected();
  }

  setSearchQuery(q) {
    this.searchQuery = (q || '').trim().toLowerCase();
    this.render();
  }

  getVisibleTimedEvents() {
    const allEvents = this.store.getEventsByDate(this.currentDate, 'all');
    let visible = allEvents.filter(ev => {
      if (this.currentMode === 'work') return ev.stream === 'work' && !ev.isTraining;
      if (this.currentMode === 'life') return ev.stream === 'life' || ev.isTraining;
      return true;
    }).filter(e => !e.isAllDay);

    if (this.searchQuery) {
      visible = visible.filter(e => {
        const text = `${e.title} ${e.client || ''} ${(e.attendees || []).join(' ')} ${(e.tags || []).join(' ')}`.toLowerCase();
        return text.includes(this.searchQuery);
      });
    }

    return visible.sort((a, b) => a.start.localeCompare(b.start));
  }

  selectNextMeeting() {
    const list = this.getVisibleTimedEvents();
    if (!list.length) return null;
    let idx = list.findIndex(e => e.id === this.selectedEventId);
    if (idx < 0) idx = 0;
    else idx = Math.min(idx + 1, list.length - 1);
    const target = list[idx];
    if (target) {
      if (this.onSelectMeeting) {
        this.onSelectMeeting(target.id);
      } else {
        this.setSelectedEvent(target.id);
      }
      return target;
    }
    return null;
  }

  selectPreviousMeeting() {
    const list = this.getVisibleTimedEvents();
    if (!list.length) return null;
    let idx = list.findIndex(e => e.id === this.selectedEventId);
    if (idx < 0) idx = 0;
    else idx = Math.max(idx - 1, 0);
    const target = list[idx];
    if (target) {
      if (this.onSelectMeeting) {
        this.onSelectMeeting(target.id);
      } else {
        this.setSelectedEvent(target.id);
      }
      return target;
    }
    return null;
  }

  _scrollToSelected() {
    setTimeout(() => {
      if (!this.selectedEventId || !this.container) return;
      const el = this.container.querySelector ? this.container.querySelector(`.row[data-event-id="${this.selectedEventId}"]`) : null;
      if (el && typeof el.scrollIntoView === 'function') {
        el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }, 40);
  }

  async render() {
    if (!this.container) return;

    const allEvents = this.store.getEventsByDate(this.currentDate, 'all');

    // Filter events according to mode and training constraint
    let visibleEvents = allEvents.filter(ev => {
      if (this.currentMode === 'work') {
        return ev.stream === 'work' && !ev.isTraining;
      }
      if (this.currentMode === 'life') {
        return ev.stream === 'life' || ev.isTraining;
      }
      return true;
    });

    if (this.searchQuery) {
      visibleEvents = visibleEvents.filter(e => {
        const text = `${e.title} ${e.client || ''} ${(e.attendees || []).join(' ')} ${(e.tags || []).join(' ')}`.toLowerCase();
        return text.includes(this.searchQuery);
      });
    }

    // Partition all-day events vs timed events
    const allDayEvents = visibleEvents.filter(e => e.isAllDay);
    const timedEvents = visibleEvents.filter(e => !e.isAllDay).sort((a, b) => a.start.localeCompare(b.start));

    // Next up candidate
    const workMeetings = timedEvents.filter(e => e.stream === 'work');
    const nextMeeting = workMeetings.find(e => e.start >= '09:00') || workMeetings[0] || timedEvents[0];

    // Compute dynamic prep evaluations across all visible work meetings
    const collectionPrep = await PrepScoreCalculator.computeCollectionPrep(workMeetings, this.store);

    // Dynamic prep evaluation & Project Base wiring for Next up meeting
    let nextPrep = null;
    let nextProjectBase = null;
    let isNextWithin48h = false;

    if (nextMeeting) {
      const data = await this.store.getMeetingData(nextMeeting.id);
      const links = await this.store.suggestLinks(nextMeeting);
      const project = this.store.getProjectForMeeting(nextMeeting);
      let inboxStatus = 'not_sent';
      let missionSummary = null;

      // Wire Project Base into Next up
      if (project) {
        try {
          inboxStatus = await this.store.getMeetingInboxStatus(nextMeeting.id, project.id);
          missionSummary = await this.store.getMissionSummary(project.id);
          nextProjectBase = await this.store.getProjectBase(project.id);
        } catch (e) {
          console.warn('[TodayView] Could not load project base for next meeting:', e);
        }
      }

      nextPrep = PrepScoreCalculator.computeMeetingPrep(nextMeeting, data, links, { inboxStatus, missionSummary });
      isNextWithin48h = PrepScoreCalculator.isWithin48Hours(nextMeeting.date, nextMeeting.start, this.currentDate, '00:00');

      if (this.selectedEventId === undefined) {
        this.selectedEventId = nextMeeting.id;
      }
    }

    // Render HTML
    this.container.innerHTML = `
      ${allDayEvents.length > 0 ? `
        <div class="all-day-strip">
          <div class="label" style="font-size: 10px; margin-bottom: 2px;">All-Day Overview</div>
          ${allDayEvents.map(e => {
            let displayTitle = e.title;
            if (e.client && displayTitle.startsWith(e.client + ' ')) {
              displayTitle = displayTitle.slice(e.client.length + 1).trim();
            }
            return `
              <div class="all-day-item">
                <span class="badge ${e.stream === 'work' ? 'info' : ''}">${this._escape(e.client || 'General')}</span>
                <span>${this._escape(displayTitle)}</span>
                ${e.location ? `<span class="sub" style="font-size: 11px;">(${this._escape(e.location)})</span>` : ''}
              </div>
            `;
          }).join('')}
        </div>
      ` : ''}

      ${nextMeeting && !this.searchQuery && nextPrep ? `
        <div class="card next">
          <div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap;">
            <span class="label">Next up</span>
            <span class="badge info">${nextMeeting.start}–${nextMeeting.end}</span>
            ${nextMeeting.client ? `<span class="badge">${this._escape(nextMeeting.client)}</span>` : ''}
            <span class="badge ${nextPrep.missingCount === 0 ? 'ok' : 'warn'}" style="margin-left: auto;">
              ${nextPrep.missingCount === 0 ? 'Prepared' : `${nextPrep.missingCount} missing item${nextPrep.missingCount > 1 ? 's' : ''}`}
            </span>
          </div>

          <h2>${this._escape(nextMeeting.title)}</h2>

          <!-- 48h Missing Items Checklist -->
          ${isNextWithin48h ? `
            <div class="prep-checklist-block" style="display: flex; flex-direction: column; gap: 6px; padding: 10px 12px; background: var(--muted); border: 1px solid var(--border); border-radius: var(--r-sm); margin: 6px 0;">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span class="label" style="margin-bottom: 0;">48h Prep Checklist</span>
                <span class="sub" style="font-size: 11px; font-weight: 500;">
                  ${nextPrep.missingCount === 0 ? 'All criteria satisfied' : `${nextPrep.missingCount} item${nextPrep.missingCount > 1 ? 's' : ''} to complete before meeting`}
                </span>
              </div>

              <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(170px, 1fr)); gap: 8px; margin-top: 4px;">
                ${nextPrep.missingItems.map(item => `
                  <div style="display: flex; align-items: flex-start; gap: 6px; font-size: 11.5px; padding: 6px 8px; border-radius: var(--r-sm); background: var(--card); border: 1px solid ${item.ok ? 'color-mix(in oklab, var(--ok) 30%, var(--border))' : 'color-mix(in oklab, var(--destructive) 30%, var(--border))'};">
                    <span style="color: ${item.ok ? 'var(--ok)' : 'var(--destructive)'}; flex-shrink: 0; margin-top: 1px;">
                      ${item.ok ? Icons.check : Icons.alertCircle}
                    </span>
                    <div style="min-width: 0;">
                      <div style="font-weight: 600; color: var(--foreground);">${this._escape(item.label)}</div>
                      <div class="sub" style="font-size: 10.5px;">${this._escape(item.detail)}</div>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
          ` : `
            <div class="sub" style="font-size: 12px; margin: 6px 0;">
              Scheduled for ${this._escape(nextMeeting.date || 'later')} · Prep checklist activates 48 hours prior to start
            </div>
          `}

          ${nextPrep.inbox && nextPrep.inbox.pending ? `
            <div style="margin: 6px 0; padding: 6px 10px; background: color-mix(in oklab, #d97706 15%, var(--card)); border: 1px solid #d97706; border-radius: var(--r-sm); font-size: 11.5px; display: flex; align-items: center; gap: 8px;">
              <span style="color: #d97706; flex-shrink: 0;">${Icons.clock || '⏳'}</span>
              <span><b>Inbox pending:</b> Raw minutes waiting to be folded into mission notes.</span>
            </div>
          ` : ''}

          <!-- Wired Project Base Intelligence Strip -->
          ${nextProjectBase ? `
            <div class="next-project-strip">
              <div style="display: flex; align-items: center; gap: 8px; font-size: 12px; min-width: 0;">
                <span style="color: var(--pink-600); flex-shrink: 0;">${Icons.layers}</span>
                <div style="min-width: 0;">
                  <span style="font-weight: 600; color: var(--foreground);">${this._escape(nextProjectBase.projectName)}:</span>
                  <span class="sub" style="font-size: 11.5px; margin-left: 4px;">
                    Open actions and decisions for this project: <b>${nextProjectBase.actionStats.open}</b> open action${nextProjectBase.actionStats.open === 1 ? '' : 's'} · <b>${nextProjectBase.decisionStats.total}</b> validated decision${nextProjectBase.decisionStats.total === 1 ? '' : 's'}
                  </span>
                </div>
              </div>
              <button class="btn sm" data-open-project="${this._escape(nextProjectBase.projectId)}" style="font-size: 11px; padding: 2px 8px; flex-shrink: 0; margin-left: 8px;">
                View Project Hub
              </button>
            </div>

            <!-- Workstream Context (from Notes) -->
            ${((nextProjectBase.openPoints && nextProjectBase.openPoints.length > 0) || (nextProjectBase.decisionRegister && nextProjectBase.decisionRegister.length > 0)) ? `
              <div class="card" style="margin-top: 8px; padding: 10px 12px; background: var(--card); border: 1px solid var(--border); border-radius: var(--r-sm);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                  <span style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: var(--pink-600);">Workstream Context (from Notes)</span>
                  <span class="sub" style="font-size: 10.5px;">Single Source of Truth</span>
                </div>

                ${(nextProjectBase.openPoints && nextProjectBase.openPoints.length > 0) ? `
                  <div style="margin-bottom: 8px;">
                    <div style="font-size: 11px; font-weight: 600; margin-bottom: 4px; color: var(--foreground);">Open Points:</div>
                    <div style="display: flex; flex-direction: column; gap: 4px;">
                      ${nextProjectBase.openPoints.slice(0, 5).map(p => `
                        <div style="font-size: 11.5px; line-height: 1.35; display: flex; align-items: baseline; gap: 6px;">
                          <span class="badge" style="font-size: 9.5px; font-family: var(--font-mono); font-weight: 600; padding: 0 4px; flex-shrink: 0;">${this._escape(p.id)}</span>
                          <span style="flex: 1; min-width: 0;">${this._escape(p.point || p.description || '')}</span>
                          ${p.owner ? `<span class="chip-owner" style="font-size: 10px; padding: 0 4px; flex-shrink: 0;">${this._escape(p.owner)}</span>` : ''}
                        </div>
                      `).join('')}
                    </div>
                  </div>
                ` : ''}

                ${(nextProjectBase.decisionRegister && nextProjectBase.decisionRegister.length > 0) ? `
                  <div>
                    <div style="font-size: 11px; font-weight: 600; margin-bottom: 4px; color: var(--foreground);">Recent Validated Decisions:</div>
                    <div style="display: flex; flex-direction: column; gap: 4px;">
                      ${nextProjectBase.decisionRegister.slice(-3).reverse().map(d => `
                        <div style="font-size: 11.5px; line-height: 1.35; display: flex; align-items: baseline; gap: 6px;">
                          ${d.date ? `<span class="sub" style="font-size: 10.5px; font-family: var(--font-mono); flex-shrink: 0;">${this._escape(d.date)}:</span>` : ''}
                          <span style="flex: 1; min-width: 0;">${this._escape(d.statement || d.decision || '')}</span>
                          ${d.facility ? `<span class="badge" style="font-size: 9.5px; padding: 0 4px; flex-shrink: 0;">${this._escape(d.facility)}</span>` : ''}
                        </div>
                      `).join('')}
                    </div>
                  </div>
                ` : ''}
              </div>
            ` : ''}
          ` : ''}

          <div style="display: flex; gap: 8px; margin-top: 6px;">
            ${!nextPrep.agenda.ok ? `
              <button class="btn pink" data-open-prep="${nextMeeting.id}">Draft agenda</button>
            ` : !nextPrep.openActions.ok ? `
              <button class="btn pink" data-open-actions="${nextMeeting.id}">Review actions (${nextPrep.openActions.totalOpen})</button>
            ` : `
              <button class="btn pink" data-open-prep="${nextMeeting.id}">Open prep</button>
            `}
            <button class="btn" data-open-related="${nextMeeting.id}">View related</button>
          </div>
        </div>
      ` : ''}

      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
        <div style="display: flex; align-items: center; gap: 8px;">
          <div class="label" style="margin-bottom: 0;">
            Timeline · ${typeof formatLongDate === 'function' ? formatLongDate(this.currentDate) : this.currentDate}
          </div>
          <div style="display: inline-flex; align-items: center; gap: 2px;">
            <button class="btn sm" id="todayPrevDayBtn" title="Previous day" style="padding: 1px 6px; font-size: 11px; height: 20px;">‹</button>
            <button class="btn sm" id="todayCurrentDayBtn" title="Today" style="padding: 1px 6px; font-size: 10px; height: 20px;">Today</button>
            <button class="btn sm" id="todayNextDayBtn" title="Next day" style="padding: 1px 6px; font-size: 11px; height: 20px;">›</button>
          </div>
        </div>
        ${this.searchQuery ? `
          <div style="display: flex; align-items: center; gap: 6px;">
            <span class="sub" style="font-size: 12px;">Filtered by "${this._escape(this.searchQuery)}" (${timedEvents.length})</span>
            <button class="btn sm" id="clearFilterBtn" style="height: 22px; padding: 0 6px; font-size: 11px;">Clear</button>
          </div>
        ` : collectionPrep.total > 0 ? `
          <div style="display: flex; align-items: center; gap: 8px; font-size: 12px; color: var(--muted-foreground);">
            <span style="font-family: var(--font-mono);">${collectionPrep.preparedCount} of ${collectionPrep.total} prepared</span>
          </div>
        ` : ''}
      </div>

      <div class="day">
        ${timedEvents.length > 0 ? timedEvents.map(m => {
          const isSelected = m.id === this.selectedEventId;
          const isTraining = m.isTraining;
          const colorBar = isTraining ? 'oklch(0.76 0.18 154.1)' : m.client === 'Clariane' ? 'var(--pink-600)' : 'oklch(0.68 0.16 245)';
          const metaParts = [
            m.client,
            m.attendees && m.attendees.length ? `${m.attendees.length} attendee${m.attendees.length > 1 ? 's' : ''}` : null,
            m.link ? `Call (${m.link})` : null
          ].filter(Boolean);

          const mPrep = collectionPrep.evaluations.get(m.id);

          return `
            <div class="row ${isTraining ? 'training' : ''} ${isSelected ? 'sel' : ''}" data-event-id="${m.id}" role="button" tabindex="0">
              <span class="t">${m.start}<br>${m.end}</span>
              <span class="bar" style="background: ${colorBar};"></span>
              <span>
                <div class="ttl">${this._escape(m.title)}</div>
                <div class="meta">${this._escape(metaParts.join(' · '))}</div>
              </span>
              <div style="display: flex; align-items: center; gap: 6px;">
                ${m.stream === 'work' ? (mPrep ? `
                  <span class="badge ${mPrep.missingCount === 0 ? 'ok' : 'warn'}" title="${mPrep.missingSummary}">
                    ${mPrep.missingCount === 0 ? 'Prepared' : `${mPrep.missingCount} missing`}
                  </span>
                ` : `
                  <span class="badge ${isSelected ? 'info' : ''}">Work</span>
                `) : isTraining ? `
                  <span class="badge warn">ATHX Training</span>
                ` : `
                  <span class="badge">Life</span>
                `}
                <button class="btn-delete-meeting" data-delete-event="${this._escape(m.id)}" title="Remove meeting from dashboard" aria-label="Delete meeting">${Icons.trash}</button>
              </div>
            </div>
          `;
        }).join('') : `
          <div class="empty" style="padding: 40px 0;">
            ${Icons.calendar}
            <div style="margin-top: 8px;">No scheduled events matching current criteria.</div>
          </div>
        `}
      </div>
    `;

    this._bindEvents();
  }

  _bindEvents() {
    // Prev / Next day navigation
    this.container.querySelector('#todayPrevDayBtn')?.addEventListener('click', () => this.prevDay());
    this.container.querySelector('#todayCurrentDayBtn')?.addEventListener('click', () => this.goToday());
    this.container.querySelector('#todayNextDayBtn')?.addEventListener('click', () => this.nextDay());

    // Clear filter
    this.container.querySelector('#clearFilterBtn')?.addEventListener('click', () => {
      this.searchQuery = '';
      const input = document.querySelector('#quickSearch');
      if (input) input.value = '';
      this.render();
    });

    // Open prep button
    const openPrepBtn = this.container.querySelector('[data-open-prep]');
    if (openPrepBtn) {
      openPrepBtn.addEventListener('click', () => {
        const id = openPrepBtn.dataset.openPrep;
        if (id && this.onSelectMeeting) {
          this.onSelectMeeting(id, 'agenda');
        }
      });
    }

    // Open actions button
    const openActionsBtn = this.container.querySelector('[data-open-actions]');
    if (openActionsBtn) {
      openActionsBtn.addEventListener('click', () => {
        const id = openActionsBtn.dataset.openActions;
        if (id && this.onSelectMeeting) {
          this.onSelectMeeting(id, 'actions');
        }
      });
    }

    // View related button
    const openRelatedBtn = this.container.querySelector('[data-open-related]');
    if (openRelatedBtn) {
      openRelatedBtn.addEventListener('click', () => {
        const id = openRelatedBtn.dataset.openRelated;
        if (id && this.onSelectMeeting) {
          this.onSelectMeeting(id, 'related');
        }
      });
    }

    // Open project base button
    const openProjectBtn = this.container.querySelector('[data-open-project]');
    if (openProjectBtn) {
      openProjectBtn.addEventListener('click', () => {
        const projectId = openProjectBtn.dataset.openProject;
        if (this.onNavigateProject) {
          this.onNavigateProject(projectId);
        } else {
          window.location.hash = '#/projects';
        }
      });
    }

    // Delete meeting button on timeline rows
    this.container.querySelectorAll('[data-delete-event]').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const eventId = btn.dataset.deleteEvent;
        if (!eventId) return;
        if (typeof window !== 'undefined' && typeof window.__deleteMeetingWithUndo === 'function') {
          await window.__deleteMeetingWithUndo(eventId);
        } else {
          await this.store.deleteEvent(eventId);
          await this.render();
        }
      });
    });

    // Timeline row click
    this.container.querySelectorAll('.row[data-event-id]').forEach(row => {
      row.addEventListener('click', (e) => {
        if (e.target.closest('[data-delete-event]')) return;
        const id = row.dataset.eventId;
        this.selectedEventId = id;
        this.container.querySelectorAll('.row').forEach(r => r.classList.remove('sel'));
        row.classList.add('sel');
        if (this.onSelectMeeting) {
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

MeetingHub.TodayView = TodayView;

/* === Module: views/week.js === */
/**
 * Week View Component
 * 
 * Multi-day calendar grid with:
 * 1. Thin all-day strip above columns.
 * 2. Day columns with time-ordered meetings.
 * 3. Weekly Review & KPIs panel (hours in meetings, prep completion rate, client breakdown).
 * 4. Mode filtering (Work / Life / All) with training overlay in Life mode.
 */




class WeekView {
  constructor({ container, store, onSelectMeeting }) {
    this.container = container;
    this.store = store;
    this.onSelectMeeting = onSelectMeeting;
    this.selectedEventId = null;
    this.currentDate = typeof getTodayDateStr === 'function' ? getTodayDateStr() : new Date().toISOString().slice(0, 10);
    this.weekStart = this._getMonday(this.currentDate);
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
    this.currentDate = typeof getTodayDateStr === 'function' ? getTodayDateStr() : new Date().toISOString().slice(0, 10);
    this.weekStart = this._getMonday(this.currentDate);
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
          const realToday = typeof getTodayDateStr === 'function' ? getTodayDateStr() : new Date().toISOString().slice(0, 10);
          const isToday = d.dateStr === realToday;
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
    if (typeof getMondayOfWeek === 'function') {
      return getMondayOfWeek(dateStr);
    }
    const [y, m, day] = (dateStr || '').split('-').map(Number);
    const d = new Date(y, m - 1, day);
    const dow = d.getDay();
    const diff = d.getDate() - dow + (dow === 0 ? -6 : 1);
    d.setDate(diff);
    const pad = n => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  }

  _getWeekDays(mondayStr) {
    const res = [];
    const [y, m, day] = (mondayStr || '').split('-').map(Number);
    const base = new Date(y, m - 1, day);
    const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    for (let i = 0; i < 7; i++) {
      const d = new Date(base);
      d.setDate(base.getDate() + i);
      const pad = n => String(n).padStart(2, '0');
      const dateStr = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
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

MeetingHub.WeekView = WeekView;

/* === Module: views/meetings.js === */
/**
 * Meetings View Component
 * 
 * Searchable, filterable directory of all 259 calendar meetings.
 * Filters by search keyword, client, stream, and temporal horizon.
 */




class MeetingsView {
  constructor({ container, store, onSelectMeeting }) {
    this.container = container;
    this.store = store;
    this.onSelectMeeting = onSelectMeeting;
    this.searchQuery = '';
    this.selectedClient = 'all';
    this.selectedStream = 'all';
    this.timeFilter = 'all'; // 'all' | 'upcoming' | 'past'
    this.selectedEventId = null;
  }

  setMode(mode) {
    this.selectedStream = mode;
    this.render();
  }

  setSelectedEvent(id) {
    this.selectedEventId = id;
    this.render();
  }

  setSearchQuery(q) {
    this.searchQuery = (q || '').trim().toLowerCase();
    this.render();
  }

  async render() {
    if (!this.container) return;

    let events = [...this.store.eventsCache];

    // Stream filter
    if (this.selectedStream === 'work') {
      events = events.filter(e => e.stream === 'work' && !e.isTraining);
    } else if (this.selectedStream === 'life') {
      events = events.filter(e => e.stream === 'life' || e.isTraining);
    }

    // Client filter
    if (this.selectedClient !== 'all') {
      events = events.filter(e => e.client === this.selectedClient);
    }

    // Time filter (relative to current date)
    const todayStr = typeof getTodayDateStr === 'function' ? getTodayDateStr() : new Date().toISOString().slice(0, 10);
    if (this.timeFilter === 'upcoming') {
      events = events.filter(e => e.date >= todayStr);
    } else if (this.timeFilter === 'past') {
      events = events.filter(e => e.date < todayStr);
    }

    // Text search
    if (this.searchQuery) {
      events = events.filter(e => {
        const text = `${e.title} ${e.client || ''} ${(e.attendees || []).join(' ')} ${(e.tags || []).join(' ')} ${e.series || ''}`.toLowerCase();
        return text.includes(this.searchQuery);
      });
    }

    // Sort: earliest date first for upcoming, latest first for past
    events.sort((a, b) => {
      const cmp = this.timeFilter === 'past'
        ? b.date.localeCompare(a.date) || (b.start || '').localeCompare(a.start || '')
        : a.date.localeCompare(b.date) || (a.start || '').localeCompare(b.start || '');
      return cmp;
    });

    // Unique clients for filter pills
    const allClients = Array.from(new Set(this.store.eventsCache.map(e => e.client).filter(Boolean)));

    this.container.innerHTML = `
      <div class="view-header" style="margin-bottom: 16px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; flex-wrap: wrap; gap: 8px;">
          <div>
            <h2 style="font: 600 20px/1.2 var(--font-sans); margin: 0 0 2px;">Meetings Directory</h2>
            <div class="sub" style="font-size: 12px;">Showing ${events.length} of ${this.store.eventsCache.length} calendar meetings</div>
          </div>
          <div style="display: flex; gap: 6px;">
            <select id="timeFilterSelect" class="in" style="width: 120px; font-size: 12px;">
              <option value="all" ${this.timeFilter === 'all' ? 'selected' : ''}>All Dates</option>
              <option value="upcoming" ${this.timeFilter === 'upcoming' ? 'selected' : ''}>Upcoming</option>
              <option value="past" ${this.timeFilter === 'past' ? 'selected' : ''}>Past Sessions</option>
            </select>
          </div>
        </div>

        <div style="display: flex; gap: 8px; margin-bottom: 12px;">
          <div style="position: relative; flex: 1;">
            <input class="in" id="meetingsSearchInput" placeholder="Filter by title, client, attendee, series..." value="${this._escape(this.searchQuery)}" style="width: 100%; padding-left: 30px;" />
            <span style="position: absolute; left: 10px; top: 8px; color: var(--muted-foreground);">${Icons.search}</span>
          </div>
        </div>

        <div style="display: flex; gap: 6px; flex-wrap: wrap; align-items: center;">
          <span style="font-size: 11px; text-transform: uppercase; font-weight: 600; color: var(--muted-foreground); margin-right: 4px;">Client:</span>
          <button class="badge ${this.selectedClient === 'all' ? 'on' : ''}" data-client="all" style="cursor: pointer;">All</button>
          ${allClients.map(c => `
            <button class="badge ${this.selectedClient === c ? 'on' : ''}" data-client="${this._escape(c)}" style="cursor: pointer;">
              ${this._escape(c)}
            </button>
          `).join('')}
        </div>
      </div>

      <div class="meetings-list" style="display: flex; flex-direction: column; gap: 6px;">
        ${events.length > 0 ? events.map(e => {
          const isSelected = e.id === this.selectedEventId;
          const isToday = e.date === todayStr;
          return `
            <div class="meeting-row ${isSelected ? 'selected' : ''}" data-event-id="${e.id}" style="
              display: flex;
              align-items: center;
              gap: 12px;
              padding: 10px 14px;
              border: 1px solid ${isSelected ? 'var(--pink-600)' : 'var(--border)'};
              border-radius: var(--r-md);
              background: ${isSelected ? 'color-mix(in oklab, var(--pink-600) 6%, var(--background))' : 'var(--background)'};
              cursor: pointer;
              transition: border-color 0.15s ease;
            ">
              <div style="min-width: 95px; font-family: var(--font-mono); font-size: 11.5px; color: var(--muted-foreground);">
                <div style="font-weight: 600; color: ${isToday ? 'var(--pink-600)' : 'var(--foreground)'};">${e.date}</div>
                <div>${e.start}–${e.end}</div>
              </div>

              <div style="flex: 1; min-width: 0;">
                <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 2px;">
                  <b style="font-size: 13.5px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${this._escape(e.title)}</b>
                  ${e.client ? `<span class="badge" style="font-size: 9.5px; padding: 1px 5px;">${this._escape(e.client)}</span>` : ''}
                  ${e.isAllDay ? `<span class="badge" style="font-size: 9.5px;">All Day</span>` : ''}
                </div>
                <div style="font-size: 11.5px; color: var(--muted-foreground); overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                  ${e.attendees && e.attendees.length ? `${e.attendees.join(', ')}` : 'Standalone session'}
                  ${e.series ? ` · Series: ${this._escape(e.series.slice(0, 16))}...` : ''}
                </div>
              </div>

              <div style="display: flex; align-items: center; gap: 8px;">
                ${e.link ? `<span title="Video call">${Icons.video}</span>` : ''}
                <button class="btn sm" data-open-id="${e.id}">Open</button>
                <button class="btn-delete-meeting" data-delete-event="${this._escape(e.id)}" title="Remove meeting from dashboard" aria-label="Delete meeting">${Icons.trash}</button>
              </div>
            </div>
          `;
        }).join('') : `
          <div class="empty" style="padding: 40px 0;">
            No meetings matched your search criteria.
          </div>
        `}
      </div>
    `;

    this._bindEvents();
  }

  _bindEvents() {
    const searchInput = this.container.querySelector('#meetingsSearchInput');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value.trim().toLowerCase();
        this.render();
      });
    }

    const timeSelect = this.container.querySelector('#timeFilterSelect');
    if (timeSelect) {
      timeSelect.addEventListener('change', (e) => {
        this.timeFilter = e.target.value;
        this.render();
      });
    }

    this.container.querySelectorAll('[data-client]').forEach(btn => {
      btn.addEventListener('click', () => {
        this.selectedClient = btn.dataset.client;
        this.render();
      });
    });

    this.container.querySelectorAll('[data-delete-event]').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const eventId = btn.dataset.deleteEvent;
        if (!eventId) return;
        if (typeof window !== 'undefined' && typeof window.__deleteMeetingWithUndo === 'function') {
          await window.__deleteMeetingWithUndo(eventId);
        } else {
          await this.store.deleteEvent(eventId);
          await this.render();
        }
      });
    });

    this.container.querySelectorAll('[data-event-id]').forEach(el => {
      el.addEventListener('click', (e) => {
        if (e.target.closest('[data-delete-event]')) return;
        const id = el.dataset.eventId;
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

MeetingHub.MeetingsView = MeetingsView;

/* === Module: views/actions.js === */
/**
 * Open Actions View Component
 * 
 * Aggregates all open action items across all meetings,
 * grouped by client (Artefact, Clariane, Internal, etc.).
 * Allows inline completion toggling, filtering by owner, and direct navigation.
 */



class ActionsView {
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
            const m = act.source.match(/(?:meeting\/|\/m\/)([a-zA-Z0-9_\-]+)/);
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
            workstream: act.workstream || act.substream || act.org || act.ownerOrg || '',
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

    this.itemsMap = new Map(aggregatedItems.map(i => [i.id, i]));

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
                    <button class="item-check-btn ${item.done ? 'checked' : ''}" data-item-id="${this._escape(item.id)}" data-mission-id="${this._escape(item.missionId || '')}" data-meeting-id="${this._escape(item.meetingId || '')}" data-is-note="${item.isNoteAction ? 'true' : 'false'}" data-note-file="${this._escape(item.sourceNote || '')}" title="${item.done ? 'Mark open' : 'Mark done'}">
                      ${item.done ? Icons.check : ''}
                    </button>
                    <span class="kind-badge ${item.kind}">${item.kind}</span>
                    ${item.isNoteAction ? `
                      <span class="badge" style="background: var(--muted); font-size: 10px; font-family: var(--font-mono); font-weight: 600;">${this._escape(item.id)}</span>
                      <span class="badge" style="font-size: 10px; border-color: var(--pink-600); color: var(--pink-600);">[${this._escape(item.sourceNote || 'Actions.md')}]</span>
                    ` : ''}
                    <div class="item-body item-body-clickable" data-item-id="${this._escape(item.id)}" title="Click to edit action" style="cursor: pointer;">
                      <span class="tx ${item.done ? 'done' : ''}">${this._escape(item.text)}</span>
                      <div class="item-meta" style="margin-top: 4px; display: flex; gap: 6px; align-items: center; flex-wrap: wrap;">
                        ${item.owner ? `<span class="chip-owner">${this._escape(item.owner)}</span>` : ''}
                        ${(item.workstream || item.ownerOrg) ? `<span class="badge" style="font-size: 10px;">${this._escape(item.workstream || item.ownerOrg)}</span>` : ''}
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
                    <div style="display: flex; align-items: center; gap: 4px; flex-shrink: 0;">
                      <button class="btn sm edit-action-btn" data-item-id="${this._escape(item.id)}" title="Edit action: name, sub-stream, owner, due date" style="font-size: 10.5px; padding: 2px 7px; display: inline-flex; align-items: center; gap: 4px;">
                        ${Icons.edit} Edit
                      </button>
                      ${item.isNoteAction ? `
                        <button class="btn sm" data-copy-note-action="${this._escape(item.id)}" data-note-file="${this._escape(item.sourceNote || 'Actions.md')}" title="Copy ID: ${this._escape(item.id)}" style="font-size: 10.5px; padding: 2px 7px;">
                          Copy ID
                        </button>
                      ` : `
                        <button class="btn-icon delete-action-btn" data-item-id="${this._escape(item.id)}" data-meeting-id="${this._escape(item.meetingId || '')}" title="Delete action">
                          ${Icons.trash}
                        </button>
                      `}
                    </div>
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

    // Edit action modal handler
    const handleEditAction = (itemId) => {
      const item = this.itemsMap?.get(itemId);
      if (!item) return;
      openActionEditModal({
        action: {
          id: item.id,
          title: item.text,
          description: item.text,
          owner: item.owner === 'Unassigned' ? '' : item.owner,
          workstream: item.workstream || item.ownerOrg,
          dueDate: item.dueDate,
          missionId: item.missionId
        },
        missionId: item.missionId,
        store: this.store,
        onSave: async (updated) => {
          if (!item.isNoteAction && item.meetingId) {
            try {
              const note = await this.store.getMeetingData(item.meetingId);
              if (note && Array.isArray(note.items)) {
                const target = note.items.find(i => i.id === item.id);
                if (target) {
                  target.text = updated.title || updated.text || target.text;
                  target.owner = updated.owner;
                  target.dueDate = updated.dueDate || updated.due;
                  await this.store.saveMeetingData(item.meetingId, { items: note.items });
                }
              }
            } catch (e) {
              console.warn('[ActionsView] Local action edit update failed:', e);
            }
          }
          await this.render();
        }
      });
    };

    this.container.querySelectorAll('.edit-action-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        handleEditAction(btn.dataset.itemId);
      });
    });

    this.container.querySelectorAll('.item-body-clickable').forEach(el => {
      el.addEventListener('click', (e) => {
        if (e.target.closest('[data-nav-meeting]')) return;
        e.stopPropagation();
        handleEditAction(el.dataset.itemId);
      });
    });

    // Toggle item completion
    this.container.querySelectorAll('.item-check-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const itemId = btn.dataset.itemId;
        if (btn.dataset.isNote === 'true') {
          const missionId = btn.dataset.missionId;
          btn.disabled = true;
          try {
            await this.store.toggleAction(itemId, missionId);
            await this.render();
          } catch (err) {
            console.error('[ActionsView] Failed to toggle note action:', err);
            btn.disabled = false;
          }
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

MeetingHub.ActionsView = ActionsView;

/* === Module: views/series.js === */
/**
 * Series & Links View Component
 * 
 * Interactive timeline and graph representation of recurring meeting series
 * and cross-linked meeting webs.
 */



class SeriesView {
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

MeetingHub.SeriesView = SeriesView;

/* === Module: views/projects.js === */
/**
 * Mission Cockpit & Knowledge View Component (Phase 3 Project Hub)
 * 
 * Replaces legacy KPI project base with an actionable Mission Cockpit:
 * - Dynamic Header: Title, status, open actions count, amber "to fold" count, next meeting
 * - Meeting Stream (always open, default view):
 *     1. Up next: prep (<=48h) with workstream context & prep checklist dots
 *     2. Just happened: fold (amber) with distinct capture/inbox states
 *     3. Folded: collapsed 1-line strip, expandable
 * - Knowledge Tabs below the stream (collapsed by default):
 *     Workstreams, Decisions, Actions, Contacts, Brief
 */


class ProjectsView {
  constructor({ container, store, onSelectMeeting, now } = {}) {
    this.container = container;
    this.store = store;
    this.onSelectMeeting = onSelectMeeting;
    this.now = now || null;
    this.currentProjectId = 'ge-enterprise';
    this.currentSubTab = null; // 'workstreams' | 'decisions' | 'actions' | 'contacts' | 'brief'
    this.isFoldedOpen = false;
    this.actionOwnerFilter = 'all';
    this.actionStatusFilter = 'open';
    this.decisionWsFilter = 'all';
    this.searchQuery = '';
    this._renderSeq = 0;
    this._renderedProjectId = null;
  }

  setSearchQuery(q) {
    this.searchQuery = (q || '').trim().toLowerCase();
    this.render();
  }

  setProject(projectId, renderImmediately = true) {
    if (!projectId) return;
    this.currentProjectId = projectId;
    if (renderImmediately) {
      this.render(projectId);
    }
  }

  setTab(tab, renderImmediately = true) {
    this.currentSubTab = tab || null;
    if (renderImmediately) {
      this.render();
    }
  }

  // Alias for backward compatibility
  setClient(clientId) {
    this.setProject(clientId);
  }

  selectNextMeeting() {
    const cards = Array.from(this.container.querySelectorAll('[data-event-id]'));
    if (cards.length === 0) return;
    const currentId = this.store?.selectedEventId;
    let nextIdx = 0;
    if (currentId) {
      const idx = cards.findIndex(c => c.dataset.eventId === currentId);
      if (idx >= 0 && idx < cards.length - 1) {
        nextIdx = idx + 1;
      }
    }
    const nextCard = cards[nextIdx];
    if (nextCard && this.onSelectMeeting) {
      this.onSelectMeeting(nextCard.dataset.eventId);
    }
  }

  selectPreviousMeeting() {
    const cards = Array.from(this.container.querySelectorAll('[data-event-id]'));
    if (cards.length === 0) return;
    const currentId = this.store?.selectedEventId;
    let prevIdx = 0;
    if (currentId) {
      const idx = cards.findIndex(c => c.dataset.eventId === currentId);
      if (idx > 0) {
        prevIdx = idx - 1;
      } else {
        prevIdx = cards.length - 1;
      }
    }
    const prevCard = cards[prevIdx];
    if (prevCard && this.onSelectMeeting) {
      this.onSelectMeeting(prevCard.dataset.eventId);
    }
  }

  async render(targetProjectId = null) {
    if (!this.container) return;
    if (targetProjectId) {
      this.currentProjectId = targetProjectId;
    } else if (typeof AppState !== 'undefined' && AppState.missionId) {
      this.currentProjectId = AppState.missionId;
    }
    const seq = ++this._renderSeq;
    const currentId = this.currentProjectId;

    // Immediately clear stale HTML when switching to a different mission
    if (this._renderedProjectId && this._renderedProjectId !== currentId) {
      this.container.innerHTML = `
        <div style="padding: 28px; display: flex; align-items: center; gap: 10px; color: var(--muted-foreground); font-size: 13px;">
          <span style="display: inline-block; width: 14px; height: 14px; border: 2px solid var(--border); border-top-color: var(--pink-600); border-radius: 50%; animation: spin 0.8s linear infinite;"></span>
          <span>Loading mission cockpit for <b>${this._escape(currentId)}</b>...</span>
        </div>
      `;
    }

    let data;
    try {
      // Retrieve full cockpit data from system of record
      data = await this.store.getMissionHubData(currentId, this.now || new Date());
      if (seq !== this._renderSeq) return;
    } catch (err) {
      console.warn(`[ProjectsView] Error loading mission data for ${currentId}:`, err);
      if (seq !== this._renderSeq) return;
      data = {
        mission: { id: currentId, name: currentId },
        summary: {},
        lanes: { prep: [], fold: [], folded: [], hidden: [] },
        inboxStatus: { pendingCount: 0, files: [] },
        openActionsCount: 0,
        toFoldCount: 0,
        nextMeeting: null
      };
    }

    const mission = data.mission || { id: currentId, name: currentId };
    const summary = data.summary || {};
    const lanes = data.lanes || { prep: [], fold: [], folded: [], hidden: [] };
    const inboxStatus = data.inboxStatus || { pendingCount: 0, files: [] };

    // Registry missions for dropdown
    const registry = await this.store.getMissionsRegistry();
    if (seq !== this._renderSeq) return;
    const allMissions = Array.isArray(registry) ? registry : (registry?.missions || []);

    // Filter lanes by search query if present
    let prepMeetings = lanes.prep;
    let foldMeetings = lanes.fold;
    let foldedMeetings = lanes.folded;

    if (this.searchQuery) {
      const q = this.searchQuery;
      const matchMeeting = (m) => {
        return (m.title || '').toLowerCase().includes(q) ||
               (m.series || '').toLowerCase().includes(q) ||
               (m.attendees || []).some(a => a.toLowerCase().includes(q));
      };
      prepMeetings = prepMeetings.filter(matchMeeting);
      foldMeetings = foldMeetings.filter(matchMeeting);
      foldedMeetings = foldedMeetings.filter(matchMeeting);
    }

    // Workstreams lookup map
    const workstreams = summary.workstreams || [];
    const openPoints = summary.openPoints || [];
    const actions = summary.actions || summary.actionMatrix || [];
    const decisions = summary.decisionRegister || summary.decisions || [];
    const contacts = summary.contacts || [];

    // Next meeting display text
    let nextMeetingText = 'No upcoming meeting in ≤48h';
    if (data.nextMeeting) {
      nextMeetingText = `${data.nextMeeting.date} ${data.nextMeeting.start} · ${data.nextMeeting.title}`;
    }

    try {
      this.container.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 16px;">
        
        <!-- 3.2 Cockpit Header -->
        <div class="cockpit-header">
          <div style="flex: 1; min-width: 280px;">
            <div class="cockpit-title-row">
              <span class="label" style="margin-bottom: 0;">Mission Cockpit</span>
              <span class="badge ${mission.archived ? 'sub' : 'ok'}" style="font-weight: 600;">
                ${mission.archived ? 'Archived' : 'Active Mission'}
              </span>
              <span class="badge" style="font-family: var(--font-mono); font-size: 11px;">
                ${this._escape(mission.id)}
              </span>
            </div>
            <h1 style="font: 600 24px/1.2 var(--font-sans); margin: 6px 0 2px 0;">
              ${this._escape(mission.name || mission.id)}
            </h1>
            <div class="cockpit-meta-row">
              <span class="badge ${data.openActionsCount > 0 ? '' : 'ok'}">
                ${data.openActionsCount} open action${data.openActionsCount !== 1 ? 's' : ''}
              </span>
              ${data.toFoldCount > 0 ? `
                <span class="badge amber" title="${data.toFoldCount} meeting(s) waiting to be folded into mission notes">
                  ${data.toFoldCount} to fold
                </span>
              ` : `
                <span class="badge ok" style="font-size: 11px;">All folded</span>
              `}
              <span style="font-family: var(--font-mono); font-size: 11.5px;">
                Next: <b>${this._escape(nextMeetingText)}</b>
              </span>
              <span class="sub" style="font-size: 11px; display: inline-flex; align-items: center; gap: 4px;" title="Mission notes folder in system of record">
                ${Icons.folder} ${this._escape(mission.directory || mission.id)}
              </span>
            </div>
          </div>

          <!-- Mission Switcher Dropdown (Updates URL directly) -->
          <div style="display: flex; gap: 8px; align-items: center;">
            <label for="projectSelectDropdown" class="sub" style="font-size: 12px; font-weight: 500;">Mission:</label>
            <select id="projectSelectDropdown" class="in" style="font-size: 13px; font-weight: 600; height: 34px; padding: 4px 10px; border-radius: var(--r-sm); min-width: 250px; cursor: pointer; background: var(--card, #161f30); color: var(--foreground, #f0f4fc); border: 1px solid var(--border);">
              ${allMissions.map(m => `
                <option value="${this._escape(m.id)}" style="background: var(--card, #161f30); color: var(--foreground, #f0f4fc);" ${currentId.toLowerCase() === (m.id || '').toLowerCase() ? 'selected' : ''}>
                  ${m.archived || m.status === 'archived' ? '[Archived] ' : ''}${this._escape(m.name || m.id)}
                </option>
              `).join('')}
            </select>
          </div>
        </div>

        <!-- 3.3 Meeting Stream (Always visible, default content) -->
        <div class="stream-container">
          
          <!-- Lane 1: Up next: prep (<=48h) -->
          <div class="stream-lane">
            <div class="lane-header">
              <span>Up next: prep (≤48h)</span>
              <span class="badge ${prepMeetings.length > 0 ? 'pink' : ''}">${prepMeetings.length}</span>
            </div>
            ${prepMeetings.length === 0 ? `
              <div class="empty-lane">Nothing in the next 48h for this mission</div>
            ` : `
              <div class="lane-cards">
                ${prepMeetings.map(m => this._renderPrepCard(m, summary, inboxStatus)).join('')}
              </div>
            `}
          </div>

          <!-- Lane 2: Just happened: fold (amber) -->
          <div class="stream-lane" style="border-color: ${foldMeetings.length > 0 ? 'oklch(0.78 0.16 75 / 45%)' : 'var(--border)'};">
            <div class="lane-header" style="color: ${foldMeetings.length > 0 ? 'oklch(0.85 0.16 75)' : 'var(--muted-foreground)'};">
              <span>Just happened: fold</span>
              <span class="badge ${foldMeetings.length > 0 ? 'amber' : 'ok'}">${foldMeetings.length}</span>
            </div>
            ${foldMeetings.length === 0 ? `
              <div class="empty-lane" style="border-left: 3px solid var(--ok); color: var(--ok);">All minutes folded</div>
            ` : `
              <div class="lane-cards">
                ${foldMeetings.map(m => this._renderFoldCard(m, inboxStatus)).join('')}
              </div>
            `}
          </div>

          <!-- Lane 3: Folded (collapsed 1-line strip, expandable) -->
          ${foldedMeetings.length > 0 ? `
            <div class="folded-summary-strip" id="toggleFoldedStripBtn" title="Click to ${this.isFoldedOpen ? 'collapse' : 'expand'} folded meetings">
              <span style="display: inline-flex; align-items: center; gap: 4px; font-weight: 600;">${Icons.check} ${foldedMeetings.length} folded meeting${foldedMeetings.length !== 1 ? 's' : ''}</span>
              <span style="font-size: 11.5px; opacity: 0.85; display: inline-flex; align-items: center; gap: 4px;">
                ${this.isFoldedOpen ? `${Icons.chevronUp} Click to collapse` : `${Icons.chevronDown} Click to show folded meetings`}
              </span>
            </div>
            ${this.isFoldedOpen ? `
              <div class="lane-cards" style="margin-top: 8px;">
                ${foldedMeetings.map(m => `
                  <div class="meeting-card" data-event-id="${this._escape(m.id)}" style="opacity: 0.85;">
                    <div class="meeting-card-head">
                      <div>
                        <span class="meeting-card-time">${this._escape(m.date)} ${this._escape(m.start)}</span>
                        <span class="meeting-card-title">${this._escape(m.title)}</span>
                      </div>
                      <div style="display: flex; align-items: center; gap: 6px;">
                        <span class="badge ok" style="font-size: 10px;">Folded in notes</span>
                        <button class="btn-delete-meeting" data-delete-event="${this._escape(m.id)}" title="Remove meeting from dashboard" aria-label="Delete meeting">${Icons.trash}</button>
                      </div>
                    </div>
                  </div>
                `).join('')}
              </div>
            ` : ''}
          ` : ''}

          <!-- Hidden older meetings notice -->
          ${lanes.hidden.length > 0 ? `
            <div class="sub" style="font-size: 11px; margin-top: 4px; color: var(--muted-foreground);">
              ${lanes.hidden.length} older meeting${lanes.hidden.length !== 1 ? 's' : ''} without minutes (archived)
            </div>
          ` : ''}
        </div>

        <!-- 3.4 Knowledge Tabs (below the stream, collapsed to tab bar by default) -->
        <div class="tabs" style="margin-top: 12px; margin-bottom: 0;">
          <button data-cockpit-tab="workstreams" class="${this.currentSubTab === 'workstreams' ? 'on' : ''}">
            Workstreams (${workstreams.length})
          </button>
          <button data-cockpit-tab="decisions" class="${this.currentSubTab === 'decisions' ? 'on' : ''}">
            Decisions (${decisions.length})
          </button>
          <button data-cockpit-tab="actions" class="${this.currentSubTab === 'actions' ? 'on' : ''}">
            Actions (${data.openActionsCount} Open)
          </button>
          <button data-cockpit-tab="contacts" class="${this.currentSubTab === 'contacts' ? 'on' : ''}">
            Contacts (${contacts.length})
          </button>
          <button data-cockpit-tab="brief" class="${this.currentSubTab === 'brief' ? 'on' : ''}">
            Brief
          </button>
        </div>

        <!-- Tab Body (Only rendered when a tab is selected) -->
        ${this.currentSubTab ? `
          <div id="cockpitTabContent" style="background: var(--card); border: 1px solid var(--border); border-radius: var(--r-md); padding: 16px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 1px solid var(--border);">
              <div style="display: flex; align-items: baseline; gap: 8px;">
                <span class="label" style="margin: 0; text-transform: uppercase;">Knowledge View</span>
                <span style="font-weight: 600; font-size: 14px; text-transform: capitalize;">${this._escape(this.currentSubTab)}</span>
              </div>
              <button class="btn sm" data-close-cockpit-tab style="display: flex; align-items: center; gap: 4px; cursor: pointer;" title="Close knowledge tab and return to meeting stream">
                ${Icons.x}
                <span>Close tab</span>
              </button>
            </div>
            ${this._renderTabBody(summary, data)}
          </div>
        ` : ''}

      </div>
    `;

      this._bindEvents(data);
      this._renderedProjectId = currentId;
    } catch (renderErr) {
      console.error(`[ProjectsView] Error rendering cockpit for ${currentId}:`, renderErr);
      this.container.innerHTML = `
        <div style="padding: 24px; background: color-mix(in oklab, var(--danger, #ef4444) 10%, var(--card)); border: 1px solid var(--danger, #ef4444); border-radius: var(--r-md); margin: 16px;">
          <div style="display: flex; align-items: center; gap: 8px; font-weight: 700; color: var(--danger, #ef4444); margin-bottom: 8px;">
            ${Icons.alertCircle || ''} Mission Cockpit Render Error
          </div>
          <div style="font-size: 13px; color: var(--foreground); margin-bottom: 12px;">
            Failed to render mission cockpit for <b>${this._escape(currentId)}</b>: ${this._escape(renderErr.message || String(renderErr))}
          </div>
          <button class="btn sm" onclick="window.location.reload()" style="cursor: pointer;">Retry Reload</button>
        </div>
      `;
    }
  }

  _renderPrepCard(meeting, summary, inboxStatus) {
    // Match workstream
    const titleLower = (meeting.title || '').toLowerCase();
    const ws = (summary.workstreams || []).find(w => 
      titleLower.includes((w.badge || '').toLowerCase()) ||
      titleLower.includes((w.title || '').toLowerCase()) ||
      titleLower.includes((w.id || '').toLowerCase())
    );

    // Collect 3 open points / actions from notes (prioritaire first)
    const allActions = summary.actions || summary.actionMatrix || [];
    const openActs = allActions.filter(a => !a.done);
    
    // Sort blocking / prioritaire first
    openActs.sort((a, b) => {
      const aPrio = (a.deadline || '').toLowerCase().includes('prioritaire') || (a.text || '').toLowerCase().includes('prioritaire');
      const bPrio = (b.deadline || '').toLowerCase().includes('prioritaire') || (b.text || '').toLowerCase().includes('prioritaire');
      if (aPrio && !bPrio) return -1;
      if (!aPrio && bPrio) return 1;
      return 0;
    });

    const displayPoints = openActs.slice(0, 3);

    // Prep dots: 1: agenda, 2: last minutes folded, 3: actions reviewed
    const dot1 = Boolean(meeting.notes && meeting.notes.trim().length > 0);
    const dot2 = inboxStatus.pendingCount === 0;
    const dot3 = openActs.length === 0;

    return `
      <div class="meeting-card" data-event-id="${this._escape(meeting.id)}">
        <div class="meeting-card-head">
          <div style="display: flex; align-items: baseline; gap: 8px; flex-wrap: wrap;">
            <span class="meeting-card-time">${this._escape(meeting.date)} · ${this._escape(meeting.start)} - ${this._escape(meeting.end)}</span>
            <span class="meeting-card-title">${this._escape(meeting.title)}</span>
            ${ws ? `<span class="badge info" style="font-size: 10px;">${this._escape(ws.badge || ws.title)}</span>` : ''}
          </div>
          <div style="display: flex; align-items: center; gap: 8px;">
            <div class="prep-dots" title="Prep Checklist: (1) Agenda drafted, (2) Previous folded, (3) Actions clear">
              <span class="prep-dot ${dot1 ? 'ok' : ''}"></span>
              <span class="prep-dot ${dot2 ? 'ok' : ''}"></span>
              <span class="prep-dot ${dot3 ? 'ok' : ''}"></span>
            </div>
            <button class="btn-delete-meeting" data-delete-event="${this._escape(meeting.id)}" title="Remove meeting from dashboard" aria-label="Delete meeting">${Icons.trash}</button>
          </div>
        </div>

        ${displayPoints.length > 0 ? `
          <ul class="meeting-card-points">
            ${displayPoints.map(p => `
              <li>
                <b style="font-family: var(--font-mono); color: var(--pink-600);">${this._escape(p.id)}:</b>
                ${this._escape(p.text || p.description)}
                ${p.owner ? `<span class="sub" style="font-size: 10.5px;">(${this._escape(p.owner)})</span>` : ''}
              </li>
            `).join('')}
          </ul>
        ` : `
          <div class="sub" style="font-size: 11px; margin-top: 2px;">No blocking actions pending for this stream.</div>
        `}
      </div>
    `;
  }

  _renderFoldCard(meeting, inboxStatus) {
    // Per-meeting state is computed in store.getMissionHubData (inbox files are objects, not strings)
    const hasInboxFile = meeting.inboxState
      ? meeting.inboxState === 'pending'
      : this.store.meetingInboxState(meeting.id, inboxStatus) === 'pending';

    return `
      <div class="meeting-card fold-card" data-event-id="${this._escape(meeting.id)}">
        <div class="meeting-card-head">
          <div>
            <span class="meeting-card-time">${this._escape(meeting.date)} · ${this._escape(meeting.start)} - ${this._escape(meeting.end)}</span>
            <span class="meeting-card-title">${this._escape(meeting.title)}</span>
          </div>
          <div style="display: flex; align-items: center; gap: 6px;">
            ${hasInboxFile ? `
              <div class="fold-state-pill inbox" style="display: inline-flex; align-items: center; gap: 4px;">${Icons.clock} In inbox, waiting to fold</div>
            ` : `
              <div class="fold-state-pill empty" style="display: inline-flex; align-items: center; gap: 4px;">${Icons.alertCircle} No minutes yet · Drop or paste</div>
            `}
            <button class="btn-delete-meeting" data-delete-event="${this._escape(meeting.id)}" title="Remove meeting from dashboard" aria-label="Delete meeting">${Icons.trash}</button>
          </div>
        </div>
      </div>
    `;
  }

  _renderTabBody(summary, data) {
    if (this.currentSubTab === 'workstreams') {
      const wsList = summary.workstreams || [];
      return `
        <div style="display: grid; gap: 12px; grid-template-columns: repeat(auto-fit, minmax(340px, 1fr));">
          ${wsList.length > 0 ? wsList.map(w => `
            <div class="card" style="padding: 14px; display: flex; flex-direction: column; gap: 8px;">
              <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 8px;">
                <div>
                  <span class="badge info" style="font-size: 10px;">${this._escape(w.badge || 'Workstream')}</span>
                  <h3 style="font: 600 15px/1.3 var(--font-sans); margin: 4px 0 2px 0;">${this._escape(w.title)}</h3>
                </div>
                <span class="badge" style="font-size: 11px;">
                  ${w.openPointsCount || 0} open points
                </span>
              </div>
              <div class="sub" style="font-size: 12px; color: var(--foreground);">${this._escape(w.summary)}</div>
              ${(w.keyRules && w.keyRules.length > 0) ? `
                <div style="margin-top: 4px; padding-top: 6px; border-top: 1px solid var(--border);">
                  <div style="font-size: 11px; font-weight: 600; text-transform: uppercase; color: var(--muted-foreground); margin-bottom: 4px;">
                    Key Rules &amp; Directives:
                  </div>
                  <ul style="margin: 0; padding-left: 16px; font-size: 11.5px; color: var(--muted-foreground); display: grid; gap: 3px;">
                    ${w.keyRules.map(r => `<li>${this._escape(r)}</li>`).join('')}
                  </ul>
                </div>
              ` : ''}
              <div style="margin-top: auto; padding-top: 6px; font-size: 11px; color: var(--muted-foreground);">
                Source note: <span style="font-family: var(--font-mono);">${this._escape(w.filename || '')}</span>
              </div>
            </div>
          `).join('') : '<div class="sub">No strategic workstream notes found for this mission.</div>'}
        </div>
      `;
    }

    if (this.currentSubTab === 'decisions') {
      const decList = summary.decisionRegister || summary.decisions || [];
      return `
        <div style="display: flex; flex-direction: column; gap: 10px;">
          <div class="sub" style="font-size: 12px; margin-bottom: 4px;">
            Cumulative decision register across mission notes (${decList.length} total, newest first).
          </div>
          <div style="display: grid; gap: 8px;">
            ${decList.length > 0 ? decList.map(d => `
              <div class="card" style="padding: 10px 12px; display: flex; flex-direction: column; gap: 4px;">
                <div style="display: flex; justify-content: space-between; align-items: baseline; gap: 8px;">
                  <span style="font-family: var(--font-mono); font-size: 11.5px; font-weight: 600; color: var(--ok);">${this._escape(d.date || 'Validated')}</span>
                  ${d.noteTitle ? `<span class="badge" style="font-size: 10px;">${this._escape(d.noteTitle)}</span>` : ''}
                </div>
                <div style="font-size: 13px; font-weight: 500; color: var(--foreground);">${this._escape(d.statement || d.decision)}</div>
                ${d.source ? `<div class="sub" style="font-size: 11px;">Source / Context: ${this._escape(d.source)}</div>` : ''}
              </div>
            `).join('') : '<div class="sub">No validated decisions in notes yet.</div>'}
          </div>
        </div>
      `;
    }

    if (this.currentSubTab === 'actions') {
      let actList = summary.actions || summary.actionMatrix || [];
      if (this.actionStatusFilter === 'open') {
        actList = actList.filter(a => !a.done);
      } else if (this.actionStatusFilter === 'done') {
        actList = actList.filter(a => a.done);
      }
      return `
        <div style="display: flex; flex-direction: column; gap: 10px;">
          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
            <div class="sub" style="font-size: 12px;">
              Read-only view from <span style="font-family: var(--font-mono);">Actions.md</span> (single source of truth).
            </div>
            <div style="display: flex; gap: 6px;">
              <button class="btn sm ${this.actionStatusFilter === 'open' ? 'active' : ''}" data-act-filter="open">Open</button>
              <button class="btn sm ${this.actionStatusFilter === 'done' ? 'active' : ''}" data-act-filter="done">Closed</button>
              <button class="btn sm ${this.actionStatusFilter === 'all' ? 'active' : ''}" data-act-filter="all">All</button>
            </div>
          </div>

          <div style="display: grid; gap: 8px;">
            ${actList.length > 0 ? actList.map(a => `
              <div class="card" style="padding: 10px 12px; display: flex; justify-content: space-between; align-items: flex-start; gap: 12px;">
                <div style="flex: 1;">
                  <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
                    <span class="badge ${a.done ? 'ok' : 'pink'}" style="font-family: var(--font-mono); font-size: 10.5px; font-weight: 600;">
                      ${this._escape(a.id)}
                    </span>
                    <span style="font-size: 12px; font-weight: 600; color: var(--foreground);">${this._escape(a.owner || 'Unassigned')}</span>
                    ${a.ownerOrg ? `<span class="badge" style="font-size: 10px;">${this._escape(a.ownerOrg)}</span>` : ''}
                    ${a.deadline ? `<span class="sub" style="font-size: 11px;">Due: ${this._escape(a.deadline)}</span>` : ''}
                  </div>
                  <div style="font-size: 13px; color: var(--foreground); line-height: 1.4;">${this._escape(a.text || a.description)}</div>
                </div>
                <div>
                  <button class="btn sm" data-copy-action-id="${this._escape(a.id)}" style="font-size: 10.5px; padding: 2px 6px;">
                    Copy ID
                  </button>
                </div>
              </div>
            `).join('') : '<div class="sub">No matching actions.</div>'}
          </div>
        </div>
      `;
    }

    if (this.currentSubTab === 'contacts') {
      const contactList = summary.contacts || [];
      return `
        <div style="display: flex; flex-direction: column; gap: 10px;">
          <div class="sub" style="font-size: 12px; margin-bottom: 4px;">
            Stakeholders &amp; contacts from <span style="font-family: var(--font-mono);">Contacts.md</span>.
          </div>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 8px;">
            ${contactList.length > 0 ? contactList.map(c => `
              <div class="card" style="padding: 10px 12px; display: flex; justify-content: space-between; align-items: center;">
                <div>
                  <div style="font-size: 13px; font-weight: 600;">${this._escape(c.name)}</div>
                  <div class="sub" style="font-size: 11.5px;">${this._escape(c.role || '')}</div>
                  ${c.email ? `<div class="sub" style="font-size: 11px; font-family: var(--font-mono);">${this._escape(c.email)}</div>` : ''}
                </div>
                <div style="text-align: right;">
                  <span class="badge" style="font-size: 10px;">${this._escape(c.org || 'Stakeholder')}</span>
                </div>
              </div>
            `).join('') : '<div class="sub">No contacts recorded in Contacts.md yet.</div>'}
          </div>
        </div>
      `;
    }

    if (this.currentSubTab === 'brief') {
      return `
        <div class="card" style="padding: 16px; display: flex; flex-direction: column; gap: 10px;">
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border); padding-bottom: 8px;">
            <div class="label" style="margin: 0;">Agent Brief &amp; Mission Directives</div>
            <span class="sub" style="font-size: 11px;">Agent brief.md (Read-only)</span>
          </div>
          <div style="font-size: 12.5px; line-height: 1.5; color: var(--foreground); white-space: pre-wrap;">
Mission System of Record:
Every decision, workstream parameter, and open action for this mission is stored directly in durable markdown notes inside the mission repository folder.

Iron Rules:
1. Notes are the single source of truth.
2. Meeting Hub captures raw minutes to _inbox/.
3. Folding folds inbox files into mission notes according to Missions/_fold.md.
4. UI never stores knowledge in browser localStorage or IndexedDB.
          </div>
        </div>
      `;
    }

    return '';
  }

  _bindEvents(data) {
    // 1. Mission switcher dropdown
    const projDropdown = this.container.querySelector('#projectSelectDropdown');
    if (projDropdown) {
      projDropdown.addEventListener('change', (e) => {
        const nextId = e.target.value;
        window.location.hash = '#/p/' + encodeURIComponent(nextId);
      });
    }

    // 2. Delete meeting button on cards
    this.container.querySelectorAll('[data-delete-event]').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const eventId = btn.dataset.deleteEvent;
        if (!eventId) return;
        if (typeof window !== 'undefined' && typeof window.__deleteMeetingWithUndo === 'function') {
          await window.__deleteMeetingWithUndo(eventId);
        } else {
          await this.store.deleteEvent(eventId);
          await this.render();
        }
      });
    });

    // 3. Meeting card clicks -> selects meeting & opens drawer
    this.container.querySelectorAll('[data-event-id]').forEach(card => {
      card.addEventListener('click', (e) => {
        if (e.target.closest('[data-delete-event]')) return;
        const eventId = card.dataset.eventId;
        if (eventId && this.onSelectMeeting) {
          this.onSelectMeeting(eventId);
        }
      });
    });

    // 3b. Drag & Drop on Fold Cards (Phase 5)
    this.container.querySelectorAll('.fold-card[data-event-id]').forEach(card => {
      const eventId = card.dataset.eventId;
      const currentPid = this.currentProjectId;

      card.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.stopPropagation();
        card.style.borderColor = 'var(--pink-600)';
        card.style.background = 'oklch(0.25 0.05 300 / 30%)';
      });

      card.addEventListener('dragleave', (e) => {
        e.preventDefault();
        card.style.borderColor = '';
        card.style.background = '';
      });

      card.addEventListener('drop', async (e) => {
        e.preventDefault();
        e.stopPropagation();
        card.style.borderColor = '';
        card.style.background = '';
        if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
          const file = e.dataTransfer.files[0];
          try {
            const text = await file.text();
            await this.store.sendMinutesToInbox(eventId, currentPid, {
              text,
              title: file.name,
              source: 'drag_and_drop'
            });
            if (typeof window !== 'undefined' && typeof window.showHubToast === 'function') {
              window.showHubToast(`Captured ${file.name} to inbox`);
            }
            await this.render();
          } catch (err) {
            console.error('[ProjectsView] Drop error:', err);
            if (typeof window !== 'undefined' && typeof window.showHubToast === 'function') {
              window.showHubToast(`Capture failed: ${err.message}`);
            }
          }
        }
      });
    });

    // 3. Folded summary strip toggle
    this.container.querySelector('#toggleFoldedStripBtn')?.addEventListener('click', () => {
      this.isFoldedOpen = !this.isFoldedOpen;
      this.render();
    });

    // 4. Knowledge tabs click
    this.container.querySelectorAll('[data-cockpit-tab]').forEach(btn => {
      btn.addEventListener('click', () => {
        const tab = btn.dataset.cockpitTab;
        if (this.currentSubTab === tab) {
          // Toggle close
          this.currentSubTab = null;
          window.location.hash = '#/p/' + encodeURIComponent(this.currentProjectId);
        } else {
          this.currentSubTab = tab;
          window.location.hash = '#/p/' + encodeURIComponent(this.currentProjectId) + '/' + encodeURIComponent(tab);
        }
      });
    });

    // 4b. Close tab button inside tab content
    this.container.querySelectorAll('[data-close-cockpit-tab]').forEach(btn => {
      btn.addEventListener('click', () => {
        this.currentSubTab = null;
        window.location.hash = '#/p/' + encodeURIComponent(this.currentProjectId);
      });
    });

    // 5. Actions filters
    this.container.querySelectorAll('[data-act-filter]').forEach(btn => {
      btn.addEventListener('click', () => {
        this.actionStatusFilter = btn.dataset.actFilter;
        this.render();
      });
    });

    // 6. Copy Action ID button
    this.container.querySelectorAll('[data-copy-action-id]').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const actId = btn.dataset.copyActionId;
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(actId);
        }
        const orig = btn.innerHTML;
        btn.innerHTML = `<span style="display: inline-flex; align-items: center; gap: 4px;">${Icons.check} Copied</span>`;
        alert(`Copied action ID "${actId}" to clipboard.\nEdit Actions.md directly in your editor to modify (notes are the single source of truth).`);
        setTimeout(() => { btn.innerHTML = orig; }, 1200);
      });
    });
  }

  _escape(str) {
    if (!str) return '';
    return String(str).replace(/[&<>"']/g, c => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    }[c]));
  }
}

MeetingHub.ProjectsView = ProjectsView;

/* === Module: views/inbox.js === */
/**
 * Cross-Mission Inbox View (Phase 5: Frictionless Capture)
 * 
 * Aggregates all incoming meeting notes across missions into three distinct groups:
 * 1. Needs a home: Ambiguous captures requiring mission assignment
 * 2. No minutes yet: Past fold-lane meetings across missions with inline drop zones
 * 3. Waiting to fold: Pending inbox files per mission + "Fold now" clipboard action
 */


class InboxView {
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

MeetingHub.InboxView = InboxView;


/* === App Controller & Bootstrap === */
const AppState = {
  date: (typeof getTodayDateStr === 'function') ? getTodayDateStr() : new Date().toISOString().slice(0, 10),
  view: 'mission',
  calendarTab: 'today',
  missionId: null,
  tab: null,
  mode: 'all',
  selectedEventId: null,
  isPanelCollapsed: true
};

let todayView;
let weekView;
let meetingsView;
let actionsView;
let seriesView;
let projectsView;
let inboxView;
let meetingPanel;
let openActionsCount = 0;

function setPanelCollapsed(collapsed) {
  AppState.isPanelCollapsed = Boolean(collapsed);
  const bodyEl = document.querySelector('.body');
  if (bodyEl) {
    if (AppState.isPanelCollapsed) {
      bodyEl.classList.add('collapsed');
    } else {
      bodyEl.classList.remove('collapsed');
    }
  }
  if (shell && typeof shell.updatePanelToggle === 'function') {
    shell.updatePanelToggle(AppState.isPanelCollapsed);
  }
  try {
    localStorage.setItem('mhub_panel_collapsed', AppState.isPanelCollapsed ? 'true' : 'false');
  } catch (e) {}
}

async function resolveDefaultMissionId() {
  try {
    const registry = await MeetingHub.store.getMissionsRegistry();
    const missions = Array.isArray(registry) ? registry : (registry?.missions || []);
    const activeMissions = missions.filter(m => !m.archived && m.status !== 'archived');
    const last = localStorage.getItem('mhub_last_mission');
    if (last && missions.some(m => m.id === last && !m.archived && m.status !== 'archived')) {
      return last;
    }
    if (activeMissions.length > 0) {
      return activeMissions[0].id;
    }
    if (missions.length > 0) {
      return missions[0].id;
    }
  } catch (e) {
    console.warn('[MeetingHub] Could not resolve missions registry:', e);
  }
  return 'ge-enterprise';
}

function selectMeeting(eventId, tab = null) {
  if (tab && meetingPanel) {
    meetingPanel.currentTab = tab;
  }
  AppState.selectedEventId = eventId;
  setPanelCollapsed(false);

  // If already in a mission context, preserve mission in URL
  if (AppState.view === 'mission' && AppState.missionId) {
    const targetHash = '#/p/' + encodeURIComponent(AppState.missionId) + '/m/' + encodeURIComponent(eventId);
    if (window.location.hash !== targetHash) {
      window.location.hash = targetHash;
    } else {
      if (meetingPanel) meetingPanel.setMeeting(eventId, tab);
    }
  } else if (AppState.view === 'calendar') {
    const sub = AppState.calendarTab && AppState.calendarTab !== 'today' ? '/' + AppState.calendarTab : '';
    const targetHash = '#/calendar' + sub + '/m/' + encodeURIComponent(eventId);
    if (window.location.hash !== targetHash) {
      window.location.hash = targetHash;
    } else {
      if (meetingPanel) meetingPanel.setMeeting(eventId, tab);
    }
  } else {
    // Try to match mission for this meeting
    const event = MeetingHub.store.getEvent(eventId);
    const registry = MeetingHub.store.missionsRegistry || { missions: [] };
    const match = (typeof matchMission === 'function')
      ? matchMission(event, registry)
      : (MeetingHub.matchMission ? MeetingHub.matchMission(event, registry) : null);
    if (match && match.missionId) {
      window.location.hash = '#/p/' + encodeURIComponent(match.missionId) + '/m/' + encodeURIComponent(eventId);
    } else {
      window.location.hash = '#/calendar/m/' + encodeURIComponent(eventId);
    }
  }

  if (todayView && AppState.view === 'calendar' && AppState.calendarTab === 'today') todayView.setSelectedEvent(eventId);
  if (weekView && AppState.view === 'calendar' && AppState.calendarTab === 'week') weekView.setSelectedEvent(eventId);
  if (meetingsView && AppState.view === 'calendar' && AppState.calendarTab === 'meetings') meetingsView.setSelectedEvent(eventId);
}

function showDeleteUndoToast(deletedEvent) {
  if (!deletedEvent) return;
  const existing = document.querySelector('#mhubDeleteToast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.id = 'mhubDeleteToast';
  toast.className = 'delete-toast';
  const safeTitle = String(deletedEvent.title || 'Meeting').replace(/[&<>"']/g, '');
  toast.innerHTML =
    '<span>Removed <b>' + safeTitle.slice(0, 38) + '</b></span>' +
    '<button class="btn sm" id="mhubUndoDeleteBtn" style="padding: 2px 8px; font-size: 11.5px;">Undo</button>';
  document.body.appendChild(toast);

  const timer = setTimeout(() => {
    toast.remove();
  }, 6000);

  const undoBtn = toast.querySelector('#mhubUndoDeleteBtn');
  if (undoBtn) {
    undoBtn.addEventListener('click', async () => {
      clearTimeout(timer);
      toast.remove();
      await MeetingHub.store.restoreEvent(deletedEvent);
    });
  }
}

window.__deleteMeetingWithUndo = async function(eventId) {
  if (!eventId || !MeetingHub.store) return;
  const deletedEvent = await MeetingHub.store.deleteEvent(eventId);
  if (AppState.selectedEventId === eventId) {
    AppState.selectedEventId = null;
    setPanelCollapsed(true);
    if (AppState.view === 'mission' && AppState.missionId) {
      window.location.hash = '#/p/' + encodeURIComponent(AppState.missionId);
    } else if (AppState.view === 'calendar') {
      const sub = AppState.calendarTab && AppState.calendarTab !== 'today' ? '/' + AppState.calendarTab : '';
      window.location.hash = '#/calendar' + sub;
    }
  }
  showDeleteUndoToast(deletedEvent);
};

function showHubToast(msg) {
  const existing = document.querySelector('#mhubNoticeToast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.id = 'mhubNoticeToast';
  toast.className = 'delete-toast';
  toast.style.borderColor = 'var(--pink-600)';
  toast.innerHTML = `<span style="font-size: 12.5px; font-weight: 500; display: inline-flex; align-items: center; gap: 6px;">${MeetingHub.Icons?.sparkles || ''} ${String(msg).replace(/[&<>"']/g, '')}</span>`;
  document.body.appendChild(toast);

  setTimeout(() => {
    if (toast.parentNode) toast.remove();
  }, 4000);
}
window.showHubToast = showHubToast;

// Phase 5: Global Paste Anywhere
let pasteToastTimer = null;
let pasteCountdownInterval = null;
let pendingPasteAction = null;

function cancelPendingPaste() {
  if (pasteToastTimer) {
    clearTimeout(pasteToastTimer);
    pasteToastTimer = null;
  }
  if (pasteCountdownInterval) {
    clearInterval(pasteCountdownInterval);
    pasteCountdownInterval = null;
  }
  const toast = document.querySelector('#mhubPasteToast');
  if (toast) toast.remove();
  pendingPasteAction = null;
}

async function executePendingPaste() {
  if (!pendingPasteAction) return;
  const action = pendingPasteAction;
  cancelPendingPaste();

  let finalText = action.text;
  const isDocUrl = action.rawText.trim().startsWith('https://docs.google.com/document/d/');

  if (isDocUrl) {
    try {
      showHubToast('Fetching Google Doc content...');
      const docData = await MeetingHub.store.fetchGoogleDoc(action.rawText.trim());
      if (docData && docData.text) {
        finalText = docData.text;
      }
    } catch (e) {
      console.warn('[PasteAnywhere] Could not fetch Google Doc, using raw text/URL:', e);
    }
  }

  try {
    if (action.targetType === 'meeting' && action.targetEventId) {
      await MeetingHub.store.sendMinutesToInbox(action.targetEventId, action.targetMissionId, {
        text: finalText,
        title: action.targetTitle || 'Pasted minutes',
        source: 'paste_anywhere',
        googleDocUrl: isDocUrl ? action.rawText.trim() : ''
      });
      showHubToast(`Captured minutes to inbox for ${action.targetTitle}`);
    } else {
      await MeetingHub.store.writeUnassignedInboxFile({
        title: action.targetTitle || 'Pasted capture',
        text: finalText,
        source: 'paste_anywhere',
        docUrl: isDocUrl ? action.rawText.trim() : ''
      });
      showHubToast('Captured note to unassigned inbox');
    }
    renderActiveView();
  } catch (err) {
    showHubToast(`Capture failed: ${err.message}`);
  }
}

async function showPasteAnywhereBanner(rawText) {
  cancelPendingPaste();

  const isDocUrl = rawText.trim().startsWith('https://docs.google.com/document/d/');
  const registry = await MeetingHub.store.getMissionsRegistry();
  const missions = Array.isArray(registry) ? registry : (registry?.missions || []);

  let candidateTargets = [];
  let defaultTarget = null;

  // 1. If drawer is open with a selected meeting
  if (AppState.selectedEventId && !AppState.isPanelCollapsed) {
    const evt = MeetingHub.store.getEvent(AppState.selectedEventId);
    if (evt) {
      defaultTarget = {
        type: 'meeting',
        eventId: evt.id,
        missionId: AppState.missionId || 'ge-enterprise',
        title: evt.title || 'Selected meeting'
      };
      candidateTargets.push(defaultTarget);
    }
  }

  // 2. Current mission fold lane meetings
  const activeMid = AppState.missionId || 'ge-enterprise';
  try {
    const currentData = await MeetingHub.store.getMissionHubData(activeMid);
    (currentData?.lanes?.fold || []).forEach(m => {
      const target = {
        type: 'meeting',
        eventId: m.id,
        missionId: activeMid,
        title: `[${activeMid}] ${m.title} (${m.date})`
      };
      if (!candidateTargets.some(c => c.eventId === m.id)) {
        candidateTargets.push(target);
      }
      if (!defaultTarget) {
        defaultTarget = target;
      }
    });
  } catch (e) {}

  // 3. Across all active missions fold lane
  for (const m of missions) {
    if (m.id === activeMid) continue;
    try {
      const data = await MeetingHub.store.getMissionHubData(m.id);
      (data?.lanes?.fold || []).forEach(evt => {
        const target = {
          type: 'meeting',
          eventId: evt.id,
          missionId: m.id,
          title: `[${m.id}] ${evt.title} (${evt.date})`
        };
        if (!candidateTargets.some(c => c.eventId === evt.id)) {
          candidateTargets.push(target);
        }
        if (!defaultTarget) {
          defaultTarget = target;
        }
      });
    } catch (e) {}
  }

  if (!defaultTarget) {
    defaultTarget = {
      type: 'unassigned',
      eventId: null,
      missionId: null,
      title: 'Unassigned (Needs a home)'
    };
  }

  candidateTargets.push({
    type: 'unassigned',
    eventId: null,
    missionId: null,
    title: 'Unassigned (Needs a home)'
  });

  pendingPasteAction = {
    rawText,
    text: rawText,
    targetType: defaultTarget.type,
    targetEventId: defaultTarget.eventId,
    targetMissionId: defaultTarget.missionId,
    targetTitle: defaultTarget.title
  };

  const toast = document.createElement('div');
  toast.id = 'mhubPasteToast';
  toast.className = 'delete-toast';
  toast.style.cssText = 'position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%); z-index: 10000; box-shadow: 0 10px 30px rgba(0,0,0,0.6); border: 1.5px solid var(--pink-600); background: var(--card); border-radius: var(--r-md); padding: 12px 18px; display: flex; align-items: center; gap: 14px; max-width: 90vw; flex-wrap: wrap;';

  toast.innerHTML = `
    <div style="display: flex; align-items: center; gap: 8px;">
      <span class="badge pink" style="font-size: 11px; font-weight: 600;">Paste Anywhere</span>
      <span style="font-size: 12.5px;">Capturing to:</span>
      <select id="mhubPasteTargetSelect" class="in sm" style="font-size: 12px; font-weight: 500; min-width: 220px; max-width: 340px; background: var(--card); color: var(--foreground); border: 1px solid var(--border);">
        ${candidateTargets.map((c, i) => `
          <option value="${i}" style="background: var(--card); color: var(--foreground);" ${c.eventId === defaultTarget.eventId && c.type === defaultTarget.type ? 'selected' : ''}>
            ${String(c.title).slice(0, 42)}
          </option>
        `).join('')}
      </select>
    </div>
    <div style="display: flex; align-items: center; gap: 8px;">
      <span id="mhubPasteCountdown" class="sub" style="font-size: 12px; font-weight: 600; font-family: var(--font-mono); color: var(--pink-400);">8s</span>
      <button class="btn sm" id="mhubPasteConfirmBtn" style="font-weight: 600; padding: 3px 10px;">Confirm</button>
      <button class="btn sm" id="mhubPasteCancelBtn" title="Press Cmd+Z or click to cancel" style="padding: 3px 10px;">Cancel (Cmd+Z)</button>
    </div>
  `;
  document.body.appendChild(toast);

  const selectEl = toast.querySelector('#mhubPasteTargetSelect');
  if (selectEl) {
    selectEl.addEventListener('change', (e) => {
      const idx = parseInt(e.target.value, 10);
      const chosen = candidateTargets[idx];
      if (chosen && pendingPasteAction) {
        pendingPasteAction.targetType = chosen.type;
        pendingPasteAction.targetEventId = chosen.eventId;
        pendingPasteAction.targetMissionId = chosen.missionId;
        pendingPasteAction.targetTitle = chosen.title;
      }
    });
  }

  const confirmBtn = toast.querySelector('#mhubPasteConfirmBtn');
  if (confirmBtn) {
    confirmBtn.addEventListener('click', () => {
      executePendingPaste();
    });
  }

  const cancelBtn = toast.querySelector('#mhubPasteCancelBtn');
  if (cancelBtn) {
    cancelBtn.addEventListener('click', () => {
      cancelPendingPaste();
      showHubToast('Capture cancelled');
    });
  }

  let remaining = 8;
  const countdownEl = toast.querySelector('#mhubPasteCountdown');

  pasteCountdownInterval = setInterval(() => {
    remaining -= 1;
    if (countdownEl) {
      countdownEl.textContent = `${remaining}s`;
    }
    if (remaining <= 0) {
      clearInterval(pasteCountdownInterval);
      pasteCountdownInterval = null;
      executePendingPaste();
    }
  }, 1000);
}

function initPasteAnywhere() {
  window.addEventListener('paste', async (e) => {
    const activeEl = document.activeElement;
    if (activeEl && (['INPUT', 'TEXTAREA', 'SELECT'].includes(activeEl.tagName) || activeEl.isContentEditable)) {
      return; // Normal paste into form element
    }

    const text = e.clipboardData ? e.clipboardData.getData('text') : '';
    if (!text || !text.trim()) return;

    showPasteAnywhereBanner(text);
  });
}

async function refreshSidebarAndRail() {
  if (shell) {
    if (MeetingHub.store) {
      shell.store = MeetingHub.store;
      if (AppState.missionId) {
        shell.activeProjectId = AppState.missionId;
      }
      try {
        const railState = await MeetingHub.store.getRailState();
        shell.setRailState(railState);
      } catch (e) {
        shell.renderSidebar(openActionsCount);
      }
    } else {
      shell.renderSidebar(openActionsCount);
    }
  }
}

function renderActiveView() {
  const leftCol = document.querySelector('#left');
  if (!leftCol) return;

  shell.currentView = AppState.view;
  if (AppState.missionId) {
    shell.activeProjectId = AppState.missionId;
  }
  refreshSidebarAndRail();

  if (AppState.view === 'mission') {
    const missionName = (typeof MeetingHub.store.getProjectName === 'function' ? MeetingHub.store.getProjectName(AppState.missionId) : AppState.missionId) || AppState.missionId;
    const tEl = document.querySelector('#title');
    const sEl = document.querySelector('#subtitle');
    if (tEl) tEl.textContent = missionName;
    if (sEl) sEl.textContent = 'Mission Cockpit & Knowledge Base';

    if (projectsView) {
      projectsView.container = leftCol;
      const mid = AppState.missionId || 'ge-enterprise';
      projectsView.currentProjectId = mid;
      projectsView.currentSubTab = AppState.tab || null;
      projectsView.render(mid);
    }
    return;
  }

  if (AppState.view === 'inbox') {
    const tEl = document.querySelector('#title');
    const sEl = document.querySelector('#subtitle');
    if (tEl) tEl.textContent = 'Cross-Mission Inbox';
    if (sEl) sEl.textContent = 'Incoming meeting minutes & capture stream';
    if (inboxView) {
      inboxView.container = leftCol;
      inboxView.render();
    }
    return;
  }

  if (AppState.view === 'my-actions') {
    const tEl = document.querySelector('#title');
    const sEl = document.querySelector('#subtitle');
    if (tEl) tEl.textContent = 'My Actions';
    if (sEl) sEl.textContent = 'Cross-mission action matrix';
    if (actionsView) {
      actionsView.container = leftCol;
      actionsView.render();
    }
    return;
  }

  if (AppState.view === 'calendar') {
    const todayFormatted = (typeof formatLongDate === 'function') ? formatLongDate(AppState.date) : AppState.date;
    const headerTitles = {
      today: { title: 'Today', sub: todayFormatted },
      week: { title: 'Week', sub: 'Multi-day review & meeting health' },
      meetings: { title: 'Meetings', sub: 'Searchable calendar directory (259 events)' },
      series: { title: 'Series & Links', sub: 'Recurring meeting series & linked lineages' }
    };
    const meta = headerTitles[AppState.calendarTab] || headerTitles.today;
    const tEl = document.querySelector('#title');
    const sEl = document.querySelector('#subtitle');
    if (tEl) tEl.textContent = meta.title;
    if (sEl) sEl.textContent = meta.sub;

    switch (AppState.calendarTab) {
      case 'today':
        if (todayView) {
          todayView.container = leftCol;
          todayView.render();
        }
        break;
      case 'week':
        if (weekView) {
          weekView.container = leftCol;
          weekView.render();
        }
        break;
      case 'meetings':
        if (meetingsView) {
          meetingsView.container = leftCol;
          meetingsView.render();
        }
        break;
      case 'series':
        if (seriesView) {
          seriesView.container = leftCol;
          seriesView.render();
        }
        break;
    }
    return;
  }
}

function showMissionSwitcher() {
  const existingModal = document.querySelector('#missionSwitcherModal');
  if (existingModal) {
    existingModal.remove();
    return;
  }

  const missions = MeetingHub.store.missionsRegistry?.missions || [];
  const activeMissions = missions.filter(m => !m.archived && m.status !== 'archived');
  const archivedMissions = missions.filter(m => m.archived || m.status === 'archived');

  const overlay = document.createElement('div');
  overlay.id = 'missionSwitcherModal';
  overlay.style.cssText = 'position: fixed; inset: 0; background: rgba(0,0,0,0.65); backdrop-filter: blur(4px); z-index: 9999; display: flex; align-items: flex-start; justify-content: center; padding-top: 15vh;';

  overlay.innerHTML = `
    <div style="background: var(--card); border: 1px solid var(--border); border-radius: var(--r-lg); width: 100%; max-width: 520px; box-shadow: 0 16px 32px rgba(0,0,0,0.5); overflow: hidden; display: flex; flex-direction: column;">
      <div style="padding: 12px 16px; border-bottom: 1px solid var(--border); display: flex; align-items: center; gap: 10px;">
        <span style="font-family: var(--font-mono); font-size: 11px; color: var(--pink-600); font-weight: 600;">SWITCH MISSION</span>
        <input id="missionSearchInput" type="text" placeholder="Type to search active missions..." style="flex: 1; background: transparent; border: none; color: var(--foreground); font-family: var(--font-sans); font-size: 15px; outline: none;" autofocus autocomplete="off" />
        <span style="font-size: 11px; color: var(--muted-foreground); font-family: var(--font-mono);">[Esc] Close</span>
      </div>
      <div id="missionList" style="max-height: 360px; overflow-y: auto; padding: 8px;"></div>
    </div>
  `;

  document.body.appendChild(overlay);

  const searchInput = overlay.querySelector('#missionSearchInput');
  const listContainer = overlay.querySelector('#missionList');
  let selectedIndex = 0;
  let filteredMissions = [...activeMissions, ...archivedMissions];

  function renderList() {
    if (filteredMissions.length === 0) {
      listContainer.innerHTML = '<div style="padding: 16px; text-align: center; color: var(--muted-foreground); font-size: 13px;">No matching mission found.</div>';
      return;
    }
    listContainer.innerHTML = filteredMissions.map((m, idx) => {
      const isSelected = idx === selectedIndex;
      const isArchived = m.archived || m.status === 'archived';
      const numLabel = idx < 9 && !isArchived ? `<span style="font-family: var(--font-mono); font-size: 11px; background: var(--secondary); padding: 2px 6px; border-radius: 4px; margin-right: 8px; color: var(--muted-foreground);">${idx + 1}</span>` : '';
      return `
        <div class="mission-item" data-id="${m.id}" style="display: flex; align-items: center; justify-content: space-between; padding: 10px 12px; border-radius: var(--r-md); cursor: pointer; background: ${isSelected ? 'var(--secondary)' : 'transparent'}; border: 1px solid ${isSelected ? 'var(--pink-600)' : 'transparent'};">
          <div style="display: flex; align-items: center;">
            ${numLabel}
            <div>
              <div style="font-weight: 600; font-size: 14px; color: ${isSelected ? 'var(--foreground)' : 'var(--card-foreground)'};">${m.name}</div>
              <div class="sub" style="font-size: 11px;">${m.client || 'Artefact'} · ${m.directory}</div>
            </div>
          </div>
          <div>
            ${isArchived ? '<span class="badge sub" style="font-size: 10px;">Archived</span>' : '<span class="badge ok" style="font-size: 10px;">Active</span>'}
          </div>
        </div>
      `;
    }).join('');

    listContainer.querySelectorAll('.mission-item').forEach((item) => {
      item.addEventListener('click', () => {
        const id = item.dataset.id;
        overlay.remove();
        window.location.hash = '#/p/' + encodeURIComponent(id);
      });
    });
  }

  function filter(query) {
    const q = query.toLowerCase().trim();
    if (!q) {
      filteredMissions = [...activeMissions, ...archivedMissions];
    } else {
      filteredMissions = [...activeMissions, ...archivedMissions].filter(m => {
        const text = `${m.name} ${m.id} ${m.directory} ${(m.clientMatch || []).join(' ')}`.toLowerCase();
        return text.includes(q);
      });
    }
    selectedIndex = 0;
    renderList();
  }

  renderList();
  setTimeout(() => searchInput.focus(), 30);

  searchInput.addEventListener('input', (e) => filter(e.target.value));

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) overlay.remove();
  });

  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      overlay.remove();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      selectedIndex = Math.min(filteredMissions.length - 1, selectedIndex + 1);
      renderList();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      selectedIndex = Math.max(0, selectedIndex - 1);
      renderList();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const picked = filteredMissions[selectedIndex];
      if (picked) {
        overlay.remove();
        window.location.hash = '#/p/' + encodeURIComponent(picked.id);
      }
    }
  });
}

// Instantiate App Shell
const shell = new MeetingHub.ShellUI({
  store: MeetingHub.store,
  onTogglePanel: () => {
    setPanelCollapsed(!AppState.isPanelCollapsed);
  },
  onNavigate: (viewName) => {
    AppState.view = viewName;
    if (viewName === 'today') {
      window.location.hash = AppState.selectedEventId ? '#/meeting/' + encodeURIComponent(AppState.selectedEventId) : '#/today';
    } else {
      window.location.hash = '#/' + viewName;
    }
    renderActiveView();
  },
  onProjectChange: (projectId) => {
    window.location.hash = '#/p/' + encodeURIComponent(projectId);
  },
  onConfirmSuggestedProject: async (suggestion) => {
    const p = await MeetingHub.store.confirmSuggestedProject(suggestion);
    MeetingHub.store.setActiveProjectId(p.id);
    const all = await MeetingHub.store.getAllProjects();
    const sug = await MeetingHub.store.getSuggestedProjects();
    shell.setProjects(all, p.id, sug);
    if (projectsView) projectsView.setProject(p.id);
    renderActiveView();
  },
  onCreateProject: async () => {
    const name = prompt('Enter new project name:');
    if (name && name.trim()) {
      const tag = prompt('Enter primary client or meeting tag to match events:', name.trim()) || name.trim();
      const p = await MeetingHub.store.confirmSuggestedProject({ name: name.trim(), clientMatch: [tag.trim()] });
      MeetingHub.store.setActiveProjectId(p.id);
      const all = await MeetingHub.store.getAllProjects();
      const sug = await MeetingHub.store.getSuggestedProjects();
      shell.setProjects(all, p.id, sug);
      if (projectsView) projectsView.setProject(p.id);
      renderActiveView();
    }
  },
  onModeChange: (newMode) => {
    AppState.mode = newMode;
    if (todayView) todayView.setMode(newMode);
    if (weekView) weekView.setMode(newMode);
    if (meetingsView) meetingsView.setMode(newMode);
  },
  onTodayClick: () => {
    const today = (typeof getTodayDateStr === 'function') ? getTodayDateStr() : new Date().toISOString().slice(0, 10);
    AppState.date = today;
    if (todayView) todayView.setDate(today);
    if (weekView) weekView.goToday();
    if (AppState.view !== 'today' && AppState.view !== 'week') {
      AppState.view = 'today';
      window.location.hash = '#/today';
      renderActiveView();
    }
  },
  onSearch: (query) => {
    if (AppState.view === 'mission' && projectsView) projectsView.setSearchQuery(query);
    if (AppState.view === 'today' && todayView) todayView.setSearchQuery(query);
    if (AppState.view === 'meetings' && meetingsView) meetingsView.setSearchQuery(query);
    if (AppState.view === 'actions' && actionsView) actionsView.setSearchQuery(query);
    if (AppState.view === 'series' && seriesView) seriesView.setSearchQuery(query);
    if (AppState.view === 'projects' && projectsView) projectsView.setSearchQuery(query);
  },
  onNewMeeting: () => {
    const title = prompt('Enter meeting title:');
    if (title && title.trim()) {
      const newId = 'custom-' + Date.now();
      MeetingHub.store.db.put('events', {
        id: newId,
        title: title.trim(),
        date: AppState.date,
        start: '10:00',
        end: '10:45',
        durationMin: 45,
        stream: AppState.mode === 'life' ? 'life' : 'work',
        client: 'Artefact',
        series: '',
        attendees: ['Ayrton A.'],
        tags: [],
        link: '',
        isAllDay: false,
        isTraining: false
      }).then(async () => {
        await MeetingHub.store.refreshCache();
        selectMeeting(newId);
      });
    }
  },
  onSyncTrigger: async () => {
    shell.setSyncing(true);
    try {
      await MeetingHub.CalendarSyncService.syncAll(MeetingHub.store.db, MeetingHub.store);
      const status = await MeetingHub.CalendarSyncService.getSyncStatus(MeetingHub.store.db);
      shell.setSyncStatus(status);
    } catch (err) {
      console.error('[MeetingHub] Sync error:', err);
    } finally {
      shell.setSyncing(false);
    }
  },
  getStorageEngine: () => MeetingHub.store ? MeetingHub.store.getStorageEngineName() : 'IndexedDB',
  onExportData: async () => {
    try {
      const json = await MeetingHub.store.exportUserDataJson();
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'meeting_hub_data_' + new Date().toISOString().slice(0, 10) + '.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('[MeetingHub] Export failed:', err);
    }
  },
  onImportData: async (jsonString) => {
    try {
      const res = await MeetingHub.store.importUserDataJson(jsonString);
      await MeetingHub.store.refreshCache();
      openActionsCount = await MeetingHub.store.getOpenActionsCount();
      shell.updateActionsBadge(openActionsCount);
      shell.renderSidebar(openActionsCount);
      renderActiveView();
      if (meetingPanel && AppState.selectedEventId) {
        meetingPanel.render();
      }
    } catch (err) {
      console.error('[MeetingHub] Import failed:', err);
    }
  }
});

function handleHashRoute() {
  const hash = window.location.hash || '';
  const parsed = (typeof parseRoute === 'function')
    ? parseRoute(hash)
    : (MeetingHub.parseRoute ? MeetingHub.parseRoute(hash) : { view: 'root' });

  // Handle legacy redirects
  if (parsed.isLegacy && parsed.redirectTo) {
    window.location.hash = parsed.redirectTo;
    return;
  }

  // Handle root route (#/ or empty)
  if (parsed.view === 'root') {
    resolveDefaultMissionId().then((defaultMissionId) => {
      window.location.hash = '#/p/' + encodeURIComponent(defaultMissionId);
    });
    return;
  }

  // Handle legacy meeting route: #/meeting/:eventId
  if (parsed.view === 'legacy-meeting' && parsed.eventId) {
    const event = MeetingHub.store.getEvent(parsed.eventId);
    const registryPromise = MeetingHub.store.missionsRegistry
      ? Promise.resolve(MeetingHub.store.missionsRegistry)
      : MeetingHub.store.getMissionsRegistry();
    registryPromise.then((registry) => {
      const match = (typeof matchMission === 'function')
        ? matchMission(event, registry)
        : (MeetingHub.matchMission ? MeetingHub.matchMission(event, registry) : null);
      if (match && match.missionId) {
        window.location.hash = '#/p/' + encodeURIComponent(match.missionId) + '/m/' + encodeURIComponent(parsed.eventId);
      } else {
        window.location.hash = '#/calendar/m/' + encodeURIComponent(parsed.eventId);
      }
    });
    return;
  }

  // Handle mission route: #/p/:missionId[/m/:eventId or /:tab]
  if (parsed.view === 'mission') {
    AppState.view = 'mission';
    AppState.missionId = parsed.missionId;
    AppState.tab = parsed.tab;
    try {
      localStorage.setItem('mhub_last_mission', parsed.missionId);
    } catch (e) {}

    const activePid = MeetingHub.store.getActiveProjectId();
    if (activePid !== parsed.missionId) {
      MeetingHub.store.setActiveProjectId(parsed.missionId);
    }
    if (shell && typeof shell.setActiveProjectId === 'function') {
      shell.setActiveProjectId(parsed.missionId);
    }

    if (parsed.eventId) {
      AppState.selectedEventId = parsed.eventId;
      setPanelCollapsed(false);
      if (meetingPanel) meetingPanel.setMeeting(parsed.eventId);
    } else {
      AppState.selectedEventId = null;
      setPanelCollapsed(true);
      if (meetingPanel) meetingPanel.setMeeting(null);
    }

    if (projectsView) {
      projectsView.currentProjectId = parsed.missionId;
      projectsView.currentSubTab = parsed.tab || null;
    }
    renderActiveView();
    return;
  }

  // Handle inbox route: #/inbox
  if (parsed.view === 'inbox') {
    AppState.view = 'inbox';
    AppState.selectedEventId = null;
    setPanelCollapsed(true);
    if (meetingPanel) meetingPanel.setMeeting(null);
    renderActiveView();
    return;
  }

  // Handle my-actions route: #/my-actions
  if (parsed.view === 'my-actions') {
    AppState.view = 'my-actions';
    AppState.selectedEventId = null;
    setPanelCollapsed(true);
    if (meetingPanel) meetingPanel.setMeeting(null);
    renderActiveView();
    return;
  }

  // Handle calendar route: #/calendar[/:tab][/m/:eventId]
  if (parsed.view === 'calendar') {
    AppState.view = 'calendar';
    AppState.calendarTab = parsed.tab || 'today';

    if (parsed.eventId) {
      AppState.selectedEventId = parsed.eventId;
      setPanelCollapsed(false);
      if (meetingPanel) meetingPanel.setMeeting(parsed.eventId);
      if (todayView && AppState.calendarTab === 'today') todayView.setSelectedEvent(parsed.eventId);
      if (weekView && AppState.calendarTab === 'week') weekView.setSelectedEvent(parsed.eventId);
      if (meetingsView && AppState.calendarTab === 'meetings') meetingsView.setSelectedEvent(parsed.eventId);
    } else {
      AppState.selectedEventId = null;
      if (meetingPanel) meetingPanel.setMeeting(null);
      if (todayView) todayView.setSelectedEvent(null);
      if (weekView) weekView.setSelectedEvent(null);
      if (meetingsView) meetingsView.setSelectedEvent(null);
    }
    renderActiveView();
    return;
  }
}

// Global Keyboard Navigation (j, k, a, /, Escape, \, g p, g i, g c, 1-9)
let lastLeaderKey = '';
let leaderTimeout = null;

window.addEventListener('keydown', (e) => {
  const activeEl = document.activeElement;
  const isInputActive = activeEl && (
    activeEl.tagName === 'INPUT' ||
    activeEl.tagName === 'TEXTAREA' ||
    activeEl.tagName === 'SELECT' ||
    activeEl.isContentEditable
  );

  // Cmd+Z or Ctrl+Z -> cancel pending paste action
  if ((e.metaKey || e.ctrlKey) && (e.key === 'z' || e.key === 'Z') && !e.shiftKey) {
    if (pendingPasteAction) {
      e.preventDefault();
      cancelPendingPaste();
      showHubToast('Capture cancelled (Cmd+Z)');
      return;
    }
  }

  // Esc order: blur input -> close drawer -> go back from tab to stream
  if (e.key === 'Escape') {
    if (isInputActive) {
      const isSearch = activeEl.id === 'quickSearch';
      activeEl.blur();
      if (isSearch) {
        activeEl.value = '';
        if (AppState.view === 'today' && todayView) todayView.setSearchQuery('');
        if (AppState.view === 'meetings' && meetingsView) meetingsView.setSearchQuery('');
        if (AppState.view === 'actions' && actionsView) actionsView.setSearchQuery('');
        if (AppState.view === 'series' && seriesView) seriesView.setSearchQuery('');
      }
      return;
    }
    if (!AppState.isPanelCollapsed) {
      setPanelCollapsed(true);
      if (AppState.view === 'mission' && AppState.missionId) {
        window.location.hash = '#/p/' + encodeURIComponent(AppState.missionId);
      } else if (AppState.view === 'calendar') {
        const sub = AppState.calendarTab && AppState.calendarTab !== 'today' ? '/' + AppState.calendarTab : '';
        window.location.hash = '#/calendar' + sub;
      }
      return;
    }
    if (AppState.view === 'mission' && (AppState.tab || (projectsView && projectsView.currentSubTab))) {
      AppState.tab = null;
      if (projectsView) projectsView.currentSubTab = null;
      window.location.hash = '#/p/' + encodeURIComponent(AppState.missionId);
      return;
    }
    return;
  }

  // Single-letter and sequence shortcuts only fire when not typing in editable fields
  if (isInputActive) return;

  // Leader sequence: g p, g i, g c
  if (lastLeaderKey === 'g') {
    lastLeaderKey = '';
    clearTimeout(leaderTimeout);
    if (e.key === 'p' || e.key === 'P') {
      e.preventDefault();
      showMissionSwitcher();
      return;
    }
    if (e.key === 'i' || e.key === 'I') {
      e.preventDefault();
      window.location.hash = '#/inbox';
      return;
    }
    if (e.key === 'c' || e.key === 'C') {
      e.preventDefault();
      window.location.hash = '#/calendar';
      return;
    }
  }

  if (e.key === 'g' || e.key === 'G') {
    lastLeaderKey = 'g';
    clearTimeout(leaderTimeout);
    leaderTimeout = setTimeout(() => { lastLeaderKey = ''; }, 1000);
    return;
  }

  // 1-9 jump to Nth active mission in rail
  if (e.key >= '1' && e.key <= '9' && !e.ctrlKey && !e.metaKey && !e.altKey) {
    const idx = parseInt(e.key, 10) - 1;
    const missions = MeetingHub.store.missionsRegistry?.missions || [];
    const activeMissions = missions.filter(m => !m.archived && m.status !== 'archived');
    if (activeMissions[idx]) {
      e.preventDefault();
      window.location.hash = '#/p/' + encodeURIComponent(activeMissions[idx].id);
      return;
    }
  }

  // '\\' -> toggle right meeting panel
  if (e.key === '\\') {
    e.preventDefault();
    setPanelCollapsed(!AppState.isPanelCollapsed);
    return;
  }

  // 'j' or ArrowDown -> next meeting (in stream or calendar)
  if (e.key === 'j' || e.key === 'ArrowDown') {
    e.preventDefault();
    if (AppState.view === 'mission') {
      if (projectsView && typeof projectsView.selectNextMeeting === 'function') {
        projectsView.selectNextMeeting();
      }
    } else if (todayView && AppState.view === 'calendar' && AppState.calendarTab === 'today') {
      todayView.selectNextMeeting();
    }
    return;
  }

  // 'k' or ArrowUp -> previous meeting (in stream or calendar)
  if (e.key === 'k' || e.key === 'ArrowUp') {
    e.preventDefault();
    if (AppState.view === 'mission') {
      if (projectsView && typeof projectsView.selectPreviousMeeting === 'function') {
        projectsView.selectPreviousMeeting();
      }
    } else if (todayView && AppState.view === 'calendar' && AppState.calendarTab === 'today') {
      todayView.selectPreviousMeeting();
    }
    return;
  }

  // 'a' -> focus action input
  if (e.key === 'a' || e.key === 'A') {
    e.preventDefault();
    if (!AppState.selectedEventId) {
      const list = todayView ? todayView.getVisibleTimedEvents() : [];
      if (list.length > 0) {
        selectMeeting(list[0].id);
        setTimeout(() => meetingPanel && meetingPanel.focusActionInput(), 80);
      }
    } else {
      if (meetingPanel) meetingPanel.focusActionInput();
    }
    return;
  }

  // '/' -> quick search
  if (e.key === '/') {
    e.preventDefault();
    const searchInput = document.querySelector('#quickSearch');
    if (searchInput) {
      searchInput.focus();
      searchInput.select();
    }
    return;
  }
});

window.addEventListener('hashchange', handleHashRoute);

async function bootstrap() {
  const leftCol = document.querySelector('#left');
  try {
    console.log('[MeetingHub] Initializing data layer...');
    
    // Safety check on store
    await MeetingHub.store.init();
    
    openActionsCount = await MeetingHub.store.getOpenActionsCount();
    shell.store = MeetingHub.store;
    await refreshSidebarAndRail();
    const initialTodaySub = (typeof formatLongDate === 'function') ? formatLongDate(AppState.date) : AppState.date;
    shell.renderHeader('Today', initialTodaySub);

    // Retrieve & render initial sync status in sidebar
    try {
      const initialSyncStatus = await MeetingHub.CalendarSyncService.getSyncStatus(MeetingHub.store.db);
      shell.setSyncStatus(initialSyncStatus);
    } catch (e) {
      console.warn('[MeetingHub] Could not load sync status:', e);
    }

    // Refresh sync status relative times every 60s
    setInterval(async () => {
      try {
        const s = await MeetingHub.CalendarSyncService.getSyncStatus(MeetingHub.store.db);
        shell.setSyncStatus(s);
      } catch (e) {}
    }, 60000);

    // Initialize projects in shell
    const allProjects = await MeetingHub.store.getAllProjects();
    const suggestedProjects = await MeetingHub.store.getSuggestedProjects();
    const activeProjectId = MeetingHub.store.getActiveProjectId() || (allProjects[0] && allProjects[0].id) || 'ge-enterprise';
    shell.setProjects(allProjects, activeProjectId, suggestedProjects);

    todayView = new MeetingHub.TodayView({
      container: leftCol,
      store: MeetingHub.store,
      onSelectMeeting: (eventId, tab = null) => selectMeeting(eventId, tab),
      onNavigateProject: (projectId) => {
        AppState.view = 'projects';
        if (projectsView) projectsView.setProject(projectId);
        window.location.hash = '#/projects';
        renderActiveView();
      }
    });

    weekView = new MeetingHub.WeekView({
      container: leftCol,
      store: MeetingHub.store,
      onSelectMeeting: (eventId, tab = null) => selectMeeting(eventId, tab)
    });

    meetingsView = new MeetingHub.MeetingsView({
      container: leftCol,
      store: MeetingHub.store,
      onSelectMeeting: (eventId, tab = null) => selectMeeting(eventId, tab)
    });

    actionsView = new MeetingHub.ActionsView({
      container: leftCol,
      store: MeetingHub.store,
      onSelectMeeting: (eventId, tab = null) => selectMeeting(eventId, tab)
    });

    seriesView = new MeetingHub.SeriesView({
      container: leftCol,
      store: MeetingHub.store,
      onSelectMeeting: (eventId, tab = null) => selectMeeting(eventId, tab)
    });

    projectsView = new MeetingHub.ProjectsView({
      container: leftCol,
      store: MeetingHub.store,
      onSelectMeeting: (eventId, tab = null) => selectMeeting(eventId, tab)
    });

    inboxView = new MeetingHub.InboxView({
      container: leftCol,
      store: MeetingHub.store,
      onSelectMeeting: (eventId, missionId = null) => {
        if (missionId) {
          AppState.missionId = missionId;
          shell.activeProjectId = missionId;
        }
        selectMeeting(eventId);
      },
      onNavigateMission: (missionId) => {
        window.location.hash = '#/p/' + encodeURIComponent(missionId);
      }
    });

    initPasteAnywhere();

    meetingPanel = new MeetingHub.MeetingPanelUI({
      container: document.querySelector('#right'),
      store: MeetingHub.store,
      onOpenMeeting: (relatedEventId) => {
        selectMeeting(relatedEventId);
      },
      onClose: () => {
        setPanelCollapsed(true);
        if (AppState.view === 'mission' && AppState.missionId) {
          window.location.hash = '#/p/' + encodeURIComponent(AppState.missionId);
        } else if (AppState.view === 'calendar') {
          const sub = AppState.calendarTab && AppState.calendarTab !== 'today' ? '/' + AppState.calendarTab : '';
          window.location.hash = '#/calendar' + sub;
        } else {
          window.location.hash = AppState.view === 'today' ? '#/today' : '#/' + AppState.view;
        }
      },
      onCollapse: () => {
        setPanelCollapsed(true);
      }
    });

    const expandTab = document.querySelector('#expandPanelTab');
    if (expandTab) {
      expandTab.addEventListener('click', () => setPanelCollapsed(false));
    }

    // Subscribe to store updates
    MeetingHub.store.subscribe(async (payload) => {
      openActionsCount = await MeetingHub.store.getOpenActionsCount();
      shell.updateActionsBadge(openActionsCount);
      await refreshSidebarAndRail();
      if (payload.type === 'project_updated' || payload.type === 'project_deleted' || payload.type === 'active_project_changed') {
        const all = await MeetingHub.store.getAllProjects();
        const sug = await MeetingHub.store.getSuggestedProjects();
        shell.setProjects(all, MeetingHub.store.getActiveProjectId(), sug);
      }
      if (
        payload.type === 'meeting_data_updated' ||
        payload.type === 'sync_completed' ||
        payload.type === 'project_updated' ||
        payload.type === 'event_deleted' ||
        payload.type === 'event_restored' ||
        payload.type === 'action_toggled' ||
        payload.type === 'inbox_updated'
      ) {
        renderActiveView();
        if (meetingPanel && AppState.selectedEventId) {
          meetingPanel.render();
        }
      }
    });

    try {
      const storedCollapsed = localStorage.getItem('mhub_panel_collapsed');
      if (storedCollapsed === 'true' && !window.location.hash.startsWith('#/meeting/')) {
        setPanelCollapsed(true);
      }
    } catch (e) {}

    // Handle initial route
    handleHashRoute();

    const activeEngine = MeetingHub.store.db.engineName || 'IndexedDB';
    const initialEventsList = await MeetingHub.store.getAllEvents();
    console.log('[MeetingHub] Ready. ' + initialEventsList.length + ' events loaded via ' + activeEngine + '.');

    // Non-blocking background sync pass to pull fresh calendar changes from backend
    setTimeout(async () => {
      try {
        await MeetingHub.CalendarSyncService.syncAll(MeetingHub.store.db, MeetingHub.store);
        const freshStatus = await MeetingHub.CalendarSyncService.getSyncStatus(MeetingHub.store.db);
        shell.setSyncStatus(freshStatus);
      } catch (e) {
        // Silent background sync fail
      }
    }, 600);
  } catch (err) {
    console.error('[MeetingHub] Initialization error:', err);
    if (leftCol) {
      leftCol.innerHTML = '<div class="card" style="border-color: var(--destructive); margin-top: 20px;">' +
        '<div class="label" style="color: var(--destructive);">Data Layer Error</div>' +
        '<h2 style="margin: 8px 0;">Initialization Failed</h2>' +
        '<p class="sub">' + err.message + '</p>' +
        '<div style="margin-top: 12px; display: flex; gap: 8px;">' +
        '<button class="btn sm" onclick="localStorage.clear(); indexedDB.deleteDatabase(\'MeetingHubDB\'); location.reload();">Reset Storage & Retry</button>' +
        '</div></div>';
    }
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootstrap);
} else {
  bootstrap();
}

})(window, document);
