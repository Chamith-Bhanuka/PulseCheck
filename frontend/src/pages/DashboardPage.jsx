import React, { useState, useEffect } from 'react';
import { 
  Plus, Search, ExternalLink, Trash2, Edit2, Clock, 
  Activity, ArrowUpRight, Copy, Check, AlertCircle, RefreshCw 
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-serif font-normal text-[#1F1E1B] dark:text-[#F0ECE1]">
            Monitors
          </h1>
          <p className="text-xs sm:text-sm text-[#6B6861] dark:text-[#9E9B93] mt-1">
            Real-time status and health telemetry across all configured services
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchMonitors}
            className="p-2 rounded-xl border border-[#E5E0D5] dark:border-[#33312B] bg-white dark:bg-[#1E1D1A] text-[#6B6861] dark:text-[#9E9B93] hover:text-[#1F1E1B] dark:hover:text-white transition-colors"
            title="Refresh"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={() => {
              setEditingMonitor(null);
              setIsModalOpen(true);
            }}
            disabled={monitors.length >= maxMonitors}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#1F1E1B] hover:bg-black text-white dark:bg-[#F0ECE1] dark:text-[#151413] dark:hover:bg-white text-xs font-semibold shadow-xs active:scale-[0.98] transition-all disabled:opacity-50"
          >
            <Plus className="h-4 w-4" />
            <span>New Monitor</span>
          </button>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white dark:bg-[#1E1D1A] p-5 rounded-2xl border border-[#E5E0D5] dark:border-[#33312B] shadow-soft">
          <span className="text-xs font-medium text-[#6B6861] dark:text-[#9E9B93]">Active Services</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-serif font-normal text-[#1F1E1B] dark:text-[#F0ECE1]">
              {monitors.length}
            </span>
            <span className="text-xs text-[#8C887F]">/ {maxMonitors} quota</span>
          </div>
          <div className="w-full bg-[#F3EFE6] dark:bg-[#2A2925] h-1.5 rounded-full mt-3 overflow-hidden">
            <div 
              className="bg-[#1F1E1B] dark:bg-[#F0ECE1] h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min((monitors.length / maxMonitors) * 100, 100)}%` }}
            />
          </div>
        </div>

        <div className="bg-white dark:bg-[#1E1D1A] p-5 rounded-2xl border border-[#E5E0D5] dark:border-[#33312B] shadow-soft">
          <span className="text-xs font-medium text-[#6B6861] dark:text-[#9E9B93]">Healthy Targets</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-serif font-normal text-[#1E6B52] dark:text-[#34D399]">
              {activeCount}
            </span>
            <span className="text-xs text-[#8C887F]">running probes</span>
          </div>
          <span className="inline-block mt-3 text-[11px] text-[#6B6861] dark:text-[#9E9B93]">
            Worker pool sync active
          </span>
        </div>

        <div className="bg-white dark:bg-[#1E1D1A] p-5 rounded-2xl border border-[#E5E0D5] dark:border-[#33312B] shadow-soft">
          <span className="text-xs font-medium text-[#6B6861] dark:text-[#9E9B93]">Subscription Tier</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-serif font-normal text-[#1F1E1B] dark:text-[#F0ECE1] uppercase">
              {user?.plan || 'Free'}
            </span>
            {isPaid && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#C25E3E]/10 text-[#C25E3E]">
                PRO
              </span>
            )}
          </div>
          <span className="inline-block mt-3 text-[11px] text-[#6B6861] dark:text-[#9E9B93]">
            {isPaid ? '30-second frequency' : '5-minute frequency'}
          </span>
        </div>

        <div className="bg-white dark:bg-[#1E1D1A] p-5 rounded-2xl border border-[#E5E0D5] dark:border-[#33312B] shadow-soft flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#6B6861] dark:text-[#9E9B93]">Plan Options</span>
            {!isPaid && (
              <button
                onClick={() => onNavigate('billing')}
                className="text-xs text-[#C25E3E] hover:underline font-semibold flex items-center gap-0.5"
              >
                <span>Upgrade</span>
                <ArrowUpRight className="h-3 w-3" />
              </button>
            )}
          </div>
          <p className="text-xs text-[#8C887F] dark:text-[#807D75] mt-2">
            {isPaid 
              ? '50 monitors with instant webhook alerting.' 
              : 'Upgrade to Pro for 30s checks and 50 monitors.'}
          </p>
        </div>
      </div>

      {/* Search Input */}
      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="h-4 w-4 text-[#8C887F] absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by name or URL..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white dark:bg-[#1E1D1A] border border-[#E5E0D5] dark:border-[#33312B] rounded-xl text-xs text-[#1F1E1B] dark:text-[#F0ECE1] placeholder-[#A8A49C] focus:outline-none focus:border-[#C25E3E] transition-colors"
          />
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="flex items-center gap-2 p-3 text-xs text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 rounded-xl mb-6">
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-500" />
          <span>{error}</span>
        </div>
      )}

      {/* Monitor Cards List */}
      {loading && monitors.length === 0 ? (
        <div className="p-16 text-center bg-white dark:bg-[#1E1D1A] rounded-2xl border border-[#E5E0D5] dark:border-[#33312B]">
          <RefreshCw className="h-6 w-6 text-[#8C887F] animate-spin mx-auto mb-3" />
          <p className="text-xs text-[#6B6861] dark:text-[#9E9B93]">Loading monitors...</p>
        </div>
      ) : filteredMonitors.length === 0 ? (
        <div className="p-16 text-center bg-white dark:bg-[#1E1D1A] rounded-3xl border border-[#E5E0D5] dark:border-[#33312B] shadow-soft">
          <div className="h-12 w-12 rounded-full bg-[#FAF8F5] dark:bg-[#252420] border border-[#E5E0D5] dark:border-[#33312B] flex items-center justify-center text-[#C25E3E] mx-auto mb-3">
            <Activity className="h-6 w-6" />
          </div>
          <h3 className="font-serif text-lg font-normal text-[#1F1E1B] dark:text-[#F0ECE1]">
            No monitors found
          </h3>
          <p className="text-xs text-[#6B6861] dark:text-[#9E9B93] mt-1 max-w-sm mx-auto">
            {search ? 'No endpoints match your query.' : 'Configure your first API endpoint to start background monitoring.'}
          </p>
          {!search && (
            <button
              onClick={() => {
                setEditingMonitor(null);
                setIsModalOpen(true);
              }}
              className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#1F1E1B] hover:bg-black text-white dark:bg-[#F0ECE1] dark:text-[#151413] dark:hover:bg-white text-xs font-semibold shadow-xs transition-all"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Your First Monitor</span>
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white dark:bg-[#1E1D1A] rounded-2xl border border-[#E5E0D5] dark:border-[#33312B] shadow-soft overflow-hidden">
          <div className="divide-y divide-[#EAE6DC] dark:divide-[#2C2A25]">
            {filteredMonitors.map((mon) => (
              <div
                key={mon.id}
                onClick={() => onSelectMonitor(mon.id)}
                className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#FAF8F5] dark:hover:bg-[#23221E] transition-colors cursor-pointer group"
              >
                {/* Left metadata */}
                <div className="flex items-start gap-3.5">
                  <div className="h-9 w-9 rounded-xl bg-[#FAF8F5] dark:bg-[#252420] border border-[#E5E0D5] dark:border-[#33312B] flex items-center justify-center text-[#6B6861] dark:text-[#9E9B93] group-hover:text-[#C25E3E] transition-colors shrink-0 mt-0.5 sm:mt-0">
                    <Activity className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2.5">
                      <h4 className="text-sm font-semibold text-[#1F1E1B] dark:text-[#F0ECE1] group-hover:text-[#C25E3E] transition-colors">
                        {mon.name}
                      </h4>
                      <StatusBadge status={mon.is_active ? 'online' : 'inactive'} size="sm" />
                    </div>
                    <div className="flex items-center gap-2.5 mt-1 text-xs text-[#6B6861] dark:text-[#9E9B93]">
                      <span className="font-mono text-[11px] text-[#8C887F] truncate max-w-[200px] sm:max-w-xs">
                        {mon.url}
                      </span>
                      <span>&bull;</span>
                      <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-[#FAF8F5] dark:bg-[#252420] border border-[#E5E0D5] dark:border-[#33312B]">
                        {mon.method}
                      </span>
                      <span>&bull;</span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3 text-[#8C887F]" />
                        <span>{mon.interval_seconds}s</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right actions */}
                <div className="flex items-center gap-1.5 self-end sm:self-center">
                  <button
                    onClick={(e) => copyPublicLink(mon.id, e)}
                    className="p-2 rounded-lg text-[#6B6861] dark:text-[#9E9B93] hover:text-[#1F1E1B] dark:hover:text-white hover:bg-[#F3EFE6] dark:hover:bg-[#2A2925] transition-colors"
                    title="Copy Public Link"
                  >
                    {copiedId === mon.id ? (
                      <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingMonitor(mon);
                      setIsModalOpen(true);
                    }}
                    className="p-2 rounded-lg text-[#6B6861] dark:text-[#9E9B93] hover:text-[#1F1E1B] dark:hover:text-white hover:bg-[#F3EFE6] dark:hover:bg-[#2A2925] transition-colors"
                    title="Edit"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>

                  <button
                    onClick={(e) => handleDelete(mon.id, e)}
                    className="p-2 rounded-lg text-[#6B6861] dark:text-[#9E9B93] hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>

                  <div className="pl-2 border-l border-[#E5E0D5] dark:border-[#33312B]">
                    <span className="text-xs text-[#8C887F] group-hover:text-[#1F1E1B] dark:group-hover:text-white transition-colors flex items-center gap-0.5 font-medium">
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

      {/* Create / Edit Modal */}
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
