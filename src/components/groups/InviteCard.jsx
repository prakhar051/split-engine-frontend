import { useState, useEffect } from 'react';
import { Copy, ShieldAlert, Check } from 'lucide-react';

export default function InviteCard({ invite, onRevoke, isOwner }) {
  const [copied, setCopied] = useState(false);
  const [countdown, setCountdown] = useState('');

  const handleCopy = () => {
    navigator.clipboard.writeText(invite.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'ACTIVE': return 'bg-emerald-600/10 border-emerald-500/25 text-emerald-400';
      case 'USED': return 'bg-blue-600/10 border-blue-500/25 text-blue-400';
      case 'REVOKED': return 'bg-rose-600/10 border-rose-500/25 text-rose-500';
      case 'EXPIRED': return 'bg-slate-800 border-slate-700 text-slate-400';
      default: return 'bg-slate-800 border-slate-700 text-slate-400';
    }
  };

  useEffect(() => {
    const updateCountdown = () => {
      if (invite.status !== 'ACTIVE') {
        setCountdown('');
        return;
      }

      const expiry = new Date(invite.expiresAt).getTime();
      const now = Date.now();
      const diff = expiry - now;

      if (diff <= 0) {
        setCountdown('Expired');
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      if (days > 0) {
        setCountdown(`${days}d ${hours}h remaining`);
      } else if (hours > 0) {
        setCountdown(`${hours}h remaining`);
      } else {
        setCountdown(`${minutes}m remaining`);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [invite.expiresAt, invite.status]);

  return (
    <div className="bg-slate-950/20 border border-slate-800/80 rounded-xl p-5 flex flex-col space-y-4">
      {/* Top Row: Code and Status */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center space-x-2.5">
          <span className="text-sm font-mono font-black text-slate-100 tracking-wider bg-slate-900 border border-slate-800 px-3 py-1 rounded-lg">
            {invite.code}
          </span>
          <button
            onClick={handleCopy}
            className="flex items-center space-x-1.5 py-1 px-2.5 bg-slate-850 hover:bg-slate-800 text-[10px] font-bold rounded-lg border border-slate-700/50 hover:border-slate-600 transition duration-150 cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied ✓</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-400" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>

        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase border ${getStatusColor(invite.status)}`}>
          {invite.status}
        </span>
      </div>

      {/* Info Row: Target Email and Expiration */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs gap-2 pt-2 border-t border-slate-900/60">
        <div className="min-w-0">
          <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Recipient</p>
          <p className="text-slate-350 mt-0.5 truncate">{invite.email || 'Anyone (General Invite)'}</p>
        </div>

        <div className="text-left sm:text-right shrink-0">
          <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Expires</p>
          <p className={`mt-0.5 font-medium ${invite.status === 'ACTIVE' && countdown.includes('remaining') ? 'text-indigo-400' : 'text-slate-400'}`}>
            {invite.status === 'ACTIVE' ? countdown : new Date(invite.expiresAt).toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Owner controls: Revoke invite */}
      {isOwner && invite.status === 'ACTIVE' && (
        <div className="pt-2">
          <button
            onClick={onRevoke}
            className="w-full flex items-center justify-center space-x-2 py-2 px-4 bg-rose-950/20 hover:bg-rose-900/20 text-rose-500 hover:text-rose-400 font-medium text-xs rounded-xl border border-rose-900/30 hover:border-rose-800/40 transition duration-200 cursor-pointer"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
            <span>Revoke Invitation</span>
          </button>
        </div>
      )}
    </div>
  );
}
