import type { ApiResponse } from '@app/shared';

import { env } from '@/config/env';
import { router } from '@/lib/router';

class ApiRequestError extends Error {
  status: number;
  code?: string;

  constructor(status: number, message: string, code?: string) {
    super(message);
    this.name = 'ApiRequestError';
    this.status = status;
    this.code = code;
  }
}

type RequestOptions = Omit<RequestInit, 'method' | 'body'> & {
  params?: Record<string, string>;
};

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
  options: RequestOptions = {},
): Promise<T> {
  const { params, ...fetchOptions } = options;

  const url = new URL(path, env.VITE_API_URL);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });
  }

  const response = await fetch(url, {
    method,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...fetchOptions.headers,
    },
    body: body ? JSON.stringify(body) : undefined,
    ...fetchOptions,
  });

  if (response.status === 401) {
    router.navigate({ to: '/login' });
    throw new ApiRequestError(401, 'Unauthorized');
  }

    let json: ApiResponse<T>;
    try {
      json = await response.json();
    } catch {
      throw new ApiRequestError(response.status, `Request failed with status ${response.status}`);
    }

    if (json.error) {
      throw new ApiRequestError(response.status, json.error.message, json.error.code);
    }

    return json.data;
}

const api = {
  get: <T>(path: string, options?: RequestOptions) =>
    request<T>('GET', path, undefined, options),

  post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>('POST', path, body, options),

  put: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>('PUT', path, body, options),

  patch: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>('PATCH', path, body, options),

  delete: <T>(path: string, options?: RequestOptions) =>
    request<T>('DELETE', path, undefined, options),
};

export { ApiRequestError, api };