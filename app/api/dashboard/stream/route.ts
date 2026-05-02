import { NextRequest, NextResponse } from 'next/server';
import { decodeToken } from '@/lib/auth-tokens';
import { ACCESS_COOKIE } from '@/lib/auth-cookies';
import type { Transaction } from '@/types';

export const dynamic = 'force-dynamic';
const INTERVAL_MS = 5_000;

const DESCRIPTIONS = [
  'Inbound wire — Adaeze Obi',
  'FX conversion — EUR/USD',
  'PTA disbursement',
  'Transfer from CBN correspondent',
  'BTA — executive travel allowance',
  'Medical reimbursement — NHIS',
  'Wallet top-up via USSD',
];

const SENDERS = [
  'CBN Correspondent Bank',
  'FX Desk',
  'Payroll System',
  'Adaeze Obi',
  'Zenith Bank Transfer',
];

export async function GET(request: NextRequest) {
  const token = request.cookies.get(ACCESS_COOKIE)?.value;
  const payload = token ? decodeToken(token) : null;
  if (!payload || Date.now() > payload.exp) {
    return NextResponse.json({ code: 'UNAUTHORIZED' }, { status: 401 });
  }

  let counter = 0;
  let intervalId: ReturnType<typeof setInterval>;
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(encoder.encode(': connected\n\n'));

      intervalId = setInterval(() => {
        if (request.signal.aborted) {
          clearInterval(intervalId);
          controller.close();
          return;
        }
        counter += 1;
        const tx = makeTransaction(counter);
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(tx)}\n\n`));
      }, INTERVAL_MS);
    },
    cancel() {
      clearInterval(intervalId);
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}

function makeTransaction(counter: number): Transaction {
  const amount = parseFloat((Math.random() * 4000 - 500).toFixed(2));
  const statuses: Transaction['status'][] = ['pending', 'completed'];
  const categories: Transaction['category'][] = ['FX', 'Transfer', 'PTA'];

  return {
    id: `tx_stream_${Date.now()}_${counter}`,
    description: DESCRIPTIONS[counter % DESCRIPTIONS.length],
    amount,
    currency: 'USD',
    status: statuses[counter % statuses.length],
    category: categories[counter % categories.length],
    date: new Date().toISOString(),
    sender: SENDERS[counter % SENDERS.length],
    recipient: 'Emmanuel Israel',
    accountNumber: '•••• •••• •••• 0000',
  };
}
