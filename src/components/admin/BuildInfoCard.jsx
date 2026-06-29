import React from 'react';
import { Tag, Code, Calendar, HardDrive } from 'lucide-react';

const BuildInfoCard = ({ version }) => {
  const buildDate = version?.buildTimestamp
    ? new Date(version.buildTimestamp).toLocaleString()
    : 'N/A';

  return (
    <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Build & Release Information</h3>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* App Version */}
        <div className="bg-slate-950/30 border border-slate-850 p-3.5 rounded-xl space-y-1">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center">
            <Tag className="w-3 h-3 mr-1 text-indigo-400" />
            App Version
          </p>
          <p className="text-sm font-bold text-slate-200">{version?.appVersion || '1.0.0'}</p>
        </div>

        {/* Git Commit Hash */}
        <div className="bg-slate-950/30 border border-slate-850 p-3.5 rounded-xl space-y-1">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center">
            <Code className="w-3 h-3 mr-1 text-emerald-400" />
            Git Commit
          </p>
          <p className="text-sm font-bold text-slate-200 font-mono text-xs mt-0.5 select-all">
            {version?.gitCommit ? version.gitCommit.substring(0, 8) : 'unknown'}
          </p>
        </div>

        {/* Node Version */}
        <div className="bg-slate-950/30 border border-slate-850 p-3.5 rounded-xl space-y-1">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center">
            <HardDrive className="w-3 h-3 mr-1 text-amber-400" />
            Node Engine
          </p>
          <p className="text-sm font-bold text-slate-200">{version?.nodeVersion || 'N/A'}</p>
        </div>

        {/* Deployment Environment */}
        <div className="bg-slate-950/30 border border-slate-850 p-3.5 rounded-xl space-y-1">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center">
            <Calendar className="w-3 h-3 mr-1 text-sky-400" />
            Release Environment
          </p>
          <span className={`inline-block text-xs font-bold uppercase px-2 py-0.5 rounded border mt-0.5 ${
            version?.environment === 'production'
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
              : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
          }`}>
            {version?.environment || 'development'}
          </span>
        </div>
      </div>

      <div className="bg-slate-950/40 border border-slate-850 p-3.5 rounded-xl text-xs flex justify-between items-center">
        <span className="text-slate-500 font-bold uppercase tracking-wider">Build Timestamp</span>
        <span className="text-slate-400 font-medium">{buildDate}</span>
      </div>
    </div>
  );
};

export default BuildInfoCard;
