import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Clock, ExternalLink, Activity, ShieldCheck, 
  AlertTriangle, RefreshCw, CheckCircle2, XCircle, Share2, Copy, Check 
} from 'lucide-react';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid 
} from 'recharts';
import { api } from '../api/client';
import StatusBadge from '../components/StatusBadge';

export default function MonitorDetailPage({ monitorId, onBack, onNavigatePublic }) {
  const [monitor, setMonitor] = useState(null);
  const [history, setHistory] = useState(null);
  const [period, setPeriod] = useState('24h');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [monData, histData] = await Promise.all([
        api.monitors.get(monitorId),
        api.monitors.getHistory(monitorId, period),
      ]);

      setMonitor(monData);
      setHistory(histData);
    } catch (err) {
      setError(err.message || 'Failed to load monitor details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [monitorId, period]);

  const copyPublicLink = () => {
    const url = `${window.location.origin}/status/${monitorId}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const chartData = (history?.recent_checks || [])
    .slice()
    .reverse()
    .map((check) => ({
      time: new Date(check.checked_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      latency: check.response_time_ms,
      status: check.status_code,
      success: check.success,
    }));

  const uptimeStats = history?.uptime || {
    uptime_percentage: 100,
    total_checks: 0,
    successful_checks: 0,
    failed_checks: 0,
    avg_response_time_ms: 0,
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Back Nav & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to All Monitors</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={copyPublicLink}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-800 bg-slate-900/60 hover:bg-slate-800 text-xs font-medium text-slate-300 hover:text-white transition-all"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Share2 className="h-3.5 w-3.5" />}
            <span>{copied ? 'Copied Link' : 'Share Public Status'}</span>
          </button>

          <button
            onClick={() => onNavigatePublic(monitorId)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-800 bg-slate-900/60 hover:bg-slate-800 text-xs font-medium text-slate-300 hover:text-white transition-all"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            <span>Public Page</span>
          </button>

          <button
            onClick={fetchData}
            className="p-1.5 rounded-xl border border-slate-800 bg-slate-900/60 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            title="Refresh"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {loading && !monitor ? (
        <div className="glass-panel p-20 rounded-3xl border border-slate-800 text-center">
          <RefreshCw className="h-8 w-8 text-emerald-400 animate-spin mx-auto mb-4" />
          <p className="text-sm text-slate-400">Loading monitor history...</p>
        </div>
      ) : error ? (
        <div className="glass-panel p-8 rounded-3xl border border-rose-500/30 text-center text-rose-300">
          <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-rose-400" />
          <p>{error}</p>
        </div>
      ) : (
        <>
          {/* Monitor Identity Card */}
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 mb-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl sm:text-3xl font-bold font-display text-white">
                    {monitor?.name}
                  </h1>
                  <StatusBadge status={monitor?.is_active ? 'online' : 'inactive'} />
                </div>
                <div className="flex items-center gap-2 mt-2 text-xs sm:text-sm text-slate-400 font-mono">
                  <span>{monitor?.url}</span>
                  <span className="text-slate-600">&bull;</span>
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-bold text-xs">
                    {monitor?.method}
                  </span>
                  <span className="text-slate-600">&bull;</span>
                  <span className="text-slate-400">Expected: {monitor?.expected_status}</span>
                </div>
              </div>

              {/* Period Selector Tabs */}
              <div className="flex items-center p-1 rounded-xl bg-slate-900/90 border border-slate-800 self-start md:self-center">
                {['24h', '7d', '30d'].map((p) => (
                  <button
                    key={p}
                    onClick={() => setPeriod(p)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all ${
                      period === p
                        ? 'bg-emerald-500 text-slate-950 shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Metrics Ribbon */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-6">
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
                <span className="text-xs font-medium text-slate-400">Uptime Ratio</span>
                <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400 font-display mt-1">
                  {uptimeStats.uptime_percentage.toFixed(2)}%
                </div>
                <span className="text-[11px] text-slate-500 mt-1 block">Past {period} calculated</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
                <span className="text-xs font-medium text-slate-400">Avg Latency</span>
                <div className="text-2xl sm:text-3xl font-extrabold text-white font-display mt-1">
                  {Math.round(uptimeStats.avg_response_time_ms)}ms
                </div>
                <span className="text-[11px] text-slate-500 mt-1 block">Response duration</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
                <span className="text-xs font-medium text-slate-400">Total Executed Checks</span>
                <div className="text-2xl sm:text-3xl font-extrabold text-white font-display mt-1">
                  {uptimeStats.total_checks}
                </div>
                <span className="text-[11px] text-emerald-400/90 mt-1 block">
                  {uptimeStats.successful_checks} successful
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
                <span className="text-xs font-medium text-slate-400">Recorded Incidents</span>
                <div className="text-2xl sm:text-3xl font-extrabold font-display mt-1 text-rose-400">
                  {uptimeStats.failed_checks}
                </div>
                <span className="text-[11px] text-slate-500 mt-1 block">
                  {uptimeStats.failed_checks === 0 ? 'Zero downtime observed' : 'Failed probes'}
                </span>
              </div>
            </div>
          </div>

          {/* Response Latency Chart (Recharts) */}
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-white font-display">
                  Response Time Telemetry (ms)
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Chronological HTTP ping latency recorded by edge workers
                </p>
              </div>
              <span className="text-xs font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-2.5 py-1 rounded-full">
                Real-Time
              </span>
            </div>

            <div className="h-72 w-full">
              {chartData.length === 0 ? (
                <div className="h-full flex items-center justify-center text-sm text-slate-500">
                  Awaiting first ping telemetry...
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="latencyGradient" x1="0" y1="0" x2="0" y2="1">
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
                      name="Response Time (ms)"
                      stroke="#10b981"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#latencyGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Recent Probes Table */}
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800">
            <h3 className="text-lg font-semibold text-white font-display mb-4">
              Recent Probe Telemetry Log
            </h3>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-mono uppercase tracking-wider">
                    <th className="pb-3 font-medium">Status</th>
                    <th className="pb-3 font-medium">HTTP Code</th>
                    <th className="pb-3 font-medium">Latency</th>
                    <th className="pb-3 font-medium">Timestamp</th>
                    <th className="pb-3 font-medium">Incident Detail</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {(history?.recent_checks || []).map((chk) => (
                    <tr key={chk.id} className="hover:bg-slate-900/40 transition-colors">
                      <td className="py-3">
                        {chk.success ? (
                          <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            <span>Passed</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-rose-400 font-semibold">
                            <XCircle className="h-3.5 w-3.5" />
                            <span>Failed</span>
                          </span>
                        )}
                      </td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 rounded font-bold ${
                          chk.status_code >= 200 && chk.status_code < 300
                            ? 'bg-emerald-500/10 text-emerald-300'
                            : 'bg-rose-500/10 text-rose-300'
                        }`}>
                          {chk.status_code || '000'}
                        </span>
                      </td>
                      <td className="py-3 text-slate-300">
                        {chk.response_time_ms}ms
                      </td>
                      <td className="py-3 text-slate-400">
                        {new Date(chk.checked_at).toLocaleString()}
                      </td>
                      <td className="py-3 text-slate-500">
                        {chk.error_message || 'Healthy response received'}
                      </td>
                    </tr>
                  ))}
                  {(history?.recent_checks || []).length === 0 && (
                    <tr>
                      <td colSpan="5" className="py-8 text-center text-slate-500 font-sans">
                        No probe results recorded yet. Next scheduled tick running shortly.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
