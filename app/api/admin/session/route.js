import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { adminCookieName, adminCookieOptions, createAdminSession, hasAdminSession } from "../../../../lib/admin-session";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({ authenticated: await hasAdminSession() });
}

export async function POST(request) {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected || !process.env.ADMIN_SESSION_SECRET) {
    return NextResponse.json({ error: "관리자 서버 설정이 완료되지 않았습니다." }, { status: 503 });
  }
  const { username, password } = await request.json().catch(() => ({}));
  const actual = typeof password === "string" ? password : "";
  const a = Buffer.from(actual);
  const b = Buffer.from(expected);
  if (username !== "admin" || a.length !== b.length || !timingSafeEqual(a, b)) {
    return NextResponse.json({ error: "아이디 또는 비밀번호가 일치하지 않습니다." }, { status: 401 });
  }
  const response = NextResponse.json({ authenticated: true });
  response.cookies.set(adminCookieName, createAdminSession(), adminCookieOptions);
  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ authenticated: false });
  response.cookies.set(adminCookieName, "", { ...adminCookieOptions, maxAge: 0 });
  return response;
}

