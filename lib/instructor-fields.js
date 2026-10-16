export const instructorPrivateSafeFields = [
  "id", "name", "username", "phone", "is_approved", "profile_image", "bio", "kakao_chat_url",
  "max_freediving_level", "max_mermaid_level", "max_youth_level", "can_safety_guard", "can_scuba",
  "can_special", "can_duryu", "can_passnine", "can_miryang", "available_mon", "available_tue",
  "available_wed", "available_thu", "available_fri", "available_sat", "available_sun", "passnine_t1",
  "passnine_t2", "passnine_t3", "passnine_t4", "miryang_t0", "miryang_t1", "miryang_t2",
  "miryang_t3", "miryang_t4", "miryang_t5", "miryang_t6", "safety_guard_level", "scuba_level",
  "first_aid_level", "underwater_photo_level", "course_levels", "created_at",
].join(",");

export const instructorPublicFields = [
  "id", "name", "profile_image", "bio", "max_freediving_level", "max_mermaid_level", "max_youth_level",
  "can_safety_guard", "can_scuba", "can_special", "can_duryu", "can_passnine", "can_miryang",
  "available_mon", "available_tue", "available_wed", "available_thu", "available_fri", "available_sat",
  "available_sun", "passnine_t1", "passnine_t2", "passnine_t3", "passnine_t4", "miryang_t0",
  "miryang_t1", "miryang_t2", "miryang_t3", "miryang_t4", "miryang_t5", "miryang_t6", "course_levels",
].join(",");

const dayFields = [
  "available_mon", "available_tue", "available_wed", "available_thu",
  "available_fri", "available_sat", "available_sun",
];
const passnineTimeFields = ["passnine_t1", "passnine_t2", "passnine_t3", "passnine_t4"];
const miryangTimeFields = ["miryang_t0", "miryang_t1", "miryang_t2", "miryang_t3", "miryang_t4", "miryang_t5", "miryang_t6"];

export function hasCompleteInstructorProfile(instructor) {
  const courseLevels = instructor?.course_levels && typeof instructor.course_levels === "object"
    ? Object.values(instructor.course_levels)
    : [];
  const hasCourse = courseLevels.some(level => typeof level === "string" && level !== "교육 불가")
    || Number(instructor?.max_freediving_level) > 0
    || Number(instructor?.max_mermaid_level) > 0
    || Number(instructor?.max_youth_level) > 0
    || instructor?.can_safety_guard === true
    || instructor?.can_scuba === true
    || instructor?.can_special === true;
  const hasAvailableDay = dayFields.some(field => instructor?.[field] === true);
  const hasPoolTime = (instructor?.can_passnine === true && passnineTimeFields.some(field => instructor?.[field] === true))
    || (instructor?.can_miryang === true && miryangTimeFields.some(field => instructor?.[field] === true));

  return typeof instructor?.profile_image === "string"
    && instructor.profile_image.trim().length > 0
    && hasCourse
    && hasAvailableDay
    && hasPoolTime;
}
