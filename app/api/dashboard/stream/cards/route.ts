import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/api-route-helpers';
import { MOCK_CARDS } from '@/data/mock/cards';
import type { Transaction } from '@/types';

export const dynamic = 'force-dynamic';

const TX_INTERVAL_MS = 5_000;
const BALANCE_INTERVAL_MS = 5_000;

const DESCRIPTIONS = [
  'Card purchase — Apple Store',
  'POS transaction — Shoprite Lagos',
  'Online payment — Netflix',
  'ATM withdrawal — Victoria Island',
  'FX card spend — Amazon',
  'Contactless — Chicken Republic',
  'Card top-up — FX Desk',
];

const SENDERS = ['Card network', 'Merchant', 'ATM operator', 'FX Desk', 'POS terminal'];

export async function GET(request: NextRequest) {
  const auth = requireAuth(request);
  if (!auth.ok) return auth.response;

  let counter = 0;
  let txIntervalId: ReturnType<typeof setInterval>;
  let balanceIntervalId: ReturnType<typeof setInterval>;
  const encoder = new TextEncoder();

  function cleanup() {
    clearInterval(txIntervalId);
    clearInterval(balanceIntervalId);
  }

  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(encoder.encode(': connected\n\n'));

      // Fires immediately on client disconnect or HMR — don't wait for next tick
      request.signal.addEventListener('abort', () => {
        cleanup();
        try { controller.close(); } catch {}
      }, { once: true });

      txIntervalId = setInterval(() => {
        counter += 1;
        const tx = makeCardTransaction(counter);
        controller.enqueue(encoder.encode(`event: transaction\ndata: ${JSON.stringify(tx)}\n\n`));
      }, TX_INTERVAL_MS);

      balanceIntervalId = setInterval(() => {
        const card = MOCK_CARDS[Math.floor(Math.random() * MOCK_CARDS.length)];
        const delta = Number.parseFloat((Math.random() * 300 - 80).toFixed(2));
        controller.enqueue(
          encoder.encode(`event: balance_update\ndata: ${JSON.stringify({ cardId: card.id, delta })}\n\n`),
        );
      }, BALANCE_INTERVAL_MS);
    },
    cancel() {
      cleanup();
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

function makeCardTransaction(counter: number): Transaction {
  const amount = Number.parseFloat((Math.random() * 800 - 200).toFixed(2));
  const statuses: Transaction['status'][] = ['pending', 'completed'];

  return {
    id: `tx_card_${Date.now()}_${counter}`,
    description: DESCRIPTIONS[counter % DESCRIPTIONS.length],
    amount,
    currency: 'USD',
    status: statuses[counter % statuses.length],
    category: 'Transfer',
    date: new Date().toISOString(),
    sender: SENDERS[counter % SENDERS.length],
    recipient: 'Emmanuel Israel',
    accountNumber: '7093',
  };
}
