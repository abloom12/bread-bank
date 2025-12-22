import { Pool } from 'pg';
import { config } from '../config';

const pool = new Pool({
  user: config.database.user,
  password: config.database.password,
  host: config.database.host,
  database: config.database.name,
  port: config.database.port,
});

export default pool;

// function numberFromEnv(name: string, fallback: number) {
//   const raw = process.env[name];
//   if (!raw) return fallback;

//   const n = Number(raw);
//   return Number.isFinite(n) ? n : fallback;
// }

// const pool = new Pool({
//   user: config.database.user,
//   password: config.database.password,
//   host: config.database.host,
//   database: config.database.name,
//   port: config.database.port,

//   // Pool tuning (all optional env vars)
//   // Defaults are intentionally conservative.
//   max: Math.max(1, numberFromEnv('DB_POOL_MAX', 10)),
//   idleTimeoutMillis: Math.max(0, numberFromEnv('DB_POOL_IDLE_TIMEOUT_MS', 30_000)),
//   connectionTimeoutMillis: Math.max(
//     0,
//     numberFromEnv('DB_POOL_CONNECTION_TIMEOUT_MS', 2_000),
//   ),
// });

// // Important: catches errors from idle clients in the pool.
// // Without this, you can miss pool-level errors.
// pool.on('error', err => {
//   console.error('Postgres pool error (idle client):', err);
// });
