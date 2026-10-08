import React from 'react';

export default function StatusBadge({ status = 'online', text, size = 'md' }) {
  const isOnline = status === 'online';
  const isOffline = status === 'offline';
  const isPending = status === 'pending';

  const dotSize = size === 'sm' ? 'h-1.5 w-1.5' : 'h-2 w-2';
  const textSize = size === 'sm' ? 'text-[11px] px-2 py-0.5' : 'text-xs px-2.5 py-1';

  let config = {
    bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    dot: 'bg-emerald-400',
    ping: 'bg-emerald-400',
    label: text || 'Operational',
  };

  if (isOffline) {
    config = {
      bg: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
      dot: 'bg-rose-400',
      ping: 'bg-rose-400',
      label: text || 'Offline',
    };
  } else if (isPending) {
    config = {
      bg: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      dot: 'bg-amber-400',
      ping: 'bg-amber-400',
      label: text || 'Checking',
    };
  } else if (status === 'paused' || status === 'inactive') {
    config = {
      bg: 'bg-slate-800 text-slate-400 border-slate-700',
      dot: 'bg-slate-500',
      ping: null,
      label: text || 'Paused',
    };
  }

  return (
    <span className={`inline-flex items-center gap-1.5 font-medium rounded-full border ${config.bg} ${textSize}`}>
      <span className="relative flex">
        {config.ping && (
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${config.ping} opacity-75`} />
        )}
        <span className={`relative inline-flex rounded-full ${dotSize} ${config.dot}`} />
      </span>
      <span>{config.label}</span>
    </span>
  );
}
