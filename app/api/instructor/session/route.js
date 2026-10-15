import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { createAdminSupabase } from "../../../../lib/admin-supabase";
import { createInstructorSession, instructorCookieName, instructorCookieOptions } from "../../../../lib/instructor-session";

export const runtime = "nodejs";

export async function POST(request) {
  const { username, password } = await request.json().catch(() => ({}));
  if (typeof username !== "string" || typeof password !== "string") {
    return NextResponse.json({ error: "아이디 또는 비밀번호가 일치하지 않습니다." }, { status: 401 });
  }
  try {
    const { data, error } = await createAdminSupabase()
      .from("instructors")
      .select("*")
      .eq("username", username.trim())
      .maybeSingle();
    if (error) throw error;
    const actual = Buffer.from(password.trim());
    const expected = Buffer.from(data?.password || "");
    if (!data || actual.length !== expected.length || !timingSafeEqual(actual, expected)) {
      return NextResponse.json({ error: "아이디 또는 비밀번호가 일치하지 않습니다." }, { status: 401 });
    }
    if (!data.is_approved) {
      return NextResponse.json({ error: "관리자 승인 후 로그인할 수 있습니다." }, { status: 403 });
    }
    const { password: _password, ...instructor } = data;
    const response = NextResponse.json({ instructor });
    response.cookies.set(instructorCookieName, createInstructorSession(data.id), instructorCookieOptions);
    return response;
  } catch {
    return NextResponse.json({ error: "로그인 처리 중 오류가 발생했습니다." }, { status: 503 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ authenticated: false });
  response.cookies.set(instructorCookieName, "", { ...instructorCookieOptions, maxAge: 0 });
  return response;
}
