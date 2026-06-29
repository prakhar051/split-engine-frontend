import { Check } from 'lucide-react';

export default function EqualSplitForm({ members, selectedParticipants, onToggleParticipant, totalAmount = 0 }) {
  const amountNum = parseFloat(totalAmount) || 0;
  const participantCount = selectedParticipants.length;
  const splitAmount = participantCount > 0 ? (amountNum / participantCount).toFixed(2) : '0.00';

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center pb-2 border-b border-slate-800">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Select Split Participants</span>
        {participantCount > 0 && (
          <span className="text-xs font-semibold bg-indigo-950/80 text-indigo-400 border border-indigo-900/50 px-2.5 py-1 rounded-full">
            Share: ${splitAmount} each
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {members.map((member) => {
          const isSelected = selectedParticipants.includes(member.user.id);
          return (
            <button
              key={member.user.id}
              type="button"
              onClick={() => onToggleParticipant(member.user.id)}
              className={`flex items-center justify-between p-3 rounded-xl border text-left transition duration-200 cursor-pointer ${
                isSelected
                  ? 'bg-indigo-600/10 border-indigo-500/30 text-indigo-200'
                  : 'bg-slate-900/30 border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-300'
              }`}
            >
              <div className="flex items-center space-x-3">
                {member.user.avatarUrl ? (
                  <img src={member.user.avatarUrl} alt={member.user.name} className="w-8 h-8 rounded-full object-cover border border-slate-750" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-300">
                    {getInitials(member.user.name)}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate">{member.user.name}</p>
                  <p className="text-[10px] text-slate-500 truncate">{member.user.email}</p>
                </div>
              </div>
              <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition duration-150 ${
                isSelected ? 'bg-indigo-600 border-indigo-500 text-white' : 'border-slate-800'
              }`}>
                {isSelected && <Check className="w-3.5 h-3.5" />}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
