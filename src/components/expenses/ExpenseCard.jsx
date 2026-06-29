import { Link } from 'react-router-dom';
import { Calendar, DollarSign, ArrowRight, Tag } from 'lucide-react';
import CurrencyBadge from '../currency/CurrencyBadge';

const CATEGORY_COLORS = {
  GENERAL: 'bg-slate-600/10 border-slate-500/25 text-slate-400',
  FOOD: 'bg-emerald-600/10 border-emerald-500/25 text-emerald-400',
  TRAVEL: 'bg-sky-600/10 border-sky-500/25 text-sky-400',
  RENT: 'bg-amber-600/10 border-amber-500/25 text-amber-400',
  UTILITIES: 'bg-indigo-600/10 border-indigo-500/25 text-indigo-400',
  SHOPPING: 'bg-rose-600/10 border-rose-500/25 text-rose-400',
  ENTERTAINMENT: 'bg-violet-600/10 border-violet-500/25 text-violet-400'
};

const CATEGORY_LABELS = {
  GENERAL: 'General',
  FOOD: 'Food',
  TRAVEL: 'Travel',
  RENT: 'Rent',
  UTILITIES: 'Utilities',
  SHOPPING: 'Shopping',
  ENTERTAINMENT: 'Entertainment'
};

export default function ExpenseCard({ expense, groupId }) {
  const formattedDate = new Date(expense.createdAt).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  const amountDollars = (expense.amount / 100).toFixed(2);
  const colorClass = CATEGORY_COLORS[expense.category] || CATEGORY_COLORS.GENERAL;
  const label = CATEGORY_LABELS[expense.category] || expense.category;

  const getSplitLabel = (type) => {
    switch (type) {
      case 'EQUAL': return 'Split Equally';
      case 'EXACT': return 'Exact Split';
      case 'PERCENTAGE': return 'Percentage Split';
      case 'SHARE': return 'Share Ratio';
      case 'MULTI_PAYER': return 'Multiple Payers';
      default: return type;
    }
  };

  return (
    <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 hover:border-slate-700/80 rounded-2xl p-6 shadow-md transition duration-200 flex flex-col justify-between space-y-5">
      <div className="space-y-3">
        {/* Title, Category Badge */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-base font-bold text-white leading-snug truncate">
              {expense.title || expense.description}
            </h3>
            <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider block mt-0.5">
              {getSplitLabel(expense.splitType)}
            </span>
          </div>
          <span className={`flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase border shrink-0 ${colorClass}`}>
            <Tag className="w-2.5 h-2.5" />
            <span>{label}</span>
          </span>
        </div>

        {/* Cost summary */}
        <div className="flex items-baseline space-x-1 py-1">
          <DollarSign className="w-5 h-5 text-indigo-400 self-center" />
          <span className="text-2xl font-black text-white">{amountDollars}</span>
          <CurrencyBadge currency={expense.originalCurrency || 'INR'} className="ml-1.5" />
        </div>
      </div>

      {/* Footer Info Row */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-805 text-[11px] text-slate-500">
        <span className="flex items-center space-x-1.5">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <span>{formattedDate}</span>
        </span>
        
        {expense.attachments && expense.attachments.length > 0 && (
          <span className="bg-slate-800 text-slate-350 px-2 py-0.5 rounded-md text-[10px] font-semibold border border-slate-700/40">
            {expense.attachments.length} {expense.attachments.length === 1 ? 'receipt' : 'receipts'}
          </span>
        )}
      </div>

      {/* Action Details Link */}
      <Link
        to={`/groups/${groupId}/expenses/${expense.id}`}
        className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 bg-slate-850 hover:bg-slate-750 text-slate-200 hover:text-white text-xs font-bold rounded-xl transition duration-150 border border-slate-750/30 cursor-pointer"
      >
        <span>View Details</span>
        <ArrowRight className="w-3.5 h-3.5" />
      </Link>
    </div>
  );
}
