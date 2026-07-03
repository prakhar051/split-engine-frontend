import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { Lock, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState('idle'); // 'idle' | 'loading' | 'success' | 'error'
  const [message, setMessage] = useState('');

  const getPasswordStrength = (pwd) => {
    if (!pwd) return { score: 0, text: '', color: 'bg-slate-800' };
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;

    switch (score) {
      case 1:
        return { score, text: 'Weak', color: 'bg-rose-500' };
      case 2:
        return { score, text: 'Fair', color: 'bg-amber-500' };
      case 3:
        return { score, text: 'Good', color: 'bg-indigo-500' };
      case 4:
        return { score, text: 'Strong', color: 'bg-emerald-500' };
      default:
        return { score, text: 'Too Short', color: 'bg-rose-500' };
    }
  };

  const strength = getPasswordStrength(password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      setStatus('error');
      setMessage('Password reset token is missing. Please request a new reset link.');
      return;
    }

    if (password !== confirmPassword) {
      setStatus('error');
      setMessage('Passwords do not match.');
      return;
    }

    if (password.length < 8) {
      setStatus('error');
      setMessage('Password must be at least 8 characters long.');
      return;
    }

    setStatus('loading');
    setMessage('');

    try {
      await axios.post(`${API_URL}/auth/reset-password`, { token, password });
      setStatus('success');
      setMessage('Your password has been successfully reset.');
    } catch (error) {
      setStatus('error');
      setMessage(error.response?.data?.message || 'Failed to reset password. The link may have expired.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center px-4 py-12 font-sans text-slate-200">
      <div className="w-full max-w-md">
        {/* Logo Header */}
        <div className="text-center mb-8 flex flex-col items-center">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center font-bold text-white text-xl shadow-lg shadow-indigo-500/20 mb-3">
            $
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-white">Create New Password</h2>
          <p className="text-slate-400 text-sm mt-2">Choose a secure password containing uppercase, lowercase, numbers, and symbols</p>
        </div>

        {/* Card */}
        <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-2xl p-8 shadow-2xl space-y-6">
          {status === 'success' ? (
            <div className="text-center py-4 space-y-6">
              <div className="w-16 h-16 bg-emerald-950/30 border border-emerald-900/50 rounded-full flex items-center justify-center mx-auto text-emerald-400">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-white">Password Reset</h3>
                <p className="text-slate-300 text-sm">{message}</p>
              </div>
              <div className="pt-2">
                <Link
                  to="/login"
                  className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm rounded-xl transition duration-200 flex items-center justify-center shadow-md shadow-indigo-600/10"
                >
                  <span>Sign In</span>
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {message && status === 'error' && (
                <div className="p-3.5 bg-rose-950/20 border border-rose-900/50 rounded-xl text-rose-300 text-sm flex items-center space-x-2">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <span>{message}</span>
                </div>
              )}

              {/* Password Field */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">New Password</label>
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
                {/* Password Strength Indicator */}
                {password && (
                  <div className="mt-2.5 space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400">Strength:</span>
                      <span className="font-semibold text-slate-300">{strength.text}</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-850 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${strength.color} transition-all duration-300`}
                        style={{ width: `${(strength.score / 4) * 100}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password Field */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Confirm Password</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                    <Lock className="w-5 h-5" />
                  </span>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-11 pr-4 py-3 bg-slate-950/50 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-600 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition duration-200"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={status === 'loading'}
                className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium text-sm rounded-xl transition duration-200 flex items-center justify-center space-x-2 cursor-pointer shadow-md shadow-indigo-600/10"
              >
                {status === 'loading' ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <span>Reset Password</span>
                )}
              </button>

              <div className="text-center pt-2">
                <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-semibold text-sm transition duration-200">
                  Back to Sign In
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
