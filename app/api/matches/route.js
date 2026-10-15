import { NextResponse } from "next/server";
import { createAdminSupabase } from "../../../lib/admin-supabase";

export const runtime = "nodejs";

function cleanText(value, maxLength) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function cleanTextList(value, maxItems = 10, maxLength = 100) {
  return Array.isArray(value)
    ? value.slice(0, maxItems).map(item => cleanText(item, maxLength)).filter(Boolean)
    : [];
}

function cleanSchedule(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return Object.fromEntries(Object.entries(value).slice(0, 5).map(([pool, times]) => [
    cleanText(pool, 100),
    cleanTextList(times, 10, 100),
  ]).filter(([pool]) => pool));
}

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
    const attribution = body.attribution && typeof body.attribution === "object" ? body.attribution : {};
    const { data, error } = await supabase.from("customers").insert({
      name: name.trim(), phone: phone.trim(), course: course.trim(), pool: pool.trim(),
      time_slot: time_slot.trim(), matched_instructor_id: instructor.id,
      matched_instructor: instructor.name,
      preferred_days: cleanTextList(body.preferred_days, 7, 10),
      preferred_schedule: cleanSchedule(body.preferred_schedule),
      landing_url: cleanText(attribution.landing_url, 500) || null,
      referrer_url: cleanText(attribution.referrer_url, 500) || null,
      traffic_source: cleanText(attribution.traffic_source, 100) || "직접 방문",
      traffic_medium: cleanText(attribution.traffic_medium, 100) || "direct",
      traffic_campaign: cleanText(attribution.traffic_campaign, 200) || null,
      traffic_term: cleanText(attribution.traffic_term, 200) || null,
      traffic_content: cleanText(attribution.traffic_content, 200) || null,
      device_type: cleanText(attribution.device_type, 30) || null,
    }).select("id").single();
    if (error) throw error;
    return NextResponse.json({ id: data.id }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "신청 내용을 저장하지 못했습니다. 잠시 후 다시 시도해 주세요." }, { status: 503 });
  }
}
