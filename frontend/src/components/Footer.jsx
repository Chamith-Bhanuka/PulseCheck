import React from 'react';
import { Activity } from 'lucide-react';

export default function Footer({ onNavigate }) {
  return (
    <footer className="border-t border-[#E6E3DA] dark:border-[#2E2D29] bg-[#FBFBF9] dark:bg-[#141413] text-[#6E6A63] dark:text-[#96938C] py-12 px-4 sm:px-6 lg:px-8 mt-auto transition-colors">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <div className="h-6 w-6 rounded-lg bg-[#1E5E4B]/10 dark:bg-[#2E8B6E]/20 border border-[#1E5E4B]/20 dark:border-[#2E8B6E]/30 flex items-center justify-center text-[#1E5E4B] dark:text-[#2E8B6E]">
            <Activity className="w-3.5 h-3.5 stroke-[2.2]" />
          </div>
          <span className="font-sans font-semibold text-[#1A1917] dark:text-[#F2EFE9] text-sm flex items-center gap-1">
            PulseCheck
            <span className="h-1.5 w-1.5 rounded-full bg-[#1E5E4B] dark:bg-[#2E8B6E]" />
          </span>
          <span className="text-xs text-[#8C887F] dark:text-[#807D75]">
            &copy; {new Date().getFullYear()} PulseCheck. High-concurrency uptime infrastructure.
          </span>
        </div>

        <div className="flex items-center gap-6 text-xs font-medium">
          <button 
            onClick={() => onNavigate('landing')}
            className="hover:text-[#1A1917] dark:hover:text-white transition-colors"
          >
            Product
          </button>
          <button 
            onClick={() => onNavigate('billing')}
            className="hover:text-[#1A1917] dark:hover:text-white transition-colors"
          >
            Pricing
          </button>
          <span className="inline-flex items-center gap-1.5 text-[11px] text-[#1E5E4B] dark:text-[#2E8B6E] bg-[#E8F3EE] dark:bg-[#182B24] border border-[#1E5E4B]/20 dark:border-[#2E8B6E]/30 px-2.5 py-0.5 rounded-full">
            <span className="h-1.5 w-1.5 rounded-full bg-[#1E5E4B] dark:bg-[#2E8B6E] animate-pulse" />
            20 Engine Slots Active
          </span>
        </div>
      </div>
    </footer>
  );
}
