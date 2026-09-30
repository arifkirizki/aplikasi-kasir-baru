import { NextResponse } from "next/server";
import db from "@/lib/db";

// GET - mengambil semua barang
export async function GET() {
  try {
    const [rows] = await db.query(`
      SELECT
        id,
        nama_barang,
        harga,
        stok,
        kategori,
        created_at,
        updated_at
      FROM products
      ORDER BY id DESC
    `);

    return NextResponse.json({
      success: true,
      data: rows,
    });
  } catch (error) {
    console.error("GET products error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Gagal mengambil data barang.",
      },
      { status: 500 }
    );
  }
}

// POST - menambahkan barang
export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { nama_barang, harga, stok, kategori } = body;

    if (
      !nama_barang ||
      harga === undefined ||
      stok === undefined ||
      !kategori
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Semua data barang wajib diisi.",
        },
        { status: 400 }
      );
    }

    const hargaNumber = Number(harga);
    const stokNumber = Number(stok);

    if (
      Number.isNaN(hargaNumber) ||
      Number.isNaN(stokNumber) ||
      hargaNumber < 0 ||
      stokNumber < 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Harga dan stok harus berupa angka yang valid.",
        },
        { status: 400 }
      );
    }

    const [result] = await db.query(
      `
      INSERT INTO products
        (nama_barang, harga, stok, kategori)
      VALUES (?, ?, ?, ?)
      `,
      [nama_barang, hargaNumber, stokNumber, kategori]
    );

    return NextResponse.json(
      {
        success: true,
        message: "Barang berhasil ditambahkan.",
        data: result,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST products error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Gagal menambahkan barang.",
      },
      { status: 500 }
    );
  }
}

// PUT - mengubah barang
export async function PUT(request: Request) {
  try {
    const body = await request.json();

    const {
      id,
      nama_barang,
      harga,
      stok,
      kategori,
    } = body;

    if (
      !id ||
      !nama_barang ||
      harga === undefined ||
      stok === undefined ||
      !kategori
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Data barang belum lengkap.",
        },
        { status: 400 }
      );
    }

    const hargaNumber = Number(harga);
    const stokNumber = Number(stok);

    if (
      Number.isNaN(hargaNumber) ||
      Number.isNaN(stokNumber) ||
      hargaNumber < 0 ||
      stokNumber < 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Harga dan stok harus berupa angka yang valid.",
        },
        { status: 400 }
      );
    }

    const [result] = await db.query(
      `
      UPDATE products
      SET
        nama_barang = ?,
        harga = ?,
        stok = ?,
        kategori = ?
      WHERE id = ?
      `,
      [
        nama_barang,
        hargaNumber,
        stokNumber,
        kategori,
        id,
      ]
    );

    return NextResponse.json({
      success: true,
      message: "Barang berhasil diperbarui.",
      data: result,
    });
  } catch (error) {
    console.error("PUT products error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Gagal memperbarui barang.",
      },
      { status: 500 }
    );
  }
}

// DELETE - menghapus barang
export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: "ID barang wajib diberikan.",
        },
        { status: 400 }
      );
    }

    await db.query(
      "DELETE FROM products WHERE id = ?",
      [id]
    );

    return NextResponse.json({
      success: true,
      message: "Barang berhasil dihapus.",
    });
  } catch (error) {
    console.error("DELETE products error:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          "Barang tidak dapat dihapus. Kemungkinan masih digunakan dalam transaksi.",
      },
      { status: 500 }
    );
  }
}