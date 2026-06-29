import React from 'react';
import { 
  UserPlus, 
  Receipt, 
  RefreshCw, 
  Upload, 
  CheckCircle, 
  AlertTriangle, 
  Check, 
  Bell
} from 'lucide-react';

const formatRelativeTime = (dateInput) => {
  if (!dateInput) return '';
  const date = new Date(dateInput);
  const now = new Date();
  const diffMs = now - date;
  
  if (diffMs < 0) return 'Just now';
  
  const diffSecs = Math.floor(diffMs / 1000);
  if (diffSecs < 60) return 'Just now';
  
  const diffMins = Math.floor(diffSecs / 60);
  if (diffMins < 60) return `${diffMins} min ago`;
  
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} hr${diffHours > 1 ? 's' : ''} ago`;
  
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
};

const getNotificationIcon = (title) => {
  const t = title.toLowerCase();
  if (t.includes('added to group') || t.includes('joined')) {
    return <UserPlus className="w-5 h-5 text-indigo-400" />;
  }
  if (t.includes('expense')) {
    return <Receipt className="w-5 h-5 text-emerald-400" />;
  }
  if (t.includes('recalculated') || t.includes('generated') || t.includes('settlement')) {
    if (t.includes('confirmed') || t.includes('approved') || t.includes('paid')) {
      return <CheckCircle className="w-5 h-5 text-emerald-400" />;
    }
    if (t.includes('disputed')) {
      return <AlertTriangle className="w-5 h-5 text-rose-400" />;
    }
    if (t.includes('proof')) {
      return <Upload className="w-5 h-5 text-amber-400" />;
    }
    return <RefreshCw className="w-5 h-5 text-cyan-400" />;
  }
  if (t.includes('proof') || t.includes('payment')) {
    if (t.includes('confirm') || t.includes('receipt') || t.includes('approve')) {
      return <CheckCircle className="w-5 h-5 text-emerald-400" />;
    }
    if (t.includes('dispute')) {
      return <AlertTriangle className="w-5 h-5 text-rose-400" />;
    }
    return <Upload className="w-5 h-5 text-amber-400" />;
  }
  return <Bell className="w-5 h-5 text-blue-400" />;
};

const NotificationCard = ({ notification, onMarkRead }) => {
  const { id, title, message, read, createdAt } = notification;

  return (
    <div 
      className={`relative flex items-start gap-4 p-4 rounded-xl border transition-all duration-300 backdrop-blur-md ${
        read 
          ? 'bg-white/5 border-white/5 hover:bg-white/10' 
          : 'bg-white/10 border-white/20 shadow-[0_4px_20px_rgba(255,255,255,0.02)] hover:bg-white/15'
      }`}
    >
      {/* Read Status Dot Indicator */}
      {!read && (
        <span className="absolute top-4 right-4 w-2.5 h-2.5 bg-blue-500 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.8)] animate-pulse" />
      )}

      {/* Icon Area */}
      <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/5 border border-white/10 shrink-0">
        {getNotificationIcon(title)}
      </div>

      {/* Text Content */}
      <div className="flex-1 min-w-0 pr-4">
        <h4 className={`text-sm font-semibold text-white truncate ${!read ? 'font-bold' : ''}`}>
          {title}
        </h4>
        <p className="mt-1 text-xs text-slate-300 leading-relaxed break-words">
          {message}
        </p>
        <span className="inline-block mt-2 text-[10px] text-slate-400 font-medium">
          {formatRelativeTime(createdAt)}
        </span>
      </div>

      {/* Action Area */}
      {!read && onMarkRead && (
        <button
          onClick={() => onMarkRead(id)}
          className="flex items-center justify-center w-7 h-7 rounded-lg bg-white/5 hover:bg-blue-500/20 border border-white/10 hover:border-blue-500/30 text-slate-400 hover:text-blue-400 transition-all duration-200"
          title="Mark as read"
        >
          <Check className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default NotificationCard;
export { formatRelativeTime };
