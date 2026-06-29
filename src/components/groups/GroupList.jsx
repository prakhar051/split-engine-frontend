import GroupCard from './GroupCard';
import EmptyState from '../ui/EmptyState';
import { Users } from 'lucide-react';

export default function GroupList({ groups, onCreateTrigger }) {
  if (!groups || groups.length === 0) {
    return (
      <EmptyState
        title="No groups found"
        message="Create your first split-expense group or join an existing one using an invite code."
        icon={Users}
        actionButton={
          <button
            onClick={onCreateTrigger}
            className="py-2.5 px-5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl transition duration-200 cursor-pointer shadow-md shadow-indigo-600/10"
          >
            Create Group
          </button>
        }
      />
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
      {groups.map((group) => (
        <GroupCard key={group.id} group={group} />
      ))}
    </div>
  );
}
