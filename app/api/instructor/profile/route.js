import { NextResponse } from "next/server";
import { createAdminSupabase } from "../../../../lib/admin-supabase";
import { bookingDays, bookingPools, validateInstructorSchedule } from "../../../../lib/booking-options";
import { instructorPrivateSafeFields } from "../../../../lib/instructor-fields";
import { getInstructorSessionId } from "../../../../lib/instructor-session";

export const runtime = "nodejs";
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

function scheduleLegacyFields(schedule) {
  const update = {};
  for (const poolId of ["passnine", "miryang"]) {
    const days = schedule[poolId] || {};
    update[`can_${poolId}`] = Object.values(days).some(slots => slots.length > 0);
    for (const day of bookingDays) update[`${poolId}_day_${day.id}`] = Boolean(days[day.id]?.length);
    for (const slot of bookingPools[poolId].slots) {
      update[`${poolId}_${slot.id}`] = Object.values(days).some(slots => slots.includes(slot.id));
    }
  }
  for (const day of bookingDays.filter(item => item.id !== "holiday")) {
    update[`available_${day.id}`] = Boolean(schedule.passnine?.[day.id]?.length || schedule.miryang?.[day.id]?.length);
  }
  return update;
}

export async function PATCH(request) {
  const instructorId = await getInstructorSessionId();
  if (!instructorId) return NextResponse.json({ error: "강사 로그인이 필요합니다." }, { status: 401 });
  const body = await request.json().catch(() => ({}));
  if (!["public", "courses", "schedule"].includes(body.section)) return NextResponse.json({ error: "저장할 설정 영역을 확인해 주세요." }, { status: 400 });

  try {
    const supabase = createAdminSupabase();
    const { data: account, error: accountError } = await supabase.from("instructors")
      .select("id,is_approved,profile_image,schedule_revision").eq("id", instructorId).maybeSingle();
    if (accountError) throw accountError;
    if (!account?.is_approved) return NextResponse.json({ error: "승인된 강사만 프로필을 저장할 수 있습니다." }, { status: 403 });

    let update = {};
    if (body.section === "public") {
      const profileImage = typeof body.profile_image === "string" ? body.profile_image : "";
      const keepsExistingImage = profileImage.length > 0 && profileImage === account.profile_image;
      const uploadsValidImage = /^data:image\/(jpeg|png|webp);base64,/i.test(profileImage) && profileImage.length <= 3_000_000;
      if (!keepsExistingImage && !uploadsValidImage) return NextResponse.json({ error: "프로필 사진을 다시 선택해 주세요." }, { status: 400 });
      update = { profile_image: profileImage, bio: typeof body.bio === "string" ? body.bio.trim().slice(0, 1000) : "" };
    } else if (body.section === "courses") {
      update = { course_levels: cleanCourseLevels(body.course_levels) };
      for (const key of ["max_freediving_level", "max_mermaid_level", "max_youth_level"]) {
        update[key] = Number.isInteger(body[key]) ? Math.max(0, Math.min(20, body[key])) : 0;
      }
      for (const key of ["can_safety_guard", "can_scuba", "can_special"]) update[key] = body[key] === true;
    } else {
      const checked = validateInstructorSchedule(body.schedule_by_day);
      if (!checked.valid) return NextResponse.json({ error: checked.error }, { status: 400 });
      if (!Number.isInteger(body.schedule_revision) || body.schedule_revision !== account.schedule_revision) {
        return NextResponse.json({ error: "다른 창에서 일정이 변경되었습니다. 새로고침 후 다시 확인해 주세요." }, { status: 409 });
      }
      update = { schedule_by_day: checked.schedule, schedule_revision: account.schedule_revision + 1, ...scheduleLegacyFields(checked.schedule) };
    }
    let query = supabase.from("instructors").update(update).eq("id", instructorId);
    if (body.section === "schedule") query = query.eq("schedule_revision", account.schedule_revision);
    const { data, error } = await query.select(instructorPrivateSafeFields).maybeSingle();
    if (error) throw error;
    if (!data) return NextResponse.json({ error: "다른 창에서 일정이 변경되었습니다. 새로고침 후 다시 확인해 주세요." }, { status: 409 });
    return NextResponse.json({ instructor: data });
  } catch {
    return NextResponse.json({ error: "프로필을 저장하지 못했습니다." }, { status: 503 });
  }
}
