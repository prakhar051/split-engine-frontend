import React, { useState } from 'react';
import { useAdminStore } from '../../store/adminStore';
import { ArrowDown, Loader2 } from 'lucide-react';

const DemoteMemberButton = ({ groupId, memberId, version, onComplete }) => {
  const [loading, setLoading] = useState(false);
  const demoteMember = useAdminStore((state) => state.demoteMember);

  const handleDemote = async () => {
    if (!window.confirm('Are you sure you want to demote this Admin to Member?')) {
      return;
    }
    setLoading(true);
    try {
      await demoteMember(groupId, memberId, version);
      if (onComplete) onComplete();
    } catch (err) {
      alert(err.message || 'Failed to demote member');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleDemote}
      disabled={loading}
      className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-lg text-amber-100 bg-amber-700/20 hover:bg-amber-700/40 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-50 transition-colors"
    >
      {loading ? (
        <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />
      ) : (
        <ArrowDown className="w-3.5 h-3.5 mr-1" />
      )}
      Demote to Member
    </button>
  );
};

export default DemoteMemberButton;
