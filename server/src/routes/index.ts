import { Router } from 'express';

import { healthRouter } from '../features/health/health.routes';

export const apiRouter = Router();

apiRouter.use('/health', healthRouter);
