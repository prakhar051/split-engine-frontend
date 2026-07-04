import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import { Mail, Lock, LogIn, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function LoginPage() {
  const { login, isLoading, authError } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  // Unverified email states
  const [isUnverified, setIsUnverified] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState('');
  const [resendStatus, setResendStatus] = useState('idle'); // 'idle' | 'loading' | 'success' | 'error'
  const [resendMessage, setResendMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsUnverified(false);
    setResendStatus('idle');
    setResendMessage('');

    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      if (err.response?.data?.errorCode === 'EMAIL_NOT_VERIFIED') {
        setIsUnverified(true);
        setUnverifiedEmail(err.response.data.email || email);
      }
    }
  };

  const handleResend = async () => {
    setResendStatus('loading');
    setResendMessage('');

    try {
      await axios.post(`${API_URL}/auth/resend-verification`, { email: unverifiedEmail });
      setResendStatus('success');
      setResendMessage('Verification email resent! Please check your inbox.');
    } catch (err) {
      setResendStatus('error');
      setResendMessage(err.response?.data?.message || 'Failed to resend verification email.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center px-4 font-sans text-slate-200">
      <div className="w-full max-w-md">
        {/* Logo Header */}
        <div className="text-center mb-8 flex flex-col items-center">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center font-bold text-white text-xl shadow-lg shadow-indigo-500/20 mb-3">
            $
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-white">Welcome Back</h2>
          <p className="text-slate-400 text-sm mt-2">Sign in to your SplitWise Pro account</p>
        </div>

        {/* Card */}
        <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-2xl p-8 shadow-2xl space-y-6">
          {/* Email Unverified Warning Callout */}
          {isUnverified ? (
            <div className="p-4 bg-amber-950/20 border border-amber-900/50 rounded-xl space-y-3">
              <div className="flex items-start space-x-2.5">
                <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-sm font-bold text-white">Verify your email address</p>
                  <p className="text-xs text-slate-350 leading-relaxed">
                    You must verify your email <strong className="text-slate-150">{unverifiedEmail}</strong> before you can log in.
                  </p>
                </div>
              </div>

              {resendMessage && (
                <div className={`p-2.5 rounded-lg border text-[11px] font-semibold ${
                  resendStatus === 'success'
                    ? 'bg-emerald-950/30 border-emerald-900/50 text-emerald-300'
                    : 'bg-rose-950/30 border-rose-900/50 text-rose-300'
                }`}>
                  {resendMessage}
                </div>
              )}

              {resendStatus !== 'success' && (
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resendStatus === 'loading'}
                  className="w-full py-2 px-3 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-bold text-xs rounded-lg transition duration-200 cursor-pointer shadow-md shadow-amber-600/10"
                >
                  {resendStatus === 'loading' ? 'Sending...' : 'Resend Verification Link'}
                </button>
              )}
            </div>
          ) : (
            authError && (
              <div className="p-4 bg-rose-950/20 border border-rose-900/50 rounded-xl text-rose-300 text-sm flex items-center space-x-3">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span>{authError}</span>
              </div>
            )
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Email Address</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                  <Mail className="w-5 h-5" />
                </span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-11 pr-4 py-3 bg-slate-950/50 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-600 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition duration-200"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Password</label>
                <Link to="/forgot-password" className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold transition duration-200">
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                  <Lock className="w-5 h-5" />
                </span>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-4 py-3 bg-slate-950/50 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-600 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition duration-200"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium text-sm rounded-xl transition duration-200 cursor-pointer shadow-md shadow-indigo-600/10 hover:shadow-indigo-600/25 flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Sign In</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-800 text-center">
            <p className="text-slate-400 text-sm">
              Don't have an account?{' '}
              <Link to="/register" className="text-indigo-400 hover:text-indigo-300 font-semibold transition duration-200">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
