import { useAuthStore } from '../../store/authStore';
import { DollarSign, ArrowUpRight, ArrowDownLeft, Scale } from 'lucide-react';

export default function BalanceSummary({ balances = [] }) {
  const currentUserId = useAuthStore((state) => state.user?.id);
  
  // Find current user's balance record
  const myRecord = balances.find((b) => b.user.id === currentUserId);
  const netBalanceCents = myRecord ? myRecord.netBalance : 0;
  
  const netBalance = (netBalanceCents / 100).toFixed(2);
  const totalReceivable = netBalanceCents > 0 ? (netBalanceCents / 100).toFixed(2) : '0.00';
  const totalOwed = netBalanceCents < 0 ? (Math.abs(netBalanceCents) / 100).toFixed(2) : '0.00';

  const isPositive = netBalanceCents > 0;
  const isZero = netBalanceCents === 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
      {/* Net Balance Card */}
      <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-2xl p-6 shadow-md space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Net Balance</span>
          <div className={`p-2 rounded-xl border ${
            isZero 
              ? 'bg-slate-800/10 border-slate-700 text-slate-400' 
              : isPositive 
                ? 'bg-emerald-600/10 border-emerald-500/25 text-emerald-400' 
                : 'bg-rose-600/10 border-rose-500/25 text-rose-400'
          }`}>
            <Scale className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline space-x-1">
          <DollarSign className="w-5 h-5 text-slate-500 self-center" />
          <span className={`text-3xl font-black ${
            isZero ? 'text-slate-300' : isPositive ? 'text-emerald-400' : 'text-rose-400'
          }`}>
            {isZero ? '' : isPositive ? '+' : '-'}${Math.abs(netBalance).toFixed(2)}
          </span>
        </div>
        <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
          {isZero ? 'You are all settled up' : isPositive ? 'You are owed in this group' : 'You owe money in this group'}
        </p>
      </div>

      {/* Total Receivable Card */}
      <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-2xl p-6 shadow-md space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Receivable</span>
          <div className="p-2 rounded-xl bg-emerald-600/10 border border-emerald-500/25 text-emerald-400">
            <ArrowUpRight className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline space-x-1">
          <DollarSign className="w-5 h-5 text-slate-500 self-center" />
          <span className="text-3xl font-black text-slate-200">
            {totalReceivable}
          </span>
        </div>
        <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
          Owed to you by others
        </p>
      </div>

      {/* Total Owed Card */}
      <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-2xl p-6 shadow-md space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Owed</span>
          <div className="p-2 rounded-xl bg-rose-600/10 border border-rose-500/25 text-rose-400">
            <ArrowDownLeft className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline space-x-1">
          <DollarSign className="w-5 h-5 text-slate-500 self-center" />
          <span className="text-3xl font-black text-slate-200">
            {totalOwed}
          </span>
        </div>
        <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
          You owe to others
        </p>
      </div>
    </div>
  );
}
