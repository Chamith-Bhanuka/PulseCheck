import React, { useState, useEffect } from 'react';
import { X, Globe, Shield, Clock, AlertCircle, ArrowUpRight, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function CreateMonitorModal({ isOpen, onClose, onSubmit, initialData = null, onUpgradeClick }) {
  const { user } = useAuth();
  const isPaid = user?.plan === 'paid';

  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [method, setMethod] = useState('GET');
  const [expectedStatus, setExpectedStatus] = useState(200);
  const [intervalSeconds, setIntervalSeconds] = useState(isPaid ? 30 : 300);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '');
      setUrl(initialData.url || '');
      setMethod(initialData.method || 'GET');
      setExpectedStatus(initialData.expected_status || 200);
      setIntervalSeconds(initialData.interval_seconds || (isPaid ? 30 : 300));
    } else {
      setName('');
      setUrl('');
      setMethod('GET');
      setExpectedStatus(200);
      setIntervalSeconds(isPaid ? 30 : 300);
    }
    setError(null);
  }, [initialData, isOpen, isPaid]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    let cleanUrl = url.trim();
    if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
      cleanUrl = `https://${cleanUrl}`;
    }

    if (!cleanUrl) {
      setError('Please provide a valid URL');
      return;
    }

    setLoading(true);
    try {
      await onSubmit({
        name: name.trim() || cleanUrl,
        url: cleanUrl,
        method,
        expected_status: parseInt(expectedStatus, 10),
        interval_seconds: parseInt(intervalSeconds, 10),
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save monitor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="glass-panel w-full max-w-lg rounded-2xl shadow-2xl border border-slate-700/80 overflow-hidden bg-[#0d1322]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Globe className="h-4 w-4" />
            </div>
            <h3 className="text-base font-semibold text-white font-display">
              {initialData ? 'Edit Uptime Monitor' : 'Create New Monitor'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 text-sm text-rose-300 bg-rose-500/10 border border-rose-500/20 rounded-xl">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Friendly Name
            </label>
            <input
              type="text"
              placeholder="e.g. Production API / Billing Server"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-900/90 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Target URL *
            </label>
            <div className="relative">
              <input
                type="text"
                required
                placeholder="https://api.yourdomain.com/health"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full pl-3.5 pr-20 py-2.5 bg-slate-900/90 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all"
              />
              <span className="absolute right-3 top-2.5 text-xs text-slate-500 font-mono">
                HTTPS
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                HTTP Method
              </label>
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-900/90 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500/50 transition-all"
              >
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="HEAD">HEAD</option>
                <option value="PUT">PUT</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Expected Status
              </label>
              <input
                type="number"
                min="100"
                max="599"
                value={expectedStatus}
                onChange={(e) => setExpectedStatus(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-900/90 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500/50 transition-all"
              />
            </div>
          </div>

          {/* Interval Configuration */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                Check Frequency
              </label>
              {!isPaid && (
                <button
                  type="button"
                  onClick={onUpgradeClick}
                  className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium transition-colors"
                >
                  <span>Unlock 30s checks</span>
                  <ArrowUpRight className="h-3 w-3" />
                </button>
              )}
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                disabled={!isPaid}
                onClick={() => isPaid && setIntervalSeconds(30)}
                className={`py-2 px-3 rounded-xl text-xs font-medium border text-center transition-all ${
                  intervalSeconds === 30
                    ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                    : isPaid
                    ? 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                    : 'bg-slate-900/40 border-slate-800/50 text-slate-600 cursor-not-allowed'
                }`}
              >
                <div>30 Seconds</div>
                {!isPaid && <span className="text-[10px] text-indigo-400 font-bold">PRO</span>}
              </button>

              <button
                type="button"
                disabled={!isPaid}
                onClick={() => isPaid && setIntervalSeconds(60)}
                className={`py-2 px-3 rounded-xl text-xs font-medium border text-center transition-all ${
                  intervalSeconds === 60
                    ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                    : isPaid
                    ? 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                    : 'bg-slate-900/40 border-slate-800/50 text-slate-600 cursor-not-allowed'
                }`}
              >
                <div>1 Minute</div>
                {!isPaid && <span className="text-[10px] text-indigo-400 font-bold">PRO</span>}
              </button>

              <button
                type="button"
                onClick={() => setIntervalSeconds(300)}
                className={`py-2 px-3 rounded-xl text-xs font-medium border text-center transition-all ${
                  intervalSeconds === 300
                    ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <div>5 Minutes</div>
                <span className="text-[10px] text-emerald-400 font-semibold">Standard</span>
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-sm font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20 active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {loading ? 'Saving...' : initialData ? 'Update Monitor' : 'Deploy Monitor'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
