import { Landmark, Shield, Users } from 'lucide-react';
import { useCurrencyStore } from '../../store/currencyStore';

export default function SummaryCards({ summary, isLoading }) {
  const { formatCurrency: storeFmt, preferredCurrency } = useCurrencyStore();
  const formatCurrency = (cents) => {
    if (cents === undefined || cents === null) return storeFmt(0, preferredCurrency || 'INR');
    return storeFmt(cents, preferredCurrency || 'INR');
  };

  const getNetColor = (cents) => {
    if (!cents || cents === 0) return 'text-slate-100';
    return cents > 0 ? 'text-emerald-400' : 'text-rose-500';
  };

  if (isLoading || !summary) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 shadow-lg flex items-center space-x-4 animate-pulse">
            <div className="w-12 h-12 rounded-xl bg-slate-850 shrink-0"></div>
            <div className="space-y-2 flex-grow">
              <div className="h-3 w-16 bg-slate-850 rounded"></div>
              <div className="h-6 w-24 bg-slate-850 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  const { totalNetBalance, totalOwedToYou, totalYouOwe, groups } = summary;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Net Balance */}
      <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-2xl p-5 shadow-lg flex items-center space-x-4 animate-fade-in">
        <div className="w-12 h-12 rounded-xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
          <Landmark className="w-6 h-6" />
        </div>
        <div className="min-w-0">
          <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Net Balance</p>
          <p className={`text-xl font-bold mt-1 truncate ${getNetColor(totalNetBalance)}`}>
            {formatCurrency(totalNetBalance)}
          </p>
        </div>
      </div>

      {/* Owed to you */}
      <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-2xl p-5 shadow-lg flex items-center space-x-4">
        <div className="w-12 h-12 rounded-xl bg-emerald-600/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
          <Shield className="w-6 h-6" />
        </div>
        <div className="min-w-0">
          <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Owed To You</p>
          <p className="text-xl font-bold mt-1 text-emerald-400 truncate">
            {formatCurrency(totalOwedToYou)}
          </p>
        </div>
      </div>

      {/* You owe */}
      <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-2xl p-5 shadow-lg flex items-center space-x-4">
        <div className="w-12 h-12 rounded-xl bg-rose-600/10 border border-rose-500/20 flex items-center justify-center text-rose-500 shrink-0">
          <Shield className="w-6 h-6 text-rose-500" />
        </div>
        <div className="min-w-0">
          <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">You Owe</p>
          <p className="text-xl font-bold mt-1 text-rose-500 truncate">
            {formatCurrency(totalYouOwe)}
          </p>
        </div>
      </div>

      {/* Active Groups */}
      <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-2xl p-5 shadow-lg flex items-center space-x-4">
        <div className="w-12 h-12 rounded-xl bg-violet-600/10 border border-violet-500/20 flex items-center justify-center text-violet-400 shrink-0">
          <Users className="w-6 h-6" />
        </div>
        <div className="min-w-0">
          <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Active Groups</p>
          <p className="text-xl font-bold mt-1 text-violet-400 truncate">{groups}</p>
        </div>
      </div>
    </div>
  );
}
