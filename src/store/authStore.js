import { create } from 'zustand';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const useAuthStore = create((set, get) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isLoading: false,
  isInitialized: false,
  authError: null,
  sessions: [],

  setAccessToken: (token) => set({ accessToken: token, isAuthenticated: !!token }),

  updateUser: (updatedUser) => set({ user: updatedUser }),

  logoutClient: () => set({
    user: null,
    accessToken: null,
    isAuthenticated: false,
    authError: null,
    sessions: []
  }),

  register: async (name, email, password) => {
    set({ isLoading: true, authError: null });
    try {
      const response = await axios.post(`${API_URL}/auth/register`, { name, email, password }, { withCredentials: true });
      const { user } = response.data;
      // Note: register doesn't log in directly because of verification gate
      set({
        isLoading: false
      });
      return response.data;
    } catch (error) {
      const errMsg = error.response?.data?.message || 'Registration failed';
      set({ authError: errMsg, isLoading: false });
      throw error;
    }
  },

  login: async (email, password) => {
    set({ isLoading: true, authError: null });
    try {
      const response = await axios.post(`${API_URL}/auth/login`, { email, password }, { withCredentials: true });
      const { user, accessToken } = response.data;
      set({
        user,
        accessToken,
        isAuthenticated: true,
        isLoading: false
      });
      return response.data;
    } catch (error) {
      const errMsg = error.response?.data?.message || 'Login failed';
      set({ authError: errMsg, isLoading: false });
      throw error;
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await axios.post(`${API_URL}/auth/logout`, {}, { withCredentials: true });
    } catch (error) {
      console.error('Logout error on server:', error);
    } finally {
      get().logoutClient();
      set({ isLoading: false });
    }
  },

  logoutAllDevices: async () => {
    set({ isLoading: true });
    try {
      const token = get().accessToken;
      await axios.post(
        `${API_URL}/auth/logout-all`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true
        }
      );
    } catch (error) {
      console.error('Logout-all error on server:', error);
    } finally {
      get().logoutClient();
      set({ isLoading: false });
    }
  },

  checkAuth: async () => {
    set({ isLoading: true, authError: null });
    try {
      const refreshResponse = await axios.post(`${API_URL}/auth/refresh`, {}, { withCredentials: true });
      const { accessToken } = refreshResponse.data;

      const meResponse = await axios.get(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });

      const { user } = meResponse.data;

      set({
        user,
        accessToken,
        isAuthenticated: true,
        isLoading: false,
        isInitialized: true
      });
    } catch (error) {
      get().logoutClient();
      set({ isLoading: false, isInitialized: true });
    }
  },

  updateSettings: async (settingsData) => {
    set({ isLoading: true, authError: null });
    try {
      const token = get().accessToken;
      const response = await axios.put(
        `${API_URL}/auth/settings`,
        settingsData,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      if (response.data.user) {
        set({ user: response.data.user });
      }
      set({ isLoading: false });
      return response.data;
    } catch (error) {
      const errMsg = error.response?.data?.message || 'Failed to update settings';
      set({ authError: errMsg, isLoading: false });
      throw error;
    }
  },

  deleteAccount: async () => {
    set({ isLoading: true, authError: null });
    try {
      const token = get().accessToken;
      await axios.delete(
        `${API_URL}/auth/account`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      get().logoutClient();
      set({ isLoading: false });
    } catch (error) {
      const errMsg = error.response?.data?.message || 'Failed to delete account';
      set({ authError: errMsg, isLoading: false });
      throw error;
    }
  },

  fetchSessions: async () => {
    set({ isLoading: true, authError: null });
    try {
      const token = get().accessToken;
      const response = await axios.get(
        `${API_URL}/auth/sessions`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      set({ sessions: response.data.sessions || [], isLoading: false });
    } catch (error) {
      const errMsg = error.response?.data?.message || 'Failed to fetch sessions';
      set({ authError: errMsg, isLoading: false });
      throw error;
    }
  },

  revokeSession: async (sessionId) => {
    set({ isLoading: true, authError: null });
    try {
      const token = get().accessToken;
      await axios.delete(
        `${API_URL}/auth/sessions/${sessionId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      const filtered = get().sessions.filter(s => s.id !== sessionId);
      set({ sessions: filtered, isLoading: false });
    } catch (error) {
      const errMsg = error.response?.data?.message || 'Failed to revoke session';
      set({ authError: errMsg, isLoading: false });
      throw error;
    }
  }
}));
