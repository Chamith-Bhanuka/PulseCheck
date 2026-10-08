import React from 'react';
import { Activity, Sun, Moon, LogOut, User, LayoutDashboard, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function Navbar({ currentView, onNavigate }) {
  const { isAuthenticated, user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  return (
    <nav className="sticky top-0 z-50 w-full bg-[#FAF8F5]/90 dark:bg-[#161513]/90 backdrop-blur-md border-b border-[#E8E4DA] dark:border-[#2C2A25] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo - Claude inspired warm mark */}
          <div 
            className="flex items-center gap-2.5 cursor-pointer group select-none"
            onClick={() => onNavigate(isAuthenticated ? 'dashboard' : 'landing')}
          >
            {/* Claude-style warm terracotta sunburst/pulse mark */}
            <div className="h-8 w-8 rounded-full bg-[#C25E3E]/10 dark:bg-[#D87754]/20 flex items-center justify-center text-[#C25E3E] dark:text-[#D87754] group-hover:scale-105 transition-transform">
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M12 2a1 1 0 0 1 1 1v2a1 1 0 1 1-2 0V3a1 1 0 0 1 1-1zm0 16a1 1 0 0 1 1 1v2a1 1 0 1 1-2 0v-2a1 1 0 0 1 1-1zm8-7a1 1 0 0 1 1 1v0a1 1 0 1 1-2 0v0a1 1 0 0 1 1-1zM4 11a1 1 0 0 1 1 1v0a1 1 0 1 1-2 0v0a1 1 0 0 1 1-1zm13.657-6.243a1 1 0 0 1 1.414 0l1.414 1.414a1 1 0 1 1-1.414 1.414l-1.414-1.414a1 1 0 0 1 0-1.414zM4.929 17.657a1 1 0 0 1 1.414 0l1.414 1.414a1 1 0 1 1-1.414 1.414l-1.414-1.414a1 1 0 0 1 0-1.414zm14.142 1.414a1 1 0 0 1 0 1.414l-1.414 1.414a1 1 0 1 1-1.414-1.414l1.414-1.414a1 1 0 0 1 1.414 0zM6.343 4.757a1 1 0 0 1 0 1.414L4.929 7.586A1 1 0 1 1 3.515 6.172l1.414-1.414a1 1 0 0 1 1.414 0z"/>
                <circle cx="12" cy="12" r="3.5" />
              </svg>
            </div>
            <span className="font-serif font-bold text-xl tracking-tight text-[#1F1E1B] dark:text-[#F0ECE1]">
              PulseCheck
            </span>
          </div>

          {/* Right Navigation */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full text-[#6B6861] dark:text-[#9E9B93] hover:text-[#1F1E1B] dark:hover:text-[#F0ECE1] hover:bg-[#F0ECE2] dark:hover:bg-[#252420] transition-colors"
              title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>

            {isAuthenticated ? (
              <>
                <button
                  onClick={() => onNavigate('dashboard')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    currentView === 'dashboard'
                      ? 'bg-[#1F1E1B] text-white dark:bg-[#F0ECE1] dark:text-[#151413]'
                      : 'text-[#6B6861] dark:text-[#9E9B93] hover:text-[#1F1E1B] dark:hover:text-white'
                  }`}
                >
                  <LayoutDashboard className="h-3.5 w-3.5" />
                  <span>Monitors</span>
                </button>

                <button
                  onClick={() => onNavigate('billing')}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    currentView === 'billing'
                      ? 'bg-[#1F1E1B] text-white dark:bg-[#F0ECE1] dark:text-[#151413]'
                      : 'text-[#6B6861] dark:text-[#9E9B93] hover:text-[#1F1E1B] dark:hover:text-white'
                  }`}
                >
                  <Zap className="h-3.5 w-3.5 text-[#C25E3E]" />
                  <span>Billing</span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ml-1 ${
                    user?.plan === 'paid' 
                      ? 'bg-[#C25E3E]/20 text-[#C25E3E]' 
                      : 'bg-[#E5E0D5] dark:bg-[#33312B] text-[#6B6861] dark:text-[#9E9B93]'
                  }`}>
                    {user?.plan === 'paid' ? 'PRO' : 'FREE'}
                  </span>
                </button>

                <div className="hidden md:flex items-center gap-2 text-xs text-[#6B6861] dark:text-[#9E9B93] px-2.5 py-1 rounded-full bg-[#F3EFE6] dark:bg-[#22211D] border border-[#E5E0D5] dark:border-[#33312B]">
                  <User className="h-3 w-3" />
                  <span className="max-w-[120px] truncate">{user?.email}</span>
                </div>

                <button
                  onClick={logout}
                  title="Sign out"
                  className="p-2 text-[#6B6861] dark:text-[#9E9B93] hover:text-rose-600 dark:hover:text-rose-400 rounded-full hover:bg-[#F0ECE2] dark:hover:bg-[#252420] transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => onNavigate('landing')}
                  className="hidden md:inline-block text-xs font-medium text-[#6B6861] dark:text-[#9E9B93] hover:text-[#1F1E1B] dark:hover:text-[#F0ECE1] px-2"
                >
                  Overview
                </button>
                <button
                  onClick={() => onNavigate('login')}
                  className="text-xs font-medium text-[#6B6861] dark:text-[#9E9B93] hover:text-[#1F1E1B] dark:hover:text-[#F0ECE1] px-3 py-1.5"
                >
                  Login
                </button>
                <button
                  onClick={() => onNavigate('register')}
                  className="px-4 py-2 rounded-full text-xs font-semibold bg-[#1F1E1B] text-white hover:bg-black dark:bg-[#F0ECE1] dark:text-[#151413] dark:hover:bg-white shadow-sm transition-all"
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
