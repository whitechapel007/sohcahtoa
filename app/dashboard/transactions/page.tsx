import { cookies, headers } from 'next/headers';
import { decodeToken } from '@/lib/auth-tokens';
import type { PaginatedTransactions, UserRole } from '@/types';
import TransactionsTable from '@/app/components/dashboard/TransactionsTable';

const ACCESS_COOKIE = 'dashboard.access_token';

async function fetchInitialTransactions(cookieHeader: string, host: string): Promise<PaginatedTransactions> {
  const proto = process.env.NODE_ENV === 'production' ? 'https' : 'http';
  const res = await fetch(`${proto}://${host}/api/dashboard/transactions?sort=date&order=desc&page=1`, {
    cache: 'no-store',
    headers: { cookie: cookieHeader },
  });
  if (!res.ok) throw new Error(`Transactions fetch failed: ${res.status}`);
  return res.json() as Promise<PaginatedTransactions>;
}

export default async function TransactionsPage() {
  const [cookieStore, headersList] = await Promise.all([cookies(), headers()]);
  const cookieHeader = headersList.get('cookie') ?? '';
  const host = headersList.get('host') ?? 'localhost:3000';

  const token = cookieStore.get(ACCESS_COOKIE)?.value;
  const payload = token ? decodeToken(token) : null;
  const userRole: UserRole = payload?.role ?? 'analyst';

  let initialData: PaginatedTransactions;
  try {
    initialData = await fetchInitialTransactions(cookieHeader, host);
  } catch {
    initialData = { data: [], total: 0, page: 1, pages: 1, limit: 8 };
  }

  return <TransactionsTable initialData={initialData} userRole={userRole} />;
}
