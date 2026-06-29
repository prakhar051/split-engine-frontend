import { useState, useEffect } from 'react';
import { Activity, X, Zap } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

export default function LiveActivityToast() {
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    const handleActivity = (e) => {
      const activity = e.detail;
      if (!activity) return;

      const id = activity.id || Math.random().toString();
      const newToast = { id, description: activity.description };

      setActivities((prev) => [...prev, newToast]);

      // Auto dismiss after 4 seconds
      setTimeout(() => {
        setActivities((prev) => prev.filter((t) => t.id !== id));
      }, 4000);
    };

    window.addEventListener('realtime-activity', handleActivity);
    return () => window.removeEventListener('realtime-activity', handleActivity);
  }, []);

  const removeToast = (id) => {
    setActivities((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
      <AnimatePresence>
        {activities.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, transition: { duration: 0.2 } }}
            className="pointer-events-auto flex items-start gap-3 p-4 bg-slate-900/90 backdrop-blur-md border border-violet-500/20 rounded-2xl shadow-xl shadow-indigo-950/20 text-slate-100"
          >
            <div className="p-2 rounded-xl bg-violet-600/10 border border-violet-500/20 text-violet-400 shrink-0">
              <Zap className="w-4 h-4 text-violet-400 animate-pulse" />
            </div>
            
            <div className="flex-1 min-w-0 pt-0.5">
              <p className="text-xs font-semibold text-violet-300 uppercase tracking-wider mb-0.5">Activity Update</p>
              <p className="text-sm text-slate-200 leading-relaxed font-medium">{toast.description}</p>
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
