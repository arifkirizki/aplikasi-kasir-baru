import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { nama, telepon, alamat } = await request.json();

    if (!id || !nama || !telepon) {
      return NextResponse.json(
        { error: "Nama dan telepon wajib diisi." },
        { status: 400 }
      );
    }

    await query(
      "UPDATE members SET nama = ?, telepon = ?, alamat = ? WHERE id = ?",
      [nama.trim(), telepon.trim(), (alamat || "").trim(), id]
    );

    return NextResponse.json({
      success: true,
      message: "Data member berhasil diperbarui",
    });
  } catch (error: any) {
    console.error("Members PUT error:", error);
    return NextResponse.json(
      { error: "Gagal memperbarui member: " + error.message },
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
      return NextResponse.json({ error: "ID member tidak valid." }, { status: 400 });
    }

    await query("DELETE FROM members WHERE id = ?", [id]);

    return NextResponse.json({
      success: true,
      message: "Member berhasil dihapus",
    });
  } catch (error: any) {
    console.error("Members DELETE error:", error);
    return NextResponse.json(
      { error: "Gagal menghapus member: " + error.message },
      { status: 500 }
    );
  }
}
