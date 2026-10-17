import { after, NextResponse } from "next/server";
import { createAdminSupabase } from "../../../lib/admin-supabase";
import { canInstructorTeachCourse, hasCompleteInstructorProfile, instructorPublicFields } from "../../../lib/instructor-fields";
import { bookingPools, getCourse, getDay, getPool, validateScheduleAlternatives } from "../../../lib/booking-options";
import { sendKakaoAlimtalk } from "../../../lib/kakao-alimtalk";

export const runtime = "nodejs";

const requestKeyPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const dayFieldSuffix = { mon: "mon", tue: "tue", wed: "wed", thu: "thu", fri: "fri", sat: "sat", sun: "sun", holiday: "holiday" };
const poolMatchConfig = {
  passnine: { enabledField: "can_passnine", dayPrefix: "passnine_day_", timePrefix: "passnine_" },
  miryang: { enabledField: "can_miryang", dayPrefix: "miryang_day_", timePrefix: "miryang_" },
};

function cleanText(value, maxLength) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function cleanAttribution(value) {
  const source = value && typeof value === "object" && !Array.isArray(value) ? value : {};
  return {
    landing_url: cleanText(source.landing_url, 500) || null,
    referrer_url: cleanText(source.referrer_url, 500) || null,
    traffic_source: cleanText(source.traffic_source, 100) || "직접 방문",
    traffic_medium: cleanText(source.traffic_medium, 100) || "direct",
    traffic_campaign: cleanText(source.traffic_campaign, 200) || null,
    traffic_term: cleanText(source.traffic_term, 200) || null,
    traffic_content: cleanText(source.traffic_content, 200) || null,
    device_type: cleanText(source.device_type, 30) || null,
  };
}

function parseRequestedCourse(body) {
  if (body.course_id === "unsure") {
    return { courseId: "unsure", levelId: "consult", courseName: "상담 후 과정 결정", levelName: "", displayName: "상담 후 과정 결정", needsAssignment: true };
  }
  const course = getCourse(body.course_id);
  if (course) {
    if (body.level_id === "consult") {
      return { courseId: course.id, levelId: "consult", courseName: course.name, levelName: "", displayName: `${course.name} (상담 후 세부 과정 결정)`, needsAssignment: true };
    }
    const level = course.levels.find(item => item.id === body.level_id);
    if (!level) return null;
    return { courseId: course.id, levelId: level.id, courseName: course.name, levelName: level.name, displayName: `${course.name} (${level.name})`, needsAssignment: false };
  }

  const legacy = cleanText(body.course, 200);
  const courseNames = ["프리다이빙", "머메이드 다이빙", "유스 프리다이빙", "수중레저안전요원", "스쿠버다이빙", "스페셜 교육"];
  const courseName = courseNames.find(name => legacy.startsWith(`${name} (`));
  if (!courseName || !legacy.endsWith(")")) return null;
  return { courseId: "legacy", levelId: "legacy", courseName, levelName: legacy.slice(courseName.length + 2, -1), displayName: legacy, needsAssignment: false };
}

function alternativesToLegacy(alternatives) {
  const poolOptions = {};
  for (const option of alternatives) {
    const pool = getPool(option.poolId);
    const day = getDay(option.dayId);
    const slot = pool?.slots.find(item => item.id === option.slotId);
    if (!pool || !day || !slot) continue;
    const poolName = pool.storedName;
    const time = `${slot.label} (${slot.time})${slot.restriction ? " ※주말만" : ""}`;
    poolOptions[poolName] ||= { days: [], times: [] };
    if (!poolOptions[poolName].days.includes(day.shortLabel)) poolOptions[poolName].days.push(day.shortLabel);
    if (!poolOptions[poolName].times.includes(time)) poolOptions[poolName].times.push(time);
  }
  return poolOptions;
}

function instructorMatchesAlternative(instructor, option) {
  const config = poolMatchConfig[option.poolId];
  return Boolean(config
    && instructor?.[config.enabledField] === true
    && instructor?.[`${config.dayPrefix}${dayFieldSuffix[option.dayId]}`] === true
    && instructor?.[`${config.timePrefix}${option.slotId}`] === true);
}

function instructorCanTeachCategory(instructor, courseName) {
  const saved = instructor?.course_levels?.[courseName];
  return Array.isArray(saved)
    ? saved.some(item => typeof item === "string" && item && item !== "교육 불가")
    : typeof saved === "string" && saved !== "교육 불가";
}

async function existingRequestResponse(supabase, requestKey) {
  if (!requestKey) return null;
  const { data, error } = await supabase.from("customers")
    .select("id,matched_instructor_id,matched_instructor,request_status")
    .eq("request_key", requestKey).maybeSingle();
  if (error || !data) return null;
  let phone = null;
  if (data.matched_instructor_id) {
    const result = await supabase.from("instructors").select("phone").eq("id", data.matched_instructor_id).maybeSingle();
    phone = result.data?.phone || null;
  }
  return NextResponse.json({ id: data.id, duplicate: true, status: data.request_status, instructor: data.matched_instructor_id ? { name: data.matched_instructor, phone } : null });
}

