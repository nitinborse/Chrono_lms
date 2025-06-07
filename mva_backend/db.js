const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: process.env.PGPORT,
  ssl: { rejectUnauthorized: false }
});

// Optional: Check the connection once when the app starts
async function testConnection() {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    console.log('✅ Connected to PostgreSQL at', result.rows[0].now);
    client.release();
  } catch (err) {
    console.error('❌ PostgreSQL connection error:', err);
  }
}

testConnection();

module.exports = {
  query: (text, params) => pool.query(text, params),
};
