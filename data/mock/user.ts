import type { MockUser } from '@/types';

export const MOCK_USERS: MockUser[] = [
  {
    id: 'usr_admin_01',
    name: 'Emmanuel Israel',
    firstName: 'Emmanuel',
    email: 'admin@sohcahtoa.com',
    avatar: null,
    role: 'admin',
  },
  {
    id: 'usr_analyst_01',
    name: 'Amaka Okonkwo',
    firstName: 'Amaka',
    email: 'analyst@sohcahtoa.com',
    avatar: null,
    role: 'analyst',
  },
];

export const DEMO_CREDENTIALS: Record<string, string> = {
  'admin@sohcahtoa.com': 'admin123',
  'analyst@sohcahtoa.com': 'analyst123',
};

export function findUserByEmail(email: string): MockUser | undefined {
  return MOCK_USERS.find((u) => u.email === email);
}
