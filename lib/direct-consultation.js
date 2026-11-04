import { getCourse } from './booking-options.js';
import { goalById } from './home-guide.js';

export const contactWindows = ['morning', 'afternoon', 'evening', 'anytime'];
export const directInterests = ['unsure', 'freediving', 'scuba', 'mermaid', 'youth', 'safety', 'photo', 'cpr'];
export const intakeStatuses = {
  new: '신규 접수', attempted: '연락 시도', consulting: '상담 진행',
  registered: '등록 완료', on_hold: '보류', closed: '종료',
};
export const interestLabels = {
  unsure: '아직 잘 모르겠어요', freediving: '프리다이빙', scuba: '스쿠버다이빙',
  mermaid: '머메이드', youth: '유스 프리다이빙', safety: '수중레저안전요원',
  photo: '언더워터 포토그래퍼', cpr: '응급처치·CPR',
};
export const contactWindowLabels = {
  morning: '오전', afternoon: '오후', evening: '저녁', anytime: '언제든 가능',
};
export const requestKeyPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function courseForInterest(interest) {
  return interest === 'photo' || interest === 'cpr' ? getCourse('special') : getCourse(interest);
}

export function validateDirectConsultation(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return '상담 신청 정보를 확인해 주세요.';
  if (!requestKeyPattern.test(body.request_key || '')) return '신청 식별자를 확인할 수 없습니다. 페이지를 새로 열어 주세요.';
  if (typeof body.name !== 'string' || !body.name.trim() || body.name.trim().length > 100) return '성함을 100자 이내로 입력해 주세요.';
  if (typeof body.phone !== 'string' || !/^010-\d{4}-\d{4}$/.test(body.phone)) return '010으로 시작하는 휴대폰 번호를 확인해 주세요.';
  if (body.privacy_accepted !== true) return '필수 개인정보 처리에 동의해 주세요.';
  if (!directInterests.includes(body.interest_id)) return '관심 교육 분야를 확인해 주세요.';
  if (body.contact_window && !contactWindows.includes(body.contact_window)) return '연락받기 편한 시간대를 확인해 주세요.';
  if (typeof body.inquiry_text !== 'string' || body.inquiry_text.length > 2000) return '문의사항은 2,000자 이내로 입력해 주세요.';
  if (body.goal_id && !goalById(body.goal_id)) return '관심사 선택을 확인해 주세요.';
  const course = courseForInterest(body.interest_id);
  if (body.level_id && (!course || !course.levels.some(level => level.id === body.level_id))) return '세부 교육과정을 확인해 주세요.';
  if (body.interest_id === 'photo' && body.level_id && body.level_id !== 'photo') return '세부 교육과정을 확인해 주세요.';
  if (body.interest_id === 'cpr' && body.level_id && !['cpr','instructor'].includes(body.level_id)) return '세부 교육과정을 확인해 주세요.';
  return null;
}

export function displayDirectCourse(interestId, levelId) {
  const course = courseForInterest(interestId);
  const level = course?.levels.find(item => item.id === levelId);
  return `${interestLabels[interestId] || interestLabels.unsure}${level ? ` (${level.name})` : ''}`;
}
