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
  const [currentView, setCurrentView] = useState(() => {
    return localStorage.getItem('pulsecheck_view') || 'landing';
  });
  const [selectedMonitorId, setSelectedMonitorId] = useState(() => {
    return localStorage.getItem('pulsecheck_selected_monitor') || null;
  });
  const [publicMonitorId, setPublicMonitorId] = useState(null);

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

  const handleNavigate = (view) => {
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
    setPublicMonitorId(id);
    setCurrentView('public-status');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF8F5] dark:bg-[#151413] text-[#C25E3E]">
        <div className="flex items-center gap-3">
          <div className="h-5 w-5 border-2 border-[#C25E3E] border-t-transparent rounded-full animate-spin" />
          <span className="font-serif text-sm text-[#6B6861] dark:text-[#9E9B93]">Loading PulseCheck...</span>
        </div>
      </div>
    );
  }

  // Standalone Public Status Page View
  if (currentView === 'public-status') {
    return (
      <PublicStatusPage
        monitorId={publicMonitorId}
        onBack={isAuthenticated ? () => setCurrentView('dashboard') : null}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5] dark:bg-[#151413] text-[#1F1E1B] dark:text-[#F0ECE1] selection:bg-[#C25E3E]/20 selection:text-[#C25E3E] transition-colors">
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
