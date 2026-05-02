import { NextResponse } from 'next/server';
import { MOCK_CARDS } from '@/data/mock/cards';

export async function GET() {
  return NextResponse.json(MOCK_CARDS);
}
