import React, { useState, useEffect } from 'react';
import { Activity, CheckCircle2, AlertTriangle, ArrowLeft } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { api } from '../api/client';
import StatusBadge from '../components/StatusBadge';
import { useTheme } from '../context/ThemeContext';

export default function PublicStatusPage({ monitorId, onBack }) {
  const { isDark } = useTheme();
  const [monitor, setMonitor] = useState(null);
  const [history, setHistory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPublicData = async () => {
      try {
        setLoading(true);
        setError(null);
        const [monData, histData] = await Promise.all([
          api.publicStatus.get(monitorId),
          api.publicStatus.getHistory(monitorId, '24h'),
        ]);
        setMonitor(monData);
        setHistory(histData);
      } catch (err) {
        setError(err.message || 'Public status page unavailable');
      } finally {
        setLoading(false);
      }
    };

    if (monitorId) {
      fetchPublicData();
    }
  }, [monitorId]);

  const chartData = (history?.recent_checks || [])
    .slice()
    .reverse()
    .map((chk) => ({
      time: new Date(chk.checked_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      latency: chk.response_time_ms,
    }));

  const uptimePercentage = history?.uptime?.uptime_percentage ?? 100;
  const isHealthy = monitor?.is_active && uptimePercentage >= 99.0;

  return (
    <div className="min-h-screen bg-[#FBFBF9] dark:bg-[#141413] text-[#1A1917] dark:text-[#F2EFE9] py-12 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="max-w-3xl mx-auto">
        {onBack && (
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 text-xs font-medium text-[#6E6A63] dark:text-[#96938C] hover:text-[#1A1917] dark:hover:text-white transition-colors mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Dashboard</span>
          </button>
        )}

        {/* Global Operational Banner */}
        <div className={`p-6 sm:p-7 rounded-3xl border mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-soft ${
          isHealthy
            ? 'bg-[#E8F3EE] border-[#1E5E4B]/20 dark:bg-[#182B24] dark:border-[#2E8B6E]/30 text-[#1E5E4B] dark:text-[#2E8B6E]'
            : 'bg-[#FDF2F0] border-[#F5D5CE] dark:bg-[#2E1D19] dark:border-[#4D2821] text-[#B85D36] dark:text-[#F87171]'
        }`}>
          <div className="flex items-center gap-3.5">
            <div className={`h-10 w-10 rounded-2xl flex items-center justify-center shrink-0 ${
              isHealthy ? 'bg-[#1E5E4B]/10 text-[#1E5E4B] dark:text-[#2E8B6E]' : 'bg-[#B85D36]/10 text-[#B85D36]'
            }`}>
              {isHealthy ? <CheckCircle2 className="h-6 w-6" /> : <AlertTriangle className="h-6 w-6" />}
            </div>
            <div>
              <h1 className="text-xl font-serif font-normal text-[#1A1917] dark:text-[#F2EFE9]">
                {isHealthy ? 'All Systems Operational' : 'Degraded Performance'}
              </h1>
              <p className="text-xs text-[#6E6A63] dark:text-[#96938C] mt-0.5">
                Automated uptime telemetry for {monitor?.name || 'monitored service'}
              </p>
            </div>
          </div>
          <StatusBadge status={isHealthy ? 'online' : 'offline'} size="md" />
        </div>

        {/* Metric Details */}
        <div className="bg-white dark:bg-[#1C1C1B] p-6 sm:p-8 rounded-3xl border border-[#E6E3DA] dark:border-[#2E2D29] shadow-soft mb-8">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#E8E5DD] dark:border-[#2A2926]">
            <div>
              <h2 className="text-base font-serif font-normal text-[#1A1917] dark:text-[#F2EFE9]">
                {monitor?.name}
              </h2>
              <span className="text-xs font-mono text-[#8C887F] mt-0.5 block truncate max-w-[180px] xs:max-w-xs sm:max-w-md">
                {monitor?.url}
              </span>
            </div>
            <div className="text-right">
              <span className="text-xs text-[#8C887F]">24-Hour Uptime</span>
              <div className="text-2xl font-serif font-normal text-[#1E5E4B] dark:text-[#2E8B6E]">
                {uptimePercentage.toFixed(2)}%
              </div>
            </div>
          </div>

          {/* Response Graph */}
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="pubWarmLatency" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={isDark ? "#2E8B6E" : "#1E5E4B"} stopOpacity={0.25} />
                    <stop offset="95%" stopColor={isDark ? "#2E8B6E" : "#1E5E4B"} stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#2A2926" : "#E8E5DD"} />
                <XAxis dataKey="time" stroke="#8C887F" tick={{ fontSize: 10 }} />
                <YAxis stroke="#8C887F" tick={{ fontSize: 10 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDark ? '#1C1C1B' : '#FFFFFF',
                    borderColor: isDark ? '#2E2D29' : '#E6E3DA',
                    borderRadius: '12px',
                    fontSize: '11px',
                    color: isDark ? '#F2EFE9' : '#1A1917',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="latency"
                  name="Latency (ms)"
                  stroke={isDark ? "#2E8B6E" : "#1E5E4B"}
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#pubWarmLatency)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Footer Credit */}
        <div className="text-center text-xs text-[#8C887F] flex items-center justify-center gap-1.5">
          <Activity className="h-3.5 w-3.5 text-[#1E5E4B] dark:text-[#2E8B6E]" />
          <span>PulseCheck Uptime &bull; Edge Probe Telemetry</span>
        </div>
      </div>
    </div>
  );
}
