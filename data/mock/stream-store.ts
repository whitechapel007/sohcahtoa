import type { Transaction } from '@/types';

const MAX_SIZE = 500;
const store = new Map<string, Transaction>();

export function registerStreamTransaction(tx: Transaction) {
  if (store.size >= MAX_SIZE) {
    store.delete(store.keys().next().value!); // evict oldest (insertion order)
  }
  store.set(tx.id, tx);
}

export function getStreamTransaction(id: string): Transaction | undefined {
  return store.get(id);
}

export function updateStreamTransaction(id: string, patch: Partial<Transaction>): Transaction | null {
  const tx = store.get(id);
  if (!tx) return null;
  const updated = { ...tx, ...patch };
  store.set(id, updated);
  return updated;
}
