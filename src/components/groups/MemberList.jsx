import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, User, Trash2, LogOut, Key, Crown } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useGroupStore } from '../../store/groupStore';
import RemoveMemberModal from './RemoveMemberModal';
import TransferOwnershipModal from './TransferOwnershipModal';
import OnlineUserBadge from '../pwa/OnlineUserBadge';
import RoleBadge from '../admin/RoleBadge';


export default function MemberList({ members, ownerId }) {
  const currentUserId = useAuthStore((state) => state.user?.id);
  const { currentGroup, removeMember, leaveGroup, transferOwnership, isLoading } = useGroupStore();
  const navigate = useNavigate();

  const [selectedMember, setSelectedMember] = useState(null);
  const [isRemoveOpen, setIsRemoveOpen] = useState(false);
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [isLeaveOpen, setIsLeaveOpen] = useState(false);

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  };

  const handleRemoveClick = (member) => {
    setSelectedMember(member);
    setIsRemoveOpen(true);
  };

  const handleTransferClick = (member) => {
    setSelectedMember(member);
    setIsTransferOpen(true);
  };

  const handleLeaveClick = () => {
    setIsLeaveOpen(true);
  };

  const handleConfirmRemove = async () => {
    if (!selectedMember || !currentGroup) return;
    try {
      await removeMember(currentGroup.id, selectedMember.userId);
      setIsRemoveOpen(false);
      setSelectedMember(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleConfirmTransfer = async () => {
    if (!selectedMember || !currentGroup) return;
    try {
      await transferOwnership(currentGroup.id, selectedMember.userId);
      setIsTransferOpen(false);
      setSelectedMember(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleConfirmLeave = async () => {
    if (!currentGroup) return;
    try {
      await leaveGroup(currentGroup.id);
      setIsLeaveOpen(false);
      navigate('/groups');
    } catch (err) {
      console.error(err);
    }
  };

  const currentUserIsOwner = currentUserId === ownerId;

  return (
    <div className="space-y-4 w-full font-sans">
      {members.map((member) => {
        const isMemberOwner = member.userId === ownerId;
        const isCurrentUserCard = member.userId === currentUserId;
        const formattedDate = new Date(member.joinedAt).toLocaleDateString(undefined, {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        });

        return (
          <div key={member.id} className="bg-slate-950/20 border border-slate-800/80 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-3 min-w-0">
              {member.user.avatar ? (
                <div className="relative shrink-0">
                  <img src={member.user.avatar} alt={member.user.name} className="w-10 h-10 rounded-full object-cover border border-slate-700" />
                  <div className="absolute bottom-0 right-0 transform translate-x-1/4 translate-y-1/4 bg-slate-900 rounded-full p-0.5">
                    <OnlineUserBadge userId={member.userId} />
                  </div>
                </div>
              ) : (
                <div className="relative shrink-0">
                  <div className="w-10 h-10 rounded-full bg-indigo-950/80 border border-indigo-850 flex items-center justify-center text-sm font-bold text-indigo-400">
                    {getInitials(member.user.name)}
                  </div>
                  <div className="absolute bottom-0 right-0 transform translate-x-1/4 translate-y-1/4 bg-slate-900 rounded-full p-0.5">
                    <OnlineUserBadge userId={member.userId} />
                  </div>
                </div>
              )}
              <div className="min-w-0">
                <p className="text-sm font-bold text-slate-200 truncate">
                  {member.user.name} {isCurrentUserCard && <span className="text-xs text-indigo-400 font-normal ml-1">(You)</span>}
                </p>
                <p className="text-xs text-slate-500 truncate">{member.user.email}</p>
              </div>
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4 shrink-0">
              <div className="text-left sm:text-right flex flex-col items-start sm:items-end">
                <div className="flex items-center space-x-1.5">
                  {isMemberOwner && <Crown className="w-4 h-4 text-amber-400 shrink-0" />}
                  <RoleBadge role={member.role} isBanned={member.isBanned} />
                </div>
                <p className="text-[10px] text-slate-500 mt-1">Joined {formattedDate}</p>
              </div>


              {/* Action Buttons */}
              <div className="flex space-x-1">
                {/* If current user is owner and this card is NOT current user (another member) */}
                {currentUserIsOwner && !isCurrentUserCard && (
                  <>
                    <button
                      onClick={() => handleTransferClick(member)}
                      title="Transfer Ownership"
                      className="p-2 bg-indigo-600/10 border border-indigo-500/25 text-indigo-400 hover:bg-indigo-650/20 hover:text-indigo-350 rounded-lg transition cursor-pointer"
                    >
                      <Key className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleRemoveClick(member)}
                      title="Remove Member"
                      className="p-2 bg-rose-600/10 border border-rose-500/25 text-rose-400 hover:bg-rose-650/20 hover:text-rose-350 rounded-lg transition cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </>
                )}

                {/* If current user is NOT owner and this is their own card (they can leave) */}
                {!isMemberOwner && isCurrentUserCard && (
                  <button
                    onClick={handleLeaveClick}
                    title="Leave Group"
                    className="flex items-center space-x-1 px-3 py-1.5 bg-rose-600/10 border border-rose-500/25 text-rose-400 hover:bg-rose-600/20 hover:text-rose-350 rounded-lg text-xs font-bold transition cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Leave</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })}

      {/* Remove Member Modal */}
      <RemoveMemberModal
        isOpen={isRemoveOpen}
        onClose={() => { setIsRemoveOpen(false); setSelectedMember(null); }}
        onConfirm={handleConfirmRemove}
        memberName={selectedMember?.user?.name || ''}
        isLoading={isLoading}
      />

      {/* Transfer Ownership Modal */}
      <TransferOwnershipModal
        isOpen={isTransferOpen}
        onClose={() => { setIsTransferOpen(false); setSelectedMember(null); }}
        onConfirm={handleConfirmTransfer}
        memberName={selectedMember?.user?.name || ''}
        isLoading={isLoading}
      />

      {/* Leave Group Modal (Reuses RemoveMemberModal UI pattern) */}
      <RemoveMemberModal
        isOpen={isLeaveOpen}
        onClose={() => setIsLeaveOpen(false)}
        onConfirm={handleConfirmLeave}
        memberName="yourself"
        isLoading={isLoading}
      />
    </div>
  );
}
