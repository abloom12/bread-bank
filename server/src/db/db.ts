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
