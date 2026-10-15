import { NextResponse } from "next/server";
import { createAdminSupabase } from "../../../../lib/admin-supabase";
import { instructorPrivateSafeFields } from "../../../../lib/instructor-fields";
import { getInstructorSessionId } from "../../../../lib/instructor-session";

export const runtime = "nodejs";

const booleanFields = [
  "can_safety_guard", "can_scuba", "can_special", "can_duryu", "can_passnine", "can_miryang",
  "available_mon", "available_tue", "available_wed", "available_thu", "available_fri", "available_sat",
  "available_sun", "passnine_t1", "passnine_t2", "passnine_t3", "passnine_t4", "miryang_t0",
  "miryang_t1", "miryang_t2", "miryang_t3", "miryang_t4", "miryang_t5", "miryang_t6",
];
const integerFields = ["max_freediving_level", "max_mermaid_level", "max_youth_level"];

export async function PATCH(request) {
  const instructorId = await getInstructorSessionId();
  if (!instructorId) return NextResponse.json({ error: "강사 로그인이 필요합니다." }, { status: 401 });
  const body = await request.json().catch(() => ({}));
  const profileImage = typeof body.profile_image === "string" ? body.profile_image : "";
  if (!/^data:image\/(jpeg|png|webp);base64,/i.test(profileImage) || profileImage.length > 3_000_000) {
    return NextResponse.json({ error: "프로필 사진을 다시 선택해 주세요." }, { status: 400 });
  }
  const update = {
    profile_image: profileImage,
    bio: typeof body.bio === "string" ? body.bio.trim().slice(0, 1000) : "",
    course_levels: body.course_levels && typeof body.course_levels === "object" && !Array.isArray(body.course_levels)
      ? body.course_levels : {},
  };
  for (const field of booleanFields) update[field] = body[field] === true;
  for (const field of integerFields) update[field] = Number.isInteger(body[field]) ? Math.max(0, Math.min(20, body[field])) : 0;

  try {
    const supabase = createAdminSupabase();
    const { data: account, error: accountError } = await supabase.from("instructors")
      .select("id,is_approved").eq("id", instructorId).maybeSingle();
    if (accountError) throw accountError;
    if (!account?.is_approved) return NextResponse.json({ error: "승인된 강사만 프로필을 저장할 수 있습니다." }, { status: 403 });
    const { data, error } = await supabase.from("instructors").update(update).eq("id", instructorId)
      .select(instructorPrivateSafeFields).single();
    if (error) throw error;
    return NextResponse.json({ instructor: data });
  } catch {
    return NextResponse.json({ error: "프로필을 저장하지 못했습니다." }, { status: 503 });
  }
}
