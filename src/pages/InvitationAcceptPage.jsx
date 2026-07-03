import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import { Users, Loader2, CheckCircle2, AlertTriangle, LogIn, UserPlus } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function InvitationAcceptPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  
  const { isAuthenticated, user: currentUser, accessToken } = useAuthStore();
  const [invite, setInvite] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [joinStatus, setJoinStatus] = useState('idle'); // 'idle' | 'joining' | 'success' | 'error'
  const [joinMessage, setJoinMessage] = useState('');

  useEffect(() => {
    const fetchInviteDetails = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`${API_URL}/invitations/${token}`);
        setInvite(response.data.invite);
      } catch (err) {
        setError(err.response?.data?.message || 'Invalid or expired invitation link.');
      } finally {
        setIsLoading(false);
      }
    };

    if (token) {
      fetchInviteDetails();
    }
  }, [token]);

  const handleJoin = async () => {
    if (!isAuthenticated || !accessToken) {
      navigate(`/login?redirect=/invitations/${token}`);
      return;
    }

    setJoinStatus('joining');
    setJoinMessage('');

    try {
      const response = await axios.post(
        `${API_URL}/groups/join`,
        { inviteCode: token },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      setJoinStatus('success');
      // Redirect to group details page after 1.5 seconds
      setTimeout(() => {
        navigate(`/groups/${response.data.groupId}`);
      }, 1500);
    } catch (err) {
      setJoinStatus('error');
      setJoinMessage(err.response?.data?.message || 'Failed to join group.');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center px-4 font-sans text-slate-200">
        <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mb-4" />
        <p className="text-slate-400 text-sm">Loading invitation details...</p>
      </div>
    );
  }

  if (error || !invite) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center px-4 font-sans text-slate-200">
        <div className="w-full max-w-md bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-2xl p-8 shadow-2xl text-center space-y-6">
          <div className="w-16 h-16 bg-rose-950/30 border border-rose-900/50 rounded-full flex items-center justify-center mx-auto text-rose-400">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-white">Invalid Invitation</h3>
          <p className="text-slate-300 text-sm">{error || 'This invitation is no longer valid.'}</p>
          <div className="pt-2">
            <Link
              to="/"
              className="inline-flex w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm rounded-xl transition duration-200 justify-center items-center shadow-md shadow-indigo-600/10"
            >
              Go to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isEmailMismatch = currentUser && invite.email && currentUser.email.toLowerCase() !== invite.email.toLowerCase();

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center px-4 py-12 font-sans text-slate-200">
      <div className="w-full max-w-md">
        {/* Logo Header */}
        <div className="text-center mb-8 flex flex-col items-center">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center font-bold text-white text-xl shadow-lg shadow-indigo-500/20 mb-3">
            $
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-white">Group Invitation</h2>
        </div>

        {/* Card */}
        <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-2xl p-8 shadow-2xl space-y-6">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-indigo-950/30 border border-indigo-900/50 rounded-full flex items-center justify-center mx-auto text-indigo-400">
              <Users className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Invitation Received</p>
              <h3 className="text-xl font-bold text-white">Join "{invite.groupName}"</h3>
              {invite.inviterName && (
                <p className="text-sm text-slate-300">Invited by <strong className="text-slate-100">{invite.inviterName}</strong></p>
              )}
            </div>
          </div>

          {/* Join status messages */}
          {joinMessage && (
            <div className="p-3.5 bg-rose-950/20 border border-rose-900/50 rounded-xl text-rose-300 text-sm flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <span>{joinMessage}</span>
            </div>
          )}

          {joinStatus === 'success' && (
            <div className="p-4 bg-emerald-950/20 border border-emerald-900/50 rounded-xl text-emerald-300 text-sm flex items-center space-x-2 justify-center">
              <CheckCircle2 className="w-5 h-5" />
              <span>Success! Redirecting you to the group...</span>
            </div>
          )}

          {/* Authenticated Flow */}
          {isAuthenticated ? (
            <div className="space-y-6">
              {isEmailMismatch && (
                <div className="p-4 bg-amber-950/20 border border-amber-900/50 rounded-xl text-amber-300 text-xs space-y-2">
                  <p className="font-semibold">Email mismatch warning:</p>
                  <p>This invite was sent to <strong className="text-slate-100">{invite.email}</strong>, but you are signed in as <strong className="text-slate-100">{currentUser.email}</strong>.</p>
                  <p>You can still join the group, or sign out to use a different account.</p>
                </div>
              )}

              <button
                onClick={handleJoin}
                disabled={joinStatus === 'joining' || joinStatus === 'success'}
                className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium text-sm rounded-xl transition duration-200 flex items-center justify-center space-x-2 cursor-pointer shadow-md shadow-indigo-600/10"
              >
                {joinStatus === 'joining' ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <span>Accept & Join Group</span>
                )}
              </button>
            </div>
          ) : (
            /* Unauthenticated Flow */
            <div className="space-y-6">
              <div className="p-4 bg-slate-950/50 border border-slate-800 rounded-xl text-slate-300 text-sm leading-relaxed text-center">
                {invite.isRegistered ? (
                  <p>An account is already registered with <strong className="text-slate-100">{invite.email}</strong>. Please sign in to accept this invitation.</p>
                ) : (
                  <p>Create a free account to join <strong className="text-slate-100">"{invite.groupName}"</strong> and start tracking shared expenses.</p>
                )}
              </div>

              <div className="flex flex-col space-y-3">
                {invite.isRegistered ? (
                  <Link
                    to={`/login?redirect=/invitations/${token}`}
                    className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm rounded-xl transition duration-200 flex items-center justify-center space-x-2 shadow-md shadow-indigo-600/10"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>Sign In to Accept</span>
                  </Link>
                ) : (
                  <>
                    <Link
                      to={`/register?email=${invite.email || ''}`}
                      className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm rounded-xl transition duration-200 flex items-center justify-center space-x-2 shadow-md shadow-indigo-600/10"
                    >
                      <UserPlus className="w-4 h-4" />
                      <span>Register to Join</span>
                    </Link>
                    <Link
                      to={`/login?redirect=/invitations/${token}`}
                      className="w-full py-3 px-4 bg-slate-800 hover:bg-slate-700 text-white font-medium text-sm rounded-xl transition duration-200 flex items-center justify-center space-x-2"
                    >
                      <LogIn className="w-4 h-4" />
                      <span>Sign In with Existing Account</span>
                    </Link>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
