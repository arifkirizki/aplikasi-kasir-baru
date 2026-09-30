import mysql from "mysql2/promise";

const db = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "db_kasir",
  port: Number(process.env.DB_PORT || 3306),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

let tablesEnsured = false;

export async function ensureTables() {
  if (tablesEnsured) return;
  try {
    await db.execute(`
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
    tablesEnsured = true;
  } catch (err) {
    console.error("Failed to ensure stock_logs table:", err);
  }
}

export async function query<T = any>(sql: string, params: any[] = []): Promise<T> {
  await ensureTables();
  const [rows] = await db.execute(sql, params);
  return rows as T;
}

export default db;