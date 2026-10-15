import { timingSafeEqual } from "node:crypto";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { adminCookieName, adminCookieOptions, createAdminSession, hasAdminSession } from "../../../../lib/admin-session";
import { checkLoginAllowed, clearLoginFailures, recordLoginFailure } from "../../../../lib/login-rate-limit";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({ authenticated: await hasAdminSession() });
}

export async function POST(request) {
  const expected = process.env.ADMIN_PASSWORD;
  const expectedHash = process.env.ADMIN_PASSWORD_HASH;
  if ((!expected && !expectedHash) || !process.env.ADMIN_SESSION_SECRET) {
    return NextResponse.json({ error: "관리자 서버 설정이 완료되지 않았습니다." }, { status: 503 });
  }
  const { username, password } = await request.json().catch(() => ({}));
  const actual = typeof password === "string" ? password : "";
  try {
    const loginLimit = await checkLoginAllowed(request, "admin", String(username || ""));
    if (!loginLimit.allowed) {
      return NextResponse.json(
        { error: "로그인 시도가 너무 많습니다. 15분 후 다시 시도해 주세요." },
        { status: 429, headers: { "Retry-After": String(loginLimit.retryAfterSeconds) } },
      );
    }
    let validPassword = false;
    if (expectedHash) {
      validPassword = await bcrypt.compare(actual, expectedHash);
    } else if (expected) {
      const a = Buffer.from(actual);
      const b = Buffer.from(expected);
      validPassword = a.length === b.length && timingSafeEqual(a, b);
    }
    if (username !== "admin" || !validPassword) {
      await recordLoginFailure(loginLimit.key, loginLimit.state);
      return NextResponse.json({ error: "아이디 또는 비밀번호가 일치하지 않습니다." }, { status: 401 });
    }
    await clearLoginFailures(loginLimit.key);
    const response = NextResponse.json({ authenticated: true });
    response.cookies.set(adminCookieName, createAdminSession(), adminCookieOptions);
    return response;
  } catch {
    return NextResponse.json({ error: "로그인 처리 중 오류가 발생했습니다." }, { status: 503 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ authenticated: false });
  response.cookies.set(adminCookieName, "", { ...adminCookieOptions, maxAge: 0 });
  return response;
}

