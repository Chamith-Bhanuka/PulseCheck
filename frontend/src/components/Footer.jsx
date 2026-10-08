import React from 'react';
import { Activity, ShieldCheck, Heart } from 'lucide-react';

export default function Footer({ onNavigate }) {
  return (
    <footer className="border-t border-slate-800/80 bg-[#060911] text-slate-400 py-12 px-4 sm:px-6 lg:px-8 mt-auto">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
            <Activity className="h-4 w-4 text-emerald-400" />
          </div>
          <span className="font-display font-semibold text-white tracking-tight">PulseCheck</span>
          <span className="text-xs text-slate-500">
            &copy; {new Date().getFullYear()} PulseCheck Inc. All rights reserved.
          </span>
        </div>

        <div className="flex items-center gap-6 text-sm">
          <button 
            onClick={() => onNavigate('landing')}
            className="hover:text-white transition-colors"
          >
            Product
          </button>
          <button 
            onClick={() => onNavigate('billing')}
            className="hover:text-white transition-colors"
          >
            Pricing
          </button>
          <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-2.5 py-0.5 rounded-full">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Global Edge Pings Active
          </span>
        </div>
      </div>
    </footer>
  );
}
