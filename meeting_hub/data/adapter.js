/**
 * Database Adapter Interface & Implementations
 * 
 * Provides a thin adapter layer so the data store can be backed by:
 * - IndexedDB (default browser persistent storage)
 * - LocalStorageAdapter (zero-hang fallback if IndexedDB is blocked or times out)
 * - MemoryAdapter (in-memory mock for sandbox or headless testing)
 * - SQLite WASM / Remote API (future Step roadmap)
 */

export class DatabaseAdapter {
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
export class IndexedDBAdapter extends DatabaseAdapter {
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
export class LocalStorageAdapter extends DatabaseAdapter {
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
export class MemoryAdapter extends DatabaseAdapter {
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
