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
    <div className="min-h-screen bg-[#FAF8F5] dark:bg-[#151413] text-[#1F1E1B] dark:text-[#F0ECE1] py-12 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="max-w-3xl mx-auto">
        {onBack && (
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 text-xs font-medium text-[#6B6861] dark:text-[#9E9B93] hover:text-[#1F1E1B] dark:hover:text-white transition-colors mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Dashboard</span>
          </button>
        )}

        {/* Global Operational Banner */}
        <div className={`p-6 sm:p-7 rounded-3xl border mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-soft ${
          isHealthy
            ? 'bg-[#EBF5EE] border-[#CDE5D4] dark:bg-[#1A2E24] dark:border-[#244234] text-[#1E6B52] dark:text-[#6EE7B7]'
            : 'bg-[#FDF2F0] border-[#F5D5CE] dark:bg-[#2E1D19] dark:border-[#4D2821] text-[#C25E3E] dark:text-[#F87171]'
        }`}>
          <div className="flex items-center gap-3.5">
            <div className={`h-10 w-10 rounded-2xl flex items-center justify-center shrink-0 ${
              isHealthy ? 'bg-[#1E6B52]/10 text-[#1E6B52] dark:text-[#6EE7B7]' : 'bg-[#C25E3E]/10 text-[#C25E3E]'
            }`}>
              {isHealthy ? <CheckCircle2 className="h-6 w-6" /> : <AlertTriangle className="h-6 w-6" />}
            </div>
            <div>
              <h1 className="text-xl font-serif font-normal text-[#1F1E1B] dark:text-[#F0ECE1]">
                {isHealthy ? 'All Systems Operational' : 'Degraded Performance'}
              </h1>
              <p className="text-xs text-[#6B6861] dark:text-[#9E9B93] mt-0.5">
                Automated uptime telemetry for {monitor?.name || 'monitored service'}
              </p>
            </div>
          </div>
          <StatusBadge status={isHealthy ? 'online' : 'offline'} size="md" />
        </div>

        {/* Metric Details */}
        <div className="bg-white dark:bg-[#1E1D1A] p-6 sm:p-8 rounded-3xl border border-[#E5E0D5] dark:border-[#33312B] shadow-soft mb-8">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#E8E4DA] dark:border-[#2C2A25]">
            <div>
              <h2 className="text-base font-serif font-normal text-[#1F1E1B] dark:text-[#F0ECE1]">
                {monitor?.name}
              </h2>
              <span className="text-xs font-mono text-[#8C887F] mt-0.5 block">
                {monitor?.url}
              </span>
            </div>
            <div className="text-right">
              <span className="text-xs text-[#8C887F]">24-Hour Uptime</span>
              <div className="text-2xl font-serif font-normal text-[#1E6B52] dark:text-[#34D399]">
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
                    <stop offset="5%" stopColor="#1E6B52" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#1E6B52" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#2C2A25" : "#EAE6DC"} />
                <XAxis dataKey="time" stroke="#8C887F" tick={{ fontSize: 10 }} />
                <YAxis stroke="#8C887F" tick={{ fontSize: 10 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDark ? '#1E1D1A' : '#FFFFFF',
                    borderColor: isDark ? '#33312B' : '#E5E0D5',
                    borderRadius: '12px',
                    fontSize: '11px',
                    color: isDark ? '#F0ECE1' : '#1F1E1B',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="latency"
                  name="Latency (ms)"
                  stroke="#1E6B52"
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
          <Activity className="h-3.5 w-3.5 text-[#C25E3E]" />
          <span>PulseCheck Uptime &bull; Edge Probe Telemetry</span>
        </div>
      </div>
    </div>
  );
}
