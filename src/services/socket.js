import { io } from 'socket.io-client';
import { useSocketStore } from '../store/socketStore';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || (API_URL.endsWith('/api') ? API_URL.slice(0, -4) : API_URL);

class SocketService {
  socket = null;
  heartbeatInterval = null;

  connect(token) {
    if (this.socket) {
      if (this.socket.auth?.token === token) {
        // Already connected with same token
        return this.socket;
      }
      // If token changed, disconnect first
      this.disconnect();
    }

    useSocketStore.getState().setConnecting(true);

    this.socket = io(SOCKET_URL, {
      auth: { token },
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 10000, // Exponential backoff max delay
      randomizationFactor: 0.5,
    });

    this.setupListeners();
    return this.socket;
  }

  disconnect() {
    this.stopHeartbeat();
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    useSocketStore.getState().setConnected(false);
  }

  setupListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('[Socket] Connected to server');
      useSocketStore.getState().setConnected(true);
      useSocketStore.getState().setReconnectAttempts(0);
      this.startHeartbeat();

      // Automatically rejoin rooms if we have active groups
      // This is handled in recovery or socketStore connect
    });

    this.socket.on('disconnect', (reason) => {
      console.log('[Socket] Disconnected:', reason);
      useSocketStore.getState().setConnected(false);
      this.stopHeartbeat();
    });

    this.socket.on('reconnect_attempt', (attempt) => {
      console.log('[Socket] Reconnect attempt:', attempt);
      useSocketStore.getState().setConnecting(true);
      useSocketStore.getState().setReconnectAttempts(attempt);
    });

    this.socket.on('reconnect_failed', () => {
      console.error('[Socket] Reconnection failed after max attempts');
      useSocketStore.getState().setConnecting(false);
    });

    this.socket.on('connect_error', (error) => {
      console.error('[Socket] Connection error:', error.message);
      useSocketStore.getState().setConnecting(false);
    });

    // Handle generic incoming events and pipe to socketStore
    const handleEvent = (event, envelope) => {
      useSocketStore.getState().handleIncomingEvent(event, envelope);
    };

    // Listen to all relevant collaboration events
    const COLLAB_EVENTS = [
      'GROUP_CREATED',
      'GROUP_UPDATED',
      'GROUP_DELETED',
      'GROUP_MEMBER_JOINED',
      'GROUP_MEMBER_LEFT',
      'GROUP_OWNER_TRANSFERRED',
      'EXPENSE_CREATED',
      'EXPENSE_UPDATED',
      'EXPENSE_DELETED',
      'EXPENSE_ATTACHMENT_UPLOADED',
      'EXPENSE_ATTACHMENT_DELETED',
      'SETTLEMENT_GENERATED',
      'SETTLEMENT_UPDATED',
      'SETTLEMENT_PAID',
      'SETTLEMENT_DISPUTED',
      'SETTLEMENT_PROOF_UPLOADED',
      'PROFILE_UPDATED',
      'NOTIFICATION_CREATED',
      'NOTIFICATION_READ',
      'NOTIFICATION_READ_ALL',
      'ACTIVITY_CREATED',
      'ONLINE_USERS_UPDATED',
      'CONNECTION_LATENCY',
      'SYNC_REQUIRED'
    ];

    COLLAB_EVENTS.forEach((event) => {
      this.socket.on(event, (envelope) => {
        handleEvent(event, envelope);
      });
    });
  }

  startHeartbeat() {
    this.stopHeartbeat();
    // Run heartbeat every 15 seconds
    this.sendHeartbeat();
    this.heartbeatInterval = setInterval(() => {
      this.sendHeartbeat();
    }, 15000);
  }

  stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  sendHeartbeat() {
    if (!this.socket || !this.socket.connected) return;
    const start = Date.now();
    this.socket.emit('heartbeat', start, (timestamp) => {
      const end = Date.now();
      const latency = end - timestamp;
      useSocketStore.getState().setLatency(latency);
    });
  }

  joinGroup(groupId) {
    if (this.socket && this.socket.connected) {
      this.socket.emit('join-group', groupId);
    }
  }

  leaveGroup(groupId) {
    if (this.socket && this.socket.connected) {
      this.socket.emit('leave-group', groupId);
    }
  }
}

export const socketService = new SocketService();
