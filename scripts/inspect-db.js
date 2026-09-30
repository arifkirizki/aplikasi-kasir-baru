const mysql = require('mysql2/promise');

async function inspect() {
  const host = process.env.DB_HOST || 'localhost';
  const user = process.env.DB_USER || 'root';
  const password = process.env.DB_PASSWORD || '';
  const port = Number(process.env.DB_PORT || 3306);
  const dbName = process.env.DB_NAME || 'db_kasir';

  try {
    const pool = mysql.createPool({ host, user, password, port, database: dbName });
    const [tables] = await pool.query(`SHOW TABLES`);
    console.log("Existing Tables:", tables.map(t => Object.values(t)[0]));

    for (const t of tables) {
      const tableName = Object.values(t)[0];
      const [cols] = await pool.query(`DESCRIBE \`${tableName}\``);
      console.log(`\nTable ${tableName}:`, cols.map(c => `${c.Field} (${c.Type})`));
      const [count] = await pool.query(`SELECT COUNT(*) as count FROM \`${tableName}\``);
      console.log(`Row count: ${count[0].count}`);
    }
    process.exit(0);
  } catch (err) {
    console.error("Inspection error:", err.message);
    process.exit(1);
  }
}

inspect();
