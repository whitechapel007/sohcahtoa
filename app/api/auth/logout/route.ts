import { NextResponse } from 'next/server';

const ACCESS_COOKIE  = 'dashboard.access_token';
const REFRESH_COOKIE = 'dashboard.refresh_token';
const EXPIRES_COOKIE = 'dashboard.session_expires';

export async function POST() {
  const response = NextResponse.json({ success: true });
  response.cookies.delete(ACCESS_COOKIE);
  response.cookies.delete(REFRESH_COOKIE);
  response.cookies.delete(EXPIRES_COOKIE);
  return response;
}
