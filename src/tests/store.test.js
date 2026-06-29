import { describe, test, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import { useGroupStore } from '../store/groupStore';
import { useHealthStore } from '../store/healthStore';

// Mock axios
vi.mock('axios', () => {
  return {
    default: {
      post: vi.fn(),
      get: vi.fn(),
      put: vi.fn(),
      delete: vi.fn()
    }
  };
});

// Mock client api.js wrapper
vi.mock('../api/api', () => {
  return {
    default: {
      post: vi.fn(),
      get: vi.fn(),
      put: vi.fn(),
      patch: vi.fn(),
      delete: vi.fn()
    }
  };
});

import api from '../api/api';

describe('Zustand Client State Stores', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Reset Zustand stores to initial states
    useAuthStore.setState({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: false,
      authError: null
    });
    
    useGroupStore.setState({
      groups: [],
      currentGroup: null,
      isLoading: false,
      error: null
    });

    useHealthStore.setState({
      health: null,
      ready: null,
      metrics: null,
      version: null,
      loading: false,
      error: null
    });
  });

  // 1. Auth Store
  describe('authStore tests', () => {
    test('login action sets user profile and token', async () => {
      const mockUser = { id: 'u1', name: 'John Doe', email: 'john@doe.com' };
      axios.post.mockResolvedValueOnce({
        data: {
          success: true,
          user: mockUser,
          accessToken: 'jwt_mock_token_xyz'
        }
      });

      const response = await useAuthStore.getState().login('john@doe.com', 'secretPassword');

      expect(axios.post).toHaveBeenCalledWith(
        expect.stringContaining('/auth/login'),
        { email: 'john@doe.com', password: 'secretPassword' },
        expect.any(Object)
      );
      
      const state = useAuthStore.getState();
      expect(state.user).toEqual(mockUser);
      expect(state.accessToken).toBe('jwt_mock_token_xyz');
      expect(state.isAuthenticated).toBe(true);
      expect(state.isLoading).toBe(false);
    });

    test('logoutClient resets auth state variables', () => {
      useAuthStore.setState({
        user: { name: 'John' },
        accessToken: 'token',
        isAuthenticated: true
      });

      useAuthStore.getState().logoutClient();

      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.accessToken).toBeNull();
      expect(state.isAuthenticated).toBe(false);
    });
  });

  // 2. Group Store
  describe('groupStore tests', () => {
    test('getGroups calls backend /groups and stores response', async () => {
      const mockGroups = [
        { id: 'g1', name: 'Roommates', myRole: 'OWNER' },
        { id: 'g2', name: 'Trip', myRole: 'MEMBER' }
      ];

      api.get.mockResolvedValueOnce({
        data: {
          success: true,
          groups: mockGroups
        }
      });

      await useGroupStore.getState().getGroups();

      expect(api.get).toHaveBeenCalledWith('/groups');
      const state = useGroupStore.getState();
      expect(state.groups).toEqual(mockGroups);
    });

    test('createGroup appends new group to existing list', async () => {
      useGroupStore.setState({
        groups: [{ id: 'g1', name: 'Roommates' }]
      });

      const newGroup = { id: 'g2', name: 'Weekend Trip' };
      api.post.mockResolvedValueOnce({
        data: {
          success: true,
          group: newGroup
        }
      });

      await useGroupStore.getState().createGroup('Weekend Trip', 'Description');

      expect(api.post).toHaveBeenCalledWith('/groups', { name: 'Weekend Trip', description: 'Description' });
      const state = useGroupStore.getState();
      expect(state.groups).toHaveLength(2);
      expect(state.groups[0]).toEqual(newGroup);
    });
  });

  // 3. Health Store
  describe('healthStore tests', () => {
    test('fetchAll triggers get requests and populates diagnostics', async () => {
      api.get.mockImplementation(async (url) => {
        if (url === '/health') return { data: { success: true, status: 'UP' } };
        if (url === '/ready') return { data: { success: true, status: 'READY' } };
        if (url === '/metrics') return { data: { success: true, uptime: 100 } };
        if (url === '/version') return { data: { success: true, appVersion: '1.0.0' } };
        return { data: {} };
      });

      await useHealthStore.getState().fetchAll();

      const state = useHealthStore.getState();
      expect(state.health.status).toBe('UP');
      expect(state.ready.status).toBe('READY');
      expect(state.metrics.uptime).toBe(100);
      expect(state.version.appVersion).toBe('1.0.0');
    });
  });
});
