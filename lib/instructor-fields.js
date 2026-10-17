import { getInstructorSchedule, getAvailableSlots } from "./booking-options.js";

export const instructorPrivateSafeFields = [
  "id", "name", "username", "phone", "is_approved", "profile_image", "bio", "kakao_chat_url",
  "max_freediving_level", "max_mermaid_level", "max_youth_level", "can_safety_guard", "can_scuba",
  "can_special", "can_duryu", "can_passnine", "can_miryang", "available_mon", "available_tue",
  "available_wed", "available_thu", "available_fri", "available_sat", "available_sun", "passnine_t1",
  "passnine_t2", "passnine_t3", "passnine_t4", "miryang_t0", "miryang_t1", "miryang_t2",
  "miryang_t3", "miryang_t4", "miryang_t5", "miryang_t6", "safety_guard_level", "scuba_level",
  "first_aid_level", "underwater_photo_level", "course_levels", "schedule_by_day", "schedule_revision", "created_at",
  "passnine_day_mon", "passnine_day_tue", "passnine_day_wed", "passnine_day_thu", "passnine_day_fri",
  "passnine_day_sat", "passnine_day_sun", "passnine_day_holiday", "miryang_day_mon", "miryang_day_tue",
  "miryang_day_wed", "miryang_day_thu", "miryang_day_fri", "miryang_day_sat", "miryang_day_sun", "miryang_day_holiday",
].join(",");

export const instructorPublicFields = [
  "id", "name", "profile_image", "bio", "max_freediving_level", "max_mermaid_level", "max_youth_level",
  "can_safety_guard", "can_scuba", "can_special", "can_duryu", "can_passnine", "can_miryang",
  "available_mon", "available_tue", "available_wed", "available_thu", "available_fri", "available_sat",
  "available_sun", "passnine_t1", "passnine_t2", "passnine_t3", "passnine_t4", "miryang_t0",
  "miryang_t1", "miryang_t2", "miryang_t3", "miryang_t4", "miryang_t5", "miryang_t6", "course_levels", "schedule_by_day",
  "passnine_day_mon", "passnine_day_tue", "passnine_day_wed", "passnine_day_thu", "passnine_day_fri",
  "passnine_day_sat", "passnine_day_sun", "passnine_day_holiday", "miryang_day_mon", "miryang_day_tue",
  "miryang_day_wed", "miryang_day_thu", "miryang_day_fri", "miryang_day_sat", "miryang_day_sun", "miryang_day_holiday",
].join(",");

const teachingLevels = {
  "프리다이빙": ["체험 과정", "1레벨 (프리다이버)", "2레벨 (오픈워터)", "3레벨 (어드밴스드)", "4레벨 (마스터)", "강사 과정"],
  "머메이드 다이빙": ["체험 과정", "1레벨 (베이직 머메이드)", "2레벨 (머메이드)", "3레벨 (오션 머메이드)", "머메이드 강사 과정"],
  "유스 프리다이빙": ["체험 과정", "1레벨 (돌핀)", "2레벨 (오르카)", "3레벨 (샤크)", "유스 강사 과정"],
  "수중레저안전요원": ["수중레저안전요원", "마스터 안전요원", "안전요원 강사 과정"],
  "스쿠버다이빙": ["체험 과정", "오픈워터", "어드벤처", "어드밴스드", "오픈워터+어드밴스드 패키지"],
};
const packageRequirements = {
  "프리다이빙": { "1+2레벨 패키지": "2레벨 (오픈워터)", "3+4레벨 패키지": "4레벨 (마스터)" },
  "머메이드 다이빙": { "베이직+머메이드 패키지": "2레벨 (머메이드)", "머메이드+오션 패키지": "3레벨 (오션 머메이드)" },
  "유스 프리다이빙": { "돌핀+오르카 패키지": "2레벨 (오르카)", "오르카+샤크 패키지": "3레벨 (샤크)" },
};

export function canInstructorTeachCourse(instructor, courseName, requestedLevel) {
  const saved = instructor?.course_levels?.[courseName];
  if (courseName === "스페셜 교육") {
    return Array.isArray(saved) ? saved.includes(requestedLevel) : saved === requestedLevel;
  }
  if (typeof saved !== "string" || saved === "교육 불가") return false;
  const levels = teachingLevels[courseName];
  if (!levels) return false;
  const required = packageRequirements[courseName]?.[requestedLevel] || requestedLevel;
  const savedIndex = levels.indexOf(saved);
  const requiredIndex = levels.indexOf(required);
  return savedIndex >= 0 && requiredIndex >= 0 && savedIndex >= requiredIndex;
}

export function hasCompleteInstructorProfile(instructor) {
  const courseLevels = instructor?.course_levels && typeof instructor.course_levels === "object"
    ? Object.values(instructor.course_levels)
    : [];
  const hasCourse = courseLevels.some(level => (typeof level === "string" && level !== "교육 불가")
      || (Array.isArray(level) && level.some(item => typeof item === "string" && item !== "교육 불가")))
    || Number(instructor?.max_freediving_level) > 0
    || Number(instructor?.max_mermaid_level) > 0
    || Number(instructor?.max_youth_level) > 0
    || instructor?.can_safety_guard === true
    || instructor?.can_scuba === true
    || instructor?.can_special === true;
  const schedule = getInstructorSchedule(instructor);
  const poolIsComplete = pool => (instructor?.schedule_by_day != null || instructor?.[`can_${pool}`] === true)
    && Object.entries(schedule?.[pool] || {}).some(([day, slots]) => Array.isArray(slots)
      && slots.some(slot => getAvailableSlots(pool, day).some(item => item.id === slot)));

  return typeof instructor?.profile_image === "string"
    && instructor.profile_image.trim().length > 0
    && hasCourse
    && (poolIsComplete("passnine") || poolIsComplete("miryang"));
}
