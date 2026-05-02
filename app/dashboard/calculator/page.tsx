'use client';

import { useState } from 'react';

const CURRENCIES = ['USD', 'NGN', 'GBP', 'EUR', 'CAD', 'AUD'];

const MOCK_RATES: Record<string, number> = {
  NGN: 1620,
  GBP: 0.79,
  EUR: 0.93,
  CAD: 1.36,
  AUD: 1.54,
};

export default function CalculatorPage() {
  const [fromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('NGN');
  const [amount, setAmount] = useState('');

  const rate = MOCK_RATES[toCurrency] ?? 1;
  const result = amount ? (parseFloat(amount) * rate).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '';

  return (
    <div className="p-5">
      <div className="max-w-xl mx-auto">
        <h1 className="text-xl font-bold text-neutral-900 mb-1">FX Calculator</h1>
        <p className="text-sm text-neutral-500 mb-6">Get indicative rates for your FX conversions.</p>

        <div className="bg-panel rounded-2xl p-6 flex flex-col gap-5 shadow-sm">
          {/* From */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">You send</label>
            <div className="flex gap-2">
              <div className="px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm font-semibold text-neutral-700 w-24 text-center shrink-0">
                {fromCurrency}
              </div>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="flex-1 px-4 py-3 border border-neutral-200 rounded-xl text-sm outline-none focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20 transition-all"
              />
            </div>
          </div>

          {/* Rate indicator */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-neutral-200" />
            <div className="px-4 py-1.5 bg-brand-orange-light text-brand-orange text-xs font-semibold rounded-full border border-brand-orange-muted">
              1 USD = {rate.toLocaleString()} {toCurrency}
            </div>
            <div className="flex-1 h-px bg-neutral-200" />
          </div>

          {/* To */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">They receive</label>
            <div className="flex gap-2">
              <select
                value={toCurrency}
                onChange={(e) => setToCurrency(e.target.value)}
                className="px-3 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm font-semibold text-neutral-700 w-24 shrink-0 outline-none focus:border-brand-orange transition-all"
              >
                {CURRENCIES.filter((c) => c !== fromCurrency).map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <input
                readOnly
                value={result}
                placeholder="0.00"
                className="flex-1 px-4 py-3 border border-neutral-100 rounded-xl text-sm bg-neutral-50 text-neutral-600"
              />
            </div>
          </div>

          <button className="w-full py-3 bg-brand-orange hover:bg-brand-orange-hover text-white font-semibold rounded-xl text-sm transition-all active:scale-[0.98]">
            Get Quote
          </button>
        </div>

        {/* Disclaimer */}
        <p className="text-xs text-neutral-400 text-center mt-4">
          Rates shown are indicative only. Final rates depend on transaction volume and timing.
        </p>
      </div>
    </div>
  );
}
