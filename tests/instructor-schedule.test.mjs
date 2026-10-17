import test from 'node:test';
import assert from 'node:assert/strict';
import { findMatchingAlternative, getInstructorSchedule, validateInstructorSchedule } from '../lib/booking-options.js';

const monday = { poolId: 'passnine', dayId: 'mon', slotId: 't4' };
const saturday = { poolId: 'passnine', dayId: 'sat', slotId: 't2' };
const newInstructor = { can_passnine: true, can_miryang: true, schedule_by_day: { passnine: { mon: ['t4'], sat: ['t2'] }, miryang: {} } };

test('요일과 회차를 한 묶음으로 비교하고 일치한 대안을 돌려준다', () => {
  assert.equal(findMatchingAlternative(newInstructor, [{ ...monday, slotId: 't2' }]), null);
  assert.deepEqual(findMatchingAlternative(newInstructor, [saturday]), saturday);
  assert.deepEqual(findMatchingAlternative(newInstructor, [{ ...monday, slotId: 't2' }, saturday]), saturday);
  assert.equal(findMatchingAlternative(newInstructor, [{ ...saturday, poolId: 'miryang' }]), null);
  assert.equal(findMatchingAlternative(newInstructor, [{ ...monday, dayId: 'tue' }]), null);
});

test('구형 요일과 회차 조합은 선택한 모든 요일에 적용하던 기존 의미를 유지한다', () => {
  const legacy = { can_passnine: true, passnine_day_mon: true, passnine_day_sat: true, passnine_t2: true, passnine_t4: true, schedule_by_day: null };
  assert.deepEqual(getInstructorSchedule(legacy).passnine.mon, ['t2', 't4']);
  assert.deepEqual(getInstructorSchedule(legacy).passnine.sat, ['t2', 't4']);
  assert.equal(getInstructorSchedule(legacy).passnine.tue, undefined);
});

test('운영하지 않는 시간과 휴장 풀장을 서버 검증에서 거절한다', () => {
  assert.equal(validateInstructorSchedule({ miryang: { mon: ['t0'] } }).valid, false);
  assert.equal(validateInstructorSchedule({ miryang: { sat: ['t0'] } }).valid, true);
  assert.equal(validateInstructorSchedule({ duryu: { mon: ['t1'] } }).valid, false);
  assert.equal(validateInstructorSchedule({ miryang: { holiday: ['t0'] } }).valid, false);
  assert.equal(validateInstructorSchedule({ passnine: { mon: ['t4', 't4'] } }).valid, false);
});

test('공휴일은 독립된 가능 요일이며 평일 또는 주말을 자동 포함하지 않는다', () => {
  const instructor = { can_passnine: true, schedule_by_day: { passnine: { holiday: ['t2'] } } };
  assert.equal(findMatchingAlternative(instructor, [{ poolId: 'passnine', dayId: 'mon', slotId: 't2' }]), null);
  assert.deepEqual(findMatchingAlternative(instructor, [{ poolId: 'passnine', dayId: 'holiday', slotId: 't2' }]), { poolId: 'passnine', dayId: 'holiday', slotId: 't2' });
});
