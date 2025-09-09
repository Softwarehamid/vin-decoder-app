import { VinLookup } from '../types/vin';

const DB_NAME = 'VinDecoderDB';
const DB_VERSION = 1;
const STORE_NAME = 'vinLookups';

/**
 * Opens IndexedDB connection
 */
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('vin', 'vin', { unique: false });
        store.createIndex('timestamp', 'timestamp', { unique: false });
      }
    };
  });
}

/**
 * Saves a VIN lookup to IndexedDB
 */
export async function saveLookup(lookup: VinLookup): Promise<void> {
  const db = await openDB();
  const transaction = db.transaction([STORE_NAME], 'readwrite');
  const store = transaction.objectStore(STORE_NAME);
  
  return new Promise((resolve, reject) => {
    const request = store.put(lookup);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

/**
 * Gets all VIN lookups from IndexedDB
 */
export async function getAllLookups(): Promise<VinLookup[]> {
  const db = await openDB();
  const transaction = db.transaction([STORE_NAME], 'readonly');
  const store = transaction.objectStore(STORE_NAME);
  
  return new Promise((resolve, reject) => {
    const request = store.getAll();
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result || []);
  });
}

/**
 * Searches for VIN lookups by VIN
 */
export async function searchLookups(query: string): Promise<VinLookup[]> {
  const allLookups = await getAllLookups();
  const lowerQuery = query.toLowerCase();
  
  return allLookups.filter(lookup => 
    lookup.vin.toLowerCase().includes(lowerQuery) ||
    lookup.result?.Make?.toLowerCase().includes(lowerQuery) ||
    lookup.result?.Model?.toLowerCase().includes(lowerQuery)
  );
}

/**
 * Clears all VIN lookups from IndexedDB
 */
export async function clearAllLookups(): Promise<void> {
  const db = await openDB();
  const transaction = db.transaction([STORE_NAME], 'readwrite');
  const store = transaction.objectStore(STORE_NAME);
  
  return new Promise((resolve, reject) => {
    const request = store.clear();
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

/**
 * Imports multiple lookups to IndexedDB
 */
export async function importLookups(lookups: VinLookup[]): Promise<void> {
  const db = await openDB();
  const transaction = db.transaction([STORE_NAME], 'readwrite');
  const store = transaction.objectStore(STORE_NAME);
  
  return new Promise((resolve, reject) => {
    let completed = 0;
    const total = lookups.length;
    
    if (total === 0) {
      resolve();
      return;
    }
    
    lookups.forEach(lookup => {
      const request = store.put(lookup);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        completed++;
        if (completed === total) {
          resolve();
        }
      };
    });
  });
}