import { Info, CheckCircle2, AlertOctagon } from 'lucide-react';

const STATUS_CONFIGS = {
  PENDING: {
    label: 'Pending Approval',
    colorClass: 'bg-blue-600/10 border-blue-500/25 text-blue-400',
    icon: Info
  },
  PAID: {
    label: 'Paid & Settled',
    colorClass: 'bg-emerald-600/10 border-emerald-500/25 text-emerald-400',
    icon: CheckCircle2
  },
  DISPUTED: {
    label: 'Disputed Payment',
    colorClass: 'bg-rose-600/10 border-rose-500/25 text-rose-400',
    icon: AlertOctagon
  }
};

export default function SettlementStatusBadge({ status }) {
  const config = STATUS_CONFIGS[status] || STATUS_CONFIGS.PENDING;
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wide border uppercase shrink-0 ${config.colorClass}`}>
      <Icon className="w-3.5 h-3.5" />
      <span>{config.label}</span>
    </span>
  );
}
