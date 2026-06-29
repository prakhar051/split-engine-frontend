import React, { useState, useRef, useEffect } from 'react';
import { useAdminStore } from '../../store/adminStore';
import { MoreVertical, ShieldAlert, Shield, ShieldOff, Trash2, Key, Loader2, RefreshCw } from 'lucide-react';

const MemberPermissionMenu = ({
  groupId,
  member,
  currentUserRole,
  currentUserId,
  groupVersion,
  onActionComplete
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [banReason, setBanReason] = useState('');
  const [showBanModal, setShowBanModal] = useState(false);
  
  const menuRef = useRef(null);

  const {
    promoteMember,
    demoteMember,
    banMember,
    unbanMember,
    removeMember,
    transferOwnership
  } = useAdminStore();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handlePromote = async () => {
    if (!window.confirm(`Are you sure you want to promote ${member.user.name} to Admin?`)) return;
    setLoading(true);
    setIsOpen(false);
    try {
      await promoteMember(groupId, member.userId, groupVersion);
      if (onActionComplete) onActionComplete();
    } catch (err) {
      alert(err.message || 'Failed to promote member');
    } finally {
      setLoading(false);
    }
  };

  const handleDemote = async () => {
    if (!window.confirm(`Are you sure you want to demote ${member.user.name} to Member?`)) return;
    setLoading(true);
    setIsOpen(false);
    try {
      await demoteMember(groupId, member.userId, groupVersion);
      if (onActionComplete) onActionComplete();
    } catch (err) {
      alert(err.message || 'Failed to demote member');
    } finally {
      setLoading(false);
    }
  };

  const handleBan = async (e) => {
    e.preventDefault();
    setLoading(true);
    setShowBanModal(false);
    try {
      await banMember(groupId, member.userId, banReason, groupVersion);
      setBanReason('');
      if (onActionComplete) onActionComplete();
    } catch (err) {
      alert(err.message || 'Failed to ban member');
    } finally {
      setLoading(false);
    }
  };

  const handleUnban = async () => {
    if (!window.confirm(`Are you sure you want to unban ${member.user.name}?`)) return;
    setLoading(true);
    setIsOpen(false);
    try {
      await unbanMember(groupId, member.userId, groupVersion);
      if (onActionComplete) onActionComplete();
    } catch (err) {
      alert(err.message || 'Failed to unban member');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async () => {
    if (!window.confirm(`Are you sure you want to remove ${member.user.name} from this group?`)) return;
    setLoading(true);
    setIsOpen(false);
    try {
      await removeMember(groupId, member.userId, groupVersion);
      if (onActionComplete) onActionComplete();
    } catch (err) {
      alert(err.message || 'Failed to remove member');
    } finally {
      setLoading(false);
    }
  };

  const handleTransfer = async () => {
    if (!window.confirm(`Are you sure you want to transfer group ownership to ${member.user.name}? You will lose Owner status.`)) return;
    setLoading(true);
    setIsOpen(false);
    try {
      await transferOwnership(groupId, member.userId, groupVersion);
      if (onActionComplete) onActionComplete();
    } catch (err) {
      alert(err.message || 'Failed to transfer ownership');
    } finally {
      setLoading(false);
    }
  };

  // RBAC Permission checks for rendering options
  const isSelf = member.userId === currentUserId;
  const isTargetOwner = member.role === 'OWNER';
  const isTargetAdmin = member.role === 'ADMIN';
  const isTargetMember = member.role === 'MEMBER';

  // Actions allowed based on role hierarchy
  const canPromote = currentUserRole === 'OWNER' && isTargetMember && !member.isBanned;
  const canDemote = currentUserRole === 'OWNER' && isTargetAdmin && !member.isBanned;
  const canTransfer = currentUserRole === 'OWNER' && !isSelf && !member.isBanned;
  const canBan = !isSelf && !isTargetOwner && (
    (currentUserRole === 'OWNER') ||
    (currentUserRole === 'ADMIN' && isTargetMember)
  ) && !member.isBanned;
  const canUnban = !isSelf && !isTargetOwner && (
    (currentUserRole === 'OWNER') ||
    (currentUserRole === 'ADMIN' && isTargetMember)
  ) && member.isBanned;
  const canRemove = !isSelf && !isTargetOwner && (
    (currentUserRole === 'OWNER') ||
    (currentUserRole === 'ADMIN' && isTargetMember)
  );

  // If no action is available or is currently loading
  const hasActions = canPromote || canDemote || canTransfer || canBan || canUnban || canRemove;

  if (!hasActions) return null;

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      <div>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          disabled={loading}
          className="inline-flex items-center justify-center p-2 rounded-lg bg-slate-900/40 border border-slate-800 text-slate-400 hover:text-slate-200 focus:outline-none transition-colors"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
          ) : (
            <MoreVertical className="w-4 h-4" />
          )}
        </button>
      </div>

      {isOpen && (
        <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-xl shadow-xl bg-slate-900 border border-slate-800 focus:outline-none z-30">
          <div className="py-1.5 p-1 space-y-0.5">
            {canPromote && (
              <button
                onClick={handlePromote}
                className="flex items-center w-full px-3 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg transition-colors text-left"
              >
                <Shield className="w-3.5 h-3.5 mr-2 text-emerald-400" />
                Promote to Admin
              </button>
            )}

            {canDemote && (
              <button
                onClick={handleDemote}
                className="flex items-center w-full px-3 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg transition-colors text-left"
              >
                <ShieldOff className="w-3.5 h-3.5 mr-2 text-amber-400" />
                Demote to Member
              </button>
            )}

            {canTransfer && (
              <button
                onClick={handleTransfer}
                className="flex items-center w-full px-3 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg transition-colors text-left"
              >
                <Key className="w-3.5 h-3.5 mr-2 text-indigo-400" />
                Transfer Ownership
              </button>
            )}

            {canBan && (
              <button
                onClick={() => {
                  setIsOpen(false);
                  setShowBanModal(true);
                }}
                className="flex items-center w-full px-3 py-2 text-xs font-semibold text-red-400 hover:bg-red-500/10 rounded-lg transition-colors text-left"
              >
                <ShieldAlert className="w-3.5 h-3.5 mr-2 text-red-500" />
                Ban Member
              </button>
            )}

            {canUnban && (
              <button
                onClick={handleUnban}
                className="flex items-center w-full px-3 py-2 text-xs font-semibold text-teal-400 hover:bg-teal-500/10 rounded-lg transition-colors text-left"
              >
                <RefreshCw className="w-3.5 h-3.5 mr-2 text-teal-400" />
                Unban Member
              </button>
            )}

            {canRemove && (
              <button
                onClick={handleRemove}
                className="flex items-center w-full px-3 py-2 text-xs font-semibold text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors text-left"
              >
                <Trash2 className="w-3.5 h-3.5 mr-2 text-rose-500" />
                Remove from Group
              </button>
            )}
          </div>
        </div>
      )}

      {showBanModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 max-w-md w-full rounded-2xl p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-100 flex items-center">
              <ShieldAlert className="w-5 h-5 text-red-500 mr-2" />
              Ban {member.user.name}
            </h3>
            <p className="text-xs text-slate-400">
              Banned members cannot access group details, settle balances, or view transaction history. Membership record is preserved but permissions are revoked.
            </p>
            <form onSubmit={handleBan} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Ban Reason</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Unresolved dispute or inactive"
                  value={banReason}
                  onChange={(e) => setBanReason(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 text-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 placeholder-slate-600 text-sm"
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowBanModal(false);
                    setBanReason('');
                  }}
                  className="px-4 py-2 text-sm font-semibold rounded-xl bg-slate-850 hover:bg-slate-800 text-slate-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-semibold rounded-xl bg-red-650 hover:bg-red-700 text-white transition-colors"
                >
                  Ban Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MemberPermissionMenu;
