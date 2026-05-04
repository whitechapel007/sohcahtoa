import { NextRequest, NextResponse } from 'next/server';
import { decodeToken } from '@/lib/auth-tokens';
import { ACCESS_COOKIE } from '@/lib/auth-cookies';
import type { AuthTokenPayload, Transaction } from '@/types';

export type AuthResult =
  | { ok: true; payload: AuthTokenPayload }
  | { ok: false; response: NextResponse };

export function requireAuth(request: NextRequest): AuthResult {
  const token = request.cookies.get(ACCESS_COOKIE)?.value;
  const payload = token ? decodeToken(token) : null;
  if (!payload || Date.now() > payload.exp) {
    return { ok: false, response: apiError('UNAUTHORIZED', 'Authentication required.', 401) };
  }
  return { ok: true, payload };
}

export function apiError(code: string, message: string, status: number): NextResponse {
  return NextResponse.json({ code, message }, { status });
}

export function maskAccount(t: Transaction): Transaction {
  return { ...t, accountNumber: '•••• •••• •••• ' + t.accountNumber.slice(-4) };
}
