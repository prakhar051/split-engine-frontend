import { useState, useRef } from 'react';
import { Upload, FileImage, X, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function SettlementProofUploader({
  settlementId,
  onUpload,
  isLoading,
  uploadProgress = 0
}) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [localError, setLocalError] = useState(null);
  const fileInputRef = useRef(null);

  const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  const MAX_SIZE = 5 * 1024 * 1024; // 5 MB

  const validateFile = (file) => {
    setLocalError(null);
    if (!file) return false;

    if (!ALLOWED_TYPES.includes(file.type)) {
      setLocalError('Invalid format. Only JPG, JPEG, PNG, and WEBP are allowed.');
      return false;
    }

    if (file.size > MAX_SIZE) {
      setLocalError('File is too large. Max size is 5MB.');
      return false;
    }

    return true;
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (validateFile(file)) {
        setSelectedFile(file);
      }
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (validateFile(file)) {
        setSelectedFile(file);
      }
    }
  };

  const handleUploadClick = async () => {
    if (!selectedFile) return;
    try {
      await onUpload(settlementId, selectedFile);
      setSelectedFile(null);
    } catch (err) {
      console.error('Failed to upload proof:', err);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="block text-sm font-bold text-slate-200">Upload Screenshot Proof</label>
        
        {localError && (
          <div className="p-3 bg-rose-950/20 border border-rose-900/50 rounded-xl text-rose-455 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{localError}</span>
          </div>
        )}

        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-5 flex flex-col items-center justify-center text-center cursor-pointer transition duration-200 ${
            dragActive
              ? 'border-indigo-500 bg-indigo-500/5'
              : 'border-slate-800 bg-slate-900/10 hover:border-slate-700 hover:bg-slate-900/25'
          }`}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileInput}
            accept="image/jpeg,image/jpg,image/png,image/webp"
            className="hidden"
          />
          <Upload className="w-5 h-5 text-slate-500 mb-2" />
          <p className="text-xs font-semibold text-slate-350">
            Drag & drop receipt image, or <span className="text-indigo-400">browse files</span>
          </p>
          <p className="text-[9px] text-slate-550 mt-1">
            JPG, JPEG, PNG, or WEBP up to 5MB.
          </p>
        </div>
      </div>

      {/* Selected file preview */}
      {selectedFile && (
        <div className="p-3 bg-slate-950 border border-slate-850 rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 min-w-0">
              <FileImage className="w-4 h-4 text-slate-400 shrink-0" />
              <span className="text-xs font-semibold text-slate-300 truncate">{selectedFile.name}</span>
            </div>
            <button
              onClick={() => setSelectedFile(null)}
              className="text-slate-500 hover:text-slate-350 transition p-0.5"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {isLoading && uploadProgress > 0 && (
            <div className="space-y-1">
              <div className="flex justify-between text-[9px] text-slate-550 font-bold">
                <span>Uploading...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-slate-900 rounded-full h-1 overflow-hidden">
                <div
                  className="bg-indigo-500 h-1 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            </div>
          )}

          <button
            onClick={handleUploadClick}
            disabled={isLoading}
            className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold rounded-lg transition cursor-pointer"
          >
            {isLoading ? 'Uploading...' : 'Submit Payment Proof'}
          </button>
        </div>
      )}
    </div>
  );
}
