import type { RequestHandler } from 'express';
import type { ZodType } from 'zod';
// import { AppError } from './AppError';

type Target = 'body' | 'query' | 'params';

export const validate =
  <T>(schema: ZodType<T>, target: Target = 'body'): RequestHandler =>
  (req, _res, next) => {
    const result = schema.safeParse(req[target]);

    if (!result.success) {
      const issues = result.error.issues.map(issue => ({
        path: issue.path.join('.') || '(root)',
        message: issue.message,
      }));

      return next();
      // new AppError(
      //   `Validation error: ${issues.map(i => `${i.path}: ${i.message}`).join('; ')}`,
      //   {
      //     statusCode: 400,
      //     code: 'VALIDATION_ERROR',
      //     details: issues,
      //   },
      // ),
    }

    Object.assign(req, { [target]: result.data });

    next();
  };
