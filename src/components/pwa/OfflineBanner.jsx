import React from 'react';
import { useOfflineStore } from '../../store/offlineStore';
import { WifiOff, AlertTriangle } from 'lucide-react';

export default function OfflineBanner() {
  const isOnline = useOfflineStore((state) => state.isOnline);
  const pendingRequests = useOfflineStore((state) => state.pendingRequests);
  const failedRequests = useOfflineStore((state) => state.failedRequests);

  if (isOnline) return null;

  const totalQueued = pendingRequests.length + failedRequests.length;

  return (
    <div className="bg-amber-600 text-white px-4 py-2 text-center text-sm font-semibold flex items-center justify-center gap-2 shadow-md animate-pulse">
      <WifiOff size={16} />
      <span>You are currently offline.</span>
      {totalQueued > 0 && (
        <span className="bg-amber-800 text-amber-100 text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
          <AlertTriangle size={12} />
          {totalQueued} pending request{totalQueued !== 1 ? 's' : ''} queued
        </span>
      )}
    </div>
  );
}
