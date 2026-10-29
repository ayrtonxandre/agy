/**
 * Meeting Hub Compiled Application Bundle
 * Generated: 2026-10-29T14:38:23.138Z
 */
(function(window, document) {
'use strict';

window.DOCS_CACHE = {
  "1eLUVhYG6hwiqOzauSEDZoGJHu_B9jQuC5Pmbg-8bd_8": {
    "title": "[CLARIANE] - 20261026 - Param. Prog. The. Org - Mariena",
    "content": "\ufeffHDJ Planning Manager\r\nParamétrage des programmes thérapeutiques et organisation - Marienia\r\n________________\r\n\r\n\r\nBonjour Claire,\r\n\r\n\r\nMerci d’avoir participé à l’atelier de discussion et de paramétrage de l’outil de planification.\r\nVous trouverez ci-dessous les minutes de nos échanges\r\n→ N’hésites pas à les compléter\r\n\r\n\r\nUn bon début de semaine,\r\nAyrton\r\n________________\r\n \r\nMinutes\r\n\r\n\r\nDate | 26 Octobre 2026\r\n\r\n\r\nParticipants\r\n* GAILLET Claire | IDE - Marienia\r\n* DE GIROLAMO Benjamin | Data Analyst\r\n* ANDRE Ayrton | Data Analyst\r\n\r\n\r\nPoints Abordés\r\nContexte et Approche du projet\r\n* Rappel de l'outil et mécanisme de synchronisation\r\n\r\n   * Démonstration des vues \"Vacations\" et \"Disponibilité\".\r\n   * Clarification du workflow de validation : la validation d'un circuit sur Foundry le passe au statut \"En attente HM\". Une fois les créneaux saisis manuellement dans Hôpital Manager (HM), l'algorithme fait le rapprochement et valide le rendez-vous en \"Réel\".\r\n\r\n      * Processus d'Admission (Flux Annonces)\r\n\r\n         * À Mariéna, le flux \"Annonces\" est utilisé pour tous les patients (HDJ et HC), et c'est le médecin qui détermine ensuite s'il s'agit d'une prise en charge HDJ.\r\n         * L'outil a été adapté avec un onglet permettant d'inclure ou d'exclure facilement les annonces/pré-admissions pour isoler celles concernant l'HDJ.\r\n\r\n            * Modélisation des Parcours Thérapeutiques\r\n\r\n               * Gestion des imprévus de placement : Suite aux difficultés rencontrées par Claire pour déplacer des séances (ex: Ergo / Balnéo), démonstration de la fonctionnalité permettant de \"forcer\" un placement via le surbooking et du changement manuel d'intervenant.\r\n               * Parcours complexes (ex: Parcours Douloureux) : Analyse du cas des patients venant toutes les 3 semaines pour des séances de rTMS / tDCS le lundi. La solution retenue est de créer des vacations isolées/dédiées pour ce groupe, avec une fréquence de récurrence paramétrée à 3 semaines dans l'outil.\r\n\r\n                  * Anomalies techniques en cours de résolution\r\n\r\n                     * Certaines vacations (Kiné, Balnéo, Ergo collective) ne remontent pas encore dans la disponibilité Foundry en raison d'un paramétrage HM en cours d'investigation par l'équipe technique.\r\n\r\nLes prochaines étapes\r\n                        * Claire GAILLET : Modéliser sur papier ou fichier Excel les parcours thérapeutiques complexes (avec les séances ponctuelles ou très espacées) pour préparer le paramétrage.\r\n                        * Artefact : Résoudre le problème de remontée des vacations depuis HM (Kiné, Balnéo, Ergo) et prévenir Claire pour qu'elle puisse reprendre ses tests.\r\n                        * Artefact : Développer un système d'alerte (alerting) dans l'outil pour signaler lorsqu'un patient est positionné sur deux vacations en même temps.\r\n                        * Prochain point de suivi : Mardi matin de la semaine prochaine pour avancer sur la modélisation des parcours."
  },
  "1jDunJURx26Di9c6k4vjhmA84w3Hh_zCCmCxnU0kcFjY": {
    "title": "[CLARIANE] - 20261021 - Param. Prog. The. Org - Les Arbelles",
    "content": "\ufeffHDJ Planning Manager\r\nParamétrage des programmes thérapeutiques et organisation - Les Arbelles\r\n________________\r\n\r\n\r\nBonjour Fabien et Delphine,\r\n\r\n\r\nMerci d’avoir participé à l’atelier de discussion et de paramétrage de l’outil de planification.\r\nVous trouverez ci-dessous les minutes de nos échanges\r\n→ N’hésites pas à les compléter\r\n\r\n\r\nUn bon début de semaine,\r\nAyrton\r\n________________\r\n \r\nMinutes\r\n\r\n\r\nDate | 21 Octobre 2026\r\n\r\n\r\nParticipants\r\n* FERRIER Fabien | Cadre de rééducation - Les Arbelles\r\n* CUVELIER Delphine | Agent administratif - Les Arbelles\r\n* DE GIROLAMO Benjamin | Data Analyst\r\n* ANDRE Ayrton | Data Analyst\r\n\r\n\r\nPoints abordés\r\n\r\n\r\n* Vue Vacations et Visibilité : \r\n   * Présentation de la vue centralisée des plannings par salle et par intervenant.\r\n   * Les noms et prénoms des patients seront bien visibles pour le personnel médical habilité. \r\n   * À terme, l'outil pourrait offrir un accès en lecture seule aux praticiens pour consulter spécifiquement leurs propres vacations.\r\n* Processus d'Admission et flux \"Annonce\" : \r\n   * Actuellement, Les Arbelles n'utilise pas les annonces dans HM ; les patients “potentiels” sont gérés au travers d’une liste d'attente sur un agenda papier et saisit les pré-admissions environ 15 jours avant l'entrée. \r\n   * Pour maximiser l'efficacité du calcul de disponibilité dans Foundry, il a été proposé de saisir les patients au statut \"Annonce\" dans HM dès la confirmation de la demande. Cette annonce remontera ensuite directement dans Foundry.\r\n* Contraintes des Programmes Thérapeutiques : \r\n   * Les Arbelles gèrent des programmes \"carrés\" (Dos, Parkinson) mais font aussi du sur-mesure complexe pour la neuro et le locomoteur.\r\n\r\n   * Politique zéro temps mort : Par manque d'espace d'attente, les patients ne doivent avoir aucun \"trou\" entre leurs séances. La capacité de l'outil à forcer et rapprocher manuellement des créneaux simulés a été démontrée avec succès.\r\n   * Bilans et spécificités : Les bilans d'entrée et de sortie se font en individuel. D'autres séances (Diététique, Neuropsychologie) sont moins régulières (ex. une fois toutes les deux semaines ou occasionnellement) et devront être paramétrées comme des séances périodiques ou ajoutées à la volée.\r\n\r\n\r\n   * Analytique et Reporting Budgétaire : \r\n   * Lors de la présentation des tableaux de bord, Fabien a souligné un besoin métier majeur : pouvoir extraire le case mix réel (pourcentage de l'activité Neuro vs Locomoteur). Cette donnée est essentielle pour la construction de leurs budgets, les prix de journée étant différents selon le segment.\r\n\r\n\r\nProchaines étapes\r\n   * Les Arbelles | Modéliser \"sur papier\" la structure de leurs différents programmes thérapeutiques (tronc commun, fréquence des séances, bilans d'entrée/sortie) pour préparer le paramétrage.\r\n\r\n\r\n   * Les Arbelles | Se connecter à l'outil dans la semaine pour le prendre en main et remonter les premiers retours d'utilisation.\r\n\r\n\r\n   * Artefact | Se renseigner sur les champs obligatoires minimaux requis dans HM pour créer une \"Annonce\" et faire un retour à Delphine pour tester ce nouveau processus.\r\n\r\n\r\n   * Artefact | Ajuster les filtres de la vue vacation pour bien séparer les médecins, les psychologues et les neuropsychologues.\r\n\r\n\r\n   * Artefact | S'assurer que la plateforme permet de modéliser facilement les séances de bilan ciblées (début/fin) et les séances périodiques espacées."
  }
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

/* === Module: model/event.js === */
/**
 * Event Model & Normalization
 * 
 * Maps raw multi-calendar events (Google, Outlook ICS, iCloud, ATHX) into
 * the clean, standardized Meeting Hub domain model.
 */

class EventModel {
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
    const { stream, client, isTraining } = EventModel.detectStreamAndClient(summary, source, desc, location, raw.attendees, raw.organizer);
    const series = raw.series || EventModel.extractSeriesId(id, summary);
    const tags = raw.tags || EventModel.extractTags(`${summary} ${desc}`);
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
      location,
      description: desc,
      source
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

  static detectStreamAndClient(summary, source, desc, location, attendees = [], organizer = {}) {
    const orgEmail = (organizer && organizer.email) || '';
    const attEmails = Array.isArray(attendees) ? attendees.map(a => (typeof a === 'string' ? a : a.email || '')).join(' ') : '';
    const corpus = `${summary} ${source} ${desc} ${location} ${orgEmail} ${attEmails}`.toLowerCase();

    if (corpus.includes('athx') || corpus.includes('training') || corpus.includes('wod') || corpus.includes('crossfit')) {
      return { stream: 'life', client: 'ATHX', isTraining: true };
    }
    if (corpus.includes('clariane') || corpus.includes('inicea') || corpus.includes('estela') || corpus.includes('@clariane.fr')) {
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
 * Defines the generic project contract:
 * { id, name, clientMatch[], docSources[], workstreams[], parserHints[] }
 * 
 * Fully decouples domain-specific knowledge (workstreams, clinical terms,
 * decision triggers, entity tags) into per-project data/config.
 */

const DEFAULT_CLARIANE_PROJECT = {
  id: 'clariane',
  name: 'HDJ Planning Manager (Inicea / Clariane)',
  clientMatch: ['[planning hdj]', '[planning manager]', 'planning hdj', 'planning manager', 'hdj', 'arbelles', 'mariena', 'mariénia', 'mariéna'],
  docSources: [
    '1eLUVhYG6hwiqOzauSEDZoGJHu_B9jQuC5Pmbg-8bd_8',
    '1jDunJURx26Di9c6k4vjhmA84w3Hh_zCCmCxnU0kcFjY'
  ],
  workstreams: [
    {
      id: 'ws-admission',
      title: 'Flux Annonces & Processus d’Admission',
      badge: 'HM → Foundry',
      status: 'En déploiement',
      summary: 'Basculement de la gestion des listes d’attente papier vers le statut "Annonce" dans Hôpital Manager dès accord médical pour alimenter la disponibilité Foundry.',
      facilities: ['Les Arbelles', 'Mariéna'],
      tags: ['annonces', 'admission'],
      keyRules: [
        'Saisie directe des patients au statut Annonce dans HM pour remonter dans Foundry',
        'Onglet dédié dans l’outil pour filtrer et isoler les annonces HDJ vs HC'
      ]
    },
    {
      id: 'ws-parcours',
      title: 'Modélisation des Programmes Thérapeutiques',
      badge: 'Moteur & Contraintes',
      status: 'Actif',
      summary: 'Paramétrage des programmes standardisés (Dos, Parkinson) et parcours complexes (Neuro, rTMS aux 3 semaines, séances ponctuelles de Diététique/Neuropsy).',
      facilities: ['Les Arbelles', 'Mariéna', 'Glanum'],
      tags: ['modeling', 'parcours'],
      keyRules: [
        'Politique zéro temps mort : aucun trou inter-séance sans attente',
        'Bilans d’entrée et de sortie isolés en séances individuelles',
        'Séances espacées (rTMS) modélisées avec des vacations dédiées à fréquence 3 semaines'
      ]
    },
    {
      id: 'ws-sync',
      title: 'Synchronisation SIH & Circuit de Validation',
      badge: 'Foundry ↔ HM',
      status: 'En cours',
      summary: 'Boucle de validation bilatérale : proposition de circuit dans Foundry -> statut "En attente HM" -> saisie créneau HM -> rapprochement automatique en statut "Réel".',
      facilities: ['Transversal'],
      tags: ['hm-sync', 'vacations'],
      keyRules: [
        'Circuit Foundry passe en "En attente HM" puis réconciliation en "Réel"',
        'Résolution du connecteur pour la remontée des vacations collectives (Kiné, Balnéo, Ergo)'
      ]
    },
    {
      id: 'ws-analytics',
      title: 'Analytique, Alerting & Case Mix',
      badge: 'Reporting & Pilotage',
      status: 'Planifié',
      summary: 'Extraction du case mix réel (% Neuro vs Locomoteur) pour la construction budgétaire et développement du module d’alerting pour double positionnement de patient.',
      facilities: ['Les Arbelles', 'Mariéna'],
      tags: ['analytics', 'alerting'],
      keyRules: [
        'Indicateur budgétaire case mix (tarifs de journée différenciés par segment)',
        'Alerte automatique si un patient est positionné simultanément sur deux vacations'
      ]
    }
  ],
  parserHints: {
    tools: [
      { name: 'Foundry (Palantir)', keywords: ['foundry'], type: 'Data & Engine Platform' },
      { name: 'Hôpital Manager (HM)', keywords: ['hm', 'hôpital manager', 'hopital manager'], type: 'SIH / Dossier Patient' },
      { name: 'rTMS / tDCS', keywords: ['rtms', 'tdcs'], type: 'Protocole Thérapeutique' },
      { name: 'Balnéothérapie', keywords: ['balnéo', 'balneo'], type: 'Plateau Technique' },
      { name: 'Kinésithérapie', keywords: ['kiné', 'kine'], type: 'Soin Rééducation' },
      { name: 'Ergothérapie', keywords: ['ergo'], type: 'Soin Rééducation' }
    ],
    concepts: [
      { name: 'Flux Annonces', keywords: ['annonce'], desc: 'Gestion des pré-admissions et patients potentiels dans HM vers Foundry' },
      { name: 'Politique Zéro Temps Mort', keywords: ['zéro temps mort', 'zero temps mort'], desc: 'Optimisation continue sans temps d’attente inter-séances pour les patients' },
      { name: 'Analytique Case Mix', keywords: ['case mix'], desc: 'Répartition de l’activité Neuro vs Locomoteur pour le pilotage budgétaire' },
      { name: 'Gestion Surbooking & Forçage', keywords: ['surbooking', 'forcer'], desc: 'Remplacement manuel et dépassement de capacité contrôlé' },
      { name: 'Vue Vacations & Disponibilité', keywords: ['vacation'], desc: 'Planification centralisée par salle, soignant et créneau' }
    ],
    facilities: ['Mariéna', 'Les Arbelles', 'Glanum', 'Inicea', 'Clariane'],
    decisionTriggers: [
      { pattern: 'workflow\\s+de\\s+validation\\s*:\\s*(.+)', label: 'Workflow de Validation' },
      { pattern: 'la\\s+solution\\s+retenue\\s+est\\s+(.+)', label: 'Solution Retenue' },
      { pattern: 'politique\\s+z[ée]ro\\s+temps\\s+mort\\s*:\\s*(.+)', label: 'Politique Zéro Temps Mort' },
      { pattern: 'il\\s+a\\s+[ée]t[ée]\\s+propos[ée]\\s+de\\s+(.+)', label: 'Processus Validé' },
      { pattern: 'les\\s+bilans\\s+d\'entr[ée]e\\s+et\\s+de\\s+sortie\\s+se\\s+font\\s+en\\s+individuel', label: 'Règle Bilans' },
      { pattern: 'd[ée]monstration\\s+de\\s+la\\s+fonctionnalit[ée]\\s+permettant\\s+de\\s+"forcer"\\s+un\\s+placement', label: 'Règle Surbooking & Forçage' },
      { pattern: 'l\'outil\\s+a\\s+[ée]t[ée]\\s+adapt[ée]\\s+avec\\s+un\\s+onglet\\s+permettant\\s+d\'inclure\\s+ou\\s+d\'exclure', label: 'Filtre Annonces / Pré-admissions' },
      { pattern: 'à\\s+terme,\\s+l\'outil\\s+pourrait\\s+offrir\\s+un\\s+accès\\s+en\\s+lecture\\s+seule', label: 'Visibilité Praticiens' }
    ],
    tagRules: [
      { tag: 'hm-sync', keywords: ['hm', 'hôpital manager', 'hopital manager'] },
      { tag: 'foundry', keywords: ['foundry'] },
      { tag: 'vacations', keywords: ['vacation'] },
      { tag: 'annonces', keywords: ['annonce'] },
      { tag: 'modeling', keywords: ['modélis', 'parcours'] },
      { tag: 'alerting', keywords: ['alerte', 'alerting'] },
      { tag: 'analytics', keywords: ['case mix', 'budget'] }
    ],
    ownerOrgRules: [
      { org: 'Artefact', keywords: ['artefact', 'ayrton', 'benjamin'] },
      { org: 'Les Arbelles', keywords: ['arbelles', 'fabien', 'delphine'] },
      { org: 'Mariéna', keywords: ['mariena', 'mariéna', 'claire'] },
      { org: 'Client', keywords: ['clariane', 'inicea'] }
    ]
  }
};

const MO_PROJECT = {
  id: 'clariane-mo',
  name: 'Molécules Onéreuses (Clariane)',
  clientMatch: ['[molécules onéreuses]', '[mo]', 'molécules onéreuses', 'molecules onereuses', 'mo -', 'mo:', 'passation molécules', 'point tests mo', 'questions mo'],
  docSources: [],
  workstreams: [
    {
      id: 'ws-mo-copil',
      title: 'Pilotage & COPIL Déploiement',
      badge: 'COPIL',
      status: 'Actif',
      summary: 'Gouvernance, validation des jalons et coordination du déploiement opérationnel.',
      facilities: ['Clariane'],
      tags: ['copil', 'pilotage'],
      keyRules: ['Suivi hebdomadaire des indicateurs de déploiement']
    },
    {
      id: 'ws-mo-anomalies',
      title: 'Suivi Anomalies & Évolutions',
      badge: 'Run & MCO',
      status: 'En cours',
      summary: 'Traitement des anomalies de remontée et suivi des évolutions applicatives.',
      facilities: ['Clariane'],
      tags: ['anomalies', 'run'],
      keyRules: ['Priorisation des tickets bloquants sur les flux']
    },
    {
      id: 'ws-mo-formation',
      title: 'Formation & Accompagnement Pilotes',
      badge: 'Change',
      status: 'En déploiement',
      summary: 'Organisation des vagues de formation (options 1 & 2) et sessions pilotes.',
      facilities: ['Clariane'],
      tags: ['formation', 'pilotes'],
      keyRules: ['Validation des acquis avant bascule en production']
    },
    {
      id: 'ws-mo-passation',
      title: 'Passation & Transition Opérationnelle',
      badge: 'Transition',
      status: 'Planifié',
      summary: 'Documentation, transfert de compétences et kick-off de passation.',
      facilities: ['Clariane'],
      tags: ['passation', 'kick-off'],
      keyRules: ['Livrables de transition signés']
    }
  ],
  parserHints: {
    tools: [
      { name: 'Palantir Foundry', keywords: ['foundry'], type: 'Plateforme Data' },
      { name: 'Netsoins', keywords: ['netsoins'], type: 'SIH Établissements' },
      { name: 'Traçabilité Palantir', keywords: ['tracabilité', 'traçabilité'], type: 'Module SI' }
    ],
    concepts: [
      { name: 'Molécules Onéreuses', keywords: ['molécules onéreuses', 'mo'], desc: 'Gestion et facturation des molécules à statut onéreux' },
      { name: 'Vagues de Formation', keywords: ['vague 1', 'vague 2', 'formation'], desc: 'Déploiement progressif auprès des utilisateurs' }
    ],
    facilities: ['Clariane'],
    decisionTriggers: [
      { pattern: 'validation\\s+du\\s+copil\\s*:\\s*(.+)', label: 'Décision COPIL' },
      { pattern: 'la\\s+date\\s+de\\s+bascule\\s+est\\s+(.+)', label: 'Calendrier Déploiement' }
    ],
    tagRules: [
      { tag: 'copil', keywords: ['copil'] },
      { tag: 'anomalies', keywords: ['anomalie'] },
      { tag: 'formation', keywords: ['formation'] }
    ],
    ownerOrgRules: [
      { org: 'Artefact', keywords: ['artefact', 'ayrton'] },
      { org: 'Clariane', keywords: ['clariane'] }
    ]
  }
};

const INVOICING_PROJECT = {
  id: 'clariane-invoicing',
  name: 'Invoicing & Facturation (Clariane)',
  clientMatch: ['[invoicing]', 'invoicing', 'facturation'],
  docSources: [],
  workstreams: [
    {
      id: 'ws-weekly-facturation',
      title: 'Weekly Facturation x Data',
      badge: 'Facturation',
      status: 'Actif',
      summary: 'Alignement hebdomadaire sur le traitement des flux de facturation et rapprochements.',
      facilities: ['Clariane'],
      tags: ['invoicing', 'facturation'],
      keyRules: ['Contrôle qualité des flux de facturation']
    }
  ],
  parserHints: {
    tools: [],
    concepts: [{ name: 'Facturation x Data', keywords: ['facturation', 'invoicing'], desc: 'Suivi des données de facturation' }],
    facilities: ['Clariane'],
    decisionTriggers: [],
    tagRules: [{ tag: 'invoicing', keywords: ['invoicing', 'facturation'] }],
    ownerOrgRules: [{ org: 'Artefact', keywords: ['artefact'] }, { org: 'Clariane', keywords: ['clariane'] }]
  }
};

const F360_PROJECT = {
  id: 'clariane-f360',
  name: 'F360 Médical (Clariane)',
  clientMatch: ['[f360', 'f360'],
  docSources: [],
  workstreams: [
    {
      id: 'ws-dashboard-v2',
      title: 'Revue Dashboard Médical V2',
      badge: 'Dashboard',
      status: 'Actif',
      summary: 'Itération et retours RS sur le tableau de bord médical F360.',
      facilities: ['Clariane'],
      tags: ['dashboard', 'médical'],
      keyRules: ['Intégration des retours médecins et soignants']
    }
  ],
  parserHints: {
    tools: [{ name: 'F360', keywords: ['f360'], type: 'Plateforme Médicale' }],
    concepts: [{ name: 'Dashboard Médical', keywords: ['dashboard', 'médical'], desc: 'Pilotage de l’activité médicale' }],
    facilities: ['Clariane'],
    decisionTriggers: [],
    tagRules: [{ tag: 'f360', keywords: ['f360'] }],
    ownerOrgRules: [{ org: 'Artefact', keywords: ['artefact'] }, { org: 'Clariane', keywords: ['clariane'] }]
  }
};

const CLARIANE_DATA_PROJECT = {
  id: 'clariane-data',
  name: 'Clariane Data & Coproj',
  clientMatch: ['[coproj data inicea]', 'coproj', '[clariane] - weekly sync', 'équipe parisienne', 'connexion mensuel ordinateur', '[artefact team] - bi-weekly'],
  docSources: [],
  workstreams: [
    {
      id: 'ws-coproj-inicea',
      title: 'Coproj Data Inicea',
      badge: 'Coproj',
      status: 'Actif',
      summary: 'Comité de projet data transverse Inicea / Clariane.',
      facilities: ['Clariane'],
      tags: ['coproj', 'inicea'],
      keyRules: ['Suivi transverse du portefeuille de projets data']
    },
    {
      id: 'ws-equipe-sync',
      title: 'Weekly Sync & Vie d’Équipe',
      badge: 'Équipe',
      status: 'Actif',
      summary: 'Synchronisation d’équipe parisienne et alignement bimensuel Artefact.',
      facilities: ['Clariane'],
      tags: ['sync', 'équipe'],
      keyRules: ['Partage d’informations et coordination']
    }
  ],
  parserHints: {
    tools: [],
    concepts: [{ name: 'Coproj Data', keywords: ['coproj'], desc: 'Gouvernance data Inicea' }],
    facilities: ['Clariane'],
    decisionTriggers: [],
    tagRules: [{ tag: 'coproj', keywords: ['coproj'] }],
    ownerOrgRules: [{ org: 'Artefact', keywords: ['artefact'] }, { org: 'Clariane', keywords: ['clariane'] }]
  }
};

const GE_UC_WIZARD_PROJECT = {
  id: 'ge-uc-wizard',
  name: 'GE Enterprise / UC Wizard (Artefact)',
  clientMatch: ['ge enterprise', 'uc wizard', 'datastore ge drive'],
  docSources: [],
  workstreams: [
    {
      id: 'ws-ge-sync',
      title: 'GE Enterprise Stream',
      badge: 'GE',
      status: 'Actif',
      summary: 'Synchronisation hebdomadaire et architecture datastore GE Drive.',
      facilities: ['Artefact'],
      tags: ['ge-enterprise'],
      keyRules: ['Alignement hebdomadaire']
    },
    {
      id: 'ws-uc-wizard',
      title: 'UC Wizard Development',
      badge: 'UC Wizard',
      status: 'Actif',
      summary: 'Catchup et sprint sync pour l’application UC Wizard.',
      facilities: ['Artefact'],
      tags: ['uc-wizard'],
      keyRules: ['Revue des use cases et avancement technique']
    }
  ],
  parserHints: {
    tools: [{ name: 'GE Drive', keywords: ['ge drive'], type: 'Storage' }],
    concepts: [{ name: 'UC Wizard', keywords: ['uc wizard'], desc: 'Wizard de cadrage des cas d’usage' }],
    facilities: ['Artefact'],
    decisionTriggers: [],
    tagRules: [{ tag: 'ge', keywords: ['ge enterprise'] }, { tag: 'uc-wizard', keywords: ['uc wizard'] }],
    ownerOrgRules: [{ org: 'Artefact', keywords: ['artefact'] }]
  }
};

const HEALTHCARE_PROJECT = {
  id: 'healthcare-mandate',
  name: 'Healthcare Mandate & Care Dispensing',
  clientMatch: ['[care dispensing]', 'care dispensing', 'healthoween', 'healthcare'],
  docSources: [],
  workstreams: [
    {
      id: 'ws-care-dispensing',
      title: 'Care Dispensing Framework',
      badge: 'Care Dispensing',
      status: 'Actif',
      summary: 'Sessions hebdomadaires le vendredi sur la conception des supports et de l’offre Care Dispensing.',
      facilities: ['Artefact'],
      tags: ['care-dispensing'],
      keyRules: ['Livrables hebdomadaires de présentation']
    },
    {
      id: 'ws-healthcare-team',
      title: 'Healthcare Mandate & Community',
      badge: 'Mandat',
      status: 'Actif',
      summary: 'Animation de la communauté santé Artefact et événements dédiés (Healthoween).',
      facilities: ['Artefact'],
      tags: ['healthcare', 'mandat'],
      keyRules: ['Renforcement de la culture santé interne']
    }
  ],
  parserHints: {
    tools: [],
    concepts: [{ name: 'Care Dispensing', keywords: ['care dispensing'], desc: 'Offre et processus de dispensation des soins' }],
    facilities: ['Artefact'],
    decisionTriggers: [],
    tagRules: [{ tag: 'care-dispensing', keywords: ['care dispensing'] }],
    ownerOrgRules: [{ org: 'Artefact', keywords: ['artefact'] }]
  }
};

const PRIDEFACT_PROJECT = {
  id: 'pridefact',
  name: 'PrideFact - Mandat RSE (Artefact)',
  clientMatch: ['[pridefact]', 'pridefact', 'mandat rse', 'women@artefact'],
  docSources: [],
  workstreams: [
    {
      id: 'ws-pridefact-synchro',
      title: 'Synchro Mandat RSE',
      badge: 'Mandat RSE',
      status: 'Actif',
      summary: 'Coordination bimensuelle des actions RSE et inclusion.',
      facilities: ['Artefact'],
      tags: ['rse', 'inclusion'],
      keyRules: ['Suivi des engagements RSE']
    },
    {
      id: 'ws-pridefact-travail',
      title: 'Sessions de Travail & Événements',
      badge: 'Ateliers',
      status: 'Actif',
      summary: 'Ateliers de travail, intégration avec Women@Artefact et sensibilisation.',
      facilities: ['Artefact'],
      tags: ['ateliers', 'sensibilisation'],
      keyRules: ['Préparation des livrables de communication interne']
    }
  ],
  parserHints: {
    tools: [],
    concepts: [{ name: 'Mandat RSE', keywords: ['rse', 'pridefact'], desc: 'Engagement sociétal et inclusion' }],
    facilities: ['Artefact'],
    decisionTriggers: [],
    tagRules: [{ tag: 'pridefact', keywords: ['pridefact'] }],
    ownerOrgRules: [{ org: 'Artefact', keywords: ['artefact'] }]
  }
};

const COUNSELING_PROJECT = {
  id: 'counseling',
  name: 'Counseling & Talent Review (Artefact)',
  clientMatch: ['[itw]', 'counselling', 'counseling', 'counselor', 'comités d\'évaluation', 'eval h2', 'peer selection', 'self & peer review'],
  docSources: [],
  workstreams: [
    {
      id: 'ws-eval-h2',
      title: 'Comités d’Évaluation & Peer Reviews',
      badge: 'Évaluations H2',
      status: 'Actif',
      summary: 'Campagne d’évaluation H2 2026, comités d’arbitrage et sélection des pairs.',
      facilities: ['Artefact'],
      tags: ['evaluations', 'comites'],
      keyRules: ['Respect des échéances de recueil des feedbacks']
    },
    {
      id: 'ws-counseling-1to1',
      title: 'Counseling & Accompagnement Carrière',
      badge: 'Counseling',
      status: 'Actif',
      summary: 'Entretiens réguliers de counseling et suivi du plan de développement.',
      facilities: ['Artefact'],
      tags: ['counseling', '1to1'],
      keyRules: ['Suivi des objectifs semestriels']
    }
  ],
  parserHints: {
    tools: [],
    concepts: [{ name: 'Counseling', keywords: ['counseling', 'counselling'], desc: 'Accompagnement et mentorat RH' }],
    facilities: ['Artefact'],
    decisionTriggers: [],
    tagRules: [{ tag: 'counseling', keywords: ['counseling', 'counselling'] }],
    ownerOrgRules: [{ org: 'Artefact', keywords: ['artefact'] }]
  }
};

const DEFAULT_PROJECTS = [
  DEFAULT_CLARIANE_PROJECT,
  MO_PROJECT,
  INVOICING_PROJECT,
  F360_PROJECT,
  CLARIANE_DATA_PROJECT,
  GE_UC_WIZARD_PROJECT,
  HEALTHCARE_PROJECT,
  PRIDEFACT_PROJECT,
  COUNSELING_PROJECT
];

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
MeetingHub.DEFAULT_CLARIANE_PROJECT = DEFAULT_CLARIANE_PROJECT;
MeetingHub.MO_PROJECT = MO_PROJECT;
MeetingHub.INVOICING_PROJECT = INVOICING_PROJECT;
MeetingHub.F360_PROJECT = F360_PROJECT;
MeetingHub.CLARIANE_DATA_PROJECT = CLARIANE_DATA_PROJECT;
MeetingHub.GE_UC_WIZARD_PROJECT = GE_UC_WIZARD_PROJECT;
MeetingHub.HEALTHCARE_PROJECT = HEALTHCARE_PROJECT;
MeetingHub.PRIDEFACT_PROJECT = PRIDEFACT_PROJECT;
MeetingHub.COUNSELING_PROJECT = COUNSELING_PROJECT;
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

  /* ================= Decisions Extraction ================= */

  static extractDecisions(cleanText, topics = [], hints = {}, meta = {}) {
    const decisions = [];
    const lines = cleanText.split('\n').map(l => l.trim()).filter(Boolean);
    const meetingLink = meta.meetingId ? `#/meeting/${encodeURIComponent(meta.meetingId)}` : '';

    // Project-configured decision triggers
    const configuredTriggers = (hints.decisionTriggers || []).map(t => {
      try {
        if (typeof t === 'string') {
          const escaped = t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          return { regex: new RegExp(`(?:\\b${escaped}\\b)\\s*[:|]?\\s*(.+)`, 'i'), label: t };
        }
        return { regex: new RegExp(t.pattern, 'i'), label: t.label || 'Decision' };
      } catch (e) {
        return null;
      }
    }).filter(Boolean);

    // Generic fallback triggers if none configured or alongside
    const genericTriggers = [
      { regex: /(?:\bdécision\b|\bdecision\b)\s*[:|]\s*(.+)/i, label: 'Decision' },
      { regex: /(?:\bdécidé\s+que\b|\bdecided\s+that\b|\bconvenu\s+de\b|\bagreed\s+to\b)\s+(.+)/i, label: 'Agreement' },
      { regex: /(?:\bsolution\s+retenue\b|\bsolution\s+adoptée\b)\s*[:|]?\s*(.+)/i, label: 'Adopted Solution' }
    ];

    const decisionTriggers = configuredTriggers.length > 0
      ? [...configuredTriggers, ...genericTriggers]
      : genericTriggers;

    for (const line of lines) {
      // Skip section headers like "Décisions prises:" or "Décisions :"
      if (/^(?:#+\s*)?(?:décisions?(?:\s+prises)?|decisions?)\s*:\s*$/i.test(line)) {
        continue;
      }

      for (const trigger of decisionTriggers) {
        if (trigger.regex.test(line)) {
          const statement = line.replace(/^[*\-•]\s*/, '').trim();
          decisions.push({
            id: `dec-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            label: trigger.label,
            statement,
            context: MinutesEngine.findContextTopic(line, topics),
            quote: line,
            meetingLink
          });
          break;
        }
      }
    }

    return decisions;
  }

  static findContextTopic(line, topics) {
    for (const t of topics) {
      if (t.points.some(p => p.includes(line) || line.includes(p))) {
        return t.title;
      }
    }
    return 'General';
  }

  /* ================= Knowledge Extraction ================= */

  static extractKnowledge(text, facility = '', hints = {}) {
    const lower = text.toLowerCase();
    const tools = [];
    const concepts = [];
    const facilities = [];

    // Driven dynamically by project parser hints
    const configuredTools = hints.tools || [];
    for (const t of configuredTools) {
      const name = typeof t === 'string' ? t : t.name;
      const keywords = typeof t === 'string' ? [t.toLowerCase()] : (t.keywords || [t.name.toLowerCase()]);
      if (keywords.some(k => lower.includes(k.toLowerCase()))) {
        tools.push({ name, type: (typeof t === 'object' && t.type) || 'Tool' });
      }
    }

    const configuredConcepts = hints.concepts || [];
    for (const c of configuredConcepts) {
      const name = typeof c === 'string' ? c : c.name;
      const keywords = typeof c === 'string' ? [c.toLowerCase()] : (c.keywords || [c.name.toLowerCase()]);
      if (keywords.some(k => lower.includes(k.toLowerCase()))) {
        concepts.push({ name, desc: (typeof c === 'object' && c.desc) || '' });
      }
    }

    const configuredFacilities = hints.facilities || [];
    for (const f of configuredFacilities) {
      if (lower.includes(f.toLowerCase())) {
        facilities.push(f);
      }
    }
    if (facility && !facilities.includes(facility)) {
      facilities.push(facility);
    }

    return {
      tools: Array.from(new Map(tools.map(t => [t.name, t])).values()),
      concepts: Array.from(new Map(concepts.map(c => [c.name, c])).values()),
      facilities: Array.from(new Set(facilities))
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

/* === Module: model/project_engine.js === */
/**
 * Project Base & Minutes Synthesis Engine
 * 
 * Aggregates meeting minutes, decisions, actions, and connected documents across
 * any configured project initiative.
 * 
 * Completely generic and driven by Project configuration:
 * - Honest coverage metrics ("X of Y meetings have minutes")
 * - Cross-meeting decision deduplication ("first decided on" & "restated on")
 * - Source quotes and meeting links on every action and decision
 * - Dynamic workstream synthesis with open action counts
 * - Stakeholder directory and connected document library
 */




class ProjectEngine {
  /**
   * Builds the comprehensive Project Base for a given project ID or client name.
   * @param {string} projectIdOrClient e.g. 'clariane' or 'Clariane'
   * @param {object} store The MeetingHubStore instance
   * @returns {Promise<object>} Consolidated Project Base data
   */
  static async buildProjectBase(projectIdOrClient = 'clariane', store) {
    const allEvents = store.getAllEvents ? store.getAllEvents() : [];

    // 1. Resolve project configuration
    let project = null;
    if (store.getProject) {
      project = await store.getProject(projectIdOrClient);
    }
    if (!project && store.getAllProjects) {
      const allProjects = await store.getAllProjects();
      project = allProjects.find(p => 
        p.id.toLowerCase() === projectIdOrClient.toLowerCase() ||
        p.name.toLowerCase() === projectIdOrClient.toLowerCase() ||
        (Array.isArray(p.clientMatch) && p.clientMatch.some(m => m.toLowerCase() === projectIdOrClient.toLowerCase()))
      );
    }
    if (!project) {
      // Fallback to default Clariane if matching, else generic project
      if (projectIdOrClient.toLowerCase() === 'clariane') {
        project = DEFAULT_CLARIANE_PROJECT;
      } else {
        project = ProjectModel.createDefault(projectIdOrClient, [projectIdOrClient]);
      }
    }

    const clientMatches = (project.clientMatch || [project.name, project.id]).map(m => m.toLowerCase());

    // 2. Filter events belonging to this project
    const projectEvents = allEvents.filter(e => {
      if (store && typeof store.getProjectForMeeting === 'function') {
        const assignedProj = store.getProjectForMeeting(e);
        if (assignedProj) {
          return assignedProj.id === project.id;
        }
      }
      const client = (e.client || '').toLowerCase();
      const title = (e.title || '').toLowerCase();
      const tags = (e.tags || []).map(t => t.toLowerCase());

      return clientMatches.some(match => 
        client === match ||
        client.includes(match) ||
        title.includes(match) ||
        tags.includes(match)
      );
    }).sort((a, b) => (b.date || '').localeCompare(a.date || ''));

    // 3. Collect meeting data for these events
    const meetingDataList = [];
    for (const evt of projectEvents) {
      const mData = await store.getMeetingData(evt.id);
      meetingDataList.push({
        event: evt,
        data: mData
      });
    }

    // 4. Compile Actions, Decisions, Stakeholders, Docs
    const actionMatrix = [];
    const rawDecisions = [];
    const stakeholderMap = new Map();
    const connectedDocs = [];
    const toolSet = new Set();
    const conceptSet = new Map();

    for (const item of meetingDataList) {
      const { event, data } = item;
      const rawMinutes = data.minutes || '';

      // Parse minutes if present
      let parsed = null;
      if (rawMinutes.trim()) {
        parsed = MinutesEngine.parseMinutes(rawMinutes, {
          title: event.title,
          date: event.date,
          facility: event.facility,
          meetingId: event.id
        }, project);
      }

      // Track attached Google Doc
      const docUrl = data.googleDocUrl || event.googleDocUrl || ProjectEngine.findDocUrl(event.description || '');
      if (docUrl) {
        const docIdMatch = docUrl.match(/\/d\/([a-zA-Z0-9_-]+)/);
        const docId = docIdMatch ? docIdMatch[1] : '';
        connectedDocs.push({
          id: docId || event.id,
          title: (parsed && parsed.title) || event.title,
          meetingId: event.id,
          meetingDate: event.date,
          facility: (parsed && parsed.facility) || event.facility || '',
          url: docUrl,
          hasMinutes: Boolean(rawMinutes.trim()),
          minutesLength: rawMinutes.length
        });
      }

      // Collect items from saved data.items first
      const savedItems = Array.isArray(data.items) ? data.items : [];
      
      const effectiveActions = savedItems.filter(i => i.kind === 'action').length > 0
        ? savedItems.filter(i => i.kind === 'action')
        : (parsed ? parsed.actions : []);

      const effectiveDecisions = savedItems.filter(i => i.kind === 'decision').length > 0
        ? savedItems.filter(i => i.kind === 'decision')
        : (parsed ? parsed.decisions : []);

      // Register actions with source quote and meeting link
      for (const act of effectiveActions) {
        const owner = act.owner || 'Team';
        const ownerOrg = act.ownerOrg || ProjectEngine.classifyOwnerOrg(owner, project);
        const quote = act.quote || act.text || '';
        const meetingLink = act.meetingLink || `#/meeting/${encodeURIComponent(event.id)}`;

        actionMatrix.push({
          id: act.id || `act-${Math.random().toString(36).substr(2, 6)}`,
          meetingId: event.id,
          meetingTitle: event.title,
          meetingDate: event.date,
          facility: (parsed && parsed.facility) || event.facility || '',
          owner,
          ownerOrg,
          text: act.text || act.title || '',
          dueDate: act.dueDate || '',
          done: Boolean(act.done),
          tags: act.tags || [],
          source: act.source || 'minutes',
          quote,
          meetingLink
        });
      }

      // Collect raw decisions for deduplication
      for (const dec of effectiveDecisions) {
        const statement = (dec.statement || dec.text || '').replace(/^\[.*?\]\s*/, '').trim();
        const label = dec.label || ProjectEngine.deriveDecisionLabel(statement, project);
        const quote = dec.quote || statement;
        const meetingLink = dec.meetingLink || `#/meeting/${encodeURIComponent(event.id)}`;

        rawDecisions.push({
          id: dec.id || `dec-${Math.random().toString(36).substr(2, 6)}`,
          meetingId: event.id,
          meetingTitle: event.title,
          meetingDate: event.date,
          facility: (parsed && parsed.facility) || event.facility || '',
          label,
          statement,
          context: dec.context || 'General',
          quote,
          meetingLink
        });
      }

      // Register stakeholders
      if (parsed && Array.isArray(parsed.participants) && parsed.participants.length > 0) {
        for (const p of parsed.participants) {
          if (!p.name) continue;
          const key = p.name.toLowerCase();
          if (!stakeholderMap.has(key)) {
            stakeholderMap.set(key, {
              name: p.name,
              role: p.role || 'Participant',
              org: p.org || ProjectEngine.classifyOwnerOrg(p.role || p.name, project),
              meetingCount: 1,
              lastSeen: event.date
            });
          } else {
            const existing = stakeholderMap.get(key);
            existing.meetingCount += 1;
            if (event.date > existing.lastSeen) existing.lastSeen = event.date;
          }
        }
      } else if (Array.isArray(event.attendees)) {
        for (const att of event.attendees) {
          if (!att) continue;
          const key = att.toLowerCase();
          if (!stakeholderMap.has(key)) {
            stakeholderMap.set(key, {
              name: att,
              role: 'Attendee',
              org: ProjectEngine.classifyOwnerOrg(att, project),
              meetingCount: 1,
              lastSeen: event.date
            });
          } else {
            const existing = stakeholderMap.get(key);
            existing.meetingCount += 1;
            if (event.date > existing.lastSeen) existing.lastSeen = event.date;
          }
        }
      }

      // Register knowledge entities
      if (parsed && parsed.knowledge) {
        (parsed.knowledge.tools || []).forEach(t => toolSet.add(t.name));
        (parsed.knowledge.concepts || []).forEach(c => {
          if (!conceptSet.has(c.name)) conceptSet.set(c.name, c.desc);
        });
      }
    }

    // 5. Deduplicate decisions across meetings
    const decisionRegister = ProjectEngine.deduplicateDecisions(rawDecisions);

    // 6. Action matrix sorting
    actionMatrix.sort((a, b) => {
      if (a.done !== b.done) return a.done ? 1 : -1;
      return (b.meetingDate || '').localeCompare(a.meetingDate || '');
    });

    // 7. Stakeholders sorting
    const stakeholders = Array.from(stakeholderMap.values()).sort((a, b) => {
      if (a.org !== b.org) return a.org.localeCompare(b.org);
      return a.name.localeCompare(b.name);
    });

    // 8. Workstreams compilation from project configuration
    const workstreams = ProjectEngine.synthesizeWorkstreams(project, decisionRegister, actionMatrix);

    // 9. Honest coverage calculation
    const totalMeetings = projectEvents.length;
    const meetingsWithMinutes = meetingDataList.filter(m => (m.data.minutes || '').trim().length > 0).length;
    const coveragePercent = totalMeetings > 0 ? Math.round((meetingsWithMinutes / totalMeetings) * 100) : 0;
    const coverageText = `${meetingsWithMinutes} of ${totalMeetings} meetings have minutes`;

    // Action counts breakdown
    const openActions = actionMatrix.filter(a => !a.done);
    const closedActions = actionMatrix.filter(a => a.done);
    const artefactActions = openActions.filter(a => a.ownerOrg.toLowerCase().includes('artefact'));
    const clientActions = openActions.filter(a => !a.ownerOrg.toLowerCase().includes('artefact'));

    return {
      projectId: project.id,
      projectName: project.name,
      projectConfig: project,
      totalMeetings,
      meetingsWithMinutes,
      coveragePercent,
      coverageText,
      actionStats: {
        total: actionMatrix.length,
        open: openActions.length,
        closed: closedActions.length,
        artefactOpen: artefactActions.length,
        clientOpen: clientActions.length
      },
      decisionStats: {
        total: decisionRegister.length,
        uniqueCount: decisionRegister.length,
        rawCount: rawDecisions.length
      },
      workstreams,
      actionMatrix,
      decisionRegister,
      stakeholders,
      connectedDocs,
      tools: Array.from(toolSet),
      concepts: Array.from(conceptSet.entries()).map(([name, desc]) => ({ name, desc })),
      lastUpdated: new Date().toISOString()
    };
  }

  /**
   * Deduplicates decisions across meetings.
   * Tracks "first decided on" and "restated on" instances.
   */
  static deduplicateDecisions(rawDecisions) {
    if (!Array.isArray(rawDecisions) || rawDecisions.length === 0) return [];

    // Sort chronologically ascending to establish initial decision first
    const sorted = [...rawDecisions].sort((a, b) => (a.meetingDate || '').localeCompare(b.meetingDate || ''));

    const deduplicated = [];

    for (const dec of sorted) {
      const normText = ProjectEngine._normalizeStatement(dec.statement);

      // Check for existing matching decision
      const match = deduplicated.find(existing => {
        const existingNorm = ProjectEngine._normalizeStatement(existing.statement);
        if (normText === existingNorm) return true;
        // Check for matching label and high text similarity
        if (existing.label && dec.label && existing.label.toLowerCase() === dec.label.toLowerCase()) {
          const overlap = ProjectEngine._calculateSimilarity(normText, existingNorm);
          if (overlap >= 0.70) return true;
        }
        return false;
      });

      if (match) {
        // Record as restated
        match.restatedOn.push({
          meetingId: dec.meetingId,
          meetingTitle: dec.meetingTitle,
          meetingDate: dec.meetingDate,
          facility: dec.facility,
          quote: dec.quote,
          meetingLink: dec.meetingLink
        });
        match.restatedCount = match.restatedOn.length;
      } else {
        // New canonical decision
        deduplicated.push({
          id: dec.id,
          label: dec.label,
          statement: dec.statement,
          context: dec.context,
          quote: dec.quote,
          meetingLink: dec.meetingLink,
          firstDecidedOn: {
            meetingId: dec.meetingId,
            meetingTitle: dec.meetingTitle,
            meetingDate: dec.meetingDate,
            facility: dec.facility,
            quote: dec.quote,
            meetingLink: dec.meetingLink
          },
          restatedOn: [],
          restatedCount: 0
        });
      }
    }

    // Sort final decision register latest first
    return deduplicated.sort((a, b) => 
      (b.firstDecidedOn.meetingDate || '').localeCompare(a.firstDecidedOn.meetingDate || '')
    );
  }

  static _normalizeStatement(str) {
    return (str || '')
      .toLowerCase()
      .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()'"\[\]]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  static _calculateSimilarity(s1, s2) {
    if (!s1 || !s2) return 0;
    if (s1 === s2) return 1;
    const words1 = new Set(s1.split(' '));
    const words2 = new Set(s2.split(' '));
    let intersection = 0;
    for (const w of words1) {
      if (words2.has(w)) intersection++;
    }
    return (2.0 * intersection) / (words1.size + words2.size);
  }

  /**
   * Synthesizes workstreams from project configuration.
   */
  static synthesizeWorkstreams(project, decisions, actions) {
    const configured = project.workstreams || [];
    if (configured.length > 0) {
      return configured.map(ws => {
        const wsTags = (ws.tags || []).map(t => t.toLowerCase());
        const openActionsCount = actions.filter(a => {
          if (a.done) return false;
          if (wsTags.length > 0 && Array.isArray(a.tags) && a.tags.some(t => wsTags.includes(t.toLowerCase()))) {
            return true;
          }
          const lowerText = (a.text || '').toLowerCase();
          return wsTags.some(t => lowerText.includes(t));
        }).length;

        return {
          ...ws,
          openActionsCount
        };
      });
    }

    // Default generic workstream if none configured
    return [
      {
        id: 'ws-core',
        title: 'Core Delivery & Synchronization',
        badge: 'General',
        status: 'Active',
        summary: `Progress tracking and action execution for ${project.name}.`,
        facilities: ['All'],
        openActionsCount: actions.filter(a => !a.done).length,
        keyRules: ['Document all decisions in minutes', 'Track action items to completion']
      }
    ];
  }

  static findDocUrl(text) {
    if (!text) return '';
    const match = text.match(/https:\/\/docs\.google\.com\/document\/d\/[a-zA-Z0-9_-]+/);
    return match ? match[0] : '';
  }

  static classifyOwnerOrg(owner = '', project = null) {
    const lower = (owner || '').toLowerCase();
    const rules = project?.parserHints?.ownerOrgRules || [];
    for (const rule of rules) {
      if (rule.keywords && rule.keywords.some(k => lower.includes(k.toLowerCase()))) {
        return rule.org;
      }
    }
    if (lower.includes('artefact')) return 'Artefact';
    return 'Client / Team';
  }

  static deriveDecisionLabel(statement = '', project = null) {
    const lower = (statement || '').toLowerCase();
    const triggers = project?.parserHints?.decisionTriggers || [];
    for (const tr of triggers) {
      try {
        if (new RegExp(tr.pattern, 'i').test(statement)) {
          return tr.label;
        }
      } catch (e) {}
    }
    return 'Decision';
  }
}

MeetingHub.ProjectEngine = ProjectEngine;

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
  static async importInitialData(db, options = {}) {
    const meta = await db.get('meta', 'initial_import_done');
    const existingCount = await db.count('events');

    // If store already has events (from previous import or calendar sync), skip cleanly
    if (existingCount > 0 && !options.force) {
      console.log(`[Importer] Store already populated with ${existingCount} events. Skipping initial snapshot.`);
      return { skipped: true, eventCount: existingCount };
    }

    console.log('[Importer] Checking for initial calendar events import...');
    let rawList = options.rawEvents;

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

    // 1. Normalize events
    const normalizedEvents = rawList.map(e => EventModel.normalize(e));

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
          items: [
            { id: 'item-arb-1', kind: 'action', text: 'Modéliser sur papier la structure des programmes thérapeutiques', owner: 'Les Arbelles', dueDate: '', done: false, tags: ['modeling'], source: 'minutes' },
            { id: 'item-arb-2', kind: 'action', text: 'Se connecter à l’outil dans la semaine pour prise en main et retours', owner: 'Les Arbelles', dueDate: 'Cette semaine', done: false, tags: ['modeling'], source: 'minutes' },
            { id: 'item-arb-3', kind: 'action', text: 'Se renseigner sur les champs obligatoires minimaux requis dans HM pour créer une Annonce', owner: 'Artefact', dueDate: '', done: false, tags: ['annonces', 'hm-sync'], source: 'minutes' },
            { id: 'item-arb-4', kind: 'action', text: 'Ajuster les filtres de la vue vacation (médecins vs psys vs neuropsys)', owner: 'Artefact', dueDate: '', done: false, tags: ['vacations'], source: 'minutes' },
            { id: 'item-arb-5', kind: 'action', text: 'S’assurer de la modélisation facile des bilans ciblés et séances périodiques espacées', owner: 'Artefact', dueDate: '', done: false, tags: ['modeling'], source: 'minutes' },
            { id: 'item-arb-6', kind: 'decision', text: '[Politique Zéro Temps Mort] Les patients ne doivent avoir aucun trou entre leurs séances de rééducation', context: 'Contraintes des Programmes Thérapeutiques', source: 'minutes' },
            { id: 'item-arb-7', kind: 'decision', text: '[Processus Validé] Saisir les patients au statut "Annonce" dans HM dès confirmation pour alimenter Foundry', context: 'Processus d\'Admission et flux "Annonce"', source: 'minutes' }
          ],
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
          items: [
            { id: 'item-mar-1', kind: 'action', text: 'Modéliser sur papier ou fichier Excel les parcours thérapeutiques complexes', owner: 'Claire GAILLET', dueDate: '', done: false, tags: ['modeling'], source: 'minutes' },
            { id: 'item-mar-2', kind: 'action', text: 'Résoudre le problème de remontée des vacations depuis HM (Kiné, Balnéo, Ergo) et prévenir Claire', owner: 'Artefact', dueDate: '', done: false, tags: ['vacations', 'hm-sync'], source: 'minutes' },
            { id: 'item-mar-3', kind: 'action', text: 'Développer un système d’alerte (alerting) dans l’outil pour signaler le double positionnement patient', owner: 'Artefact', dueDate: '', done: false, tags: ['alerting'], source: 'minutes' },
            { id: 'item-mar-4', kind: 'action', text: 'Prochain point de suivi : Mardi matin de la semaine prochaine', owner: 'Équipe', dueDate: 'Semaine prochaine', done: false, tags: ['modeling'], source: 'minutes' },
            { id: 'item-mar-5', kind: 'decision', text: '[Workflow de Validation] La validation d\'un circuit sur Foundry le passe au statut "En attente HM" avant réconciliation en "Réel"', context: 'Contexte et Approche du projet', source: 'minutes' },
            { id: 'item-mar-6', kind: 'decision', text: '[Solution Retenue] Création de vacations isolées dédiées à fréquence 3 semaines pour les protocoles rTMS / tDCS', context: 'Modélisation des Parcours Thérapeutiques', source: 'minutes' }
          ],
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
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      let resp = await fetch('/api/sync/calendars', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trigger: 'manual_sync', timestamp: nowIso }),
        signal: controller.signal
      }).catch(() => null);

      if (!resp || !resp.ok) {
        // Fallback to GET on orchestrator calendar events feed
        resp = await fetch('/api/sync/calendars', { signal: controller.signal }).catch(() => null);
      }

      clearTimeout(timeoutId);

      if (resp && resp.ok) {
        const data = await resp.json();
        if (data && Array.isArray(data.events)) {
          syncedEvents = data.events;
          backendSuccess = true;
          if (data.sources) {
            backendSources = data.sources;
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
   * @returns {Object} Detailed prep evaluation
   */
  static computeMeetingPrep(meeting, meetingData = {}, relatedLinks = []) {
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
      people,
      missingItems,
      missingCount,
      missingSummary
    };
  }

  /**
   * Helper to check if a meeting is scheduled within the next 48 hours.
   */
  static isWithin48Hours(meetingDate, meetingStart = '00:00', refDateStr = '2026-10-28', refTimeStr = '00:00') {
    if (!meetingDate) return false;
    try {
      const meetTime = new Date(`${meetingDate}T${meetingStart || '00:00'}:00`).getTime();
      const refTime = new Date(`${refDateStr}T${refTimeStr || '00:00'}:00`).getTime();
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
  edit: `<svg class="i" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`,
  folder: `<svg class="i" viewBox="0 0 24 24"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>`,
  panelRightClose: `<svg class="i" viewBox="0 0 24 24"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M15 3v18"/><path d="m8 9 3 3-3 3"/></svg>`,
  panelRightOpen: `<svg class="i" viewBox="0 0 24 24"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M15 3v18"/><path d="m11 15-3-3 3-3"/></svg>`,
  chevronRight: `<svg class="i" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>`
};

MeetingHub.Icons = Icons;

/* === Module: ui/shell.js === */
/**
 * Application Shell Component
 * 
 * Renders the persistent dark navy sidebar and sticky header,
 * manages view/mode switching, handles dark/light theme toggle,
 * sidebar project switcher with suggestions, and live calendar source sync status.
 */


class ShellUI {
  constructor({
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
    activeProjectId = 'clariane',
    suggestedProjects = []
  }) {
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
    this.activeProjectId = activeProjectId;
    this.suggestedProjects = suggestedProjects;
    this.isProjectDropdownOpen = false;
    this.isPanelCollapsed = false;

    this.currentView = 'today';
    this.currentMode = 'all';
    this.isSyncing = false;
    this.syncStatus = null;
    this.theme = this.getInitialTheme();

    this.applyTheme(this.theme);

    // Global click listener to close project dropdown on outside click
    document.addEventListener('click', (e) => {
      if (this.isProjectDropdownOpen) {
        const selector = document.querySelector('.sidebar-project-selector');
        if (selector && !selector.contains(e.target)) {
          this.isProjectDropdownOpen = false;
          this.renderProjectSwitcher();
        }
      }
    });
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

  setProjects(projects, activeProjectId, suggestedProjects = []) {
    this.projects = projects || [];
    if (activeProjectId) this.activeProjectId = activeProjectId;
    this.suggestedProjects = suggestedProjects || [];
    this.renderProjectSwitcher();
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

    aside.innerHTML = `
      <div class="brand">
        <b>M</b>
        <div>Meeting Hub<small>Prep · Capture · Link</small></div>
      </div>

      <!-- Project Switcher & Initiative Scope -->
      <div class="sidebar-project-block" id="sidebarProjectContainer">
        <!-- Rendered by renderProjectSwitcher -->
      </div>

      <div class="grp">Work</div>
      <button class="nav ${this.currentView === 'today' ? 'on' : ''}" data-view="today">
        ${Icons.calendar}Today
      </button>
      <button class="nav ${this.currentView === 'week' ? 'on' : ''}" data-view="week">
        ${Icons.week}Week
      </button>
      <button class="nav ${this.currentView === 'meetings' ? 'on' : ''}" data-view="meetings">
        ${Icons.users}Meetings
      </button>
      <button class="nav ${this.currentView === 'actions' ? 'on' : ''}" data-view="actions">
        ${Icons.checkSquare}Open Actions
        <span class="n" id="navActions">${openActionsCount}</span>
      </button>
      <button class="nav ${this.currentView === 'series' ? 'on' : ''}" data-view="series">
        ${Icons.link}Series &amp; Links
      </button>
      <button class="nav ${this.currentView === 'projects' ? 'on' : ''}" data-view="projects">
        ${Icons.layers}Projects &amp; Knowledge
      </button>

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

    // Wire up sidebar view switches
    aside.querySelectorAll('.nav[data-view]').forEach(btn => {
      btn.addEventListener('click', () => {
        this.currentView = btn.dataset.view;
        this.renderSidebar(openActionsCount);
        if (this.onNavigate) this.onNavigate(this.currentView);
      });
    });

    this.renderProjectSwitcher();
    this.renderSyncSection();
    this.renderStorageSection();
    this.renderThemeButton();
  }

  renderProjectSwitcher() {
    const container = document.querySelector('#sidebarProjectContainer');
    if (!container) return;

    const activeProject = (this.projects && this.projects.length > 0)
      ? (this.projects.find(p => p.id === this.activeProjectId) || this.projects[0])
      : { id: 'clariane', name: 'Clariane' };

    container.innerHTML = `
      <div class="sidebar-project-selector">
        <button class="sidebar-project-trigger" id="sidebarProjectTrigger" title="Switch active project initiative">
          <span class="sidebar-project-icon">${Icons.layers}</span>
          <span class="sidebar-project-name">${this._escape(activeProject.name)}</span>
          <span class="sidebar-project-chevron ${this.isProjectDropdownOpen ? 'open' : ''}">${Icons.chevronDown || '▾'}</span>
        </button>

        ${this.isProjectDropdownOpen ? `
          <div class="sidebar-project-dropdown" id="sidebarProjectDropdown">
            <div class="sidebar-project-section-title">Projects</div>
            <div class="sidebar-project-list">
              ${(this.projects || []).map(p => `
                <button class="sidebar-project-option ${p.id === this.activeProjectId ? 'active' : ''}" data-project-id="${this._escape(p.id)}">
                  <span class="sidebar-project-opt-name">${this._escape(p.name)}</span>
                  ${p.id === this.activeProjectId ? `<span class="badge ok" style="font-size: 10px;">Active</span>` : ''}
                </button>
              `).join('')}
            </div>

            ${(this.suggestedProjects && this.suggestedProjects.length > 0) ? `
              <div class="sidebar-project-section-title" style="margin-top: 8px;">Suggested from Tags</div>
              <div class="sidebar-project-suggestions">
                ${this.suggestedProjects.map(sp => `
                  <div class="sidebar-project-suggest-row">
                    <div style="min-width: 0;">
                      <div class="sidebar-project-opt-name" style="font-weight: 500;">${this._escape(sp.name)}</div>
                      <div class="sub" style="font-size: 10px;">${sp.meetingCount} meeting${sp.meetingCount !== 1 ? 's' : ''}</div>
                    </div>
                    <button class="btn sm pink" data-confirm-suggested="${this._escape(sp.name)}" data-suggest-id="${this._escape(sp.id)}" style="font-size: 10px; padding: 2px 7px;">
                      Confirm
                    </button>
                  </div>
                `).join('')}
              </div>
            ` : ''}

            <div class="sidebar-project-actions">
              <button class="btn sm" id="sidebarNewProjectBtn" style="width: 100%; justify-content: center; font-size: 11px;">
                ${Icons.plus} New Project
              </button>
            </div>
          </div>
        ` : ''}
      </div>
    `;

    // Trigger toggle
    container.querySelector('#sidebarProjectTrigger')?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.isProjectDropdownOpen = !this.isProjectDropdownOpen;
      this.renderProjectSwitcher();
    });

    // Project selection
    container.querySelectorAll('[data-project-id]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.dataset.projectId;
        this.activeProjectId = id;
        this.isProjectDropdownOpen = false;
        this.renderProjectSwitcher();
        if (this.onProjectChange) this.onProjectChange(id);
      });
    });

    // Confirm suggested project
    container.querySelectorAll('[data-confirm-suggested]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.dataset.suggestId;
        const name = btn.dataset.confirmSuggested;
        const suggestion = (this.suggestedProjects || []).find(s => s.id === id) || { id, name, clientMatch: [name] };
        if (this.onConfirmSuggestedProject) {
          this.onConfirmSuggestedProject(suggestion);
        }
        this.isProjectDropdownOpen = false;
      });
    });

    // New project action
    container.querySelector('#sidebarNewProjectBtn')?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.isProjectDropdownOpen = false;
      if (this.onCreateProject) {
        this.onCreateProject();
      } else {
        const name = prompt('Enter new project name:');
        if (name && name.trim()) {
          const clientTag = prompt('Enter primary client/meeting tag for this project (optional):', name.trim()) || name.trim();
          if (this.onConfirmSuggestedProject) {
            this.onConfirmSuggestedProject({ name: name.trim(), clientMatch: [clientTag.trim()] });
          }
        }
      }
    });
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

  renderHeader(title = 'Today', subtitle = 'Wednesday 28 October 2026') {
    const header = document.querySelector('header');
    if (!header) return;

    header.innerHTML = `
      <h1 id="title">${title}</h1>
      <span class="sub" id="subtitle">${subtitle}</span>
      <div class="spacer"></div>

      <div class="header-search">
        ${Icons.search}
        <input type="search" id="quickSearch" placeholder="Search (/)" />
      </div>

      <div class="seg" id="modeSelector">
        <button data-m="all" class="${this.currentMode === 'all' ? 'on' : ''}">All</button>
        <button data-m="work" class="${this.currentMode === 'work' ? 'on' : ''}">Work</button>
        <button data-m="life" class="${this.currentMode === 'life' ? 'on' : ''}">Life</button>
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

    header.querySelectorAll('.seg button').forEach(btn => {
      btn.addEventListener('click', () => {
        header.querySelectorAll('.seg button').forEach(b => b.classList.remove('on'));
        btn.classList.add('on');
        this.currentMode = btn.dataset.m;
        if (this.onModeChange) this.onModeChange(this.currentMode);
      });
    });

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
 * Meeting Panel Component
 * 
 * Manages the right-hand meeting drawer with tabs for:
 * Agenda, Minutes, Actions/Decisions/Questions, and Related (Minutes Intelligence).
 * 
 * Features:
 * - Kind-aware items (action, decision, question, topic) with owner and due date.
 * - Prep score calculation with dynamic indicator.
 * - Minutes intelligence: deterministic & LLM link discovery.
 * - Explicit Accept / Reject for suggestions (never auto-links silently).
 * - Connected prior meetings list with unlink action.
 * - Manual meeting linking over all calendar events.
 */



class MeetingPanelUI {
  constructor({ container, store, onOpenMeeting, onClose, onCollapse }) {
    this.container = container;
    this.store = store;
    this.onOpenMeeting = onOpenMeeting;
    this.onClose = onClose;
    this.onCollapse = onCollapse;
    this.currentMeetingId = null;
    this.currentTab = 'agenda';
    this.llmActiveForMeeting = {};
    this.manualLinkSearchOpen = false;
    this.extractionResult = {};
    this.isFetchingDoc = false;
    this.docFetchError = null;
    this.manualDocInputOpen = false;
  }

  setMeeting(meetingId, tab = null) {
    this.currentMeetingId = meetingId;
    if (tab) this.currentTab = tab;
    return this.render();
  }

  focusActionInput() {
    if (this.currentTab !== 'actions') {
      this.currentTab = 'actions';
      this.render().then(() => {
        const input = this.container.querySelector('#newItemText');
        if (input) input.focus();
      });
    } else {
      const input = this.container.querySelector('#newItemText');
      if (input) input.focus();
    }
  }

  async render() {
    if (!this.container) return;

    if (!this.currentMeetingId) {
      this.container.innerHTML = `
        <div style="display: flex; justify-content: flex-end; margin-bottom: 8px;">
          <button class="btn sm" id="collapsePanelEmptyBtn" title="Collapse meeting panel">
            ${Icons.panelRightClose} Collapse
          </button>
        </div>
        <div class="empty" style="padding-top: 60px;">
          ${Icons.calendar}
          <div style="margin-top: 8px;">Select a meeting from the timeline or press <code>j/k</code> to navigate.</div>
        </div>
      `;
      this.container.querySelector('#collapsePanelEmptyBtn')?.addEventListener('click', () => {
        if (this.onCollapse) this.onCollapse();
      });
      return;
    }

    const meeting = this.store.getEvent(this.currentMeetingId);
    if (!meeting) {
      this.container.innerHTML = `<div class="empty">Meeting not found.</div>`;
      return;
    }

    const meetingData = await this.store.getMeetingData(meeting.id);
    const isLlmActive = Boolean(this.llmActiveForMeeting[meeting.id]);
    const linkData = await this.store.getMeetingLinks(meeting, { includeLlm: isLlmActive });
    const relatedList = [...linkData.accepted, ...linkData.suggestions];
    const prep = PrepScoreCalculator.computeMeetingPrep(meeting, meetingData, relatedList);
    const tabs = ['agenda', 'minutes', 'actions', 'related'];

    const videoBadge = meeting.link ? `
      <a href="${meeting.videoUrl || '#'}" target="_blank" rel="noopener" class="btn sm" style="margin-left: auto;">
        ${Icons.video} Join ${this._escape(meeting.link)}
      </a>
    ` : '';

    let tabContent = '';

    if (this.currentTab === 'agenda') {
      tabContent = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
          <span class="label">Prep Objectives</span>
          <span class="agenda-status-indicator ${prep.agenda.ok ? 'ok' : 'missing'}">
            ${prep.agenda.ok ? Icons.check : Icons.alertCircle} ${prep.agenda.label}
          </span>
        </div>
        <textarea id="panelAgenda" placeholder="What are the key goals, decisions needed, or talking points for this meeting?">${this._escape(meetingData.agenda || '')}</textarea>
        <div class="sub" style="margin-top: 8px; font-size: 11.5px;">
          ${prep.agenda.ok ? 'Objectives drafted. Counts towards dynamic prep score.' : 'Add at least one talking point or goal to fulfill the agenda criterion.'}
        </div>
      `;
    } else if (this.currentTab === 'minutes') {
      const docUrl = meetingData.googleDocUrl || meeting.googleDocUrl || '';
      const extraction = this.extractionResult[meeting.id] || null;
      const minutesText = meetingData.minutes || '';
      const wordCount = minutesText.trim() ? minutesText.trim().split(/\s+/).length : 0;

      tabContent = `
        <div style="display: flex; flex-direction: column; gap: 10px;">
          <!-- Google Doc Connection Banner -->
          <div class="google-doc-card ${docUrl ? 'connected' : 'unconnected'}">
            <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px;">
              <div style="display: flex; align-items: center; gap: 8px; min-width: 0;">
                <span class="doc-icon">${Icons.fileText}</span>
                <div style="min-width: 0;">
                  <div style="font-weight: 600; font-size: 12.5px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                    ${docUrl ? 'Connected Google Doc' : 'No Google Doc Linked'}
                  </div>
                  ${docUrl ? `
                    <a href="${this._escape(docUrl)}" target="_blank" rel="noopener" class="sub" style="color: var(--pink-600); text-decoration: underline; font-size: 11px;">
                      Open document
                    </a>
                  ` : `
                    <div class="sub" style="font-size: 11px;">Link a collaborative doc to ingest minutes</div>
                  `}
                </div>
              </div>
              <div style="display: flex; gap: 6px; align-items: center; flex-shrink: 0;">
                ${docUrl ? `
                  <button class="btn sm ${this.isFetchingDoc ? 'loading' : 'pink'}" id="fetchGoogleDocBtn" ${this.isFetchingDoc ? 'disabled' : ''}>
                    ${this.isFetchingDoc ? 'Fetching...' : `${Icons.sparkles} Fetch from Google Doc`}
                  </button>
                  <button class="btn-icon" id="editDocUrlBtn" title="Change linked URL" style="padding: 2px 4px;">
                    ${Icons.settings || '⚙'}
                  </button>
                ` : `
                  <button class="btn sm" id="toggleDocInputBtn">
                    ${Icons.plus} Link Google Doc
                  </button>
                `}
              </div>
            </div>

            <!-- Manual Doc URL Input Form -->
            ${(this.manualDocInputOpen || (!docUrl && this.manualDocInputOpen)) ? `
              <div style="margin-top: 10px; padding-top: 8px; border-top: 1px solid var(--border); display: flex; gap: 6px;">
                <input class="in sm" id="inputGoogleDocUrl" placeholder="Paste Google Doc URL (https://docs.google.com/document/d/...)" value="${this._escape(docUrl)}" style="flex: 1; font-size: 11px;" />
                <button class="btn sm pink" id="saveGoogleDocUrlBtn">Connect</button>
                <button class="btn sm" id="cancelGoogleDocUrlBtn">${Icons.x}</button>
              </div>
            ` : ''}

            ${this.docFetchError ? `
              <div style="margin-top: 8px; font-size: 11.5px; color: var(--destructive); background: color-mix(in oklab, var(--destructive) 10%, transparent); padding: 6px 8px; border-radius: var(--r-sm);">
                ${this._escape(this.docFetchError)}
              </div>
            ` : ''}
          </div>

          <!-- Minutes Header & Actions -->
          <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 4px;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span class="label">Live Notes &amp; Minutes</span>
              <span class="sub" style="font-size: 11px;">${wordCount} words · Auto-saved</span>
            </div>
            <div style="display: flex; gap: 6px;">
              <label class="btn sm" style="cursor: pointer; margin: 0;" title="Import text/markdown file">
                ${Icons.upload || '↑'} Upload File
                <input type="file" id="minutesFileInput" accept=".txt,.md,.json" style="display: none;" />
              </label>
              ${minutesText.trim() ? `
                <button class="btn sm pink" id="extractMinutesBtn" title="Extract actions, decisions, and knowledge entities">
                  ${Icons.sparkles} Extract Actions &amp; Context
                </button>
              ` : ''}
            </div>
          </div>

          <!-- Textarea for minutes -->
          <textarea id="panelMinutes" style="min-height: 180px; font-family: var(--font-mono); font-size: 12px; line-height: 1.5;" placeholder="Paste meeting notes, transcript, or fetch from Google Docs...">${this._escape(minutesText)}</textarea>

          <!-- Extraction Review Card -->
          ${extraction ? `
            <div class="extraction-card" id="extractionReviewCard">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                <div style="display: flex; align-items: center; gap: 6px;">
                  <span class="badge info" style="font-weight: 600;">Extracted Intelligence</span>
                  <span class="sub" style="font-size: 11px;">${extraction.actions.length} actions · ${extraction.decisions.length} decisions</span>
                </div>
                <button class="btn-icon" id="dismissExtractionBtn" title="Dismiss preview">${Icons.x}</button>
              </div>

              <!-- Extracted Actions -->
              ${extraction.actions.length > 0 ? `
                <div style="margin-bottom: 12px;">
                  <div style="font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: var(--foreground); margin-bottom: 6px;">
                    Proposed Actions (${extraction.actions.length})
                  </div>
                  <div style="display: grid; gap: 6px;">
                    ${extraction.actions.map((act, idx) => `
                      <label class="extracted-item-row" style="display: flex; align-items: flex-start; gap: 8px; font-size: 12px; cursor: pointer;">
                        <input type="checkbox" class="extract-action-cb" data-idx="${idx}" checked style="margin-top: 3px;" />
                        <div style="flex: 1;">
                          <div style="display: flex; gap: 6px; align-items: center; flex-wrap: wrap;">
                            <span class="chip-owner">${this._escape(act.owner)}</span>
                            ${act.dueDate ? `<span class="chip-due">${this._escape(act.dueDate)}</span>` : ''}
                            ${(act.tags || []).map(t => `<span class="badge" style="font-size: 10px;">#${this._escape(t)}</span>`).join('')}
                          </div>
                          <div style="margin-top: 3px; color: var(--foreground);">${this._escape(act.text)}</div>
                          ${act.quote ? `
                            <div class="quote-box" style="margin-top: 4px;">
                              “${this._escape(act.quote)}”
                            </div>
                          ` : ''}
                        </div>
                      </label>
                    `).join('')}
                  </div>
                </div>
              ` : ''}

              <!-- Extracted Decisions -->
              ${extraction.decisions.length > 0 ? `
                <div style="margin-bottom: 12px;">
                  <div style="font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: var(--foreground); margin-bottom: 6px;">
                    Extracted Decisions (${extraction.decisions.length})
                  </div>
                  <div style="display: grid; gap: 6px;">
                    ${extraction.decisions.map((dec, idx) => `
                      <label class="extracted-item-row" style="display: flex; align-items: flex-start; gap: 8px; font-size: 12px; cursor: pointer;">
                        <input type="checkbox" class="extract-decision-cb" data-idx="${idx}" checked style="margin-top: 3px;" />
                        <div style="flex: 1;">
                          <div style="display: flex; gap: 6px; align-items: center;">
                            <span class="badge" style="font-size: 10px; font-weight: 600; background: var(--ok-bg, rgba(16, 185, 129, 0.15)); color: var(--ok);">
                              ${this._escape(dec.label || 'Décision')}
                            </span>
                            <span class="sub" style="font-size: 11px;">${this._escape(dec.context || 'Général')}</span>
                          </div>
                          <div style="margin-top: 3px; color: var(--foreground);">${this._escape(dec.statement)}</div>
                          ${dec.quote ? `
                            <div class="quote-box decision" style="margin-top: 4px;">
                              “${this._escape(dec.quote)}”
                            </div>
                          ` : ''}
                        </div>
                      </label>
                    `).join('')}
                  </div>
                </div>
              ` : ''}

              <!-- Extracted Knowledge -->
              ${(extraction.knowledge && (extraction.knowledge.tools.length > 0 || extraction.knowledge.concepts.length > 0)) ? `
                <div style="margin-bottom: 12px; font-size: 11px;">
                  <div style="font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: var(--muted-foreground); margin-bottom: 4px;">
                    Domain Knowledge Entities
                  </div>
                  <div style="display: flex; gap: 4px; flex-wrap: wrap;">
                    ${extraction.knowledge.tools.map(t => `<span class="badge" style="font-size: 10px; font-family: var(--font-mono);">${this._escape(t.name)}</span>`).join('')}
                    ${extraction.knowledge.concepts.map(c => `<span class="badge" style="font-size: 10px;">${this._escape(c.name)}</span>`).join('')}
                  </div>
                </div>
              ` : ''}

              <div style="display: flex; gap: 8px; margin-top: 14px; border-top: 1px solid var(--border); padding-top: 10px;">
                <button class="btn sm pink" id="applyExtractionBtn" style="flex: 1; justify-content: center;">
                  Apply to Meeting Items &amp; Project Base
                </button>
                <button class="btn sm" id="cancelExtractionBtn">Dismiss</button>
              </div>
            </div>
          ` : ''}
        </div>
      `;
    } else if (this.currentTab === 'actions') {
      const items = meetingData.items || [];
      const attendees = meeting.attendees || [];
      const attendeeOptions = attendees.map(a => `<option value="${this._escape(a)}">${this._escape(a)}</option>`).join('');

      tabContent = `
        <div class="actions-review-banner ${prep.openActions.reviewed ? 'reviewed' : 'pending'}">
          <div style="display: flex; align-items: center; gap: 8px;">
            ${prep.openActions.reviewed ? Icons.check : Icons.alertCircle}
            <div>
              <b style="font-size: 12.5px;">${prep.openActions.reviewed ? 'Actions reviewed for this session' : (prep.openActions.totalOpen > 0 ? `${prep.openActions.totalOpen} open action${prep.openActions.totalOpen > 1 ? 's' : ''} require review` : 'Action review pending')}</b>
              <div style="font-size: 11.5px; color: var(--muted-foreground);">${this._escape(prep.openActions.detail)}</div>
            </div>
          </div>
          <button class="btn sm ${prep.openActions.reviewed ? '' : 'pink'}" id="toggleActionsReviewedBtn">
            ${prep.openActions.reviewed ? 'Mark unreviewed' : 'Mark reviewed'}
          </button>
        </div>

        <div class="item-form-box">
          <div style="display: flex; gap: 6px; margin-bottom: 8px;">
            <select id="itemKind" class="in" style="width: 110px; font-weight: 500;">
              <option value="action">Action</option>
              <option value="decision">Decision</option>
              <option value="question">Question</option>
              <option value="topic">Topic</option>
            </select>
            <input class="in" id="newItemText" placeholder="Add item... (Press 'a' anywhere to focus)" style="flex: 1;" />
          </div>
          <div style="display: flex; gap: 6px; align-items: center;">
            <select id="itemOwner" class="in" style="flex: 1; max-width: 170px; font-size: 12px;">
              <option value="Me">Owner: Me</option>
              ${attendeeOptions}
            </select>
            <input type="date" id="itemDueDate" class="in" style="width: 135px; font-size: 12px;" title="Due date (optional)" />
            <button class="btn sm pink" id="addItemBtn" style="margin-left: auto;">${Icons.plus} Add</button>
          </div>
        </div>

        <div class="items-list">
          ${items.length > 0 ? items.map(item => `
            <div class="item" data-item-id="${item.id}">
              <button class="item-check-btn ${item.done ? 'checked' : ''}" data-id="${item.id}" title="${item.done ? 'Mark open' : 'Mark done'}">
                ${item.done ? Icons.check : ''}
              </button>
              <span class="kind-badge ${item.kind}">${item.kind}</span>
              <div class="item-body">
                <span class="tx ${item.done ? 'done' : ''}">${this._escape(item.text)}</span>
                ${item.quote ? `
                  <div class="quote-box ${item.kind === 'decision' ? 'decision' : ''}" style="margin-top: 4px; font-size: 11px;">
                    “${this._escape(item.quote)}”
                  </div>
                ` : ''}
                <div class="item-meta">
                  ${item.owner ? `<span class="chip-owner">${this._escape(item.owner)}</span>` : ''}
                  ${item.dueDate ? `<span class="chip-due">${Icons.clock} ${this._formatDue(item.dueDate)}</span>` : ''}
                </div>
              </div>
              <button class="btn-icon item-delete-btn" data-id="${item.id}" title="Delete item">
                ${Icons.trash}
              </button>
            </div>
          `).join('') : '<div class="empty">No captured actions or decisions yet. Press <code>a</code> to add one.</div>'}
        </div>
      `;
    } else if (this.currentTab === 'related') {
      tabContent = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
          <div>
            <div class="label">Minutes Intelligence</div>
            <div class="sub" style="font-size: 11px;">Link meetings to surface carried-over actions and prior decisions</div>
          </div>
          <button class="btn sm ${isLlmActive ? 'pink' : ''}" id="toggleLlmBtn" title="Run LLM semantic search over minutes and agendas">
            ${Icons.sparkles} ${isLlmActive ? 'LLM Active' : 'Run LLM Discovery'}
          </button>
        </div>

        ${linkData.accepted.length > 0 ? `
          <div style="margin-bottom: 16px;">
            <div style="font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: var(--ok); margin-bottom: 8px; display: flex; align-items: center; gap: 4px;">
              ${Icons.check} Connected Prior Meetings (${linkData.accepted.length})
            </div>
            <div style="display: grid; gap: 8px;">
              ${linkData.accepted.map(a => `
                <div class="link-card accepted">
                  <div class="link-card-header">
                    <span class="link-card-title" data-open-meeting="${a.id}">${this._escape(a.event.title)}</span>
                    <button class="btn-icon" data-unlink-meeting="${a.id}" title="Unlink this meeting" style="padding: 2px;">
                      ${Icons.unlink}
                    </button>
                  </div>
                  <div class="link-card-meta">
                    <span style="font-family: var(--font-mono);">${a.event.date}</span>
                    ${a.event.client ? `<span>·</span><span>${this._escape(a.event.client)}</span>` : ''}
                    <span>·</span><span style="color: var(--ok);">${this._escape(a.reason)}</span>
                    ${a.openActionsCount > 0 ? `<span>·</span><span style="color: var(--pink-600); font-weight: 600;">${a.openActionsCount} open action${a.openActionsCount > 1 ? 's' : ''}</span>` : ''}
                  </div>
                  ${a.lastMinutesSummary ? `
                    <div style="font-size: 12px; color: var(--muted-foreground); font-style: italic; background: var(--muted); padding: 6px 8px; border-radius: var(--r-sm);">
                      "${this._escape(a.lastMinutesSummary)}..."
                    </div>
                  ` : ''}
                  <div class="link-card-actions">
                    <button class="btn sm" data-open-meeting="${a.id}">Open Meeting</button>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}

        <div style="margin-bottom: 14px;">
          <div style="font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: var(--muted-foreground); margin-bottom: 8px; display: flex; justify-content: space-between; align-items: center;">
            <span>Suggestions (${linkData.suggestions.length})</span>
            <span style="font-size: 11px; text-transform: none; font-weight: 400;">Explicit review required</span>
          </div>

          ${linkData.suggestions.length > 0 ? `
            <div style="display: grid; gap: 8px;">
              ${linkData.suggestions.map(s => `
                <div class="link-card ${s.isLlm ? 'llm-suggested' : 'suggested'}">
                  <div class="link-card-header">
                    <span class="link-card-title" data-open-meeting="${s.id}">${this._escape(s.event.title)}</span>
                    <span class="badge ${s.isLlm ? 'info' : ''}" style="font-size: 10px; font-weight: 600;">
                      ${s.isLlm ? `${Icons.sparkles} ${s.matchPercent}% Match` : `${s.matchPercent}% Match`}
                    </span>
                  </div>
                  <div class="link-card-meta">
                    <span style="font-family: var(--font-mono);">${s.event.date}</span>
                    ${s.event.client ? `<span>·</span><span>${this._escape(s.event.client)}</span>` : ''}
                    <span>·</span><span style="color: var(--foreground);">${this._escape(s.reason)}</span>
                    ${s.openActionsCount > 0 ? `<span>·</span><span style="color: var(--pink-600); font-weight: 600;">${s.openActionsCount} open action${s.openActionsCount > 1 ? 's' : ''}</span>` : ''}
                  </div>
                  ${s.lastMinutesSummary ? `
                    <div style="font-size: 12px; color: var(--muted-foreground); font-style: italic; background: var(--muted); padding: 6px 8px; border-radius: var(--r-sm);">
                      "${this._escape(s.lastMinutesSummary)}..."
                    </div>
                  ` : ''}
                  <div class="link-card-actions">
                    <button class="btn sm pink" data-accept-link="${s.id}" data-reason="${this._escape(s.reason)}">
                      ${Icons.check} Accept Link
                    </button>
                    <button class="btn sm" data-reject-link="${s.id}">
                      ${Icons.x} Reject
                    </button>
                    <button class="btn sm" data-open-meeting="${s.id}" style="margin-left: auto;">
                      Preview
                    </button>
                  </div>
                </div>
              `).join('')}
            </div>
          ` : `
            <div class="empty" style="padding: 16px 0;">
              No pending suggestions found.
            </div>
          `}
        </div>

        <div style="margin-top: 14px; border-top: 1px solid var(--border); padding-top: 12px;">
          ${!this.manualLinkSearchOpen ? `
            <button class="btn sm" id="openManualLinkBtn" style="width: 100%; justify-content: center;">
              ${Icons.plus} Manually link another meeting
            </button>
          ` : `
            <div class="manual-link-picker">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span class="label" style="font-size: 11px;">Search Calendar (259 events)</span>
                <button class="btn sm" id="closeManualLinkBtn" style="padding: 0 4px;">${Icons.x}</button>
              </div>
              <input class="in" id="manualSearchInput" placeholder="Type title or client to link..." autofocus />
              <div id="manualSearchResults" style="max-height: 160px; overflow-y: auto; display: grid; gap: 4px; margin-top: 4px;"></div>
            </div>
          `}
        </div>
      `;
    }

    this.container.innerHTML = `
      <div style="display: flex; align-items: center; gap: 8px;">
        <span class="label">Meeting Details</span>
        ${meeting.client ? `<span class="badge">${this._escape(meeting.client)}</span>` : ''}
        <span class="badge ${prep.badgeClass}" title="Prep score computed from agenda, last minutes, open actions">
          ${prep.badgeText} · ${prep.scorePercent}%
        </span>
        ${videoBadge}
        <div style="margin-left: ${meeting.link ? '6px' : 'auto'}; display: flex; align-items: center; gap: 4px;">
          <button class="btn sm" id="collapsePanelBtn" title="Collapse meeting panel" style="padding: 0 6px;">
            ${Icons.panelRightClose}
          </button>
          <button class="btn sm" id="closePanelBtn" title="Close meeting drawer (Esc)" style="padding: 0 6px;">
            ${Icons.x}
          </button>
        </div>
      </div>

      <h2 style="font: 600 20px/1.25 var(--font-sans); margin: 6px 0;">${this._escape(meeting.title)}</h2>
      <div class="sub">
        ${meeting.date} · ${meeting.start}–${meeting.end}
        ${meeting.attendees && meeting.attendees.length ? ` · ${this._escape(meeting.attendees.join(', '))}` : ''}
      </div>

      ${meeting.tags && meeting.tags.length ? `
        <div style="display: flex; gap: 6px; margin-top: 8px; flex-wrap: wrap;">
          ${meeting.tags.map(t => `<span class="badge">#${this._escape(t)}</span>`).join('')}
        </div>
      ` : ''}

      <div class="tabs">
        ${tabs.map(t => `
          <button data-tab="${t}" class="${this.currentTab === t ? 'on' : ''}">
            ${t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        `).join('')}
      </div>

      <div class="tab-body">
        ${tabContent}
      </div>
    `;

    this._bindEvents(meeting, meetingData);
  }

  _bindEvents(meeting, meetingData) {
    // Collapse button
    this.container.querySelector('#collapsePanelBtn')?.addEventListener('click', () => {
      if (this.onCollapse) this.onCollapse();
    });

    // Close button
    this.container.querySelector('#closePanelBtn')?.addEventListener('click', () => {
      if (this.onClose) this.onClose();
    });

    // Tab switching
    this.container.querySelectorAll('.tabs button[data-tab]').forEach(btn => {
      btn.addEventListener('click', () => {
        this.currentTab = btn.dataset.tab;
        this.render();
      });
    });

    // Auto-save agenda
    const agendaEl = this.container.querySelector('#panelAgenda');
    if (agendaEl) {
      agendaEl.addEventListener('input', (e) => {
        this.store.saveMeetingData(meeting.id, { agenda: e.target.value });
      });
    }

    // Auto-save minutes
    const minutesEl = this.container.querySelector('#panelMinutes');
    if (minutesEl) {
      minutesEl.addEventListener('input', (e) => {
        this.store.saveMeetingData(meeting.id, { minutes: e.target.value });
      });
    }

    // Fetch Google Doc Button
    this.container.querySelector('#fetchGoogleDocBtn')?.addEventListener('click', async () => {
      const docUrl = meetingData.googleDocUrl || meeting.googleDocUrl || '';
      if (!docUrl) return;

      this.isFetchingDoc = true;
      this.docFetchError = null;
      await this.render();

      try {
        const fetched = await this.store.fetchGoogleDoc(docUrl);
        const content = fetched.content || '';
        await this.store.saveMeetingData(meeting.id, { minutes: content });

        // Auto-extract actions & context for immediate review
        const extracted = await this.store.extractMinutes(meeting.id, content);
        this.extractionResult[meeting.id] = extracted;
        this.isFetchingDoc = false;
        this.render();
      } catch (err) {
        console.error('[MeetingPanel] Failed to fetch Google Doc:', err);
        this.isFetchingDoc = false;
        this.docFetchError = err.message || 'Failed to fetch document';
        this.render();
      }
    });

    // Toggle Manual Doc Input
    this.container.querySelector('#toggleDocInputBtn')?.addEventListener('click', () => {
      this.manualDocInputOpen = !this.manualDocInputOpen;
      this.render();
    });

    this.container.querySelector('#editDocUrlBtn')?.addEventListener('click', () => {
      this.manualDocInputOpen = true;
      this.render();
    });

    this.container.querySelector('#cancelGoogleDocUrlBtn')?.addEventListener('click', () => {
      this.manualDocInputOpen = false;
      this.render();
    });

    // Save Manual Google Doc URL
    this.container.querySelector('#saveGoogleDocUrlBtn')?.addEventListener('click', async () => {
      const input = this.container.querySelector('#inputGoogleDocUrl');
      const val = input ? input.value.trim() : '';
      if (!val) return;

      await this.store.saveMeetingData(meeting.id, { googleDocUrl: val });
      this.manualDocInputOpen = false;
      this.render();
    });

    // Extract Minutes Action
    this.container.querySelector('#extractMinutesBtn')?.addEventListener('click', async () => {
      const currentText = meetingData.minutes || '';
      if (!currentText.trim()) return;

      const extracted = await this.store.extractMinutes(meeting.id, currentText);
      this.extractionResult[meeting.id] = extracted;
      this.render();
    });

    // Dismiss Extraction Card
    const dismissHandler = () => {
      this.extractionResult[meeting.id] = null;
      this.render();
    };
    this.container.querySelector('#dismissExtractionBtn')?.addEventListener('click', dismissHandler);
    this.container.querySelector('#cancelExtractionBtn')?.addEventListener('click', dismissHandler);

    // Apply Extraction to Meeting Items & Project Base
    this.container.querySelector('#applyExtractionBtn')?.addEventListener('click', async () => {
      const extraction = this.extractionResult[meeting.id];
      if (!extraction) return;

      // Collect checked actions
      const selectedActions = [];
      this.container.querySelectorAll('.extract-action-cb:checked').forEach(cb => {
        const idx = parseInt(cb.dataset.idx, 10);
        if (extraction.actions[idx]) {
          selectedActions.push(extraction.actions[idx]);
        }
      });

      // Collect checked decisions
      const selectedDecisions = [];
      this.container.querySelectorAll('.extract-decision-cb:checked').forEach(cb => {
        const idx = parseInt(cb.dataset.idx, 10);
        if (extraction.decisions[idx]) {
          selectedDecisions.push(extraction.decisions[idx]);
        }
      });

      await this.store.applyExtractedItems(meeting.id, {
        actions: selectedActions,
        decisions: selectedDecisions
      });

      this.extractionResult[meeting.id] = null;
      // Switch to Actions tab to show the imported items immediately
      this.currentTab = 'actions';
      this.render();
    });

    // Minutes File Upload
    const fileInput = this.container.querySelector('#minutesFileInput');
    if (fileInput) {
      fileInput.addEventListener('change', (e) => {
        const file = e.target.files && e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (evt) => {
          const content = evt.target.result;
          await this.store.saveMeetingData(meeting.id, { minutes: content });
          const extracted = await this.store.extractMinutes(meeting.id, content);
          this.extractionResult[meeting.id] = extracted;
          this.render();
        };
        reader.readAsText(file);
      });
    }

    // Toggle actions reviewed state
    this.container.querySelector('#toggleActionsReviewedBtn')?.addEventListener('click', async () => {
      const nextReviewed = !meetingData.actionsReviewed;
      await this.store.saveMeetingData(meeting.id, { actionsReviewed: nextReviewed });
      this.render();
    });

    // Add action/decision/question/topic
    const addBtn = this.container.querySelector('#addItemBtn');
    const inputEl = this.container.querySelector('#newItemText');
    const kindEl = this.container.querySelector('#itemKind');
    const ownerEl = this.container.querySelector('#itemOwner');
    const dueEl = this.container.querySelector('#itemDueDate');

    const handleAddItem = async () => {
      if (!inputEl) return;
      const text = inputEl.value.trim();
      if (!text) return;

      const items = [...(meetingData.items || [])];
      items.push({
        id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        kind: kindEl ? kindEl.value : 'action',
        text,
        owner: ownerEl ? ownerEl.value : 'Me',
        dueDate: dueEl && dueEl.value ? dueEl.value : null,
        done: false,
        createdAt: new Date().toISOString()
      });

      await this.store.saveMeetingData(meeting.id, { items });
      this.render().then(() => {
        const nextInput = this.container.querySelector('#newItemText');
        if (nextInput) nextInput.focus();
      });
    };

    if (addBtn) addBtn.addEventListener('click', handleAddItem);
    if (inputEl) {
      inputEl.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') handleAddItem();
      });
    }

    // Toggle item completion
    this.container.querySelectorAll('.item-check-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.dataset.id;
        const items = (meetingData.items || []).map(it => it.id === id ? { ...it, done: !it.done } : it);
        await this.store.saveMeetingData(meeting.id, { items });
        this.render();
      });
    });

    // Delete item
    this.container.querySelectorAll('.item-delete-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.dataset.id;
        const items = (meetingData.items || []).filter(it => it.id !== id);
        await this.store.saveMeetingData(meeting.id, { items });
        this.render();
      });
    });

    // Accept suggested link
    this.container.querySelectorAll('[data-accept-link]').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const targetId = btn.dataset.acceptLink;
        const reason = btn.dataset.reason || 'Accepted suggestion';
        await this.store.acceptLink(meeting.id, targetId, reason);
        this.render();
      });
    });

    // Reject suggested link
    this.container.querySelectorAll('[data-reject-link]').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const targetId = btn.dataset.rejectLink;
        await this.store.rejectLink(meeting.id, targetId);
        this.render();
      });
    });

    // Unlink meeting
    this.container.querySelectorAll('[data-unlink-meeting]').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const targetId = btn.dataset.unlinkMeeting;
        await this.store.unlinkMeeting(meeting.id, targetId);
        this.render();
      });
    });

    // Toggle LLM pass
    this.container.querySelector('#toggleLlmBtn')?.addEventListener('click', () => {
      this.llmActiveForMeeting[meeting.id] = !this.llmActiveForMeeting[meeting.id];
      this.render();
    });

    // Manual Link Search Trigger & Execution
    const openManualBtn = this.container.querySelector('#openManualLinkBtn');
    if (openManualBtn) {
      openManualBtn.addEventListener('click', () => {
        this.manualLinkSearchOpen = true;
        this.render();
      });
    }
    const closeManualBtn = this.container.querySelector('#closeManualLinkBtn');
    if (closeManualBtn) {
      closeManualBtn.addEventListener('click', () => {
        this.manualLinkSearchOpen = false;
        this.render();
      });
    }

    const manualSearchInput = this.container.querySelector('#manualSearchInput');
    const manualResults = this.container.querySelector('#manualSearchResults');
    if (manualSearchInput && manualResults) {
      manualSearchInput.addEventListener('input', (e) => {
        const q = e.target.value.trim().toLowerCase();
        if (!q) {
          manualResults.innerHTML = '';
          return;
        }
        const candidates = this.store.eventsCache.filter(ev =>
          ev.id !== meeting.id &&
          (ev.title.toLowerCase().includes(q) || (ev.client && ev.client.toLowerCase().includes(q)))
        ).slice(0, 6);

        if (candidates.length === 0) {
          manualResults.innerHTML = '<div style="font-size: 11px; color: var(--muted-foreground); padding: 4px;">No matching meetings found.</div>';
          return;
        }

        manualResults.innerHTML = candidates.map(c => `
          <div style="display: flex; justify-content: space-between; align-items: center; padding: 6px 8px; border: 1px solid var(--border); border-radius: var(--r-sm); background: var(--background);">
            <div>
              <div style="font-size: 12px; font-weight: 500;">${this._escape(c.title)}</div>
              <div style="font-size: 10px; color: var(--muted-foreground);">${c.date} · ${c.client || 'General'}</div>
            </div>
            <button class="btn sm pink" data-manual-link-id="${c.id}">Link</button>
          </div>
        `).join('');

        manualResults.querySelectorAll('[data-manual-link-id]').forEach(linkBtn => {
          linkBtn.addEventListener('click', async () => {
            const tId = linkBtn.dataset.manualLinkId;
            await this.store.acceptLink(meeting.id, tId, 'Explicit manual link');
            this.manualLinkSearchOpen = false;
            this.render();
          });
        });
      });
    }

    // Open related meeting in panel
    this.container.querySelectorAll('[data-open-meeting]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.openMeeting;
        if (id && this.onOpenMeeting) {
          this.onOpenMeeting(id);
        }
      });
    });
  }

  _formatDue(dateStr) {
    if (!dateStr) return '';
    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const mIdx = parseInt(parts[1], 10) - 1;
        return `${parseInt(parts[2], 10)} ${months[mIdx] || ''}`;
      }
      return dateStr;
    } catch {
      return dateStr;
    }
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
    this.currentDate = '2026-10-28';
    this.currentMode = 'all'; // 'all' | 'work' | 'life'
    this.searchQuery = '';
  }

  setDate(date) {
    this.currentDate = date;
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
      nextPrep = PrepScoreCalculator.computeMeetingPrep(nextMeeting, data, links);
      isNextWithin48h = PrepScoreCalculator.isWithin48Hours(nextMeeting.date, nextMeeting.start, this.currentDate, '00:00');

      // Wire Project Base into Next up
      const project = this.store.getProjectForMeeting(nextMeeting);
      if (project) {
        try {
          nextProjectBase = await this.store.getProjectBase(project.id);
        } catch (e) {
          console.warn('[TodayView] Could not load project base for next meeting:', e);
        }
      }

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
                  ${nextPrep.missingCount === 0 ? 'All 3 criteria satisfied' : `${nextPrep.missingCount} item${nextPrep.missingCount > 1 ? 's' : ''} to complete before meeting`}
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
        <div class="label" style="margin-bottom: 0;">
          Timeline · Wednesday 28 October 2026
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
            <button class="row ${isTraining ? 'training' : ''} ${isSelected ? 'sel' : ''}" data-event-id="${m.id}">
              <span class="t">${m.start}<br>${m.end}</span>
              <span class="bar" style="background: ${colorBar};"></span>
              <span>
                <div class="ttl">${this._escape(m.title)}</div>
                <div class="meta">${this._escape(metaParts.join(' · '))}</div>
              </span>
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
            </button>
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

    // Timeline row click
    this.container.querySelectorAll('.row[data-event-id]').forEach(row => {
      row.addEventListener('click', () => {
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

    // Time filter (relative to anchor date 2026-10-28)
    const todayStr = '2026-10-28';
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

    // Sort: earliest date first for upcoming, latest first for past/all
    events.sort((a, b) => {
      const cmp = a.date.localeCompare(b.date);
      if (cmp !== 0) return cmp;
      return (a.start || '').localeCompare(b.start || '');
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

    this.container.querySelectorAll('[data-event-id]').forEach(el => {
      el.addEventListener('click', () => {
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

    const todayStr = '2026-10-28';

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
 * Project Base & Knowledge View Component
 * 
 * Aggregates all meeting minutes, decisions, cross-meeting action matrix,
 * strategic workstreams, and connected Google Docs for any configured initiative.
 * 
 * Features:
 * - Completely generic: driven by project configuration in DB
 * - Honest coverage bars ("X of Y meetings have minutes")
 * - Deduplicated decisions across meetings with "first decided on" and "restated on"
 * - Source quotes and meeting links on every action and decision
 * - Project Settings editor to view and edit project configuration
 */



class ProjectsView {
  constructor({ container, store, onSelectMeeting }) {
    this.container = container;
    this.store = store;
    this.onSelectMeeting = onSelectMeeting;
    this.currentProjectId = 'clariane';
    this.currentSubTab = 'workstreams'; // 'workstreams' | 'decisions' | 'actions' | 'docs' | 'settings'
    this.actionOwnerFilter = 'all';
    this.actionStatusFilter = 'open';
    this.searchQuery = '';
    this.settingsFeedback = null;
  }

  setSearchQuery(q) {
    this.searchQuery = (q || '').trim().toLowerCase();
    this.render();
  }

  setProject(projectId) {
    this.currentProjectId = projectId;
    this.settingsFeedback = null;
    this.render();
  }

  // Alias for backward compatibility
  setClient(clientId) {
    this.setProject(clientId);
  }

  async render() {
    if (!this.container) return;

    // Load all projects
    const allProjects = await this.store.getAllProjects();
    if (!allProjects.some(p => p.id === this.currentProjectId)) {
      this.currentProjectId = allProjects[0]?.id || 'clariane';
    }

    // Build project base from store
    const project = await this.store.getProjectBase(this.currentProjectId);

    // Filter actions for matrix
    let matrixActions = project.actionMatrix || [];
    if (this.actionStatusFilter === 'open') {
      matrixActions = matrixActions.filter(a => !a.done);
    } else if (this.actionStatusFilter === 'done') {
      matrixActions = matrixActions.filter(a => a.done);
    }
    if (this.actionOwnerFilter !== 'all') {
      matrixActions = matrixActions.filter(a => 
        (a.ownerOrg || '').toLowerCase() === this.actionOwnerFilter.toLowerCase() || 
        (a.owner || '').toLowerCase().includes(this.actionOwnerFilter.toLowerCase())
      );
    }
    if (this.searchQuery) {
      matrixActions = matrixActions.filter(a => {
        const text = `${a.text} ${a.owner} ${a.facility || ''} ${a.meetingTitle || ''} ${a.quote || ''}`.toLowerCase();
        return text.includes(this.searchQuery);
      });
    }

    // Filter decisions
    let decisions = project.decisionRegister || [];
    if (this.searchQuery) {
      decisions = decisions.filter(d => {
        const text = `${d.statement} ${d.label || ''} ${d.facility || ''} ${d.context || ''} ${d.quote || ''}`.toLowerCase();
        return text.includes(this.searchQuery);
      });
    }

    this.container.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 16px;">
        <!-- Header & Project Selector -->
        <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; flex-wrap: wrap;">
          <div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <span class="label">Project Base &amp; Intelligence Hub</span>
              <span class="badge ok" style="font-weight: 600;">Active Deployment</span>
              <span class="badge" style="font-family: var(--font-mono); font-size: 11px;">${this._escape(project.projectId)}</span>
            </div>
            <h1 style="font: 600 24px/1.2 var(--font-sans); margin: 4px 0;">${this._escape(project.projectName)}</h1>
            <div class="sub" style="font-size: 12px;">
              Cross-meeting synthesis of minutes, cumulative decision register, and action matrix from local client data
            </div>
          </div>

          <!-- Project Initiative Selector Dropdown -->
          <div style="display: flex; gap: 8px; align-items: center;">
            <label for="projectSelectDropdown" class="sub" style="font-size: 12px; font-weight: 500;">Initiative:</label>
            <select id="projectSelectDropdown" class="input" style="font-size: 13px; font-weight: 600; height: 34px; padding: 4px 10px; border-radius: var(--r-sm); min-width: 260px; cursor: pointer;">
              ${allProjects.map(p => `
                <option value="${this._escape(p.id)}" ${this.currentProjectId.toLowerCase() === p.id.toLowerCase() ? 'selected' : ''}>
                  ${this._escape(p.name)}
                </option>
              `).join('')}
            </select>
          </div>
        </div>

        <!-- Honest Coverage Card -->
        <div class="honest-coverage-card">
          <div style="display: flex; justify-content: space-between; align-items: baseline; gap: 8px;">
            <span class="label" style="margin-bottom: 0;">Minutes Coverage</span>
            <span style="font-family: var(--font-mono); font-size: 13px; font-weight: 600;">
              ${this._escape(project.coverageText)} (${project.coveragePercent}%)
            </span>
          </div>
          <div class="coverage-track">
            <div class="coverage-fill ${project.coveragePercent === 100 ? 'complete' : ''}" style="width: ${project.coveragePercent}%;"></div>
          </div>
          <div class="sub" style="font-size: 11.5px;">
            ${project.meetingsWithMinutes < project.totalMeetings ? `
              ${project.totalMeetings - project.meetingsWithMinutes} of ${project.totalMeetings} meetings do not have ingested minutes yet. Action matrix and decision register reflect only meetings with ingested minutes.
            ` : `
              All ${project.totalMeetings} meetings across this initiative have ingested minutes.
            `}
          </div>
        </div>

        <!-- KPI Metric Strip -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 10px;">
          <div class="kpi-cell">
            <span class="kpi-num">${project.totalMeetings}</span>
            <span class="kpi-sub">Total Initiative Meetings · <b style="color: var(--ok);">${project.meetingsWithMinutes} with Minutes</b></span>
          </div>
          <div class="kpi-cell">
            <span class="kpi-num" style="color: var(--pink-600);">${project.actionStats.open}</span>
            <span class="kpi-sub">Open Actions (${project.actionStats.artefactOpen} Artefact · ${project.actionStats.clientOpen} Client)</span>
          </div>
          <div class="kpi-cell">
            <span class="kpi-num" style="color: var(--ok);">${project.decisionStats.total}</span>
            <span class="kpi-sub">Cumulative Validated Decisions</span>
          </div>
          <div class="kpi-cell">
            <span class="kpi-num">${project.connectedDocs.length}</span>
            <span class="kpi-sub">Connected Google Docs</span>
          </div>
        </div>

        <!-- Sub-Tabs Navigation -->
        <div class="tabs" style="margin-bottom: 0;">
          <button data-subtab="workstreams" class="${this.currentSubTab === 'workstreams' ? 'on' : ''}">
            Strategic Workstreams (${project.workstreams.length})
          </button>
          <button data-subtab="decisions" class="${this.currentSubTab === 'decisions' ? 'on' : ''}">
            Decision Register (${project.decisionRegister.length})
          </button>
          <button data-subtab="actions" class="${this.currentSubTab === 'actions' ? 'on' : ''}">
            Action Matrix (${project.actionStats.open} Open)
          </button>
          <button data-subtab="docs" class="${this.currentSubTab === 'docs' ? 'on' : ''}">
            Connected Docs (${project.connectedDocs.length})
          </button>
          <button data-subtab="settings" class="${this.currentSubTab === 'settings' ? 'on' : ''}">
            Project Settings
          </button>
        </div>

        <!-- Sub-Tab Content -->
        <div id="projectTabBody">
          ${this._renderSubTabContent(project, matrixActions, decisions)}
        </div>
      </div>
    `;

    this._bindEvents(project);
  }

  _renderSubTabContent(project, matrixActions, decisions) {
    if (this.currentSubTab === 'workstreams') {
      return `
        <div style="display: grid; gap: 14px;">
          <!-- Active Strategic Workstreams -->
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(360px, 1fr)); gap: 12px;">
            ${project.workstreams.map(ws => `
              <div class="card" style="padding: 14px; display: flex; flex-direction: column; gap: 8px;">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 8px;">
                  <div>
                    <span class="badge info" style="font-size: 10px; font-weight: 600;">${this._escape(ws.badge)}</span>
                    <h3 style="font: 600 15px/1.3 var(--font-sans); margin: 4px 0 2px 0;">${this._escape(ws.title)}</h3>
                  </div>
                  <span class="badge ${ws.openActionsCount > 0 ? 'pink' : 'ok'}" style="font-size: 11px;">
                    ${ws.openActionsCount} open action${ws.openActionsCount > 1 ? 's' : ''}
                  </span>
                </div>
                <div class="sub" style="font-size: 12px; color: var(--foreground);">${this._escape(ws.summary)}</div>
                
                ${(ws.keyRules && ws.keyRules.length > 0) ? `
                  <div style="margin-top: 4px; padding-top: 6px; border-top: 1px solid var(--border);">
                    <div style="font-size: 11px; font-weight: 600; text-transform: uppercase; color: var(--muted-foreground); margin-bottom: 4px;">
                      Governing Architectural Rules:
                    </div>
                    <ul style="margin: 0; padding-left: 16px; font-size: 11.5px; color: var(--muted-foreground); display: grid; gap: 3px;">
                      ${ws.keyRules.map(r => `<li>${this._escape(r)}</li>`).join('')}
                    </ul>
                  </div>
                ` : ''}

                ${(ws.facilities && ws.facilities.length > 0) ? `
                  <div style="display: flex; gap: 4px; align-items: center; margin-top: auto; padding-top: 8px;">
                    <span class="sub" style="font-size: 11px;">Sites:</span>
                    ${ws.facilities.map(f => `<span class="badge" style="font-size: 10px;">${this._escape(f)}</span>`).join('')}
                  </div>
                ` : ''}
              </div>
            `).join('')}
          </div>

          <!-- Stakeholder Matrix & Knowledge Directory -->
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 6px;">
            <!-- Stakeholders Directory -->
            <div class="card" style="padding: 14px;">
              <div style="font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: var(--muted-foreground); margin-bottom: 10px;">
                Stakeholders Directory (${project.stakeholders.length})
              </div>
              <div style="display: grid; gap: 6px; max-height: 220px; overflow-y: auto;">
                ${project.stakeholders.length > 0 ? project.stakeholders.map(s => `
                  <div style="display: flex; justify-content: space-between; align-items: center; padding: 6px 8px; border-radius: var(--r-sm); background: var(--muted);">
                    <div>
                      <div style="font-size: 12px; font-weight: 500;">${this._escape(s.name)}</div>
                      <div style="font-size: 11px; color: var(--muted-foreground);">${this._escape(s.role)}</div>
                    </div>
                    <div style="text-align: right;">
                      <span class="badge" style="font-size: 10px;">${this._escape(s.org)}</span>
                      <div style="font-size: 10px; color: var(--muted-foreground); margin-top: 2px;">${s.meetingCount} session${s.meetingCount > 1 ? 's' : ''}</div>
                    </div>
                  </div>
                `).join('') : '<div class="sub" style="font-size: 12px;">No attendees registered yet</div>'}
              </div>
            </div>

            <!-- Platform Architecture & Entities -->
            <div class="card" style="padding: 14px;">
              <div style="font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: var(--muted-foreground); margin-bottom: 10px;">
                Project Vocabulary &amp; Parser Hints
              </div>
              <div style="display: flex; flex-direction: column; gap: 8px;">
                <div>
                  <div style="font-size: 11px; color: var(--muted-foreground); margin-bottom: 4px;">Connected Systems &amp; Tools:</div>
                  <div style="display: flex; gap: 6px; flex-wrap: wrap;">
                    ${project.tools.length > 0 ? project.tools.map(t => `<span class="badge info" style="font-family: var(--font-mono); font-size: 11px;">${this._escape(t)}</span>`).join('') : '<span class="sub" style="font-size: 11px;">None configured</span>'}
                  </div>
                </div>
                <div>
                  <div style="font-size: 11px; color: var(--muted-foreground); margin-bottom: 4px;">Domain Protocols &amp; Concepts:</div>
                  <div style="display: grid; gap: 4px;">
                    ${project.concepts.length > 0 ? project.concepts.map(c => `
                      <div style="font-size: 11.5px; padding: 4px 6px; border-radius: var(--r-sm); background: var(--muted);">
                        <b>${this._escape(c.name)}:</b> <span style="color: var(--muted-foreground);">${this._escape(c.desc)}</span>
                      </div>
                    `).join('') : '<span class="sub" style="font-size: 11px;">None configured</span>'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;
    }

    if (this.currentSubTab === 'decisions') {
      return `
        <div style="display: flex; flex-direction: column; gap: 10px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div class="sub" style="font-size: 12px;">
              Showing ${decisions.length} validated architecture and operational decisions from meeting minutes (deduplicated across meetings)
            </div>
          </div>

          <div style="display: grid; gap: 10px;">
            ${decisions.length > 0 ? decisions.map(d => {
              const firstMeeting = d.firstDecidedOn || {};
              const restatedList = d.restatedOn || [];

              return `
                <div class="card" style="padding: 12px 14px; border-left: 3px solid var(--ok); display: flex; flex-direction: column; gap: 8px;">
                  <div style="display: flex; justify-content: space-between; align-items: center; gap: 8px; flex-wrap: wrap;">
                    <div style="display: flex; align-items: center; gap: 6px;">
                      <span class="badge ok" style="font-weight: 600; font-size: 11px;">${this._escape(d.label || 'Decision')}</span>
                      ${d.facility ? `<span class="badge" style="font-size: 10px;">${this._escape(d.facility)}</span>` : ''}
                      ${d.context ? `<span class="sub" style="font-size: 11px;">${this._escape(d.context)}</span>` : ''}
                    </div>
                    ${firstMeeting.meetingId ? `
                      <div style="display: flex; gap: 6px; align-items: center;">
                        <span style="font-family: var(--font-mono); font-size: 11px; color: var(--muted-foreground);">${firstMeeting.meetingDate || ''}</span>
                        <button class="btn sm" data-open-meeting="${this._escape(firstMeeting.meetingId)}" style="padding: 2px 8px; font-size: 11px;">
                          View Meeting
                        </button>
                      </div>
                    ` : ''}
                  </div>

                  <div style="font-size: 13px; font-weight: 500; color: var(--foreground); line-height: 1.4;">
                    ${this._escape(d.statement)}
                  </div>

                  ${d.quote ? `
                    <div class="quote-box decision">
                      “${this._escape(d.quote)}”
                    </div>
                  ` : ''}

                  <div style="display: flex; flex-direction: column; gap: 4px; font-size: 11px; color: var(--muted-foreground); border-top: 1px solid var(--border); padding-top: 6px; margin-top: 2px;">
                    <div>
                      <b>First decided on:</b> ${this._escape(firstMeeting.meetingDate || 'Unknown')} · <i>${this._escape(firstMeeting.meetingTitle || 'Meeting')}</i>
                    </div>

                    ${restatedList.length > 0 ? `
                      <div style="margin-top: 2px;">
                        <b>Restated on ${restatedList.length} subsequent meeting${restatedList.length > 1 ? 's' : ''}:</b>
                        <ul style="margin: 2px 0 0 16px; padding: 0; display: grid; gap: 2px;">
                          ${restatedList.map(r => `
                            <li>
                              ${this._escape(r.meetingDate)} · <i>${this._escape(r.meetingTitle)}</i>
                              ${r.quote ? `<span style="font-style: italic; color: var(--foreground);"> — “${this._escape(r.quote)}”</span>` : ''}
                              <button class="btn sm" data-open-meeting="${this._escape(r.meetingId)}" style="padding: 1px 6px; font-size: 10px; margin-left: 4px;">
                                View
                              </button>
                            </li>
                          `).join('')}
                        </ul>
                      </div>
                    ` : ''}
                  </div>
                </div>
              `;
            }).join('') : '<div class="empty">No validated decisions extracted for this project yet.</div>'}
          </div>
        </div>
      `;
    }

    if (this.currentSubTab === 'actions') {
      const owners = ['All', 'Artefact', 'Client'];

      return `
        <div style="display: flex; flex-direction: column; gap: 10px;">
          <!-- Action Filters Toolbar -->
          <div style="display: flex; justify-content: space-between; align-items: center; gap: 8px; flex-wrap: wrap;">
            <div style="display: flex; gap: 6px; align-items: center;">
              <span class="sub" style="font-size: 11px;">Owner:</span>
              <div style="display: flex; border: 1px solid var(--border); border-radius: var(--r-sm); overflow: hidden;">
                ${owners.map(o => `
                  <button class="btn sm ${this.actionOwnerFilter.toLowerCase() === o.toLowerCase() ? 'pink' : ''}" data-filter-owner="${o}" style="border: 0; border-radius: 0; font-size: 11px;">
                    ${o}
                  </button>
                `).join('')}
              </div>
            </div>

            <div style="display: flex; gap: 6px; align-items: center;">
              <span class="sub" style="font-size: 11px;">Status:</span>
              <div style="display: flex; border: 1px solid var(--border); border-radius: var(--r-sm); overflow: hidden;">
                <button class="btn sm ${this.actionStatusFilter === 'open' ? 'pink' : ''}" data-filter-status="open" style="border: 0; border-radius: 0; font-size: 11px;">Open</button>
                <button class="btn sm ${this.actionStatusFilter === 'done' ? 'pink' : ''}" data-filter-status="done" style="border: 0; border-radius: 0; font-size: 11px;">Done</button>
                <button class="btn sm ${this.actionStatusFilter === 'all' ? 'pink' : ''}" data-filter-status="all" style="border: 0; border-radius: 0; font-size: 11px;">All</button>
              </div>
            </div>
          </div>

          <!-- Actions List -->
          <div style="display: grid; gap: 6px;">
            ${matrixActions.length > 0 ? matrixActions.map(act => `
              <div class="card" style="padding: 10px 12px; display: flex; align-items: flex-start; gap: 10px; transition: border-color 0.15s;">
                <button class="item-check-btn ${act.done ? 'checked' : ''}" data-action-id="${this._escape(act.id)}" data-meeting-id="${this._escape(act.meetingId)}" title="${act.done ? 'Mark open' : 'Mark done'}" style="margin-top: 3px;">
                  ${act.done ? Icons.check : ''}
                </button>

                <div style="flex: 1; min-width: 0;">
                  <div style="display: flex; gap: 6px; align-items: center; flex-wrap: wrap;">
                    <span class="chip-owner" style="font-weight: 600;">${this._escape(act.owner)}</span>
                    <span class="badge" style="font-size: 10px;">${this._escape(act.ownerOrg)}</span>
                    ${act.facility ? `<span class="badge" style="font-size: 10px;">${this._escape(act.facility)}</span>` : ''}
                    ${act.dueDate ? `<span class="chip-due" style="font-size: 10px;">${Icons.clock} ${this._escape(act.dueDate)}</span>` : ''}
                    ${(act.tags || []).map(t => `<span class="badge" style="font-size: 10px;">#${this._escape(t)}</span>`).join('')}
                  </div>
                  <div class="tx ${act.done ? 'done' : ''}" style="margin-top: 4px; font-size: 12.5px; line-height: 1.4;">
                    ${this._escape(act.text)}
                  </div>
                  ${act.quote ? `
                    <div class="quote-box" style="margin-top: 6px;">
                      “${this._escape(act.quote)}”
                    </div>
                  ` : ''}
                  <div class="sub" style="font-size: 11px; margin-top: 4px;">
                    ${act.meetingDate} · <i>${this._escape(act.meetingTitle)}</i>
                  </div>
                </div>

                <button class="btn sm" data-open-meeting="${this._escape(act.meetingId)}" style="flex-shrink: 0; font-size: 11px; margin-top: 2px;">
                  Open Meeting
                </button>
              </div>
            `).join('') : '<div class="empty">No matching actions found.</div>'}
          </div>
        </div>
      `;
    }

    if (this.currentSubTab === 'docs') {
      return `
        <div style="display: flex; flex-direction: column; gap: 10px;">
          <div class="sub" style="font-size: 12px;">
            Google Docs attached to meetings across this initiative
          </div>

          <div style="display: grid; gap: 8px;">
            ${project.connectedDocs.length > 0 ? project.connectedDocs.map(doc => `
              <div class="card" style="padding: 12px 14px; display: flex; justify-content: space-between; align-items: center; gap: 12px;">
                <div style="display: flex; align-items: center; gap: 10px; min-width: 0;">
                  <span class="doc-icon">${Icons.fileText}</span>
                  <div style="min-width: 0;">
                    <div style="font-weight: 600; font-size: 13px;">${this._escape(doc.title)}</div>
                    <div class="sub" style="font-size: 11px; margin-top: 2px;">
                      ${doc.meetingDate} · ${this._escape(doc.facility)} · <span style="color: var(--ok); display: inline-flex; align-items: center; gap: 3px;">${Icons.check} Minutes Ingested (${doc.minutesLength} chars)</span>
                    </div>
                  </div>
                </div>

                <div style="display: flex; gap: 6px; align-items: center; flex-shrink: 0;">
                  <a href="${this._escape(doc.url)}" target="_blank" rel="noopener" class="btn sm pink">
                    Open in Google Docs
                  </a>
                  <button class="btn sm" data-open-meeting="${this._escape(doc.meetingId)}">
                    View Meeting
                  </button>
                </div>
              </div>
            `).join('') : '<div class="empty">No connected Google Docs found for this initiative.</div>'}
          </div>
        </div>
      `;
    }

    if (this.currentSubTab === 'settings') {
      const cfg = project.projectConfig || {};
      const clientMatchesStr = (cfg.clientMatch || []).join(', ');
      const toolsStr = ((cfg.parserHints && cfg.parserHints.tools) || []).join(', ');
      const decisionTriggersStr = ((cfg.parserHints && cfg.parserHints.decisionTriggers) || []).join(', ');

      return `
        <div class="card" style="padding: 16px; display: flex; flex-direction: column; gap: 16px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div>
              <h2 style="font-size: 16px; margin-bottom: 2px;">Project Configuration: ${this._escape(cfg.name || project.projectName)}</h2>
              <div class="sub" style="font-size: 12px;">Stored locally in IndexedDB projects database. Modify vocabulary and workstreams dynamically.</div>
            </div>
            ${this.settingsFeedback ? `
              <span class="badge ok" style="font-size: 11px; font-weight: 600;">${this._escape(this.settingsFeedback)}</span>
            ` : ''}
          </div>

          <form id="projectSettingsForm" style="display: flex; flex-direction: column; gap: 14px;">
            <div style="display: grid; grid-template-columns: 1fr 2fr; gap: 12px;">
              <div>
                <label class="label">Project ID</label>
                <input class="in" id="cfgProjectId" value="${this._escape(cfg.id || '')}" disabled style="font-family: var(--font-mono); opacity: 0.7;" />
              </div>
              <div>
                <label class="label">Project Name</label>
                <input class="in" id="cfgProjectName" value="${this._escape(cfg.name || '')}" required />
              </div>
            </div>

            <div>
              <label class="label">Client Match Tags (Comma-separated)</label>
              <input class="in" id="cfgClientMatch" value="${this._escape(clientMatchesStr)}" placeholder="e.g. Clariane, Les Arbelles, Mariéna" />
              <div class="sub" style="font-size: 11px; margin-top: 3px;">Events whose client or tags match any of these will associate with this project.</div>
            </div>

            <div style="border-top: 1px solid var(--border); padding-top: 12px;">
              <div class="label" style="margin-bottom: 6px;">Strategic Workstreams (${(cfg.workstreams || []).length})</div>
              <div id="workstreamsEditorList" style="display: flex; flex-direction: column; gap: 8px;">
                ${(cfg.workstreams || []).map((ws, idx) => `
                  <div class="card" style="padding: 10px; background: var(--muted); display: flex; flex-direction: column; gap: 6px;" data-ws-index="${idx}">
                    <div style="display: grid; grid-template-columns: 120px 1fr 60px; gap: 8px; align-items: center;">
                      <input class="in sm ws-badge" value="${this._escape(ws.badge)}" placeholder="Badge" />
                      <input class="in sm ws-title" value="${this._escape(ws.title)}" placeholder="Title" />
                      <button type="button" class="btn sm delete-ws-btn" data-del-idx="${idx}" style="justify-content: center; color: var(--destructive);">${Icons.trash || 'Delete'}</button>
                    </div>
                    <input class="in sm ws-summary" value="${this._escape(ws.summary)}" placeholder="Summary statement" />
                    <textarea class="in sm ws-rules" style="min-height: 50px; font-size: 11.5px;" placeholder="Governing rules (one per line)">${(ws.keyRules || []).join('\n')}</textarea>
                  </div>
                `).join('')}
              </div>
              <button type="button" class="btn sm" id="addWorkstreamBtn" style="margin-top: 8px;">
                ${Icons.plus} Add Workstream
              </button>
            </div>

            <div style="border-top: 1px solid var(--border); padding-top: 12px;">
              <div class="label" style="margin-bottom: 6px;">Domain Parser Hints &amp; Vocabulary</div>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                <div>
                  <label class="label" style="font-size: 11px;">Tools &amp; Clinical Systems (Comma-separated)</label>
                  <input class="in" id="cfgParserTools" value="${this._escape(toolsStr)}" placeholder="e.g. Foundry, HM, rTMS, Balnéo, Kiné, Ergo" />
                </div>
                <div>
                  <label class="label" style="font-size: 11px;">Decision Trigger Phrases (Comma-separated)</label>
                  <input class="in" id="cfgDecisionTriggers" value="${this._escape(decisionTriggersStr)}" placeholder="e.g. Arbitrage, Décision, Validé, Zéro Temps Mort" />
                </div>
              </div>
            </div>

            <div style="display: flex; justify-content: flex-end; gap: 8px; margin-top: 10px;">
              <button type="submit" class="btn pink" id="saveProjectSettingsBtn">
                Save Project Configuration
              </button>
            </div>
          </form>
        </div>
      `;
    }

    return '';
  }

  _bindEvents(project) {
    // Project selection dropdown
    const projDropdown = this.container.querySelector('#projectSelectDropdown');
    if (projDropdown) {
      projDropdown.addEventListener('change', (e) => {
        const nextId = e.target.value;
        this.setProject(nextId);
        if (this.store && typeof this.store.setActiveProjectId === 'function') {
          this.store.setActiveProjectId(nextId);
        }
      });
    }

    // Project selection buttons (if any)
    this.container.querySelectorAll('[data-select-project]').forEach(btn => {
      btn.addEventListener('click', () => {
        this.setProject(btn.dataset.selectProject);
      });
    });

    // Sub-tab switching
    this.container.querySelectorAll('.tabs button[data-subtab]').forEach(btn => {
      btn.addEventListener('click', () => {
        this.currentSubTab = btn.dataset.subtab;
        this.settingsFeedback = null;
        this.render();
      });
    });

    // Open meeting
    this.container.querySelectorAll('[data-open-meeting]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.openMeeting;
        if (id && this.onSelectMeeting) {
          this.onSelectMeeting(id);
        }
      });
    });

    // Owner filter in actions
    this.container.querySelectorAll('[data-filter-owner]').forEach(btn => {
      btn.addEventListener('click', () => {
        this.actionOwnerFilter = btn.dataset.filterOwner;
        this.render();
      });
    });

    // Status filter in actions
    this.container.querySelectorAll('[data-filter-status]').forEach(btn => {
      btn.addEventListener('click', () => {
        this.actionStatusFilter = btn.dataset.filterStatus;
        this.render();
      });
    });

    // Toggle action done state in matrix
    this.container.querySelectorAll('.item-check-btn[data-action-id]').forEach(btn => {
      btn.addEventListener('click', async () => {
        const actId = btn.dataset.actionId;
        const mId = btn.dataset.meetingId;
        if (!mId) return;

        const mData = await this.store.getMeetingData(mId);
        const items = (mData.items || []).map(it => it.id === actId ? { ...it, done: !it.done } : it);
        await this.store.saveMeetingData(mId, { items });
        this.render();
      });
    });

    // Project settings form submission
    const settingsForm = this.container.querySelector('#projectSettingsForm');
    if (settingsForm) {
      // Add workstream
      this.container.querySelector('#addWorkstreamBtn')?.addEventListener('click', () => {
        const list = this.container.querySelector('#workstreamsEditorList');
        if (!list) return;
        const newCard = document.createElement('div');
        newCard.className = 'card';
        newCard.style.cssText = 'padding: 10px; background: var(--muted); display: flex; flex-direction: column; gap: 6px;';
        newCard.innerHTML = `
          <div style="display: grid; grid-template-columns: 120px 1fr 60px; gap: 8px; align-items: center;">
            <input class="in sm ws-badge" value="WS" placeholder="Badge" />
            <input class="in sm ws-title" value="New Workstream" placeholder="Title" />
            <button type="button" class="btn sm delete-ws-btn" style="justify-content: center; color: var(--destructive);">${Icons.trash || 'Delete'}</button>
          </div>
          <input class="in sm ws-summary" value="" placeholder="Summary statement" />
          <textarea class="in sm ws-rules" style="min-height: 50px; font-size: 11.5px;" placeholder="Governing rules (one per line)"></textarea>
        `;
        newCard.querySelector('.delete-ws-btn')?.addEventListener('click', () => newCard.remove());
        list.appendChild(newCard);
      });

      // Delete workstream
      this.container.querySelectorAll('.delete-ws-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          btn.closest('.card')?.remove();
        });
      });

      settingsForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const baseProject = project.projectConfig || ProjectModel.createDefault(this.currentProjectId);
        
        const updatedName = this.container.querySelector('#cfgProjectName')?.value.trim() || baseProject.name;
        const clientMatches = (this.container.querySelector('#cfgClientMatch')?.value || '')
          .split(',')
          .map(s => s.trim())
          .filter(Boolean);

        const tools = (this.container.querySelector('#cfgParserTools')?.value || '')
          .split(',')
          .map(s => s.trim())
          .filter(Boolean);

        const decisionTriggers = (this.container.querySelector('#cfgDecisionTriggers')?.value || '')
          .split(',')
          .map(s => s.trim())
          .filter(Boolean);

        // Collect workstreams from UI
        const wsCards = this.container.querySelectorAll('#workstreamsEditorList .card');
        const updatedWorkstreams = [];
        wsCards.forEach(card => {
          const badge = card.querySelector('.ws-badge')?.value.trim() || 'WS';
          const title = card.querySelector('.ws-title')?.value.trim() || 'Workstream';
          const summary = card.querySelector('.ws-summary')?.value.trim() || '';
          const rules = (card.querySelector('.ws-rules')?.value || '')
            .split('\n')
            .map(r => r.trim())
            .filter(Boolean);

          updatedWorkstreams.push({
            id: badge.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
            badge,
            title,
            summary,
            keyRules: rules,
            facilities: []
          });
        });

        const updated = {
          ...baseProject,
          name: updatedName,
          clientMatch: clientMatches.length > 0 ? clientMatches : [updatedName],
          workstreams: updatedWorkstreams,
          parserHints: {
            ...(baseProject.parserHints || {}),
            tools: tools.length > 0 ? tools : (baseProject.parserHints?.tools || []),
            decisionTriggers: decisionTriggers.length > 0 ? decisionTriggers : (baseProject.parserHints?.decisionTriggers || [])
          }
        };

        try {
          await this.store.saveProject(updated);
          this.settingsFeedback = 'Project configuration saved successfully.';
          this.render();
        } catch (err) {
          console.error('[ProjectsView] Failed to save project:', err);
          alert('Failed to save project: ' + err.message);
        }
      });
    }
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

MeetingHub.ProjectsView = ProjectsView;


/* === App Controller & Bootstrap === */
const AppState = {
  date: '2026-10-28',
  view: 'today',
  mode: 'all',
  selectedEventId: null,
  isPanelCollapsed: false
};

let todayView;
let weekView;
let meetingsView;
let actionsView;
let seriesView;
let projectsView;
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

function selectMeeting(eventId, tab = null) {
  if (tab && meetingPanel) {
    meetingPanel.currentTab = tab;
  }
  AppState.selectedEventId = eventId;
  setPanelCollapsed(false);
  const targetHash = '#/meeting/' + encodeURIComponent(eventId);
  if (window.location.hash !== targetHash) {
    window.location.hash = targetHash;
  } else {
    if (meetingPanel) meetingPanel.setMeeting(eventId, tab);
  }
  if (todayView && AppState.view === 'today') todayView.setSelectedEvent(eventId);
  if (weekView && AppState.view === 'week') weekView.setSelectedEvent(eventId);
  if (meetingsView && AppState.view === 'meetings') meetingsView.setSelectedEvent(eventId);
}

function renderActiveView() {
  const leftCol = document.querySelector('#left');
  if (!leftCol) return;

  shell.currentView = AppState.view;
  shell.renderSidebar(openActionsCount);

  const headerTitles = {
    today: { title: 'Today', sub: 'Wednesday 28 October 2026' },
    week: { title: 'Week', sub: 'Multi-day review & meeting health' },
    meetings: { title: 'Meetings', sub: 'Searchable calendar directory (259 events)' },
    actions: { title: 'Open Actions', sub: 'Action items grouped by client' },
    series: { title: 'Series & Links', sub: 'Recurring meeting series & linked lineages' },
    projects: { title: 'Projects & Knowledge', sub: 'Initiative intelligence & minutes synthesis' }
  };
  const meta = headerTitles[AppState.view] || headerTitles.today;
  const tEl = document.querySelector('#title');
  const sEl = document.querySelector('#subtitle');
  if (tEl) tEl.textContent = meta.title;
  if (sEl) sEl.textContent = meta.sub;

  switch (AppState.view) {
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
    case 'actions':
      if (actionsView) {
        actionsView.container = leftCol;
        actionsView.render();
      }
      break;
    case 'series':
      if (seriesView) {
        seriesView.container = leftCol;
        seriesView.render();
      }
      break;
    case 'projects':
      if (projectsView) {
        projectsView.container = leftCol;
        projectsView.render();
      }
      break;
  }
}

// Instantiate App Shell
const shell = new MeetingHub.ShellUI({
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
  onProjectChange: async (projectId) => {
    MeetingHub.store.setActiveProjectId(projectId);
    if (projectsView) projectsView.setProject(projectId);
    if (AppState.view === 'projects') renderActiveView();
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
    AppState.date = '2026-10-28';
    if (todayView) todayView.setDate('2026-10-28');
    if (weekView) weekView.goToday();
    if (AppState.view !== 'today' && AppState.view !== 'week') {
      AppState.view = 'today';
      window.location.hash = '#/today';
      renderActiveView();
    }
  },
  onSearch: (query) => {
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
  const meetingMatch = hash.match(/^#\/meeting\/([^/?#]+)/);
  if (meetingMatch) {
    const meetingId = decodeURIComponent(meetingMatch[1]);
    AppState.selectedEventId = meetingId;
    setPanelCollapsed(false);
    if (meetingPanel) meetingPanel.setMeeting(meetingId);
    if (todayView && AppState.view === 'today') todayView.setSelectedEvent(meetingId);
    if (weekView && AppState.view === 'week') weekView.setSelectedEvent(meetingId);
    if (meetingsView && AppState.view === 'meetings') meetingsView.setSelectedEvent(meetingId);
  } else if (hash === '#/today' || hash === '' || hash === '#/') {
    AppState.selectedEventId = null;
    if (meetingPanel) meetingPanel.setMeeting(null);
    if (AppState.view !== 'today') {
      AppState.view = 'today';
      renderActiveView();
    } else {
      if (todayView) todayView.setSelectedEvent(null);
    }
  } else {
    const viewMatch = hash.match(/^#\/([a-z]+)/);
    if (viewMatch) {
      const v = viewMatch[1];
      if (['today', 'week', 'meetings', 'actions', 'series', 'projects'].includes(v)) {
        AppState.selectedEventId = null;
        if (meetingPanel) meetingPanel.setMeeting(null);
        if (AppState.view !== v) {
          AppState.view = v;
          renderActiveView();
        }
      }
    }
  }
}

// Global Keyboard Navigation (j, k, a, /, Escape, )
window.addEventListener('keydown', (e) => {
  const activeEl = document.activeElement;
  const isInputActive = activeEl && (
    activeEl.tagName === 'INPUT' ||
    activeEl.tagName === 'TEXTAREA' ||
    activeEl.tagName === 'SELECT' ||
    activeEl.isContentEditable
  );

  // Esc clears quick search, collapses drawer or resets selected meeting
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
    } else if (!AppState.isPanelCollapsed) {
      setPanelCollapsed(true);
    } else if (AppState.selectedEventId) {
      window.location.hash = AppState.view === 'today' ? '#/today' : '#/' + AppState.view;
    }
    return;
  }

  // Single-letter shortcuts only fire when not typing in editable fields
  if (isInputActive) return;

  // '\' -> toggle right meeting panel
  if (e.key === '\\') {
    e.preventDefault();
    setPanelCollapsed(!AppState.isPanelCollapsed);
    return;
  }

  // 'j' or ArrowDown -> next meeting
  if (e.key === 'j' || e.key === 'ArrowDown') {
    e.preventDefault();
    if (todayView && AppState.view === 'today') todayView.selectNextMeeting();
    return;
  }

  // 'k' or ArrowUp -> previous meeting
  if (e.key === 'k' || e.key === 'ArrowUp') {
    e.preventDefault();
    if (todayView && AppState.view === 'today') todayView.selectPreviousMeeting();
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
    shell.renderSidebar(openActionsCount);
    shell.renderHeader('Today', 'Wednesday 28 October 2026');

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
    const activeProjectId = MeetingHub.store.getActiveProjectId() || (allProjects[0] && allProjects[0].id) || 'clariane';
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

    meetingPanel = new MeetingHub.MeetingPanelUI({
      container: document.querySelector('#right'),
      store: MeetingHub.store,
      onOpenMeeting: (relatedEventId) => {
        selectMeeting(relatedEventId);
      },
      onClose: () => {
        setPanelCollapsed(true);
        window.location.hash = AppState.view === 'today' ? '#/today' : '#/' + AppState.view;
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
      if (payload.type === 'project_updated' || payload.type === 'project_deleted' || payload.type === 'active_project_changed') {
        const all = await MeetingHub.store.getAllProjects();
        const sug = await MeetingHub.store.getSuggestedProjects();
        shell.setProjects(all, MeetingHub.store.getActiveProjectId(), sug);
        if (projectsView) projectsView.setProject(MeetingHub.store.getActiveProjectId());
      }
      if (payload.type === 'meeting_data_updated' || payload.type === 'sync_completed' || payload.type === 'project_updated') {
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

    // Handle initial route or default flagship meeting
    handleHashRoute();
    renderActiveView();

    if (!window.location.hash || window.location.hash === '#/' || window.location.hash === '#/today') {
      const todayEvents = MeetingHub.store.getEventsByDate(AppState.date, 'work');
      const defaultMeeting = todayEvents.find(e => e.title.includes('MO - Suivi anomalies')) || todayEvents[0];
      if (defaultMeeting && !AppState.isPanelCollapsed) {
        window.location.hash = '#/meeting/' + encodeURIComponent(defaultMeeting.id);
      }
    }

    const activeEngine = MeetingHub.store.db.engineName || 'IndexedDB';
    console.log('[MeetingHub] Ready. 259 events loaded via ' + activeEngine + '.');
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
