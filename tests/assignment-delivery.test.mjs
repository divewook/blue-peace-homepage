import assert from 'node:assert/strict';
import { test } from 'node:test';
import { assignmentSmsUri, buildAssignmentMessage, instructorMobile, matchedCondition, preferredAlternatives } from '../lib/assignment-delivery.js';

const customer = {
  id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', name: '가상 고객', phone: '010-9999-1111',
  course: '프리다이빙 1+2레벨 패키지', schedule_mode: 'exact',
  schedule_alternatives: [
    { poolId: 'passnine', dayId: 'mon', slotId: 't4' },
    { poolId: 'passnine', dayId: 'sat', slotId: 't2' },
  ],
  matched_schedule: { poolId: 'passnine', dayId: 'sat', slotId: 't2' },
};
const instructor = { name: '가상 강사', phone: '010-2222-3333' };

test('saved match evidence and every customer alternative stay separate', () => {
  const message = buildAssignmentMessage(customer, instructor);
  assert.match(message, /신청 과정: 프리다이빙 1\+2레벨 패키지/);
  assert.match(message, /일치한 상담 가능 조건: 칠곡 패스나인 풀장 \/ 토요일 \/ 2부/);
  assert.match(message, /고객 희망 대안:\n1\. 칠곡 패스나인 풀장 \/ 월요일 \/ 4부.*\n2\. 칠곡 패스나인 풀장 \/ 토요일 \/ 2부/s);
  assert.match(message, /수업 예약 확정이 아닙니다/);
});

test('missing historic evidence is not inferred from current timetable', () => {
  const old = { ...customer, matched_schedule: null };
  assert.equal(matchedCondition(old), '기록 없음');
  assert.match(buildAssignmentMessage(old, instructor), /일치한 상담 가능 조건: 기록 없음/);
  assert.deepEqual(preferredAlternatives({ pool: '칠곡 패스나인', time_slot: '4부', preferred_days: ['월요일', '토요일'] }),
    ['칠곡 패스나인 / 요일 월요일·토요일 / 회차 4부 (과거 개별 선택값)']);
});

test('SMS recipient is the instructor, never the customer, and Korean text is encoded', () => {
  const message = buildAssignmentMessage({ ...customer, name: '가상&고객\n둘' }, instructor);
  const uri = assignmentSmsUri(instructor.phone, message);
  assert.ok(uri.startsWith('sms:01022223333?body='));
  assert.ok(!uri.startsWith('sms:01099991111'));
  assert.equal(decodeURIComponent(uri.split('?body=')[1]), message);
  assert.equal(instructorMobile('전화번호 없음'), null);
  assert.equal(instructorMobile('invalid010-2222-3333'), null);
  assert.equal(assignmentSmsUri('', message), null);
  assert.equal(assignmentSmsUri('010-12-3333', message), null);
});
