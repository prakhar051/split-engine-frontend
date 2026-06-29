import React from 'react';
import { 
  FolderPlus,
  UserPlus,
  Link,
  XCircle,
  PlusCircle,
  Trash2,
  RefreshCw,
  Upload,
  CheckCircle,
  AlertTriangle,
  User,
  Edit,
  Camera
} from 'lucide-react';
import { formatRelativeTime } from '../notifications/NotificationCard';

const getActivityStyle = (type) => {
  switch (type) {
    case 'GROUP_CREATED':
      return {
        icon: <FolderPlus className="w-5 h-5 text-indigo-400" />,
        borderColor: 'border-indigo-500/30',
        bgColor: 'bg-indigo-500/10'
      };
    case 'MEMBER_JOINED':
      return {
        icon: <UserPlus className="w-5 h-5 text-emerald-400" />,
        borderColor: 'border-emerald-500/30',
        bgColor: 'bg-emerald-500/10'
      };
    case 'INVITE_CREATED':
      return {
        icon: <Link className="w-5 h-5 text-sky-400" />,
        borderColor: 'border-sky-500/30',
        bgColor: 'bg-sky-500/10'
      };
    case 'INVITE_REVOKED':
      return {
        icon: <XCircle className="w-5 h-5 text-amber-400" />,
        borderColor: 'border-amber-500/30',
        bgColor: 'bg-amber-500/10'
      };
    case 'EXPENSE_CREATED':
      return {
        icon: <PlusCircle className="w-5 h-5 text-teal-400" />,
        borderColor: 'border-teal-500/30',
        bgColor: 'bg-teal-500/10'
      };
    case 'EXPENSE_DELETED':
      return {
        icon: <Trash2 className="w-5 h-5 text-rose-400" />,
        borderColor: 'border-rose-500/30',
        bgColor: 'bg-rose-500/10'
      };
    case 'SETTLEMENT_GENERATED':
      return {
        icon: <RefreshCw className="w-5 h-5 text-cyan-400" />,
        borderColor: 'border-cyan-500/30',
        bgColor: 'bg-cyan-500/10'
      };
    case 'PROOF_UPLOADED':
      return {
        icon: <Upload className="w-5 h-5 text-purple-400" />,
        borderColor: 'border-purple-500/30',
        bgColor: 'bg-purple-500/10'
      };
    case 'SETTLEMENT_PAID':
      return {
        icon: <CheckCircle className="w-5 h-5 text-emerald-400" />,
        borderColor: 'border-emerald-500/30',
        bgColor: 'bg-emerald-500/10'
      };
    case 'SETTLEMENT_DISPUTED':
      return {
        icon: <AlertTriangle className="w-5 h-5 text-rose-400" />,
        borderColor: 'border-rose-500/30',
        bgColor: 'bg-rose-500/10'
      };
    case 'PROFILE_NAME_UPDATED':
      return {
        icon: <Edit className="w-5 h-5 text-blue-400" />,
        borderColor: 'border-blue-500/30',
        bgColor: 'bg-blue-500/10'
      };
    case 'PROFILE_AVATAR_UPLOADED':
    case 'PROFILE_AVATAR_REMOVED':
      return {
        icon: <Camera className="w-5 h-5 text-purple-400" />,
        borderColor: 'border-purple-500/30',
        bgColor: 'bg-purple-500/10'
      };
    default:
      return {
        icon: <User className="w-5 h-5 text-slate-400" />,
        borderColor: 'border-slate-500/30',
        bgColor: 'bg-slate-500/10'
      };
  }
};

const ActivityTimeline = ({ activities }) => {
  if (!activities || activities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md">
        <p className="text-slate-400 text-sm">No activity recorded yet for this group.</p>
      </div>
    );
  }

  return (
    <div className="relative border-l-2 border-white/10 pl-6 ml-4 space-y-8 py-2">
      {activities.map((activity) => {
        const { id, type, message, createdAt, user } = activity;
        const style = getActivityStyle(type);

        const initials = user?.name
          ? user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
          : '?';

        return (
          <div key={id} className="relative group">
            {/* Timeline Node Icon Indicator */}
            <span className={`absolute -left-[38px] top-1.5 flex items-center justify-center w-8 h-8 rounded-full border ${style.borderColor} ${style.bgColor} shadow-lg backdrop-blur-md transition-all duration-300 group-hover:scale-110`}>
              {style.icon}
            </span>

            {/* Glassmorphism Activity Content Card */}
            <div className="p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl shadow-xl transition-all duration-300 backdrop-blur-md flex items-start gap-4">
              {/* User Avatar / Initials */}
              {user?.avatar ? (
                <img 
                  src={user.avatar} 
                  alt={user.name} 
                  className="w-10 h-10 rounded-full border border-white/10 object-cover shrink-0" 
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white text-xs font-bold border border-white/10 shrink-0 shadow-[0_0_8px_rgba(59,130,246,0.3)]">
                  {initials}
                </div>
              )}

              {/* Message Details */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                  <span className="text-xs font-semibold text-slate-400">
                    {user?.name || 'System'}
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium">
                    {formatRelativeTime(createdAt)}
                  </span>
                </div>
                <p className="mt-1 text-sm text-white font-medium leading-relaxed">
                  {message}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ActivityTimeline;
