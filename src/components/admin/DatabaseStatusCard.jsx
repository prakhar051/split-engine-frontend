import React from 'react';
import { Database, ShieldCheck, ShieldAlert } from 'lucide-react';

const DatabaseStatusCard = ({ ready }) => {
  const dbStatus = ready?.components?.database || 'DOWN';

  return (
    <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Postgres Database</h3>
        {dbStatus === 'UP' ? (
          <span className="flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            CONNECTED
          </span>
        ) : (
          <span className="flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
            OFFLINE
          </span>
        )}
      </div>

      <div className="space-y-4">
        {/* Connection status card */}
        <div className="bg-slate-950/40 border border-slate-850 p-5 rounded-xl flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
              <Database className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <p className="text-xs text-slate-300 font-bold uppercase tracking-wider">Database Status</p>
              <p className="text-[10px] text-slate-500 mt-0.5">PostgreSQL via Prisma Client</p>
            </div>
          </div>
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold tracking-wider ${
            dbStatus === 'UP' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
          }`}>
            {dbStatus}
          </span>
        </div>

        <div className="bg-slate-950/30 border border-slate-850 p-3.5 rounded-xl text-[10px] text-slate-500 leading-relaxed">
          Stores user profile models, group settings, transaction splits, attachments, audit logs history, and active recurring schedules templates.
        </div>
      </div>
    </div>
  );
};

export default DatabaseStatusCard;
