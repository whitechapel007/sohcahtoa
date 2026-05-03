import { NextRequest, NextResponse } from 'next/server';
import { decodeToken } from '@/lib/auth-tokens';
import { ACCESS_COOKIE } from '@/lib/auth-cookies';
import { MOCK_BALANCE } from '@/data/mock/balance';

export async function GET(request: NextRequest) {
  const token = request.cookies.get(ACCESS_COOKIE)?.value;
  const payload = token ? decodeToken(token) : null;
  if (!payload || Date.now() > payload.exp) {
    return NextResponse.json({ code: 'UNAUTHORIZED', message: 'Authentication required.' }, { status: 401 });
  }

  return NextResponse.json(MOCK_BALANCE);
}
