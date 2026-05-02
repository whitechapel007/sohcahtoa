'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { Transaction, TransactionCategory } from '@/types';
import TransactionListItem from './TransactionListItem';

interface FXTransactionListProps {
  readonly transactions: Transaction[];
}

const TABS: (TransactionCategory | 'All')[] = ['All', 'FX', 'PTA', 'BTA', 'Medicals'];

export default function FXTransactionList({ transactions }: FXTransactionListProps) {
  const [activeTab, setActiveTab] = useState<TransactionCategory | 'All'>('All');

  const filtered =
    activeTab === 'All'
      ? transactions
      : transactions.filter((t) => t.category === activeTab);

  return (
    <div>
      {/* Section header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-neutral-800">FX transactions</h2>
        <Link
          href="/dashboard/transactions"
          className="text-xs font-medium text-neutral-500 border border-neutral-200 px-3 py-1.5 rounded-full hover:text-brand-orange hover:border-brand-orange transition-all"
        >
          See all
        </Link>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-1.5 mb-3 flex-wrap">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`
              px-3 py-1.5 rounded-full text-xs font-medium transition-all
              ${activeTab === tab
                ? 'border border-brand-orange text-brand-orange bg-white'
                : 'border border-neutral-200 text-neutral-500 hover:text-neutral-700 hover:border-neutral-300'
              }
            `}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="divide-y divide-neutral-100">
        {filtered.length === 0 ? (
          <p className="text-sm text-neutral-400 py-6 text-center">No transactions found.</p>
        ) : (
          filtered.map((tx) => (
            <TransactionListItem key={tx.id} transaction={tx} />
          ))
        )}
      </div>
    </div>
  );
}
