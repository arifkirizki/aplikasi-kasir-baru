const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function init() {
  const host = process.env.DB_HOST || 'localhost';
  const user = process.env.DB_USER || 'root';
  const password = process.env.DB_PASSWORD || '';
  const port = Number(process.env.DB_PORT || 3306);
  const dbName = process.env.DB_NAME || 'db_kasir';

  console.log(`Connecting to MySQL server at ${host}:${port} as ${user}...`);
  try {
    // 1. Connect without DB to create DB if needed
    const connection = await mysql.createConnection({ host, user, password, port });
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\`;`);
    console.log(`Database '${dbName}' ensured.`);
    await connection.end();

    // 2. Connect to the database
    const pool = mysql.createPool({ host, user, password, port, database: dbName });

    // Table users
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        username VARCHAR(50) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role ENUM('admin', 'petugas') NOT NULL DEFAULT 'petugas',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // Table products
    await pool.query(`
      CREATE TABLE IF NOT EXISTS products (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        category VARCHAR(50) NOT NULL,
        price INT NOT NULL,
        stock INT NOT NULL DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // Table members
    await pool.query(`
      CREATE TABLE IF NOT EXISTS members (
        id INT AUTO_INCREMENT PRIMARY KEY,
        member_code VARCHAR(50) UNIQUE NOT NULL,
        name VARCHAR(100) NOT NULL,
        phone VARCHAR(20) NOT NULL,
        address TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // Table transactions
    await pool.query(`
      CREATE TABLE IF NOT EXISTS transactions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        invoice_number VARCHAR(50) UNIQUE NOT NULL,
        user_id INT NULL,
        petugas_name VARCHAR(100) NOT NULL,
        member_id INT NULL,
        member_name VARCHAR(100) DEFAULT 'Umum / Non-Member',
        total_amount INT NOT NULL,
        pay_amount INT NOT NULL,
        change_amount INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // Table transaction_items
    await pool.query(`
      CREATE TABLE IF NOT EXISTS transaction_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        transaction_id INT NOT NULL,
        product_id INT NOT NULL,
        product_name VARCHAR(100) NOT NULL,
        price INT NOT NULL,
        quantity INT NOT NULL,
        subtotal INT NOT NULL,
        FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // Table stock_logs
    await pool.query(`
      CREATE TABLE IF NOT EXISTS stock_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        product_id INT NOT NULL,
        product_name VARCHAR(100) NOT NULL,
        change_type ENUM('in', 'out') NOT NULL,
        quantity INT NOT NULL,
        stock_before INT NOT NULL,
        stock_after INT NOT NULL,
        notes TEXT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    console.log("All tables created successfully.");

    // Seed default users if empty
    const [existingUsers] = await pool.query(`SELECT COUNT(*) as count FROM users`);
    if (existingUsers[0].count === 0) {
      const adminPass = await bcrypt.hash('admin123', 10);
      const petugasPass = await bcrypt.hash('petugas123', 10);
      await pool.query(`
        INSERT INTO users (name, username, password, role) VALUES
        ('Administrator', 'admin', ?, 'admin'),
        ('Petugas Kasir', 'petugas', ?, 'petugas');
      `, [adminPass, petugasPass]);
      console.log("Default users seeded: admin/admin123, petugas/petugas123.");
    }

    // Seed default products if empty
    const [existingProducts] = await pool.query(`SELECT COUNT(*) as count FROM products`);
    if (existingProducts[0].count === 0) {
      await pool.query(`
        INSERT INTO products (name, category, price, stock) VALUES
        ('Kopi Latte', 'Minuman', 18000, 18),
        ('Es Teh', 'Minuman', 8000, 29),
        ('Burger Sapi', 'Makanan', 25000, 15),
        ('Kentang Goreng', 'Makanan', 15000, 20),
        ('Cheese Cake', 'Dessert', 22000, 10),
        ('Air Mineral', 'Minuman', 5000, 40);
      `);
      console.log("Default sample products seeded.");
    }

    // Seed default members if empty
    const [existingMembers] = await pool.query(`SELECT COUNT(*) as count FROM members`);
    if (existingMembers[0].count === 0) {
      await pool.query(`
        INSERT INTO members (member_code, name, phone, address) VALUES
        ('MB-001', 'Budi Santoso', '081234567890', 'Jl. Merdeka No. 12, Jakarta'),
        ('MB-002', 'Siti Rahma', '085678901234', 'Jl. Mawar No. 45, Bandung'),
        ('MB-003', 'Ahmad Fauzi', '087811223344', 'Jl. Diponegoro No. 8, Surabaya');
      `);
      console.log("Default sample members seeded.");
    }

    console.log("Database initialization completed!");
    process.exit(0);
  } catch (err) {
    console.error("Database initialization failed:", err);
    process.exit(1);
  }
}

init();
