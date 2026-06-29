import { Calendar, Play, Pause, AlertCircle, CheckCircle, Clock } from 'lucide-react';

export default function RecurringWidget({ summary, isLoading }) {
  if (isLoading || !summary) {
    return (
      <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-2xl p-6 shadow-lg space-y-4 animate-pulse">
        <div className="h-4 w-32 bg-slate-800 rounded"></div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 bg-slate-800 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  const {
    activeRecurringCount = 0,
    pausedRecurringCount = 0,
    executionsTodayCount = 0,
    failedExecutionsCount = 0,
    nextScheduledExecution = null
  } = summary;

  const formatUTC = (dateStr) => {
    if (!dateStr) return 'No runs scheduled';
    const d = new Date(dateStr);
    return d.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'UTC'
    }) + ' (UTC)';
  };

  return (
    <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-2xl p-6 shadow-lg space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-indigo-400" />
          <h3 className="text-base font-bold text-white">Recurring Expenses Summary</h3>
        </div>
        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
          Scheduler Active
        </span>
      </div>

      {/* Grid of stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Active Schedules */}
        <div className="bg-slate-950/50 border border-slate-850 rounded-xl p-3.5 flex items-center space-x-3">
          <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg shrink-0">
            <Play className="w-4 h-4 fill-current" />
          </div>
          <div>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Active</p>
            <p className="text-lg font-black text-white mt-0.5">{activeRecurringCount}</p>
          </div>
        </div>

        {/* Paused Schedules */}
        <div className="bg-slate-950/50 border border-slate-850 rounded-xl p-3.5 flex items-center space-x-3">
          <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg shrink-0">
            <Pause className="w-4 h-4 fill-current" />
          </div>
          <div>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Paused</p>
            <p className="text-lg font-black text-white mt-0.5">{pausedRecurringCount}</p>
          </div>
        </div>

        {/* Executed Today */}
        <div className="bg-slate-950/50 border border-slate-850 rounded-xl p-3.5 flex items-center space-x-3">
          <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg shrink-0">
            <CheckCircle className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Executed Today</p>
            <p className="text-lg font-black text-white mt-0.5">{executionsTodayCount}</p>
          </div>
        </div>

        {/* Failed Today */}
        <div className="bg-slate-950/50 border border-slate-850 rounded-xl p-3.5 flex items-center space-x-3">
          <div className={`p-2 rounded-lg shrink-0 ${failedExecutionsCount > 0 ? 'bg-rose-500/10 text-rose-400' : 'bg-slate-800 text-slate-500'}`}>
            <AlertCircle className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Failed Today</p>
            <p className={`text-lg font-black mt-0.5 ${failedExecutionsCount > 0 ? 'text-rose-400' : 'text-white'}`}>
              {failedExecutionsCount}
            </p>
          </div>
        </div>
      </div>

      {/* Next Execution Row */}
      <div className="bg-slate-950/30 border border-slate-850 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-indigo-400" />
          <span className="text-slate-400 font-medium">Next Scheduled Execution:</span>
        </div>
        <span className="font-bold text-slate-200 bg-slate-900 border border-slate-800 px-3 py-1 rounded-lg">
          {formatUTC(nextScheduledExecution)}
        </span>
      </div>
    </div>
  );
}
