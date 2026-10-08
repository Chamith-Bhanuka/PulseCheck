import React, { useState } from 'react';
import { Mail, Lock, ArrowRight, AlertCircle, Activity } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LoginPage({ onNavigate }) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(email, password);
      onNavigate('dashboard');
    } catch (err) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[82vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12 bg-[#FBFBF9] dark:bg-[#141413]">
      <div className="w-full max-w-md bg-white dark:bg-[#1C1C1B] p-8 sm:p-10 rounded-3xl border border-[#E6E3DA] dark:border-[#2E2D29] shadow-soft">
        <div className="text-center mb-8">
          {/* PulseCheck Activity Logo */}
          <div className="inline-flex h-11 w-11 rounded-xl bg-[#1E5E4B]/10 dark:bg-[#2E8B6E]/20 border border-[#1E5E4B]/20 dark:border-[#2E8B6E]/30 items-center justify-center text-[#1E5E4B] dark:text-[#2E8B6E] mb-3 shadow-xs">
            <Activity className="w-5 h-5 stroke-[2.2]" />
          </div>
          <h2 className="text-2xl font-serif font-normal text-[#1A1917] dark:text-[#F2EFE9]">
            Welcome back
          </h2>
          <p className="text-xs text-[#6E6A63] dark:text-[#96938C] mt-1.5">
            Sign in to access your monitored APIs and alert history
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 mb-5 text-xs text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 rounded-xl">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-500" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#6E6A63] dark:text-[#96938C] mb-1.5 text-left">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                required
                placeholder="alex@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2.5 bg-[#F8F7F2] dark:bg-[#171716] border border-[#E6E3DA] dark:border-[#2E2D29] rounded-xl text-sm text-[#1A1917] dark:text-[#F2EFE9] placeholder-[#96938C] focus:outline-none focus:border-[#1E5E4B] dark:focus:border-[#2E8B6E] transition-colors"
              />
              <Mail className="h-4 w-4 text-[#8C887F] absolute left-3 top-3" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#6E6A63] dark:text-[#96938C] mb-1.5 text-left">
              Password
            </label>
            <div className="relative">
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2.5 bg-[#F8F7F2] dark:bg-[#171716] border border-[#E6E3DA] dark:border-[#2E2D29] rounded-xl text-sm text-[#1A1917] dark:text-[#F2EFE9] placeholder-[#96938C] focus:outline-none focus:border-[#1E5E4B] dark:focus:border-[#2E8B6E] transition-colors"
              />
              <Lock className="h-4 w-4 text-[#8C887F] absolute left-3 top-3" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 py-3 px-4 rounded-xl font-medium text-sm bg-[#1A1917] hover:bg-black text-white dark:bg-[#F2EFE9] dark:text-[#141413] dark:hover:bg-white transition-all disabled:opacity-50 shadow-xs"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-8 pt-5 border-t border-[#E6E3DA] dark:border-[#2E2D29] text-center">
          <p className="text-xs text-[#6E6A63] dark:text-[#96938C]">
            Don't have an account?{' '}
            <button
              onClick={() => onNavigate('register')}
              className="text-[#1E5E4B] dark:text-[#2E8B6E] hover:underline font-semibold ml-1"
            >
              Create free account
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
