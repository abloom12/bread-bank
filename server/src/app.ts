import express, { type Request, type Response, type NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import { toNodeHandler } from 'better-auth/node';

import { config } from './config';
import { apiRouter } from './routes';
import { auth } from './lib/auth';

let shuttingDown = false;

export function setShuttingDown(value: boolean) {
  // Called by server.ts during SIGINT/SIGTERM so the app can start refusing requests.
  shuttingDown = value;
}

export const createApp = () => {
  const app = express();

  app.use((_req, res, next) => {
    if (!shuttingDown) return next();
    res
      .status(503)
      .json({ error: { code: 'SHUTTING_DOWN', message: 'Server is shutting down' } });
  });

  app.disable('x-powered-by');
  app.use(morgan('combined'));
  app.use(
    helmet({
      crossOriginResourcePolicy: false,
    }),
  );

  app.use(
    cors({
      origin: (origin, cb) => {
        if (!origin) return cb(null, true);
        if (config.corsOrigin.includes(origin)) return cb(null, true);
        // better: pass an AppError here once you wire errorMiddleware
        return cb(new Error('Not allowed by CORS'));
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
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

  app.all('/api/auth/{*any}', toNodeHandler(auth));
  app.use(express.json({ limit: '1mb' }));
  app.use('/api', apiRouter);

  return app;
};
