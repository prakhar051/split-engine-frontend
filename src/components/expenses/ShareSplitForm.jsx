export default function ShareSplitForm({
  members,
  selectedParticipants,
  onToggleParticipant,
  splits,
  onUpdateSplit,
  totalAmount = 0
}) {
  const targetVal = parseFloat(totalAmount) || 0;
  
  // Calculate total shares entered
  const totalShares = selectedParticipants.reduce((sum, id) => {
    const val = parseInt(splits[id], 10) || 0;
    return sum + val;
  }, 0);

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  };

  return (
    <div className="space-y-4">
      {/* Live validation summary */}
      <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-300">
          Total Share Count: <span className="font-bold text-white">{totalShares}</span>
        </span>
        <span className="text-xs font-semibold text-indigo-400 bg-indigo-950/20 border border-indigo-900/50 px-2.5 py-0.5 rounded-full">
          Ratios Splitting
        </span>
      </div>

      <div className="space-y-2">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Participant Share Multipliers</span>
        <div className="space-y-2">
          {members.map((member) => {
            const isSelected = selectedParticipants.includes(member.user.id);
            const value = splits[member.user.id] || '';
            const shareVal = isSelected && totalShares > 0
              ? ((parseInt(value, 10) || 0) / totalShares) * targetVal
              : 0;

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
                      step="1"
                      min="1"
                      value={value}
                      placeholder="1"
                      onChange={(e) => onUpdateSplit(member.user.id, e.target.value)}
                      className="w-20 px-3 py-1.5 bg-slate-950/60 border border-slate-800 rounded-lg text-right text-slate-200 focus:outline-none focus:border-indigo-500 text-sm"
                    />
                    <span className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">shares</span>
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
