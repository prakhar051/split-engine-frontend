import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { useProfileStore } from '../store/profileStore';
import ProfileCard from '../components/profile/ProfileCard';
import AvatarUploader from '../components/profile/AvatarUploader';
import { 
  User, Mail, Lock, ShieldAlert, Monitor, Smartphone, Globe, 
  Trash2, ShieldCheck, AlertTriangle, Loader2, KeyRound 
} from 'lucide-react';

export default function ProfileSettingsPage() {
  const currentUser = useAuthStore((state) => state.user);
  const { 
    updateSettings, deleteAccount, fetchSessions, revokeSession, 
    sessions, logout, logoutAllDevices, isLoading: authLoading 
  } = useAuthStore();

  const {
    profile,
    isLoading: profileLoading,
    error: profileError,
    getProfile,
    uploadAvatar,
    removeAvatar
  } = useProfileStore();

  // Profile forms state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Feedback states
  const [profileSuccess, setProfileSuccess] = useState('');
  const [securitySuccess, setSecuritySuccess] = useState('');
  const [formError, setFormError] = useState('');

  // Modals / Confirmation gates
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('');
  
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    getProfile(true);
    fetchSessions();
  }, [getProfile, fetchSessions]);

  useEffect(() => {
    const activeUser = profile || currentUser;
    if (activeUser) {
      setName(activeUser.name || '');
      setEmail(activeUser.email || '');
    }
  }, [profile, currentUser]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setFormError('');
    setProfileSuccess('');

    if (!name.trim()) {
      setFormError('Name is required.');
      return;
    }

    try {
      const activeUser = profile || currentUser;
      const data = {};
      if (name.trim() !== activeUser.name) data.name = name.trim();
      if (email.trim() !== activeUser.email) data.email = email.trim().toLowerCase();

      if (Object.keys(data).length === 0) {
        setProfileSuccess('No changes to save.');
        return;
      }

      const res = await updateSettings(data);
      if (data.email) {
        setProfileSuccess(res.message || 'Settings updated. Please check your new email for a verification link.');
      } else {
        setProfileSuccess('Profile details updated successfully.');
      }
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to update profile.');
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    setFormError('');
    setSecuritySuccess('');

    if (!currentPassword) {
      setFormError('Current password is required to set a new password.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setFormError('New passwords do not match.');
      return;
    }

    if (newPassword.length < 8) {
      setFormError('New password must be at least 8 characters long.');
      return;
    }

    // Complexity checks
    if (!/[A-Z]/.test(newPassword) || !/[a-z]/.test(newPassword) || !/[0-9]/.test(newPassword) || !/[^a-zA-Z0-9]/.test(newPassword)) {
      setFormError('Password must contain uppercase, lowercase, numbers, and special characters.');
      return;
    }

    try {
      await updateSettings({ currentPassword, newPassword });
      setSecuritySuccess('Password updated successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to update password.');
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmationText !== 'delete my account') {
      return;
    }

    try {
      await deleteAccount();
      navigate('/login');
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to delete account.');
      setShowDeleteModal(false);
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

  const activeUser = profile || currentUser;
  const isLoading = profileLoading || authLoading;

  return (
    <div className="max-w-4xl mx-auto space-y-8 font-sans text-slate-200">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black tracking-tight text-white">Profile Settings</h1>
        <p className="text-slate-400 text-sm mt-1">
          Configure profile details, manage authentication sessions, and customize security.
        </p>
      </div>

      {/* Global Alerts */}
      {(profileError || formError) && (
        <div className="p-4 bg-rose-950/20 border border-rose-900/50 text-rose-300 rounded-xl text-xs font-semibold flex items-center space-x-2 animate-fadeIn">
          <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500" />
          <span>{formError || profileError}</span>
        </div>
      )}
      {profileSuccess && (
        <div className="p-4 bg-emerald-950/20 border border-emerald-900/50 text-emerald-300 rounded-xl text-xs font-semibold flex items-center space-x-2 animate-fadeIn">
          <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-500" />
          <span>{profileSuccess}</span>
        </div>
      )}

      {/* Layout Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Avatar & Quick Info */}
        <div className="md:col-span-1 space-y-6">
          <ProfileCard user={activeUser} />

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
                className="flex items-center space-x-1.5 py-2 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition shadow-md shadow-indigo-500/10 disabled:opacity-50"
              >
                {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />}
                <span>Upload Picture</span>
              </button>
            </div>
          )}
        </div>

        {/* Right Column: Actions Forms */}
        <div className="md:col-span-2 space-y-6">
          {/* Profile Name & Email Form */}
          <form onSubmit={handleProfileUpdate} className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-2xl p-6 shadow-md space-y-5">
            <div>
              <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center space-x-2">
                <User className="w-4 h-4 text-violet-400" />
                <span>Profile Information</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">Update your name or start the email change process.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-400">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={isLoading}
                    className="w-full pl-11 pr-4 py-2.5 bg-slate-950/50 border border-slate-850 focus:border-indigo-500 rounded-xl text-slate-200 text-sm focus:outline-none transition duration-150"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-400">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                    className="w-full pl-11 pr-4 py-2.5 bg-slate-950/50 border border-slate-850 focus:border-indigo-500 rounded-xl text-slate-200 text-sm focus:outline-none transition duration-150"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="flex items-center space-x-1.5 py-2 px-5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white rounded-xl text-xs font-bold transition shadow-md shadow-indigo-500/10"
              >
                {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />}
                <span>Save Profile Info</span>
              </button>
            </div>
          </form>

          {/* Change Password Form */}
          <form onSubmit={handlePasswordUpdate} className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-2xl p-6 shadow-md space-y-5">
            <div>
              <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center space-x-2">
                <KeyRound className="w-4 h-4 text-amber-400" />
                <span>Update Password</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">Set a secure password for account login protection.</p>
            </div>

            {securitySuccess && (
              <div className="p-3 bg-emerald-950/20 border border-emerald-900/50 text-emerald-300 rounded-xl text-xs font-semibold">
                {securitySuccess}
              </div>
            )}

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-400">Current Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••"
                    disabled={isLoading}
                    className="w-full pl-11 pr-4 py-2.5 bg-slate-950/50 border border-slate-850 focus:border-indigo-500 rounded-xl text-slate-200 text-sm focus:outline-none transition duration-150"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-400">New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      disabled={isLoading}
                      className="w-full pl-11 pr-4 py-2.5 bg-slate-950/50 border border-slate-850 focus:border-indigo-500 rounded-xl text-slate-200 text-sm focus:outline-none transition duration-150"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-400">Confirm New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      disabled={isLoading}
                      className="w-full pl-11 pr-4 py-2.5 bg-slate-950/50 border border-slate-850 focus:border-indigo-500 rounded-xl text-slate-200 text-sm focus:outline-none transition duration-150"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="flex items-center space-x-1.5 py-2 px-5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white rounded-xl text-xs font-bold transition shadow-md shadow-indigo-500/10"
              >
                {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />}
                <span>Change Password</span>
              </button>
            </div>
          </form>

          {/* Active Devices / Sessions List */}
          <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-2xl p-6 shadow-md space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center space-x-2">
                  <ShieldAlert className="w-4 h-4 text-rose-500" />
                  <span>Connected Sessions</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">Review and revoke active login sessions on your devices.</p>
              </div>
              <button
                type="button"
                onClick={logoutAllDevices}
                disabled={isLoading}
                className="py-1.5 px-3 bg-rose-950/20 hover:bg-rose-900/30 text-rose-400 border border-rose-900/30 hover:border-rose-800/40 rounded-xl text-[11px] font-bold transition"
              >
                Revoke All
              </button>
            </div>

            <div className="divide-y divide-slate-800/60">
              {sessions.map((sess) => {
                const isMobile = sess.os?.toLowerCase().includes('ios') || sess.os?.toLowerCase().includes('android');
                
                return (
                  <div key={sess.id} className="py-4 flex justify-between items-center first:pt-0 last:pb-0">
                    <div className="flex items-center space-x-3.5">
                      <div className="p-2.5 bg-slate-950/60 border border-slate-800 rounded-xl text-slate-400">
                        {isMobile ? <Smartphone className="w-5 h-5 text-indigo-400" /> : <Monitor className="w-5 h-5 text-indigo-400" />}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-bold text-slate-200">{sess.os || 'Unknown OS'} • {sess.browser || 'Browser'}</span>
                          {sess.id === activeUser?.currentSessionId && (
                            <span className="bg-emerald-950/40 text-emerald-400 border border-emerald-900/50 rounded-full px-2 py-0.5 text-[9px] font-bold">This Device</span>
                          )}
                        </div>
                        <div className="flex items-center space-x-2 text-[10px] text-slate-400 mt-0.5">
                          <Globe className="w-3 h-3 text-slate-500" />
                          <span>IP: {sess.ipAddress || 'Unknown'}</span>
                          <span>•</span>
                          <span>Last active: {new Date(sess.updatedAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    {sess.id !== activeUser?.currentSessionId && (
                      <button
                        type="button"
                        onClick={() => revokeSession(sess.id)}
                        disabled={isLoading}
                        className="p-2 hover:bg-rose-950/20 text-slate-500 hover:text-rose-400 rounded-xl transition duration-150"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                );
              })}

              {sessions.length === 0 && (
                <div className="text-center py-6 text-slate-500 text-xs">
                  No other active sessions detected.
                </div>
              )}
            </div>
          </div>

          {/* Danger Zone: Account Deletion */}
          <div className="bg-slate-900/60 backdrop-blur-md border border-rose-950/30 rounded-2xl p-6 shadow-md space-y-4">
            <div>
              <h3 className="text-sm font-bold text-rose-400 uppercase tracking-wider flex items-center space-x-2">
                <Trash2 className="w-4 h-4 text-rose-500" />
                <span>Danger Zone</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">Permanently remove your account and all associated split groups.</p>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteModal(true)}
                className="py-2.5 px-4 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition shadow-md shadow-rose-600/10 cursor-pointer"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Account Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-6 shadow-2xl">
            <div className="text-center space-y-3">
              <div className="w-12 h-12 bg-rose-950/30 border border-rose-900/50 rounded-full flex items-center justify-center mx-auto text-rose-400">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Delete Account Permanently?</h3>
              <p className="text-slate-300 text-xs leading-relaxed">
                This action is irreversible. All of your created groups, expenses, settlements, and sessions will be permanently deleted.
              </p>
            </div>

            <div className="space-y-3">
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Type "delete my account" to confirm:
              </label>
              <input
                type="text"
                value={deleteConfirmationText}
                onChange={(e) => setDeleteConfirmationText(e.target.value)}
                placeholder="delete my account"
                className="w-full px-4 py-2.5 bg-slate-950/60 border border-slate-850 focus:border-rose-500 rounded-xl text-slate-200 text-sm focus:outline-none transition"
              />
            </div>

            <div className="flex space-x-3">
              <button
                type="button"
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteConfirmationText('');
                }}
                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={deleteConfirmationText !== 'delete my account'}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition shadow-md shadow-rose-600/10 cursor-pointer disabled:cursor-not-allowed"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
