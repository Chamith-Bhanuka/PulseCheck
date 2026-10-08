import React, { useState, useEffect } from 'react';
import { X, Globe, AlertCircle, ArrowUpRight } from 'lucide-react';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="w-full max-w-lg bg-white dark:bg-[#1E1D1A] rounded-3xl border border-[#E5E0D5] dark:border-[#33312B] shadow-2xl overflow-hidden text-left">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E8E4DA] dark:border-[#2C2A25]">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-full bg-[#FAF8F5] dark:bg-[#252420] border border-[#E5E0D5] dark:border-[#33312B] flex items-center justify-center text-[#C25E3E]">
              <Globe className="h-4 w-4" />
            </div>
            <h3 className="font-serif text-lg font-normal text-[#1F1E1B] dark:text-[#F0ECE1]">
              {initialData ? 'Edit Monitor' : 'Create New Monitor'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-[#8C887F] hover:text-[#1F1E1B] dark:hover:text-white hover:bg-[#F3EFE6] dark:hover:bg-[#2A2925] transition-colors"
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
            <label className="block text-xs font-medium text-[#6B6861] dark:text-[#9E9B93] mb-1.5">
              Service Name
            </label>
            <input
              type="text"
              placeholder="e.g. Production API"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#FAF8F5] dark:bg-[#161513] border border-[#E5E0D5] dark:border-[#33312B] rounded-xl text-xs text-[#1F1E1B] dark:text-[#F0ECE1] placeholder-[#A8A49C] focus:outline-none focus:border-[#C25E3E] transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#6B6861] dark:text-[#9E9B93] mb-1.5">
              Target URL *
            </label>
            <div className="relative">
              <input
                type="text"
                required
                placeholder="https://api.yourdomain.com/health"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full pl-3.5 pr-16 py-2.5 bg-[#FAF8F5] dark:bg-[#161513] border border-[#E5E0D5] dark:border-[#33312B] rounded-xl text-xs text-[#1F1E1B] dark:text-[#F0ECE1] placeholder-[#A8A49C] focus:outline-none focus:border-[#C25E3E] transition-colors"
              />
              <span className="absolute right-3 top-2.5 text-[10px] text-[#8C887F] font-mono">
                HTTPS
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#6B6861] dark:text-[#9E9B93] mb-1.5">
                HTTP Method
              </label>
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value)}
                className="w-full px-3 py-2.5 bg-[#FAF8F5] dark:bg-[#161513] border border-[#E5E0D5] dark:border-[#33312B] rounded-xl text-xs text-[#1F1E1B] dark:text-[#F0ECE1] focus:outline-none focus:border-[#C25E3E] transition-colors"
              >
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="HEAD">HEAD</option>
                <option value="PUT">PUT</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#6B6861] dark:text-[#9E9B93] mb-1.5">
                Expected HTTP Status
              </label>
              <input
                type="number"
                min="100"
                max="599"
                value={expectedStatus}
                onChange={(e) => setExpectedStatus(e.target.value)}
                className="w-full px-3 py-2.5 bg-[#FAF8F5] dark:bg-[#161513] border border-[#E5E0D5] dark:border-[#33312B] rounded-xl text-xs text-[#1F1E1B] dark:text-[#F0ECE1] focus:outline-none focus:border-[#C25E3E] transition-colors"
              />
            </div>
          </div>

          {/* Interval Configuration */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-medium text-[#6B6861] dark:text-[#9E9B93]">
                Check Frequency
              </label>
              {!isPaid && (
                <button
                  type="button"
                  onClick={onUpgradeClick}
                  className="text-xs text-[#C25E3E] hover:underline flex items-center gap-0.5 font-medium"
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
                    ? 'bg-[#1F1E1B] text-white dark:bg-[#F0ECE1] dark:text-[#151413] border-transparent'
                    : isPaid
                    ? 'bg-[#FAF8F5] dark:bg-[#161513] border-[#E5E0D5] dark:border-[#33312B] text-[#6B6861] dark:text-[#9E9B93]'
                    : 'bg-[#F5F2EB] dark:bg-[#1E1D1A] border-transparent text-[#A8A49C] cursor-not-allowed opacity-60'
                }`}
              >
                <div>30 Seconds</div>
                {!isPaid && <span className="text-[9px] text-[#C25E3E] font-bold">PRO</span>}
              </button>

              <button
                type="button"
                disabled={!isPaid}
                onClick={() => isPaid && setIntervalSeconds(60)}
                className={`py-2 px-3 rounded-xl text-xs font-medium border text-center transition-all ${
                  intervalSeconds === 60
                    ? 'bg-[#1F1E1B] text-white dark:bg-[#F0ECE1] dark:text-[#151413] border-transparent'
                    : isPaid
                    ? 'bg-[#FAF8F5] dark:bg-[#161513] border-[#E5E0D5] dark:border-[#33312B] text-[#6B6861] dark:text-[#9E9B93]'
                    : 'bg-[#F5F2EB] dark:bg-[#1E1D1A] border-transparent text-[#A8A49C] cursor-not-allowed opacity-60'
                }`}
              >
                <div>1 Minute</div>
                {!isPaid && <span className="text-[9px] text-[#C25E3E] font-bold">PRO</span>}
              </button>

              <button
                type="button"
                onClick={() => setIntervalSeconds(300)}
                className={`py-2 px-3 rounded-xl text-xs font-medium border text-center transition-all ${
                  intervalSeconds === 300
                    ? 'bg-[#1F1E1B] text-white dark:bg-[#F0ECE1] dark:text-[#151413] border-transparent'
                    : 'bg-[#FAF8F5] dark:bg-[#161513] border-[#E5E0D5] dark:border-[#33312B] text-[#6B6861] dark:text-[#9E9B93]'
                }`}
              >
                <div>5 Minutes</div>
                <span className="text-[9px] text-[#8C887F]">Standard</span>
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 flex items-center justify-end gap-2.5 border-t border-[#E8E4DA] dark:border-[#2C2A25]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-[#6B6861] dark:text-[#9E9B93] hover:text-[#1F1E1B] dark:hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-full text-xs font-semibold bg-[#1F1E1B] hover:bg-black text-white dark:bg-[#F0ECE1] dark:text-[#151413] dark:hover:bg-white shadow-xs transition-all disabled:opacity-50"
            >
              {loading ? 'Saving...' : initialData ? 'Save Changes' : 'Deploy Monitor'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
