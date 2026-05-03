'use client';

import { useEffect, useRef } from 'react';
import type { Transaction } from '@/types';

interface Props {
  onTransaction: (tx: Transaction) => void;
  onError?: (err: Event) => void;
}

export default function RealtimeStream({ onTransaction, onError }: Props) {
  // Keep callback refs current so the EventSource never needs to reconnect
  // when the parent re-renders. Without this, every state update in the
  // parent recreates the callback, which triggers useEffect, which closes
  // and reopens the connection on every incoming message.
  const callbackRef = useRef(onTransaction);
  const errorRef = useRef(onError);
  useEffect(() => { callbackRef.current = onTransaction; }, [onTransaction]);
  useEffect(() => { errorRef.current = onError; }, [onError]);

  useEffect(() => {
    const es = new EventSource('/api/dashboard/stream');

    es.onmessage = (e) => {
      try {
        callbackRef.current(JSON.parse(e.data) as Transaction);
      } catch {
        // ignore malformed events
      }
    };

    es.onerror = (err) => {
      errorRef.current?.(err);
    };

    return () => es.close();
  }, []); // empty — open once, stay open

  return null;
}
