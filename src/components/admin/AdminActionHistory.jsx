import React, { useEffect } from 'react';
import { useAdminStore } from '../../store/adminStore';
import { Shield, ShieldAlert, ShieldAlert as BanIcon, ShieldCheck, Trash, LogOut, RefreshCw, Settings, Info, Clock } from 'lucide-react';

const ACTION_ICONS = {
  ADMIN_PROMOTED: <Shield className="w-4 h-4 text-emerald-400" />,
  ADMIN_DEMOTED: <ShieldAlert className="w-4 h-4 text-amber-400" />,
  OWNER_TRANSFERRED: <RefreshCw className="w-4 h-4 text-indigo-400" />,
  MEMBER_REMOVED: <Trash className="w-4 h-4 text-rose-400" />,
  MEMBER_BANNED: <BanIcon className="w-4 h-4 text-red-500" />,
  MEMBER_UNBANNED: <ShieldCheck className="w-4 h-4 text-teal-400" />,
  MEMBER_LEFT: <LogOut className="w-4 h-4 text-slate-400" />,
  GROUP_SETTINGS_UPDATED: <Settings className="w-4 h-4 text-sky-400" />
};

const ACTION_LABELS = {
  ADMIN_PROMOTED: 'Promoted to Admin',
  ADMIN_DEMOTED: 'Demoted to Member',
  OWNER_TRANSFERRED: 'Transferred Ownership',
  MEMBER_REMOVED: 'Removed Member',
  MEMBER_BANNED: 'Banned Member',
  MEMBER_UNBANNED: 'Unbanned Member',
  MEMBER_LEFT: 'Member Left',
  GROUP_SETTINGS_UPDATED: 'Group Settings Updated'
};

const AdminActionHistory = ({ groupId }) => {
  const { auditLogs, members, fetchAdminActions, loading } = useAdminStore();

  useEffect(() => {
    if (groupId) {
      fetchAdminActions(groupId);
    }
  }, [groupId, fetchAdminActions]);

  const getUserName = (userId) => {
    if (!userId) return 'System';
    const member = members.find((m) => m.userId === userId);
    return member?.user?.name || member?.user?.email || userId;
  };

  const formatMetadata = (log) => {
    if (!log.metadata) return '';
    try {
      const meta = typeof log.metadata === 'string' ? JSON.parse(log.metadata) : log.metadata;
      if (log.action === 'MEMBER_BANNED' && meta.reason) {
        return `Reason: "${meta.reason}"`;
      }
      if (log.action === 'ADMIN_PROMOTED') {
        return `Role changed from ${meta.fromRole || 'MEMBER'} to ${meta.toRole || 'ADMIN'}`;
      }
      if (log.action === 'ADMIN_DEMOTED') {
        return `Role changed from ${meta.fromRole || 'ADMIN'} to ${meta.toRole || 'MEMBER'}`;
      }
      return '';
    } catch (e) {
      return '';
    }
  };

  if (loading && auditLogs.length === 0) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (auditLogs.length === 0) {
    return (
      <div className="text-center py-8 bg-slate-900/40 rounded-2xl border border-slate-800/80">
        <Info className="w-8 h-8 text-slate-500 mx-auto mb-2" />
        <p className="text-slate-400 font-medium">No admin actions logged yet</p>
        <p className="text-xs text-slate-500 mt-1">Actions like role changes, bans, and removals will appear here.</p>
      </div>
    );
  }

  return (
    <div className="flow-root bg-slate-950/40 backdrop-blur-md border border-slate-900 rounded-2xl p-6">
      <ul className="-mb-8">
        {auditLogs.map((log, logIdx) => {
          const icon = ACTION_ICONS[log.action] || <Info className="w-4 h-4 text-slate-400" />;
          const label = ACTION_LABELS[log.action] || log.action;
          const performer = getUserName(log.performedBy);
          const target = log.targetUser ? getUserName(log.targetUser) : null;
          const details = formatMetadata(log);

          return (
            <li key={log.id}>
              <div className="relative pb-8">
                {logIdx !== auditLogs.length - 1 ? (
                  <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-slate-800" aria-hidden="true" />
                ) : null}
                <div className="relative flex space-x-3">
                  <div>
                    <span className="h-8 w-8 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center">
                      {icon}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0 pt-1.5 flex justify-between space-x-4">
                    <div>
                      <p className="text-sm text-slate-300">
                        <span className="font-semibold text-slate-100">{performer}</span>{' '}
                        {label.toLowerCase() === 'member left' ? 'left the group' : `${label.toLowerCase()} `}
                        {target && (
                          <span className="font-semibold text-slate-100">{target}</span>
                        )}
                      </p>
                      {details && (
                        <p className="text-xs text-slate-400 mt-1 bg-slate-900/60 inline-block px-2.5 py-1 rounded-md border border-slate-850">
                          {details}
                        </p>
                      )}
                    </div>
                    <div className="text-right text-xs whitespace-nowrap text-slate-500 flex items-center space-x-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{new Date(log.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default AdminActionHistory;
