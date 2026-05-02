import { headers } from 'next/headers';
import type { VirtualCard, Transaction } from '@/types';
import CardWidget from '@/app/components/dashboard/CardWidget';
import TransactionListItem from '@/app/components/dashboard/TransactionListItem';

async function fetchFromApi<T>(path: string): Promise<T> {
  const headersList = await headers();
  const host = headersList.get('host') ?? 'localhost:3000';
  const proto = process.env.NODE_ENV === 'production' ? 'https' : 'http';
  const res = await fetch(`${proto}://${host}${path}`, {
    cache: 'no-store',
    headers: { cookie: headersList.get('cookie') ?? '' },
  });
  return res.json();
}

export default async function CardsPage() {
  const [cards, cardTransactions] = await Promise.all([
    fetchFromApi<VirtualCard[]>('/api/dashboard/cards'),
    fetchFromApi<Transaction[]>('/api/dashboard/transactions?card=true'),
  ]);

  const totalBalance = cards.reduce((s, c) => s + c.balance, 0);

  return (
    <div className="p-5">
      <div className="flex items-start gap-5 flex-wrap">
        {/* Left: cards + balance */}
        <div className="flex-1 min-w-[280px]">
          <h1 className="text-xl font-bold text-neutral-900 mb-1">My Cards</h1>
          <p className="text-sm text-neutral-500 mb-5">Manage your virtual and prepaid cards.</p>

          <div className="bg-panel rounded-2xl p-6 mb-4">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-neutral-500">Total card balance</span>
              <span className="text-xl font-bold text-neutral-900">
                ${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <CardWidget cards={cards} />
          </div>

          {/* Card stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-panel rounded-2xl p-4">
              <p className="text-xs text-neutral-500 mb-1">Active cards</p>
              <p className="text-2xl font-bold text-neutral-900">{cards.length}</p>
            </div>
            <div className="bg-panel rounded-2xl p-4">
              <p className="text-xs text-neutral-500 mb-1">Card transactions</p>
              <p className="text-2xl font-bold text-neutral-900">{cardTransactions.length}</p>
            </div>
          </div>
        </div>

        {/* Right: card transactions */}
        <div className="flex-1 min-w-[280px]">
          <h2 className="text-base font-semibold text-neutral-800 mb-4">Card transactions</h2>
          <div className="bg-panel rounded-2xl p-6">
            <div className="divide-y divide-neutral-100">
              {cardTransactions.map((tx) => (
                <TransactionListItem key={tx.id} transaction={tx} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
