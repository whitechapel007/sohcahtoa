import { MOCK_CARDS } from '@/data/mock/cards';
import type { VirtualCard } from '@/types';

export function getCards(): VirtualCard[] {
  return MOCK_CARDS;
}
