import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import bcrypt from "bcryptjs";
import { getSession } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    // SECURITY CHECK: Only Admin session can register new Petugas accounts
    const session = await getSession();
    if (!session || session.role !== "admin") {
      return NextResponse.json(
        { error: "Akses ditolak: Hanya Admin yang dapat meregistrasi akun Petugas." },
        { status: 403 }
      );
    }

    const { nama, username, password, confirmPassword } = await request.json();

    if (!nama || !username || !password) {
      return NextResponse.json(
        { error: "Nama Petugas, username, dan password wajib diisi." },
        { status: 400 }
      );
    }

    if (confirmPassword !== undefined && password !== confirmPassword) {
      return NextResponse.json(
        { error: "Password dan Konfirmasi Password tidak cocok." },
        { status: 400 }
      );
    }

    if (password.length < 4) {
      return NextResponse.json(
        { error: "Password minimal 4 karakter." },
        { status: 400 }
      );
    }

    const existing = await query<any[]>(
      "SELECT id FROM users WHERE username = ?",
      [username.trim()]
    );

    if (existing && existing.length > 0) {
      return NextResponse.json(
        { error: "Username sudah digunakan, silakan pilih username lain." },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const assignedRole = "petugas"; // Role is automatically petugas

    const result = await query<any>(
      "INSERT INTO users (nama, username, password, role) VALUES (?, ?, ?, ?)",
      [nama.trim(), username.trim(), hashedPassword, assignedRole]
    );

    return NextResponse.json({
      success: true,
      message: `Akun Petugas "${nama.trim()}" (username: ${username.trim()}) berhasil dibuat.`,
      userId: result.insertId,
    });
  } catch (error: any) {
    console.error("Register API error:", error);
    return NextResponse.json(
      { error: "Gagal meregistrasi akun Petugas: " + error.message },
      { status: 500 }
    );
  }
}
