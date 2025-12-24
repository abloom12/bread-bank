import { Router } from 'express';
import pool from '../../db/db';

export const healthRouter = Router();

healthRouter.get('/', (_req, res) => {
  res.json({ ok: true });
});

healthRouter.get('/ready', async (_req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ ok: true, db: 'connected' });
  } catch {
    res.status(503).json({ ok: false, db: 'disconnected' });
  }
});
