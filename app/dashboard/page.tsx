import { headers } from 'next/headers';
import type { Transaction, VirtualCard, BalanceSummary } from '@/types';
import BalanceWidget from '@/app/components/dashboard/BalanceWidget';
import FXActions from '@/app/components/dashboard/FXActions';
import FXTransactionList from '@/app/components/dashboard/FXTransactionList';
import CardWidget from '@/app/components/dashboard/CardWidget';
import CardTransactionList from '@/app/components/dashboard/CardTransactionList';
import CardFlows from '@/app/components/dashboard/CardFlows';

async function fetchFromApi<T>(path: string): Promise<T> {
  const headersList = await headers();
  const host = headersList.get('host') ?? 'localhost:3000';
  const proto = process.env.NODE_ENV === 'production' ? 'https' : 'http';
  const res = await fetch(`${proto}://${host}${path}`, {
    cache: 'no-store',
    headers: { cookie: headersList.get('cookie') ?? '' },
  });
  if (!res.ok) throw new Error(`API error: ${path} → ${res.status}`);
  return res.json() as Promise<T>;
}

export default async function DashboardPage() {
  const [balance, fxTransactions, cardTransactions, cards] = await Promise.all([
    fetchFromApi<BalanceSummary>('/api/dashboard/balance'),
    fetchFromApi<Transaction[]>('/api/dashboard/transactions?limit=5'),
    fetchFromApi<Transaction[]>('/api/dashboard/transactions?card=true&limit=5'),
    fetchFromApi<VirtualCard[]>('/api/dashboard/cards'),
  ]);

  return (
    <div className="p-5 flex gap-5 min-h-full">
      {/* ── Left / FX panel ── */}
      <div className="flex-1 min-w-0 bg-panel rounded-2xl p-6 flex flex-col gap-6 self-start">
        <BalanceWidget balance={balance} />
        <FXActions />
        <div className="border-t border-neutral-100" />
        <FXTransactionList transactions={fxTransactions} />
      </div>

      {/* ── Right / Cards panel ── */}
      <div className="w-[310px] shrink-0 bg-panel rounded-2xl p-6 flex flex-col gap-6 self-start">
        <CardWidget cards={cards} />
        <div className="border-t border-neutral-100" />
        <CardTransactionList transactions={cardTransactions} />
        <div className="border-t border-neutral-100" />
        <CardFlows balance={balance} />
      </div>
    </div>
  );
}
