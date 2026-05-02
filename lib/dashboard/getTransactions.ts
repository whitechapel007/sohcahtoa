import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { decodeToken } from '@/lib/auth-tokens';
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
    const delta =
      sort === 'amount' ? a.amount - b.amount :
      sort === 'status' ? a.status.localeCompare(b.status) :
      new Date(a.date).getTime() - new Date(b.date).getTime();
    return order === 'asc' ? delta : -delta;
  });

  return rows.slice(0, limit).map(maskAccount);
}

function maskAccount(t: Transaction): Transaction {
  return { ...t, accountNumber: '•••• •••• •••• ' + t.accountNumber.slice(-4) };
}
