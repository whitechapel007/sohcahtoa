import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/api-route-helpers';
import { registerStreamTransaction } from '@/data/mock/stream-store';
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
  const auth = requireAuth(request);
  if (!auth.ok) return auth.response;

  let counter = 0;
  let intervalId: ReturnType<typeof setInterval>;
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(encoder.encode(': connected\n\n'));

      // Fires immediately on client disconnect or HMR — don't wait for next tick
      request.signal.addEventListener('abort', () => {
        clearInterval(intervalId);
        try { controller.close(); } catch {}
      }, { once: true });

      intervalId = setInterval(() => {
        counter += 1;
        const tx = makeTransaction(counter);
        registerStreamTransaction(tx);
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
    accountNumber: '0000',
  };
}
