import type { ApiResponse } from '@app/shared';

export class ApiError extends Error {
  status: number;
  code?: string;

  constructor(status: number, message: string, code?: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

export async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(path);

  let json: ApiResponse<T>;
  try {
    json = await res.json();
  } catch {
    throw new ApiError(res.status, `Request failed with status ${res.status}`);
  }

  if (json.error) {
    throw new ApiError(res.status, json.error.message, json.error.code);
  }

  return json.data;
}
