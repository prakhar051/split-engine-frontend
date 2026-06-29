import React from 'react';
import { Calendar, CheckCircle2, AlertCircle, Clock } from 'lucide-react';

const SchedulerStatusCard = ({ metrics }) => {
  const sched = metrics?.scheduler;
  const isRunning = sched?.running || false;
  
  const lastSuccess = sched?.lastSuccessfulRun 
    ? new Date(sched.lastSuccessfulRun).toLocaleTimeString() 
    : 'Never';
  
  const lastFailed = sched?.lastFailedRun 
    ? new Date(sched.lastFailedRun).toLocaleTimeString() 
    : 'None';

  return (
    <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Cron Scheduler</h3>
        {isRunning ? (
          <span className="flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            PROCESSING
          </span>
        ) : (
          <span className="flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-400 border border-slate-700">
            IDLE
          </span>
        )}
      </div>

      <div className="space-y-4">
        {/* Success / Failed Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-950/30 border border-slate-850 p-4 rounded-xl flex items-center space-x-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Last Success</p>
              <p className="text-xs font-semibold text-slate-300 mt-0.5">{lastSuccess}</p>
            </div>
          </div>

          <div className="bg-slate-950/30 border border-slate-850 p-4 rounded-xl flex items-center space-x-3">
            <AlertCircle className={`w-5 h-5 shrink-0 ${sched?.lastFailedRun ? 'text-rose-400' : 'text-slate-600'}`} />
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Last Failure</p>
              <p className="text-xs font-semibold text-slate-300 mt-0.5">{lastFailed}</p>
            </div>
          </div>
        </div>

        <div className="bg-slate-950/40 border border-slate-850 p-3.5 rounded-xl text-xs flex justify-between items-center">
          <span className="text-slate-500 font-bold uppercase tracking-wider flex items-center">
            <Clock className="w-3.5 h-3.5 mr-1.5 text-sky-400" />
            Scheduler Uptime
          </span>
          <span className="text-slate-400 font-medium">{sched?.uptime ? `${sched.uptime}s` : '0s'}</span>
        </div>
      </div>
    </div>
  );
};

export default SchedulerStatusCard;
