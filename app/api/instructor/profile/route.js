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
  "passnine_day_mon", "passnine_day_tue", "passnine_day_wed", "passnine_day_thu", "passnine_day_fri",
  "passnine_day_sat", "passnine_day_sun", "passnine_day_holiday", "miryang_day_mon", "miryang_day_tue",
  "miryang_day_wed", "miryang_day_thu", "miryang_day_fri", "miryang_day_sat", "miryang_day_sun", "miryang_day_holiday",
];
const integerFields = ["max_freediving_level", "max_mermaid_level", "max_youth_level"];
const allowedCourseNames = new Set(["프리다이빙", "머메이드 다이빙", "유스 프리다이빙", "수중레저안전요원", "스쿠버다이빙", "스페셜 교육"]);

function cleanCourseLevels(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return Object.fromEntries(Object.entries(value).filter(([course]) => allowedCourseNames.has(course)).map(([course, level]) => {
    if (course === "스페셜 교육") {
      const levels = Array.isArray(level) ? level : typeof level === "string" ? [level] : [];
      return [course, levels.filter(item => typeof item === "string" && item !== "교육 불가").slice(0, 10).map(item => item.trim().slice(0, 100))];
    }
    return [course, typeof level === "string" ? level.trim().slice(0, 100) : "교육 불가"];
  }));
}

export async function PATCH(request) {
  const instructorId = await getInstructorSessionId();
  if (!instructorId) return NextResponse.json({ error: "강사 로그인이 필요합니다." }, { status: 401 });
  const body = await request.json().catch(() => ({}));
  const poolConfig = {
    passnine: { enabled: "can_passnine", days: booleanFields.filter(field => field.startsWith("passnine_day_")), times: ["passnine_t1", "passnine_t2", "passnine_t3", "passnine_t4"] },
    miryang: { enabled: "can_miryang", days: booleanFields.filter(field => field.startsWith("miryang_day_")), times: ["miryang_t0", "miryang_t1", "miryang_t2", "miryang_t3", "miryang_t4", "miryang_t5", "miryang_t6"] },
  };
  const activePools = Object.values(poolConfig).filter(config => body[config.enabled] === true);
  if (!activePools.length || activePools.some(config => !config.days.some(field => body[field] === true) || !config.times.some(field => body[field] === true))) {
    return NextResponse.json({ error: "수업 가능한 풀장마다 요일과 시간대를 하나 이상 선택해 주세요." }, { status: 400 });
  }
  const profileImage = typeof body.profile_image === "string" ? body.profile_image : "";
  const update = {
    profile_image: profileImage,
    bio: typeof body.bio === "string" ? body.bio.trim().slice(0, 1000) : "",
    course_levels: cleanCourseLevels(body.course_levels),
  };
  for (const field of booleanFields) update[field] = body[field] === true;
  for (const field of integerFields) update[field] = Number.isInteger(body[field]) ? Math.max(0, Math.min(20, body[field])) : 0;

  try {
    const supabase = createAdminSupabase();
    const { data: account, error: accountError } = await supabase.from("instructors")
      .select("id,is_approved,profile_image").eq("id", instructorId).maybeSingle();
    if (accountError) throw accountError;
    if (!account?.is_approved) return NextResponse.json({ error: "승인된 강사만 프로필을 저장할 수 있습니다." }, { status: 403 });
    const keepsExistingImage = profileImage.length > 0 && profileImage === account.profile_image;
    const uploadsValidImage = /^data:image\/(jpeg|png|webp);base64,/i.test(profileImage) && profileImage.length <= 3_000_000;
    if (!keepsExistingImage && !uploadsValidImage) {
      return NextResponse.json({ error: "프로필 사진을 다시 선택해 주세요." }, { status: 400 });
    }
    const { data, error } = await supabase.from("instructors").update(update).eq("id", instructorId)
      .select(instructorPrivateSafeFields).single();
    if (error) throw error;
    return NextResponse.json({ instructor: data });
  } catch {
    return NextResponse.json({ error: "프로필을 저장하지 못했습니다." }, { status: 503 });
  }
}
