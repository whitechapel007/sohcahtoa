import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, apiError } from '@/lib/api-route-helpers';
import { getTransactionById, updateTransaction } from '@/data/mock/transactions';

export const dynamic = 'force-dynamic';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = requireAuth(request);
  if (!auth.ok) return auth.response;

  if (auth.payload.role !== 'admin') {
    return apiError('FORBIDDEN', 'Only admins can flag transactions.', 403);
  }

  const { id } = await params;
  const tx = getTransactionById(id);
  if (!tx) return apiError('NOT_FOUND', `Transaction ${id} not found.`, 404);
  if (tx.status === 'flagged') return apiError('ALREADY_FLAGGED', 'Transaction is already flagged.', 409);

  const updated = updateTransaction(id, {
    status: 'flagged',
    flaggedBy: auth.payload.name,
    flaggedAt: new Date().toISOString(),
  });

  return NextResponse.json({ ok: true, transaction: updated });
}
