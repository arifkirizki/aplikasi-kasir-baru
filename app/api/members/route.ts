import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";

    let sql = "SELECT id, nama, telepon, alamat, created_at FROM members WHERE 1=1";
    const params: any[] = [];

    if (search) {
      sql += " AND (nama LIKE ? OR telepon LIKE ? OR alamat LIKE ?)";
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    sql += " ORDER BY id DESC";

    const members = await query<any[]>(sql, params);
    return NextResponse.json({ success: true, data: members });
  } catch (error: any) {
    console.error("Members GET API error:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data member: " + error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { nama, telepon, alamat } = await request.json();

    if (!nama || !telepon) {
      return NextResponse.json(
        { error: "Nama member dan nomor telepon wajib diisi." },
        { status: 400 }
      );
    }

    const result = await query<any>(
      "INSERT INTO members (nama, telepon, alamat) VALUES (?, ?, ?)",
      [nama.trim(), telepon.trim(), (alamat || "").trim()]
    );

    return NextResponse.json({
      success: true,
      message: "Member berhasil ditambahkan",
      memberId: result.insertId,
    });
  } catch (error: any) {
    console.error("Members POST API error:", error);
    return NextResponse.json(
      { error: "Gagal menambah member: " + error.message },
      { status: 500 }
    );
  }
}
