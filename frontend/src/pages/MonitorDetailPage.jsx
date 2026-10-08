import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Clock, ExternalLink, Activity, 
  AlertTriangle, RefreshCw, CheckCircle2, XCircle, Share2, Check 
} from 'lucide-react';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid 
} from 'recharts';
import { api } from '../api/client';
import StatusBadge from '../components/StatusBadge';
import { useTheme } from '../context/ThemeContext';

export default function MonitorDetailPage({ monitorId, onBack, onNavigatePublic }) {
  const { isDark } = useTheme();
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

  const recentChecks = history?.recent_checks || [];
  const latestCheck = recentChecks.length > 0 ? recentChecks[0] : null;
  const currentStatus = !monitor?.is_active
    ? 'inactive'
    : latestCheck
      ? (latestCheck.success ? 'online' : 'offline')
      : 'online';

  const uptimeStats = history?.uptime || {
    uptime_percentage: 100,
    total_checks: 0,
    successful_checks: 0,
    failed_checks: 0,
    avg_response_time_ms: 0,
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Top Nav */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-medium text-[#6B6861] dark:text-[#9E9B93] hover:text-[#1F1E1B] dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Monitors</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={copyPublicLink}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#E5E0D5] dark:border-[#33312B] bg-white dark:bg-[#1E1D1A] hover:bg-[#FAF8F5] dark:hover:bg-[#252420] text-xs font-medium text-[#1F1E1B] dark:text-[#F0ECE1] transition-all"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" /> : <Share2 className="h-3.5 w-3.5" />}
            <span>{copied ? 'Copied Link' : 'Public Status Link'}</span>
          </button>

          <button
            onClick={() => onNavigatePublic(monitorId)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#E5E0D5] dark:border-[#33312B] bg-white dark:bg-[#1E1D1A] hover:bg-[#FAF8F5] dark:hover:bg-[#252420] text-xs font-medium text-[#1F1E1B] dark:text-[#F0ECE1] transition-all"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            <span>Public Page</span>
          </button>

          <button
            onClick={fetchData}
            className="p-1.5 rounded-full border border-[#E5E0D5] dark:border-[#33312B] bg-white dark:bg-[#1E1D1A] text-[#6B6861] dark:text-[#9E9B93] hover:text-[#1F1E1B] dark:hover:text-white transition-colors"
            title="Refresh"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {loading && !monitor ? (
        <div className="p-20 text-center bg-white dark:bg-[#1E1D1A] rounded-3xl border border-[#E5E0D5] dark:border-[#33312B]">
          <RefreshCw className="h-6 w-6 text-[#8C887F] animate-spin mx-auto mb-3" />
          <p className="text-xs text-[#6B6861] dark:text-[#9E9B93]">Loading telemetry...</p>
        </div>
      ) : error ? (
        <div className="p-8 rounded-3xl border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/20 text-center text-rose-700 dark:text-rose-300">
          <AlertTriangle className="h-6 w-6 mx-auto mb-2 text-rose-500" />
          <p className="text-xs">{error}</p>
        </div>
      ) : (
        <>
          {/* Identity Card */}
          <div className="bg-white dark:bg-[#1E1D1A] p-5 sm:p-6 md:p-8 rounded-3xl border border-[#E5E0D5] dark:border-[#33312B] shadow-soft mb-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#E8E4DA] dark:border-[#2C2A25]">
              <div>
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-2xl sm:text-3xl font-serif font-normal text-[#1F1E1B] dark:text-[#F0ECE1]">
                    {monitor?.name}
                  </h1>
                  <StatusBadge status={currentStatus} />
                </div>
                <div className="flex items-center gap-2 mt-2 text-xs text-[#6B6861] dark:text-[#9E9B93] font-mono flex-wrap">
                  <span className="truncate max-w-[180px] xs:max-w-xs sm:max-w-none">{monitor?.url}</span>
                  <span>&bull;</span>
                  <span className="px-2 py-0.5 rounded bg-[#FAF8F5] dark:bg-[#252420] border border-[#E5E0D5] dark:border-[#33312B]">
                    {monitor?.method}
                  </span>
                  <span>&bull;</span>
                  <span>Expected: {monitor?.expected_status}</span>
                </div>
              </div>

              {/* Period Tabs */}
              <div className="flex items-center self-start md:self-auto p-1 rounded-full bg-[#FAF8F5] dark:bg-[#161513] border border-[#E5E0D5] dark:border-[#33312B]">
                {['24h', '7d', '30d'].map((p) => (
                  <button
                    key={p}
                    onClick={() => setPeriod(p)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                      period === p
                        ? 'bg-[#1F1E1B] text-white dark:bg-[#F0ECE1] dark:text-[#151413]'
                        : 'text-[#6B6861] dark:text-[#9E9B93] hover:text-[#1F1E1B] dark:hover:text-white'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Metrics Ribbon */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 pt-6">
              <div className="p-4 rounded-2xl bg-[#FAF8F5] dark:bg-[#161513] border border-[#E5E0D5] dark:border-[#33312B]">
                <span className="text-xs font-medium text-[#6B6861] dark:text-[#9E9B93]">Uptime Ratio</span>
                <div className="text-2xl font-serif font-normal text-[#1E6B52] dark:text-[#34D399] mt-1">
                  {uptimeStats.uptime_percentage.toFixed(2)}%
                </div>
                <span className="text-[11px] text-[#8C887F] mt-1 block">Past {period} window</span>
              </div>

              <div className="p-4 rounded-2xl bg-[#FAF8F5] dark:bg-[#161513] border border-[#E5E0D5] dark:border-[#33312B]">
                <span className="text-xs font-medium text-[#6B6861] dark:text-[#9E9B93]">Avg Latency</span>
                <div className="text-2xl font-serif font-normal text-[#1F1E1B] dark:text-[#F0ECE1] mt-1">
                  {Math.round(uptimeStats.avg_response_time_ms)}ms
                </div>
                <span className="text-[11px] text-[#8C887F] mt-1 block">Response duration</span>
              </div>

              <div className="p-4 rounded-2xl bg-[#FAF8F5] dark:bg-[#161513] border border-[#E5E0D5] dark:border-[#33312B]">
                <span className="text-xs font-medium text-[#6B6861] dark:text-[#9E9B93]">Completed Probes</span>
                <div className="text-2xl font-serif font-normal text-[#1A1917] dark:text-[#F2EFE9] mt-1">
                  {uptimeStats.total_checks}
                </div>
                <span className="text-[11px] text-[#8C887F] mt-1 block">
                  {uptimeStats.successful_checks} successful
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-[#F8F7F2] dark:bg-[#171716] border border-[#E6E3DA] dark:border-[#2E2D29]">
                <span className="text-xs font-medium text-[#6E6A63] dark:text-[#96938C]">Incidents</span>
                <div className="text-2xl font-serif font-normal text-[#B85D36] mt-1">
                  {uptimeStats.failed_checks}
                </div>
                <span className="text-[11px] text-[#8C887F] mt-1 block">
                  {uptimeStats.failed_checks === 0 ? 'Zero downtime observed' : 'Failed probes'}
                </span>
              </div>
            </div>
          </div>

          {/* Response Latency Chart (Recharts) */}
          <div className="bg-white dark:bg-[#1C1C1B] p-6 sm:p-8 rounded-3xl border border-[#E6E3DA] dark:border-[#2E2D29] shadow-soft mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-serif text-lg font-normal text-[#1A1917] dark:text-[#F2EFE9]">
                  Response Latency Trend (ms)
                </h3>
                <p className="text-xs text-[#8C887F] mt-0.5">
                  Chronological HTTP ping duration recorded by Go edge workers
                </p>
              </div>
              <span className="text-[10px] font-mono font-medium text-[#1E5E4B] dark:text-[#2E8B6E] bg-[#E8F3EE] dark:bg-[#182B24] border border-[#1E5E4B]/20 dark:border-[#2E8B6E]/30 px-2 py-0.5 rounded-full">
                Active Telemetry
              </span>
            </div>

            <div className="h-72 w-full">
              {chartData.length === 0 ? (
                <div className="h-full flex items-center justify-center text-xs text-[#8C887F]">
                  Awaiting probe data...
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="pulseLatencyGradient" x1="0" y1="0" x2="0" y2="1">
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
                        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="latency"
                      name="Latency (ms)"
                      stroke={isDark ? "#2E8B6E" : "#1E5E4B"}
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#pulseLatencyGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Recent Checks Table */}
          <div className="bg-white dark:bg-[#1E1D1A] p-6 sm:p-8 rounded-3xl border border-[#E5E0D5] dark:border-[#33312B] shadow-soft">
            <h3 className="font-serif text-lg font-normal text-[#1F1E1B] dark:text-[#F0ECE1] mb-4">
              Recent Probe Telemetry Log
            </h3>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs min-w-[500px]">
                <thead>
                  <tr className="border-b border-[#E8E4DA] dark:border-[#2C2A25] text-[#8C887F] font-mono uppercase tracking-wider">
                    <th className="pb-3 font-medium">Status</th>
                    <th className="pb-3 font-medium">HTTP Code</th>
                    <th className="pb-3 font-medium">Latency</th>
                    <th className="pb-3 font-medium">Timestamp</th>
                    <th className="pb-3 font-medium">Detail</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#ECE9E1] dark:divide-[#2A2926] font-mono text-xs">
                  {(history?.recent_checks || []).map((chk) => (
                    <tr key={chk.id} className="hover:bg-[#F8F7F2] dark:hover:bg-[#222220] transition-colors">
                      <td className="py-3">
                        {chk.success ? (
                          <span className="inline-flex items-center gap-1 text-[#1E5E4B] dark:text-[#2E8B6E] font-medium">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            <span>Passed</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-rose-600 dark:text-rose-400 font-medium">
                            <XCircle className="h-3.5 w-3.5" />
                            <span>Failed</span>
                          </span>
                        )}
                      </td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 rounded font-bold ${
                          chk.status_code >= 200 && chk.status_code < 300
                            ? 'bg-[#E8F3EE] text-[#1E5E4B] dark:bg-[#182B24] dark:text-[#2E8B6E]'
                            : 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300'
                        }`}>
                          {chk.status_code || '000'}
                        </span>
                      </td>
                      <td className="py-3 text-[#1A1917] dark:text-[#F2EFE9]">
                        {chk.response_time_ms}ms
                      </td>
                      <td className="py-3 text-[#8C887F]">
                        {new Date(chk.checked_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </td>
                      <td className="py-3 text-[#6B6861] dark:text-[#9E9B93]">
                        {chk.error_message || 'Healthy response received'}
                      </td>
                    </tr>
                  ))}
                  {(history?.recent_checks || []).length === 0 && (
                    <tr>
                      <td colSpan="5" className="py-8 text-center text-[#8C887F] font-sans">
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
