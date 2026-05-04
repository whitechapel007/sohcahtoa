import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { decodeToken } from '@/lib/auth-tokens';
import { maskAccount } from '@/lib/api-route-helpers';
import { TRANSACTIONS } from '@/data/mock/transactions';
import type { Transaction, TransactionFilters } from '@/types';

const ACCESS_COOKIE = 'dashboard.access_token';

export async function getTransactions(
  filters: Pick<TransactionFilters, 'limit' | 'status' | 'sort' | 'order'> = {},
): Promise<Transaction[]> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ACCESS_COOKIE)?.value;
  const payload = token ? decodeToken(token) : null;
  if (!payload || Date.now() > payload.exp) redirect('/login');

  const { limit = 8, status, sort = 'date', order = 'desc' } = filters;

  let rows = [...TRANSACTIONS];

  if (status && status !== 'all') {
    rows = rows.filter((t) => t.status === status);
  }

  rows.sort((a, b) => {
    let delta: number;
    if (sort === 'amount') delta = a.amount - b.amount;
    else if (sort === 'status') delta = a.status.localeCompare(b.status);
    else delta = new Date(a.date).getTime() - new Date(b.date).getTime();
    return order === 'asc' ? delta : -delta;
  });

  return rows.slice(0, limit).map(maskAccount);
}
