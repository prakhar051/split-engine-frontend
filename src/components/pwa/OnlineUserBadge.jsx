import { useSocketStore } from '../../store/socketStore';

export default function OnlineUserBadge({ userId, showText = false }) {
  const onlineUsers = useSocketStore((state) => state.onlineUsers);
  const isOnline = onlineUsers.includes(userId);

  if (showText) {
    return (
      <div className="flex items-center gap-1.5">
        <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500 shadow-sm shadow-emerald-500/50' : 'bg-slate-600'}`} />
        <span className={`text-xs ${isOnline ? 'text-emerald-400 font-medium' : 'text-slate-400'}`}>
          {isOnline ? 'Online' : 'Offline'}
        </span>
      </div>
    );
  }

  return (
    <div className="relative flex h-2 w-2 select-none">
      {isOnline && (
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
      )}
      <span className={`relative inline-flex rounded-full h-2 w-2 ${isOnline ? 'bg-emerald-500' : 'bg-slate-600'}`}></span>
    </div>
  );
}
