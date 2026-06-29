import { useEffect, useState } from 'react';
import { useGroupStore } from '../store/groupStore';
import GroupList from '../components/groups/GroupList';
import CreateGroupModal from '../components/groups/CreateGroupModal';
import { Search, Plus } from 'lucide-react';
import ErrorAlert from '../components/ui/ErrorAlert';

export default function GroupsPage() {
  const { groups, getGroups, isLoading, error } = useGroupStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    getGroups();
  }, [getGroups]);

  const filteredGroups = groups.filter((g) =>
    g.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white mb-2">My Groups</h1>
          <p className="text-slate-400 text-sm">Create, manage, and view your split-expense groups.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center space-x-2 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl transition duration-200 cursor-pointer shadow-md shadow-indigo-600/10 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Group</span>
        </button>
      </div>

      {error && <ErrorAlert message={error} />}

      {/* Search Bar */}
      <div className="relative max-w-md w-full">
        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
          <Search className="w-5 h-5" />
        </span>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search groups by name..."
          className="w-full pl-11 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-600 text-sm focus:outline-none focus:border-indigo-500 transition duration-200"
        />
      </div>

      {/* Skeletons or List */}
      {isLoading && groups.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 h-48 animate-pulse flex flex-col justify-between">
              <div className="space-y-3">
                <div className="h-5 w-2/3 bg-slate-850 rounded"></div>
                <div className="h-3 w-5/6 bg-slate-850 rounded"></div>
                <div className="h-3 w-1/2 bg-slate-850 rounded"></div>
              </div>
              <div className="h-8 w-full bg-slate-850 rounded"></div>
            </div>
          ))}
        </div>
      ) : (
        <GroupList groups={filteredGroups} onCreateTrigger={() => setIsModalOpen(true)} />
      )}

      {/* Create Group Modal */}
      <CreateGroupModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
