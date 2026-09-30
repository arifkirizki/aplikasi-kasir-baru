import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { nama_barang, harga, stok, kategori } = await request.json();

    if (!id) {
      return NextResponse.json({ error: "ID barang tidak valid." }, { status: 400 });
    }

    const priceNum = Number(harga);
    const stockNum = Number(stok);

    if (!nama_barang || isNaN(priceNum) || isNaN(stockNum) || !kategori) {
      return NextResponse.json(
        { error: "Semua bidang wajib diisi dengan format valid." },
        { status: 400 }
      );
    }

    await query(
      "UPDATE products SET nama_barang = ?, harga = ?, stok = ?, kategori = ? WHERE id = ?",
      [nama_barang.trim(), priceNum, stockNum, kategori.trim(), id]
    );

    return NextResponse.json({
      success: true,
      message: "Data barang berhasil diperbarui",
    });
  } catch (error: any) {
    console.error("Products PUT error:", error);
    return NextResponse.json(
      { error: "Gagal memperbarui barang: " + error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: "ID barang tidak valid." }, { status: 400 });
    }

    await query("DELETE FROM products WHERE id = ?", [id]);

    return NextResponse.json({
      success: true,
      message: "Barang berhasil dihapus",
    });
  } catch (error: any) {
    console.error("Products DELETE error:", error);
    return NextResponse.json(
      { error: "Gagal menghapus barang: " + error.message },
      { status: 500 }
    );
  }
}
