import express, { type Request, type Response, type NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';

import { config } from './config';
import { apiRouter } from './routes';

export const createApp = () => {
  const app = express();

  app.disable('x-powered-by');
  app.use(morgan('combined'));
  app.use(express.json({ limit: '1mb' }));

  app.use(
    helmet({
      crossOriginResourcePolicy: false,
    }),
  );

  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 100,
      standardHeaders: true,
      legacyHeaders: false,
    }),
  );

  app.use(
    cors({
      origin: (origin, cb) => {
        if (!origin) return cb(null, true);
        if (config.corsOrigin.includes(origin)) return cb(null, true);
        return cb(new Error('Not allowed by CORS'));
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    }),
  );

  app.use('/api', apiRouter);

  return app;
};
