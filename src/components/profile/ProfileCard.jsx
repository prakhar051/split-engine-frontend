import { Calendar, Mail, User } from 'lucide-react';

export default function ProfileCard({ user }) {
  if (!user) return null;

  const formattedDate = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : 'Unknown';

  const getInitials = (name) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  };

  return (
    <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-2xl p-6 shadow-md flex flex-col items-center text-center space-y-6">
      {/* Avatar Display */}
      <div className="relative">
        {user.avatar ? (
          <img
            src={user.avatar}
            alt={user.name}
            className="w-24 h-24 rounded-full object-cover border-4 border-slate-800 shadow-lg"
          />
        ) : (
          <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-violet-600 to-indigo-600 border-4 border-slate-850 flex items-center justify-center text-3xl font-bold text-white shadow-lg">
            {getInitials(user.name)}
          </div>
        )}
      </div>

      {/* Profile Details */}
      <div className="space-y-1">
        <h2 className="text-xl font-bold text-white">{user.name}</h2>
        <p className="text-xs text-slate-400">{user.email}</p>
      </div>

      {/* Info List */}
      <div className="w-full bg-slate-950/40 border border-slate-850 rounded-xl p-4 space-y-3.5 text-left text-xs">
        <div className="flex items-center space-x-3 text-slate-300">
          <User className="w-4 h-4 text-indigo-400 shrink-0" />
          <div className="min-w-0">
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">User ID</p>
            <p className="font-mono truncate">{user.id}</p>
          </div>
        </div>

        <div className="flex items-center space-x-3 text-slate-300">
          <Mail className="w-4 h-4 text-indigo-400 shrink-0" />
          <div className="min-w-0">
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Email Address</p>
            <p className="truncate">{user.email}</p>
          </div>
        </div>

        <div className="flex items-center space-x-3 text-slate-300">
          <Calendar className="w-4 h-4 text-indigo-400 shrink-0" />
          <div className="min-w-0">
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Member Since</p>
            <p>{formattedDate}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
