import { create } from 'zustand';
import { socketService } from '../services/socket';
import { useGroupStore } from './groupStore';
import { useExpenseStore } from './expenseStore';
import { useSettlementStore } from './settlementStore';
import { useActivityStore } from './activityStore';
import { useAuthStore } from './authStore';
import { useProfileStore } from './profileStore';

export const useSocketStore = create((set, get) => ({
  connected: false,
  connecting: false,
  onlineUsers: [], // User IDs online in current active group
  latency: 0,
  lastEvent: null,
  reconnectAttempts: 0,
  duplicateCache: {}, // eventId -> timestamp

  setConnected: (connected) => set({ connected, connecting: false }),
  setConnecting: (connecting) => set({ connecting }),
  setReconnectAttempts: (reconnectAttempts) => set({ reconnectAttempts }),
  setLatency: (latency) => set({ latency }),

  connect: () => {
    const token = useAuthStore.getState().accessToken;
    if (token) {
      socketService.connect(token);
    }
  },

  disconnect: () => {
    socketService.disconnect();
  },

  joinGroup: (groupId) => {
    socketService.joinGroup(groupId);
  },

  leaveGroup: (groupId) => {
    socketService.leaveGroup(groupId);
  },

  sendHeartbeat: () => {
    socketService.sendHeartbeat();
  },

  clearDuplicateCache: () => set({ duplicateCache: {} }),

  // LRU / Timed Suppression duplicate cache logic
  isDuplicateEvent: (eventId) => {
    if (!eventId) return false;
    const { duplicateCache } = get();
    const now = Date.now();

    // Check duplicate
    if (duplicateCache[eventId]) {
      return true;
    }

    // Add to cache & clean up entries older than 5 minutes
    const updatedCache = { ...duplicateCache, [eventId]: now };
    const cleanedCache = {};
    Object.keys(updatedCache).forEach((id) => {
      if (now - updatedCache[id] < 5 * 60 * 1000) {
        cleanedCache[id] = updatedCache[id];
      }
    });

    set({ duplicateCache: cleanedCache });
    return false;
  },

  handleIncomingEvent: (event, envelope) => {
    const { eventId, payload, userId, groupId } = envelope;

    // Check duplicate
    if (get().isDuplicateEvent(eventId)) {
      console.log(`[Socket] Ignored duplicate event: ${event} (ID: ${eventId})`);
      return;
    }

    console.log(`[Socket] Received event: ${event}`, envelope);
    set({ lastEvent: envelope });

    const currentUserId = useAuthStore.getState().user?.id;

    // Direct event dispatch to state stores
    switch (event) {
      case 'ONLINE_USERS_UPDATED': {
        const { onlineUserIds } = payload;
        set({ onlineUsers: onlineUserIds || [] });
        break;
      }

      case 'GROUP_CREATED': {
        const { group } = payload;
        const groupStore = useGroupStore.getState();
        if (!groupStore.groups.some((g) => g.id === group.id)) {
          useGroupStore.setState({ groups: [group, ...groupStore.groups] });
        }
        break;
      }

      case 'GROUP_UPDATED': {
        const { group } = payload;
        const groupStore = useGroupStore.getState();
        const updatedGroups = groupStore.groups.map((g) => (g.id === group.id ? { ...g, ...group } : g));
        const updatedCurrent = groupStore.currentGroup?.id === group.id ? { ...groupStore.currentGroup, ...group } : groupStore.currentGroup;
        useGroupStore.setState({ groups: updatedGroups, currentGroup: updatedCurrent });
        break;
      }

      case 'GROUP_DELETED': {
        const { groupId: targetGroupId } = payload;
        const groupStore = useGroupStore.getState();
        const updatedGroups = groupStore.groups.filter((g) => g.id !== targetGroupId);
        const updatedCurrent = groupStore.currentGroup?.id === targetGroupId ? null : groupStore.currentGroup;
        useGroupStore.setState({ groups: updatedGroups, currentGroup: updatedCurrent });
        break;
      }

      case 'GROUP_MEMBER_JOINED': {
        const { groupId: targetGroupId, member } = payload;
        const groupStore = useGroupStore.getState();
        if (groupStore.currentGroup?.id === targetGroupId) {
          const members = groupStore.currentGroup.members || [];
          if (!members.some((m) => m.userId === member.userId)) {
            useGroupStore.setState({
              currentGroup: {
                ...groupStore.currentGroup,
                members: [...members, member]
              }
            });
          }
        }
        // Force refresh group collections & dashboard
        groupStore.getGroups();
        groupStore.getDashboardSummary(true);
        break;
      }

      case 'GROUP_MEMBER_LEFT': {
        const { groupId: targetGroupId, userId: leftUserId } = payload;
        const groupStore = useGroupStore.getState();
        
        if (leftUserId === currentUserId) {
          // Current user left
          const updatedGroups = groupStore.groups.filter((g) => g.id !== targetGroupId);
          const updatedCurrent = groupStore.currentGroup?.id === targetGroupId ? null : groupStore.currentGroup;
          useGroupStore.setState({ groups: updatedGroups, currentGroup: updatedCurrent });
        } else {
          // Other user left
          if (groupStore.currentGroup?.id === targetGroupId) {
            const members = groupStore.currentGroup.members || [];
            useGroupStore.setState({
              currentGroup: {
                ...groupStore.currentGroup,
                members: members.filter((m) => m.userId !== leftUserId)
              }
            });
          }
        }
        groupStore.getGroups();
        groupStore.getDashboardSummary(true);
        break;
      }

      case 'GROUP_OWNER_TRANSFERRED': {
        const { groupId: targetGroupId, newOwnerId } = payload;
        const groupStore = useGroupStore.getState();
        if (groupStore.currentGroup?.id === targetGroupId) {
          const updatedMembers = (groupStore.currentGroup.members || []).map((m) => {
            if (m.userId === newOwnerId) return { ...m, role: 'OWNER' };
            if (m.role === 'OWNER') return { ...m, role: 'MEMBER' };
            return m;
          });
          useGroupStore.setState({
            currentGroup: {
              ...groupStore.currentGroup,
              createdById: newOwnerId,
              members: updatedMembers
            }
          });
        }
        groupStore.getGroups();
        break;
      }

      case 'EXPENSE_CREATED': {
        const { expense } = payload;
        const expenseStore = useExpenseStore.getState();
        const groupStore = useGroupStore.getState();
        if (groupStore.currentGroup?.id === expense.groupId) {
          if (!expenseStore.expenses.some((e) => e.id === expense.id)) {
            useExpenseStore.setState({ expenses: [expense, ...expenseStore.expenses] });
          }
        }
        // Force refresh aggregates
        groupStore.getDashboardSummary(true);
        groupStore.getDashboardAnalytics(true);
        groupStore.clearCache();
        if (groupStore.currentGroup?.id === expense.groupId) {
          groupStore.getGroupDetails(groupStore.currentGroup.id);
        }
        break;
      }

      case 'EXPENSE_UPDATED': {
        const { expense } = payload;
        const expenseStore = useExpenseStore.getState();
        const groupStore = useGroupStore.getState();
        if (groupStore.currentGroup?.id === expense.groupId) {
          const updatedExpenses = expenseStore.expenses.map((e) => (e.id === expense.id ? expense : e));
          const updatedCurrent = expenseStore.currentExpense?.id === expense.id ? expense : expenseStore.currentExpense;
          useExpenseStore.setState({ expenses: updatedExpenses, currentExpense: updatedCurrent });
        }
        groupStore.getDashboardSummary(true);
        groupStore.getDashboardAnalytics(true);
        groupStore.clearCache();
        if (groupStore.currentGroup?.id === expense.groupId) {
          groupStore.getGroupDetails(groupStore.currentGroup.id);
        }
        break;
      }

      case 'EXPENSE_DELETED': {
        const { expenseId } = payload;
        const expenseStore = useExpenseStore.getState();
        const groupStore = useGroupStore.getState();
        const updatedExpenses = expenseStore.expenses.filter((e) => e.id !== expenseId);
        const updatedCurrent = expenseStore.currentExpense?.id === expenseId ? null : expenseStore.currentExpense;
        useExpenseStore.setState({ expenses: updatedExpenses, currentExpense: updatedCurrent });

        groupStore.getDashboardSummary(true);
        groupStore.getDashboardAnalytics(true);
        groupStore.clearCache();
        if (groupStore.currentGroup) {
          groupStore.getGroupDetails(groupStore.currentGroup.id);
        }
        break;
      }

      case 'EXPENSE_ATTACHMENT_UPLOADED': {
        const { expenseId, attachments } = payload;
        const expenseStore = useExpenseStore.getState();
        if (expenseStore.currentExpense?.id === expenseId && attachments) {
          const currentAttachments = expenseStore.currentExpense.attachments || [];
          const merged = [...currentAttachments];
          attachments.forEach((a) => {
            if (!merged.some((existing) => existing.id === a.id)) {
              merged.push(a);
            }
          });
          useExpenseStore.setState({
            currentExpense: { ...expenseStore.currentExpense, attachments: merged },
            attachments: merged
          });
        }
        break;
      }

      case 'EXPENSE_ATTACHMENT_DELETED': {
        const { expenseId, attachmentId } = payload;
        const expenseStore = useExpenseStore.getState();
        if (expenseStore.currentExpense?.id === expenseId) {
          const filtered = (expenseStore.currentExpense.attachments || []).filter((a) => a.id !== attachmentId);
          useExpenseStore.setState({
            currentExpense: { ...expenseStore.currentExpense, attachments: filtered },
            attachments: filtered
          });
        }
        break;
      }

      case 'SETTLEMENT_GENERATED': {
        const { settlements, groupId: sGroupId } = payload;
        const settlementStore = useSettlementStore.getState();
        if (settlementStore.selectedGroupId === sGroupId) {
          useSettlementStore.setState({ settlements: settlements || [] });
          settlementStore.getBalances(sGroupId, true);
        }
        break;
      }

      case 'SETTLEMENT_UPDATED':
      case 'SETTLEMENT_PAID':
      case 'SETTLEMENT_DISPUTED':
      case 'SETTLEMENT_PROOF_UPLOADED': {
        const { settlement } = payload;
        const settlementStore = useSettlementStore.getState();
        if (settlementStore.selectedGroupId === settlement.groupId) {
          const updatedSettlements = settlementStore.settlements.map((s) => (s.id === settlement.id ? settlement : s));
          const updatedSelected = settlementStore.selectedSettlement?.id === settlement.id ? settlement : settlementStore.selectedSettlement;
          useSettlementStore.setState({
            settlements: updatedSettlements,
            selectedSettlement: updatedSelected
          });
          settlementStore.getBalances(settlement.groupId, true);
        }
        // Also refresh dashboard summary
        useGroupStore.getState().getDashboardSummary(true);
        break;
      }

      case 'PROFILE_UPDATED': {
        const { userId: profileUserId, user } = payload;
        if (profileUserId === currentUserId) {
          useAuthStore.getState().updateUser(user);
          useProfileStore.setState({ profile: user });
        }
        // Sync inside active group member names
        const groupStore = useGroupStore.getState();
        if (groupStore.currentGroup) {
          const updatedMembers = (groupStore.currentGroup.members || []).map((m) => {
            if (m.userId === profileUserId) {
              return {
                ...m,
                user: {
                  ...m.user,
                  name: user.name,
                  avatar: user.avatar
                }
              };
            }
            return m;
          });
          useGroupStore.setState({
            currentGroup: {
              ...groupStore.currentGroup,
              members: updatedMembers
            }
          });
        }
        break;
      }

      case 'NOTIFICATION_CREATED': {
        const { notification } = payload;
        const activityStore = useActivityStore.getState();
        if (notification.userId === currentUserId) {
          const updatedNotifications = [notification, ...activityStore.notifications];
          useActivityStore.setState({
            notifications: updatedNotifications,
            unreadCount: updatedNotifications.filter((n) => !n.read).length
          });
          
          // Trigger local event to show UI Toast notification
          window.dispatchEvent(new CustomEvent('realtime-notification', { detail: notification }));
        }
        break;
      }

      case 'NOTIFICATION_READ': {
        const { id } = payload;
        const activityStore = useActivityStore.getState();
        const updated = activityStore.notifications.map((n) => (n.id === id ? { ...n, read: true } : n));
        useActivityStore.setState({
          notifications: updated,
          unreadCount: updated.filter((n) => !n.read).length
        });
        break;
      }

      case 'NOTIFICATION_READ_ALL': {
        const activityStore = useActivityStore.getState();
        const updated = activityStore.notifications.map((n) => ({ ...n, read: true }));
        useActivityStore.setState({
          notifications: updated,
          unreadCount: 0
        });
        break;
      }

      case 'ACTIVITY_CREATED': {
        const { activity } = payload;
        const activityStore = useActivityStore.getState();
        const groupStore = useGroupStore.getState();
        if (groupStore.currentGroup?.id === activity.groupId) {
          useActivityStore.setState({
            activities: [activity, ...activityStore.activities]
          });
          
          // Trigger local event to show UI Toast activity
          window.dispatchEvent(new CustomEvent('realtime-activity', { detail: activity }));
        }
        break;
      }

      case 'SYNC_REQUIRED': {
        // Full state sync query trigger
        const groupStore = useGroupStore.getState();
        const currentGroup = groupStore.currentGroup;
        if (currentGroup) {
          groupStore.getGroupDetails(currentGroup.id);
          useExpenseStore.getState().getGroupExpenses(currentGroup.id);
          useSettlementStore.getState().getSettlements(currentGroup.id, true);
          useSettlementStore.getState().getBalances(currentGroup.id, true);
          useActivityStore.getState().getActivities(currentGroup.id);
        }
        groupStore.getGroups();
        groupStore.getDashboardSummary(true);
        groupStore.getDashboardAnalytics(true);
        useActivityStore.getState().getNotifications();
        break;
      }

      case 'EXCHANGE_RATES_UPDATED': {
        // Refresh currency store with the latest rates from the server broadcast
        import('./currencyStore').then(({ useCurrencyStore }) => {
          useCurrencyStore.getState().fetchLatestRates();
        }).catch((err) => {
          console.error('[Socket] Failed to refresh exchange rates:', err);
        });
        break;
      }

      default:
        console.warn(`[Socket] Unhandled event: ${event}`);
    }
  }
}));
