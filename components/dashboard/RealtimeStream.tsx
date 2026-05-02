'use client';

import { useEffect, useRef } from 'react';
import type { Transaction } from '@/types';

interface Props {
  onNewTransaction: (tx: Transaction) => void;
}

export default function RealtimeStream({ onNewTransaction }: Props) {
  // Keep callback ref current so the EventSource never needs to reconnect
  // when the parent re-renders. Without this, every state update in the
  // parent recreates the callback, which triggers useEffect, which closes
  // and reopens the connection on every incoming message.
  const callbackRef = useRef(onNewTransaction);
  useEffect(() => { callbackRef.current = onNewTransaction; }, [onNewTransaction]);

  useEffect(() => {
    const es = new EventSource('/api/dashboard/stream');

    es.onmessage = (e) => {
      try {
        callbackRef.current(JSON.parse(e.data) as Transaction);
      } catch {
        // ignore malformed events
      }
    };

    return () => es.close();
  }, []); // empty — open once, stay open

  return null;
}
