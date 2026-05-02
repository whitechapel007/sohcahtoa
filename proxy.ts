import { NextRequest, NextResponse } from 'next/server';
import { decodeToken, createTokens } from '@/lib/auth-tokens';
import { ACCESS_COOKIE, REFRESH_COOKIE } from '@/lib/auth-cookies';

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Define Public Paths
  const isPublic = pathname.startsWith('/login') || pathname.startsWith('/api/auth');
  if (isPublic) return NextResponse.next();

  const accessToken = request.cookies.get(ACCESS_COOKIE)?.value;
  const refreshToken = request.cookies.get(REFRESH_COOKIE)?.value;

  // 2. The "Hard" Redirect: No tokens at all
  if (!accessToken && !refreshToken) {
    return redirectToLogin(request, 'unauthenticated');
  }

  // 3. The "Silent Repair": Access is gone, but we have a Refresh Token
  if (!accessToken && refreshToken) {
    return handleInlineRefresh(request, refreshToken);
  }

  return NextResponse.next();
}

/**
 * Handles the "Silent Refresh" logic directly in the Request/Response lifecycle.
 */
function handleInlineRefresh(request: NextRequest, refreshToken: string) {
  const payload = decodeToken(refreshToken);

  if (payload?.type !== 'refresh' || Date.now() > payload.exp) {
    return redirectToLogin(request, 'session_expired');
  }

  const tokens = createTokens(payload.sub, payload.role, payload.name);

  const base = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
  };

  /**
   * CRITICAL STEP: Forward the new access token to downstream Server Components.
   * Middleware sets cookies on the *response*, but Server Components read from
   * the *request*. We sync by cloning request headers with the Authorization value.
   */
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('Authorization', `Bearer ${tokens.accessToken}`);

  const response = NextResponse.next({ request: { headers: requestHeaders } });

  response.cookies.set(ACCESS_COOKIE,  tokens.accessToken,  { ...base, maxAge: tokens.expiresIn / 1000 });
  response.cookies.set(REFRESH_COOKIE, tokens.refreshToken, { ...base, maxAge: 7 * 24 * 60 * 60 });

  return response;
}

function redirectToLogin(request: NextRequest, reason: string) {
  const url = new URL('/login', request.url);
  url.searchParams.set('reason', reason);
  url.searchParams.set('from', request.nextUrl.pathname);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ['/((?!_next|favicon.ico|.*\\.(svg|png|jpg|jpeg|gif|webp)$).*)'],
};
