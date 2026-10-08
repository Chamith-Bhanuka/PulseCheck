import React, { useState, useEffect } from 'react';
import { 
  Check, Zap, ShieldCheck, ArrowRight, Sparkles, AlertCircle, 
  CheckCircle2, CreditCard, Lock 
} from 'lucide-react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function BillingPage({ onNavigate }) {
  const { user, refreshProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successBanner, setSuccessBanner] = useState(false);

  const isPaid = user?.plan === 'paid';

  useEffect(() => {
    // Detect Stripe redirect URL parameters
    const params = new URLSearchParams(window.location.search);
    if (params.get('billing') === 'success') {
      setSuccessBanner(true);
      refreshProfile();
      // Clean query params
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const handleUpgrade = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.billing.createCheckout();
      if (res?.checkout_url) {
        window.location.href = res.checkout_url;
      } else {
        throw new Error('No checkout URL received from server');
      }
    } catch (err) {
      setError(err.message || 'Failed to initiate Stripe checkout');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 ambient-glow">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">
          Subscription Management
        </span>
        <h1 className="text-3xl sm:text-4xl font-bold font-display text-white mt-2">
          Choose the Right Monitoring Plan
        </h1>
        <p className="text-slate-400 text-sm sm:text-base mt-2">
          Scale your uptime checks from hobby microservices to mission-critical infrastructure.
        </p>
      </div>

      {successBanner && (
        <div className="max-w-2xl mx-auto mb-8 flex items-center gap-3 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-300 text-sm">
          <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
          <span>Payment successful! Your account has been upgraded to the Pro plan.</span>
        </div>
      )}

      {error && (
        <div className="max-w-2xl mx-auto mb-8 flex items-center gap-3 p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-rose-300 text-sm">
          <AlertCircle className="h-5 w-5 text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {/* Free Plan Card */}
        <div className={`glass-panel p-8 rounded-3xl border flex flex-col justify-between ${
          !isPaid ? 'border-slate-700 bg-slate-900/40' : 'border-slate-800 opacity-75'
        }`}>
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white font-display">Starter Free</h3>
              {!isPaid && (
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                  Current Plan
                </span>
              )}
            </div>
            <div className="mb-6">
              <span className="text-4xl font-extrabold text-white font-display">$0</span>
              <span className="text-slate-500 text-sm"> / month</span>
            </div>
            <ul className="space-y-3.5 text-sm text-slate-300">
              <li className="flex items-center gap-2.5">
                <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>Up to 5 active monitors</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>5-minute ping interval</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>Email downtime notifications</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>24-hour analytics retention</span>
              </li>
            </ul>
          </div>

          <button
            disabled
            className="mt-8 w-full py-3 rounded-xl border border-slate-800 bg-slate-900/60 text-slate-500 font-semibold text-sm cursor-not-allowed"
          >
            {!isPaid ? 'Active Plan' : 'Free Tier'}
          </button>
        </div>

        {/* Pro Plan Card */}
        <div className={`glass-panel p-8 rounded-3xl border relative flex flex-col justify-between glow-emerald bg-[#0c1424] ${
          isPaid ? 'border-emerald-500/60 ring-2 ring-emerald-500/20' : 'border-emerald-500/40'
        }`}>
          <div className="absolute -top-3 right-8 bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-extrabold text-xs px-3 py-1 rounded-full uppercase tracking-wider shadow-md flex items-center gap-1">
            <Sparkles className="h-3 w-3" />
            <span>High Precision</span>
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white font-display">Production Pro</h3>
              {isPaid && (
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Active Subscription
                </span>
              )}
            </div>
            <div className="mb-6">
              <span className="text-4xl font-extrabold text-white font-display">$19</span>
              <span className="text-slate-500 text-sm"> / month</span>
            </div>
            <ul className="space-y-3.5 text-sm text-slate-300">
              <li className="flex items-center gap-2.5">
                <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                <span className="font-semibold text-white">Up to 50 active monitors</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                <span className="font-semibold text-white">Ultra-fast 30-second ping interval</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>Priority SMTP downtime alerts</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>30-day extended telemetry graphs</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>Shareable public status pages</span>
              </li>
            </ul>
          </div>

          {isPaid ? (
            <div className="mt-8 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center text-xs font-semibold text-emerald-400 flex items-center justify-center gap-2">
              <ShieldCheck className="h-4 w-4" />
              <span>Pro Plan Active (Stripe Test Mode)</span>
            </div>
          ) : (
            <button
              onClick={handleUpgrade}
              disabled={loading}
              className="mt-8 w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-xl shadow-emerald-500/20 active:scale-[0.98] transition-all disabled:opacity-50"
            >
              <CreditCard className="h-4 w-4" />
              <span>{loading ? 'Redirecting to Stripe...' : 'Upgrade with Stripe'}</span>
              {!loading && <ArrowRight className="h-4 w-4" />}
            </button>
          )}
        </div>
      </div>

      <div className="max-w-md mx-auto mt-10 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
        <Lock className="h-3.5 w-3.5" />
        <span>Payments processed securely via Stripe Test Mode. Cancel anytime.</span>
      </div>
    </div>
  );
}
