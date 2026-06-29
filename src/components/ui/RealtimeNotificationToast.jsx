import { useState, useEffect } from 'react';
import { Bell, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

export default function RealtimeNotificationToast() {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const handleNotification = (e) => {
      const notification = e.detail;
      if (!notification) return;

      const id = notification.id || Math.random().toString();
      const newToast = { id, message: notification.message };

      setNotifications((prev) => [...prev, newToast]);

      // Auto dismiss after 5 seconds
      setTimeout(() => {
        setNotifications((prev) => prev.filter((t) => t.id !== id));
      }, 5000);
    };

    window.addEventListener('realtime-notification', handleNotification);
    return () => window.removeEventListener('realtime-notification', handleNotification);
  }, []);

  const removeToast = (id) => {
    setNotifications((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <div className="fixed top-6 right-6 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
      <AnimatePresence>
        {notifications.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, transition: { duration: 0.2 } }}
            className="pointer-events-auto flex items-start gap-3 p-4 bg-slate-900/90 backdrop-blur-md border border-indigo-500/20 rounded-2xl shadow-xl shadow-indigo-950/20 text-slate-100"
          >
            <div className="p-2 rounded-xl bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 shrink-0">
              <Bell className="w-4 h-4 text-indigo-400 animate-bounce" />
            </div>
            
            <div className="flex-1 min-w-0 pt-0.5">
              <p className="text-xs font-semibold text-indigo-300 uppercase tracking-wider mb-0.5">New Notification</p>
              <p className="text-sm text-slate-200 leading-relaxed font-medium">{toast.message}</p>
            </div>

            <button
              onClick={() => removeToast(toast.id)}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition duration-150 shrink-0 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
