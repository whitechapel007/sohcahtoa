import { NextRequest, NextResponse } from 'next/server';
import { decodeToken } from '@/lib/auth-tokens';
import { getTransactionById, updateTransaction } from '@/data/mock/transactions';

export const dynamic = 'force-dynamic';

const ACCESS_COOKIE = 'dashboard.access_token';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const token = request.cookies.get(ACCESS_COOKIE)?.value;
  const payload = token ? decodeToken(token) : null;
  if (!payload || Date.now() > payload.exp) {
    return error('UNAUTHORIZED', 'Authentication required.', 401);
  }

  if (payload.role !== 'admin') {
    return error('FORBIDDEN', 'Only admins can flag transactions.', 403);
  }

  const { id } = await params;
  const tx = getTransactionById(id);
  if (!tx) return error('NOT_FOUND', `Transaction ${id} not found.`, 404);
  if (tx.status === 'flagged') return error('ALREADY_FLAGGED', 'Transaction is already flagged.', 409);

  const updated = updateTransaction(id, {
    status: 'flagged',
    flaggedBy: payload.name,
    flaggedAt: new Date().toISOString(),
  });

  return NextResponse.json({ ok: true, transaction: updated });
}

function error(code: string, message: string, status: number) {
  return NextResponse.json({ code, message }, { status });
}
