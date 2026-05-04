import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, apiError, maskAccount } from '@/lib/api-route-helpers';
import { getTransactionById } from '@/data/mock/transactions';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = requireAuth(request);
  if (!auth.ok) return auth.response;

  const { id } = await params;
  const tx = getTransactionById(id);

  if (!tx) return apiError('NOT_FOUND', `Transaction ${id} not found.`, 404);

  return NextResponse.json(maskAccount(tx));
}
