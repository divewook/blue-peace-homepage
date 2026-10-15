import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { createAdminSupabase } from "../../../../lib/admin-supabase";
import { createInstructorSession, instructorCookieName, instructorCookieOptions } from "../../../../lib/instructor-session";
import { instructorPrivateSafeFields } from "../../../../lib/instructor-fields";
import { checkLoginAllowed, clearLoginFailures, recordLoginFailure } from "../../../../lib/login-rate-limit";

export const runtime = "nodejs";

export async function POST(request) {
  const { username, password } = await request.json().catch(() => ({}));
  if (typeof username !== "string" || typeof password !== "string") {
    return NextResponse.json({ error: "아이디 또는 비밀번호가 일치하지 않습니다." }, { status: 401 });
  }
  try {
    const loginLimit = await checkLoginAllowed(request, "instructor", username);
    if (!loginLimit.allowed) {
      return NextResponse.json(
        { error: "로그인 시도가 너무 많습니다. 15분 후 다시 시도해 주세요." },
        { status: 429, headers: { "Retry-After": String(loginLimit.retryAfterSeconds) } },
      );
    }
    const { data, error } = await createAdminSupabase()
      .from("instructors")
      .select(`${instructorPrivateSafeFields},password_hash`)
      .eq("username", username.trim())
      .maybeSingle();
    if (error) throw error;
    const validPassword = !!data?.password_hash && await bcrypt.compare(password, data.password_hash);
    if (!data || !validPassword) {
      await recordLoginFailure(loginLimit.key, loginLimit.state);
      return NextResponse.json({ error: "아이디 또는 비밀번호가 일치하지 않습니다." }, { status: 401 });
    }
    if (!data.is_approved) {
      return NextResponse.json({ error: "관리자 승인 후 로그인할 수 있습니다." }, { status: 403 });
    }
    await clearLoginFailures(loginLimit.key);
    const { password_hash: _passwordHash, ...instructor } = data;
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
