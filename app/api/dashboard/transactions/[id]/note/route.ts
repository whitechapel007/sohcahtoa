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

  const body = await request.json().catch(() => null);
  if (!body || typeof body.note !== 'string' || body.note.trim() === '') {
    return apiError('INVALID_INPUT', 'Note must be a non-empty string.', 400);
  }

  const safeNote = body.note
    .trim()
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .slice(0, 500);

  const { id } = await params;
  if (!getTransactionById(id)) return apiError('NOT_FOUND', `Transaction ${id} not found.`, 404);

  const updated = updateTransaction(id, { note: safeNote });
  return NextResponse.json({ ok: true, transaction: updated });
}
