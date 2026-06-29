import { motion } from 'framer-motion';

export default function OCRProgress({ progress, stage }) {
  // Ensure progress is bounded
  const cleanProgress = Math.min(100, Math.max(0, progress));

  return (
    <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4 font-sans w-full">
      <div className="flex justify-between items-center text-sm">
        <span className="font-bold text-slate-350">{stage || 'Analyzing Receipt...'}</span>
        <span className="font-black text-indigo-400">{cleanProgress}%</span>
      </div>

      {/* Progress Bar Container */}
      <div className="h-2.5 w-full bg-slate-950 border border-slate-800/80 rounded-full overflow-hidden relative">
        <motion.div
          initial={{ width: '0%' }}
          animate={{ width: `${cleanProgress}%` }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="h-full bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-500 rounded-full shadow-[0_0_8px_rgba(99,102,241,0.5)]"
        />
      </div>

      {/* Micro Status Updates */}
      <p className="text-[10px] text-slate-500 italic text-center">
        {cleanProgress < 30 && 'Preparing optical character recognition engine...'}
        {cleanProgress >= 30 && cleanProgress < 70 && 'Reading image pixels and preprocessing lines...'}
        {cleanProgress >= 70 && cleanProgress < 95 && 'Decoding layout and localized characters...'}
        {cleanProgress >= 95 && cleanProgress < 100 && 'Running heuristic receipt parser regex algorithms...'}
        {cleanProgress === 100 && 'Analysis complete!'}
      </p>
    </div>
  );
}
