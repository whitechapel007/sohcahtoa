import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/api-route-helpers';
import { MOCK_CARDS } from '@/data/mock/cards';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const auth = requireAuth(request);
  if (!auth.ok) return auth.response;

  return NextResponse.json(MOCK_CARDS);
}
