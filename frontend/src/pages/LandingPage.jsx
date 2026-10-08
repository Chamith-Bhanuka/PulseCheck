import React, { useState, useEffect } from 'react';
import { 
  Activity, ShieldCheck, Zap, Bell, ArrowRight, CheckCircle2, 
  Clock, Globe, Server, BarChart3, Lock, Sparkles, ChevronRight, Terminal, Laptop, Video
} from 'lucide-react';

export default function LandingPage({ onNavigate }) {
  const [activeTab, setActiveTab] = useState('api');
  const [heroMode, setHeroMode] = useState('live'); // 'live' or 'video'
  const [selectedHeroEndpoint, setSelectedHeroEndpoint] = useState('production');
  const [videoError, setVideoError] = useState(false);
  const [cursorPos, setCursorPos] = useState({ x: 75, y: 40 });

  // Natural animated cursor gliding over endpoints to mimic the Claude screencast
  useEffect(() => {
    if (heroMode !== 'live') return;
    const positions = [
      { x: 28, y: 35, endpoint: 'production' },
      { x: 28, y: 55, endpoint: 'stripe' },
      { x: 28, y: 75, endpoint: 'auth' },
      { x: 70, y: 40, endpoint: 'production' },
    ];
    let idx = 0;
    const cursorInterval = setInterval(() => {
      idx = (idx + 1) % positions.length;
      setCursorPos({ x: positions[idx].x, y: positions[idx].y });
      if (positions[idx].endpoint) {
        setSelectedHeroEndpoint(positions[idx].endpoint);
      }
    }, 3800);
    return () => clearInterval(cursorInterval);
  }, [heroMode]);

  const endpointDetails = {
    production: {
      url: 'api.pulsecheck.dev/health',
      status: 200,
      latency: 38,
      uptime: '99.99%',
      logs: [
        { name: 'GET /v1/health', latency: '38ms', status: 200 },
        { name: 'POST /v1/tokens', latency: '44ms', status: 200 },
        { name: 'GET /v1/monitors', latency: '31ms', status: 200 },
      ]
    },
    stripe: {
      url: 'billing.stripe.com/v1/charges',
      status: 200,
      latency: 62,
      uptime: '99.95%',
      logs: [
        { name: 'POST /v1/charges', latency: '62ms', status: 200 },
        { name: 'GET /v1/invoices', latency: '54ms', status: 200 },
        { name: 'GET /v1/customers', latency: '58ms', status: 200 },
      ]
    },
    auth: {
      url: 'auth-gateway.internal/verify',
      status: 200,
      latency: 24,
      uptime: '100.00%',
      logs: [
        { name: 'POST /jwt/verify', latency: '24ms', status: 200 },
        { name: 'POST /session/refresh', latency: '28ms', status: 200 },
        { name: 'GET /jwks.json', latency: '19ms', status: 200 },
      ]
    }
  };

  const currentEndpoint = endpointDetails[selectedHeroEndpoint] || endpointDetails.production;

  return (
    <div className="min-h-screen bg-[#FAF8F5] dark:bg-[#151413] text-[#1F1E1B] dark:text-[#F0ECE1] transition-colors">
      {/* 1. Hero Section - Faithful to Claude's Split Hero Layout */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Editorial Headline & Action Box */}
          <div className="lg:col-span-6 flex flex-col items-start text-left max-w-xl">
            <h1 className="font-serif text-5xl sm:text-6xl lg:text-[68px] leading-[1.08] font-normal tracking-tight text-[#1F1E1B] dark:text-[#F0ECE1]">
              Think fast, <br />
              monitor faster
            </h1>
            
            <p className="mt-5 text-lg sm:text-xl text-[#6B6861] dark:text-[#9E9B93] font-normal leading-relaxed">
              Detect API and website outages in 30 seconds. Powered by high-concurrency Go workers.
            </p>

            {/* Clean Auth Card (matching Claude card) */}
            <div className="mt-8 w-full max-w-md bg-white dark:bg-[#1E1D1A] border border-[#E5E0D5] dark:border-[#33312B] rounded-3xl p-6 sm:p-7 shadow-soft">
              {/* Continue with Google button */}
              <button
                onClick={() => onNavigate('register')}
                className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border border-[#E5E0D5] dark:border-[#33312B] bg-[#FAF8F5] dark:bg-[#161513] hover:bg-[#F3EFE6] dark:hover:bg-[#252420] text-sm font-medium text-[#1F1E1B] dark:text-[#F0ECE1] transition-all"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
                <span>Continue with Google</span>
              </button>

              <div className="my-4 flex items-center gap-3">
                <div className="flex-1 h-px bg-[#E5E0D5] dark:bg-[#33312B]" />
                <span className="text-[11px] font-semibold text-[#8C887F] uppercase tracking-wider">OR</span>
                <div className="flex-1 h-px bg-[#E5E0D5] dark:bg-[#33312B]" />
              </div>

              {/* Continue with Email Button */}
              <button
                onClick={() => onNavigate('register')}
                className="w-full py-3 px-4 rounded-xl bg-[#1F1E1B] hover:bg-black text-white dark:bg-[#F0ECE1] dark:text-[#151413] dark:hover:bg-white text-sm font-semibold transition-all"
              >
                Continue with email
              </button>

              <p className="mt-4 text-[11px] text-[#8C887F] dark:text-[#807D75] leading-relaxed text-center">
                By continuing, you acknowledge PulseCheck's Privacy Policy and agree to fair multi-tenant uptime service monitoring.
              </p>
            </div>

            {/* Bottom auxiliary badge */}
            <div className="mt-6">
              <button
                onClick={() => onNavigate('login')}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-[#E5E0D5] dark:border-[#33312B] bg-[#FAF8F5] dark:bg-[#161513] hover:bg-[#F3EFE6] dark:hover:bg-[#201F1C] text-xs font-medium text-[#6B6861] dark:text-[#9E9B93] transition-colors"
              >
                <Laptop className="h-3.5 w-3.5" />
                <span>Sign in with existing credentials</span>
              </button>
            </div>
          </div>

          {/* Right Column: Architectural Grid Canvas with Interactive Telemetry / Video Window */}
          <div className="lg:col-span-6 w-full">
            <div className="hero-grid-canvas rounded-3xl p-6 sm:p-8 border border-[#E5E0D5] dark:border-[#33312B] flex flex-col items-center justify-center min-h-[480px] shadow-sm relative overflow-hidden">
              
              {/* Mode Switcher Pill */}
              <div className="self-end mb-4 bg-white/90 dark:bg-[#1E1D1A]/90 backdrop-blur border border-[#E5E0D5] dark:border-[#33312B] rounded-full p-1 flex items-center gap-1 shadow-xs z-20">
                <button
                  onClick={() => setHeroMode('live')}
                  className={`px-3 py-1 text-xs font-medium rounded-full transition-all flex items-center gap-1.5 ${
                    heroMode === 'live'
                      ? 'bg-[#1F1E1B] text-white dark:bg-[#F0ECE1] dark:text-[#151413]'
                      : 'text-[#6B6861] dark:text-[#9E9B93] hover:text-[#1F1E1B]'
                  }`}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Live Telemetry</span>
                </button>
                <button
                  onClick={() => setHeroMode('video')}
                  className={`px-3 py-1 text-xs font-medium rounded-full transition-all flex items-center gap-1.5 ${
                    heroMode === 'video'
                      ? 'bg-[#1F1E1B] text-white dark:bg-[#F0ECE1] dark:text-[#151413]'
                      : 'text-[#6B6861] dark:text-[#9E9B93] hover:text-[#1F1E1B]'
                  }`}
                >
                  <Video className="h-3 w-3" />
                  <span>Product Video</span>
                </button>
              </div>

              {/* Floating Elevated Window Mockup (matching the Claude macOS window mockup) */}
              <div className="w-full max-w-lg bg-white dark:bg-[#1E1D1A] rounded-2xl border border-[#E5E0D5] dark:border-[#33312B] shadow-window overflow-hidden transition-transform duration-300 hover:scale-[1.01] relative">
                
                {/* Window Title Bar with Traffic Light Controls */}
                <div className="flex items-center justify-between px-4 py-3 bg-[#FAF8F5] dark:bg-[#181715] border-b border-[#E8E4DA] dark:border-[#2C2A25]">
                  <div className="flex items-center gap-2">
                    <div className="h-2.5 w-2.5 rounded-full bg-[#E57373]" />
                    <div className="h-2.5 w-2.5 rounded-full bg-[#FFB74D]" />
                    <div className="h-2.5 w-2.5 rounded-full bg-[#81C784]" />
                    <span className="text-[11px] font-mono text-[#8C887F] ml-2">PulseCheck Telemetry &bull; Go Engine</span>
                  </div>
                  <span className="text-[10px] font-mono text-[#1E6B52] dark:text-[#34D399] bg-[#E8F5E9] dark:bg-[#1C2C24] px-2 py-0.5 rounded-full font-semibold">
                    {heroMode === 'live' ? 'Live Pings (30s)' : '4K Demo Video'}
                  </span>
                </div>

                {heroMode === 'video' ? (
                  /* Video Player Layer */
                  <div className="relative min-h-[300px] bg-[#161513] flex items-center justify-center overflow-hidden">
                    {!videoError ? (
                      <video 
                        className="w-full h-full object-cover aspect-video"
                        autoPlay 
                        loop 
                        muted 
                        playsInline
                        controls
                        onError={() => setVideoError(true)}
                      >
                        <source src="/hero-video.mp4" type="video/mp4" />
                        <source src="/assets/hero-video.mp4" type="video/mp4" />
                      </video>
                    ) : null}

                    {/* Elegant Standby Screen if hero-video.mp4 isn't dropped yet */}
                    {videoError && (
                      <div className="p-8 text-center flex flex-col items-center justify-center text-[#F0ECE1] bg-gradient-to-b from-[#1E1D1A] to-[#151413] w-full min-h-[300px]">
                        <div className="h-12 w-12 rounded-full bg-[#FAF8F5]/10 flex items-center justify-center mb-3 text-[#C25E3E]">
                          <Video className="h-6 w-6" />
                        </div>
                        <h4 className="font-serif text-lg font-medium">Hero Video Ready</h4>
                        <p className="text-xs text-[#9E9B93] max-w-xs mt-1.5 leading-relaxed">
                          Place your rendered 16:9 MP4 video at <code className="text-[#C25E3E] font-mono bg-white/5 px-1 py-0.5 rounded">frontend/public/hero-video.mp4</code> to auto-stream here seamlessly.
                        </p>
                        <button
                          onClick={() => { setVideoError(false); setHeroMode('live'); }}
                          className="mt-4 px-4 py-1.5 rounded-full bg-[#FAF8F5] text-[#151413] text-xs font-semibold hover:bg-white transition-all shadow-sm"
                        >
                          Switch back to Live Telemetry
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  /* Interactive Telemetry Canvas with Animated Pointer */
                  <div className="grid grid-cols-12 min-h-[290px] relative select-none">
                    
                    {/* Simulated macOS Cursor Gliding across UI */}
                    <div 
                      className="absolute z-30 pointer-events-none transition-all duration-1000 ease-in-out"
                      style={{ top: `${cursorPos.y}%`, left: `${cursorPos.x}%` }}
                    >
                      <svg className="w-5 h-5 drop-shadow-md text-[#1F1E1B]" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M4.5 2.5L18.5 13.5L11.5 14.5L8.5 21.5L4.5 2.5Z" stroke="white" strokeWidth="1.5" strokeLinejoin="round"/>
                      </svg>
                    </div>

                    {/* Left Sidebar (Like Finder sidebar in Claude image) */}
                    <div className="col-span-4 bg-[#F7F4EC] dark:bg-[#181714] p-3 border-r border-[#E8E4DA] dark:border-[#2C2A25] text-left">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-[#8C887F] block mb-2 px-1">
                        Monitored
                      </span>
                      <div className="space-y-1">
                        <button
                          onClick={() => setSelectedHeroEndpoint('production')}
                          className={`w-full text-left px-2 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                            selectedHeroEndpoint === 'production'
                              ? 'bg-white dark:bg-[#252420] text-[#1F1E1B] dark:text-white shadow-xs font-semibold'
                              : 'text-[#6B6861] dark:text-[#9E9B93] hover:bg-white/60 dark:hover:bg-[#252420]/60'
                          }`}
                        >
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                          <span className="truncate">Production</span>
                        </button>

                        <button
                          onClick={() => setSelectedHeroEndpoint('stripe')}
                          className={`w-full text-left px-2 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                            selectedHeroEndpoint === 'stripe'
                              ? 'bg-white dark:bg-[#252420] text-[#1F1E1B] dark:text-white shadow-xs font-semibold'
                              : 'text-[#6B6861] dark:text-[#9E9B93] hover:bg-white/60 dark:hover:bg-[#252420]/60'
                          }`}
                        >
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                          <span className="truncate">Stripe API</span>
                        </button>

                        <button
                          onClick={() => setSelectedHeroEndpoint('auth')}
                          className={`w-full text-left px-2 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                            selectedHeroEndpoint === 'auth'
                              ? 'bg-white dark:bg-[#252420] text-[#1F1E1B] dark:text-white shadow-xs font-semibold'
                              : 'text-[#6B6861] dark:text-[#9E9B93] hover:bg-white/60 dark:hover:bg-[#252420]/60'
                          }`}
                        >
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                          <span className="truncate">Auth Gateway</span>
                        </button>
                      </div>
                    </div>

                    {/* Main Content Pane */}
                    <div className="col-span-8 p-4 text-left flex flex-col justify-between bg-white dark:bg-[#1E1D1A]">
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <div className="text-xs font-semibold text-[#1F1E1B] dark:text-[#F0ECE1] truncate max-w-[160px]">
                            {currentEndpoint.url}
                          </div>
                          <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded">
                            HTTP {currentEndpoint.status}
                          </span>
                        </div>

                        {/* Latency Logs */}
                        <div className="space-y-1.5 mt-2 font-mono text-[11px]">
                          {currentEndpoint.logs.map((log, idx) => (
                            <div key={idx} className="p-2 rounded-lg bg-[#FAF8F5] dark:bg-[#161513] border border-[#EAE6DC] dark:border-[#2C2A25] flex items-center justify-between">
                              <span className="text-[#6B6861] dark:text-[#9E9B93] truncate max-w-[140px]">{log.name}</span>
                              <span className="font-semibold text-emerald-600 dark:text-emerald-400">{log.latency}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Window Bottom Status Bar */}
                      <div className="pt-3 border-t border-[#EAE6DC] dark:border-[#2C2A25] flex items-center justify-between text-[11px] text-[#8C887F]">
                        <span>Worker Pool: 20 Slots</span>
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400">{currentEndpoint.uptime} Uptime</span>
                      </div>
                    </div>
                  </div>
                )}

              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 2. Core Pillars - Warm Editorial Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-[#E8E4DA] dark:border-[#2C2A25]">
        <div className="max-w-2xl text-left mb-14">
          <span className="text-xs font-bold text-[#C25E3E] uppercase tracking-widest block mb-2">
            Engineered for Reliability
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-normal text-[#1F1E1B] dark:text-[#F0ECE1]">
            Clean architecture without the noise
          </h2>
          <p className="mt-3 text-sm sm:text-base text-[#6B6861] dark:text-[#9E9B93]">
            Every feature is designed for developer productivity, zero false alarms, and instant resolution.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-[#1E1D1A] p-7 rounded-3xl border border-[#E5E0D5] dark:border-[#33312B] text-left shadow-soft">
            <div className="h-10 w-10 rounded-xl bg-[#FAF8F5] dark:bg-[#252420] border border-[#E5E0D5] dark:border-[#33312B] flex items-center justify-center text-[#C25E3E] mb-5">
              <Zap className="h-5 w-5" />
            </div>
            <h3 className="font-serif text-xl font-normal text-[#1F1E1B] dark:text-[#F0ECE1] mb-2">
              Concurrent Check Engine
            </h3>
            <p className="text-xs sm:text-sm text-[#6B6861] dark:text-[#9E9B93] leading-relaxed">
              Worker pool semaphore bounds active HTTP pings. Per-request 10s context timeouts ensure rogue endpoints never stall execution.
            </p>
          </div>

          <div className="bg-white dark:bg-[#1E1D1A] p-7 rounded-3xl border border-[#E5E0D5] dark:border-[#33312B] text-left shadow-soft">
            <div className="h-10 w-10 rounded-xl bg-[#FAF8F5] dark:bg-[#252420] border border-[#E5E0D5] dark:border-[#33312B] flex items-center justify-center text-[#C25E3E] mb-5">
              <BarChart3 className="h-5 w-5" />
            </div>
            <h3 className="font-serif text-xl font-normal text-[#1F1E1B] dark:text-[#F0ECE1] mb-2">
              SQL Aggregated Uptime
            </h3>
            <p className="text-xs sm:text-sm text-[#6B6861] dark:text-[#9E9B93] leading-relaxed">
              PostgreSQL calculates exact uptime ratios over 24h, 7d, and 30d periods inside fast aggregation queries rather than memory loops.
            </p>
          </div>

          <div className="bg-white dark:bg-[#1E1D1A] p-7 rounded-3xl border border-[#E5E0D5] dark:border-[#33312B] text-left shadow-soft">
            <div className="h-10 w-10 rounded-xl bg-[#FAF8F5] dark:bg-[#252420] border border-[#E5E0D5] dark:border-[#33312B] flex items-center justify-center text-[#C25E3E] mb-5">
              <Bell className="h-5 w-5" />
            </div>
            <h3 className="font-serif text-xl font-normal text-[#1F1E1B] dark:text-[#F0ECE1] mb-2">
              Zero Alert Spam
            </h3>
            <p className="text-xs sm:text-sm text-[#6B6861] dark:text-[#9E9B93] leading-relaxed">
              Alerts only fire when an endpoint transitions from healthy to failing. You get alerted when it matters, not on every consecutive ping.
            </p>
          </div>
        </div>
      </section>

      {/* 3. Pricing Cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-[#E8E4DA] dark:border-[#2C2A25]">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-bold text-[#C25E3E] uppercase tracking-widest">
            Straightforward Pricing
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-normal text-[#1F1E1B] dark:text-[#F0ECE1] mt-2">
            Start free, upgrade as you scale
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          {/* Free Starter */}
          <div className="bg-white dark:bg-[#1E1D1A] p-8 rounded-3xl border border-[#E5E0D5] dark:border-[#33312B] text-left flex flex-col justify-between shadow-soft">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-serif text-2xl font-normal text-[#1F1E1B] dark:text-[#F0ECE1]">Free</h3>
                <span className="text-xs px-2.5 py-1 rounded-full bg-[#FAF8F5] dark:bg-[#252420] text-[#6B6861] dark:text-[#9E9B93] border border-[#E5E0D5] dark:border-[#33312B]">
                  Community
                </span>
              </div>
              <div className="mb-6">
                <span className="text-4xl font-normal font-serif text-[#1F1E1B] dark:text-[#F0ECE1]">$0</span>
                <span className="text-xs text-[#8C887F]"> / month</span>
              </div>
              <ul className="space-y-3 text-xs sm:text-sm text-[#6B6861] dark:text-[#9E9B93]">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[#1E6B52] dark:text-[#34D399]" />
                  <span>5 active monitors</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[#1E6B52] dark:text-[#34D399]" />
                  <span>5-minute ping frequency</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[#1E6B52] dark:text-[#34D399]" />
                  <span>Email downtime notifications</span>
                </li>
              </ul>
            </div>
            <button
              onClick={() => onNavigate('register')}
              className="mt-8 w-full py-2.5 rounded-xl border border-[#E5E0D5] dark:border-[#33312B] bg-[#FAF8F5] dark:bg-[#161513] hover:bg-[#F3EFE6] dark:hover:bg-[#201F1C] text-xs font-semibold text-[#1F1E1B] dark:text-[#F0ECE1] transition-all"
            >
              Get started free
            </button>
          </div>

          {/* Pro Subscription */}
          <div className="bg-[#F8F5EC] dark:bg-[#22201C] p-8 rounded-3xl border border-[#DCD5C4] dark:border-[#3A3830] text-left flex flex-col justify-between shadow-soft relative">
            <div className="absolute -top-3 right-6 bg-[#C25E3E] text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              Popular
            </div>
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-serif text-2xl font-normal text-[#1F1E1B] dark:text-[#F0ECE1]">Pro</h3>
                <span className="text-xs px-2.5 py-1 rounded-full bg-[#C25E3E]/10 text-[#C25E3E] font-medium">
                  Production
                </span>
              </div>
              <div className="mb-6">
                <span className="text-4xl font-normal font-serif text-[#1F1E1B] dark:text-[#F0ECE1]">$19</span>
                <span className="text-xs text-[#8C887F]"> / month</span>
              </div>
              <ul className="space-y-3 text-xs sm:text-sm text-[#1F1E1B] dark:text-[#F0ECE1]">
                <li className="flex items-center gap-2 font-medium">
                  <CheckCircle2 className="h-4 w-4 text-[#C25E3E]" />
                  <span>50 active monitors</span>
                </li>
                <li className="flex items-center gap-2 font-medium">
                  <CheckCircle2 className="h-4 w-4 text-[#C25E3E]" />
                  <span>High-speed 30-second ping interval</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[#C25E3E]" />
                  <span>Priority SMTP alerting</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[#C25E3E]" />
                  <span>30-day extended telemetry</span>
                </li>
              </ul>
            </div>
            <button
              onClick={() => onNavigate('register')}
              className="mt-8 w-full py-2.5 rounded-xl bg-[#1F1E1B] hover:bg-black text-white dark:bg-[#F0ECE1] dark:text-[#151413] dark:hover:bg-white text-xs font-semibold transition-all"
            >
              Start 14-day Pro trial
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
