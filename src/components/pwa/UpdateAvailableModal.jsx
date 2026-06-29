import React from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';

export default function UpdateAvailableModal() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      console.log('PWA Service Worker registered:', r);
    },
    onRegisterError(error) {
      console.error('PWA Service Worker registration failed:', error);
    }
  });

  if (!needRefresh) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-sm w-full shadow-2xl space-y-4">
        <h3 className="text-lg font-bold text-white">Update Available</h3>
        <p className="text-sm text-slate-400">
          A new version of the Expense Split Engine is available. Reload now to apply the updates.
        </p>
        <div className="flex gap-3 justify-end text-sm">
          <button
            onClick={() => setNeedRefresh(false)}
            className="px-4 py-2 border border-slate-700 text-slate-300 hover:text-white rounded-lg transition cursor-pointer"
          >
            Later
          </button>
          <button
            onClick={() => updateServiceWorker(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg transition shadow-md shadow-blue-900/30 cursor-pointer"
          >
            Reload Now
          </button>
        </div>
      </div>
    </div>
  );
}
