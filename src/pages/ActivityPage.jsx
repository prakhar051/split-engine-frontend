import React, { useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock } from 'lucide-react';
import { useActivityStore } from '../store/activityStore';
import { useGroupStore } from '../store/groupStore';
import ActivityTimeline from '../components/activities/ActivityTimeline';

const ActivityPage = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();

  const { activities, isLoading: isActivityLoading, getActivities, error: activityError } = useActivityStore();
  const { currentGroup, getGroupDetails, isLoading: isGroupLoading } = useGroupStore();

  useEffect(() => {
    if (groupId) {
      getActivities(groupId);
      getGroupDetails(groupId).catch(() => {
        // If fetch fails or access is denied, redirect back to dashboard
        navigate('/dashboard');
      });
    }
  }, [groupId, getActivities, getGroupDetails, navigate]);

  const isLoading = isActivityLoading || isGroupLoading;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* Back link */}
      <div className="flex items-center gap-4">
        <Link 
          to={`/groups/${groupId}`} 
          className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 text-slate-300 hover:text-white transition-all duration-300 backdrop-blur-md"
          title="Back to group"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Clock className="w-6 h-6 text-indigo-400" />
            <span>Activity Timeline</span>
          </h1>
          <p className="text-xs text-slate-400 font-medium">
            {currentGroup ? `Track events in "${currentGroup.name}"` : 'Recent events in this group'}
          </p>
        </div>
      </div>

      {activityError && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-400 text-sm">
          {activityError}
        </div>
      )}

      {isLoading && activities.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-20 space-y-4">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-slate-400">Loading timeline data...</p>
        </div>
      ) : (
        <div className="mt-8">
          <ActivityTimeline activities={activities} />
        </div>
      )}
    </div>
  );
};

export default ActivityPage;
