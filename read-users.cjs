require('dotenv').config();
const pool = require('./db.cjs');

(async () => {
  try {
    const result = await pool.query('SELECT * FROM users');
    console.log(result.rows);
  } catch (err) {
    console.error('Query error', err);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
})();
