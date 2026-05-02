import { MOCK_BALANCE } from '@/data/mock/balance';
import type { BalanceSummary } from '@/types';

export function getBalance(): BalanceSummary {
  return MOCK_BALANCE;
}
