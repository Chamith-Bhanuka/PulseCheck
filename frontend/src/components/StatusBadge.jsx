import React from 'react';

export default function StatusBadge({ status = 'online', text, size = 'md' }) {
  const isOnline = status === 'online';
  const isOffline = status === 'offline';
  const isPending = status === 'pending';

  const dotSize = size === 'sm' ? 'h-1.5 w-1.5' : 'h-2 w-2';
  const textSize = size === 'sm' ? 'text-[11px] px-2 py-0.5' : 'text-xs px-2.5 py-1';

  let config = {
    bg: 'bg-[#EBF5EE] text-[#1E6B52] border-[#CDE5D4] dark:bg-[#1A2E24] dark:text-[#6EE7B7] dark:border-[#244234]',
    dot: 'bg-[#1E6B52] dark:bg-[#34D399]',
    label: text || 'Operational',
  };

  if (isOffline) {
    config = {
      bg: 'bg-[#FDF2F0] text-[#C25E3E] border-[#F5D5CE] dark:bg-[#2E1D19] dark:text-[#F87171] dark:border-[#4D2821]',
      dot: 'bg-[#C25E3E] dark:bg-[#F87171]',
      label: text || 'Offline',
    };
  } else if (isPending) {
    config = {
      bg: 'bg-[#FEF9EE] text-[#B45309] border-[#FDE6B8] dark:bg-[#2A2314] dark:text-[#FBBF24] dark:border-[#42371E]',
      dot: 'bg-[#B45309] dark:bg-[#FBBF24]',
      label: text || 'Checking',
    };
  } else if (status === 'paused' || status === 'inactive') {
    config = {
      bg: 'bg-[#F5F2EB] text-[#78716C] border-[#E5E0D5] dark:bg-[#24221E] dark:text-[#A8A29E] dark:border-[#38352F]',
      dot: 'bg-[#78716C] dark:bg-[#A8A29E]',
      label: text || 'Paused',
    };
  }

  return (
    <span className={`inline-flex items-center gap-1.5 font-medium rounded-full border ${config.bg} ${textSize}`}>
      <span className={`rounded-full ${dotSize} ${config.dot}`} />
      <span>{config.label}</span>
    </span>
  );
}
