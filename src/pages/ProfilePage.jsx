import { useAuthStore } from '../store/authStore';
import { User, Mail, Calendar, Image as ImageIcon, LogOut, ShieldAlert } from 'lucide-react';

export default function ProfilePage() {
  const { user, logout, logoutAllDevices } = useAuthStore();

  const getInitials = (n) => {
    if (!n) return 'U';
    return n.split(' ').map(part => part[0]).join('').slice(0, 2).toUpperCase();
  };

  const formattedDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
    : 'Unknown';

  return (
    <div className="max-w-xl mx-auto space-y-8 font-sans">
      {/* Profile Header */}
      <div>
        <h1 className="text-3xl font-black tracking-tight text-white mb-2">My Profile</h1>
        <p className="text-slate-400 text-sm">Manage your SplitWise Pro user profile and security sessions.</p>
      </div>

      {/* Profile Card */}
      <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-2xl p-6 md:p-8 shadow-2xl flex flex-col items-center text-center space-y-6">
        {/* Avatar */}
        <div className="relative">
          {user?.avatar ? (
            <img
              src={user.avatar}
              alt={user.name}
              className="w-28 h-28 rounded-full object-cover border-4 border-slate-800 shadow-xl"
            />
          ) : (
            <div className="w-28 h-28 rounded-full bg-gradient-to-tr from-violet-600 to-indigo-600 border-4 border-slate-850 flex items-center justify-center text-3xl font-bold text-white shadow-xl">
              {getInitials(user?.name)}
            </div>
          )}
        </div>

        {/* User Identity */}
        <div>
          <h2 className="text-2xl font-bold text-white">{user?.name}</h2>
          <p className="text-slate-400 text-sm mt-1">{user?.email}</p>
        </div>

        {/* Information Table */}
        <div className="w-full bg-slate-950/40 border border-slate-800/80 rounded-xl p-5 space-y-4 text-left">
          <div className="flex items-center space-x-3 text-slate-300">
            <User className="w-5 h-5 text-indigo-400 shrink-0" />
            <div className="min-w-0">
              <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">User ID</p>
              <p className="text-sm font-mono truncate">{user?.id}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3 text-slate-300">
            <Mail className="w-5 h-5 text-indigo-400 shrink-0" />
            <div className="min-w-0">
              <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Email Address</p>
              <p className="text-sm truncate">{user?.email}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3 text-slate-300">
            <Calendar className="w-5 h-5 text-indigo-400 shrink-0" />
            <div className="min-w-0">
              <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Member Since</p>
              <p className="text-sm">{formattedDate}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Avatar Update UI (MOCK) */}
      <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-2xl p-6 shadow-2xl">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center space-x-2">
          <ImageIcon className="w-5 h-5 text-violet-400" />
          <span>Update Avatar</span>
        </h3>
        <p className="text-slate-400 text-sm mb-4">
          Provide a URL to update your profile picture. Custom avatars are supported via Cloudinary in the backend.
        </p>
        <div className="flex gap-3">
          <input
            type="url"
            disabled
            placeholder="https://example.com/avatar.jpg"
            className="flex-grow px-4 py-3 bg-slate-950/50 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-650 text-sm opacity-60 focus:outline-none"
          />
          <button
            disabled
            className="px-5 py-3 bg-slate-800 text-slate-400 font-semibold text-sm rounded-xl cursor-not-allowed"
          >
            Update
          </button>
        </div>
      </div>

      {/* Security Actions Card */}
      <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center space-x-2">
            <ShieldAlert className="w-5 h-5 text-rose-500" />
            <span>Account Security</span>
          </h3>
          <p className="text-slate-400 text-sm mt-1">Sign out of active sessions or terminate access from all connected devices.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Logout Current */}
          <button
            onClick={logout}
            className="w-full flex items-center justify-center space-x-2 py-3 px-4 bg-slate-800 hover:bg-slate-700/80 text-white font-medium text-sm rounded-xl transition duration-200 cursor-pointer border border-slate-700/50"
          >
            <LogOut className="w-4 h-4 text-slate-400" />
            <span>Log Out Current Session</span>
          </button>

          {/* Logout All */}
          <button
            onClick={logoutAllDevices}
            className="w-full flex items-center justify-center space-x-2 py-3 px-4 bg-rose-950/20 hover:bg-rose-900/20 text-rose-350 hover:text-rose-350 font-medium text-sm rounded-xl border border-rose-900/30 hover:border-rose-800/40 transition duration-200 cursor-pointer"
          >
            <ShieldAlert className="w-4 h-4 text-rose-500 animate-pulse" />
            <span>Log Out All Devices</span>
          </button>
        </div>
      </div>
    </div>
  );
}
