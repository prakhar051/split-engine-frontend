import { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import { Shield, Users, Calendar, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function InviteLandingPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore(state => !!state.user);
  
  const [inviteData, setInviteData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isJoining, setIsJoining] = useState(false);
  const [joinSuccess, setJoinSuccess] = useState(false);

  useEffect(() => {
    const fetchInviteDetails = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await axios.get(`${API_URL}/invitations/${token}`);
        setInviteData(response.data.invite);
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
    if (!isAuthenticated) {
      // Redirect to login, appending the current path as a redirectTo query param
      navigate(`/login?redirectTo=/invite/${token}`);
      return;
    }

    setIsJoining(true);
    setError(null);
    try {
      const response = await axios.post(`${API_URL}/invitations/${token}/join`, {}, {
        withCredentials: true
      });
      setJoinSuccess(true);
      setTimeout(() => {
        navigate(`/groups/${response.data.groupId}`);
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to join group.');
    } finally {
      setIsJoining(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return 'GP';
    return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center font-sans">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-400 text-sm font-medium">Loading invitation details...</p>
        </div>
      </div>
    );
  }

  if (error && !inviteData) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4 font-sans text-slate-200">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-3xl p-8 shadow-2xl text-center space-y-6"
        >
          <div className="w-14 h-14 bg-rose-950/20 border border-rose-900/50 text-rose-400 rounded-2xl flex items-center justify-center mx-auto mb-2">
            <AlertCircle className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black tracking-tight text-white">Invitation Invalid</h2>
            <p className="text-slate-400 text-sm leading-relaxed">{error}</p>
          </div>
          <button
            onClick={() => navigate('/')}
            className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-sm rounded-xl transition duration-200 cursor-pointer"
          >
            Go to Dashboard
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4 font-sans text-slate-200">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', damping: 20 }}
        className="w-full max-w-md bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-indigo-500/10 to-transparent rounded-full blur-xl pointer-events-none"></div>

        {/* Group Avatar Initials */}
        <div className="flex flex-col items-center text-center space-y-4 pt-4">
          <div className="w-20 h-20 bg-gradient-to-tr from-indigo-600 to-violet-600 rounded-3xl flex items-center justify-center font-black text-white text-3xl shadow-xl shadow-indigo-600/20 relative">
            <Sparkles className="absolute -top-1.5 -right-1.5 w-5 h-5 text-indigo-300 animate-pulse" />
            {getInitials(inviteData.groupName)}
          </div>
          <div className="space-y-1.5">
            <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest">You've been invited to join</p>
            <h2 className="text-2xl font-black text-white tracking-tight leading-none px-2">{inviteData.groupName}</h2>
          </div>
        </div>

        <hr className="border-slate-850" />

        {/* Invite Metadata Details */}
        <div className="bg-slate-950/30 border border-slate-850 rounded-2xl p-4 space-y-3.5 text-xs text-slate-400">
          <div className="flex items-center space-x-3">
            <Shield className="w-4.5 h-4.5 text-slate-500" />
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-bold tracking-wider">Group Owner</span>
              <span className="text-slate-200 font-semibold">{inviteData.inviterName}</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Users className="w-4.5 h-4.5 text-slate-500" />
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-bold tracking-wider">Member Count</span>
              <span className="text-slate-200 font-semibold">{inviteData.memberCount || 'Loading...'}</span>
            </div>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-rose-950/20 border border-rose-900/50 rounded-xl text-rose-400 text-xs flex items-center space-x-2.5">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Join button */}
        <div className="space-y-3">
          {joinSuccess ? (
            <div className="w-full py-3.5 bg-emerald-950/20 border border-emerald-900/50 text-emerald-400 font-bold text-sm rounded-xl flex items-center justify-center space-x-2">
              <CheckCircle2 className="w-5 h-5 animate-bounce" />
              <span>Successfully Joined! Redirecting...</span>
            </div>
          ) : (
            <button
              onClick={handleJoin}
              disabled={isJoining}
              className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-sm rounded-xl transition duration-200 cursor-pointer shadow-lg shadow-indigo-600/10 flex items-center justify-center space-x-2"
            >
              {isJoining ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <span>{isAuthenticated ? 'Join Group' : 'Log in to Join Group'}</span>
              )}
            </button>
          )}
          
          {!isAuthenticated && (
            <p className="text-center text-[10px] text-slate-500">
              New to SplitWise Pro? You will be able to register an account first.
            </p>
          )}
        </div>
      </motion.div>
    </div>
  );
}
