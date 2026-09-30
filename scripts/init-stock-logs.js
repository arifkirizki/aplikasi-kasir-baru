const mysql = require('mysql2/promise');

async function createTable() {
  const host = process.env.DB_HOST || 'localhost';
  const user = process.env.DB_USER || 'root';
  const password = process.env.DB_PASSWORD || '';
  const port = Number(process.env.DB_PORT || 3306);
  const dbName = process.env.DB_NAME || 'db_kasir';

  try {
    const connection = await mysql.createConnection({ host, user, password, port, database: dbName });
    await connection.query(`
      CREATE TABLE IF NOT EXISTS stock_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        product_id INT NOT NULL,
        nama_barang VARCHAR(150) NOT NULL,
        tipe ENUM('masuk', 'keluar') NOT NULL,
        jumlah INT NOT NULL,
        stok_sebelum INT NOT NULL,
        stok_sesudah INT NOT NULL,
        catatan TEXT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
    console.log("Table 'stock_logs' created or verified successfully.");
    await connection.end();
    process.exit(0);
  } catch (err) {
    console.error("Error creating stock_logs table:", err);
    process.exit(1);
  }
}

createTable();
