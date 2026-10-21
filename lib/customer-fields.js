// Fields needed for assigned instructor consultation and lesson management.
// Advertising attribution and consent metadata stay in the admin-only response.
export const instructorCustomerFields = [
  "id", "name", "phone", "course", "pool", "time_slot", "matched_instructor_id",
  "matched_instructor", "created_at", "preferred_days", "preferred_schedule",
  "preferred_pool_options", "schedule_mode", "schedule_alternatives", "request_status",
  "matched_schedule", "youth_participant_count", "youth_ages", "assignment_generation",
].join(",");
