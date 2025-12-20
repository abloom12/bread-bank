import 'dotenv/config';
import pool from './db';

async function testConnection() {
  try {
    const client = await pool.connect();
    console.log('✅ Successfully connected to PostgreSQL!');

    const result = await client.query('SELECT NOW()');
    console.log('Current time from database:', result.rows[0].now);

    client.release();
    await pool.end();

    console.log('✅ Connection test completed successfully!');
  } catch (error) {
    console.error('❌ Database connection error:', error);
    process.exit(1);
  }
}

testConnection();
