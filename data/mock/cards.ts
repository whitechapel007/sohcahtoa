import type { VirtualCard } from '@/types';

export const MOCK_CARDS: VirtualCard[] = [
  {
    id: 'card_01',
    type: 'prepaid',
    network: 'VISA',
    lastFour: '7093',
    validThru: '08/27',
    balance: 3048.0,
    currency: 'USD',
    holder: 'Emmanuel Israel',
    color: 'orange',
  },
];
