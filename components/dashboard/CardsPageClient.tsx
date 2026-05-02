'use client';

import { useState, useCallback } from 'react';
import { CreditCard } from 'lucide-react';
import type { VirtualCard, Transaction } from '@/types';
import { VirtualCardDisplay } from './CardWidget';
import TransactionListItem from './TransactionListItem';
import CardsRealtimeStream, { type CardBalanceUpdate } from './CardsRealtimeStream';

interface Props {
  initialCards: VirtualCard[];
  initialTransactions: Transaction[];
}

const MAX_FEED = 20;

export default function CardsPageClient({ initialCards, initialTransactions }: Props) {
  const [cards, setCards] = useState(initialCards);
  const [transactions, setTransactions] = useState(initialTransactions);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(initialCards[0]?.id ?? null);
  const [newTxIds, setNewTxIds] = useState<Set<string>>(new Set());
  const [flashingCardId, setFlashingCardId] = useState<string | null>(null);

  const handleNewTransaction = useCallback((tx: Transaction) => {
    setTransactions((prev) => {
      if (prev.some((t) => t.id === tx.id)) return prev; // deduplicate
      return [tx, ...prev].slice(0, MAX_FEED);
    });
    setNewTxIds((prev) => new Set(prev).add(tx.id));
    setTimeout(
      () => setNewTxIds((prev) => { const next = new Set(prev); next.delete(tx.id); return next; }),
      5_000,
    );
  }, []);

  const handleBalanceUpdate = useCallback(({ cardId, delta }: CardBalanceUpdate) => {
    setCards((prev) =>
      prev.map((c) =>
        c.id === cardId
          ? { ...c, balance: Math.max(0, parseFloat((c.balance + delta).toFixed(2))) }
          : c,
      ),
    );
    setFlashingCardId(cardId);
    setTimeout(() => setFlashingCardId(null), 1_200);
  }, []);

  const selectedCard = cards.find((c) => c.id === selectedCardId) ?? cards[0] ?? null;
  const totalBalance = cards.reduce((s, c) => s + c.balance, 0);

  return (
    <div className="p-5">
      <h1 className="text-xl font-bold text-neutral-900 mb-1">My Cards</h1>
      <p className="text-sm text-neutral-500 mb-5">Manage your virtual and prepaid cards.</p>

      <div className="flex items-start gap-5 flex-wrap">

        {/* ── Left: card selector + selected card details ─────────────────── */}
        <div className="flex-1 min-w-[280px] space-y-4">

          {/* Card grid — click to select */}
          <div className="bg-panel rounded-2xl p-6 shadow-sm">
            <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-4">
              Your cards
            </p>
            <div className="grid grid-cols-2 gap-3">
              {cards.map((card) => (
                <button
                  key={card.id}
                  onClick={() => setSelectedCardId(card.id)}
                  className="text-left focus:outline-none"
                >
                  <VirtualCardDisplay card={card} selected={card.id === selectedCardId} />
                </button>
              ))}
              {/* Add card placeholder */}
              <div
                className="rounded-2xl border-2 border-dashed border-neutral-300 flex items-center justify-center cursor-pointer hover:border-brand-orange hover:bg-brand-orange-light transition-all group"
                style={{ aspectRatio: '1.586 / 1', minWidth: 0 }}
              >
                <div className="flex flex-col items-center gap-1 text-neutral-400 group-hover:text-brand-orange transition-colors">
                  <div className="w-7 h-7 rounded-full border-2 border-current flex items-center justify-center text-lg leading-none">
                    +
                  </div>
                  <span className="text-[10px] font-medium">Add card</span>
                </div>
              </div>
            </div>
          </div>

          {/* Selected card details */}
          {selectedCard && (
            <div className="bg-panel rounded-2xl p-6 space-y-4">
              <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                Card details
              </p>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-neutral-500">Balance</span>
                  <span
                    className={`text-lg font-bold tabular-nums transition-colors duration-700 ${
                      flashingCardId === selectedCard.id ? 'text-positive' : 'text-neutral-900'
                    }`}
                  >
                    ${selectedCard.balance.toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>

                {[
                  { label: 'Holder',   value: selectedCard.holder },
                  { label: 'Number',   value: `•••• •••• •••• ${selectedCard.lastFour}` },
                  { label: 'Expires',  value: selectedCard.validThru },
                  { label: 'Type',     value: selectedCard.type.charAt(0).toUpperCase() + selectedCard.type.slice(1) },
                  { label: 'Network',  value: selectedCard.network },
                  { label: 'Currency', value: selectedCard.currency },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between text-sm">
                    <span className="text-neutral-500">{label}</span>
                    <span className="text-neutral-800 font-medium">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Aggregate stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-panel rounded-2xl p-4 shadow-sm">
              <p className="text-xs text-neutral-500 mb-1">Total balance</p>
              <p className="text-xl font-bold text-neutral-900 tabular-nums">
                ${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="bg-panel rounded-2xl p-4 shadow-sm">
              <p className="text-xs text-neutral-500 mb-1">Active cards</p>
              <p className="text-xl font-bold text-neutral-900">{cards.length}</p>
            </div>
          </div>
        </div>

        {/* ── Right: live transaction feed ─────────────────────────────────── */}
        <div className="flex-1 min-w-[280px]">
          <div className="bg-panel rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-neutral-800">Card activity</h2>
              <span className="flex items-center gap-1.5 text-xs font-medium text-positive">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-positive opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-positive" />
                </span>
                Live
              </span>
            </div>

            {transactions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-neutral-400">
                <CreditCard size={28} className="mb-2 opacity-50" />
                <p className="text-sm">No transactions yet</p>
              </div>
            ) : (
              <div className="divide-y divide-neutral-100 max-h-[520px] overflow-y-auto">
                {transactions.map((tx) => (
                  <div key={tx.id} className="relative">
                    {newTxIds.has(tx.id) && (
                      <span className="absolute right-0 top-3.5 text-[9px] font-bold bg-positive text-white px-1.5 py-0.5 rounded-full uppercase leading-none">
                        new
                      </span>
                    )}
                    <TransactionListItem transaction={tx} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <CardsRealtimeStream
        onTransaction={handleNewTransaction}
        onBalanceUpdate={handleBalanceUpdate}
      />
    </div>
  );
}
