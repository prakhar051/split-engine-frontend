import { create } from 'zustand';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const useAuthStore = create((set, get) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isLoading: false,
  authError: null,

  setAccessToken: (token) => set({ accessToken: token, isAuthenticated: !!token }),

  updateUser: (updatedUser) => set({ user: updatedUser }),

  logoutClient: () => set({
    user: null,
    accessToken: null,
    isAuthenticated: false,
    authError: null
  }),

  register: async (name, email, password) => {
    set({ isLoading: true, authError: null });
    try {
      const response = await axios.post(`${API_URL}/auth/register`, { name, email, password }, { withCredentials: true });
      const { user, accessToken } = response.data;
      set({
        user,
        accessToken,
        isAuthenticated: true,
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
        isLoading: false
      });
    } catch (error) {
      get().logoutClient();
      set({ isLoading: false });
    }
  }
}));
