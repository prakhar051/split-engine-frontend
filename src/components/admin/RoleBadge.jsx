import React from 'react';

const RoleBadge = ({ role, isBanned }) => {
  if (isBanned) {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
        BANNED
      </span>
    );
  }

  switch (role) {
    case 'OWNER':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
          OWNER
        </span>
      );
    case 'ADMIN':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          ADMIN
        </span>
      );
    case 'MEMBER':
    default:
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-500/10 text-slate-400 border border-slate-500/20">
          MEMBER
        </span>
      );
  }
};

export default RoleBadge;
