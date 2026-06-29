import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShieldAlert, Cpu } from 'lucide-react';
import { useExpenseStore } from '../../store/expenseStore';
import OCRUploader from './OCRUploader';
import OCRProgress from './OCRProgress';
import OCRResultPreview from './OCRResultPreview';

export default function OCRScannerModal({ isOpen, onClose, onApply }) {
  const {
    ocrLoading,
    ocrProgress,
    ocrLoadingStage,
    ocrResult,
    scanReceipt,
    clearOCR
  } = useExpenseStore();

  const [selectedFile, setSelectedFile] = useState(null);
  const [editedResult, setEditedResult] = useState(null);

  // Clear store OCR state when modal opens
  useEffect(() => {
    if (isOpen) {
      clearOCR();
      setSelectedFile(null);
      setEditedResult(null);
    }
  }, [isOpen, clearOCR]);

  // Keep local edited result in sync with store's parsed result when scan completes
  useEffect(() => {
    if (ocrResult) {
      setEditedResult({ ...ocrResult });
    }
  }, [ocrResult]);

  const handleSelectFile = (file) => {
    setSelectedFile(file);
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    clearOCR();
    setEditedResult(null);
  };

  const handleStartScan = async () => {
    if (!selectedFile) return;
    try {
      await scanReceipt(selectedFile);
    } catch (err) {
      console.error('Scan failed:', err);
    }
  };

  const handleChangeField = (field, value) => {
    setEditedResult((prev) => {
      if (!prev) return null;
      const updated = {
        ...prev,
        [field]: value
      };
      // If merchant is updated, update suggested title too if they are equal
      if (field === 'merchant' && prev.title === prev.merchant) {
        updated.title = value;
      }
      return updated;
    });
  };

  const handleApply = () => {
    if (onApply && editedResult) {
      onApply(editedResult);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl flex flex-col max-h-[90vh] my-8 overflow-hidden font-sans">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-850 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 rounded-xl">
              <Cpu className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-lg font-black tracking-tight text-white">Scan Receipt</h3>
              <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mt-0.5">
                Local Client-side OCR Reader
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={ocrLoading}
            className="p-2 bg-slate-950/40 hover:bg-slate-850 border border-slate-800 text-slate-400 hover:text-white rounded-xl transition duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body (Scrollable) */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 scrollbar-thin scrollbar-thumb-slate-800">
          {!ocrResult && !ocrLoading && (
            <div className="space-y-4">
              <OCRUploader
                selectedFile={selectedFile}
                onSelectFile={handleSelectFile}
                onRemoveFile={handleRemoveFile}
                disabled={ocrLoading}
              />
            </div>
          )}

          {ocrLoading && (
            <OCRProgress progress={ocrProgress} stage={ocrLoadingStage} />
          )}

          {ocrResult && editedResult && !ocrLoading && (
            <OCRResultPreview result={editedResult} onChangeField={handleChangeField} />
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-950/40 border-t border-slate-850 flex items-center justify-end space-x-3 shrink-0">
          {!ocrResult && !ocrLoading && (
            <>
              <button
                onClick={onClose}
                className="px-4 py-2.5 bg-slate-950 border border-slate-850 hover:bg-slate-850 text-slate-400 hover:text-white rounded-xl text-xs font-bold transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleStartScan}
                disabled={!selectedFile || ocrLoading}
                className="px-5 py-2.5 bg-indigo-650 hover:bg-indigo-600 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition cursor-pointer flex items-center space-x-1.5"
              >
                <span>Scan Receipt</span>
              </button>
            </>
          )}

          {ocrLoading && (
            <span className="text-xs font-medium text-slate-500 italic animate-pulse">
              Running client-side recognition engine...
            </span>
          )}

          {ocrResult && !ocrLoading && (
            <>
              <button
                onClick={() => {
                  clearOCR();
                  setSelectedFile(null);
                  setEditedResult(null);
                }}
                className="px-4 py-2.5 bg-slate-950 border border-slate-850 hover:bg-slate-850 text-slate-400 hover:text-white rounded-xl text-xs font-bold transition cursor-pointer"
              >
                Scan Another
              </button>
              <button
                onClick={handleApply}
                className="px-5 py-2.5 bg-indigo-650 hover:bg-indigo-600 text-white rounded-xl text-xs font-bold transition cursor-pointer"
              >
                Apply Extracted Fields
              </button>
            </>
          )}
        </div>

      </div>
    </div>
  );
}
