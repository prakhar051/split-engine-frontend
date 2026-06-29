import { AlertCircle, CheckCircle2 } from 'lucide-react';

export default function PercentageSplitForm({
  members,
  selectedParticipants,
  onToggleParticipant,
  splits,
  onUpdateSplit,
  totalAmount = 0
}) {
  const targetVal = parseFloat(totalAmount) || 0;
  
  // Calculate total percentage entered
  const pctSum = selectedParticipants.reduce((sum, id) => {
    const val = parseFloat(splits[id]) || 0;
    return sum + val;
  }, 0);

  const diff = 100 - pctSum;
  const isMatched = Math.abs(diff) < 0.01;

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  };

  return (
    <div className="space-y-4">
      {/* Live validation summary */}
      <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {isMatched ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          ) : (
            <AlertCircle className="w-4 h-4 text-amber-500" />
          )}
          <span className="text-xs font-semibold text-slate-300">
            Total Percent: <span className="font-bold text-white">{pctSum.toFixed(1)}%</span> / Target: <span className="font-bold text-white">100%</span>
          </span>
        </div>
        <div>
          {isMatched ? (
            <span className="text-xs font-semibold text-emerald-400 bg-emerald-950/20 border border-emerald-900/50 px-2 py-0.5 rounded-full">Valid</span>
          ) : (
            <span className="text-xs font-semibold text-amber-400 bg-amber-950/20 border border-amber-900/50 px-2 py-0.5 rounded-full">
              {diff > 0 ? `Remaining ${diff.toFixed(1)}%` : `Over by ${Math.abs(diff).toFixed(1)}%`}
            </span>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Participant Percentages</span>
        <div className="space-y-2">
          {members.map((member) => {
            const isSelected = selectedParticipants.includes(member.user.id);
            const value = splits[member.user.id] || '';
            const shareVal = isSelected ? ((parseFloat(value) || 0) / 100) * targetVal : 0;

            return (
              <div
                key={member.user.id}
                className={`flex items-center justify-between p-3 rounded-xl border transition ${
                  isSelected 
                    ? 'bg-slate-900/30 border-slate-800 text-slate-200' 
                    : 'bg-slate-900/10 border-slate-900/50 opacity-50 text-slate-500'
                }`}
              >
                <div className="flex items-center space-x-3 min-w-0 flex-1">
                  <button
                    type="button"
                    onClick={() => {
                      onToggleParticipant(member.user.id);
                      if (isSelected) {
                        onUpdateSplit(member.user.id, '');
                      }
                    }}
                    className="w-4 h-4 rounded border flex items-center justify-center cursor-pointer hover:border-slate-550 shrink-0 bg-slate-950 border-slate-850"
                  >
                    {isSelected && <div className="w-2.5 h-2.5 bg-indigo-500 rounded-sm"></div>}
                  </button>

                  {member.user.avatarUrl ? (
                    <img src={member.user.avatarUrl} alt={member.user.name} className="w-8 h-8 rounded-full object-cover border border-slate-800" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-400">
                      {getInitials(member.user.name)}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-sm font-semibold truncate">{member.user.name}</p>
                    {isSelected && (
                      <p className="text-[10px] text-indigo-400 font-medium">Calculated: ${shareVal.toFixed(2)}</p>
                    )}
                  </div>
                </div>

                {isSelected && (
                  <div className="flex items-center space-x-2 shrink-0">
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="100"
                      value={value}
                      placeholder="0"
                      onChange={(e) => onUpdateSplit(member.user.id, e.target.value)}
                      className="w-20 px-3 py-1.5 bg-slate-950/60 border border-slate-800 rounded-lg text-right text-slate-200 focus:outline-none focus:border-indigo-500 text-sm"
                    />
                    <span className="text-slate-500 text-sm">%</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
