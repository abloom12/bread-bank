// src/types/pino-http.d.ts
import 'express';
import type pino from 'pino';

declare module 'express-serve-static-core' {
  interface Request {
    log: pino.Logger;
  }
}
