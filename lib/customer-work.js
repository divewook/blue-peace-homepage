import { bookingDays, getAvailableSlots, getInstructorSchedule, getPool } from './booking-options.js';

export const consultationStatuses = {
  contact_needed: '연락 필요', consulting: '상담 중', awaiting_customer: '고객 답변 대기',
  schedule_discussion: '일정 협의 중', first_lesson_confirmed: '첫 수업 확정', closed: '상담 종료',
};
export const consultationEndReasons = {
  withdrawn: '고객 신청 철회', unreachable: '연락 미연결', conditions_mismatch: '조건 불일치',
  duplicate: '중복 신청', other: '기타',
};
const workflowFields = ['status','end_reason','last_contact_result','internal_note','task_title','task_due_at','task_completed'];
const max = (value, size) => typeof value === 'string' && value.length <= size;
export function validateWorkflowPatch(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return '변경 내용을 확인해 주세요.';
  if (!Object.keys(input).length || Object.keys(input).some(key => !workflowFields.includes(key))) return '허용되지 않은 변경 항목이 있습니다.';
  if (input.status !== undefined && input.status !== '' && !(input.status in consultationStatuses)) return '상담 상태를 확인해 주세요.';
  if (input.end_reason !== undefined && input.end_reason !== '' && !(input.end_reason in consultationEndReasons)) return '상담 종료 사유를 확인해 주세요.';
  if (input.status === 'closed' && !(input.end_reason in consultationEndReasons)) return '상담 종료 사유를 선택해 주세요.';
  for (const field of ['last_contact_result','internal_note','task_title']) {
    if (input[field] !== undefined && !max(input[field], field === 'internal_note' ? 3000 : 500)) return '입력한 글이 너무 깁니다.';
  }
  if (input.task_due_at && (Number.isNaN(Date.parse(input.task_due_at)) || !max(input.task_due_at, 40))) return '다음 할 일의 날짜를 확인해 주세요.';
  if (input.task_completed !== undefined && typeof input.task_completed !== 'boolean') return '할 일 완료 여부를 확인해 주세요.';
  return null;
}
function seoulDay(date) {
  return new Intl.DateTimeFormat('en-US', { timeZone:'Asia/Seoul', weekday:'short' }).format(date).toLowerCase();
}
export function validateLessonInput(input, customer, instructor, existing, confirmedLessons) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return '수업 정보를 확인해 주세요.';
  const { status, lesson_date: date, start_time: start, end_time: end, pool_id: poolId } = input;
  if (!['proposed','confirmed','cancelled'].includes(status)) return '수업 상태를 확인해 주세요.';
  if (status === 'cancelled' && !existing) return '취소할 수업이 없습니다.';
  if (existing?.status === 'cancelled' && status !== 'cancelled') return '취소된 수업은 다시 활성화할 수 없습니다.';
  if (existing?.status === 'confirmed' && (!max(input.change_reason, 500) || !input.change_reason.trim())) return '확정 수업을 변경하거나 취소할 때 사유를 입력해 주세요.';
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date || '') || !/^\d{2}:\d{2}$/.test(start || '') || !/^\d{2}:\d{2}$/.test(end || '') || end <= start) return '수업 날짜와 시작·종료 시간을 확인해 주세요.';
  const begins = new Date(`${date}T${start}:00+09:00`);
  const ends = new Date(`${date}T${end}:00+09:00`);
  if (Number.isNaN(+begins) || Number.isNaN(+ends) || (status !== 'cancelled' && begins <= new Date())) return '지난 날짜에는 새 수업을 설정할 수 없습니다.';
  const pool = getPool(poolId);
  if (!pool?.active) return '현재 이용 가능한 풀장을 선택해 주세요.';
  const dayId = seoulDay(begins);
  const day = bookingDays.find(item => item.id === dayId);
  if (!day) return '수업 요일을 확인할 수 없습니다.';
  const slots = getAvailableSlots(poolId, dayId).filter(slot => {
    const [slotStart, slotEnd] = slot.time.split('~');
    return start >= slotStart && end <= slotEnd;
  });
  if (status !== 'cancelled' && !slots.length) return '해당 요일에 운영하는 회차 안에서 시간을 지정해 주세요.';
  if (status === 'confirmed') {
    if (input.customer_agreed !== true) return '고객과 일정 합의를 확인해 주세요.';
    if (input.operation_checked !== true || !max(input.operation_evidence, 500) || !input.operation_evidence.trim()) return '풀장 운영 확인과 근거를 기록해 주세요.';
    const schedule = getInstructorSchedule(instructor);
    const recurringMatch = slots.some(slot => schedule?.[poolId]?.[dayId]?.includes(slot.id));
    if (!recurringMatch && (input.exception_agreed !== true || !max(input.exception_reason, 500) || !input.exception_reason.trim())) return '반복 시간표 밖 일정은 고객과 예외 합의 후 사유를 기록해 주세요.';
    const nearbyOtherPool = confirmedLessons.some(lesson => lesson.id !== existing?.id && lesson.status === 'confirmed' && lesson.pool_id !== poolId && lesson.lesson_date === date);
    if (nearbyOtherPool && (input.travel_checked !== true || !max(input.travel_reason, 500) || !input.travel_reason.trim())) return '같은 날 다른 풀장 수업이 있습니다. 이동 가능 여부와 근거를 기록해 주세요.';
  }
  for (const field of ['operation_evidence','exception_reason','travel_reason','change_reason']) if (input[field] && !max(input[field], 500)) return '사유나 근거는 500자 이내로 입력해 주세요.';
  return null;
}
