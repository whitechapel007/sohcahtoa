import { NextRequest, NextResponse } from 'next/server';
import { decodeToken, isTokenExpired, createTokens } from '@/lib/auth-tokens';
import { findUserByEmail } from '@/data/mock/user';

const ACCESS_COOKIE  = 'dashboard.access_token';
const REFRESH_COOKIE = 'dashboard.refresh_token';
const EXPIRES_COOKIE = 'dashboard.session_expires';

const PUBLIC_PATHS = ['/login', '/api/auth/login', '/api/auth/logout', '/api/auth/refresh'];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    if (pathname.startsWith('/login')) {
      const token = request.cookies.get(ACCESS_COOKIE)?.value;
      if (token && !isTokenExpired(token)) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
    }
    return NextResponse.next();
  }

  const needsAuth = pathname.startsWith('/dashboard') || pathname.startsWith('/api/dashboard');
  if (!needsAuth) return NextResponse.next();

  const accessToken = request.cookies.get(ACCESS_COOKIE)?.value;

  if (!accessToken) {
    const refreshToken = request.cookies.get(REFRESH_COOKIE)?.value;
    if (refreshToken && !isTokenExpired(refreshToken)) {
      return inlineRefresh(request, refreshToken);
    }
    return redirectToLogin(request, 'unauthenticated');
  }

  const payload = decodeToken(accessToken);
  if (!payload) return redirectToLogin(request, 'invalid_token');

  if (Date.now() > payload.exp) {
    const refreshToken = request.cookies.get(REFRESH_COOKIE)?.value;
    if (refreshToken && !isTokenExpired(refreshToken)) {
      return inlineRefresh(request, refreshToken);
    }
    return clearAndRedirect(request, 'expired');
  }

  return NextResponse.next();
}

function inlineRefresh(request: NextRequest, refreshToken: string): NextResponse {
  const payload = decodeToken(refreshToken);
  if (!payload || payload.type !== 'refresh') {
    return clearAndRedirect(request, 'invalid_refresh');
  }

  // Re-lookup user so role changes take effect without a forced re-login
  findUserByEmail(payload.sub);

  const tokens = createTokens(payload.sub, payload.role, payload.name);
  const expiresAt = Date.now() + tokens.expiresIn;
  const response = NextResponse.next();

  const base = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
  };

  response.cookies.set(ACCESS_COOKIE, tokens.accessToken, { ...base, maxAge: tokens.expiresIn / 1000 });
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

function redirectToLogin(request: NextRequest, reason: string) {
  const url = new URL('/login', request.url);
  url.searchParams.set('from', request.nextUrl.pathname);
  url.searchParams.set('reason', reason);
  return NextResponse.redirect(url);
}

function clearAndRedirect(request: NextRequest, reason: string) {
  const response = redirectToLogin(request, reason);
  response.cookies.delete(ACCESS_COOKIE);
  response.cookies.delete(REFRESH_COOKIE);
  response.cookies.delete(EXPIRES_COOKIE);
  return response;
}

export const config = {
  matcher: [String.raw`/((?!_next/static|_next/image|favicon.ico|.*\.(?:svg|png|jpg|jpeg|gif|webp)$).*)`],
};
