import { Router } from 'express';

import { sendSuccess } from '../lib/api-response';

export const healthRouter = Router();

healthRouter.get('/', (_req, res) => {
  sendSuccess(res, { ok: true });
});
