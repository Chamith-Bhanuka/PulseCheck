import React, { useState, useEffect } from 'react';
import { 
  Plus, Search, ExternalLink, Trash2, Edit2, Clock, 
  Activity, ArrowUpRight, Copy, Check, AlertCircle, RefreshCw, Eye
} from 'lucide-react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';
import CreateMonitorModal from '../components/CreateMonitorModal';

export default function DashboardPage({ onSelectMonitor, onNavigate }) {
  const { user } = useAuth();
  const [monitors, setMonitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMonitor, setEditingMonitor] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  const isPaid = user?.plan === 'paid';
  const maxMonitors = isPaid ? 50 : 5;

  const fetchMonitors = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.monitors.list();
      setMonitors(data || []);
    } catch (err) {
      setError(err.message || 'Failed to load monitors');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMonitors();
  }, []);

  const handleCreateOrUpdate = async (monitorData) => {
    if (editingMonitor) {
      await api.monitors.update(editingMonitor.id, monitorData);
    } else {
      await api.monitors.create(monitorData);
    }
    fetchMonitors();
    setEditingMonitor(null);
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this monitor?')) return;
    try {
      await api.monitors.delete(id);
      setMonitors((prev) => prev.filter((m) => m.id !== id));
    } catch (err) {
      alert(err.message || 'Failed to delete monitor');
    }
  };

  const copyPublicLink = (id, e) => {
    e.stopPropagation();
    const url = `${window.location.origin}/status/${id}`;
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredMonitors = monitors.filter((m) =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.url.toLowerCase().includes(search.toLowerCase())
  );

  const activeCount = monitors.filter((m) => m.is_active).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* 1. Header & Stats Overview */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-display text-white">
            Monitors Dashboard
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Real-time status and health analytics across all configured endpoints
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchMonitors}
            className="p-2.5 rounded-xl border border-slate-800 bg-slate-900/60 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            title="Refresh monitors"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={() => {
              setEditingMonitor(null);
              setIsModalOpen(true);
            }}
            disabled={monitors.length >= maxMonitors}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-sm shadow-lg shadow-emerald-500/20 active:scale-[0.98] transition-all disabled:opacity-50"
          >
            <Plus className="h-4 w-4" />
            <span>Add Monitor</span>
          </button>
        </div>
      </div>

      {/* 2. Metric Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="glass-panel p-5 rounded-2xl border border-slate-800">
          <span className="text-xs font-medium text-slate-400">Total Monitored</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-extrabold text-white font-display">
              {monitors.length}
            </span>
            <span className="text-xs text-slate-500">/ {maxMonitors} quota</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
            <div 
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min((monitors.length / maxMonitors) * 100, 100)}%` }}
            />
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800">
          <span className="text-xs font-medium text-slate-400">Active Checkers</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-extrabold text-emerald-400 font-display">
              {activeCount}
            </span>
            <span className="text-xs text-slate-500">operational</span>
          </div>
          <span className="inline-block mt-3 text-[11px] text-emerald-400/90 font-medium">
            Worker pool sync enabled
          </span>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800">
          <span className="text-xs font-medium text-slate-400">Current Plan</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-bold text-white uppercase font-display">
              {user?.plan || 'Free'}
            </span>
            {isPaid && (
              <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300">
                PRO
              </span>
            )}
          </div>
          <span className="inline-block mt-3 text-[11px] text-slate-400">
            {isPaid ? '30s frequency unlocked' : '5-min frequency'}
          </span>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Subscription Tier</span>
            {!isPaid && (
              <button
                onClick={() => onNavigate('billing')}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-0.5"
              >
                <span>Upgrade</span>
                <ArrowUpRight className="h-3 w-3" />
              </button>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-2">
            {isPaid 
              ? '50 monitors with instant webhook alerting.' 
              : 'Upgrade to Pro for 30-second interval checks and 50 monitors.'}
          </p>
        </div>
      </div>

      {/* 3. Search and Filters */}
      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="h-4 w-4 text-slate-500 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search monitors by name or URL..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-900/80 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 transition-all"
          />
        </div>
      </div>

      {/* 4. Monitors List Table / Empty State */}
      {error && (
        <div className="flex items-center gap-2 p-4 text-sm text-rose-300 bg-rose-500/10 border border-rose-500/20 rounded-2xl mb-6">
          <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading && monitors.length === 0 ? (
        <div className="glass-panel p-16 rounded-2xl border border-slate-800 text-center">
          <RefreshCw className="h-8 w-8 text-emerald-400 animate-spin mx-auto mb-4" />
          <p className="text-sm text-slate-400">Loading monitor telemetry...</p>
        </div>
      ) : filteredMonitors.length === 0 ? (
        <div className="glass-panel p-16 rounded-3xl border border-slate-800 text-center">
          <div className="h-14 w-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mx-auto mb-4">
            <Activity className="h-7 w-7" />
          </div>
          <h3 className="text-lg font-semibold text-white font-display">No monitors found</h3>
          <p className="text-sm text-slate-400 mt-1 max-w-sm mx-auto">
            {search ? 'No endpoints match your search filter.' : 'You have not created any uptime monitors yet.'}
          </p>
          {!search && (
            <button
              onClick={() => {
                setEditingMonitor(null);
                setIsModalOpen(true);
              }}
              className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-sm shadow-lg shadow-emerald-500/20 transition-all"
            >
              <Plus className="h-4 w-4" />
              <span>Deploy First Monitor</span>
            </button>
          )}
        </div>
      ) : (
        <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
          <div className="divide-y divide-slate-800/80">
            {filteredMonitors.map((mon) => (
              <div
                key={mon.id}
                onClick={() => onSelectMonitor(mon.id)}
                className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-850/50 transition-colors cursor-pointer group"
              >
                {/* Left details */}
                <div className="flex items-start gap-3.5">
                  <div className="h-10 w-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 group-hover:text-emerald-400 group-hover:border-emerald-500/30 transition-all shrink-0 mt-0.5 sm:mt-0">
                    <Activity className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2.5">
                      <h4 className="text-base font-semibold text-white group-hover:text-emerald-300 transition-colors">
                        {mon.name}
                      </h4>
                      <StatusBadge status={mon.is_active ? 'online' : 'inactive'} size="sm" />
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                      <span className="font-mono text-slate-500 max-w-[200px] sm:max-w-xs truncate">
                        {mon.url}
                      </span>
                      <span className="text-slate-600">&bull;</span>
                      <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px]">
                        {mon.method}
                      </span>
                      <span className="text-slate-600">&bull;</span>
                      <span className="flex items-center gap-1 text-slate-400">
                        <Clock className="h-3 w-3 text-slate-500" />
                        <span>{mon.interval_seconds}s</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right actions */}
                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    onClick={(e) => copyPublicLink(mon.id, e)}
                    className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                    title="Copy Public Status Page URL"
                  >
                    {copiedId === mon.id ? (
                      <Check className="h-4 w-4 text-emerald-400" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingMonitor(mon);
                      setIsModalOpen(true);
                    }}
                    className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                    title="Edit Monitor"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>

                  <button
                    onClick={(e) => handleDelete(mon.id, e)}
                    className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                    title="Delete Monitor"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>

                  <div className="pl-2 border-l border-slate-800">
                    <span className="text-xs text-slate-500 group-hover:text-emerald-400 transition-colors flex items-center gap-1 font-medium">
                      <span>View</span>
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Monitor Create/Edit Modal */}
      <CreateMonitorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateOrUpdate}
        initialData={editingMonitor}
        onUpgradeClick={() => {
          setIsModalOpen(false);
          onNavigate('billing');
        }}
      />
    </div>
  );
}
