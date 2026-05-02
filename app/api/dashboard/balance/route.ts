import { NextResponse } from 'next/server';
import { MOCK_BALANCE } from '@/data/mock/balance';

export async function GET() {
  return NextResponse.json(MOCK_BALANCE);
}
