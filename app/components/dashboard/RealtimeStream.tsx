'use client';

import { useEffect } from 'react';
import type { Transaction } from '@/types';

interface Props {
  onNewTransaction: (tx: Transaction) => void;
}

export default function RealtimeStream({ onNewTransaction }: Props) {
  useEffect(() => {
    const es = new EventSource('/api/dashboard/stream');

    es.onmessage = (e) => {
      try {
        const tx = JSON.parse(e.data) as Transaction;
        onNewTransaction(tx);
      } catch {
        // ignore malformed or non-JSON events
      }
    };

    return () => es.close();
  }, [onNewTransaction]);

  return null;
}
