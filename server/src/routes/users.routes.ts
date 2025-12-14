import { Router } from 'express';
import { validate } from '../middleware/validate';
import { asyncHandler } from '../middleware/async-handler';
import { sendSuccess } from '../lib/api-response';
import { createUserBodySchema } from '@app/shared';

export const usersRouter = Router();

usersRouter.post(
  '/',
  validate(createUserBodySchema, 'body'),
  asyncHandler(async (req, res) => {
    // req.body is now validated and typed
    sendSuccess(res, { ok: true }, 201);
  }),
);
