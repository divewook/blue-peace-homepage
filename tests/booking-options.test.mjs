import test from 'node:test';
import assert from 'node:assert/strict';
import { getAvailableSlots, validateScheduleAlternatives } from '../lib/booking-options.js';

test('밀양 주말 전용 오전부는 월요일에 허용되지 않는다', () => {
  assert.equal(getAvailableSlots('miryang', 'mon').some(slot => slot.id === 't0'), false);
  const result = validateScheduleAlternatives({
    mode: 'exact', alternatives: [{ poolId: 'miryang', dayId: 'mon', slotId: 't0' }],
  });
  assert.equal(result.valid, false);
});

test('밀양 주말 전용 오전부는 토요일에 허용된다', () => {
  const result = validateScheduleAlternatives({
    mode: 'exact', alternatives: [{ poolId: 'miryang', dayId: 'sat', slotId: 't0' }],
  });
  assert.equal(result.valid, true);
});

test('휴장 풀장과 중복 일정은 거절한다', () => {
  const closed = validateScheduleAlternatives({
    mode: 'exact', alternatives: [{ poolId: 'duryu', dayId: 'sat', slotId: 't1' }],
  });
  assert.equal(closed.valid, false);
  const duplicate = validateScheduleAlternatives({
    mode: 'exact', alternatives: [
      { poolId: 'passnine', dayId: 'mon', slotId: 't1' },
      { poolId: 'passnine', dayId: 'mon', slotId: 't1' },
    ],
  });
  assert.equal(duplicate.valid, false);
});

test('일정 협의 가능은 정확한 일정과 구분된다', () => {
  const result = validateScheduleAlternatives({ mode: 'flexible', alternatives: [] });
  assert.deepEqual(result, { valid: true, errors: [], alternatives: [], mode: 'flexible' });
});
