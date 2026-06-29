import React, { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { useActivityStore } from '../../store/activityStore';
import { useAuthStore } from '../../store/authStore';
import UnreadBadge from '../ui/UnreadBadge';
import NotificationDrawer from './NotificationDrawer';

const NotificationBell = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { unreadCount, getNotifications } = useActivityStore();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) {
      getNotifications();
      // Poll notifications every 30 seconds for real-time feel
      const interval = setInterval(() => {
        getNotifications();
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, getNotifications]);

  if (!isAuthenticated) return null;

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 text-slate-300 hover:text-white transition-all duration-300 backdrop-blur-md"
        title="Notifications"
        aria-label="View notifications"
      >
        <Bell className="w-5 h-5" />
        <UnreadBadge 
          count={unreadCount} 
          className="absolute -top-1.5 -right-1.5" 
        />
      </button>

      <NotificationDrawer 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)} 
      />
    </>
  );
};

export default NotificationBell;
