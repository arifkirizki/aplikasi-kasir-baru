const mysql = require('mysql2/promise');

async function inspectData() {
  const host = process.env.DB_HOST || 'localhost';
  const user = process.env.DB_USER || 'root';
  const password = process.env.DB_PASSWORD || '';
  const port = Number(process.env.DB_PORT || 3306);
  const dbName = process.env.DB_NAME || 'db_kasir';

  try {
    const pool = mysql.createPool({ host, user, password, port, database: dbName });
    const [users] = await pool.query(`SELECT id, nama, username, role FROM users`);
    console.log("Users:", users);

    const [products] = await pool.query(`SELECT * FROM products`);
    console.log("Products:", products);

    const [members] = await pool.query(`SELECT * FROM members`);
    console.log("Members:", members);

    process.exit(0);
  } catch (err) {
    console.error("Inspect data error:", err);
    process.exit(1);
  }
}

inspectData();
