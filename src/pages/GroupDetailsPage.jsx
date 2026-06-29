import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useGroupStore } from '../store/groupStore';
import { useAuthStore } from '../store/authStore';
import { useSocketStore } from '../store/socketStore';
import MemberList from '../components/groups/MemberList';
import InviteList from '../components/groups/InviteList';
import ErrorAlert from '../components/ui/ErrorAlert';
import ExportDropdown from '../components/ui/ExportDropdown';
import { Users, Mail, Plus, ArrowLeft } from 'lucide-react';

export default function GroupDetailsPage() {
  const { groupId } = useParams();
  const currentUserId = useAuthStore(state => state.user?.id);
  const {
    currentGroup,
    invites,
    getGroupDetails,
    getInvites,
    createInvite,
    revokeInvite,
    isLoading,
    error
  } = useGroupStore();

  const [activeTab, setActiveTab] = useState('members');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteExpiry, setInviteExpiry] = useState('24');
  const [inviteError, setInviteError] = useState(null);
  const [inviteSuccess, setInviteSuccess] = useState(false);
  const [isSubmittingInvite, setIsSubmittingInvite] = useState(false);

  const isOwner = currentGroup?.createdById === currentUserId;

  useEffect(() => {
    const joinGroupSocket = useSocketStore.getState().joinGroup;
    const leaveGroupSocket = useSocketStore.getState().leaveGroup;
    joinGroupSocket(groupId);

    const prefetch = async () => {
      try {
        const group = await getGroupDetails(groupId);
        if (group.createdById === currentUserId) {
          await getInvites(groupId);
        }
      } catch (err) {
        console.error('Failed to prefetch group details:', err);
      }
    };

    prefetch();

    return () => {
      leaveGroupSocket(groupId);
    };
  }, [groupId, getGroupDetails, getInvites, currentUserId]);

  const handleCreateInvite = async (e) => {
    e.preventDefault();
    setInviteError(null);
    setInviteSuccess(false);
    setIsSubmittingInvite(true);

    try {
      await createInvite(groupId, inviteEmail, inviteExpiry);
      setInviteEmail('');
      setInviteSuccess(true);
      setTimeout(() => setInviteSuccess(false), 3000);
    } catch (err) {
      setInviteError(err.response?.data?.message || 'Failed to generate invitation');
    } finally {
      setIsSubmittingInvite(false);
    }
  };

  const handleRevokeInvite = async (inviteId) => {
    try {
      await revokeInvite(groupId, inviteId);
    } catch (err) {
      console.error('Failed to revoke invite:', err);
    }
  };

  if (isLoading && !currentGroup) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!currentGroup && error) {
    return (
      <div className="space-y-6">
        <Link to="/groups" className="flex items-center space-x-2 text-slate-400 hover:text-white text-sm transition">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Groups</span>
        </Link>
        <ErrorAlert message={error} />
      </div>
    );
  }

  if (!currentGroup) return null;

  return (
    <div className="space-y-8 font-sans">
      {/* Navigation & Header */}
      <div className="space-y-4">
        <Link to="/groups" className="flex items-center space-x-2 text-slate-400 hover:text-white text-sm transition duration-150 cursor-pointer">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Groups</span>
        </Link>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-2">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-white mb-2">{currentGroup.name}</h1>
            <p className="text-slate-400 text-sm">{currentGroup.description || 'No description provided.'}</p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0 self-start md:self-auto w-full sm:w-auto">
            <Link
              to={`/groups/${groupId}/expenses`}
              className="flex items-center justify-center space-x-2 py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-bold rounded-xl transition duration-150 border border-slate-700/40 cursor-pointer w-full sm:w-auto text-center"
            >
              <span>View Expenses</span>
            </Link>
            <Link
              to={`/groups/${groupId}/recurring`}
              className="flex items-center justify-center space-x-2 py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-bold rounded-xl transition duration-150 border border-slate-700/40 cursor-pointer w-full sm:w-auto text-center"
            >
              <span>Recurring Schedules</span>
            </Link>
            <Link
              to={`/groups/${groupId}/activity`}
              className="flex items-center justify-center space-x-2 py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-bold rounded-xl transition duration-150 border border-slate-700/40 cursor-pointer w-full sm:w-auto text-center"
            >
              <span>Activity Feed</span>
            </Link>
            <Link
              to={`/groups/${groupId}/settlements`}
              className="flex items-center justify-center space-x-2 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition duration-150 shadow-md shadow-indigo-500/10 cursor-pointer w-full sm:w-auto text-center"
            >
              <span>Settlement Center</span>
            </Link>
            {currentGroup && currentUserId && (() => {
              const myMember = currentGroup.members?.find(m => m.userId === currentUserId);
              const isGroupAdminOrOwner = myMember && (myMember.role === 'ADMIN' || myMember.role === 'OWNER');
              return isGroupAdminOrOwner && (
                <Link
                  to={`/groups/${groupId}/admin`}
                  className="flex items-center justify-center space-x-2 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition duration-150 shadow-md shadow-emerald-500/10 cursor-pointer w-full sm:w-auto text-center"
                >
                  <span>Admin Dashboard</span>
                </Link>
              );
            })()}
            <ExportDropdown groupId={groupId} />

            <div className="text-xs text-slate-500 bg-slate-900 border border-slate-800 p-3 rounded-xl shrink-0 text-center sm:text-left">
              <span className="font-semibold text-slate-400">Created:</span>{' '}
              {new Date(currentGroup.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Selector */}
      <div className="flex border-b border-slate-800">
        <button
          onClick={() => setActiveTab('members')}
          className={`flex items-center space-x-2 px-6 py-3 border-b-2 text-sm font-semibold transition duration-155 cursor-pointer ${
            activeTab === 'members'
              ? 'border-indigo-500 text-indigo-400 font-bold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Members ({currentGroup.members?.length || 0})</span>
        </button>

        {isOwner && (
          <button
            onClick={() => setActiveTab('invites')}
            className={`flex items-center space-x-2 px-6 py-3 border-b-2 text-sm font-semibold transition duration-155 cursor-pointer ${
              activeTab === 'invites'
                ? 'border-indigo-500 text-indigo-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Mail className="w-4 h-4" />
            <span>Invitations ({invites?.length || 0})</span>
          </button>
        )}
      </div>

      {/* Tab Contents */}
      <div className="grid grid-cols-1 gap-8">
        {activeTab === 'members' && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-white">Group Members</h2>
            <MemberList members={currentGroup.members || []} ownerId={currentGroup.createdById} />
          </div>
        )}

        {activeTab === 'invites' && isOwner && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left: Invite Form */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-5">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center space-x-2">
                    <Plus className="w-4 h-4 text-indigo-400" />
                    <span>Create Invitation</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">Generate a secure join code for this group.</p>
                </div>

                {inviteError && <ErrorAlert message={inviteError} />}
                {inviteSuccess && (
                  <div className="p-4 bg-emerald-950/20 border border-emerald-900/50 rounded-xl text-emerald-400 text-sm flex items-center space-x-2">
                    <span>✓ Invitation generated successfully!</span>
                  </div>
                )}

                <form onSubmit={handleCreateInvite} className="space-y-4">
                  {/* Email (Optional) */}
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Recipient Email (Optional)</label>
                    <input
                      type="email"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      placeholder="e.g. member@example.com"
                      className="w-full px-4 py-3 bg-slate-950/50 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-600 text-sm focus:outline-none focus:border-indigo-500 transition duration-200"
                    />
                  </div>

                  {/* Expiration selection */}
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Code Expiration</label>
                    <select
                      value={inviteExpiry}
                      onChange={(e) => setInviteExpiry(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-950/50 border border-slate-800 rounded-xl text-slate-300 text-sm focus:outline-none focus:border-indigo-500 transition duration-200 cursor-pointer"
                    >
                      <option value="1">1 Hour</option>
                      <option value="24">24 Hours (1 Day)</option>
                      <option value="168">7 Days (1 Week)</option>
                    </select>
                  </div>

                  {/* Submit button */}
                  <button
                    type="submit"
                    disabled={isSubmittingInvite}
                    className="w-full flex items-center justify-center space-x-2 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition duration-200 cursor-pointer"
                  >
                    {isSubmittingInvite ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <span>Generate Invite</span>
                    )}
                  </button>
                </form>
              </div>
            </div>

            {/* Right: Invites Feed */}
            <div className="lg:col-span-2 space-y-4">
              <h2 className="text-xl font-bold text-white">Invitations History</h2>
              <InviteList invites={invites} onRevoke={handleRevokeInvite} isOwner={isOwner} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
