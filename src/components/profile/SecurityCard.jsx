import { ShieldAlert, LogOut } from 'lucide-react';

export default function SecurityCard({ onLogout, onLogoutAll, isLoading }) {
  return (
    <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-2xl p-6 shadow-md space-y-6">
      <div>
        <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center space-x-2">
          <ShieldAlert className="w-4 h-4 text-rose-500" />
          <span>Account Security</span>
        </h3>
        <p className="text-xs text-slate-400 mt-1">
          Manage your active login sessions and device accesses.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Logout Current Session */}
        <button
          onClick={onLogout}
          disabled={isLoading}
          className="w-full flex items-center justify-center space-x-2 py-3 px-4 bg-slate-800 hover:bg-slate-750 text-white font-medium text-xs rounded-xl border border-slate-700/50 hover:border-slate-650 transition duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <LogOut className="w-4 h-4 text-slate-450" />
          <span>Log Out Current Session</span>
        </button>

        {/* Logout All Connected Devices */}
        <button
          onClick={onLogoutAll}
          disabled={isLoading}
          className="w-full flex items-center justify-center space-x-2 py-3 px-4 bg-rose-950/15 hover:bg-rose-900/15 text-rose-400 hover:text-rose-350 font-medium text-xs rounded-xl border border-rose-900/30 hover:border-rose-800/40 transition duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ShieldAlert className="w-4 h-4 text-rose-500 animate-pulse" />
          <span>Log Out All Devices</span>
        </button>
      </div>
    </div>
  );
}