export async function POST(request) {
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return NextResponse.json({ error: "신청 정보를 확인해 주세요." }, { status: 400 });
  }

  const name = cleanText(body.name, 100);
  const phone = cleanText(body.phone, 30);
  const requestedCourse = parseRequestedCourse(body);
  const isNewRequest = typeof body.course_id === "string";
  const requestKey = requestKeyPattern.test(body.request_key || "") ? body.request_key : null;
  const instructorId = requestKeyPattern.test(body.instructor_id || "") ? body.instructor_id : null;
  const isYouthCourse = requestedCourse?.courseName === "유스 프리다이빙";
  const youthParticipantCount = Number(body.youth_participant_count);
  const youthAges = cleanText(body.youth_ages, 200);
  const scheduleResult = isNewRequest
    ? validateScheduleAlternatives({ mode: body.schedule_mode, alternatives: body.schedule_alternatives })
    : { valid: false, errors: ["이전 신청 화면을 새로고침한 뒤 다시 신청해 주세요."] };

  if (!name || !/^010-\d{4}-\d{4}$/.test(phone) || !requestedCourse || !scheduleResult.valid
    || (isNewRequest && !requestKey)
    || (isNewRequest && body.privacy_accepted !== true)
    || (isYouthCourse && (!Number.isInteger(youthParticipantCount) || youthParticipantCount < 1 || youthParticipantCount > 20 || !youthAges))) {
    return NextResponse.json({ error: scheduleResult.errors?.[0] || "필수 신청 정보를 확인해 주세요." }, { status: 400 });
  }

  try {
    const supabase = createAdminSupabase();
    const duplicateResponse = await existingRequestResponse(supabase, requestKey);
    if (duplicateResponse) return duplicateResponse;

    let instructor = null;
    if (instructorId) {
      const { data, error } = await supabase.from("instructors")
        .select(`${instructorPublicFields},phone,is_approved`).eq("id", instructorId).maybeSingle();
      if (error) throw error;
      if (!data?.is_approved || !hasCompleteInstructorProfile(data)) {
        return NextResponse.json({ error: "선택한 강사를 찾을 수 없습니다. 다시 매칭해 주세요." }, { status: 409 });
      }
      const canTeach = requestedCourse.needsAssignment
        ? instructorCanTeachCategory(data, requestedCourse.courseName)
        : canInstructorTeachCourse(data, requestedCourse.courseName, requestedCourse.levelName);
      if (!canTeach) return NextResponse.json({ error: "선택한 과정을 교육할 수 있는 강사를 다시 확인해 주세요." }, { status: 409 });
      if (scheduleResult.mode === "exact" && !scheduleResult.alternatives.some(option => instructorMatchesAlternative(data, option))) {
        return NextResponse.json({ error: "선택한 장소·요일·시간과 맞는 강사를 다시 확인해 주세요." }, { status: 409 });
      }
      instructor = data;
    }

    const legacyPoolOptions = alternativesToLegacy(scheduleResult.alternatives);
    const preferredDays = [...new Set(Object.values(legacyPoolOptions).flatMap(option => option.days))];
    const preferredSchedule = Object.fromEntries(Object.entries(legacyPoolOptions).map(([pool, option]) => [pool, option.times]));
    const poolSummary = scheduleResult.mode === "flexible" ? "상담 후 협의" : Object.keys(legacyPoolOptions).join(" / ");
    const timeSummary = scheduleResult.mode === "flexible"
      ? "상담 후 일정 협의"
      : scheduleResult.alternatives.map(option => {
          const pool = bookingPools[option.poolId];
          const day = getDay(option.dayId);
          const slot = pool?.slots.find(item => item.id === option.slotId);
          return `${pool?.storedName} ${day?.shortLabel} ${slot?.label} ${slot?.time}`;
        }).join(" | ");
    const status = instructor ? "matched" : "pending_assignment";
    const attribution = body.marketing_accepted === true
      ? cleanAttribution(body.attribution)
      : {
          landing_url: null, referrer_url: null, traffic_source: null, traffic_medium: null,
          traffic_campaign: null, traffic_term: null, traffic_content: null, device_type: null,
        };
    const insertPayload = {
      name, phone, course: requestedCourse.displayName, pool: poolSummary, time_slot: timeSummary,
      matched_instructor_id: instructor?.id || null,
      matched_instructor: instructor?.name || "배정 대기",
      preferred_days: preferredDays,
      preferred_schedule: preferredSchedule,
      preferred_pool_options: legacyPoolOptions,
      schedule_mode: scheduleResult.mode,
      schedule_alternatives: scheduleResult.alternatives,
      request_key: requestKey,
      request_status: status,
      privacy_consent_version: "2026-10-17",
      privacy_consent_at: new Date().toISOString(),
      marketing_consent: body.marketing_accepted === true,
      youth_participant_count: isYouthCourse ? youthParticipantCount : null,
      youth_ages: isYouthCourse ? youthAges : null,
      ...attribution,
    };
    const { data, error } = await supabase.from("customers").insert(insertPayload).select("id").single();
    if (error) {
      if (error.code === "23505") {
        const duplicate = await existingRequestResponse(supabase, requestKey);
        if (duplicate) return duplicate;
      }
      throw error;
    }

    after(async () => {
      const variables = { customerName: name, instructorName: instructor?.name || "배정 대기", course: requestedCourse.displayName, pool: poolSummary, schedule: timeSummary };
      const jobs = [sendKakaoAlimtalk({ eventType: "match_requested", recipientRole: "admin", phone: process.env.KAKAO_ADMIN_PHONE, variables })];
      if (instructor?.phone) jobs.push(sendKakaoAlimtalk({ eventType: "match_requested", recipientRole: "instructor", phone: instructor.phone, variables }));
      await Promise.allSettled(jobs);
    });
    return NextResponse.json({ id: data.id, status, instructor: instructor ? { name: instructor.name, phone: instructor.phone } : null }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "신청 내용을 저장하지 못했습니다. 잠시 후 다시 시도해 주세요." }, { status: 503 });
  }
}
