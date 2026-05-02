'use client';

import { useEffect, useRef } from 'react';
import type { Transaction } from '@/types';

export interface CardBalanceUpdate {
  cardId: string;
  delta: number;
}

interface Props {
  onTransaction: (tx: Transaction) => void;
  onBalanceUpdate: (update: CardBalanceUpdate) => void;
}

export default function CardsRealtimeStream({ onTransaction, onBalanceUpdate }: Props) {
  // Ref pattern: keep callbacks current without ever closing/reopening the
  // EventSource. Without this, every parent re-render creates new function
  // references, fires useEffect cleanup, and reconnects the SSE connection.
  const onTransactionRef = useRef(onTransaction);
  const onBalanceUpdateRef = useRef(onBalanceUpdate);
  useEffect(() => { onTransactionRef.current = onTransaction; }, [onTransaction]);
  useEffect(() => { onBalanceUpdateRef.current = onBalanceUpdate; }, [onBalanceUpdate]);

  useEffect(() => {
    const es = new EventSource('/api/dashboard/stream/cards');

    es.addEventListener('transaction', (e) => {
      try { onTransactionRef.current(JSON.parse(e.data) as Transaction); } catch {}
    });

    es.addEventListener('balance_update', (e) => {
      try { onBalanceUpdateRef.current(JSON.parse(e.data) as CardBalanceUpdate); } catch {}
    });

    return () => es.close();
  }, []); // empty — open once, stay open

  return null;
}
