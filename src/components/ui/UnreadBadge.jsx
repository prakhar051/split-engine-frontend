import React from 'react';

const UnreadBadge = ({ count, className = '' }) => {
  if (!count || count <= 0) return null;

  return (
    <span
      className={`inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-red-500 rounded-full shadow-[0_0_8px_rgba(239,68,68,0.6)] animate-pulse ${className}`}
    >
      {count > 99 ? '99+' : count}
    </span>
  );
};

export default UnreadBadge;
