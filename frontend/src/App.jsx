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
  const [currentView, setCurrentView] = useState('landing');
  const [selectedMonitorId, setSelectedMonitorId] = useState(null);
  const [publicMonitorId, setPublicMonitorId] = useState(null);

  // Check URL path on initial load (e.g. /status/mon_xyz)
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
      setCurrentView('dashboard');
    }
  }, [isAuthenticated]);

  const handleNavigate = (view) => {
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectMonitor = (id) => {
    setSelectedMonitorId(id);
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
      <div className="min-h-screen flex items-center justify-center bg-[#070b14] text-emerald-400">
        <div className="flex items-center gap-3">
          <div className="h-6 w-6 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
          <span className="font-display font-medium text-sm text-slate-300">Initializing PulseCheck...</span>
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
    <div className="min-h-screen flex flex-col bg-[#070b14] text-slate-100 selection:bg-emerald-500 selection:text-slate-950">
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
