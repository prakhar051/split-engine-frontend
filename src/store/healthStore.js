import { create } from 'zustand';
import api from '../api/api';

export const useHealthStore = create((set, get) => ({
  health: null,
  ready: null,
  metrics: null,
  version: null,
  loading: false,
  error: null,

  fetchHealth: async () => {
    try {
      const res = await api.get('/health');
      set({ health: res.data });
    } catch (err) {
      set({ health: { success: false, status: 'DOWN' } });
    }
  },

  fetchReady: async () => {
    try {
      const res = await api.get('/ready');
      set({ ready: res.data });
    } catch (err) {
      set({ ready: { success: false, status: 'NOT_READY', components: { database: 'DOWN', redis: 'DOWN' } } });
    }
  },

  fetchMetrics: async () => {
    try {
      const res = await api.get('/metrics');
      set({ metrics: res.data });
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to fetch metrics' });
    }
  },

  fetchVersion: async () => {
    try {
      const res = await api.get('/version');
      set({ version: res.data });
    } catch (err) {
      console.error('Failed to fetch system version details:', err);
    }
  },

  fetchAll: async () => {
    set({ loading: true, error: null });
    try {
      await Promise.all([
        get().fetchHealth(),
        get().fetchReady(),
        get().fetchMetrics(),
        get().fetchVersion()
      ]);
    } catch (err) {
      set({ error: 'Failed to fetch system health statistics.' });
    } finally {
      set({ loading: false });
    }
  }
}));
