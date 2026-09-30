import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({ success: true, message: "Logout berhasil" });
  response.cookies.delete("kasirku_session");
  return response;
}
