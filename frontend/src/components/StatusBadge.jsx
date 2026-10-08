import React from 'react';

export default function StatusBadge({ status = 'online', text, size = 'md' }) {
  const isOnline = status === 'online';
  const isOffline = status === 'offline';
  const isPending = status === 'pending';

  const dotSize = size === 'sm' ? 'h-1.5 w-1.5' : 'h-2 w-2';
  const textSize = size === 'sm' ? 'text-[11px] px-2 py-0.5' : 'text-xs px-2.5 py-1';

  let config = {
    bg: 'bg-[#E8F3EE] text-[#1E5E4B] border-[#1E5E4B]/20 dark:bg-[#182B24] dark:text-[#2E8B6E] dark:border-[#2E8B6E]/30',
    dot: 'bg-[#1E5E4B] dark:bg-[#2E8B6E]',
    label: text || 'Operational',
  };

  if (isOffline) {
    config = {
      bg: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900/50',
      dot: 'bg-rose-600 dark:bg-rose-400',
      label: text || 'Offline',
    };
  } else if (isPending) {
    config = {
      bg: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900/50',
      dot: 'bg-amber-600 dark:bg-amber-400',
      label: text || 'Checking',
    };
  } else if (status === 'paused' || status === 'inactive') {
    config = {
      bg: 'bg-[#F5F4EE] text-[#6E6A63] border-[#E6E3DA] dark:bg-[#242422] dark:text-[#96938C] dark:border-[#2E2D29]',
      dot: 'bg-[#6E6A63] dark:bg-[#96938C]',
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
