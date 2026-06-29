import { create } from 'zustand';
import api from '../api/api';
import { useExpenseStore } from './expenseStore';

export const useGroupStore = create((set, get) => ({
  groups: [],
  currentGroup: null,
  invites: [],
  dashboardSummary: null,
  dashboardAnalytics: null,
  lastSummaryFetch: null,
  lastAnalyticsFetch: null,
  isLoading: false,
  error: null,

  clearCache: () => set({
    lastSummaryFetch: null,
    lastAnalyticsFetch: null
  }),

  getGroups: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get('/groups');
      set({ groups: response.data.groups, isLoading: false });
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to fetch groups', isLoading: false });
    }
  },

  createGroup: async (name, description) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/groups', { name, description });
      const newGroup = response.data.group;
      
      // Optimistic UI update
      set((state) => ({
        groups: [newGroup, ...state.groups],
        isLoading: false
      }));
      return response.data;
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to create group', isLoading: false });
      throw err;
    }
  },

  getGroupDetails: async (groupId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get(`/groups/${groupId}`);
      set({ currentGroup: response.data.group, isLoading: false });
      return response.data.group;
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to fetch group details', isLoading: false });
      throw err;
    }
  },

  getInvites: async (groupId) => {
    try {
      const response = await api.get(`/groups/${groupId}/invites`);
      set({ invites: response.data.invites });
    } catch (err) {
      console.error('Failed to fetch invites:', err);
    }
  },

  createInvite: async (groupId, email, expiresInHours) => {
    set({ isLoading: true, error: null });
    try {
      const payload = { expiresInHours: parseInt(expiresInHours, 10) || 24 };
      if (email && email.trim() !== '') {
        payload.email = email.trim();
      }
      const response = await api.post(`/groups/${groupId}/invite`, payload);
      const newInvite = response.data.invite;
      
      set((state) => ({
        invites: [newInvite, ...state.invites],
        isLoading: false
      }));
      return response.data;
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to create invite', isLoading: false });
      throw err;
    }
  },

  revokeInvite: async (groupId, inviteId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post(`/groups/${groupId}/invites/${inviteId}/revoke`);
      const updatedInvite = response.data.invite;
      
      set((state) => ({
        invites: state.invites.map((inv) => inv.id === inviteId ? updatedInvite : inv),
        isLoading: false
      }));
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to revoke invite', isLoading: false });
      throw err;
    }
  },

  joinGroup: async (inviteCode) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/groups/join', { inviteCode });
      set({ isLoading: false });
      return response.data;
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to join group', isLoading: false });
      throw err;
    }
  },

  removeMember: async (groupId, memberId) => {
    set({ isLoading: true, error: null });
    const previousGroup = get().currentGroup;

    // Optimistic update: filter out the member from currentGroup
    if (get().currentGroup && get().currentGroup.id === groupId) {
      set((state) => ({
        currentGroup: {
          ...state.currentGroup,
          members: state.currentGroup.members.filter((m) => m.userId !== memberId)
        }
      }));
    }

    try {
      await api.delete(`/groups/${groupId}/members/${memberId}`);
      
      // Invalidate caches
      set({
        lastSummaryFetch: null,
        lastAnalyticsFetch: null,
        isLoading: false
      });

      // Refetch details & list to get updated balances
      await get().getGroupDetails(groupId);
      await get().getGroups();
      
      // Invalidate expenses
      useExpenseStore.getState().getGroupExpenses(groupId).catch(console.error);
    } catch (err) {
      // Rollback on error
      set({
        currentGroup: previousGroup,
        error: err.response?.data?.message || 'Failed to remove member',
        isLoading: false
      });
      throw err;
    }
  },

  leaveGroup: async (groupId) => {
    set({ isLoading: true, error: null });
    const previousGroups = get().groups;

    // Optimistic update: remove group from lists
    set((state) => ({
      groups: state.groups.filter((g) => g.id !== groupId),
      currentGroup: state.currentGroup?.id === groupId ? null : state.currentGroup
    }));

    try {
      await api.post(`/groups/${groupId}/leave`);
      
      // Invalidate caches
      set({
        lastSummaryFetch: null,
        lastAnalyticsFetch: null,
        isLoading: false
      });

      // Refetch groups list
      await get().getGroups();
      
      // Invalidate expenses
      useExpenseStore.getState().clearCurrentExpense();
    } catch (err) {
      // Rollback on error
      set({
        groups: previousGroups,
        error: err.response?.data?.message || 'Failed to leave group',
        isLoading: false
      });
      throw err;
    }
  },

  transferOwnership: async (groupId, newOwnerId) => {
    set({ isLoading: true, error: null });
    const previousGroup = get().currentGroup;
    const previousGroups = get().groups;

    // Optimistic update
    if (get().currentGroup && get().currentGroup.id === groupId) {
      const updatedMembers = get().currentGroup.members.map((m) => {
        if (m.userId === newOwnerId) {
          return { ...m, role: 'OWNER' };
        }
        if (m.role === 'OWNER') {
          return { ...m, role: 'MEMBER' };
        }
        return m;
      });
      set((state) => ({
        currentGroup: {
          ...state.currentGroup,
          createdById: newOwnerId,
          members: updatedMembers
        }
      }));
    }

    try {
      await api.post(`/groups/${groupId}/transfer-ownership`, { newOwnerId });
      
      // Invalidate caches
      set({
        lastSummaryFetch: null,
        lastAnalyticsFetch: null,
        isLoading: false
      });

      // Refetch details
      await get().getGroupDetails(groupId);
      await get().getGroups();
    } catch (err) {
      // Rollback on error
      set({
        currentGroup: previousGroup,
        groups: previousGroups,
        error: err.response?.data?.message || 'Failed to transfer ownership',
        isLoading: false
      });
      throw err;
    }
  },

  getDashboardSummary: async (force = false) => {
    const { dashboardSummary, lastSummaryFetch } = get();
    const cacheAge = Date.now() - (lastSummaryFetch || 0);

    if (!force && dashboardSummary && cacheAge < 60000) {
      return;
    }

    set({ isLoading: true, error: null });
    try {
      const response = await api.get('/dashboard/summary');
      set({
        dashboardSummary: response.data.summary,
        lastSummaryFetch: Date.now(),
        isLoading: false
      });
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to fetch summary', isLoading: false });
    }
  },

  getDashboardAnalytics: async (force = false) => {
    const { dashboardAnalytics, lastAnalyticsFetch } = get();
    const cacheAge = Date.now() - (lastAnalyticsFetch || 0);

    if (!force && dashboardAnalytics && cacheAge < 60000) {
      return;
    }

    set({ isLoading: true, error: null });
    try {
      const response = await api.get('/dashboard/analytics');
      set({
        dashboardAnalytics: response.data.analytics,
        lastAnalyticsFetch: Date.now(),
        isLoading: false
      });
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to fetch analytics', isLoading: false });
    }
  }
}));
