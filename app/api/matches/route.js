import { after, NextResponse } from "next/server";
import { createAdminSupabase } from "../../../lib/admin-supabase";
import { canInstructorTeachCourse, hasCompleteInstructorProfile, instructorPublicFields } from "../../../lib/instructor-fields";
import { sendKakaoAlimtalk } from "../../../lib/kakao-alimtalk";

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

function cleanPoolOptions(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const allowedPools = new Set(["칠곡 패스나인", "밀양 아리랑"]);
  const allowedDays = new Set(["월", "화", "수", "목", "금", "토", "일", "공휴일"]);
  return Object.fromEntries(Object.entries(value).filter(([pool]) => allowedPools.has(pool)).map(([pool, option]) => {
    const safeOption = option && typeof option === "object" && !Array.isArray(option) ? option : {};
    return [pool, {
      days: cleanTextList(safeOption.days, 8, 10).filter(day => allowedDays.has(day)),
      times: cleanTextList(safeOption.times, 10, 100),
    }];
  }));
}

const dayFieldSuffix = { "월": "mon", "화": "tue", "수": "wed", "목": "thu", "금": "fri", "토": "sat", "일": "sun", "공휴일": "holiday" };
const poolMatchConfig = {
  "칠곡 패스나인": {
    enabledField: "can_passnine", dayPrefix: "passnine_day_",
    timeFields: { "1부 (09:00~11:30)": "passnine_t1", "2부 (12:30~15:00)": "passnine_t2", "3부 (16:00~18:30)": "passnine_t3", "4부 (19:30~22:00)": "passnine_t4" },
  },
  "밀양 아리랑": {
    enabledField: "can_miryang", dayPrefix: "miryang_day_",
    timeFields: { "오전부 (08:00~10:00) ※주말만": "miryang_t0", "1부 (10:00~12:00)": "miryang_t1", "2부 (12:00~14:00)": "miryang_t2", "3부 (14:00~16:00)": "miryang_t3", "4부 (16:00~18:00)": "miryang_t4", "5부 (18:00~20:00)": "miryang_t5", "6부 (20:00~22:00)": "miryang_t6" },
  },
};

function instructorMatchesPoolOptions(instructor, poolOptions) {
  return Object.entries(poolOptions).some(([pool, option]) => {
    const config = poolMatchConfig[pool];
    return config && instructor?.[config.enabledField] === true
      && option.days.some(day => instructor?.[`${config.dayPrefix}${dayFieldSuffix[day]}`] === true)
      && option.times.some(time => instructor?.[config.timeFields[time]] === true);
  });
}

export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  const { name, phone, course, pool, time_slot, instructor_id } = body;
  const isYouthCourse = typeof course === "string" && course.trim().startsWith("유스 프리다이빙");
  const youthParticipantCount = Number(body.youth_participant_count);
  let preferredPoolOptions = cleanPoolOptions(body.preferred_pool_options);
  if (!Object.keys(preferredPoolOptions).length) {
    const legacyDays = cleanTextList(body.preferred_days, 8, 10);
    const legacySchedule = cleanSchedule(body.preferred_schedule);
    preferredPoolOptions = cleanPoolOptions(Object.fromEntries(Object.entries(legacySchedule).map(([poolName, times]) => [poolName, { days: legacyDays, times }])));
  }
  const hasCompletePoolOption = Object.keys(preferredPoolOptions).length > 0
    && Object.values(preferredPoolOptions).every(option => option.days.length > 0 && option.times.length > 0);
  if (![name, phone, course, pool, time_slot].every(value => typeof value === "string" && value.trim().length > 0)
    || !/^[0-9a-f-]{36}$/i.test(instructor_id || "")
    || !hasCompletePoolOption
    || (isYouthCourse && (!Number.isInteger(youthParticipantCount) || youthParticipantCount < 1 || youthParticipantCount > 20
      || typeof body.youth_ages !== "string" || !body.youth_ages.trim()))
    || name.length > 100 || phone.length > 30 || course.length > 200 || pool.length > 100 || time_slot.length > 1000) {
    return NextResponse.json({ error: "신청 정보를 확인해 주세요." }, { status: 400 });
  }
  try {
    const supabase = createAdminSupabase();
    const { data: instructor, error: instructorError } = await supabase.from("instructors")
      .select(`${instructorPublicFields},phone,is_approved`).eq("id", instructor_id).maybeSingle();
    if (instructorError) throw instructorError;
    if (!instructor?.is_approved || !hasCompleteInstructorProfile(instructor)) {
      return NextResponse.json({ error: "선택한 강사를 찾을 수 없습니다. 다시 매칭해 주세요." }, { status: 409 });
    }
    const courseNames = ["프리다이빙", "머메이드 다이빙", "유스 프리다이빙", "수중레저안전요원", "스쿠버다이빙", "스페셜 교육"];
    const requestedCourseName = courseNames.find(courseName => course.trim().startsWith(`${courseName} (`));
    const requestedLevel = requestedCourseName ? course.trim().slice(requestedCourseName.length + 2, -1) : "";
    if (!requestedCourseName || !canInstructorTeachCourse(instructor, requestedCourseName, requestedLevel)) {
      return NextResponse.json({ error: "선택한 과정을 교육할 수 있는 강사를 다시 매칭해 주세요." }, { status: 409 });
    }
    if (!instructorMatchesPoolOptions(instructor, preferredPoolOptions)) {
      return NextResponse.json({ error: "선택한 풀장 일정과 맞는 강사를 다시 매칭해 주세요." }, { status: 409 });
    }
    const attribution = body.attribution && typeof body.attribution === "object" ? body.attribution : {};
    const { data, error } = await supabase.from("customers").insert({
      name: name.trim(), phone: phone.trim(), course: course.trim(), pool: pool.trim(),
      time_slot: time_slot.trim(), matched_instructor_id: instructor.id,
      matched_instructor: instructor.name,
      preferred_days: cleanTextList(body.preferred_days, 8, 10),
      preferred_schedule: cleanSchedule(body.preferred_schedule),
      preferred_pool_options: preferredPoolOptions,
      youth_participant_count: isYouthCourse ? youthParticipantCount : null,
      youth_ages: isYouthCourse ? cleanText(body.youth_ages, 200) : null,
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
    after(async () => {
      const variables = {
        customerName: name.trim(),
        instructorName: instructor.name,
        course: course.trim(),
        pool: pool.trim(),
        schedule: time_slot.trim(),
      };
      await Promise.allSettled([
        sendKakaoAlimtalk({ eventType: "match_requested", recipientRole: "instructor", phone: instructor.phone, variables }),
        sendKakaoAlimtalk({ eventType: "match_requested", recipientRole: "admin", phone: process.env.KAKAO_ADMIN_PHONE, variables }),
      ]);
    });
    return NextResponse.json({ id: data.id, instructor: { phone: instructor.phone } }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "신청 내용을 저장하지 못했습니다. 잠시 후 다시 시도해 주세요." }, { status: 503 });
  }
}
