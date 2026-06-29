import { useSocketStore } from '../../store/socketStore';
import { Wifi, WifiOff, RefreshCw, Activity } from 'lucide-react';

export default function ConnectionStatus() {
  const { connected, connecting, reconnectAttempts, latency } = useSocketStore();

  if (connected) {
    return (
      <div className="flex items-center space-x-2 text-xs font-semibold px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full shadow-inner animate-fade-in">
        <Wifi className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
        <span>Live Sync Connected</span>
        <span className="h-3 w-px bg-emerald-500/30"></span>
        <div className="flex items-center gap-1 text-[10px] text-emerald-500/80">
          <Activity className="w-3 h-3" />
          <span>{latency} ms</span>
        </div>
      </div>
    );
  }

  if (connecting) {
    return (
      <div className="flex items-center space-x-2 text-xs font-semibold px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-full shadow-inner animate-fade-in">
        <RefreshCw className="w-3.5 h-3.5 text-amber-400 animate-spin" />
        <span>Reconnecting...</span>
        {reconnectAttempts > 0 && (
          <>
            <span className="h-3 w-px bg-amber-500/30"></span>
            <span>Attempt {reconnectAttempts}/10</span>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2 text-xs font-semibold px-3 py-1.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-full shadow-inner animate-fade-in">
      <WifiOff className="w-3.5 h-3.5 text-rose-400" />
      <span>Real-Time Offline</span>
    </div>
  );
}
