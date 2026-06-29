import React from 'react';
import { Users, Shield, Radio, Mail, ShieldAlert, Receipt, RefreshCw } from 'lucide-react';

const GroupStatisticsCard = ({
  totalMembers = 0,
  adminCount = 0,
  onlineCount = 0,
  pendingInvites = 0,
  bannedCount = 0,
  totalExpenses = 0,
  activeTemplates = 0
}) => {
  const statsList = [
    {
      label: 'Total Members',
      value: totalMembers,
      icon: <Users className="w-5 h-5 text-indigo-400" />,
      bg: 'bg-indigo-500/10 border-indigo-500/20'
    },
    {
      label: 'Admins & Owner',
      value: adminCount,
      icon: <Shield className="w-5 h-5 text-emerald-400" />,
      bg: 'bg-emerald-500/10 border-emerald-500/20'
    },
    {
      label: 'Online Members',
      value: onlineCount,
      icon: <Radio className="w-5 h-5 text-sky-400 animate-pulse" />,
      bg: 'bg-sky-500/10 border-sky-500/20'
    },
    {
      label: 'Pending Invites',
      value: pendingInvites,
      icon: <Mail className="w-5 h-5 text-amber-400" />,
      bg: 'bg-amber-500/10 border-amber-500/20'
    },
    {
      label: 'Banned Members',
      value: bannedCount,
      icon: <ShieldAlert className="w-5 h-5 text-rose-400" />,
      bg: 'bg-rose-500/10 border-rose-500/20'
    },
    {
      label: 'Total Expenses',
      value: totalExpenses,
      icon: <Receipt className="w-5 h-5 text-teal-400" />,
      bg: 'bg-teal-500/10 border-teal-500/20'
    },
    {
      label: 'Active Templates',
      value: activeTemplates,
      icon: <RefreshCw className="w-5 h-5 text-purple-400" />,
      bg: 'bg-purple-500/10 border-purple-500/20'
    }
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {statsList.map((stat, idx) => (
        <div
          key={idx}
          className={`flex items-center space-x-3 p-4 rounded-2xl border backdrop-blur-md ${stat.bg} transition-all duration-300 hover:scale-[1.02]`}
        >
          <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
            {stat.icon}
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">{stat.label}</p>
            <p className="text-xl font-bold text-slate-100 mt-0.5">{stat.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default GroupStatisticsCard;
