import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("product_id");

    let sql = `
      SELECT
        sl.id,
        sl.product_id,
        sl.user_id,
        sl.nama_barang,
        sl.tipe,
        sl.jumlah,
        sl.stok_sebelum,
        sl.stok_sesudah,
        sl.catatan,
        sl.created_at,
        COALESCE(u.nama, "Administrator") AS nama_user,
        COALESCE(u.username, "admin") AS username_user
      FROM stock_logs sl
      LEFT JOIN users u ON sl.user_id = u.id
    `;

    const params: any[] = [];

    if (productId) {
      sql += " WHERE sl.product_id = ?";
      params.push(productId);
    }

    sql += " ORDER BY sl.id DESC LIMIT 100";

    const logs = await query<any[]>(sql, params);

    return NextResponse.json({
      success: true,
      data: logs,
    });
  } catch (error: any) {
    console.error("Stock logs API error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Gagal mengambil log stok: " + error.message,
      },
      { status: 500 }
    );
  }
}