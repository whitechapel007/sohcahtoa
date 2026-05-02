import { NextRequest, NextResponse } from 'next/server';
import { createTokens } from '@/lib/auth-tokens';
import { findUserByEmail, DEMO_CREDENTIALS } from '@/data/mock/user';

const ACCESS_COOKIE  = 'dashboard.access_token';
const REFRESH_COOKIE = 'dashboard.refresh_token';
const EXPIRES_COOKIE = 'dashboard.session_expires';

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body || typeof body.email !== 'string' || typeof body.password !== 'string') {
    return error('INVALID_INPUT', 'Email and password are required.', 400);
  }

  const email = body.email.toLowerCase().trim();
  const user = findUserByEmail(email);
  const expectedPassword = DEMO_CREDENTIALS[email];

  if (!user || !expectedPassword || body.password !== expectedPassword) {
    return error('INVALID_CREDENTIALS', 'Invalid email or password.', 401);
  }

  const tokens = createTokens(user.id, user.role, user.name);
  const expiresAt = Date.now() + tokens.expiresIn;

  const base = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
  };

  const response = NextResponse.json({
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    expiresIn: tokens.expiresIn,
    user: { id: user.id, role: user.role, name: user.name, email: user.email },
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
