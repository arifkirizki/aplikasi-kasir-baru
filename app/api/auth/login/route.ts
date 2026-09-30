import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import bcrypt from "bcryptjs";
import { encodeSession, UserSession } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const { username, password, nama_bertugas } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: "Username dan password wajib diisi." },
        { status: 400 }
      );
    }

    const users = await query<any[]>(
      "SELECT id, nama, username, password, role FROM users WHERE username = ?",
      [username]
    );

    if (!users || users.length === 0) {
      return NextResponse.json(
        { error: "Username atau password salah." },
        { status: 401 }
      );
    }

    const user = users[0];
    let isPasswordValid = false;

    try {
      isPasswordValid = await bcrypt.compare(password, user.password);
    } catch {
      isPasswordValid = false;
    }

    // Direct string match fallback if non-bcrypt legacy password
    if (!isPasswordValid && password === user.password) {
      isPasswordValid = true;
    }

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Username atau password salah." },
        { status: 401 }
      );
    }

    // Role Petugas requires "Nama Petugas yang Bertugas"
    if (user.role === "petugas") {
      if (!nama_bertugas || !nama_bertugas.trim()) {
        return NextResponse.json(
          { error: "Nama Petugas yang Bertugas wajib diisi sebelum login." },
          { status: 400 }
        );
      }
    }

    const sessionUser: UserSession = {
      id: user.id,
      nama: user.nama,
      username: user.username,
      role: user.role as "admin" | "petugas",
      nama_bertugas: user.role === "petugas" && nama_bertugas ? nama_bertugas.trim() : undefined,
    };

    const sessionEncoded = encodeSession(sessionUser);

    const response = NextResponse.json({
      success: true,
      message: "Login berhasil",
      user: sessionUser,
    });

    response.cookies.set("kasirku_session", sessionEncoded, {
      httpOnly: true,
      path: "/",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error: any) {
    console.error("Login API error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan pada server: " + error.message },
      { status: 500 }
    );
  }
}