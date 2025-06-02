const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: env.DB_HOST,
  user: env.DB_USER,
  password: env.DB_PASSWORD,
  database: env.DB_NAME,
  jwtToken : env.JWT_SECRET,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
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
