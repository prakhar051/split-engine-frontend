import { useState } from 'react';
import SettlementList from './SettlementList';
import { Info, CheckCircle, AlertTriangle } from 'lucide-react';

export default function SettlementHistory({ settlements = [], groupId }) {
  const [activeSection, setActiveSection] = useState('PENDING');

  const pendingList = settlements.filter((s) => s.status === 'PENDING');
  const paidList = settlements.filter((s) => s.status === 'PAID');
  const disputedList = settlements.filter((s) => s.status === 'DISPUTED');

  const sections = [
    { key: 'PENDING', label: `Pending (${pendingList.length})`, count: pendingList.length, color: 'text-blue-400 border-blue-500', icon: Info },
    { key: 'PAID', label: `Paid (${paidList.length})`, count: paidList.length, color: 'text-emerald-400 border-emerald-500', icon: CheckCircle },
    { key: 'DISPUTED', label: `Disputed (${disputedList.length})`, count: disputedList.length, color: 'text-rose-400 border-rose-500', icon: AlertTriangle }
  ];

  const getFilteredList = () => {
    switch (activeSection) {
      case 'PENDING': return pendingList;
      case 'PAID': return paidList;
      case 'DISPUTED': return disputedList;
      default: return pendingList;
    }
  };

  return (
    <div className="space-y-6">
      {/* Sections Selector Tabs */}
      <div className="flex border-b border-slate-800 scrollbar-none overflow-x-auto">
        {sections.map((sec) => {
          const Icon = sec.icon;
          const isActive = activeSection === sec.key;
          return (
            <button
              key={sec.key}
              onClick={() => setActiveSection(sec.key)}
              className={`flex items-center space-x-2 px-6 py-3 border-b-2 text-sm font-semibold transition duration-150 cursor-pointer shrink-0 ${
                isActive
                  ? `${sec.color} font-bold bg-slate-900/10`
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{sec.label}</span>
            </button>
          );
        })}
      </div>

      {/* Renders Selected Feeds */}
      <SettlementList settlements={getFilteredList()} groupId={groupId} />
    </div>
  );
}
