'use client';

import axios, { type AxiosRequestConfig } from 'axios';
import { refreshWithMutex } from '@/lib/refresh-mutex';

let controller = new AbortController();

export function cancelAllRequests() {
  controller.abort();
  controller = new AbortController();
}

export async function apiFetch(
  url: string,
  options: AxiosRequestConfig = {}
) {
  const request = () =>
    axios({
      url,
      withCredentials: true,
      signal: controller.signal,
      ...options,
    });

  try {
    const res = await request();
    return res.data;
  } catch (error) {
    if (!is401(error)) throw parseError(error);

    const refreshed = await refreshWithMutex();

    if (!refreshed) {
      cancelAllRequests();
      await axios.post('/api/auth/logout', null, { withCredentials: true }).catch(() => {});
      window.location.href = '/login?reason=session_expired';
      throw parseError(error);
    }

    try {
      const retry = await request();
      return retry.data;
    } catch (err) {
      throw parseError(err);
    }
  }
}

export function apiFetchJSON<T>(
  url: string,
  options: AxiosRequestConfig = {}
): Promise<T> {
  return apiFetch(url, options);
}

// helpers

function is401(err: unknown) {
  return axios.isAxiosError(err) && err.response?.status === 401;
}

function parseError(err: unknown) {
  if (axios.isAxiosError(err)) {
    return {
      message: err.response?.data?.message || err.message,
      code: err.response?.data?.code || 'UNKNOWN',
      status: err.response?.status || 0,
    };
  }

  return {
    message: err instanceof Error ? err.message : 'Unknown error',
    code: 'UNKNOWN',
    status: 0,
  };
}
