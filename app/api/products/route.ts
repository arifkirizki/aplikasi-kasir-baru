import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "";

    let sql = "SELECT id, nama_barang, harga, stok, kategori, created_at, updated_at FROM products WHERE 1=1";
    const params: any[] = [];

    if (search) {
      sql += " AND (nama_barang LIKE ? OR kategori LIKE ?)";
      params.push(`%${search}%`, `%${search}%`);
    }

    if (category && category !== "Semua") {
      sql += " AND kategori = ?";
      params.push(category);
    }

    sql += " ORDER BY id DESC";

    const rows = await query<any[]>(sql, params);

    const products = rows.map((p) => {
      const stok = Number(p.stok);
      let status = "Tersedia";
      if (stok <= 0) status = "Habis";
      else if (stok <= 15) status = "Stok Menipis";

      return {
        id: p.id,
        nama_barang: p.nama_barang,
        harga: Number(p.harga),
        stok: stok,
        kategori: p.kategori,
        status: status,
        created_at: p.created_at,
        updated_at: p.updated_at,
      };
    });

    return NextResponse.json({ success: true, data: products });
  } catch (error: any) {
    console.error("Products GET API error:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data barang: " + error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { nama_barang, harga, stok, kategori } = await request.json();

    if (!nama_barang || harga === undefined || stok === undefined || !kategori) {
      return NextResponse.json(
        { error: "Nama barang, harga, stok, dan kategori wajib diisi." },
        { status: 400 }
      );
    }

    const priceNum = Number(harga);
    const stockNum = Number(stok);

    if (isNaN(priceNum) || priceNum < 0) {
      return NextResponse.json(
        { error: "Harga harus berupa angka valid (>= 0)." },
        { status: 400 }
      );
    }

    if (isNaN(stockNum) || stockNum < 0) {
      return NextResponse.json(
        { error: "Stok harus berupa angka valid (>= 0)." },
        { status: 400 }
      );
    }

    const result = await query<any>(
      "INSERT INTO products (nama_barang, harga, stok, kategori) VALUES (?, ?, ?, ?)",
      [nama_barang.trim(), priceNum, stockNum, kategori.trim()]
    );

    return NextResponse.json({
      success: true,
      message: "Barang berhasil ditambahkan",
      productId: result.insertId,
    });
  } catch (error: any) {
    console.error("Products POST API error:", error);
    return NextResponse.json(
      { error: "Gagal menambah barang: " + error.message },
      { status: 500 }
    );
  }
}
