import React, { useState, useEffect } from 'react';
import { 
  Activity, ShieldCheck, Zap, Bell, ArrowRight, CheckCircle2, 
  Clock, Globe, Server, BarChart3, Lock, Sparkles, ChevronRight, Terminal, Laptop
} from 'lucide-react';

export default function LandingPage({ onNavigate }) {
  const [emailInput, setEmailInput] = useState('');
  const [selectedHeroEndpoint, setSelectedHeroEndpoint] = useState('production');
  const [cursorPos, setCursorPos] = useState({ x: 75, y: 40 });

  // Natural animated cursor gliding over endpoints to showcase live monitoring
  useEffect(() => {
    const positions = [
      { x: 28, y: 32, endpoint: 'production' },
      { x: 28, y: 52, endpoint: 'stripe' },
      { x: 28, y: 72, endpoint: 'auth' },
      { x: 70, y: 42, endpoint: 'production' },
    ];
    let idx = 0;
    const cursorInterval = setInterval(() => {
      idx = (idx + 1) % positions.length;
      setCursorPos({ x: positions[idx].x, y: positions[idx].y });
      if (positions[idx].endpoint) {
        setSelectedHeroEndpoint(positions[idx].endpoint);
      }
    }, 4200);
    return () => clearInterval(cursorInterval);
  }, []);

  const endpointDetails = {
    production: {
      name: 'Production API',
      url: 'api.pulsecheck.dev/health',
      status: 200,
      latency: 38,
      uptime: '99.99%',
      regions: [
        { name: 'US-East (Virginia)', latency: '32ms', status: 'optimal' },
        { name: 'EU-Central (Frankfurt)', latency: '44ms', status: 'optimal' },
        { name: 'AP-South (Mumbai)', latency: '58ms', status: 'optimal' },
      ],
      logs: [
        { name: 'GET /v1/health', latency: '38ms', status: 200 },
        { name: 'POST /v1/tokens', latency: '42ms', status: 200 },
        { name: 'GET /v1/monitors', latency: '31ms', status: 200 },
      ]
    },
    stripe: {
      name: 'Stripe Webhooks',
      url: 'billing.stripe.com/v1/charges',
      status: 200,
      latency: 58,
      uptime: '99.95%',
      regions: [
        { name: 'US-East (Virginia)', latency: '48ms', status: 'optimal' },
        { name: 'EU-Central (Frankfurt)', latency: '62ms', status: 'optimal' },
        { name: 'AP-South (Mumbai)', latency: '74ms', status: 'optimal' },
      ],
      logs: [
        { name: 'POST /v1/charges', latency: '58ms', status: 200 },
        { name: 'GET /v1/invoices', latency: '51ms', status: 200 },
        { name: 'GET /v1/customers', latency: '54ms', status: 200 },
      ]
    },
    auth: {
      name: 'Auth Gateway',
      url: 'auth.pulsecheck.internal/verify',
      status: 200,
      latency: 24,
      uptime: '100.00%',
      regions: [
        { name: 'US-East (Virginia)', latency: '19ms', status: 'optimal' },
        { name: 'EU-Central (Frankfurt)', latency: '28ms', status: 'optimal' },
        { name: 'AP-South (Mumbai)', latency: '41ms', status: 'optimal' },
      ],
      logs: [
        { name: 'POST /jwt/verify', latency: '24ms', status: 200 },
        { name: 'POST /session/refresh', latency: '26ms', status: 200 },
        { name: 'GET /jwks.json', latency: '18ms', status: 200 },
      ]
    },
  };

  const currentEndpoint = endpointDetails[selectedHeroEndpoint] || endpointDetails.production;

  const handleStartFree = (e) => {
    e.preventDefault();
    onNavigate('register');
  };

  return (
    <div className="min-h-screen bg-[#FBFBF9] dark:bg-[#141413] text-[#1A1917] dark:text-[#F2EFE9] transition-colors">
      {/* 1. Hero Section - Tailored Infrastructure & Telemetry Layout */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-14 pb-14 sm:pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-10 items-center">
          
          {/* Left Column: Direct Value Headline & Modern SaaS Email CTA */}
          <div className="lg:col-span-6 flex flex-col items-start text-left max-w-xl">
            {/* Live Indicator Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#1E5E4B]/10 dark:bg-[#2E8B6E]/15 border border-[#1E5E4B]/20 dark:border-[#2E8B6E]/25 text-xs font-medium text-[#1E5E4B] dark:text-[#2E8B6E] mb-5 sm:mb-6 shadow-xs">
              <span className="h-2 w-2 rounded-full bg-[#1E5E4B] dark:bg-[#2E8B6E] animate-pulse" />
              <span>Continuous Uptime Engine &bull; Go Worker Pool</span>
            </div>

            <h1 className="font-serif text-3xl xs:text-4xl sm:text-5xl lg:text-[62px] leading-[1.12] sm:leading-[1.08] font-normal tracking-tight text-[#1A1917] dark:text-[#F2EFE9]">
              Catch API downtime <br />
              before your users notice
            </h1>
            
            <p className="mt-4 sm:mt-5 text-sm sm:text-base lg:text-lg text-[#6E6A63] dark:text-[#96938C] font-normal leading-relaxed">
              Detect service interruptions in 30 seconds. Powered by high-concurrency Go goroutines, multi-region latency telemetry, and instant email alerting.
            </p>

            {/* Modern SaaS Email CTA Box */}
            <div className="mt-6 sm:mt-8 w-full">
              <form 
                onSubmit={handleStartFree}
                className="flex flex-col sm:flex-row items-stretch gap-2.5 p-1.5 sm:p-2 bg-white dark:bg-[#1C1C1B] border border-[#E6E3DA] dark:border-[#2E2D29] rounded-2xl shadow-soft"
              >
                <div className="relative flex-1">
                  <input
                    type="email"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="Enter your work email..."
                    className="w-full px-3.5 sm:px-4 py-2.5 sm:py-3 bg-transparent text-sm text-[#1A1917] dark:text-[#F2EFE9] placeholder-[#96938C] focus:outline-none"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="w-full sm:w-auto px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl bg-[#1A1917] hover:bg-black dark:bg-[#F2EFE9] dark:hover:bg-white text-white dark:text-[#141413] text-sm font-semibold transition-all flex items-center justify-center gap-2 whitespace-nowrap shadow-xs"
                >
                  <span>Start Monitoring Free</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </form>

              {/* Trust Badges */}
              <div className="mt-3.5 sm:mt-4 flex flex-wrap items-center gap-y-2 gap-x-4 sm:gap-x-5 text-xs text-[#6E6A63] dark:text-[#96938C]">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-[#1E5E4B] dark:text-[#2E8B6E] shrink-0" />
                  <span>No credit card required</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-[#1E5E4B] dark:text-[#2E8B6E] shrink-0" />
                  <span>5 free monitors</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-[#1E5E4B] dark:text-[#2E8B6E] shrink-0" />
                  <span>30-second check intervals</span>
                </span>
              </div>
            </div>

            {/* Direct sign in link */}
            <div className="mt-5 sm:mt-6 flex items-center gap-2 text-xs text-[#6E6A63] dark:text-[#96938C]">
              <span>Already registered?</span>
              <button
                onClick={() => onNavigate('login')}
                className="font-semibold text-[#1A1917] dark:text-[#F2EFE9] hover:underline flex items-center gap-1"
              >
                <span>Sign in with your account</span>
                <ChevronRight className="h-3 w-3" />
              </button>
            </div>
          </div>

          {/* Right Column: Architectural Grid Canvas with Dedicated Live Telemetry Console */}
          <div className="lg:col-span-6 w-full">
            <div className="hero-grid-canvas rounded-2xl sm:rounded-3xl p-3 sm:p-6 lg:p-8 border border-[#E6E3DA] dark:border-[#2E2D29] flex flex-col items-center justify-center min-h-auto sm:min-h-[490px] shadow-sm relative overflow-hidden">
              
              {/* Elevated Window Mockup */}
              <div className="w-full max-w-lg bg-white dark:bg-[#1C1C1B] rounded-2xl border border-[#E6E3DA] dark:border-[#2E2D29] shadow-window overflow-hidden transition-transform duration-300 hover:scale-[1.01] relative select-none">
                
                {/* Window Title Bar with Traffic Light Controls */}
                <div className="flex items-center justify-between px-3.5 sm:px-4 py-2.5 sm:py-3 bg-[#F8F7F2] dark:bg-[#181817] border-b border-[#E8E5DD] dark:border-[#2A2926]">
                  <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                    <div className="h-2.5 w-2.5 rounded-full bg-[#E57373] shrink-0" />
                    <div className="h-2.5 w-2.5 rounded-full bg-[#FFB74D] shrink-0" />
                    <div className="h-2.5 w-2.5 rounded-full bg-[#81C784] shrink-0" />
                    <span className="text-[10px] sm:text-[11px] font-mono text-[#8C887F] ml-1 sm:ml-2 truncate">
                      telemetry.pulsecheck.dev<span className="hidden sm:inline"> &bull; Go Engine</span>
                    </span>
                  </div>
                  <span className="text-[9px] sm:text-[10px] font-mono text-[#1E5E4B] dark:text-[#2E8B6E] bg-[#E8F3EE] dark:bg-[#182B24] px-2 py-0.5 sm:px-2.5 rounded-full font-semibold flex items-center gap-1 shrink-0">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#1E5E4B] dark:bg-[#2E8B6E] animate-pulse" />
                    Live Checks (30s)
                  </span>
                </div>

                {/* Telemetry Window Grid */}
                <div className="flex flex-col sm:grid sm:grid-cols-12 min-h-auto sm:min-h-[300px] relative">
                  
                  {/* Simulated Gliding Cursor */}
                  <div 
                    className="hidden sm:block absolute z-30 pointer-events-none transition-all duration-1000 ease-in-out"
                    style={{ top: `${cursorPos.y}%`, left: `${cursorPos.x}%` }}
                  >
                    <svg className="w-5 h-5 drop-shadow-md text-[#1A1917]" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M4.5 2.5L18.5 13.5L11.5 14.5L8.5 21.5L4.5 2.5Z" stroke="white" strokeWidth="1.5" strokeLinejoin="round"/>
                    </svg>
                  </div>

                  {/* Left Sidebar: Monitored Endpoints */}
                  <div className="sm:col-span-4 bg-[#F5F4EE] dark:bg-[#171716] p-2.5 sm:p-3 border-b sm:border-b-0 sm:border-r border-[#E8E5DD] dark:border-[#2A2926] text-left">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-[#8C887F] block mb-1.5 sm:mb-2 px-1">
                      Monitored
                    </span>
                    <div className="flex sm:flex-col gap-1.5 overflow-x-auto sm:overflow-visible pb-1 sm:pb-0">
                      {Object.entries(endpointDetails).map(([key, item]) => {
                        const isSelected = selectedHeroEndpoint === key;
                        return (
                          <button
                            key={key}
                            onClick={() => setSelectedHeroEndpoint(key)}
                            className={`whitespace-nowrap sm:whitespace-normal w-auto sm:w-full text-left px-2 sm:px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center justify-between gap-2 shrink-0 sm:shrink ${
                              isSelected
                                ? 'bg-white dark:bg-[#242422] text-[#1A1917] dark:text-white shadow-xs font-semibold'
                                : 'text-[#6E6A63] dark:text-[#96938C] hover:bg-white/60 dark:hover:bg-[#242422]/60'
                            }`}
                          >
                            <div className="flex items-center gap-1.5 truncate">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />
                              <span className="truncate">{item.name}</span>
                            </div>
                            <span className="text-[10px] font-mono text-[#8C887F] shrink-0">{item.latency}ms</span>
                          </button>
                        );
                      })}
                    </div>

                    <div className="hidden sm:block mt-4 pt-3 border-t border-[#E8E5DD] dark:border-[#2A2926] px-1">
                      <span className="text-[10px] uppercase font-semibold text-[#8C887F] block mb-1">
                        Edge Nodes
                      </span>
                      <div className="text-[10px] font-mono text-[#6E6A63] dark:text-[#96938C] space-y-0.5">
                        <div className="flex items-center justify-between">
                          <span>US-East:</span>
                          <span className="text-emerald-600 font-semibold">Healthy</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>EU-Central:</span>
                          <span className="text-emerald-600 font-semibold">Healthy</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Main Pane: Active Endpoint Inspector */}
                  <div className="sm:col-span-8 p-3.5 sm:p-4 text-left flex flex-col justify-between bg-white dark:bg-[#1C1C1B]">
                    <div>
                      {/* Active Endpoint Header */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <div className="text-xs font-semibold text-[#1A1917] dark:text-[#F2EFE9] truncate max-w-[140px] xs:max-w-[200px] sm:max-w-[170px]">
                          {currentEndpoint.url}
                        </div>
                        <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded shrink-0">
                          HTTP {currentEndpoint.status} OK
                        </span>
                      </div>

                      {/* Real-time Latency Logs */}
                      <div className="space-y-1.5 mt-2 font-mono text-[11px]">
                        {currentEndpoint.logs.map((log, idx) => (
                          <div key={idx} className="p-2 rounded-lg bg-[#F8F7F2] dark:bg-[#151514] border border-[#ECE9E1] dark:border-[#2A2926] flex items-center justify-between gap-2">
                            <span className="text-[#6E6A63] dark:text-[#96938C] truncate max-w-[120px] xs:max-w-[170px] sm:max-w-[140px]">{log.name}</span>
                            <span className="font-semibold text-emerald-600 dark:text-emerald-400 shrink-0">{log.latency}</span>
                          </div>
                        ))}
                      </div>

                      {/* Edge Latency Breakdown */}
                      <div className="mt-3 pt-2.5 border-t border-[#ECE9E1] dark:border-[#2A2926]">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-[#8C887F] block mb-1.5">
                          Multi-Region Latency
                        </span>
                        <div className="grid grid-cols-3 gap-1.5 text-center font-mono">
                          {currentEndpoint.regions.map((reg, idx) => (
                            <div key={idx} className="bg-[#F8F7F2] dark:bg-[#151514] p-1.5 rounded border border-[#ECE9E1] dark:border-[#2A2926]">
                              <span className="text-[9px] text-[#8C887F] block truncate">{reg.name.split(' ')[0]}</span>
                              <span className="text-[10px] font-semibold text-[#1E5E4B] dark:text-[#2E8B6E]">{reg.latency}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Window Bottom Status Bar */}
                    <div className="pt-3 border-t border-[#ECE9E1] dark:border-[#2A2926] flex items-center justify-between text-[11px] text-[#8C887F] font-mono mt-3 sm:mt-0">
                      <span>Worker Pool: 20 Slots</span>
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">{currentEndpoint.uptime} Uptime</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 2. Core Pillars - Warm Editorial Engineering Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 border-t border-[#E6E3DA] dark:border-[#2E2D29]">
        <div className="max-w-2xl text-left mb-10 sm:mb-14">
          <span className="text-xs font-bold text-[#1E5E4B] dark:text-[#2E8B6E] uppercase tracking-widest block mb-2">
            Engineered for Reliability
          </span>
          <h2 className="font-serif text-2xl xs:text-3xl sm:text-4xl font-normal text-[#1A1917] dark:text-[#F2EFE9]">
            Clean architecture without the noise
          </h2>
          <p className="mt-3 text-sm sm:text-base text-[#6E6A63] dark:text-[#96938C]">
            Built with production-grade Go concurrency patterns, zero false alarms, and instant resolution.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-[#1C1C1B] p-6 sm:p-7 rounded-3xl border border-[#E6E3DA] dark:border-[#2E2D29] text-left shadow-soft">
            <div className="h-10 w-10 rounded-xl bg-[#F8F7F2] dark:bg-[#242422] border border-[#E6E3DA] dark:border-[#2E2D29] flex items-center justify-center text-[#1E5E4B] dark:text-[#2E8B6E] mb-5">
              <Zap className="h-5 w-5" />
            </div>
            <h3 className="font-serif text-xl font-normal text-[#1A1917] dark:text-[#F2EFE9] mb-2">
              Concurrent Worker Pool
            </h3>
            <p className="text-xs sm:text-sm text-[#6E6A63] dark:text-[#96938C] leading-relaxed">
              Buffered semaphore channels bound concurrent HTTP pings to 20 workers. 10-second per-ping context timeouts prevent hung connections.
            </p>
          </div>

          <div className="bg-white dark:bg-[#1C1C1B] p-6 sm:p-7 rounded-3xl border border-[#E6E3DA] dark:border-[#2E2D29] text-left shadow-soft">
            <div className="h-10 w-10 rounded-xl bg-[#F8F7F2] dark:bg-[#242422] border border-[#E6E3DA] dark:border-[#2E2D29] flex items-center justify-center text-[#1E5E4B] dark:text-[#2E8B6E] mb-5">
              <BarChart3 className="h-5 w-5" />
            </div>
            <h3 className="font-serif text-xl font-normal text-[#1A1917] dark:text-[#F2EFE9] mb-2">
              SQL Aggregated Uptime
            </h3>
            <p className="text-xs sm:text-sm text-[#6E6A63] dark:text-[#96938C] leading-relaxed">
              PostgreSQL calculates uptime percentages over 24h, 7d, and 30d periods directly in indexed SQL aggregation queries for fast response times.
            </p>
          </div>

          <div className="bg-white dark:bg-[#1C1C1B] p-6 sm:p-7 rounded-3xl border border-[#E6E3DA] dark:border-[#2E2D29] text-left shadow-soft">
            <div className="h-10 w-10 rounded-xl bg-[#F8F7F2] dark:bg-[#242422] border border-[#E6E3DA] dark:border-[#2E2D29] flex items-center justify-center text-[#1E5E4B] dark:text-[#2E8B6E] mb-5">
              <Bell className="h-5 w-5" />
            </div>
            <h3 className="font-serif text-xl font-normal text-[#1A1917] dark:text-[#F2EFE9] mb-2">
              Zero Alert Spam
            </h3>
            <p className="text-xs sm:text-sm text-[#6E6A63] dark:text-[#96938C] leading-relaxed">
              Alerts only fire when an endpoint transitions from healthy to failing. You get notified immediately on state changes, never spammed repeatedly.
            </p>
          </div>
        </div>
      </section>

      {/* 3. Pricing Cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 border-t border-[#E6E3DA] dark:border-[#2E2D29]">
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
          <span className="text-xs font-bold text-[#1E5E4B] dark:text-[#2E8B6E] uppercase tracking-widest">
            Straightforward Pricing
          </span>
          <h2 className="font-serif text-2xl xs:text-3xl sm:text-4xl font-normal text-[#1A1917] dark:text-[#F2EFE9] mt-2">
            Start free, upgrade as you scale
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          {/* Free Starter */}
          <div className="bg-white dark:bg-[#1C1C1B] p-6 sm:p-8 rounded-3xl border border-[#E6E3DA] dark:border-[#2E2D29] text-left flex flex-col justify-between shadow-soft">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-serif text-2xl font-normal text-[#1A1917] dark:text-[#F2EFE9]">Free</h3>
                <span className="text-xs px-2.5 py-1 rounded-full bg-[#F5F4EE] dark:bg-[#242422] text-[#6E6A63] dark:text-[#96938C] border border-[#E6E3DA] dark:border-[#2E2D29]">
                  Community
                </span>
              </div>
              <div className="mb-6">
                <span className="text-4xl font-normal font-serif text-[#1A1917] dark:text-[#F2EFE9]">$0</span>
                <span className="text-xs text-[#8C887F]"> / month</span>
              </div>
              <ul className="space-y-3 text-xs sm:text-sm text-[#6E6A63] dark:text-[#96938C]">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[#1E5E4B] dark:text-[#2E8B6E] shrink-0" />
                  <span>5 active monitors</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[#1E5E4B] dark:text-[#2E8B6E] shrink-0" />
                  <span>5-minute ping frequency</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[#1E5E4B] dark:text-[#2E8B6E] shrink-0" />
                  <span>Email downtime notifications</span>
                </li>
              </ul>
            </div>
            <button
              onClick={() => onNavigate('register')}
              className="mt-8 w-full py-2.5 rounded-xl border border-[#E6E3DA] dark:border-[#2E2D29] bg-[#F8F7F2] dark:bg-[#181817] hover:bg-[#EFECE3] dark:hover:bg-[#252523] text-xs font-semibold text-[#1A1917] dark:text-[#F2EFE9] transition-all"
            >
              Get started free
            </button>
          </div>

          {/* Pro Subscription */}
          <div className="bg-[#F8F7F2] dark:bg-[#20201E] p-6 sm:p-8 rounded-3xl border border-[#DED9CC] dark:border-[#383733] text-left flex flex-col justify-between shadow-soft relative">
            <div className="absolute top-0 -translate-y-1/2 right-6 bg-[#E8F3EE] dark:bg-[#182B24] border border-[#1E5E4B]/20 dark:border-[#2E8B6E]/25 text-[#1E5E4B] dark:text-[#2E8B6E] text-[10px] font-bold px-3 py-0.5 rounded-full uppercase tracking-wider shadow-xs flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-[#1E5E4B] dark:bg-[#2E8B6E] animate-pulse" />
              <span>Popular</span>
            </div>
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-serif text-2xl font-normal text-[#1A1917] dark:text-[#F2EFE9]">Pro</h3>
                <span className="text-xs px-2.5 py-1 rounded-full bg-[#1E5E4B]/10 text-[#1E5E4B] dark:text-[#2E8B6E] font-medium">
                  Production
                </span>
              </div>
              <div className="mb-6">
                <span className="text-4xl font-normal font-serif text-[#1A1917] dark:text-[#F2EFE9]">$19</span>
                <span className="text-xs text-[#8C887F]"> / month</span>
              </div>
              <ul className="space-y-3 text-xs sm:text-sm text-[#1A1917] dark:text-[#F2EFE9]">
                <li className="flex items-center gap-2 font-medium">
                  <CheckCircle2 className="h-4 w-4 text-[#1E5E4B] dark:text-[#2E8B6E] shrink-0" />
                  <span>50 active monitors</span>
                </li>
                <li className="flex items-center gap-2 font-medium">
                  <CheckCircle2 className="h-4 w-4 text-[#1E5E4B] dark:text-[#2E8B6E] shrink-0" />
                  <span>High-speed 30-second ping interval</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[#1E5E4B] dark:text-[#2E8B6E] shrink-0" />
                  <span>Priority SMTP alerting</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[#1E5E4B] dark:text-[#2E8B6E] shrink-0" />
                  <span>30-day extended telemetry</span>
                </li>
              </ul>
            </div>
            <button
              onClick={() => onNavigate('register')}
              className="mt-8 w-full py-2.5 rounded-xl bg-[#1A1917] hover:bg-black text-white dark:bg-[#F2EFE9] dark:text-[#141413] dark:hover:bg-white text-xs font-semibold transition-all"
            >
              Start 14-day Pro trial
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
