'use client';

import { useState } from 'react';
import type { BalanceSummary } from '@/types';
import { EyeOffIcon, ChevronDownIcon } from '@/components/core/Icons';

interface BalanceWidgetProps {
  balance: BalanceSummary;
}

const FILTER_TABS = ['FX bought', 'FX sold', 'Others'] as const;

export default function BalanceWidget({ balance }: BalanceWidgetProps) {
  const [activeFilter, setActiveFilter] = useState<(typeof FILTER_TABS)[number]>('FX bought');
  const [hidden, setHidden] = useState(false);

  const formatted = balance.total.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const [dollars, cents] = formatted.split('.');

  return (
    <div className="flex flex-col gap-5">
      {/* Top row: filter tabs + currency selector */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveFilter(tab)}
              className={`
                px-3.5 py-1.5 rounded-full text-sm font-medium transition-all
                ${activeFilter === tab
                  ? 'border border-brand-orange text-brand-orange bg-white'
                  : 'border border-neutral-200 text-neutral-500 hover:text-neutral-700 hover:border-neutral-300'
                }
              `}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Currency selector */}
        <button className="flex items-center gap-2 px-3.5 py-1.5 bg-neutral-800 text-white rounded-full text-sm font-medium hover:bg-neutral-700 transition-all">
          {/* US flag emoji approximation */}
          <span className="text-base leading-none">🇺🇸</span>
          <span>USD</span>
          <ChevronDownIcon size={12} className="text-neutral-300" />
        </button>
      </div>

      {/* Balance */}
      <div>
        <div className="flex items-center gap-2 text-neutral-500 text-sm mb-2">
          <span>Total FX units</span>
          <button
            onClick={() => setHidden((h) => !h)}
            className="text-neutral-400 hover:text-neutral-600 transition-colors"
          >
            <EyeOffIcon size={14} />
          </button>
        </div>

        {hidden ? (
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-xl bg-neutral-900 text-white text-sm font-bold shrink-0">$</span>
            <span className="text-4xl font-bold text-neutral-900 tracking-tight">••••••••</span>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-xl bg-neutral-900 text-white text-sm font-bold shrink-0">$</span>
            <div className="flex items-baseline gap-0">
              <span className="text-4xl font-bold text-neutral-900 tracking-tight">{dollars}</span>
              <span className="text-2xl font-bold text-neutral-400">.{cents}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
