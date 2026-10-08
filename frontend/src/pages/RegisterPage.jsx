import React, { useState } from 'react';
import { Mail, Lock, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage({ onNavigate }) {
  const { register } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await register(email, password);
      onNavigate('dashboard');
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[82vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12 bg-[#FAF8F5] dark:bg-[#151413]">
      <div className="w-full max-w-md bg-white dark:bg-[#1E1D1A] p-8 sm:p-10 rounded-3xl border border-[#E5E0D5] dark:border-[#33312B] shadow-soft">
        <div className="text-center mb-8">
          <div className="inline-flex h-10 w-10 rounded-full bg-[#C25E3E]/10 dark:bg-[#D87754]/20 items-center justify-center text-[#C25E3E] dark:text-[#D87754] mb-3">
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2v3m0 14v3M2 12h3m14 0h3m-3.5-6.5l-2 2m-7 7l-2 2m0-11l2 2m7 7l2 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <h2 className="text-2xl font-serif font-normal text-[#1F1E1B] dark:text-[#F0ECE1]">
            Create an account
          </h2>
          <p className="text-xs text-[#6B6861] dark:text-[#9E9B93] mt-1.5">
            Free tier includes 5 active monitors with 5-minute pings
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
            <label className="block text-xs font-medium text-[#6B6861] dark:text-[#9E9B93] mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                required
                placeholder="alex@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2.5 bg-[#FAF8F5] dark:bg-[#161513] border border-[#E5E0D5] dark:border-[#33312B] rounded-xl text-sm text-[#1F1E1B] dark:text-[#F0ECE1] placeholder-[#A8A49C] focus:outline-none focus:border-[#C25E3E] transition-colors"
              />
              <Mail className="h-4 w-4 text-[#8C887F] absolute left-3 top-3" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#6B6861] dark:text-[#9E9B93] mb-1.5">
              Password (Min 8 Characters)
            </label>
            <div className="relative">
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2.5 bg-[#FAF8F5] dark:bg-[#161513] border border-[#E5E0D5] dark:border-[#33312B] rounded-xl text-sm text-[#1F1E1B] dark:text-[#F0ECE1] placeholder-[#A8A49C] focus:outline-none focus:border-[#C25E3E] transition-colors"
              />
              <Lock className="h-4 w-4 text-[#8C887F] absolute left-3 top-3" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#6B6861] dark:text-[#9E9B93] mb-1.5">
              Confirm Password
            </label>
            <div className="relative">
              <input
                type="password"
                required
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2.5 bg-[#FAF8F5] dark:bg-[#161513] border border-[#E5E0D5] dark:border-[#33312B] rounded-xl text-sm text-[#1F1E1B] dark:text-[#F0ECE1] placeholder-[#A8A49C] focus:outline-none focus:border-[#C25E3E] transition-colors"
              />
              <Lock className="h-4 w-4 text-[#8C887F] absolute left-3 top-3" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 py-3 px-4 rounded-xl font-medium text-sm bg-[#1F1E1B] hover:bg-black text-white dark:bg-[#F0ECE1] dark:text-[#151413] dark:hover:bg-white transition-all disabled:opacity-50"
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <div className="mt-8 pt-5 border-t border-[#E8E4DA] dark:border-[#2C2A25] text-center">
          <p className="text-xs text-[#6B6861] dark:text-[#9E9B93]">
            Already have an account?{' '}
            <button
              onClick={() => onNavigate('login')}
              className="text-[#C25E3E] hover:underline font-medium ml-1"
            >
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
