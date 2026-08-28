'use client';

export interface SessionUser {
  uuid: string;
  nip: string;
  nama: string;
}

async function parse<T>(res: Response): Promise<T> {
  const data = await res.json();
  if (!res.ok) {
    throw new Error((data as { message?: string }).message ?? 'Request failed');
  }
  return data as T;
}

export async function fetchMe(): Promise<SessionUser | null> {
  const res = await fetch('/api/me', { credentials: 'include' });
  if (res.status === 401) return null;
  const data = await parse<SessionUser[] | SessionUser>(res);
  return Array.isArray(data) ? (data[0] ?? null) : data;
}

export async function login(
  nip: string,
  password: string,
): Promise<SessionUser> {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nip, password }),
  });
  const data = await parse<{ user: SessionUser }>(res);
  return data.user;
}

export async function logout(): Promise<void> {
  const res = await fetch('/api/auth/logout', {
    method: 'POST',
    credentials: 'include',
  });
  await parse<unknown>(res);
}
