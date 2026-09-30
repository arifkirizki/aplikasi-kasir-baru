import { cookies } from "next/headers";

export interface UserSession {
  id: number;
  nama: string;
  username: string;
  role: "admin" | "petugas";
  nama_bertugas?: string;
}

export async function getSession(): Promise<UserSession | null> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("kasirku_session");
    if (!sessionCookie || !sessionCookie.value) {
      return null;
    }
    const sessionData = JSON.parse(Buffer.from(sessionCookie.value, "base64").toString("utf-8"));
    return sessionData as UserSession;
  } catch (error) {
    return null;
  }
}

export function encodeSession(user: UserSession): string {
  return Buffer.from(JSON.stringify(user)).toString("base64");
}
