import { NextRequest, NextResponse } from 'next/server';
import { decodeToken } from '@/lib/auth-tokens';
import { ACCESS_COOKIE } from '@/lib/auth-cookies';
import { getTransactionById } from '@/data/mock/transactions';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const token = request.cookies.get(ACCESS_COOKIE)?.value;
  const payload = token ? decodeToken(token) : null;
  if (!payload || Date.now() > payload.exp) {
    return NextResponse.json({ code: 'UNAUTHORIZED', message: 'Authentication required.' }, { status: 401 });
  }

  const { id } = await params;
  const tx = getTransactionById(id);

  if (!tx) {
    return NextResponse.json({ code: 'NOT_FOUND', message: `Transaction ${id} not found.` }, { status: 404 });
  }

  return NextResponse.json({
    ...tx,
    accountNumber: '•••• •••• •••• ' + tx.accountNumber.slice(-4),
  });
}
