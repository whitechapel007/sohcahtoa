import { NextRequest, NextResponse } from 'next/server';
import { decodeToken } from '@/lib/auth-tokens';
import { ACCESS_COOKIE } from '@/lib/auth-cookies';
import { getTransactionById, updateTransaction } from '@/data/mock/transactions';

export const dynamic = 'force-dynamic';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const token = request.cookies.get(ACCESS_COOKIE)?.value;
  const payload = token ? decodeToken(token) : null;
  if (!payload || Date.now() > payload.exp) {
    return error('UNAUTHORIZED', 'Authentication required.', 401);
  }

  const body = await request.json().catch(() => null);
  if (!body || typeof body.note !== 'string' || body.note.trim() === '') {
    return error('INVALID_INPUT', 'Note must be a non-empty string.', 400);
  }

  const safeNote = body.note
    .trim()
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .slice(0, 500);

  const { id } = await params;
  if (!getTransactionById(id)) {
    return error('NOT_FOUND', `Transaction ${id} not found.`, 404);
  }

  const updated = updateTransaction(id, { note: safeNote });
  return NextResponse.json({ ok: true, transaction: updated });
}

function error(code: string, message: string, status: number) {
  return NextResponse.json({ code, message }, { status });
}
