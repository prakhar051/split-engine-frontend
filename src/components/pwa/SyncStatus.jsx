import React, { useState } from 'react';
import { useOfflineStore } from '../../store/offlineStore';
import { RefreshCw, Trash2, AlertCircle, CheckCircle, Wifi, CloudLightning, X } from 'lucide-react';

export default function SyncStatus() {
  const isOnline = useOfflineStore((state) => state.isOnline);
  const pendingRequests = useOfflineStore((state) => state.pendingRequests);
  const failedRequests = useOfflineStore((state) => state.failedRequests);
  const syncing = useOfflineStore((state) => state.syncing);
  const lastSync = useOfflineStore((state) => state.lastSync);

  const retryRequest = useOfflineStore((state) => state.retryRequest);
  const discardRequest = useOfflineStore((state) => state.discardRequest);
  const syncQueue = useOfflineStore((state) => state.syncQueue);

  const [isOpen, setIsOpen] = useState(false);

  const totalPending = pendingRequests.length;
  const totalFailed = failedRequests.length;

  if (totalPending === 0 && totalFailed === 0) {
    if (!lastSync) return null;
    return (
      <div className="text-xs text-slate-500 flex items-center justify-center gap-1.5 p-2 border-t border-slate-800">
        <CheckCircle size={12} className="text-emerald-500" />
        <span>Synced. Last: {new Date(lastSync).toLocaleTimeString()}</span>
      </div>
    );
  }

  const formatRequestLabel = (req) => {
    // Make a readable label from URL/Method
    const method = req.method.toUpperCase();
    let path = req.url;
    // Clean up base URL if absolute
    if (path.startsWith('http')) {
      try {
        path = new URL(path).pathname;
      } catch (_) {}
    }
    return `${method} ${path}`;
  };

  return (
    <div className="p-2 border-t border-slate-800 bg-slate-900/50">
      <div className="flex items-center justify-between text-xs">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1.5 font-medium text-slate-300 hover:text-white transition cursor-pointer"
        >
          {syncing ? (
            <RefreshCw size={12} className="animate-spin text-blue-500" />
          ) : totalFailed > 0 ? (
            <CloudLightning size={12} className="text-rose-500 animate-pulse" />
          ) : (
            <RefreshCw size={12} className="text-amber-500" />
          )}
          <span>
            {syncing
              ? 'Syncing requests...'
              : `${totalPending} pending, ${totalFailed} failed`}
          </span>
        </button>

        {isOnline && totalPending > 0 && !syncing && (
          <button
            onClick={() => syncQueue()}
            className="text-[10px] text-blue-500 hover:underline font-semibold uppercase tracking-wider"
          >
            Sync Now
          </button>
        )}
      </div>

      {isOpen && (
        <div className="mt-2 space-y-1.5 max-h-48 overflow-y-auto text-[11px] border-t border-slate-800/50 pt-2">
          {pendingRequests.map((req) => (
            <div
              key={req.id}
              className="flex items-center justify-between bg-slate-850 p-1.5 rounded border border-slate-800 text-slate-400"
            >
              <span className="truncate max-w-[130px] font-mono" title={formatRequestLabel(req)}>
                {formatRequestLabel(req)}
              </span>
              <span className="text-[9px] uppercase tracking-wide text-amber-500 animate-pulse font-semibold">
                Pending
              </span>
            </div>
          ))}

          {failedRequests.map((req) => (
            <div
              key={req.id}
              className="bg-rose-950/20 p-2 rounded border border-rose-900/50 text-slate-300 space-y-1.5"
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-rose-400 truncate max-w-[110px] font-mono" title={formatRequestLabel(req)}>
                  {formatRequestLabel(req)}
                </span>
                <span className="text-[9px] bg-rose-900/40 text-rose-300 px-1.5 py-0.5 rounded font-mono font-semibold">
                  FAILED
                </span>
              </div>
              {req.errorDetails && (
                <div className="text-[10px] text-rose-300/80 bg-rose-950/40 p-1 rounded font-mono break-all border border-rose-950">
                  {req.errorDetails}
                </div>
              )}
              <div className="flex gap-1.5 justify-end">
                <button
                  onClick={() => discardRequest(req.id)}
                  className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition"
                  title="Discard request"
                >
                  <Trash2 size={10} />
                  <span>Discard</span>
                </button>
                <button
                  onClick={() => retryRequest(req.id)}
                  className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-blue-600 hover:bg-blue-500 text-white transition font-semibold"
                  title="Retry request"
                >
                  <RefreshCw size={10} />
                  <span>Retry</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
