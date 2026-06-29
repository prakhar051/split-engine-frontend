import { create } from 'zustand';
import api from '../api/api';

export const useSettlementStore = create((set, get) => ({
  balances: [],
  settlements: [],
  selectedSettlement: null,
  isLoading: false,
  error: null,
  uploadProgress: 0,
  selectedGroupId: null,
  lastSettlementFetch: null,
  lastBalanceFetch: null,

  clearSettlementState: () => set({
    selectedSettlement: null,
    error: null,
    uploadProgress: 0,
    isLoading: false
  }),

  getBalances: async (groupId, force = false) => {
    const { selectedGroupId, lastBalanceFetch, balances } = get();
    const cacheAge = Date.now() - (lastBalanceFetch || 0);

    if (!force && selectedGroupId === groupId && balances.length > 0 && cacheAge < 60000) {
      return;
    }

    set({ isLoading: true, error: null });
    try {
      const response = await api.get(`/groups/${groupId}/balances`);
      set({
        balances: response.data.balances || [],
        selectedGroupId: groupId,
        lastBalanceFetch: Date.now(),
        isLoading: false
      });
    } catch (err) {
      set({
        error: err.response?.data?.message || 'Failed to fetch group balances',
        isLoading: false
      });
    }
  },

  getSettlements: async (groupId, force = false) => {
    const { selectedGroupId, lastSettlementFetch, settlements } = get();
    const cacheAge = Date.now() - (lastSettlementFetch || 0);

    if (!force && selectedGroupId === groupId && settlements.length > 0 && cacheAge < 60000) {
      return;
    }

    set({ isLoading: true, error: null });
    try {
      const response = await api.get(`/groups/${groupId}/settlements`);
      set({
        settlements: response.data.settlements || [],
        selectedGroupId: groupId,
        lastSettlementFetch: Date.now(),
        isLoading: false
      });
    } catch (err) {
      set({
        error: err.response?.data?.message || 'Failed to fetch group settlements',
        isLoading: false
      });
    }
  },

  generateSettlements: async (groupId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post(`/groups/${groupId}/settlements/generate`);
      const newSettlements = response.data.settlements || [];
      
      set({
        settlements: newSettlements,
        lastSettlementFetch: Date.now()
      });

      // Refreshes balances immediately without full-page reload
      await get().getBalances(groupId, true);
      set({ isLoading: false });
    } catch (err) {
      set({
        error: err.response?.data?.message || 'Failed to generate optimized settlements',
        isLoading: false
      });
      throw err;
    }
  },

  uploadProof: async (settlementId, file) => {
    set({ isLoading: true, error: null, uploadProgress: 0 });
    try {
      const formData = new FormData();
      formData.append('files', file);

      const response = await api.patch(`/settlements/${settlementId}/proof`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          set({ uploadProgress: percentCompleted });
        }
      });

      const updatedSettlement = response.data.settlement;

      // Optimistic update of local settlements list and selected settlement
      set((state) => ({
        selectedSettlement: updatedSettlement,
        settlements: state.settlements.map((s) => s.id === settlementId ? updatedSettlement : s),
        uploadProgress: 100,
        isLoading: false
      }));

      return updatedSettlement;
    } catch (err) {
      set({
        error: err.response?.data?.message || 'Failed to upload payment proof',
        isLoading: false,
        uploadProgress: 0
      });
      throw err;
    }
  },

  updateSettlementStatus: async (settlementId, status) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.patch(`/settlements/${settlementId}/status`, { status });
      const updatedSettlement = response.data.settlement;

      // Optimistic update of local settlements list and selected settlement
      set((state) => ({
        selectedSettlement: updatedSettlement,
        settlements: state.settlements.map((s) => s.id === settlementId ? updatedSettlement : s),
        isLoading: false
      }));

      return updatedSettlement;
    } catch (err) {
      set({
        error: err.response?.data?.message || 'Failed to update settlement status',
        isLoading: false
      });
      throw err;
    }
  }
}));
