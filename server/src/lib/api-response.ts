import type { Response } from 'express';

export function sendSuccess<T>(res: Response, data: T, statusCode = 200) {
  return res.status(statusCode).json({
    data,
    error: null,
  });
}

export function sendError(
  res: Response,
  message: string,
  statusCode = 500,
  code?: string,
) {
  return res.status(statusCode).json({
    data: null,
    error: {
      message,
      code,
    },
  });
}
