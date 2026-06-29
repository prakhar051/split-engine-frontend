import React from 'react';
import { Cpu, HardDrive, Clock } from 'lucide-react';

const MetricsCard = ({ metrics }) => {
  const formatBytes = (bytes) => {
    if (!bytes) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const uptimeStr = (seconds) => {
    if (!seconds) return '0s';
    const d = Math.floor(seconds / (3600 * 24));
    const h = Math.floor((seconds % (3600 * 24)) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${d > 0 ? d + 'd ' : ''}${h > 0 ? h + 'h ' : ''}${m > 0 ? m + 'm ' : ''}${s}s`;
  };

  const heapUsed = metrics?.memory?.heapUsed || 0;
  const heapTotal = metrics?.memory?.heapTotal || 0;
  const heapPercent = heapTotal > 0 ? Math.round((heapUsed / heapTotal) * 100) : 0;

  return (
    <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Resource Observability</h3>
      </div>

      <div className="space-y-4">
        {/* Memory allocation */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-bold text-slate-300">
            <span className="flex items-center">
              <HardDrive className="w-3.5 h-3.5 mr-1.5 text-indigo-400" />
              Node Heap Allocation
            </span>
            <span>{formatBytes(heapUsed)} / {formatBytes(heapTotal)} ({heapPercent}%)</span>
          </div>
          <div className="w-full bg-slate-950 border border-slate-850 h-2.5 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                heapPercent > 85 ? 'bg-red-500' : heapPercent > 70 ? 'bg-amber-500' : 'bg-indigo-500'
              }`}
              style={{ width: `${heapPercent}%` }}
            />
          </div>
        </div>

        {/* RSS memory usage */}
        <div className="flex justify-between items-center text-xs bg-slate-950/30 border border-slate-850 p-3.5 rounded-xl">
          <span className="text-slate-400 font-bold uppercase tracking-wider">Resident Set Size (RSS)</span>
          <span className="font-bold text-slate-200">{formatBytes(metrics?.memory?.rss)}</span>
        </div>

        {/* CPU and Uptime info */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-950/30 border border-slate-850 p-3.5 rounded-xl space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center">
              <Cpu className="w-3 h-3 mr-1 text-emerald-400" />
              CPU User Load
            </p>
            <p className="text-sm font-bold text-slate-200">
              {metrics?.cpu ? `${(metrics.cpu.user / 1000000).toFixed(2)}s` : '0.00s'}
            </p>
          </div>

          <div className="bg-slate-950/30 border border-slate-850 p-3.5 rounded-xl space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center">
              <Clock className="w-3 h-3 mr-1 text-sky-400" />
              Instance Uptime
            </p>
            <p className="text-sm font-bold text-slate-200">{uptimeStr(metrics?.uptime)}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MetricsCard;
