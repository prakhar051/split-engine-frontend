import React from 'react';
import { Database, Percent, Award, Shield } from 'lucide-react';

const CacheStatisticsCard = ({ metrics }) => {
  const cache = metrics?.cache;
  const cacheSize = cache?.cacheSize || 0;
  const hits = cache?.cacheHits || 0;
  const misses = cache?.cacheMisses || 0;
  const hitRatio = cache?.cacheHitRatio ? Math.round(cache.cacheHitRatio * 100) : 0;
  const avgGenTime = cache?.averageGenerationTimeMs ? Math.round(cache.averageGenerationTimeMs) : 0;

  return (
    <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">In-Memory Cache</h3>
        <span className="flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
          TTL ACTIVE
        </span>
      </div>

      <div className="space-y-4">
        {/* Cache sizes & Hit ratio */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-950/30 border border-slate-850 p-3.5 rounded-xl space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-550 flex items-center">
              <Percent className="w-3 h-3 mr-1 text-emerald-400" />
              Cache Hit Ratio
            </p>
            <p className="text-sm font-bold text-slate-200">{hitRatio}%</p>
          </div>

          <div className="bg-slate-950/30 border border-slate-850 p-3.5 rounded-xl space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-550 flex items-center">
              <Database className="w-3 h-3 mr-1 text-indigo-400" />
              Cache Size
            </p>
            <p className="text-sm font-bold text-slate-200">{cacheSize} keys</p>
          </div>
        </div>

        {/* Detailed hits / misses and generation latency */}
        <div className="bg-slate-950/40 border border-slate-850 p-3.5 rounded-xl text-xs space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-slate-550">Cache Hits / Misses</span>
            <span className="text-slate-300 font-semibold">{hits} hits / {misses} misses</span>
          </div>
          <div className="flex justify-between items-center border-t border-slate-900 pt-2">
            <span className="text-slate-550">Average Query Speed</span>
            <span className="text-slate-350 font-medium">{avgGenTime}ms (un-cached)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CacheStatisticsCard;
