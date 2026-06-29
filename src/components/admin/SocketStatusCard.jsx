import React from 'react';
import { Radio, Users, Activity } from 'lucide-react';

const SocketStatusCard = ({ metrics }) => {
  const activeConn = metrics?.sockets?.activeConnections || 0;

  return (
    <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Socket.IO Server</h3>
        <span className="flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <Activity className="w-3 h-3 mr-1 text-emerald-400 animate-pulse" />
          ACTIVE
        </span>
      </div>

      <div className="space-y-4">
        {/* Active Sockets count */}
        <div className="bg-slate-950/40 border border-slate-850 p-5 rounded-xl flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-sky-500/10 border border-sky-500/20 rounded-xl">
              <Users className="w-5 h-5 text-sky-400" />
            </div>
            <div>
              <p className="text-xs text-slate-300 font-bold uppercase tracking-wider">Active Sockets</p>
              <p className="text-[10px] text-slate-500 mt-0.5">Real-time listening clients</p>
            </div>
          </div>
          <span className="text-2xl font-black text-slate-100 pr-2">
            {activeConn}
          </span>
        </div>

        <div className="bg-slate-950/30 border border-slate-850 p-3.5 rounded-xl text-[10px] text-slate-500 leading-relaxed">
          Handles real-time expense calculations, notifications alerts, group roster presence maps, and suppresses duplicates via local suppressor cache.
        </div>
      </div>
    </div>
  );
};

export default SocketStatusCard;
