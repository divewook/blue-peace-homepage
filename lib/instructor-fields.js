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
