import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useGroupStore } from '../store/groupStore';
import { useAdminStore } from '../store/adminStore';
import { useAuthStore } from '../store/authStore';
import { useExpenseStore } from '../store/expenseStore';
import { useRecurringStore } from '../store/recurringStore';
import RoleBadge from '../components/admin/RoleBadge';
import MemberPermissionMenu from '../components/admin/MemberPermissionMenu';
import AdminActionHistory from '../components/admin/AdminActionHistory';
import GroupStatisticsCard from '../components/admin/GroupStatisticsCard';
import LeaveGroupButton from '../components/admin/LeaveGroupButton';
import OnlineUserBadge from '../components/pwa/OnlineUserBadge';
import { Shield, Users, Settings, History, Info, ArrowLeft, Trash2, Key, Loader2, RefreshCw, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const GroupAdminPage = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();

  const currentUserId = useAuthStore((state) => state.user?.id);
  const { currentGroup, getGroupDetails } = useGroupStore();
  const {
    members,
    admins,
    fetchMembers,
    fetchAdmins,
    permissions,
    updatePermissions,
    deleteGroup,
    loading: adminLoading,
    error: adminError
  } = useAdminStore();

  const { expenses, getGroupExpenses } = useExpenseStore();
  const { templates, fetchTemplates } = useRecurringStore();

  const [activeTab, setActiveTab] = useState('members');
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const group = await getGroupDetails(groupId);
        await Promise.all([
          fetchMembers(groupId),
          fetchAdmins(groupId),
          getGroupExpenses(groupId),
          fetchTemplates(groupId)
        ]);
        if (group && currentUserId) {
          updatePermissions(currentUserId, group);
        }
      } catch (err) {
        console.error('Failed to load admin settings:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [groupId, currentUserId, getGroupDetails, fetchMembers, fetchAdmins, getGroupExpenses, fetchTemplates, updatePermissions]);

  useEffect(() => {
    if (currentGroup && currentUserId) {
      updatePermissions(currentUserId, currentGroup);
    }
  }, [currentGroup, currentUserId, updatePermissions]);

  // Protect page: Only Admins and Owners can access the admin dashboard
  useEffect(() => {
    if (!loading && !permissions.isAdmin) {
      navigate(`/groups/${groupId}`);
    }
  }, [loading, permissions.isAdmin, groupId, navigate]);

  const handleActionComplete = async () => {
    setSuccessMsg('Action completed successfully!');
    setTimeout(() => setSuccessMsg(''), 3000);
    // Reload group details to fetch updated version and members list
    const group = await getGroupDetails(groupId);
    if (group && currentUserId) {
      updatePermissions(currentUserId, group);
    }
    await Promise.all([
      fetchMembers(groupId),
      fetchAdmins(groupId)
    ]);
  };

  const handleDeleteGroup = async () => {
    if (!window.confirm('WARNING: Are you sure you want to permanently delete this group? This will erase all expenses, settlements, recurring templates, and logs. This action is irreversible.')) {
      return;
    }
    setDeleting(true);
    try {
      await deleteGroup(groupId);
      navigate('/groups');
    } catch (err) {
      alert(err.message || 'Failed to delete group');
    } finally {
      setDeleting(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
          <p className="text-slate-400 font-medium">Loading Administration Dashboard...</p>
        </div>
      </div>
    );
  }

  // Count metrics for stats card
  const totalExpensesCount = expenses?.length || 0;
  const activeTemplatesCount = templates?.filter(t => t.isActive && !t.deletedAt).length || 0;
  
  // Count how many members are banned
  const bannedCount = members.filter(m => m.isBanned).length;
  // Non-banned count
  const activeMembersCount = members.filter(m => !m.isBanned).length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 lg:p-8 font-sans max-w-7xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-3">
          <Link
            to={`/groups/${groupId}`}
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-black tracking-tight text-slate-100">{currentGroup?.name}</h1>
              <span className="text-xs font-bold px-2 py-0.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-full">
                v{currentGroup?.version}
              </span>
            </div>
            <p className="text-sm text-slate-400 mt-0.5">Group Administration & Permission Management</p>
          </div>
        </div>
      </div>

      {/* Success Notification Alert */}
      <AnimatePresence>
        {successMsg && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-xl flex items-center space-x-2 text-sm font-semibold"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMsg}</span>
          </motion.div>
        )}
        {adminError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-xl flex items-center space-x-2 text-sm font-semibold animate-pulse"
          >
            <Info className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{adminError}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Statistics Card */}
      <GroupStatisticsCard
        totalMembers={activeMembersCount}
        adminCount={admins.length}
        onlineCount={activeMembersCount} // In-memory/socket state can override
        pendingInvites={0} // Mock invitation count or actual
        bannedCount={bannedCount}
        totalExpenses={totalExpensesCount}
        activeTemplates={activeTemplatesCount}
      />

      {/* Tabs Layout */}
      <div className="flex border-b border-slate-900 overflow-x-auto pb-px">
        <button
          onClick={() => setActiveTab('members')}
          className={`flex items-center space-x-2 px-6 py-3 border-b-2 text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'members'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Members & Roles</span>
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`flex items-center space-x-2 px-6 py-3 border-b-2 text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'audit'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Audit Log History</span>
        </button>

        <button
          onClick={() => setActiveTab('danger')}
          className={`flex items-center space-x-2 px-6 py-3 border-b-2 text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'danger'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Danger Zone</span>
        </button>
      </div>

      {/* Tab Panels */}
      <div className="space-y-6">
        {activeTab === 'members' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold text-slate-100">Group Members ({members.length})</h2>
            </div>

            <div className="space-y-4">
              {members.map((member) => {
                const formattedDate = new Date(member.joinedAt).toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                });
                const isCurrentUser = member.userId === currentUserId;

                return (
                  <div
                    key={member.id}
                    className={`bg-slate-900/40 backdrop-blur-md border rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all duration-300 ${
                      member.isBanned ? 'border-rose-950/40 bg-rose-950/5' : 'border-slate-900/80 hover:border-slate-800'
                    }`}
                  >
                    <div className="flex items-center space-x-3.5 min-w-0">
                      {member.user.avatar ? (
                        <div className="relative shrink-0">
                          <img
                            src={member.user.avatar}
                            alt={member.user.name}
                            className={`w-11 h-11 rounded-full object-cover border ${
                              member.isBanned ? 'border-rose-900/50' : 'border-slate-700'
                            }`}
                          />
                          {!member.isBanned && (
                            <div className="absolute bottom-0 right-0 transform translate-x-1/4 translate-y-1/4 bg-slate-900 rounded-full p-0.5">
                              <OnlineUserBadge userId={member.userId} />
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="relative shrink-0">
                          <div className={`w-11 h-11 rounded-full border flex items-center justify-center text-sm font-bold ${
                            member.isBanned
                              ? 'bg-rose-950/45 border-rose-900/40 text-rose-400'
                              : 'bg-indigo-950/50 border-indigo-850/70 text-indigo-400'
                          }`}>
                            {getInitials(member.user.name)}
                          </div>
                          {!member.isBanned && (
                            <div className="absolute bottom-0 right-0 transform translate-x-1/4 translate-y-1/4 bg-slate-900 rounded-full p-0.5">
                              <OnlineUserBadge userId={member.userId} />
                            </div>
                          )}
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="flex items-center space-x-2">
                          <p className="text-sm font-bold text-slate-100 truncate">
                            {member.user.name}
                          </p>
                          {isCurrentUser && (
                            <span className="text-[10px] font-semibold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                              You
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 truncate mt-0.5">{member.user.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0">
                      <div className="text-left sm:text-right">
                        <RoleBadge role={member.role} isBanned={member.isBanned} />
                        <p className="text-[10px] text-slate-500 mt-1.5">Joined {formattedDate}</p>
                      </div>

                      {/* Dropdown Action Menu */}
                      <MemberPermissionMenu
                        groupId={groupId}
                        member={member}
                        currentUserRole={permissions.role}
                        currentUserId={currentUserId}
                        groupVersion={currentGroup?.version}
                        onActionComplete={handleActionComplete}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'audit' && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-slate-100">Administrative Action Timeline</h2>
            <AdminActionHistory groupId={groupId} />
          </div>
        )}

        {activeTab === 'danger' && (
          <div className="space-y-6">
            <div className="bg-red-500/5 border border-red-500/10 rounded-2xl p-6 space-y-6">
              <h2 className="text-lg font-black tracking-tight text-red-400 flex items-center">
                <Trash2 className="w-5 h-5 mr-2" />
                Critical Actions
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Leave Group Card */}
                <div className="bg-slate-950/40 border border-slate-900 rounded-xl p-5 flex flex-col justify-between space-y-4">
                  <div>
                    <h3 className="text-sm font-bold text-slate-200">Leave Group</h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Remove yourself from this group. You will lose access to all balances, history, and split records.
                    </p>
                  </div>
                  {permissions.isOwner ? (
                    <div className="text-xs text-amber-500 font-semibold bg-amber-500/10 border border-amber-500/25 p-3 rounded-lg flex items-start space-x-1.5">
                      <Info className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>As the OWNER, you cannot leave the group. You must first transfer ownership to another member in the member settings.</span>
                    </div>
                  ) : (
                    <div className="flex justify-start">
                      <LeaveGroupButton groupId={groupId} />
                    </div>
                  )}
                </div>

                {/* Delete Group Card (Only for Owners) */}
                {permissions.isOwner && (
                  <div className="bg-slate-950/40 border border-slate-900 rounded-xl p-5 flex flex-col justify-between space-y-4">
                    <div>
                      <h3 className="text-sm font-bold text-slate-200">Delete Group</h3>
                      <p className="text-xs text-slate-500 mt-1">
                        Permanently destroy this group. All expenses, participant shares, templates, and logs will be deleted forever.
                      </p>
                    </div>
                    <div>
                      <button
                        onClick={handleDeleteGroup}
                        disabled={deleting}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-xl text-white bg-red-650 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 transition-colors"
                      >
                        {deleting ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4 mr-2" />
                        )}
                        Delete Group
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GroupAdminPage;
