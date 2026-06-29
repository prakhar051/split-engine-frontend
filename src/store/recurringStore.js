import { create } from 'zustand';
import api from '../api/api';
import { useGroupStore } from './groupStore';

export const useRecurringStore = create((set, get) => ({
  recurringExpenses: [],
  selectedRecurringExpense: null,
  previews: [],
  health: null,
  metrics: null,
  isLoading: false,
  error: null,
  createSuccess: false,

  clearRecurringState: () => set({
    selectedRecurringExpense: null,
    previews: [],
    error: null,
    createSuccess: false,
    isLoading: false
  }),

  getRecurringExpenses: async (groupId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get(`/groups/${groupId}/recurring`);
      set({
        recurringExpenses: response.data.templates || [],
        isLoading: false
      });
    } catch (err) {
      set({
        error: err.response?.data?.message || 'Failed to fetch recurring templates',
        isLoading: false
      });
    }
  },

  createRecurringExpense: async (groupId, data) => {
    set({ isLoading: true, error: null, createSuccess: false });
    try {
      const response = await api.post(`/groups/${groupId}/recurring`, data);
      const newTemplate = response.data.template;
      set((state) => ({
        recurringExpenses: [newTemplate, ...state.recurringExpenses],
        createSuccess: true,
        isLoading: false
      }));
      // Invalidate dashboard caches
      useGroupStore.getState().clearCache();
      return newTemplate;
    } catch (err) {
      set({
        error: err.response?.data?.message || 'Failed to create recurring template',
        isLoading: false
      });
      throw err;
    }
  },

  updateRecurringExpense: async (id, data) => {
    set({ isLoading: true, error: null });
    const previousTemplates = get().recurringExpenses;
    
    try {
      const response = await api.put(`/recurring/${id}`, data);
      const updatedTemplate = response.data.template;

      set((state) => ({
        recurringExpenses: state.recurringExpenses.map((t) => t.id === id ? updatedTemplate : t),
        selectedRecurringExpense: state.selectedRecurringExpense?.id === id ? updatedTemplate : state.selectedRecurringExpense,
        isLoading: false
      }));

      useGroupStore.getState().clearCache();
      return updatedTemplate;
    } catch (err) {
      set({
        recurringExpenses: previousTemplates, // Rollback
        error: err.response?.data?.message || 'Failed to update recurring template',
        isLoading: false
      });
      throw err;
    }
  },

  deleteRecurringExpense: async (id) => {
    set({ isLoading: true, error: null });
    const previousTemplates = get().recurringExpenses;

    // Optimistic Update
    set((state) => ({
      recurringExpenses: state.recurringExpenses.filter((t) => t.id !== id),
      selectedRecurringExpense: state.selectedRecurringExpense?.id === id ? null : state.selectedRecurringExpense
    }));

    try {
      await api.delete(`/recurring/${id}`);
      set({ isLoading: false });
      useGroupStore.getState().clearCache();
    } catch (err) {
      set({
        recurringExpenses: previousTemplates, // Rollback
        error: err.response?.data?.message || 'Failed to delete recurring template',
        isLoading: false
      });
      throw err;
    }
  },

  toggleRecurringExpense: async (id, isActive) => {
    const previousTemplates = get().recurringExpenses;

    // Optimistic Update
    set((state) => ({
      recurringExpenses: state.recurringExpenses.map((t) => t.id === id ? { ...t, isActive } : t),
      selectedRecurringExpense: state.selectedRecurringExpense?.id === id ? { ...state.selectedRecurringExpense, isActive } : state.selectedRecurringExpense
    }));

    try {
      const response = await api.patch(`/recurring/${id}/toggle`, { isActive });
      const updated = response.data.template;
      
      set((state) => ({
        recurringExpenses: state.recurringExpenses.map((t) => t.id === id ? updated : t),
        selectedRecurringExpense: state.selectedRecurringExpense?.id === id ? updated : state.selectedRecurringExpense
      }));

      useGroupStore.getState().clearCache();
    } catch (err) {
      set({
        recurringExpenses: previousTemplates, // Rollback
        error: err.response?.data?.message || 'Failed to toggle status',
        isLoading: false
      });
      throw err;
    }
  },

  runNow: async (id, advanceSchedule = false) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post(`/recurring/${id}/run-now`, { advanceSchedule });
      set({ isLoading: false });
      // Invalidate caches and reload dashboard
      useGroupStore.getState().clearCache();
      return response.data.expense;
    } catch (err) {
      set({
        error: err.response?.data?.message || 'Failed to trigger run now execution',
        isLoading: false
      });
      throw err;
    }
  },

  retryFailedExecution: async (executionId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post(`/recurring/executions/${executionId}/retry`);
      set({ isLoading: false });
      useGroupStore.getState().clearCache();
      return response.data.expense;
    } catch (err) {
      set({
        error: err.response?.data?.message || 'Failed to retry execution',
        isLoading: false
      });
      throw err;
    }
  },

  previewDates: async (recurrenceType, interval, startDate) => {
    try {
      const response = await api.post('/recurring/preview', {
        recurrenceType,
        interval: parseInt(interval, 10),
        startDate
      });
      set({ previews: response.data.previews || [] });
      return response.data.previews;
    } catch (err) {
      console.error('Failed to load recurrence dates previews:', err);
    }
  },

  getHealth: async () => {
    try {
      const response = await api.get('/recurring/health');
      set({ health: response.data.health });
    } catch (err) {
      console.error('Failed to fetch scheduler health:', err);
    }
  },

  getMetrics: async () => {
    try {
      const response = await api.get('/recurring/metrics');
      set({ metrics: response.data.metrics });
    } catch (err) {
      console.error('Failed to fetch scheduler metrics:', err);
    }
  }
}));
