import { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Trash2 } from 'lucide-react';
import { useProfileStore } from '../../store/profileStore';

export default function AvatarUploader({ onAvatarSelect, onAvatarRemove, currentAvatarUrl }) {
  const { avatarPreview, uploadProgress, isLoading, setAvatarPreview } = useProfileStore();
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const displayAvatar = avatarPreview || currentAvatarUrl;

  const validateFile = (file) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      alert('Only JPEG, JPG, PNG, and WEBP image formats are supported.');
      return false;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size exceeds 5MB limit.');
      return false;
    }
    return true;
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (validateFile(file)) {
        setAvatarPreview(file);
        onAvatarSelect(file);
      }
    }
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

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (validateFile(file)) {
        setAvatarPreview(file);
        onAvatarSelect(file);
      }
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current.click();
  };

  const handleCancelPreview = () => {
    setAvatarPreview(null);
    onAvatarSelect(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRemoveAvatar = () => {
    setAvatarPreview(null);
    onAvatarRemove();
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-2xl p-6 shadow-md space-y-6">
      <div>
        <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center space-x-2">
          <ImageIcon className="w-4 h-4 text-violet-400" />
          <span>Profile Picture</span>
        </h3>
        <p className="text-xs text-slate-400 mt-1">Upload a JPG, PNG, or WEBP image. Max size 5MB.</p>
      </div>

      <div className="flex flex-col items-center sm:flex-row sm:space-x-6 space-y-4 sm:space-y-0">
        {/* Avatar Display Frame */}
        <div className="relative group shrink-0">
          {displayAvatar ? (
            <img
              src={displayAvatar}
              alt="Avatar Preview"
              className="w-24 h-24 rounded-full object-cover border-2 border-slate-700 shadow-md"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-violet-600 to-indigo-600 border-2 border-slate-850 flex items-center justify-center text-2xl font-bold text-white shadow-md">
              ?
            </div>
          )}

          {avatarPreview && (
            <button
              onClick={handleCancelPreview}
              type="button"
              className="absolute -top-1 -right-1 p-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 text-slate-300 hover:text-white rounded-full shadow-lg transition cursor-pointer"
              title="Cancel upload"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Drag and Drop Zone */}
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          className={`flex-grow w-full border-2 border-dashed rounded-xl p-5 flex flex-col items-center justify-center text-center transition duration-200 ${
            dragActive
              ? 'border-indigo-500 bg-indigo-950/10'
              : 'border-slate-800 hover:border-slate-700 bg-slate-950/20'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png, image/jpeg, image/jpg, image/webp"
            onChange={handleFileChange}
            className="hidden"
          />

          <Upload className="w-6 h-6 text-slate-500 mb-2" />
          <p className="text-xs text-slate-400 mb-1">
            Drag image here, or{' '}
            <button
              type="button"
              onClick={handleButtonClick}
              className="text-indigo-400 hover:text-indigo-300 font-semibold underline cursor-pointer"
            >
              browse
            </button>
          </p>
          <p className="text-[10px] text-slate-500">Supports JPG, PNG, WEBP up to 5MB</p>
        </div>
      </div>

      {/* Upload actions & progress bar */}
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="flex gap-2">
          {currentAvatarUrl && !avatarPreview && (
            <button
              type="button"
              onClick={handleRemoveAvatar}
              disabled={isLoading}
              className="flex items-center space-x-1.5 py-2 px-3.5 bg-rose-600/10 hover:bg-rose-600/20 border border-rose-500/20 text-rose-400 hover:text-rose-350 rounded-xl text-xs font-bold transition cursor-pointer disabled:opacity-50"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Remove Picture</span>
            </button>
          )}
        </div>

        {/* Progress Bar */}
        {isLoading && uploadProgress > 0 && uploadProgress < 100 && (
          <div className="w-full space-y-1.5 pt-2">
            <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              <span>Uploading avatar...</span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden border border-slate-850">
              <div
                className="bg-gradient-to-r from-violet-600 to-indigo-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
