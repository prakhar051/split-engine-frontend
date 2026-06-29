import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function VersionConflictDialog({ isOpen, onClose, onRefresh }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm" />
      
      <div className="relative bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-sm w-full shadow-xl space-y-6">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Version Conflict</h3>
            <p className="text-xs text-slate-400 mt-1">
              This recurring template has been modified by another user.
            </p>
            <p className="text-xs text-slate-400 mt-2">
              Please refresh to fetch the latest changes before making updates.
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2 px-4 bg-slate-950/40 hover:bg-slate-950/80 text-slate-400 hover:text-slate-200 text-xs font-bold border border-slate-850 rounded-xl transition cursor-pointer"
          >
            Close
          </button>
          <button
            onClick={onRefresh}
            className="flex-1 flex items-center justify-center space-x-1.5 py-2 px-4 bg-amber-600 hover:bg-amber-550 text-white text-xs font-bold rounded-xl transition cursor-pointer animate-pulse"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh Now</span>
          </button>
        </div>
      </div>
    </div>
  );
}
