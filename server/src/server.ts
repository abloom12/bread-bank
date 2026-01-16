import 'dotenv/config';

import { createServer } from 'http';
import { Server } from 'socket.io';

import { createApp, setShuttingDown } from './app';
import { config } from './config';
import pool from './db/db';

const app = createApp();
const server = createServer(app);
const io = new Server(server, {});

function shutdown(signal: string) {
  console.log(`${signal} received, starting graceful shutdown...`);

  setShuttingDown(true);

  server.close(async err => {
    if (err) {
      console.error('Error during server shutdown:', err);
      process.exitCode = 1;
    }

    try {
      await pool.end();
    } catch (e) {
      console.error('Error during server shutdown:', e);
      process.exitCode = 1;
    } finally {
      process.exit();
    }
  });

  setTimeout(() => {
    console.error('Force exiting after timeout');
    process.exit(1);
  }, 15_000).unref();
}

server.listen(config.port, () => {
  console.log(`API running on http://localhost:${config.port}`);
});

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
