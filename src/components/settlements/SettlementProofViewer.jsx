import { useState } from 'react';
import { ExternalLink, ZoomIn, ZoomOut, Maximize2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function SettlementProofViewer({ proofUrl }) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);

  if (!proofUrl) return null;

  return (
    <div className="space-y-3">
      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
        Payment Proof
      </span>

      {/* Mini preview card */}
      <div className="relative group bg-slate-950 border border-slate-850 rounded-2xl overflow-hidden aspect-video flex items-center justify-center">
        <img
          src={proofUrl}
          alt="Proof of Payment"
          className="w-full h-full object-cover group-hover:scale-[1.02] transition duration-200"
        />

        <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition duration-200 space-x-3">
          <button
            onClick={() => setIsFullscreen(true)}
            className="p-2 rounded-xl bg-slate-900 border border-slate-750 text-slate-200 hover:text-white transition cursor-pointer"
            title="Fullscreen Modal"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
          <a
            href={proofUrl}
            target="_blank"
            rel="noreferrer"
            className="p-2 rounded-xl bg-slate-900 border border-slate-750 text-slate-200 hover:text-white transition"
            title="Open in new tab"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>

      {/* Fullscreen Overlay Modal */}
      <AnimatePresence>
        {isFullscreen && (
          <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950/95 p-4 md:p-8">
            {/* Modal Controls Bar */}
            <div className="w-full max-w-4xl flex justify-between items-center pb-4 text-slate-450 z-10">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Proof Receipt Screenshot</span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setIsZoomed(!isZoomed)}
                  className="p-2 rounded-xl hover:bg-slate-900 hover:text-white transition cursor-pointer"
                  title="Toggle Zoom"
                >
                  {isZoomed ? <ZoomOut className="w-5 h-5" /> : <ZoomIn className="w-5 h-5" />}
                </button>
                <a
                  href={proofUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 rounded-xl hover:bg-slate-900 hover:text-white transition"
                  title="Open in new tab"
                >
                  <ExternalLink className="w-5 h-5" />
                </a>
                <button
                  onClick={() => {
                    setIsFullscreen(false);
                    setIsZoomed(false);
                  }}
                  className="p-2 rounded-xl hover:bg-slate-900 hover:text-white transition cursor-pointer"
                  title="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Image container */}
            <div className="relative w-full max-w-4xl flex-grow overflow-auto flex items-center justify-center">
              <motion.img
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                src={proofUrl}
                alt="Proof Fullscreen"
                className={`max-w-full max-h-[80vh] rounded-xl object-contain transition duration-200 ${
                  isZoomed ? 'scale-150 cursor-zoom-out' : 'cursor-zoom-in'
                }`}
                onClick={() => setIsZoomed(!isZoomed)}
              />
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
