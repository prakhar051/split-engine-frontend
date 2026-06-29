import { Link } from 'react-router-dom';
import { Users, Calendar, ArrowRight, Shield } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

export default function GroupCard({ group }) {
  const currentUserId = useAuthStore(state => state.user?.id);

  const formattedDate = new Date(group.createdAt).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  const memberCount = group.members ? group.members.length : 0;
  const isOwner = group.createdById === currentUserId;

  return (
    <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 hover:border-slate-700/80 rounded-2xl p-6 shadow-md transition duration-200 flex flex-col justify-between space-y-5">
      <div className="space-y-3">
        {/* Title & Badge */}
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-lg font-bold text-white leading-snug truncate">{group.name}</h3>
          {isOwner && (
            <span className="flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase bg-violet-600/10 border border-violet-500/25 text-violet-400 shrink-0">
              <Shield className="w-3 h-3" />
              <span>Owner</span>
            </span>
          )}
        </div>

        {/* Description */}
        <p className="text-slate-400 text-sm line-clamp-2 min-h-[40px]">
          {group.description || 'No description provided.'}
        </p>
      </div>

      {/* Info Row */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-800 text-xs text-slate-500">
        <span className="flex items-center space-x-1.5">
          <Users className="w-4 h-4 text-slate-400" />
          <span>{memberCount} members</span>
        </span>
        <span className="flex items-center space-x-1.5">
          <Calendar className="w-4 h-4 text-slate-400" />
          <span>Created {formattedDate}</span>
        </span>
      </div>

      {/* Action */}
      <Link
        to={`/groups/${group.id}`}
        className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 bg-slate-800 hover:bg-slate-700/80 text-slate-200 hover:text-white text-xs font-bold rounded-xl transition duration-200 border border-slate-700/40 cursor-pointer"
      >
        <span>View Details</span>
        <ArrowRight className="w-3.5 h-3.5" />
      </Link>
    </div>
  );
}
