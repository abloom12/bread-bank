import type { RequestHandler } from 'express';
import type { ZodType } from 'zod';
import { AppError } from '../errors/AppError';

type Target = 'body' | 'query' | 'params';

export const validate =
  (schema: ZodType<unknown>, target: Target = 'body'): RequestHandler =>
  (req, _res, next) => {
    const result = schema.safeParse(req[target]);

    if (!result.success) {
      return next(
        new AppError(
          `Validation error: ${result.error.issues
            .map(issue => {
              const path = issue.path.join('.') || '(root)';
              return `${path}: ${issue.message}`;
            })
            .join('; ')}`,
          400,
        ),
      );
    }

    (req as any)[target] = result.data;
    next();
  };
