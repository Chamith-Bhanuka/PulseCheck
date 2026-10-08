import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import MonitorDetailPage from './pages/MonitorDetailPage';
import BillingPage from './pages/BillingPage';
import PublicStatusPage from './pages/PublicStatusPage';

export default function App() {
  const { isAuthenticated, loading } = useAuth();

  const getInitialPublicId = () => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      if (path.startsWith('/status/')) {
        const parts = path.split('/').filter(Boolean);
        if (parts.length >= 2) return parts[1];
      }
    }
    return null;
  };

  const [publicMonitorId, setPublicMonitorId] = useState(getInitialPublicId);
  const [currentView, setCurrentView] = useState(() => {
    const initPublicId = getInitialPublicId();
    if (initPublicId) return 'public-status';
    return localStorage.getItem('pulsecheck_view') || 'landing';
  });
  const [selectedMonitorId, setSelectedMonitorId] = useState(() => {
    return localStorage.getItem('pulsecheck_selected_monitor') || null;
  });

  // Check URL path on initial load (e.g. /status/mon_xyz) and sync view
  useEffect(() => {
    const path = window.location.pathname;
    if (path.startsWith('/status/')) {
      const parts = path.split('/').filter(Boolean);
      if (parts.length >= 2) {
        setPublicMonitorId(parts[1]);
        setCurrentView('public-status');
        return;
      }
    }

    if (isAuthenticated) {
      const savedView = localStorage.getItem('pulsecheck_view');
      if (savedView === 'monitor-detail' && selectedMonitorId) {
        setCurrentView('monitor-detail');
      } else if (savedView === 'billing') {
        setCurrentView('billing');
      } else {
        setCurrentView('dashboard');
        localStorage.setItem('pulsecheck_view', 'dashboard');
      }
    } else {
      const savedView = localStorage.getItem('pulsecheck_view');
      if (savedView === 'login' || savedView === 'register') {
        setCurrentView(savedView);
      } else {
        setCurrentView('landing');
      }
    }
  }, [isAuthenticated]);

  // Support browser Back/Forward buttons
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      if (path.startsWith('/status/')) {
        const parts = path.split('/').filter(Boolean);
        if (parts.length >= 2) {
          setPublicMonitorId(parts[1]);
          setCurrentView('public-status');
          return;
        }
      }
      if (isAuthenticated) {
        const savedView = localStorage.getItem('pulsecheck_view') || 'dashboard';
        setCurrentView(savedView);
      } else {
        setCurrentView('landing');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [isAuthenticated]);

  const handleNavigate = (view) => {
    if (window.location.pathname.startsWith('/status/')) {
      window.history.pushState({}, '', '/');
    }
    setCurrentView(view);
    localStorage.setItem('pulsecheck_view', view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectMonitor = (id) => {
    setSelectedMonitorId(id);
    localStorage.setItem('pulsecheck_selected_monitor', id);
    localStorage.setItem('pulsecheck_view', 'monitor-detail');
    setCurrentView('monitor-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigatePublic = (id) => {
    window.history.pushState({}, '', `/status/${id}`);
    setPublicMonitorId(id);
    setCurrentView('public-status');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading && currentView !== 'public-status') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FBFBF9] dark:bg-[#141413] text-[#1E5E4B] dark:text-[#2E8B6E]">
        <div className="flex items-center gap-3">
          <div className="h-5 w-5 border-2 border-[#1E5E4B] dark:border-[#2E8B6E] border-t-transparent rounded-full animate-spin" />
          <span className="font-serif text-sm text-[#6E6A63] dark:text-[#96938C]">Loading PulseCheck...</span>
        </div>
      </div>
    );
  }

  // Standalone Public Status Page View
  if (currentView === 'public-status') {
    return (
      <PublicStatusPage
        monitorId={publicMonitorId}
        onBack={() => {
          window.history.pushState({}, '', '/');
          handleNavigate(isAuthenticated ? 'dashboard' : 'landing');
        }}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FBFBF9] dark:bg-[#141413] text-[#1A1917] dark:text-[#F2EFE9] selection:bg-[#1E5E4B]/20 selection:text-[#1E5E4B] transition-colors">
      <Navbar currentView={currentView} onNavigate={handleNavigate} />

      <main className="flex-1">
        {currentView === 'landing' && <LandingPage onNavigate={handleNavigate} />}

        {currentView === 'login' && <LoginPage onNavigate={handleNavigate} />}

        {currentView === 'register' && <RegisterPage onNavigate={handleNavigate} />}

        {currentView === 'dashboard' && (
          isAuthenticated ? (
            <DashboardPage
              onSelectMonitor={handleSelectMonitor}
              onNavigate={handleNavigate}
            />
          ) : (
            <LoginPage onNavigate={handleNavigate} />
          )
        )}

        {currentView === 'monitor-detail' && (
          isAuthenticated && selectedMonitorId ? (
            <MonitorDetailPage
              monitorId={selectedMonitorId}
              onBack={() => handleNavigate('dashboard')}
              onNavigatePublic={handleNavigatePublic}
            />
          ) : (
            <DashboardPage
              onSelectMonitor={handleSelectMonitor}
              onNavigate={handleNavigate}
            />
          )
        )}

        {currentView === 'billing' && (
          isAuthenticated ? (
            <BillingPage onNavigate={handleNavigate} />
          ) : (
            <LoginPage onNavigate={handleNavigate} />
          )
        )}
      </main>

      {currentView !== 'public-status' && <Footer onNavigate={handleNavigate} />}
    </div>
  );
}
