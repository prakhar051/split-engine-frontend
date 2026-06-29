import { useEffect, useState } from 'react';
import { useProfileStore } from '../store/profileStore';
import { useAuthStore } from '../store/authStore';
import ProfileCard from '../components/profile/ProfileCard';
import ProfileForm from '../components/profile/ProfileForm';
import AvatarUploader from '../components/profile/AvatarUploader';
import SecurityCard from '../components/profile/SecurityCard';
import ErrorAlert from '../components/ui/ErrorAlert';
import { ShieldCheck, Loader2 } from 'lucide-react';

export default function ProfileSettingsPage() {
  const currentUser = useAuthStore((state) => state.user);
  const { logout, logoutAllDevices } = useAuthStore();
  
  const {
    profile,
    isLoading,
    error,
    getProfile,
    updateProfile,
    uploadAvatar,
    removeAvatar,
    clearState,
    updateSuccess
  } = useProfileStore();

  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    getProfile(true); // force fetch on mount to get fresh data
    return () => {
      clearState();
    };
  }, [getProfile, clearState]);

  const handleNameSubmit = async (newName) => {
    try {
      await updateProfile({ name: newName });
    } catch (err) {
      console.error(err);
    }
  };

  const handleAvatarSelect = (file) => {
    setSelectedFile(file);
  };

  const handleAvatarRemove = async () => {
    try {
      await removeAvatar();
      setSelectedFile(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveAvatar = async () => {
    if (!selectedFile) return;
    try {
      await uploadAvatar(selectedFile);
      setSelectedFile(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogoutAll = async () => {
    try {
      await logoutAllDevices();
    } catch (err) {
      console.error(err);
    }
  };

  // Sync profile details with authStore if they exist
  const activeUser = profile || currentUser;

  return (
    <div className="max-w-4xl mx-auto space-y-6 font-sans">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black tracking-tight text-white">Profile Settings</h1>
        <p className="text-slate-400 text-sm mt-1">
          Customize your public presence, upload avatars, and manage your account sessions.
        </p>
      </div>

      {/* Global Alerts */}
      {error && <ErrorAlert message={error} />}
      {updateSuccess && (
        <div className="p-4 bg-emerald-600/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-xs font-bold flex items-center space-x-2 animate-fadeIn">
          <ShieldCheck className="w-4 h-4 shrink-0" />
          <span>Profile changes saved successfully!</span>
        </div>
      )}

      {/* Layout Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Profile Card */}
        <div className="md:col-span-1">
          {isLoading && !activeUser ? (
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-8 flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
            </div>
          ) : (
            <ProfileCard user={activeUser} />
          )}
        </div>

        {/* Right Column: Actions Forms */}
        <div className="md:col-span-2 space-y-6">
          {/* Avatar Settings Zone */}
          <div className="space-y-4">
            <AvatarUploader
              onAvatarSelect={handleAvatarSelect}
              onAvatarRemove={handleAvatarRemove}
              currentAvatarUrl={activeUser?.avatar}
            />
            {selectedFile && (
              <div className="flex justify-end animate-fadeIn">
                <button
                  type="button"
                  onClick={handleSaveAvatar}
                  disabled={isLoading}
                  className="flex items-center space-x-1.5 py-2.5 px-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition cursor-pointer shadow-md shadow-indigo-500/10 disabled:opacity-50"
                >
                  <Loader2 className={`w-3.5 h-3.5 animate-spin mr-1.5 ${isLoading ? 'inline' : 'hidden'}`} />
                  <span>Upload Picture</span>
                </button>
              </div>
            )}
          </div>

          {/* Profile Name Form */}
          <ProfileForm
            initialName={activeUser?.name}
            onSubmit={handleNameSubmit}
            isLoading={isLoading}
          />

          {/* Security Sessions */}
          <SecurityCard
            onLogout={handleLogout}
            onLogoutAll={handleLogoutAll}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
}
