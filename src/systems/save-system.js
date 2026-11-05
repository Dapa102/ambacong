const DB_NAME = 'ambacong_db';
const DB_VERSION = 1;
const STORE_NAME = 'saves';
const FALLBACK_KEY = 'ambacong.save.';

let dbPromise = null;

const openDb = () => {
  if (dbPromise) return dbPromise;
  if (!('indexedDB' in window)) {
    dbPromise = Promise.reject(new Error('IndexedDB tidak tersedia'));
    return dbPromise;
  }
  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'slot' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => {
      dbPromise = null;
      reject(request.error);
    };
  });
  return dbPromise;
};

const fallbackKey = (slot) => `${FALLBACK_KEY}${slot}`;

const readFromStore = (db, slot) =>
  new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const request = transaction.objectStore(STORE_NAME).get(slot);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

const writeToStore = (db, data) =>
  new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    transaction.objectStore(STORE_NAME).put(data);
    transaction.oncomplete = () => resolve(true);
    transaction.onerror = () => reject(transaction.error);
  });

const deleteFromStore = (db, slot) =>
  new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    transaction.objectStore(STORE_NAME).delete(slot);
    transaction.oncomplete = () => resolve(true);
    transaction.onerror = () => reject(transaction.error);
  });

export const createSavePackage = (slot, gameState) => ({
  slot,
  schemaVersion: 1,
  chapterName: 'Rumah Sakit Tua',
  createdAt: gameState.createdAt ?? Date.now(),
  updatedAt: Date.now(),
  gameState,
});

export class SaveSystem {
  async save(slot, gameState) {
    const data = createSavePackage(slot, gameState);
    try {
      const db = await openDb();
      return await writeToStore(db, data);
    } catch {
      try {
        localStorage.setItem(fallbackKey(slot), JSON.stringify(data));
        return true;
      } catch {
        return false;
      }
    }
  }

  async load(slot) {
    try {
      const db = await openDb();
      const record = await readFromStore(db, slot);
      if (record?.gameState) return record.gameState;
    } catch {
      // fallback below
    }
    try {
      const raw = localStorage.getItem(fallbackKey(slot));
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.gameState) return parsed.gameState;
      }
    } catch {
      // no save available
    }
    return null;
  }

  async hasSave(slot) {
    return Boolean(await this.load(slot));
  }

  async clear(slot) {
    try {
      const db = await openDb();
      await deleteFromStore(db, slot);
    } catch {
      // ignore
    }
    try {
      localStorage.removeItem(fallbackKey(slot));
    } catch {
      // ignore
    }
  }
}

export const SAVE_SLOT = 1;
