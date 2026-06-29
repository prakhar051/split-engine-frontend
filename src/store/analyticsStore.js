import { create } from 'zustand';
import api from '../api/api';

export const useAnalyticsStore = create((set, get) => ({
  // ── State ──────────────────────────────────────────────
  dashboard: null,
  heatmap: null,
  merchants: [],
  categories: null,
  forecast: null,
  insights: null,
  budgets: [],
  insightsHistory: [],
  health: null,
  isLoading: false,
  error: null,
  pagination: { page: 1, limit: 10, totalCount: 0, totalPages: 1 },

  // ── Actions ────────────────────────────────────────────
  fetchDashboard: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.get('/v1/analytics/dashboard');
      set({
        dashboard: res.data?.data !== undefined ? res.data.data : res.data,
        isLoading: false
      });
    } catch (err) {
      set({
        error: err.response?.data?.message || 'Failed to fetch dashboard analytics',
        isLoading: false
      });
    }
  },

  fetchHeatmap: async (params = {}) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.get('/v1/analytics/heatmap', { params });
      set({
        heatmap: res.data?.data !== undefined ? res.data.data : res.data,
        isLoading: false
      });
    } catch (err) {
      set({
        error: err.response?.data?.message || 'Failed to fetch spending heatmap',
        isLoading: false
      });
    }
  },

  fetchMerchants: async (params = {}) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.get('/v1/analytics/merchant-ranking', { params });
      set({
        merchants: res.data?.data !== undefined ? res.data.data : (res.data?.merchants || []),
        pagination: res.data?.pagination || { page: 1, limit: 10, totalCount: 0, totalPages: 1 },
        isLoading: false
      });
    } catch (err) {
      set({
        error: err.response?.data?.message || 'Failed to fetch merchant ranking',
        isLoading: false
      });
    }
  },

  fetchCategories: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.get('/v1/analytics/categories');
      set({
        categories: res.data?.data !== undefined ? res.data.data : res.data,
        isLoading: false
      });
    } catch (err) {
      set({
        error: err.response?.data?.message || 'Failed to fetch category analytics',
        isLoading: false
      });
    }
  },

  fetchForecast: async (params = {}) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.get('/v1/analytics/forecast', { params });
      set({
        forecast: res.data?.data !== undefined ? res.data.data : res.data,
        isLoading: false
      });
    } catch (err) {
      set({
        error: err.response?.data?.message || 'Failed to fetch forecast',
        isLoading: false
      });
    }
  },

  fetchInsights: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.get('/v1/analytics/insights');
      set({
        insights: res.data?.data !== undefined ? res.data.data : res.data,
        isLoading: false
      });
    } catch (err) {
      set({
        error: err.response?.data?.message || 'Failed to fetch AI insights',
        isLoading: false
      });
    }
  },

  fetchAIHistory: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.get('/v1/analytics/ai-history');
      set({
        insightsHistory: res.data?.history !== undefined ? res.data.history : (res.data?.data || []),
        isLoading: false
      });
    } catch (err) {
      set({
        error: err.response?.data?.message || 'Failed to fetch AI insights history',
        isLoading: false
      });
    }
  },

  fetchBudgets: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.get('/v1/budgets');
      set({
        budgets: res.data?.budgets !== undefined ? res.data.budgets : (res.data?.data || []),
        isLoading: false
      });
    } catch (err) {
      set({
        error: err.response?.data?.message || 'Failed to fetch budgets',
        isLoading: false
      });
    }
  },

  createBudget: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.post('/v1/budgets', data);
      const newBudget = res.data?.budget || res.data;
      
      // Update local state list optimistically
      set((state) => ({
        budgets: [...state.budgets, newBudget],
        isLoading: false
      }));

      // Refresh list to ensure computed fields (like spentAmount) are fully correct
      await get().fetchBudgets();
      
      return res.data;
    } catch (err) {
      set({
        error: err.response?.data?.message || 'Failed to create budget',
        isLoading: false
      });
      throw err;
    }
  },

  updateBudget: async (id, data, version) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.put(`/v1/budgets/${id}`, data, {
        headers: {
          'If-Match': version
        }
      });
      const updatedBudget = res.data?.budget || res.data;
      
      // Update local state list optimistically
      set((state) => ({
        budgets: state.budgets.map((b) => (b.id === id ? updatedBudget : b)),
        isLoading: false
      }));

      // Refresh list to ensure calculated values and versions are in sync
      await get().fetchBudgets();
      
      return res.data;
    } catch (err) {
      set({
        error: err.response?.data?.message || 'Failed to update budget',
        isLoading: false
      });
      throw err; // Propagate error (e.g. 409 Conflict) for optimistic concurrency handling in components
    }
  },

  deleteBudget: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await api.delete(`/v1/budgets/${id}`);
      
      // Update local state list optimistically
      set((state) => ({
        budgets: state.budgets.filter((b) => b.id !== id),
        isLoading: false
      }));

      // Refresh list to ensure correctness
      await get().fetchBudgets();
    } catch (err) {
      set({
        error: err.response?.data?.message || 'Failed to delete budget',
        isLoading: false
      });
      throw err;
    }
  },

  fetchHealth: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.get('/v1/analytics/health');
      set({
        health: res.data?.health !== undefined ? res.data.health : res.data,
        isLoading: false
      });
    } catch (err) {
      set({
        error: err.response?.data?.message || 'Failed to fetch health report',
        isLoading: false
      });
    }
  }
}));
