import { openDB } from 'idb';

const DB_NAME = 'ExpenseSplitOffline';
const DB_VERSION = 1;

export async function getDB() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('pendingRequests')) {
        db.createObjectStore('pendingRequests', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('cachedDrafts')) {
        db.createObjectStore('cachedDrafts', { keyPath: 'id' });
      }
    },
  });
}

// Pending Requests API
export async function getPendingRequests() {
  const db = await getDB();
  return db.getAll('pendingRequests');
}

export async function savePendingRequest(request) {
  const db = await getDB();
  await db.put('pendingRequests', {
    ...request,
    retryCount: request.retryCount || 0,
    status: request.status || 'PENDING',
    createdAt: request.createdAt || Date.now(),
  });
}

export async function deletePendingRequest(id) {
  const db = await getDB();
  await db.delete('pendingRequests', id);
}

export async function clearPendingRequests() {
  const db = await getDB();
  const tx = db.transaction('pendingRequests', 'readwrite');
  await tx.objectStore('pendingRequests').clear();
  await tx.done;
}

// Cached Drafts API
export async function getDraft(id) {
  const db = await getDB();
  return db.get('cachedDrafts', id);
}

export async function saveDraft(id, data) {
  const db = await getDB();
  await db.put('cachedDrafts', { id, data, updatedAt: Date.now() });
}

export async function deleteDraft(id) {
  const db = await getDB();
  await db.delete('cachedDrafts', id);
}
