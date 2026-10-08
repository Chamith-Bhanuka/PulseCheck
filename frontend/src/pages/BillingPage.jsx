import React, { useState, useEffect } from 'react';
import { 
  Check, Zap, ShieldCheck, ArrowRight, AlertCircle, 
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
    const params = new URLSearchParams(window.location.search);
    if (params.get('billing') === 'success') {
      setSuccessBanner(true);
      refreshProfile();
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center max-w-2xl mx-auto mb-14">
        <span className="text-xs font-bold text-[#C25E3E] uppercase tracking-widest">
          Subscription Tiers
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-normal text-[#1F1E1B] dark:text-[#F0ECE1] mt-2">
          Simple, Transparent Plans
        </h1>
        <p className="text-[#6B6861] dark:text-[#9E9B93] text-xs sm:text-sm mt-2">
          From developer side-projects to high-traffic production APIs.
        </p>
      </div>

      {successBanner && (
        <div className="max-w-2xl mx-auto mb-8 flex items-center gap-3 p-4 bg-[#EBF5EE] border border-[#CDE5D4] dark:bg-[#1A2E24] dark:border-[#244234] rounded-2xl text-[#1E6B52] dark:text-[#6EE7B7] text-xs font-medium">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          <span>Payment successful! Your account is upgraded to the Pro plan.</span>
        </div>
      )}

      {error && (
        <div className="max-w-2xl mx-auto mb-8 flex items-center gap-3 p-4 bg-rose-50 border border-rose-200 dark:bg-rose-950/30 dark:border-rose-900 rounded-2xl text-rose-700 dark:text-rose-300 text-xs">
          <AlertCircle className="h-5 w-5 shrink-0 text-rose-500" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
        {/* Free Card */}
        <div className={`p-8 rounded-3xl border flex flex-col justify-between transition-all ${
          !isPaid 
            ? 'bg-white dark:bg-[#1E1D1A] border-[#E5E0D5] dark:border-[#33312B] shadow-soft' 
            : 'bg-[#FAF8F5] dark:bg-[#181715] border-[#E5E0D5] dark:border-[#2C2A25] opacity-75'
        }`}>
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-serif text-2xl font-normal text-[#1F1E1B] dark:text-[#F0ECE1]">
                Community Free
              </h3>
              {!isPaid && (
                <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-[#FAF8F5] dark:bg-[#252420] text-[#6B6861] dark:text-[#9E9B93] border border-[#E5E0D5] dark:border-[#33312B]">
                  Current Plan
                </span>
              )}
            </div>
            <div className="mb-6">
              <span className="text-4xl font-normal font-serif text-[#1F1E1B] dark:text-[#F0ECE1]">$0</span>
              <span className="text-xs text-[#8C887F]"> / month</span>
            </div>
            <ul className="space-y-3.5 text-xs text-[#6B6861] dark:text-[#9E9B93]">
              <li className="flex items-center gap-2.5">
                <Check className="h-4 w-4 text-[#1E6B52] dark:text-[#34D399] shrink-0" />
                <span>Up to 5 active monitors</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="h-4 w-4 text-[#1E6B52] dark:text-[#34D399] shrink-0" />
                <span>5-minute ping interval</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="h-4 w-4 text-[#1E6B52] dark:text-[#34D399] shrink-0" />
                <span>Email downtime notifications</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="h-4 w-4 text-[#1E6B52] dark:text-[#34D399] shrink-0" />
                <span>24-hour analytics retention</span>
              </li>
            </ul>
          </div>

          <button
            disabled
            className="mt-8 w-full py-2.5 rounded-xl border border-[#E5E0D5] dark:border-[#33312B] bg-[#FAF8F5] dark:bg-[#161513] text-[#A8A49C] font-medium text-xs cursor-not-allowed"
          >
            {!isPaid ? 'Active Plan' : 'Free Tier'}
          </button>
        </div>

        {/* Pro Card */}
        <div className={`p-8 rounded-3xl border relative flex flex-col justify-between shadow-soft transition-all ${
          isPaid 
            ? 'bg-[#F8F5EC] dark:bg-[#22201C] border-[#DCD5C4] dark:border-[#3A3830]' 
            : 'bg-white dark:bg-[#1E1D1A] border-[#DCD5C4] dark:border-[#3A3830]'
        }`}>
          <div className="absolute -top-3 right-6 bg-[#C25E3E] text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
            Production
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-serif text-2xl font-normal text-[#1F1E1B] dark:text-[#F0ECE1]">
                Production Pro
              </h3>
              {isPaid && (
                <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-[#C25E3E]/10 text-[#C25E3E]">
                  Active Subscription
                </span>
              )}
            </div>
            <div className="mb-6">
              <span className="text-4xl font-normal font-serif text-[#1F1E1B] dark:text-[#F0ECE1]">$19</span>
              <span className="text-xs text-[#8C887F]"> / month</span>
            </div>
            <ul className="space-y-3.5 text-xs text-[#1F1E1B] dark:text-[#F0ECE1]">
              <li className="flex items-center gap-2.5 font-medium">
                <Check className="h-4 w-4 text-[#C25E3E] shrink-0" />
                <span>Up to 50 active monitors</span>
              </li>
              <li className="flex items-center gap-2.5 font-medium">
                <Check className="h-4 w-4 text-[#C25E3E] shrink-0" />
                <span>Ultra-fast 30-second ping interval</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="h-4 w-4 text-[#C25E3E] shrink-0" />
                <span>Priority SMTP downtime alerts</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="h-4 w-4 text-[#C25E3E] shrink-0" />
                <span>30-day extended telemetry graphs</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="h-4 w-4 text-[#C25E3E] shrink-0" />
                <span>Shareable public status pages</span>
              </li>
            </ul>
          </div>

          {isPaid ? (
            <div className="mt-8 p-2.5 rounded-xl bg-[#EBF5EE] dark:bg-[#1A2E24] border border-[#CDE5D4] dark:border-[#244234] text-center text-xs font-semibold text-[#1E6B52] dark:text-[#6EE7B7] flex items-center justify-center gap-2">
              <ShieldCheck className="h-4 w-4" />
              <span>Pro Plan Active (Stripe Test Mode)</span>
            </div>
          ) : (
            <button
              onClick={handleUpgrade}
              disabled={loading}
              className="mt-8 w-full flex items-center justify-center gap-2 py-3 rounded-full bg-[#1F1E1B] hover:bg-black text-white dark:bg-[#F0ECE1] dark:text-[#151413] dark:hover:bg-white font-semibold text-xs transition-all disabled:opacity-50"
            >
              <CreditCard className="h-3.5 w-3.5" />
              <span>{loading ? 'Opening Stripe...' : 'Upgrade with Stripe'}</span>
              {!loading && <ArrowRight className="h-3.5 w-3.5" />}
            </button>
          )}
        </div>
      </div>

      <div className="max-w-md mx-auto mt-10 text-center text-[11px] text-[#8C887F] flex items-center justify-center gap-1.5">
        <Lock className="h-3 w-3" />
        <span>Payments secured via Stripe Test Mode. Cancel anytime.</span>
      </div>
    </div>
  );
}
