import { NextRequest, NextResponse } from 'next/server';
import { decodeToken } from '@/lib/auth-tokens';

const ACCESS_COOKIE = 'dashboard.access_token';

export async function GET(request: NextRequest) {
  const accessToken = request.cookies.get(ACCESS_COOKIE)?.value;

  if (!accessToken) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  const payload = decodeToken(accessToken);
  if (!payload || Date.now() > payload.exp) {
    return NextResponse.json({ authenticated: false, reason: 'expired' }, { status: 401 });
  }

  return NextResponse.json({
    authenticated: true,
    user: { id: payload.sub, role: payload.role, name: payload.name },
  });
}
