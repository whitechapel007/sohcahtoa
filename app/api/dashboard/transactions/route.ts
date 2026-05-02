import { NextRequest, NextResponse } from 'next/server';
import { decodeToken } from '@/lib/auth-tokens';
import { TRANSACTIONS } from '@/data/mock/transactions';
import type { Transaction, TransactionStatus, SortField, SortOrder, PaginatedTransactions } from '@/types';

export const dynamic = 'force-dynamic';

const ACCESS_COOKIE = 'dashboard.access_token';
const DEFAULT_LIMIT = 8;
const MAX_LIMIT = 50;
const VALID_STATUSES = new Set<TransactionStatus>(['pending', 'completed', 'flagged', 'failed']);
const VALID_SORTS = new Set<SortField>(['date', 'amount', 'status']);

export async function GET(request: NextRequest) {
  const token = request.cookies.get(ACCESS_COOKIE)?.value;
  const payload = token ? decodeToken(token) : null;
  if (!payload || Date.now() > payload.exp) {
    return error('UNAUTHORIZED', 'Authentication required.', 401);
  }

  const sp = request.nextUrl.searchParams;

  const rawPage  = Number.parseInt(sp.get('page')  ?? '1', 10);
  const rawLimit = Number.parseInt(sp.get('limit') ?? String(DEFAULT_LIMIT), 10);
  const page  = Number.isFinite(rawPage)  && rawPage  > 0 ? rawPage  : 1;
  const limit = Number.isFinite(rawLimit) && rawLimit > 0 ? Math.min(rawLimit, MAX_LIMIT) : DEFAULT_LIMIT;

  const status = sp.get('status') as TransactionStatus | 'all' | null;
  const sort   = (sp.get('sort')  as SortField)  ?? 'date';
  const order  = (sp.get('order') as SortOrder)  ?? 'desc';

  if (status && status !== 'all' && !VALID_STATUSES.has(status)) {
    return error('INVALID_STATUS', `Unknown status: ${status}`, 400);
  }
  if (!VALID_SORTS.has(sort)) {
    return error('INVALID_SORT', `Unknown sort field: ${sort}`, 400);
  }

  const dateFrom = sp.get('dateFrom');
  const dateTo   = sp.get('dateTo');
  const fromMs   = dateFrom ? new Date(dateFrom).getTime() : null;
  const toMs     = dateTo   ? new Date(dateTo).getTime()   : null;

  if (fromMs !== null && Number.isNaN(fromMs)) return error('INVALID_DATE', 'dateFrom is not a valid date.', 400);
  if (toMs   !== null && Number.isNaN(toMs))   return error('INVALID_DATE', 'dateTo is not a valid date.', 400);

  const search = sp.get('search')?.toLowerCase().trim() ?? null;

  const rows = filterRows([...TRANSACTIONS], { status, fromMs, toMs, search });

  rows.sort((a, b) => {
    const delta = comparator(a, b, sort);
    return order === 'asc' ? delta : -delta;
  });

  const total    = rows.length;
  const pages    = Math.max(1, Math.ceil(total / limit));
  const safePage = Math.min(page, pages);
  const data     = rows.slice((safePage - 1) * limit, safePage * limit).map(maskAccount);

  const result: PaginatedTransactions = { data, total, page: safePage, pages, limit };
  return NextResponse.json(result);
}

function filterRows(
  rows: Transaction[],
  opts: { status: string | null; fromMs: number | null; toMs: number | null; search: string | null },
): Transaction[] {
  return rows.filter((t) => {
    if (opts.status && opts.status !== 'all' && t.status !== (opts.status as TransactionStatus)) return false;
    const ts = new Date(t.date).getTime();
    if (opts.fromMs !== null && ts < opts.fromMs) return false;
    if (opts.toMs   !== null && ts > opts.toMs + 86_400_000) return false;
    if (opts.search) {
      const q = opts.search;
      if (
        !t.description.toLowerCase().includes(q) &&
        !t.sender.toLowerCase().includes(q) &&
        !t.recipient.toLowerCase().includes(q)
      ) return false;
    }
    return true;
  });
}

function comparator(a: Transaction, b: Transaction, sort: SortField): number {
  if (sort === 'amount') return a.amount - b.amount;
  if (sort === 'status') return a.status.localeCompare(b.status);
  return new Date(a.date).getTime() - new Date(b.date).getTime();
}

function maskAccount(t: Transaction): Transaction {
  return { ...t, accountNumber: '•••• •••• •••• ' + t.accountNumber.slice(-4) };
}

function error(code: string, message: string, status: number) {
  return NextResponse.json({ code, message }, { status });
}
