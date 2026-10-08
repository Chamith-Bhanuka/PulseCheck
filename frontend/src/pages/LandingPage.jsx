import React, { useState, useEffect } from 'react';
import { 
  Activity, ShieldCheck, Zap, Bell, ArrowRight, CheckCircle2, 
  Clock, Globe, Server, BarChart3, Lock, Sparkles, ChevronRight, Terminal, Laptop
} from 'lucide-react';

export default function LandingPage({ onNavigate }) {
  const [activeTab, setActiveTab] = useState('api');
  const [simulatedPings, setSimulatedPings] = useState([
    { id: 1, name: 'api.pulsecheck.dev', status: 200, latency: 42, time: 'Just now' },
    { id: 2, name: 'billing.stripe.com', status: 200, latency: 58, time: '30s ago' },
    { id: 3, name: 'auth-service-us-east', status: 200, latency: 31, time: '1m ago' },
  ]);

  // Subtle real-time ping simulation inside hero canvas
  useEffect(() => {
    const interval = setInterval(() => {
      setSimulatedPings((prev) => {
        const nextLatency = Math.floor(30 + Math.random() * 25);
        const updated = [...prev];
        updated[0] = { ...updated[0], latency: nextLatency, time: 'Just now' };
        return updated;
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

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

          {/* Right Column: Architectural Grid Canvas with Interactive Telemetry Window */}
          <div className="lg:col-span-6 w-full">
            <div className="hero-grid-canvas rounded-3xl p-6 sm:p-10 border border-[#E5E0D5] dark:border-[#33312B] flex items-center justify-center min-h-[460px] shadow-sm relative overflow-hidden">
              
              {/* Optional Video Asset Layer: If video exists at /assets/hero-video.mp4, plays cleanly */}
              <video 
                className="hidden absolute inset-0 w-full h-full object-cover rounded-3xl"
                autoPlay 
                loop 
                muted 
                playsInline
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              >
                <source src="/assets/hero-video.mp4" type="video/mp4" />
              </video>

              {/* Floating Elevated Window Mockup (matching the Claude macOS window mockup) */}
              <div className="w-full max-w-lg bg-white dark:bg-[#1E1D1A] rounded-2xl border border-[#E5E0D5] dark:border-[#33312B] shadow-window overflow-hidden transition-transform duration-300 hover:scale-[1.01]">
                
                {/* Window Title Bar with Traffic Light Controls */}
                <div className="flex items-center justify-between px-4 py-3 bg-[#FAF8F5] dark:bg-[#181715] border-b border-[#E8E4DA] dark:border-[#2C2A25]">
                  <div className="flex items-center gap-2">
                    <div className="h-2.5 w-2.5 rounded-full bg-[#E57373]" />
                    <div className="h-2.5 w-2.5 rounded-full bg-[#FFB74D]" />
                    <div className="h-2.5 w-2.5 rounded-full bg-[#81C784]" />
                    <span className="text-[11px] font-mono text-[#8C887F] ml-2">PulseCheck Telemetry &bull; Go Engine</span>
                  </div>
                  <span className="text-[10px] font-mono text-[#1E6B52] dark:text-[#34D399] bg-[#E8F5E9] dark:bg-[#1C2C24] px-2 py-0.5 rounded-full font-semibold">
                    Live Pings
                  </span>
                </div>

                {/* Window Content Split */}
                <div className="grid grid-cols-12 min-h-[260px]">
                  {/* Left Sidebar (Like Finder sidebar in Claude image) */}
                  <div className="col-span-4 bg-[#F7F4EC] dark:bg-[#181714] p-3 border-r border-[#E8E4DA] dark:border-[#2C2A25] text-left">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-[#8C887F] block mb-2 px-1">
                      Monitored
                    </span>
                    <div className="space-y-1">
                      <div className="px-2 py-1.5 rounded-lg bg-white dark:bg-[#252420] text-xs font-medium text-[#1F1E1B] dark:text-white shadow-xs flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        <span className="truncate">Production</span>
                      </div>
                      <div className="px-2 py-1.5 rounded-lg text-xs text-[#6B6861] dark:text-[#9E9B93] hover:bg-white/60 dark:hover:bg-[#252420]/60 transition-colors flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        <span className="truncate">Stripe API</span>
                      </div>
                      <div className="px-2 py-1.5 rounded-lg text-xs text-[#6B6861] dark:text-[#9E9B93] hover:bg-white/60 dark:hover:bg-[#252420]/60 transition-colors flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        <span className="truncate">Auth Gateway</span>
                      </div>
                    </div>
                  </div>

                  {/* Main Content Pane */}
                  <div className="col-span-8 p-4 text-left flex flex-col justify-between bg-white dark:bg-[#1E1D1A]">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="text-xs font-semibold text-[#1F1E1B] dark:text-[#F0ECE1]">
                          api.pulsecheck.dev/health
                        </div>
                        <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded">
                          HTTP 200
                        </span>
                      </div>

                      {/* Mini Latency Waves */}
                      <div className="space-y-2 mt-3 font-mono text-[11px]">
                        {simulatedPings.map((ping) => (
                          <div key={ping.id} className="p-2 rounded-lg bg-[#FAF8F5] dark:bg-[#161513] border border-[#EAE6DC] dark:border-[#2C2A25] flex items-center justify-between">
                            <span className="text-[#6B6861] dark:text-[#9E9B93] truncate max-w-[130px]">{ping.name}</span>
                            <span className="font-semibold text-emerald-600 dark:text-emerald-400">{ping.latency}ms</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Window Bottom Status Bar */}
                    <div className="pt-3 border-t border-[#EAE6DC] dark:border-[#2C2A25] flex items-center justify-between text-[11px] text-[#8C887F]">
                      <span>Worker Pool: 20 Slots</span>
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">99.98% Uptime</span>
                    </div>
                  </div>
                </div>

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
