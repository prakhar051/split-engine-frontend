import { useState, useRef } from 'react';
import { Upload, X, Trash2, FileImage, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AttachmentUploader({
  expenseId,
  attachments = [],
  onUpload,
  onDelete,
  isLoading,
  uploadProgress = 0,
  currentUserId,
  groupOwnerId
}) {
  const [dragActive, setDragActive] = useState(false);
  const [queuedFiles, setQueuedFiles] = useState([]);
  const [localError, setLocalError] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null); // stores attachment to delete
  const fileInputRef = useRef(null);

  // File Validation Rules
  const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  const MAX_SIZE = 5 * 1024 * 1024; // 5 MB

  const validateFiles = (files) => {
    setLocalError(null);
    const valid = [];
    const currentQueuedCount = queuedFiles.length;
    const currentUploadedCount = attachments.length;

    if (currentQueuedCount + currentUploadedCount + files.length > 5) {
      setLocalError('You can upload a maximum of 5 receipts in total.');
      return [];
    }

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      if (!ALLOWED_TYPES.includes(file.type)) {
        setLocalError(`Unsupported file format: ${file.name}. Only JPG, JPEG, PNG, and WEBP are allowed.`);
        return [];
      }

      if (file.size > MAX_SIZE) {
        setLocalError(`File too large: ${file.name}. Max size is 5MB.`);
        return [];
      }

      valid.push(file);
    }
    return valid;
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
      const files = validateFiles(e.dataTransfer.files);
      if (files.length > 0) {
        setQueuedFiles((prev) => [...prev, ...files]);
      }
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = validateFiles(e.target.files);
      if (files.length > 0) {
        setQueuedFiles((prev) => [...prev, ...files]);
      }
    }
  };

  const handleRemoveQueued = (index) => {
    setQueuedFiles((prev) => prev.filter((_, idx) => idx !== index));
    setLocalError(null);
  };

  const handleUploadSubmit = async () => {
    if (queuedFiles.length === 0) return;
    try {
      await onUpload(expenseId, queuedFiles);
      setQueuedFiles([]);
    } catch (err) {
      console.error('Failed to upload receipts:', err);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await onDelete(expenseId, deleteTarget.id);
      setDeleteTarget(null);
    } catch (err) {
      console.error('Failed to delete attachment:', err);
    }
  };

  // Check delete authorization: attachment uploader OR group owner
  const canDelete = (attachment) => {
    return attachment.uploadedById === currentUserId || currentUserId === groupOwnerId;
  };

  return (
    <div className="space-y-6">
      {/* Upload Zone */}
      <div className="space-y-2">
        <label className="block text-sm font-bold text-slate-200">Upload Receipt Attachments</label>
        
        {localError && (
          <div className="p-3 bg-rose-950/20 border border-rose-900/50 rounded-xl text-rose-400 text-xs flex items-center space-x-2">
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
          className={`border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition duration-200 ${
            dragActive
              ? 'border-indigo-500 bg-indigo-500/5'
              : 'border-slate-800 bg-slate-900/10 hover:border-slate-700 hover:bg-slate-900/25'
          }`}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileInput}
            multiple
            accept="image/jpeg,image/jpg,image/png,image/webp"
            className="hidden"
          />
          <div className="w-10 h-10 rounded-full bg-slate-900 border border-slate-850 flex items-center justify-center mb-3 text-slate-500 shadow-sm">
            <Upload className="w-5 h-5" />
          </div>
          <p className="text-sm font-semibold text-slate-350">
            Drag & drop receipts here, or <span className="text-indigo-400">browse files</span>
          </p>
          <p className="text-[10px] text-slate-500 mt-1">
            Supports JPG, PNG, WEBP. Max 5MB per file. (Up to 5 files total)
          </p>
        </div>
      </div>

      {/* Local Queue List */}
      {queuedFiles.length > 0 && (
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-4 shadow-inner">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Files to Upload ({queuedFiles.length})
            </span>
            <button
              onClick={() => setQueuedFiles([])}
              className="text-xs text-slate-500 hover:text-slate-300 transition"
            >
              Clear Queue
            </button>
          </div>

          <div className="space-y-2">
            {queuedFiles.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 bg-slate-955/80 border border-slate-850 rounded-xl"
              >
                <div className="flex items-center space-x-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400">
                    <FileImage className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-300 truncate">{file.name}</p>
                    <p className="text-[9px] text-slate-550">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                  </div>
                </div>
                <button
                  onClick={() => handleRemoveQueued(index)}
                  className="p-1 rounded-md text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Upload Progress Bar */}
          {isLoading && uploadProgress > 0 && (
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] text-slate-500 font-bold">
                <span>Uploading...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-indigo-500 h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            </div>
          )}

          <button
            onClick={handleUploadSubmit}
            disabled={isLoading}
            className="w-full flex items-center justify-center space-x-2 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-md"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <span>Upload Receipts</span>
            )}
          </button>
        </div>
      )}

      {/* Uploaded Gallery */}
      {attachments.length > 0 && (
        <div className="space-y-3">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
            Receipt Attachments ({attachments.length})
          </span>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {attachments.map((att) => (
              <div
                key={att.id}
                className="group relative bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-md hover:border-slate-700 transition duration-200 aspect-square flex items-center justify-center"
              >
                <img
                  src={att.fileUrl}
                  alt="Receipt Preview"
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                />

                {/* Overlays / delete action */}
                <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition duration-200 space-x-2">
                  <a
                    href={att.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 rounded-lg bg-slate-900/80 border border-slate-700 hover:border-white text-slate-200 text-xs font-semibold"
                  >
                    View Full
                  </a>
                  {canDelete(att) && (
                    <button
                      onClick={() => setDeleteTarget(att)}
                      className="p-1.5 rounded-lg bg-rose-600/90 text-white hover:bg-rose-500 transition cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Deletion Confirmation Modal */}
      <AnimatePresence>
        {deleteTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-2xl"
            >
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-white">Delete Attachment?</h3>
                <p className="text-sm text-slate-400">
                  Are you sure you want to permanently delete this receipt? This action cannot be undone.
                </p>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setDeleteTarget(null)}
                  className="flex-1 py-2.5 bg-slate-950 border border-slate-850 hover:bg-slate-850 text-slate-400 hover:text-white rounded-xl text-sm font-semibold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  disabled={isLoading}
                  className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white rounded-xl text-sm font-semibold transition cursor-pointer"
                >
                  {isLoading ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
