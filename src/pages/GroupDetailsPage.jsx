import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useGroupStore } from '../store/groupStore';
import { useAuthStore } from '../store/authStore';
import { useSocketStore } from '../store/socketStore';
import MemberList from '../components/groups/MemberList';
import InviteList from '../components/groups/InviteList';
import ErrorAlert from '../components/ui/ErrorAlert';
import ExportDropdown from '../components/ui/ExportDropdown';
import { Users, Mail, Plus, ArrowLeft, Copy, RefreshCw, Power, Check, Calendar, User, Eye } from 'lucide-react';

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
    createShareableInvite,
    deactivateInvite,
    regenerateInvite,
    isLoading,
    error
  } = useGroupStore();

  const [activeTab, setActiveTab] = useState('members');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteExpiry, setInviteExpiry] = useState('24');
  const [inviteError, setInviteError] = useState(null);
  const [inviteSuccess, setInviteSuccess] = useState(false);
  const [isSubmittingInvite, setIsSubmittingInvite] = useState(false);
  
  // Shareable Invite States
  const [newlyGeneratedToken, setNewlyGeneratedToken] = useState(null);
  const [copySuccess, setCopySuccess] = useState(false);

  const myMember = currentGroup?.members?.find(m => m.userId === currentUserId);
  const isGroupAdminOrOwner = myMember && (myMember.role === 'ADMIN' || myMember.role === 'OWNER');
  const isOwner = currentGroup?.createdById === currentUserId;

  useEffect(() => {
    const joinGroupSocket = useSocketStore.getState().joinGroup;
    const leaveGroupSocket = useSocketStore.getState().leaveGroup;
    joinGroupSocket(groupId);

    const prefetch = async () => {
      try {
        const group = await getGroupDetails(groupId);
        const myMember = group.members?.find(m => m.userId === currentUserId);
        const isGroupAdminOrOwner = myMember && (myMember.role === 'ADMIN' || myMember.role === 'OWNER');
        if (isGroupAdminOrOwner) {
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

        {isGroupAdminOrOwner && (
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

        {activeTab === 'invites' && isGroupAdminOrOwner && (() => {
          const defaultInvite = invites?.find(inv => inv.email === null && inv.isActive);
          const clientUrl = process.env.CLIENT_URL ? process.env.CLIENT_URL.split(',')[0] : window.location.origin;
          const defaultInviteUrl = defaultInvite
            ? `${clientUrl}/invite/${newlyGeneratedToken || defaultInvite.code}`
            : '';

          const handleCreateDefaultInvite = async () => {
            setInviteError(null);
            try {
              const res = await createShareableInvite(groupId, null, 'never');
              if (res && res.invite && res.invite.token) {
                setNewlyGeneratedToken(res.invite.token);
              }
            } catch (err) {
              setInviteError(err.response?.data?.message || 'Failed to create default invite');
            }
          };

          const handleRegenerateInvite = async (inviteId) => {
            setInviteError(null);
            try {
              const res = await regenerateInvite(groupId, inviteId);
              if (res && res.invite && res.invite.token) {
                setNewlyGeneratedToken(res.invite.token);
              }
            } catch (err) {
              setInviteError(err.response?.data?.message || 'Failed to regenerate invite');
            }
          };

          const handleDeactivateInvite = async (inviteId) => {
            setInviteError(null);
            try {
              await deactivateInvite(groupId, inviteId);
              setNewlyGeneratedToken(null);
            } catch (err) {
              setInviteError(err.response?.data?.message || 'Failed to deactivate invite');
            }
          };

          const handleCopyLink = () => {
            navigator.clipboard.writeText(defaultInviteUrl);
            setCopySuccess(true);
            setTimeout(() => setCopySuccess(false), 2000);
          };

          const getExpiryText = (expiresAt) => {
            const expiryDate = new Date(expiresAt);
            const tenYearsFromNow = new Date(Date.now() + 10 * 365 * 24 * 60 * 60 * 1000);
            if (expiryDate > tenYearsFromNow) return 'Never Expires';
            return expiryDate.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
          };

          return (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left: Reusable shareable link card */}
              <div className="lg:col-span-1 space-y-6">
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-5">
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center space-x-2">
                      <Mail className="w-4.5 h-4.5 text-indigo-400" />
                      <span>Shareable Invite Link</span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">Anyone with this link can join the group.</p>
                  </div>

                  {inviteError && <ErrorAlert message={inviteError} />}

                  {defaultInvite ? (
                    <div className="space-y-4">
                      {/* Invite Link Textbox */}
                      <div className="space-y-2">
                        <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Invite URL</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            readOnly
                            value={defaultInviteUrl}
                            className="flex-1 px-3 py-2 bg-slate-950 border border-slate-850 rounded-xl text-slate-300 text-xs focus:outline-none"
                          />
                          <button
                            onClick={handleCopyLink}
                            className="p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition flex items-center justify-center cursor-pointer"
                            title="Copy to Clipboard"
                          >
                            {copySuccess ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                          </button>
                        </div>
                        {copySuccess && (
                          <span className="text-[10px] text-emerald-400 font-medium block">✓ Link copied to clipboard!</span>
                        )}
                      </div>

                      {/* Invite Stats */}
                      <div className="bg-slate-950/40 border border-slate-850 p-4 rounded-xl space-y-2.5 text-xs text-slate-400">
                        <div className="flex justify-between">
                          <span className="text-slate-500">Status</span>
                          <span className="text-emerald-400 font-semibold">Active</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Uses</span>
                          <span className="text-slate-300 font-medium">
                            {defaultInvite.currentUses} / {defaultInvite.maxUses || 'Unlimited'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Expiration</span>
                          <span className="text-slate-300 font-medium">{getExpiryText(defaultInvite.expiresAt)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Created Date</span>
                          <span className="text-slate-300 font-medium">{new Date(defaultInvite.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Created By</span>
                          <span className="text-slate-300 font-medium">{defaultInvite.invitedBy}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Last Used</span>
                          <span className="text-slate-300 font-medium">
                            {defaultInvite.lastUsedAt ? new Date(defaultInvite.lastUsedAt).toLocaleDateString() : 'Never'}
                          </span>
                        </div>
                      </div>

                      {/* Invite Actions */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleRegenerateInvite(defaultInvite.id)}
                          className="flex-1 flex items-center justify-center space-x-1.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition cursor-pointer"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          <span>Regenerate Link</span>
                        </button>
                        <button
                          onClick={() => handleDeactivateInvite(defaultInvite.id)}
                          className="flex-1 flex items-center justify-center space-x-1.5 py-2 bg-rose-950/20 hover:bg-rose-950/30 text-rose-400 text-xs font-bold rounded-xl border border-rose-900/30 transition cursor-pointer"
                        >
                          <Power className="w-3.5 h-3.5" />
                          <span>Deactivate Link</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4 py-4 text-center">
                      <p className="text-slate-400 text-sm">No active invite link.</p>
                      <button
                        onClick={handleCreateDefaultInvite}
                        className="py-2.5 px-6 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-md shadow-indigo-500/10"
                      >
                        Create Invite
                      </button>
                    </div>
                  )}
                </div>

                {/* Email invite form (Backward compatible) */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-5">
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center space-x-2">
                      <Plus className="w-4 h-4 text-indigo-400" />
                      <span>Send Email Invitation</span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">Invite a specific member via email.</p>
                  </div>

                  {inviteSuccess && (
                    <div className="p-4 bg-emerald-950/20 border border-emerald-900/50 rounded-xl text-emerald-400 text-sm flex items-center space-x-2">
                      <span>✓ Invitation sent successfully!</span>
                    </div>
                  )}

                  <form onSubmit={handleCreateInvite} className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Recipient Email</label>
                      <input
                        type="email"
                        required
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                        placeholder="member@example.com"
                        className="w-full px-4 py-3 bg-slate-950/50 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-600 text-sm focus:outline-none focus:border-indigo-500 transition duration-200"
                      />
                    </div>

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

                    <button
                      type="submit"
                      disabled={isSubmittingInvite}
                      className="w-full flex items-center justify-center space-x-2 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition duration-200 cursor-pointer"
                    >
                      {isSubmittingInvite ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <span>Send Invite</span>
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
          );
        })()}
      </div>
    </div>
  );
}
