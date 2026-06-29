import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useGroupStore } from '../store/groupStore';
import { ArrowLeft, UserPlus, CheckCircle2 } from 'lucide-react';
import ErrorAlert from '../components/ui/ErrorAlert';

export default function JoinGroupPage() {
  const joinGroup = useGroupStore(state => state.joinGroup);
  const [inviteCode, setInviteCode] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [joinError, setJoinError] = useState(null);
  const [successGroup, setSuccessGroup] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setJoinError(null);
    setSuccessGroup(null);

    const trimmedCode = inviteCode.trim();
    if (!trimmedCode) {
      setJoinError('Invite code is required');
      return;
    }

    setIsJoining(true);
    try {
      const response = await joinGroup(trimmedCode);
      setSuccessGroup(response.groupId);
      setInviteCode('');
      setTimeout(() => {
        navigate(`/groups/${response.groupId}`);
      }, 2000);
    } catch (err) {
      setJoinError(err.response?.data?.message || 'Failed to join group. Please check your invite code.');
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-8 font-sans">
      {/* Navigation & Header */}
      <div className="space-y-4">
        <Link to="/groups" className="flex items-center space-x-2 text-slate-400 hover:text-white text-sm transition duration-150 cursor-pointer">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Groups</span>
        </Link>
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white mb-2">Join Group</h1>
          <p className="text-slate-400 text-sm">Enter an invitation code to join an existing group.</p>
        </div>
      </div>

      {/* Card */}
      <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-2xl p-6 md:p-8 shadow-2xl space-y-6">
        {joinError && <ErrorAlert message={joinError} />}

        {successGroup && (
          <div className="p-4 bg-emerald-950/20 border border-emerald-900/50 rounded-xl text-emerald-400 text-sm flex items-center space-x-3">
            <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-500" />
            <span>Successfully joined group! Redirecting to group details...</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Invitation Code</label>
            <input
              type="text"
              required
              disabled={isJoining || !!successGroup}
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
              placeholder="e.g. INV-A1B2C3D4"
              className="w-full px-4 py-3 bg-slate-950/50 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-650 text-sm font-mono tracking-wider focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition duration-200 uppercase"
            />
          </div>

          <button
            type="submit"
            disabled={isJoining || !!successGroup}
            className="w-full flex items-center justify-center space-x-2 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition duration-200 cursor-pointer shadow-md shadow-indigo-600/10"
          >
            {isJoining ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                <span>Join Group</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
