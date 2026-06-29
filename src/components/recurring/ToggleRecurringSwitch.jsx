import { useState } from 'react';

export default function ToggleRecurringSwitch({ isActive, onToggle, isLoading }) {
  return (
    <button
      onClick={() => !isLoading && onToggle(!isActive)}
      disabled={isLoading}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-900 ${
        isActive ? 'bg-indigo-600' : 'bg-slate-700'
      } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <span className="sr-only">Toggle recurring template schedule</span>
      <span
        aria-hidden="true"
        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
          isActive ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  );
}
