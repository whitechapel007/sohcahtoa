import { NextRequest, NextResponse } from 'next/server';
import { decodeToken, createTokens } from '@/lib/auth-tokens';

const ACCESS_COOKIE  = 'dashboard.access_token';
const REFRESH_COOKIE = 'dashboard.refresh_token';
const EXPIRES_COOKIE = 'dashboard.session_expires';

export async function POST(request: NextRequest) {
  const refreshToken = request.cookies.get(REFRESH_COOKIE)?.value;
  if (!refreshToken) {
    return error('NO_REFRESH_TOKEN', 'No refresh token present.', 401);
  }

  const payload = decodeToken(refreshToken);
  if (!payload)                  return clearAndError('INVALID_REFRESH_TOKEN', 'Refresh token is invalid.', 401);
  if (payload.type !== 'refresh') return clearAndError('WRONG_TOKEN_TYPE', 'Token is not a refresh token.', 401);
  if (Date.now() > payload.exp)  return clearAndError('REFRESH_TOKEN_EXPIRED', 'Refresh token has expired.', 401);

  const tokens = createTokens(payload.sub, payload.role, payload.name);
  const expiresAt = Date.now() + tokens.expiresIn;

  const base = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
  };

  const response = NextResponse.json({
    user: { id: payload.sub, role: payload.role, name: payload.name },
    expiresIn: tokens.expiresIn,
  });

  response.cookies.set(ACCESS_COOKIE,  tokens.accessToken,  { ...base, maxAge: tokens.expiresIn / 1000 });
  response.cookies.set(REFRESH_COOKIE, tokens.refreshToken, { ...base, maxAge: 7 * 24 * 60 * 60 });
  response.cookies.set(EXPIRES_COOKIE, String(expiresAt), {
    httpOnly: false,
    secure: base.secure,
    sameSite: 'lax',
    path: '/',
    maxAge: tokens.expiresIn / 1000,
  });

  return response;
}

function error(code: string, message: string, status: number) {
  return NextResponse.json({ code, message }, { status });
}

function clearAndError(code: string, message: string, status: number) {
  const res = error(code, message, status);
  res.cookies.delete(ACCESS_COOKIE);
  res.cookies.delete(REFRESH_COOKIE);
  res.cookies.delete(EXPIRES_COOKIE);
  return res;
}
