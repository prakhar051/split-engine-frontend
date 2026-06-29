import { Link } from 'react-router-dom';
import { ArrowRight, Image, Calendar, CheckCircle } from 'lucide-react';
import SettlementStatusBadge from './SettlementStatusBadge';

export default function SettlementCard({ settlement, groupId }) {
  const amountDollars = (settlement.amount / 100).toFixed(2);
  const payerName = settlement.payer?.name || 'Unknown';
  const payeeName = settlement.payee?.name || 'Unknown';

  const formattedDate = new Date(settlement.createdAt || Date.now()).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  return (
    <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 hover:border-slate-700/80 rounded-2xl p-5 shadow-md transition duration-200 flex flex-col justify-between space-y-4">
      <div className="space-y-3">
        {/* Header: Status & Proof indicators */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <SettlementStatusBadge status={settlement.status} />
          {settlement.proofUrl ? (
            <span className="flex items-center space-x-1 text-[10px] font-bold text-indigo-400 bg-indigo-950/20 border border-indigo-900/50 px-2 py-0.5 rounded-full uppercase tracking-wider">
              <Image className="w-3 h-3" />
              <span>Proof Uploaded</span>
            </span>
          ) : (
            <span className="text-[10px] font-semibold text-slate-500 italic">No receipt proof</span>
          )}
        </div>

        {/* Transfer flow description */}
        <div className="space-y-1">
          <div className="text-sm font-semibold text-slate-200">
            <span className="text-slate-400 font-normal">From:</span> {payerName}
          </div>
          <div className="text-sm font-semibold text-slate-200">
            <span className="text-slate-400 font-normal">To:</span> {payeeName}
          </div>
        </div>

        {/* Amount display */}
        <div className="flex items-baseline space-x-0.5 py-1">
          <span className="text-2xl font-black text-white">${amountDollars}</span>
          <span className="text-xs text-slate-500 font-semibold ml-1">transfer</span>
        </div>
      </div>

      {/* Date & Action */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-800 text-slate-500 text-[10px]">
        <span className="flex items-center space-x-1.5">
          <Calendar className="w-3.5 h-3.5" />
          <span>{formattedDate}</span>
        </span>

        <Link
          to={`/groups/${groupId}/settlements/${settlement.id}`}
          className="flex items-center space-x-1 py-1.5 px-3 bg-slate-850 hover:bg-slate-750 text-slate-200 hover:text-white rounded-xl transition duration-150 border border-slate-750/30 cursor-pointer font-bold"
        >
          <span>Settle Up</span>
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
}
