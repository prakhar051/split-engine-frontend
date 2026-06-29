import React, { useState } from 'react';
import { useAdminStore } from '../../store/adminStore';
import { ArrowUp, Loader2 } from 'lucide-react';

const PromoteMemberButton = ({ groupId, memberId, version, onComplete }) => {
  const [loading, setLoading] = useState(false);
  const promoteMember = useAdminStore((state) => state.promoteMember);

  const handlePromote = async () => {
    if (!window.confirm('Are you sure you want to promote this member to Admin?')) {
      return;
    }
    setLoading(true);
    try {
      await promoteMember(groupId, memberId, version);
      if (onComplete) onComplete();
    } catch (err) {
      alert(err.message || 'Failed to promote member');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handlePromote}
      disabled={loading}
      className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-lg text-emerald-100 bg-emerald-700/20 hover:bg-emerald-700/40 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 transition-colors"
    >
      {loading ? (
        <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />
      ) : (
        <ArrowUp className="w-3.5 h-3.5 mr-1" />
      )}
      Promote to Admin
    </button>
  );
};

export default PromoteMemberButton;
