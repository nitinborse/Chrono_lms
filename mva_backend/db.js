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
    const connection = await pool.getConnection();
    console.log('✅ Connected to MySQL');
    connection.release();
  } catch (err) {
    console.error('❌ MySQL connection error:', err);
  }
}

testConnection();

module.exports = pool;
