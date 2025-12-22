import 'dotenv/config';
import { config } from './config';
import pool from './db/db';
import { createApp } from './app';

const app = createApp();

const server = app.listen(config.port, () => {
  console.log(`API running on http://localhost:${config.port}`);
});

function closeServer() {
  return new Promise<void>((resolve, reject) => {
    server.close(err => {
      if (err) return reject(err);
      resolve();
    });
  });
}

let shuttingDown = false;
async function shutdown(signal: string) {
  if (shuttingDown) return;
  shuttingDown = true;

  console.log(`${signal} received, shutting down...`);

  try {
    await closeServer();
    await pool.end();
    process.exit(0);
  } catch (err) {
    console.error('Shutdown error:', err);
    process.exit(1);
  }
}

process.on('SIGINT', () => void shutdown('SIGINT'));
process.on('SIGTERM', () => void shutdown('SIGTERM'));
