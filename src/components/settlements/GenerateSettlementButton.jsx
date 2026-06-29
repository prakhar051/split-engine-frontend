import { useState } from 'react';
import { Sparkles, RefreshCw } from 'lucide-react';

export default function GenerateSettlementButton({ groupId, onGenerate, isLoading }) {
  const [successMsg, setSuccessMsg] = useState(false);

  const handleGenerateClick = async () => {
    try {
      await onGenerate(groupId);
      setSuccessMsg(true);
      setTimeout(() => setSuccessMsg(false), 3000);
    } catch (err) {
      console.error('Failed to generate settlements:', err);
    }
  };

  return (
    <div className="flex flex-col items-stretch sm:items-end space-y-2">
      <button
        onClick={handleGenerateClick}
        disabled={isLoading}
        className="flex items-center justify-center space-x-2 py-3 px-5 bg-gradient-to-tr from-violet-600 to-indigo-650 hover:from-violet-500 hover:to-indigo-550 disabled:opacity-50 text-white text-sm font-bold rounded-xl transition duration-200 shadow-md shadow-indigo-500/10 cursor-pointer w-full sm:w-auto"
      >
        {isLoading ? (
          <>
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span>Calculating Debts...</span>
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4 text-indigo-200" />
            <span>Optimize Settlements</span>
          </>
        )}
      </button>
      {successMsg && (
        <span className="text-[10px] text-emerald-400 font-semibold uppercase tracking-wider text-center sm:text-right">
          ✓ Recalculated and optimized successfully!
        </span>
      )}
    </div>
  );
}
