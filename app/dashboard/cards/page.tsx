import { headers } from 'next/headers';
import type { VirtualCard, Transaction, PaginatedTransactions } from '@/types';
import CardsPageClient from '@/components/dashboard/CardsPageClient';

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
  const [cards, txPage] = await Promise.all([
    fetchFromApi<VirtualCard[]>('/api/dashboard/cards'),
    fetchFromApi<PaginatedTransactions>('/api/dashboard/transactions?limit=20&sort=date&order=desc'),
  ]);
  const initialTransactions: Transaction[] = txPage.data ?? [];

  return <CardsPageClient initialCards={cards} initialTransactions={initialTransactions} />;
}
