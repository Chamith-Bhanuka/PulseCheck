import React, { useState, useEffect } from 'react';
import { Activity, ShieldCheck, Clock, CheckCircle2, AlertTriangle, ArrowLeft } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { api } from '../api/client';
import StatusBadge from '../components/StatusBadge';

export default function PublicStatusPage({ monitorId, onBack }) {
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
    <div className="min-h-screen ambient-glow py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {onBack && (
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 text-xs text-slate-400 hover:text-white transition-colors mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Dashboard</span>
          </button>
        )}

        {/* Global Operational Banner */}
        <div className={`p-6 sm:p-8 rounded-3xl border mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl ${
          isHealthy
            ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
            : 'bg-rose-950/40 border-rose-500/30 text-rose-300'
        }`}>
          <div className="flex items-center gap-4">
            <div className={`h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 ${
              isHealthy ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
            }`}>
              {isHealthy ? <CheckCircle2 className="h-7 w-7" /> : <AlertTriangle className="h-7 w-7" />}
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold font-display text-white">
                {isHealthy ? 'All Systems Operational' : 'Degraded Service Performance'}
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                Live automated status probe for {monitor?.name || 'monitored service'}
              </p>
            </div>
          </div>
          <StatusBadge status={isHealthy ? 'online' : 'offline'} size="md" />
        </div>

        {/* Monitor Metrics Card */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 mb-8">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
            <div>
              <h2 className="text-lg font-semibold text-white font-display">
                {monitor?.name}
              </h2>
              <span className="text-xs font-mono text-slate-500 mt-1 block">
                {monitor?.url}
              </span>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-400">24-Hour Uptime</span>
              <div className="text-2xl font-extrabold text-emerald-400 font-display">
                {uptimePercentage.toFixed(2)}%
              </div>
            </div>
          </div>

          {/* Response Latency Graph */}
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="publicLatencyGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '12px',
                    fontSize: '12px',
                    color: '#f8fafc',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="latency"
                  name="Latency (ms)"
                  stroke="#10b981"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#publicLatencyGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Footer Credit */}
        <div className="text-center text-xs text-slate-500 flex items-center justify-center gap-2">
          <Activity className="h-4 w-4 text-emerald-400" />
          <span>Powered by PulseCheck &bull; Independent Edge Telemetry</span>
        </div>
      </div>
    </div>
  );
}
