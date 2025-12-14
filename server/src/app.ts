import express, { type Request, type Response, type NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';

import { config } from './config';
import { apiRouter } from './routes';

import { AppError } from './errors/AppError';

export const createApp = () => {
  const app = express();

  // app level config
  app.disable('x-powered-by');

  // logging
  app.use(morgan('combined'));

  // body parsing
  app.use(express.json({ limit: '1mb' }));

  // secuirity headers
  app.use(
    helmet({
      crossOriginResourcePolicy: false,
    }),
  );

  // rate limiting
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 100,
      standardHeaders: true,
      legacyHeaders: false,
    }),
  );

  // CORS
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

  // routes
  app.use('/api', apiRouter);

  app.use((_req, res) => {
    res.status(404).json({
      data: null,
      error: {
        message: 'Not Found',
      },
    });
  });

  // error handler
  app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    if (err instanceof AppError) {
      return res.status(err.statusCode).json({
        data: null,
        error: {
          message: err.message,
        },
      });
    }

    if (err.message?.startsWith('CORS policy')) {
      return res.status(403).json({
        data: null,
        error: {
          message: err.message,
        },
      });
    }

    console.error(err);

    return res.status(500).json({
      data: null,
      error: {
        message: 'Internal Server Error',
      },
    });
  });

  return app;
};
