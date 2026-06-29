import { create } from 'zustand';
import api from '../api/api';

export const useActivityStore = create((set, get) => ({
  activities: [],
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  error: null,

  getActivities: async (groupId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get(`/groups/${groupId}/activity`);
      set({
        activities: response.data.activities || [],
        isLoading: false
      });
    } catch (err) {
      set({
        error: err.response?.data?.message || 'Failed to fetch group activities',
        isLoading: false
      });
    }
  },

  getNotifications: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get('/notifications');
      const notifications = response.data.notifications || [];
      const unreadCount = notifications.filter(n => !n.read).length;
      set({
        notifications,
        unreadCount,
        isLoading: false
      });
    } catch (err) {
      set({
        error: err.response?.data?.message || 'Failed to fetch notifications',
        isLoading: false
      });
    }
  },

  markRead: async (id) => {
    const { notifications, unreadCount } = get();
    
    // Save old state for rollback
    const oldNotifications = [...notifications];
    const oldUnreadCount = unreadCount;

    // Optimistic update
    const updatedNotifications = notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    );
    // Only decrement if it was unread
    const targetNotif = notifications.find(n => n.id === id);
    const wasUnread = targetNotif ? !targetNotif.read : false;
    const newUnreadCount = wasUnread ? Math.max(0, unreadCount - 1) : unreadCount;

    set({
      notifications: updatedNotifications,
      unreadCount: newUnreadCount,
      error: null
    });

    try {
      await api.patch(`/notifications/${id}/read`);
    } catch (err) {
      // Rollback on failure
      set({
        notifications: oldNotifications,
        unreadCount: oldUnreadCount,
        error: err.response?.data?.message || 'Failed to mark notification as read'
      });
      throw err;
    }
  },

  markAllRead: async () => {
    const { notifications, unreadCount } = get();

    // Save old state for rollback
    const oldNotifications = [...notifications];
    const oldUnreadCount = unreadCount;

    // Optimistic update
    const updatedNotifications = notifications.map(n => ({ ...n, read: true }));
    
    set({
      notifications: updatedNotifications,
      unreadCount: 0,
      error: null
    });

    try {
      await api.patch('/notifications/read-all');
    } catch (err) {
      // Rollback on failure
      set({
        notifications: oldNotifications,
        unreadCount: oldUnreadCount,
        error: err.response?.data?.message || 'Failed to mark all notifications as read'
      });
      throw err;
    }
  }
}));
