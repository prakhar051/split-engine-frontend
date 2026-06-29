import { useState } from 'react';
import { Play, HelpCircle, Check, X } from 'lucide-react';

export default function RunNowButton({ onRun, isLoading }) {
  const [isOpen, setIsOpen] = useState(false);
  const [advanceSchedule, setAdvanceSchedule] = useState(false);

  const handleConfirm = async () => {
    try {
      await onRun(advanceSchedule);
      setIsOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        disabled={isLoading}
        className="flex items-center space-x-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold rounded-lg transition cursor-pointer"
      >
        <Play className="w-3.5 h-3.5 fill-current" />
        <span>Run Now</span>
      </button>

      {/* Confirmation Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
          
          <div className="relative bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-sm w-full shadow-xl space-y-6">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-xl">
                <Play className="w-5 h-5 fill-current" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Manual Schedule Run</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Trigger expense generation immediately using this template's payload.
                </p>
              </div>
            </div>

            {/* Checkbox option */}
            <div
              onClick={() => setAdvanceSchedule(!advanceSchedule)}
              className="flex items-start gap-3 p-4 bg-slate-950/60 border border-slate-800 rounded-xl cursor-pointer hover:border-slate-700 transition"
            >
              <button
                type="button"
                className={`flex items-center justify-center w-5 h-5 rounded-md border transition shrink-0 ${
                  advanceSchedule ? 'bg-indigo-600 border-indigo-500 text-white' : 'border-slate-700 hover:border-slate-650'
                }`}
              >
                {advanceSchedule && <Check className="w-3.5 h-3.5" />}
              </button>
              <div className="space-y-0.5">
                <p className="text-xs font-bold text-slate-200">Run and advance schedule</p>
                <p className="text-[10px] text-slate-500 leading-relaxed">
                  Advances the template's scheduled execution date forward. Leave unchecked to generate an expense without changing future schedules.
                </p>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsOpen(false)}
                className="flex-1 py-2 px-4 bg-slate-950/40 hover:bg-slate-950/80 text-slate-400 hover:text-slate-200 text-xs font-bold border border-slate-850 rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                disabled={isLoading}
                className="flex-1 flex items-center justify-center space-x-1.5 py-2 px-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition cursor-pointer"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <span>Execute Run</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
