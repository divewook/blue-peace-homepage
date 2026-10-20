import { scheduleLabel } from './booking-options.js';

export function instructorMobile(phone) {
  const raw = String(phone || '').trim();
  if (!/^[0-9\s-]+$/.test(raw)) return null;
  const digits = raw.replace(/[^0-9]/g, '');
  return /^01[016789][0-9]{7,8}$/.test(digits) ? digits : null;
}

export function preferredAlternatives(customer) {
  if (customer.schedule_mode === 'flexible') return ['상담 후 일정 협의'];
  const exact = Array.isArray(customer.schedule_alternatives)
    ? customer.schedule_alternatives.filter(item => item?.poolId && item?.dayId && item?.slotId)
    : [];
  if (exact.length) return exact.map(scheduleLabel);
  // Older applications stored days and times separately. Preserve that ambiguity.
  const pools = customer.preferred_pool_options && Object.keys(customer.preferred_pool_options).length
    ? customer.preferred_pool_options
    : customer.pool ? { [customer.pool]: { days: customer.preferred_days || [], times: customer.time_slot ? [customer.time_slot] : [] } } : {};
  const stored = Object.entries(pools).map(([pool, value]) =>
    `${pool} / 요일 ${(value.days || []).join('·') || '기록 없음'} / 회차 ${(value.times || []).join('·') || '기록 없음'} (과거 개별 선택값)`);
  return stored.length ? stored : ['기록 없음'];
}

export function matchedCondition(customer) {
  const value = customer.matched_schedule;
  if (!value?.poolId || !value?.dayId || !value?.slotId) return '기록 없음';
  const label = scheduleLabel(value);
  return label === '미완성 일정' ? '기록 없음' : label;
}

export function buildAssignmentMessage(customer, instructor) {
  const alternatives = preferredAlternatives(customer);
  return [
    '[블루피스 신규 상담 배정]',
    '',
    `담당 강사: ${instructor?.name || '기록 없음'}`,
    `신청번호: ${customer.id}`,
    `고객: ${customer.name || '기록 없음'}`,
    `연락처: ${customer.phone || '기록 없음'}`,
    `신청 과정: ${customer.course || '기록 없음'}`,
    `일치한 상담 가능 조건: ${matchedCondition(customer)}`,
    '고객 희망 대안:',
    ...alternatives.map((item, index) => `${index + 1}. ${item}`),
    '',
    '신규 상담이 배정되었습니다.',
    '고객에게 연락해 교육 일정과 등록을 안내해 주세요.',
    '위 조건은 상담 가능 조건이며 수업 예약 확정이 아닙니다.',
    '',
    '상세 확인:',
    'https://www.bluepeace.co.kr/instructor/mypage',
  ].join('\n');
}

export function assignmentSmsUri(phone, message) {
  const recipient = instructorMobile(phone);
  return recipient ? `sms:${recipient}?body=${encodeURIComponent(message)}` : null;
}
