import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET() {
  try {
    const [rows] = await db.query("SELECT 1 AS berhasil");

    return NextResponse.json({
      success: true,
      message: "Koneksi database berhasil!",
      data: rows,
    });
  } catch (error) {
    console.error("Database error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Koneksi database gagal!",
      },
      { status: 500 }
    );
  }
}