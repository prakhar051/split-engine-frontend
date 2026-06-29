import React, { useEffect } from 'react';
import { Bell, CheckSquare, BellOff, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useActivityStore } from '../store/activityStore';
import NotificationCard from '../components/notifications/NotificationCard';

const NotificationPage = () => {
  const { 
    notifications, 
    unreadCount, 
    isLoading, 
    getNotifications, 
    markRead, 
    markAllRead,
    error 
  } = useActivityStore();

  useEffect(() => {
    getNotifications();
  }, [getNotifications]);

  const handleMarkAllRead = async () => {
    try {
      await markAllRead();
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkRead = async (id) => {
    try {
      await markRead(id);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link 
            to="/dashboard" 
            className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 text-slate-300 hover:text-white transition-all duration-300 backdrop-blur-md"
            title="Back to Dashboard"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
              <Bell className="w-6 h-6 text-indigo-400" />
              <span>Notifications Panel</span>
            </h1>
            <p className="text-xs text-slate-400 font-medium">
              Review your entire account activity and alert history
            </p>
          </div>
        </div>

        {unreadCount > 0 && (
          <button 
            onClick={handleMarkAllRead}
            className="flex items-center justify-center gap-2 py-2.5 px-4 bg-white/5 hover:bg-blue-500/10 border border-white/10 hover:border-blue-500/30 text-blue-400 hover:text-blue-300 text-sm font-semibold rounded-xl transition-all duration-250 shrink-0"
          >
            <CheckSquare className="w-4.5 h-4.5" />
            <span>Mark all as read</span>
          </button>
        )}
      </div>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-400 text-sm">
          {error}
        </div>
      )}

      {/* Main List */}
      <div className="bg-slate-900/40 border border-white/10 rounded-3xl p-6 backdrop-blur-xl min-h-[400px]">
        {isLoading && notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-4">
            <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm text-slate-400">Fetching notifications...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center space-y-4">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-white/5 border border-white/10">
              <BellOff className="w-8 h-8 text-slate-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">No notifications</h3>
              <p className="mt-1 text-sm text-slate-400 max-w-xs mx-auto">
                All caught up! Any alerts about expenses, groups or settlements will appear here.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map((notification) => (
              <NotificationCard 
                key={notification.id} 
                notification={notification} 
                onMarkRead={handleMarkRead}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationPage;
