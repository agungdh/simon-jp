'use client';

import { treaty, type Treaty } from '@elysiajs/eden';
import type { App } from 'be';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? '/api';
const isAbsolute = /:\/\//.test(API_URL);

// `be` and `@elysiajs/eden` resolve elysia to two different build hashes of the
// same version, so `App` can't satisfy eden's `Elysia` constraint directly.
// Build the client type from `App['~Routes']` instead, which avoids that constraint.
type Client = Treaty.Sign<App['~Routes'], {}>;

export const api = treaty(API_URL, {
  fetch: { credentials: 'include' },
  keepDomain: !isAbsolute,
}) as unknown as Client;

export type SessionUser = {
  uuid: string;
  nip: string;
  nama: string;
};

class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

function unwrap<T>(res: any): T {
  if (res.error) {
    const value = res.error.value as { message?: string } | undefined;
    throw new ApiError(res.error.status, value?.message ?? 'Request failed');
  }
  if (res.data === null) {
    throw new ApiError(res.status ?? 500, 'No data');
  }
  return res.data as T;
}

export async function fetchMe(): Promise<SessionUser | null> {
  const res = await api.me.get();
  if (res.status === 401) return null;
  const data = unwrap<SessionUser[]>(res);
  return data[0] ?? null;
}

export async function login(nip: string, password: string): Promise<SessionUser> {
  const res = await api.auth.login.post({ nip, password });
  const data = unwrap<{ token: string; user: SessionUser }>(res);
  return data.user;
}

export async function logout(): Promise<void> {
  const res = await api.auth.logout.post();
  unwrap(res);
}
