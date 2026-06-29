import { useState, useRef } from 'react';
import { Upload, X, FileImage, AlertCircle } from 'lucide-react';

const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_SIZE = 5 * 1024 * 1024; // 5 MB

export default function OCRUploader({ onSelectFile, onRemoveFile, selectedFile, disabled }) {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const fileInputRef = useRef(null);

  const validateAndProcessFile = (file) => {
    setError(null);

    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      setError('Invalid file type. Only JPEG, JPG, PNG, and WEBP images are supported.');
      return;
    }

    if (file.size > MAX_SIZE) {
      setError('File is too large. Maximum size allowed is 5 MB.');
      return;
    }

    // Create a local object URL for preview
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    onSelectFile(file);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (disabled) return;

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
    if (disabled) return;

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndProcessFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (disabled) return;

    if (e.target.files && e.target.files[0]) {
      validateAndProcessFile(e.target.files[0]);
    }
  };

  const handleRemove = () => {
    if (disabled) return;
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setError(null);
    onRemoveFile();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const triggerInput = () => {
    if (disabled) return;
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4 w-full font-sans">
      {error && (
        <div className="flex items-center space-x-2 p-3.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-xs">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {!selectedFile ? (
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={triggerInput}
          className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 ${
            dragActive
              ? 'border-indigo-500 bg-indigo-500/5'
              : 'border-slate-800 hover:border-slate-700 bg-slate-900/20 hover:bg-slate-900/30'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".jpg,.jpeg,.png,.webp"
            onChange={handleChange}
            className="hidden"
            disabled={disabled}
          />
          <Upload className="w-10 h-10 text-slate-500 mb-3" />
          <p className="text-sm font-bold text-slate-300">Drag and drop your receipt image here</p>
          <p className="text-xs text-slate-500 mt-1">or click to browse files</p>
          <p className="text-[10px] text-slate-600 mt-3 uppercase tracking-wider">
            JPG, JPEG, PNG, WEBP • Max 5 MB
          </p>
        </div>
      ) : (
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-4 flex flex-col items-center space-y-4 relative overflow-hidden">
          {previewUrl && (
            <div className="w-full max-h-64 rounded-xl overflow-hidden border border-slate-800/80 bg-slate-950 flex items-center justify-center relative group">
              <img src={previewUrl} alt="Receipt Preview" className="max-h-64 object-contain" />
              <button
                onClick={handleRemove}
                disabled={disabled}
                className="absolute top-3 right-3 p-2 bg-slate-950/80 hover:bg-slate-900 border border-slate-800 text-slate-400 hover:text-white rounded-xl shadow-lg transition cursor-pointer disabled:opacity-50"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          <div className="flex items-center space-x-3 w-full px-1">
            <FileImage className="w-8 h-8 text-indigo-400 shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-slate-200 truncate">{selectedFile.name}</p>
              <p className="text-xs text-slate-500">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
