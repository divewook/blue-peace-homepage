import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { createAdminSupabase } from "../../../../lib/admin-supabase";
import { instructorMobile } from "../../../../lib/assignment-delivery";

export const runtime = "nodejs";

export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const username = typeof body.username === "string" ? body.username.trim() : "";
  const password = typeof body.password === "string" ? body.password : "";
  const phone = typeof body.phone === "string" ? body.phone.trim() : "";
  if (!name || name.length > 50 || !/^[A-Za-z0-9]{4,30}$/.test(username)
    || password.length < 8 || password.length > 64 || !instructorMobile(phone)) {
    return NextResponse.json({ error: "가입 정보를 다시 확인해 주세요." }, { status: 400 });
  }
  try {
    const passwordHash = await bcrypt.hash(password, 12);
    const { error } = await createAdminSupabase().from("instructors").insert({
      name,
      username,
      password_hash: passwordHash,
      phone,
      is_approved: false,
    });
    if (error?.code === "23505") return NextResponse.json({ error: "이미 사용 중인 아이디입니다." }, { status: 409 });
    if (error) throw error;
    return NextResponse.json({ created: true }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "회원가입 신청을 저장하지 못했습니다." }, { status: 503 });
  }
}
