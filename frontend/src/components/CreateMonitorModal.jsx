import React, { useState, useEffect } from 'react';
import { X, Activity, AlertCircle, ArrowUpRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function CreateMonitorModal({ isOpen, onClose, onSubmit, initialData = null, onUpgradeClick }) {
  const { user } = useAuth();
  const isPaid = user?.plan === 'paid';

  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [method, setMethod] = useState('GET');
  const [expectedStatus, setExpectedStatus] = useState(200);
  const [intervalSeconds, setIntervalSeconds] = useState(300);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '');
      setUrl(initialData.url || '');
      setMethod(initialData.method || 'GET');
      setExpectedStatus(initialData.expected_status || 200);
      setIntervalSeconds(initialData.interval_seconds || 300);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="w-full max-w-lg bg-white dark:bg-[#1C1C1B] rounded-3xl border border-[#E6E3DA] dark:border-[#2E2D29] shadow-2xl overflow-hidden text-left">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E8E5DD] dark:border-[#2A2926]">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-xl bg-[#1E5E4B]/10 dark:bg-[#2E8B6E]/20 border border-[#1E5E4B]/20 dark:border-[#2E8B6E]/30 flex items-center justify-center text-[#1E5E4B] dark:text-[#2E8B6E]">
              <Activity className="w-4 h-4 stroke-[2.2]" />
            </div>
            <h3 className="font-serif text-lg font-normal text-[#1A1917] dark:text-[#F2EFE9]">
              {initialData ? 'Edit Monitor' : 'Create New Monitor'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-[#8C887F] hover:text-[#1A1917] dark:hover:text-white hover:bg-[#F5F4EE] dark:hover:bg-[#2A2925] transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 text-xs text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 rounded-xl">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-500" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-[#6E6A63] dark:text-[#96938C] mb-1.5">
              Service Name
            </label>
            <input
              type="text"
              placeholder="e.g. Production API"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#F8F7F2] dark:bg-[#171716] border border-[#E6E3DA] dark:border-[#2E2D29] rounded-xl text-xs text-[#1A1917] dark:text-[#F2EFE9] placeholder-[#96938C] focus:outline-none focus:border-[#1E5E4B] dark:focus:border-[#2E8B6E] transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#6E6A63] dark:text-[#96938C] mb-1.5">
              Target URL *
            </label>
            <div className="relative">
              <input
                type="text"
                required
                placeholder="https://api.yourdomain.com/health"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full pl-3.5 pr-16 py-2.5 bg-[#F8F7F2] dark:bg-[#171716] border border-[#E6E3DA] dark:border-[#2E2D29] rounded-xl text-xs text-[#1A1917] dark:text-[#F2EFE9] placeholder-[#96938C] focus:outline-none focus:border-[#1E5E4B] dark:focus:border-[#2E8B6E] transition-colors"
              />
              <span className="absolute right-3 top-2.5 text-[10px] text-[#8C887F] font-mono">
                HTTPS
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#6E6A63] dark:text-[#96938C] mb-1.5">
                HTTP Method
              </label>
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value)}
                className="w-full px-3 py-2.5 bg-[#F8F7F2] dark:bg-[#171716] border border-[#E6E3DA] dark:border-[#2E2D29] rounded-xl text-xs text-[#1A1917] dark:text-[#F2EFE9] focus:outline-none focus:border-[#1E5E4B] dark:focus:border-[#2E8B6E] transition-colors"
              >
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="HEAD">HEAD</option>
                <option value="PUT">PUT</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#6E6A63] dark:text-[#96938C] mb-1.5">
                Expected HTTP Status
              </label>
              <input
                type="number"
                min="100"
                max="599"
                value={expectedStatus}
                onChange={(e) => setExpectedStatus(e.target.value)}
                className="w-full px-3 py-2.5 bg-[#F8F7F2] dark:bg-[#171716] border border-[#E6E3DA] dark:border-[#2E2D29] rounded-xl text-xs text-[#1A1917] dark:text-[#F2EFE9] focus:outline-none focus:border-[#1E5E4B] dark:focus:border-[#2E8B6E] transition-colors"
              />
            </div>
          </div>

          {/* Interval Configuration */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-medium text-[#6E6A63] dark:text-[#96938C]">
                Check Frequency
              </label>
              {!isPaid && (
                <button
                  type="button"
                  onClick={onUpgradeClick}
                  className="text-xs text-[#1E5E4B] dark:text-[#2E8B6E] hover:underline flex items-center gap-0.5 font-medium"
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
                    ? 'bg-[#1A1917] text-white dark:bg-[#F2EFE9] dark:text-[#141413] border-transparent shadow-xs'
                    : isPaid
                    ? 'bg-[#F8F7F2] dark:bg-[#171716] border-[#E6E3DA] dark:border-[#2E2D29] text-[#6E6A63] dark:text-[#96938C]'
                    : 'bg-[#F5F4EE] dark:bg-[#1C1C1B] border-transparent text-[#A8A49C] cursor-not-allowed opacity-60'
                }`}
              >
                <div>30 Seconds</div>
                {!isPaid && <span className="text-[9px] text-[#B85D36] font-bold">PRO</span>}
              </button>

              <button
                type="button"
                disabled={!isPaid}
                onClick={() => isPaid && setIntervalSeconds(60)}
                className={`py-2 px-3 rounded-xl text-xs font-medium border text-center transition-all ${
                  intervalSeconds === 60
                    ? 'bg-[#1A1917] text-white dark:bg-[#F2EFE9] dark:text-[#141413] border-transparent shadow-xs'
                    : isPaid
                    ? 'bg-[#F8F7F2] dark:bg-[#171716] border-[#E6E3DA] dark:border-[#2E2D29] text-[#6E6A63] dark:text-[#96938C]'
                    : 'bg-[#F5F4EE] dark:bg-[#1C1C1B] border-transparent text-[#A8A49C] cursor-not-allowed opacity-60'
                }`}
              >
                <div>1 Minute</div>
                {!isPaid && <span className="text-[9px] text-[#B85D36] font-bold">PRO</span>}
              </button>

              <button
                type="button"
                onClick={() => setIntervalSeconds(300)}
                className={`py-2 px-3 rounded-xl text-xs font-medium border text-center transition-all ${
                  intervalSeconds === 300
                    ? 'bg-[#1A1917] text-white dark:bg-[#F2EFE9] dark:text-[#141413] border-transparent shadow-xs'
                    : 'bg-[#F8F7F2] dark:bg-[#171716] border-[#E6E3DA] dark:border-[#2E2D29] text-[#6E6A63] dark:text-[#96938C]'
                }`}
              >
                <div>5 Minutes</div>
                <span className="text-[9px] text-[#8C887F]">Standard</span>
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 flex items-center justify-end gap-2.5 border-t border-[#E8E5DD] dark:border-[#2A2926]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-[#6E6A63] dark:text-[#96938C] hover:text-[#1A1917] dark:hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-full text-xs font-semibold bg-[#1A1917] hover:bg-black text-white dark:bg-[#F2EFE9] dark:text-[#141413] dark:hover:bg-white shadow-xs transition-all disabled:opacity-50"
            >
              {loading ? 'Saving...' : initialData ? 'Save Changes' : 'Deploy Monitor'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
