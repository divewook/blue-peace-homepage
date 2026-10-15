import { NextResponse } from "next/server";
import { createAdminSupabase } from "../../../lib/admin-supabase";

export const runtime = "nodejs";

export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  const { name, phone, course, pool, time_slot, instructor_id } = body;
  if (![name, phone, course, pool, time_slot].every(value => typeof value === "string" && value.trim().length > 0)
    || !/^[0-9a-f-]{36}$/i.test(instructor_id || "")
    || name.length > 100 || phone.length > 30 || course.length > 200 || pool.length > 100 || time_slot.length > 200) {
    return NextResponse.json({ error: "신청 정보를 확인해 주세요." }, { status: 400 });
  }
  try {
    const supabase = createAdminSupabase();
    const { data: instructor, error: instructorError } = await supabase.from("instructors")
      .select("id,name,is_approved").eq("id", instructor_id).maybeSingle();
    if (instructorError) throw instructorError;
    if (!instructor?.is_approved) return NextResponse.json({ error: "선택한 강사를 찾을 수 없습니다. 다시 매칭해 주세요." }, { status: 409 });
    const { data, error } = await supabase.from("customers").insert({
      name: name.trim(), phone: phone.trim(), course: course.trim(), pool: pool.trim(),
      time_slot: time_slot.trim(), matched_instructor_id: instructor.id,
      matched_instructor: instructor.name,
    }).select("id").single();
    if (error) throw error;
    return NextResponse.json({ id: data.id }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "신청 내용을 저장하지 못했습니다. 잠시 후 다시 시도해 주세요." }, { status: 503 });
  }
}
