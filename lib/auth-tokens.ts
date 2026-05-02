import { createHmac, timingSafeEqual } from 'crypto';
import type { AuthTokenPayload, AuthTokens, UserRole } from '@/types';

const SECRET = process.env.TOKEN_SECRET ?? 'dev_secret_change_in_production';
const ACCESS_TTL  = 15 * 60 * 1000;
const REFRESH_TTL = 7 * 24 * 60 * 60 * 1000;

export function createTokens(userId: string, role: UserRole, name: string): AuthTokens {
  const now = Date.now();
  return {
    accessToken:  encode({ sub: userId, role, name, iat: now, exp: now + ACCESS_TTL,  type: 'access'  }),
    refreshToken: encode({ sub: userId, role, name, iat: now, exp: now + REFRESH_TTL, type: 'refresh' }),
    expiresIn: ACCESS_TTL,
  };
}

export function decodeToken(token: string): AuthTokenPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3 || parts[0] !== 'mock') return null;
    if (!timingSafeEqual(Buffer.from(parts[2]), Buffer.from(sign(parts[1])))) return null;
    return JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8')) as AuthTokenPayload;
  } catch {
    return null;
  }
}

export function isTokenExpired(token: string): boolean {
  const payload = decodeToken(token);
  return !payload || Date.now() > payload.exp;
}

export function getTokenExpiry(token: string): number | null {
  const payload = decodeToken(token);
  return payload ? payload.exp : null;
}

function encode(payload: AuthTokenPayload): string {
  const b64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
  return `mock.${b64}.${sign(b64)}`;
}

function sign(b64: string): string {
  return createHmac('sha256', SECRET).update(b64).digest('base64url').slice(0, 24);
}
