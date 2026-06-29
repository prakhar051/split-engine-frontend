import { create } from 'zustand';
import api from '../api/api';
import { useAuthStore } from './authStore';

export const useProfileStore = create((set, get) => ({
  profile: null,
  isLoading: false,
  error: null,
  uploadProgress: 0,
  updateSuccess: false,
  isDirty: false,
  avatarPreview: null,
  lastFetched: null,

  clearState: () => {
    // Revoke preview object URL if any to prevent memory leaks
    const { avatarPreview } = get();
    if (avatarPreview && avatarPreview.startsWith('blob:')) {
      URL.revokeObjectURL(avatarPreview);
    }
    set({
      error: null,
      uploadProgress: 0,
      updateSuccess: false,
      isDirty: false,
      avatarPreview: null
    });
  },

  setAvatarPreview: (file) => {
    // Revoke previous preview URL first
    const { avatarPreview } = get();
    if (avatarPreview && avatarPreview.startsWith('blob:')) {
      URL.revokeObjectURL(avatarPreview);
    }

    if (!file) {
      set({ avatarPreview: null, isDirty: true });
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    set({ avatarPreview: previewUrl, isDirty: true });
  },

  setIsDirty: (dirty) => set({ isDirty: dirty }),

  getProfile: async (force = false) => {
    const { lastFetched, profile } = get();
    const cacheAge = Date.now() - (lastFetched || 0);

    // Caching 60s
    if (!force && profile && cacheAge < 60000) {
      return;
    }

    set({ isLoading: true, error: null });
    try {
      const response = await api.get('/auth/me');
      const user = response.data.user;
      set({
        profile: user,
        lastFetched: Date.now(),
        isLoading: false
      });
      // Synchronize in authStore immediately
      useAuthStore.getState().updateUser(user);
    } catch (err) {
      set({
        error: err.response?.data?.message || 'Failed to fetch user profile',
        isLoading: false
      });
    }
  },

  updateProfile: async (data) => {
    set({ isLoading: true, error: null, updateSuccess: false });
    try {
      const response = await api.patch('/users/profile', data);
      const updatedUser = response.data.user;

      set({
        profile: updatedUser,
        updateSuccess: true,
        isDirty: false,
        isLoading: false
      });

      // Optimistic Updates: Immediately update authStore without re-fetching me
      useAuthStore.getState().updateUser(updatedUser);
      return updatedUser;
    } catch (err) {
      set({
        error: err.response?.data?.message || 'Failed to update profile details',
        isLoading: false
      });
      throw err;
    }
  },

  uploadAvatar: async (file) => {
    set({ isLoading: true, error: null, uploadProgress: 0, updateSuccess: false });
    try {
      const formData = new FormData();
      formData.append('avatar', file);

      const response = await api.patch('/users/profile', formData, {
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

      const updatedUser = response.data.user;

      // Revoke preview URL upon successful upload
      const { avatarPreview } = get();
      if (avatarPreview && avatarPreview.startsWith('blob:')) {
        URL.revokeObjectURL(avatarPreview);
      }

      set({
        profile: updatedUser,
        avatarPreview: null,
        isDirty: false,
        updateSuccess: true,
        uploadProgress: 100,
        isLoading: false
      });

      // Optimistic Updates: Immediately update authStore without re-fetching me
      useAuthStore.getState().updateUser(updatedUser);
      return updatedUser;
    } catch (err) {
      set({
        error: err.response?.data?.message || 'Failed to upload avatar image',
        isLoading: false,
        uploadProgress: 0
      });
      throw err;
    }
  },

  removeAvatar: async () => {
    set({ isLoading: true, error: null, updateSuccess: false });
    try {
      const response = await api.patch('/users/profile', { removeAvatar: true });
      const updatedUser = response.data.user;

      // Revoke preview URL if any
      const { avatarPreview } = get();
      if (avatarPreview && avatarPreview.startsWith('blob:')) {
        URL.revokeObjectURL(avatarPreview);
      }

      set({
        profile: updatedUser,
        avatarPreview: null,
        isDirty: false,
        updateSuccess: true,
        isLoading: false
      });

      // Optimistic Updates: Immediately update authStore without re-fetching me
      useAuthStore.getState().updateUser(updatedUser);
      return updatedUser;
    } catch (err) {
      set({
        error: err.response?.data?.message || 'Failed to remove avatar picture',
        isLoading: false
      });
      throw err;
    }
  }
}));
