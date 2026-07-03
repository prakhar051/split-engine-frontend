import { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Mail, Loader2, ArrowLeft, Send } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // 'idle' | 'loading' | 'success' | 'error'
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    setStatus('loading');
    setMessage('');

    try {
      await axios.post(`${API_URL}/auth/forgot-password`, { email });
      setStatus('success');
      setMessage(`We've sent a password reset link to ${email}. Please check your inbox.`);
    } catch (error) {
      setStatus('error');
      setMessage(error.response?.data?.message || 'Failed to send password reset email.');
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
          <h2 className="text-3xl font-extrabold tracking-tight text-white">Reset Password</h2>
          <p className="text-slate-400 text-sm mt-2">Enter your email and we'll send you a recovery link</p>
        </div>

        {/* Card */}
        <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-2xl p-8 shadow-2xl space-y-6">
          {status === 'success' ? (
            <div className="text-center py-4 space-y-6">
              <div className="w-16 h-16 bg-indigo-950/30 border border-indigo-900/50 rounded-full flex items-center justify-center mx-auto text-indigo-400">
                <Mail className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-white">Check Your Email</h3>
                <p className="text-slate-300 text-sm">{message}</p>
              </div>
              <div className="pt-2">
                <Link
                  to="/login"
                  className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm rounded-xl transition duration-200 flex items-center justify-center space-x-2 shadow-md shadow-indigo-600/10"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Sign In</span>
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {message && status === 'error' && (
                <div className="p-3.5 bg-rose-950/20 border border-rose-900/50 rounded-xl text-rose-300 text-sm">
                  {message}
                </div>
              )}

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

              <button
                type="submit"
                disabled={status === 'loading'}
                className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium text-sm rounded-xl transition duration-200 flex items-center justify-center space-x-2 cursor-pointer shadow-md shadow-indigo-600/10"
              >
                {status === 'loading' ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Send Reset Link</span>
                  </>
                )}
              </button>

              <div className="text-center pt-2">
                <Link
                  to="/login"
                  className="inline-flex items-center space-x-2 text-indigo-400 hover:text-indigo-300 text-sm font-semibold transition duration-200"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Sign In</span>
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
