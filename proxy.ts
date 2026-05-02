import { NextRequest, NextResponse } from "next/server";
import { decodeToken, createTokens } from "@/lib/auth-tokens";
import { ACCESS_COOKIE, REFRESH_COOKIE } from "@/lib/auth-cookies";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Static assets and public routes — bypass auth entirely
  const isPublic =
    pathname.startsWith("/login") ||
    pathname.startsWith("/api/auth") ||
    /\.(?:svg|png|jpg|jpeg|gif|webp|ico)$/.test(pathname);

  if (isPublic) return NextResponse.next();

  const accessToken = request.cookies.get(ACCESS_COOKIE)?.value;
  const refreshToken = request.cookies.get(REFRESH_COOKIE)?.value;

  // No tokens at all — hard redirect
  if (!accessToken && !refreshToken) {
    return redirectToLogin(request, "unauthenticated");
  }

  // Access token missing but refresh token present — silent repair
  if (!accessToken && refreshToken) {
    return handleInlineRefresh(request, refreshToken);
  }

  return NextResponse.next();
}

function handleInlineRefresh(request: NextRequest, refreshToken: string) {
  const payload = decodeToken(refreshToken);

  if (payload?.type !== "refresh" || Date.now() > payload.exp) {
    return redirectToLogin(request, "session_expired");
  }

  const tokens = createTokens(payload.sub, payload.role, payload.name);

  const base = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
  };

  // Forward the new access token to downstream Server Components via request
  // headers. Cookies on the response only reach the browser on the next
  // request; the Authorization header bridges the gap for this request.
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("Authorization", `Bearer ${tokens.accessToken}`);

  const response = NextResponse.next({ request: { headers: requestHeaders } });

  response.cookies.set(ACCESS_COOKIE, tokens.accessToken, {
    ...base,
    maxAge: tokens.expiresIn / 1000,
  });
  response.cookies.set(REFRESH_COOKIE, tokens.refreshToken, {
    ...base,
    maxAge: 7 * 24 * 60 * 60,
  });

  return response;
}

function redirectToLogin(request: NextRequest, reason: string) {
  const url = new URL("/login", request.url);
  url.searchParams.set("reason", reason);
  url.searchParams.set("from", request.nextUrl.pathname);
  return NextResponse.redirect(url);
}

// Exclude Next.js internals and static files from the proxy.
// File-extension assets (svg, png, etc.) are handled by the isPublic
// check above as a runtime safety net for files served from /public.
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
