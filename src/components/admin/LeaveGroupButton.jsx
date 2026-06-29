import React, { useState } from 'react';
import { useAdminStore } from '../../store/adminStore';
import { LogOut, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const LeaveGroupButton = ({ groupId }) => {
  const [loading, setLoading] = useState(false);
  const leaveGroup = useAdminStore((state) => state.leaveGroup);
  const navigate = useNavigate();

  const handleLeave = async () => {
    if (!window.confirm('Are you sure you want to leave this group? This action cannot be undone.')) {
      return;
    }
    setLoading(true);
    try {
      await leaveGroup(groupId);
      navigate('/dashboard');
    } catch (err) {
      alert(err.message || 'Failed to leave group');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleLeave}
      disabled={loading}
      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-xl text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 transition-colors"
    >
      {loading ? (
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      ) : (
        <LogOut className="w-4 h-4 mr-2" />
      )}
      Leave Group
    </button>
  );
};

export default LeaveGroupButton;
