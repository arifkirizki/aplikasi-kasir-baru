const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function checkPass() {
  const host = process.env.DB_HOST || 'localhost';
  const user = process.env.DB_USER || 'root';
  const password = process.env.DB_PASSWORD || '';
  const port = Number(process.env.DB_PORT || 3306);
  const dbName = process.env.DB_NAME || 'db_kasir';

  try {
    const pool = mysql.createPool({ host, user, password, port, database: dbName });
    const [users] = await pool.query(`SELECT id, username, password FROM users`);
    for (const u of users) {
      const matchAdmin = await bcrypt.compare('admin123', u.password);
      const matchPetugas = await bcrypt.compare('petugas123', u.password);
      console.log(`User ${u.username}: match 'admin123'=${matchAdmin}, match 'petugas123'=${matchPetugas}, hash=${u.password.substring(0, 15)}...`);
      
      // If pass does not match admin123 or petugas123, update password so admin/admin123 and petugas/petugas123 work out of the box!
      if (!matchAdmin && !matchPetugas) {
        const passToSet = u.username === 'admin' ? 'admin123' : 'petugas123';
        const hash = await bcrypt.hash(passToSet, 10);
        await pool.query(`UPDATE users SET password = ? WHERE id = ?`, [hash, u.id]);
        console.log(`Updated password for ${u.username} to ${passToSet}`);
      }
    }

    // Also check stock_logs table
    await pool.query(`
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

    // Seed some initial members if empty
    const [memCount] = await pool.query(`SELECT COUNT(*) as c FROM members`);
    if (memCount[0].c === 0) {
      await pool.query(`
        INSERT INTO members (nama, telepon, alamat) VALUES
        ('Budi Santoso', '081234567890', 'Jl. Merdeka No. 12, Jakarta'),
        ('Siti Rahma', '085678901234', 'Jl. Mawar No. 45, Bandung'),
        ('Ahmad Fauzi', '087811223344', 'Jl. Diponegoro No. 8, Surabaya');
      `);
      console.log("Seeded sample members.");
    }

    process.exit(0);
  } catch (err) {
    console.error("Check pass error:", err);
    process.exit(1);
  }
}

checkPass();
