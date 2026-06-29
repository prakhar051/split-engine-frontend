import React, { useState } from 'react';
import { Terminal, Database, Clock, RefreshCw } from 'lucide-react';

const RecentLogsCard = () => {
  const [backingUp, setBackingUp] = useState(false);
  const [backupLogs, setBackupLogs] = useState([]);
  
  const triggerBackupMock = () => {
    setBackingUp(true);
    setBackupLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] Triggering manual system backup...`]);
    
    setTimeout(() => {
      setBackupLogs(prev => [
        ...prev,
        `[${new Date().toLocaleTimeString()}] executing: pg_dump -h localhost -p 5432 -U postgres -F c`,
        `[${new Date().toLocaleTimeString()}] ✓ Backup archive file successfully generated!`,
      ]);
      setBackingUp(false);
    }, 2000);
  };

  return (
    <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Database Tools (Danger Zone)</h3>
        <button
          onClick={triggerBackupMock}
          disabled={backingUp}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white transition-colors cursor-pointer"
        >
          <Database className="w-3.5 h-3.5" />
          <span>Manual Backup</span>
        </button>
      </div>

      <div className="space-y-4">
        {/* Terminal output mockup */}
        <div className="bg-slate-950 border border-slate-850 rounded-xl p-4 font-mono text-[10px] text-indigo-400 space-y-2 h-44 overflow-y-auto">
          <div className="flex items-center text-slate-550 border-b border-slate-900 pb-1.5 mb-1.5">
            <Terminal className="w-3.5 h-3.5 mr-1 text-slate-500" />
            <span>Console output logs</span>
          </div>
          
          <p className="text-slate-500">// System started cleanly.</p>
          <p className="text-slate-500">// Cron scheduler registered monthly and yearly budget jobs.</p>
          {backupLogs.map((log, index) => (
            <p key={index} className="text-indigo-400 mt-0.5 leading-relaxed">{log}</p>
          ))}
          {backingUp && (
            <div className="flex items-center space-x-1 mt-1 text-indigo-500">
              <RefreshCw className="w-3 h-3 animate-spin" />
              <span>Backing up database...</span>
            </div>
          )}
        </div>

        <div className="bg-slate-950/30 border border-slate-850 p-3.5 rounded-xl text-[10px] text-slate-500 leading-relaxed space-y-1">
          <span className="font-bold text-slate-400 uppercase tracking-wider block mb-1">Backup instructions</span>
          To perform backup or restore manually on host instance, run:
          <code className="block bg-slate-950/50 p-1.5 mt-1 rounded text-indigo-400 font-mono select-all">npm run db:backup</code>
          <code className="block bg-slate-950/50 p-1.5 mt-1 rounded text-indigo-400 font-mono select-all">npm run db:restore</code>
        </div>
      </div>
    </div>
  );
};

export default RecentLogsCard;
