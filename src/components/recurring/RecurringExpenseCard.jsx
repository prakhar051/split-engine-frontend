import { Link } from 'react-router-dom';
import { Calendar, DollarSign, Edit2, Trash2, Tag, RefreshCw, AlertCircle } from 'lucide-react';
import ToggleRecurringSwitch from './ToggleRecurringSwitch';
import RunNowButton from './RunNowButton';

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

export default function RecurringExpenseCard({
  template,
  groupId,
  onToggle,
  onRun,
  onDelete,
  isToggling,
  isRunning
}) {
  const amountDollars = (template.amount / 100).toFixed(2);
  const colorClass = CATEGORY_COLORS[template.category] || CATEGORY_COLORS.GENERAL;
  const label = CATEGORY_LABELS[template.category] || template.category;

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

  const getRecurrenceLabel = (type, interval) => {
    const suffix = interval > 1 ? 's' : '';
    switch (type) {
      case 'DAILY': return `Every ${interval > 1 ? `${interval} ` : ''}Day${suffix}`;
      case 'WEEKLY': return `Every ${interval > 1 ? `${interval} ` : ''}Week${suffix}`;
      case 'MONTHLY': return `Every ${interval > 1 ? `${interval} ` : ''}Month${suffix}`;
      case 'YEARLY': return `Every ${interval > 1 ? `${interval} ` : ''}Year${suffix}`;
      default: return `${type} (x${interval})`;
    }
  };

  const formatUTC = (dateStr) => {
    if (!dateStr) return 'N/A';
    const d = new Date(dateStr);
    return d.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      timeZone: 'UTC'
    }) + ' (UTC)';
  };

  const calculateDaysRemaining = (nextRunStr) => {
    if (!nextRunStr) return 0;
    const next = new Date(nextRunStr);
    const now = new Date();
    const diff = next.getTime() - now.getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  const daysLeft = calculateDaysRemaining(template.nextRunAt);

  return (
    <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 hover:border-slate-700/80 rounded-2xl p-6 shadow-md transition duration-200 flex flex-col justify-between space-y-5">
      <div className="space-y-3">
        {/* Header - Title, Active status dot, Category Badge */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full shrink-0 ${template.isActive ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
              <h3 className="text-base font-bold text-white leading-snug truncate">
                {template.title}
              </h3>
            </div>
            <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider block mt-0.5 ml-4">
              {getSplitLabel(template.splitType)} • {getRecurrenceLabel(template.recurrenceType, template.interval)}
            </span>
          </div>
          <span className={`flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase border shrink-0 ${colorClass}`}>
            <Tag className="w-2.5 h-2.5" />
            <span>{label}</span>
          </span>
        </div>

        {/* Cost Summary */}
        <div className="flex items-baseline space-x-1 py-1">
          <DollarSign className="w-5 h-5 text-indigo-400 self-center" />
          <span className="text-2xl font-black text-white">{amountDollars}</span>
          <span className="text-xs text-slate-500 font-medium ml-1">per execution</span>
        </div>

        {/* Description if present */}
        {template.description && (
          <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed bg-slate-950/20 p-2.5 border border-slate-800/40 rounded-lg">
            {template.description}
          </p>
        )}
      </div>

      {/* Schedule Meta Details */}
      <div className="bg-slate-950/40 border border-slate-800/60 rounded-xl p-3 text-[11px] space-y-2">
        <div className="flex justify-between items-center text-slate-400">
          <span className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-indigo-400" />
            <span>Next Run:</span>
          </span>
          <span className="font-semibold text-slate-200">{formatUTC(template.nextRunAt)}</span>
        </div>

        {template.isActive && (
          <div className="flex justify-between items-center">
            <span className="text-slate-500">Timeline position:</span>
            <span className={`px-2 py-0.5 rounded-md font-bold text-[9px] uppercase tracking-wider ${daysLeft <= 1 ? 'bg-indigo-650/20 text-indigo-400 border border-indigo-500/20' : 'bg-slate-800 text-slate-400'}`}>
              {daysLeft === 0 ? 'Today' : daysLeft === 1 ? 'Tomorrow' : `${daysLeft} days remaining`}
            </span>
          </div>
        )}
      </div>

      {/* Action Buttons Row */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-850 gap-4">
        {/* Toggle Switch */}
        <div className="flex items-center space-x-2">
          <ToggleRecurringSwitch
            isActive={template.isActive}
            onToggle={(active) => onToggle(template.id, active)}
            isLoading={isToggling}
          />
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">
            {template.isActive ? 'Active' : 'Paused'}
          </span>
        </div>

        {/* Action icons / run now */}
        <div className="flex items-center gap-2">
          <RunNowButton
            onRun={(advance) => onRun(template.id, advance)}
            isLoading={isRunning}
          />

          <Link
            to={`/groups/${groupId}/recurring/${template.id}/edit`}
            className="p-2 bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white rounded-xl border border-slate-750/30 transition cursor-pointer"
            title="Edit Schedule"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </Link>

          <button
            onClick={() => onDelete(template)}
            className="p-2 bg-red-650/10 border border-red-500/20 hover:bg-red-650/20 text-red-400 hover:text-red-350 rounded-xl transition cursor-pointer"
            title="Delete Schedule"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
