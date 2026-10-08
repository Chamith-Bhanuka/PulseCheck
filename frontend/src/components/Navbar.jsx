import React from 'react';
import { Activity, Sun, Moon, LogOut, User, LayoutDashboard, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function Navbar({ currentView, onNavigate }) {
  const { isAuthenticated, user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  return (
    <nav className="sticky top-0 z-50 w-full bg-[#FBFBF9]/90 dark:bg-[#141413]/90 backdrop-blur-md border-b border-[#E6E3DA] dark:border-[#2E2D29] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo - PulseCheck Heartbeat Identity */}
          <div 
            className="flex items-center gap-2.5 cursor-pointer group select-none"
            onClick={() => onNavigate(isAuthenticated ? 'dashboard' : 'landing')}
          >
            <div className="h-8 w-8 rounded-xl bg-[#1E5E4B]/10 dark:bg-[#2E8B6E]/20 border border-[#1E5E4B]/20 dark:border-[#2E8B6E]/30 flex items-center justify-center text-[#1E5E4B] dark:text-[#2E8B6E] group-hover:scale-105 transition-transform shadow-xs">
              <Activity className="w-4 h-4 stroke-[2.2]" />
            </div>
            <span className="font-sans font-semibold text-lg tracking-tight text-[#1A1917] dark:text-[#F2EFE9] flex items-center gap-1.5">
              PulseCheck
              <span className="h-1.5 w-1.5 rounded-full bg-[#1E5E4B] dark:bg-[#2E8B6E] animate-pulse" />
            </span>
          </div>

          {/* Right Navigation */}
          <div className="flex items-center gap-1.5 sm:gap-4">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-1.5 sm:p-2 rounded-full text-[#6B6861] dark:text-[#9E9B93] hover:text-[#1F1E1B] dark:hover:text-[#F0ECE1] hover:bg-[#F0ECE2] dark:hover:bg-[#252420] transition-colors"
              title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>

            {isAuthenticated ? (
              <>
                <button
                  onClick={() => onNavigate('dashboard')}
                  className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    currentView === 'dashboard'
                      ? 'bg-[#1A1917] text-white dark:bg-[#F2EFE9] dark:text-[#141413]'
                      : 'text-[#6E6A63] dark:text-[#96938C] hover:text-[#1A1917] dark:hover:text-white'
                  }`}
                >
                  <LayoutDashboard className="h-3.5 w-3.5 sm:hidden shrink-0" />
                  <span className="hidden sm:inline">Monitors</span>
                </button>

                <button
                  onClick={() => onNavigate('billing')}
                  className={`flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    currentView === 'billing'
                      ? 'bg-[#1A1917] text-white dark:bg-[#F2EFE9] dark:text-[#141413]'
                      : 'text-[#6E6A63] dark:text-[#96938C] hover:text-[#1A1917] dark:hover:text-white'
                  }`}
                >
                  <Zap className="h-3.5 w-3.5 text-[#1E5E4B] dark:text-[#2E8B6E] shrink-0" />
                  <span className="hidden sm:inline">Billing</span>
                  <span className={`text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded-full sm:ml-1 ${
                    user?.plan === 'paid' 
                      ? 'bg-[#1E5E4B]/15 text-[#1E5E4B] dark:text-[#2E8B6E]' 
                      : 'bg-[#E6E3DA] dark:bg-[#2E2D29] text-[#6E6A63] dark:text-[#96938C]'
                  }`}>
                    {user?.plan === 'paid' ? 'PRO' : 'FREE'}
                  </span>
                </button>

                <div className="hidden md:flex items-center gap-2 text-xs text-[#6E6A63] dark:text-[#96938C] px-2.5 py-1 rounded-full bg-[#F5F4EE] dark:bg-[#1E1E1C] border border-[#E6E3DA] dark:border-[#2E2D29]">
                  <User className="h-3 w-3" />
                  <span className="max-w-[120px] truncate">{user?.email}</span>
                </div>

                <button
                  onClick={logout}
                  title="Sign out"
                  className="p-1.5 sm:p-2 text-[#6E6A63] dark:text-[#96938C] hover:text-rose-600 dark:hover:text-rose-400 rounded-full hover:bg-[#F0ECE2] dark:hover:bg-[#252420] transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => onNavigate('landing')}
                  className="hidden md:inline-block text-xs font-medium text-[#6E6A63] dark:text-[#96938C] hover:text-[#1A1917] dark:hover:text-[#F2EFE9] px-2"
                >
                  Overview
                </button>
                <button
                  onClick={() => onNavigate('login')}
                  className="text-xs font-medium text-[#6E6A63] dark:text-[#96938C] hover:text-[#1A1917] dark:hover:text-[#F2EFE9] px-2 sm:px-3 py-1.5"
                >
                  Login
                </button>
                <button
                  onClick={() => onNavigate('register')}
                  className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs font-semibold bg-[#1A1917] text-white hover:bg-black dark:bg-[#F2EFE9] dark:text-[#141413] dark:hover:bg-white shadow-sm transition-all whitespace-nowrap"
                >
                  Try PulseCheck
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
