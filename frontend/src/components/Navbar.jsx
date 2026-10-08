import React from 'react';
import { Activity, ShieldCheck, Zap, LogOut, User, LayoutDashboard, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar({ currentView, onNavigate }) {
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <nav className="glass-nav sticky top-0 z-50 w-full transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div 
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => onNavigate(isAuthenticated ? 'dashboard' : 'landing')}
          >
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:shadow-emerald-500/40 transition-all">
              <div className="w-full h-full bg-[#090d16] rounded-[10px] flex items-center justify-center">
                <Activity className="h-5 w-5 text-emerald-400 group-hover:scale-110 transition-transform" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="font-display font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                PulseCheck
              </span>
              <span className="text-[10px] font-medium text-emerald-400/90 -mt-1 tracking-wider uppercase">
                Uptime Intelligence
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <button
                  onClick={() => onNavigate('dashboard')}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    currentView === 'dashboard'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  <LayoutDashboard className="h-4 w-4" />
                  <span className="hidden sm:inline">Monitors</span>
                </button>

                <button
                  onClick={() => onNavigate('billing')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    currentView === 'billing'
                      ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  <Zap className="h-4 w-4 text-indigo-400" />
                  <span className="hidden sm:inline">Billing</span>
                  {user?.plan === 'paid' ? (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 ml-1">
                      PRO
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-700 text-slate-300 ml-1">
                      FREE
                    </span>
                  )}
                </button>

                <div className="h-4 w-px bg-slate-800 mx-1 hidden sm:block" />

                <div className="hidden md:flex items-center gap-2 text-xs text-slate-400 px-2 py-1 rounded bg-slate-900/60 border border-slate-800">
                  <User className="h-3.5 w-3.5 text-slate-500" />
                  <span className="max-w-[130px] truncate">{user?.email}</span>
                </div>

                <button
                  onClick={logout}
                  title="Sign out"
                  className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => onNavigate('login')}
                  className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors"
                >
                  Sign In
                </button>
                <button
                  onClick={() => onNavigate('register')}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all active:scale-[0.98]"
                >
                  <Sparkles className="h-4 w-4" />
                  <span>Start Free</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
