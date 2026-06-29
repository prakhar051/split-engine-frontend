import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true
});

// Request Interceptor: Attach JWT Access Token and queue offline write requests
api.interceptors.request.use(
  async (config) => {
    const token = useAuthStore.getState().accessToken;
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    // Check if request is an offline-queueable write request
    const isWrite = ['post', 'put', 'patch', 'delete'].includes(config.method?.toLowerCase());
    const isAuthOrAi =
      config.url?.includes('/auth/login') ||
      config.url?.includes('/auth/register') ||
      config.url?.includes('/auth/refresh') ||
      config.url?.includes('/auth/logout') ||
      config.url?.includes('/auth/logout-all') ||
      config.url?.includes('/ai/categorize-receipt');

    const isReplay = config.headers?._isReplay === 'true' || config.headers?.['_isReplay'] === 'true';

    if (!navigator.onLine && isWrite && !isAuthOrAi && !isReplay) {
      try {
        const { useOfflineStore } = await import('../store/offlineStore');
        const queuedReq = await useOfflineStore.getState().addRequest({
          url: config.url,
          method: config.method,
          headers: config.headers,
          data: config.data
        });

        const offlineError = new Error('Request queued offline');
        offlineError.isOfflineQueue = true;
        offlineError.queuedRequest = queuedReq;
        offlineError.response = {
          status: 202,
          data: {
            message: 'Your request has been queued offline and will sync automatically when connection returns.',
            offline: true,
            queuedRequestId: queuedReq.id
          }
        };
        return Promise.reject(offlineError);
      } catch (err) {
        return Promise.reject(err);
      }
    }

    // Clean internal headers before actual network call
    if (config.headers) {
      delete config.headers._isReplay;
      delete config.headers['_isReplay'];
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle automatic token rotation and offline re-syncing
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => {
    // If online, check if we need to sync queue
    if (navigator.onLine) {
      import('../store/offlineStore').then(({ useOfflineStore }) => {
        useOfflineStore.getState().syncQueue();
      });
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Skip refreshing if the request is for authentication / login / register / refresh / logout
    const isAuthRoute =
      originalRequest?.url?.includes('/auth/login') ||
      originalRequest?.url?.includes('/auth/register') ||
      originalRequest?.url?.includes('/auth/refresh') ||
      originalRequest?.url?.includes('/auth/logout');

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry && !isAuthRoute) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers['Authorization'] = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const response = await axios.post(
          `${API_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        );

        const { accessToken } = response.data;
        useAuthStore.getState().setAccessToken(accessToken);

        originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;
        processQueue(null, accessToken);
        isRefreshing = false;

        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        isRefreshing = false;
        useAuthStore.getState().logoutClient();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
