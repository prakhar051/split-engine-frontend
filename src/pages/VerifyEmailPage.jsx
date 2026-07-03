import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { CheckCircle2, AlertTriangle, Loader2, Mail, ArrowRight } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [status, setStatus] = useState('loading'); // 'loading' | 'success' | 'error'
  const [errorMessage, setErrorMessage] = useState('');
  const [email, setEmail] = useState('');
  const [resendStatus, setResendStatus] = useState('idle'); // 'idle' | 'loading' | 'success' | 'error'
  const [resendMessage, setResendMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setErrorMessage('Verification token is missing. Please request a new verification email.');
      return;
    }

    const verifyEmail = async () => {
      try {
        await axios.get(`${API_URL}/auth/verify-email?token=${token}`);
        setStatus('success');
      } catch (error) {
        setStatus('error');
        setErrorMessage(error.response?.data?.message || 'Verification failed or link expired.');
      }
    };

    verifyEmail();
  }, [token]);

  const handleResend = async (e) => {
    e.preventDefault();
    if (!email) return;

    setResendStatus('loading');
    setResendMessage('');

    try {
      await axios.post(`${API_URL}/auth/resend-verification`, { email });
      setResendStatus('success');
      setResendMessage('Verification email sent successfully! Please check your inbox.');
    } catch (error) {
      setResendStatus('error');
      setResendMessage(error.response?.data?.message || 'Failed to resend verification email.');
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
          <h2 className="text-3xl font-extrabold tracking-tight text-white">SplitWise Pro</h2>
        </div>

        {/* Status Card */}
        <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-2xl p-8 shadow-2xl space-y-6">
          {status === 'loading' && (
            <div className="text-center py-6 space-y-4">
              <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mx-auto" />
              <h3 className="text-lg font-semibold text-white">Verifying your email...</h3>
              <p className="text-slate-400 text-sm">Please hold on while we secure your account details.</p>
            </div>
          )}

          {status === 'success' && (
            <div className="text-center py-4 space-y-6">
              <div className="w-16 h-16 bg-emerald-950/30 border border-emerald-900/50 rounded-full flex items-center justify-center mx-auto text-emerald-400">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-white">Email Verified!</h3>
                <p className="text-slate-300 text-sm">Your email address has been successfully verified. You can now access your dashboard and groups.</p>
              </div>
              <div className="pt-2">
                <Link
                  to="/login"
                  className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm rounded-xl transition duration-200 flex items-center justify-center space-x-2 shadow-md shadow-indigo-600/10 hover:shadow-indigo-600/25"
                >
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          )}

          {status === 'error' && (
            <div className="space-y-6">
              <div className="text-center py-2 space-y-4">
                <div className="w-16 h-16 bg-rose-950/30 border border-rose-900/50 rounded-full flex items-center justify-center mx-auto text-rose-400">
                  <AlertTriangle className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-white">Verification Failed</h3>
                <p className="text-slate-300 text-sm">{errorMessage}</p>
              </div>

              {/* Resend Verification Form */}
              <div className="border-t border-slate-800 pt-6 space-y-4">
                <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Resend Verification Email</h4>
                
                {resendMessage && (
                  <div className={`p-3.5 rounded-xl border text-sm ${
                    resendStatus === 'success' 
                      ? 'bg-emerald-950/20 border-emerald-900/50 text-emerald-300' 
                      : 'bg-rose-950/20 border-rose-900/50 text-rose-300'
                  }`}>
                    {resendMessage}
                  </div>
                )}

                <form onSubmit={handleResend} className="space-y-3">
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
                  <button
                    type="submit"
                    disabled={resendStatus === 'loading'}
                    className="w-full py-3 px-4 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white font-medium text-sm rounded-xl transition duration-200 flex items-center justify-center space-x-2"
                  >
                    {resendStatus === 'loading' ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <span>Request New Link</span>
                    )}
                  </button>
                </form>
              </div>

              <div className="text-center pt-2">
                <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-semibold text-sm transition duration-200">
                  Back to Sign In
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
