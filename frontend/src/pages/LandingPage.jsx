import React, { useState, useEffect } from 'react';
import { 
  Activity, ShieldCheck, Zap, Bell, ArrowRight, CheckCircle2, 
  Clock, Globe, Server, BarChart3, Lock, Sparkles, ChevronRight 
} from 'lucide-react';
import StatusBadge from '../components/StatusBadge';

export default function LandingPage({ onNavigate }) {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen ambient-glow overflow-hidden">
      {/* 1. Hero Section with Parallax Background Accent Orbs */}
      <section className="relative pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        {/* Parallax Floating Blurred Orbs */}
        <div 
          className="absolute -top-10 left-1/2 -translate-x-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none transition-transform duration-300"
          style={{ transform: `translate(-50%, ${scrollY * 0.25}px)` }}
        />
        <div 
          className="absolute top-40 -left-20 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none transition-transform duration-300"
          style={{ transform: `translateY(${scrollY * 0.15}px)` }}
        />
        <div 
          className="absolute top-60 -right-20 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none transition-transform duration-300"
          style={{ transform: `translateY(${scrollY * 0.2}px)` }}
        />

        {/* Header Tag */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 text-xs font-semibold mb-8 backdrop-blur-md shadow-sm">
          <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
          <span>Next-Gen High Concurrency Monitoring</span>
        </div>

        {/* Hero Headline */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight font-display text-white max-w-4xl mx-auto leading-[1.1]">
          Detect API Outages <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
            Before Your Users Notice.
          </span>
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto font-normal leading-relaxed">
          Autonomous multi-tenant uptime monitoring backed by Go concurrency. 
          Pings your APIs every 30 seconds, delivers instant incident alerts, 
          and renders live public status pages.
        </p>

        {/* CTA Buttons */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => onNavigate('register')}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-base shadow-xl shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all active:scale-[0.98]"
          >
            <span>Start Monitoring Free</span>
            <ArrowRight className="h-4 w-4" />
          </button>
          <button
            onClick={() => onNavigate('login')}
            className="w-full sm:w-auto px-7 py-3.5 rounded-xl border border-slate-700 hover:border-slate-600 bg-slate-900/60 hover:bg-slate-800/80 text-white font-medium text-base transition-all"
          >
            Sign In to Dashboard
          </button>
        </div>

        {/* Interactive Live Monitor Simulation Card */}
        <div 
          className="mt-16 max-w-4xl mx-auto glass-panel p-6 sm:p-8 rounded-3xl shadow-2xl border border-slate-800/80 transition-transform duration-500"
          style={{ transform: `translateY(${Math.min(scrollY * 0.08, 40)}px)` }}
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800/60">
            <div className="flex items-center gap-3">
              <div className="h-3 w-3 rounded-full bg-rose-500/80" />
              <div className="h-3 w-3 rounded-full bg-amber-500/80" />
              <div className="h-3 w-3 rounded-full bg-emerald-500/80" />
              <span className="text-xs font-mono text-slate-500 ml-2">live-edge-scheduler.pulsecheck.io</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/50 px-3 py-1 rounded-full">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
              <span>All 20 Worker Threads Synchronized</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6">
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 text-left">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-slate-400">Target Endpoint</span>
                <StatusBadge status="online" size="sm" text="Operational" />
              </div>
              <div className="text-sm font-semibold text-white truncate">api.pulsecheck.dev/v1/health</div>
              <div className="mt-2 text-xs text-slate-500 flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-slate-400" />
                <span>30s interval &bull; 42ms latency</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 text-left">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-slate-400">Database Uptime</span>
                <span className="text-xs font-bold text-emerald-400">99.98%</span>
              </div>
              <div className="text-sm font-semibold text-white">PostgreSQL Multi-Region</div>
              <div className="mt-2 flex gap-1 h-2 items-center">
                {Array.from({ length: 24 }).map((_, i) => (
                  <div key={i} className="flex-1 h-full rounded-sm bg-emerald-500/80" />
                ))}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 text-left">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-slate-400">Incident Alert</span>
                <span className="text-xs text-indigo-400 font-medium">Auto-Dispatched</span>
              </div>
              <div className="text-sm font-semibold text-white truncate">SMTP / Mailtrap Relay</div>
              <div className="mt-2 text-xs text-slate-500 flex items-center gap-1.5">
                <Bell className="h-3.5 w-3.5 text-indigo-400" />
                <span>Zero alert spam &bull; State transition only</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Core Value Proposition Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold font-display text-white">
            Built for Modern High-Availability Infrastructure
          </h2>
          <p className="mt-4 text-slate-400 text-base">
            Engineered with idiomatic Go, robust PostgreSQL persistence, and a reactive dashboard.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="glass-panel p-8 rounded-2xl border border-slate-800 hover:border-emerald-500/40 transition-all group">
            <div className="h-12 w-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-6 group-hover:scale-110 transition-transform">
              <Zap className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-semibold text-white font-display mb-2">
              Goroutine Worker Pool
            </h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Checks run independently on bounded channels without unbounded thread bloat. 
              10-second context timeouts prevent rogue servers from stalling your workers.
            </p>
          </div>

          <div className="glass-panel p-8 rounded-2xl border border-slate-800 hover:border-indigo-500/40 transition-all group">
            <div className="h-12 w-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-6 group-hover:scale-110 transition-transform">
              <BarChart3 className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-semibold text-white font-display mb-2">
              Deep SQL Aggregation
            </h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Uptime percentages and response latencies are calculated directly inside 
              PostgreSQL queries over 24h, 7d, and 30d periods, eliminating memory bottlenecks.
            </p>
          </div>

          <div className="glass-panel p-8 rounded-2xl border border-slate-800 hover:border-teal-500/40 transition-all group">
            <div className="h-12 w-12 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 mb-6 group-hover:scale-110 transition-transform">
              <Globe className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-semibold text-white font-display mb-2">
              Public Status Pages
            </h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Showcase your reliability to customers with live, unauthenticated status pages. 
              Zero credentials or internal endpoints leaked.
            </p>
          </div>
        </div>
      </section>

      {/* 3. Pricing Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Transparent Tiers</span>
          <h2 className="text-3xl sm:text-4xl font-bold font-display text-white mt-2">
            Simple, Developer-Friendly Pricing
          </h2>
          <p className="mt-3 text-slate-400 text-sm">
            Start completely free, then upgrade seamlessly with Stripe when your microservices scale.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Free Tier */}
          <div className="glass-panel p-8 rounded-3xl border border-slate-800 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white font-display">Developer Free</h3>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-800 text-slate-300">
                  Starter
                </span>
              </div>
              <div className="mb-6">
                <span className="text-4xl font-extrabold text-white font-display">$0</span>
                <span className="text-slate-500 text-sm"> / forever</span>
              </div>
              <ul className="space-y-3.5 text-sm text-slate-300">
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>Up to 5 active monitors</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>5-minute ping frequency</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>Email downtime alerts</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>24-hour analytics history</span>
                </li>
              </ul>
            </div>
            <button
              onClick={() => onNavigate('register')}
              className="mt-8 w-full py-3 rounded-xl border border-slate-700 hover:border-slate-600 bg-slate-900/80 hover:bg-slate-800 text-white font-semibold text-sm transition-all"
            >
              Get Started Free
            </button>
          </div>

          {/* Paid Pro Tier */}
          <div className="glass-panel p-8 rounded-3xl border border-emerald-500/40 relative flex flex-col justify-between glow-emerald bg-[#0c1424]">
            <div className="absolute -top-3 right-8 bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-extrabold text-xs px-3 py-1 rounded-full uppercase tracking-wider shadow-md">
              Most Popular
            </div>
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white font-display">Pro Plan</h3>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300">
                  Production Ready
                </span>
              </div>
              <div className="mb-6">
                <span className="text-4xl font-extrabold text-white font-display">$19</span>
                <span className="text-slate-500 text-sm"> / month</span>
              </div>
              <ul className="space-y-3.5 text-sm text-slate-300">
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span className="font-semibold text-white">Up to 50 active monitors</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span className="font-semibold text-white">Ultra-fast 30-second ping interval</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>Priority email alerting</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>30-day extended uptime metrics</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>Customizable public status pages</span>
                </li>
              </ul>
            </div>
            <button
              onClick={() => onNavigate('register')}
              className="mt-8 w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/25 transition-all"
            >
              Start 14-Day Pro Trial
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
