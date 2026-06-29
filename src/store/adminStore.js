import { create } from 'zustand';
import api from '../api/api';
import { useGroupStore } from './groupStore';

export const useAdminStore = create((set, get) => ({
  members: [],
  admins: [],
  auditLogs: [],
  permissions: {
    isOwner: false,
    isAdmin: false,
    isMember: false,
    role: 'MEMBER'
  },
  loading: false,
  error: null,
  selectedMember: null,

  setSelectedMember: (member) => set({ selectedMember: member }),

  fetchMembers: async (groupId) => {
    set({ loading: true, error: null });
    try {
      const res = await api.get(`/groups/${groupId}/members`);
      set({ members: res.data.members, loading: false });
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to fetch members', loading: false });
    }
  },

  fetchAdmins: async (groupId) => {
    set({ loading: true, error: null });
    try {
      const res = await api.get(`/groups/${groupId}/admins`);
      set({ admins: res.data.admins, loading: false });
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to fetch admins', loading: false });
    }
  },

  fetchAdminActions: async (groupId) => {
    set({ loading: true, error: null });
    try {
      const res = await api.get(`/groups/${groupId}/admin-actions`);
      set({ auditLogs: res.data.actions, loading: false });
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to fetch admin actions', loading: false });
    }
  },

  updatePermissions: (currentUserId, group) => {
    if (!group || !group.members) {
      set({
        permissions: { isOwner: false, isAdmin: false, isMember: false, role: 'MEMBER' }
      });
      return;
    }
    const member = group.members.find(m => m.userId === currentUserId);
    if (!member || member.isBanned) {
      set({
        permissions: { isOwner: false, isAdmin: false, isMember: false, role: null }
      });
      return;
    }
    const role = member.role;
    set({
      permissions: {
        isOwner: role === 'OWNER',
        isAdmin: role === 'ADMIN' || role === 'OWNER',
        isMember: true,
        role
      }
    });
  },

  promoteMember: async (groupId, memberId, version) => {
    set({ loading: true, error: null });
    try {
      const res = await api.patch(`/groups/${groupId}/members/${memberId}/promote`, {}, {
        headers: { 'If-Match': String(version) }
      });
      set({ loading: false });
      
      // Refresh current group in groupStore
      await useGroupStore.getState().getGroupDetails(groupId);
      await get().fetchMembers(groupId);
      await get().fetchAdmins(groupId);
      await get().fetchAdminActions(groupId);
      return res.data;
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to promote member', loading: false });
      throw err;
    }
  },

  demoteMember: async (groupId, memberId, version) => {
    set({ loading: true, error: null });
    try {
      const res = await api.patch(`/groups/${groupId}/members/${memberId}/demote`, {}, {
        headers: { 'If-Match': String(version) }
      });
      set({ loading: false });
      
      await useGroupStore.getState().getGroupDetails(groupId);
      await get().fetchMembers(groupId);
      await get().fetchAdmins(groupId);
      await get().fetchAdminActions(groupId);
      return res.data;
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to demote member', loading: false });
      throw err;
    }
  },

  banMember: async (groupId, memberId, reason, version) => {
    set({ loading: true, error: null });
    try {
      const res = await api.post(`/groups/${groupId}/members/${memberId}/ban`, { reason }, {
        headers: { 'If-Match': String(version) }
      });
      set({ loading: false });
      
      await useGroupStore.getState().getGroupDetails(groupId);
      await get().fetchMembers(groupId);
      await get().fetchAdmins(groupId);
      await get().fetchAdminActions(groupId);
      return res.data;
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to ban member', loading: false });
      throw err;
    }
  },

  unbanMember: async (groupId, memberId, version) => {
    set({ loading: true, error: null });
    try {
      const res = await api.post(`/groups/${groupId}/members/${memberId}/unban`, {}, {
        headers: { 'If-Match': String(version) }
      });
      set({ loading: false });
      
      await useGroupStore.getState().getGroupDetails(groupId);
      await get().fetchMembers(groupId);
      await get().fetchAdmins(groupId);
      await get().fetchAdminActions(groupId);
      return res.data;
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to unban member', loading: false });
      throw err;
    }
  },

  removeMember: async (groupId, memberId, version) => {
    set({ loading: true, error: null });
    try {
      const res = await api.delete(`/groups/${groupId}/members/${memberId}`, {
        headers: { 'If-Match': String(version) }
      });
      set({ loading: false });
      
      await useGroupStore.getState().getGroupDetails(groupId);
      await get().fetchMembers(groupId);
      await get().fetchAdmins(groupId);
      await get().fetchAdminActions(groupId);
      return res.data;
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to remove member', loading: false });
      throw err;
    }
  },

  leaveGroup: async (groupId) => {
    set({ loading: true, error: null });
    try {
      const res = await api.post(`/groups/${groupId}/leave`);
      set({ loading: false });
      await useGroupStore.getState().getGroups();
      return res.data;
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to leave group', loading: false });
      throw err;
    }
  },

  transferOwnership: async (groupId, newOwnerId, version) => {
    set({ loading: true, error: null });
    try {
      const res = await api.patch(`/groups/${groupId}/transfer-owner`, { newOwnerId }, {
        headers: { 'If-Match': String(version) }
      });
      set({ loading: false });
      
      await useGroupStore.getState().getGroupDetails(groupId);
      await get().fetchMembers(groupId);
      await get().fetchAdmins(groupId);
      await get().fetchAdminActions(groupId);
      return res.data;
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to transfer ownership', loading: false });
      throw err;
    }
  },

  deleteGroup: async (groupId) => {
    set({ loading: true, error: null });
    try {
      const res = await api.delete(`/groups/${groupId}`);
      set({ loading: false });
      await useGroupStore.getState().getGroups();
      return res.data;
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to delete group', loading: false });
      throw err;
    }
  }
}));

