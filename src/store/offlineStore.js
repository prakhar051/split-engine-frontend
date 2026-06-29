import { create } from 'zustand';
import {
  getPendingRequests,
  savePendingRequest,
  deletePendingRequest,
  clearPendingRequests,
} from '../services/offlineQueue';
import api from '../api/api';

const registerBackgroundSync = async () => {
  if ('serviceWorker' in navigator && 'SyncManager' in window) {
    try {
      const reg = await navigator.serviceWorker.ready;
      await reg.sync.register('sync-offline-requests');
      console.log('PWA Background Sync tag registered: sync-offline-requests');
    } catch (err) {
      console.warn('Background Sync registration failed, using online fallback:', err);
    }
  }
};

export const useOfflineStore = create((set, get) => ({
  isOnline: navigator.onLine,
  pendingRequests: [],
  failedRequests: [],
  syncing: false,
  lastSync: null,

  initialize: async () => {
    // Load initial queue
    const requests = await getPendingRequests();
    const pending = requests.filter((r) => r.status === 'PENDING');
    const failed = requests.filter((r) => r.status === 'FAILED');

    set({
      isOnline: navigator.onLine,
      pendingRequests: pending,
      failedRequests: failed,
    });

    // Listen to network events
    window.addEventListener('online', () => {
      set({ isOnline: true });
      get().syncQueue();
    });

    window.addEventListener('offline', () => {
      set({ isOnline: false });
    });

    // Listen to messages from the Service Worker Background Sync
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'SYNC_QUEUE') {
          console.log('Received SYNC_QUEUE message from Service Worker');
          get().syncQueue();
        }
      });
    }
  },

  addRequest: async (config) => {
    const newRequest = {
      id: Math.random().toString(36).substr(2, 9) + '-' + Date.now(),
      url: config.url,
      method: config.method,
      headers: {
        'Content-Type': config.headers?.['Content-Type'] || 'application/json',
      },
      body: config.data,
      createdAt: Date.now(),
      retryCount: 0,
      status: 'PENDING',
      errorDetails: null,
    };

    await savePendingRequest(newRequest);

    const requests = await getPendingRequests();
    set({
      pendingRequests: requests.filter((r) => r.status === 'PENDING'),
      failedRequests: requests.filter((r) => r.status === 'FAILED'),
    });

    // Register Background Sync if supported
    await registerBackgroundSync();

    return newRequest;
  },

  removeRequest: async (id) => {
    await deletePendingRequest(id);
    const requests = await getPendingRequests();
    set({
      pendingRequests: requests.filter((r) => r.status === 'PENDING'),
      failedRequests: requests.filter((r) => r.status === 'FAILED'),
    });
  },

  retryRequest: async (id) => {
    const requests = await getPendingRequests();
    const req = requests.find((r) => r.id === id);
    if (req) {
      req.status = 'PENDING';
      req.retryCount = 0;
      req.errorDetails = null;
      await savePendingRequest(req);

      const updated = await getPendingRequests();
      set({
        pendingRequests: updated.filter((r) => r.status === 'PENDING'),
        failedRequests: updated.filter((r) => r.status === 'FAILED'),
      });

      // Register Background Sync if supported
      await registerBackgroundSync();

      // Trigger sync if online
      if (get().isOnline) {
        get().syncQueue();
      }
    }
  },

  discardRequest: async (id) => {
    await get().removeRequest(id);
  },

  clearQueue: async () => {
    await clearPendingRequests();
    set({ pendingRequests: [], failedRequests: [] });
  },

  syncQueue: async () => {
    const { syncing, isOnline } = get();
    if (syncing || !isOnline) return;

    set({ syncing: true });

    try {
      let requests = await getPendingRequests();
      let pending = requests.filter((r) => r.status === 'PENDING');

      while (pending.length > 0) {
        const req = pending[0];
        try {
          await api({
            url: req.url,
            method: req.method,
            data: req.body,
            headers: {
              ...req.headers,
              _isReplay: 'true'
            },
          });

          await deletePendingRequest(req.id);
        } catch (error) {
          const status = error.response?.status;
          const errorMessage = error.response?.data?.message || error.message || 'Network error';

          if (status === 400 || status === 409 || status === 422) {
            req.status = 'FAILED';
            req.errorDetails = errorMessage;
            await savePendingRequest(req);
          } else {
            req.retryCount += 1;
            if (req.retryCount >= 5) {
              req.status = 'FAILED';
              req.errorDetails = `Failed after 5 retries: ${errorMessage}`;
            }
            await savePendingRequest(req);
          }
        }

        requests = await getPendingRequests();
        pending = requests.filter((r) => r.status === 'PENDING');

        set({
          pendingRequests: pending,
          failedRequests: requests.filter((r) => r.status === 'FAILED'),
        });
      }

      set({ lastSync: Date.now() });
    } catch (syncError) {
      console.error('Offline sync failed:', syncError);
    } finally {
      set({ syncing: false });
    }
  },
}));
