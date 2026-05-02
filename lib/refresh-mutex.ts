'use client';

import axios from 'axios';
import type { AuthUser } from '@/types';

type RefreshResult = {
  user: AuthUser;
  expiresIn: number;
};

// holds the current refresh request (if one is running)
let refreshPromise: Promise<RefreshResult | null> | null = null;

export async function refreshWithMutex(): Promise<RefreshResult | null> {
  // if a refresh is already happening, just wait for it
  if (refreshPromise) {
    return refreshPromise;
  }

  // start a new refresh request
  refreshPromise = axios
    .post<{ user: AuthUser; expiresIn: number }>(
      '/api/auth/refresh',
      null,
      { withCredentials: true }
    )
    .then((res) => ({
      user: res.data.user,
      expiresIn: res.data.expiresIn,
    }))
    .catch(() => null)
    .finally(() => {
      // clear it so future calls can run again
      refreshPromise = null;
    });

  return refreshPromise;
}
