'use client';

import { treaty } from '@elysiajs/eden';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? '/api';
const isAbsolute = /:\/\//.test(API_URL);

export type SessionUser = {
  uuid: string;
  nip: string;
  nama: string;
};

type ApiErrorBody = { message?: string; errors?: Record<string, string> };

type ApiResponse<T> = {
  data: T;
  error: null;
  status: number;
  response: Response;
};

type ApiErrorResponse = {
  data: null;
  error: { status: number; value: ApiErrorBody | undefined };
  status: number;
  response: Response;
};

// `be` and `@elysiajs/eden` resolve elysia to different republished builds of
// 1.4.30, so the `App` type never satisfies eden's `Elysia` constraint and
// `Treaty<App>`/`Treaty.Sign<App['~Routes']>` cannot infer the client. Type the
// endpoints we actually use by hand instead; eden still sends the real requests.
type Client = {
  me: {
    get: (options?: Record<string, unknown>) => Promise<ApiResponse<SessionUser[]> | ApiErrorResponse>;
  };
  auth: {
    login: {
      post: (
        body: { nip: string; password: string },
        options?: Record<string, unknown>,
      ) => Promise<ApiResponse<{ token: string; user: SessionUser }> | ApiErrorResponse>;
    };
    logout: {
      post: (
        options?: Record<string, unknown>,
      ) => Promise<ApiResponse<{ message: string }> | ApiErrorResponse>;
    };
  };
};

export const api = treaty(API_URL, {
  fetch: { credentials: 'include' },
  keepDomain: !isAbsolute,
}) as unknown as Client;

export class ApiError extends Error {
  status: number;
  errors?: Record<string, string>;
  constructor(status: number, message: string, errors?: Record<string, string>) {
    super(message);
    this.status = status;
    this.errors = errors;
  }
}

function unwrap<T>(res: ApiResponse<T> | ApiErrorResponse): T {
  if (res.error) {
    const value = res.error.value;
    throw new ApiError(
      res.error.status,
      value?.message ?? 'Request failed',
      value?.errors,
    );
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
