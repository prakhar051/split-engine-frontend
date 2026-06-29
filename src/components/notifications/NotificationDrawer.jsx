import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, CheckSquare, BellOff, ArrowRight } from 'lucide-react';
import { useActivityStore } from '../../store/activityStore';
import NotificationCard from './NotificationCard';

const NotificationDrawer = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { 
    notifications, 
    unreadCount, 
    isLoading, 
    getNotifications, 
    markRead, 
    markAllRead 
  } = useActivityStore();

  useEffect(() => {
    if (isOpen) {
      getNotifications();
    }
  }, [isOpen, getNotifications]);

  // Prevent scroll on body when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

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

  const handleViewAll = () => {
    onClose();
    navigate('/notifications');
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div 
        className={`fixed top-0 right-0 z-50 h-full w-full sm:w-[450px] bg-slate-900/90 border-l border-white/10 shadow-2xl backdrop-blur-xl flex flex-col transition-transform duration-300 ease-out transform ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10 bg-slate-950/20">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-white">Notifications</h2>
            {unreadCount > 0 && (
              <span className="flex items-center justify-center px-2 py-0.5 text-xs font-semibold text-white bg-blue-500 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.6)]">
                {unreadCount} new
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            {unreadCount > 0 && (
              <button 
                onClick={handleMarkAllRead}
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 border border-transparent hover:border-blue-500/20 rounded-lg transition-all duration-200"
                title="Mark all as read"
              >
                <CheckSquare className="w-4 h-4" />
                <span className="hidden sm:inline">Mark all read</span>
              </button>
            )}
            <button 
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg border border-transparent hover:border-white/10 transition-all duration-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-thin">
          {isLoading && notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 space-y-3">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-sm text-slate-400">Loading notifications...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center space-y-4">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-white/5 border border-white/10">
                <BellOff className="w-8 h-8 text-slate-400" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-white">All caught up!</h3>
                <p className="mt-1 text-sm text-slate-400 max-w-xs mx-auto">
                  You have no notifications at the moment. We'll let you know when things happen!
                </p>
              </div>
            </div>
          ) : (
            notifications.map((notification) => (
              <NotificationCard 
                key={notification.id} 
                notification={notification} 
                onMarkRead={handleMarkRead}
              />
            ))
          )}
        </div>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="p-6 border-t border-white/10 bg-slate-950/20">
            <button 
              onClick={handleViewAll}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-sm font-semibold rounded-xl transition-all duration-300 shadow-[0_4px_15px_rgba(59,130,246,0.3)] hover:shadow-[0_4px_20px_rgba(59,130,246,0.4)]"
            >
              <span>View All Alerts</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default NotificationDrawer;
