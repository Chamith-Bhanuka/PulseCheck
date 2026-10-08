import React from 'react';

export default function Footer({ onNavigate }) {
  return (
    <footer className="border-t border-[#E8E4DA] dark:border-[#2C2A25] bg-[#FAF8F5] dark:bg-[#151413] text-[#6B6861] dark:text-[#9E9B93] py-12 px-4 sm:px-6 lg:px-8 mt-auto transition-colors">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <div className="h-6 w-6 rounded-full bg-[#C25E3E]/10 dark:bg-[#D87754]/20 flex items-center justify-center text-[#C25E3E] dark:text-[#D87754]">
            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="4" />
            </svg>
          </div>
          <span className="font-serif font-semibold text-[#1F1E1B] dark:text-[#F0ECE1] text-sm">
            PulseCheck
          </span>
          <span className="text-xs text-[#8C887F] dark:text-[#807D75]">
            &copy; {new Date().getFullYear()} PulseCheck Inc. All rights reserved.
          </span>
        </div>

        <div className="flex items-center gap-6 text-xs font-medium">
          <button 
            onClick={() => onNavigate('landing')}
            className="hover:text-[#1F1E1B] dark:hover:text-white transition-colors"
          >
            Product
          </button>
          <button 
            onClick={() => onNavigate('billing')}
            className="hover:text-[#1F1E1B] dark:hover:text-white transition-colors"
          >
            Pricing
          </button>
          <span className="inline-flex items-center gap-1.5 text-[11px] text-[#1E6B52] dark:text-[#6EE7B7] bg-[#EBF5EE] dark:bg-[#1A2E24] px-2.5 py-0.5 rounded-full">
            <span className="h-1.5 w-1.5 rounded-full bg-[#1E6B52] dark:bg-[#34D399]" />
            Edge Pings Active
          </span>
        </div>
      </div>
    </footer>
  );
}
