import React from 'react';
import { Database, HardDrive, Cpu, Radio, ShieldCheck, ShieldAlert } from 'lucide-react';

const SystemHealthCard = ({ health, ready }) => {
  const isHealthy = health?.status === 'UP' && ready?.status === 'READY';
  const dbStatus = ready?.components?.database || 'DOWN';
  const redisStatus = ready?.components?.redis || 'DOWN';

  return (
    <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">System Health</h3>
        {isHealthy ? (
          <span className="flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <ShieldCheck className="w-3.5 h-3.5 mr-1" />
            SYSTEM ONLINE
          </span>
        ) : (
          <span className="flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <ShieldAlert className="w-3.5 h-3.5 mr-1 animate-pulse" />
            ATTENTION REQUIRED
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Database Status */}
        <div className="bg-slate-950/40 border border-slate-850 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-indigo-500/10 border border-indigo-500/20 rounded-lg">
              <Database className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">PostgreSQL DB</p>
              <p className="text-xs text-slate-500 mt-0.5">Persistence storage</p>
            </div>
          </div>
          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider ${
            dbStatus === 'UP' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
          }`}>
            {dbStatus}
          </span>
        </div>

        {/* Redis Status */}
        <div className="bg-slate-950/40 border border-slate-850 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-rose-500/10 border border-rose-500/20 rounded-lg">
              <HardDrive className="w-5 h-5 text-rose-400" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Redis Cache</p>
              <p className="text-xs text-slate-500 mt-0.5">Performance & session</p>
            </div>
          </div>
          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider ${
            redisStatus === 'UP' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
          }`}>
            {redisStatus}
          </span>
        </div>
      </div>
    </div>
  );
};

export default SystemHealthCard;
