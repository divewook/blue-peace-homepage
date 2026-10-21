import assert from 'node:assert/strict';
import test from 'node:test';
import { parseParadiveSessions } from '../lib/paradive-scraper.js';
import { normalizeMarinaSessions } from '../lib/marina-scraper.js';

test('파라다이브가 지난 회차를 생략해도 실제 회차 번호를 유지한다', () => {
  const sessions = parseParadiveSessions("freservation_time_select('4', '17:00', '20:00', ''); freservation_time_select('5', '20:00', '23:00', '')");
  assert.deepEqual(sessions.map(session => session.label), ['4부', '5부']);
  assert.equal(sessions.length, 2);
});

test('북항마리나 회차 미표시와 일부 회차를 조회 실패로 단정하지 않는다', () => {
  assert.deepEqual(normalizeMarinaSessions({ programTimeList: [] }), {
    open: false, reason: '해당 날짜에 예약 가능한 회차가 표시되지 않습니다.', sessions: [],
  });
  const result = normalizeMarinaSessions({ programTimeList: [{ timeId: '3', timeName: '3부', startTime: '17:00', endTime: '20:00', memberCntNow: '8', memberCnt: '20' }] });
  assert.equal(result.open, true);
  assert.equal(result.sessions[0].label, '3부');
  assert.equal(result.sessions[0].remaining, 8);
});

test('북항마리나 잔여석 수치가 없으면 마감이라고 표시하지 않는다', () => {
  const result = normalizeMarinaSessions({ programTimeList: [{ timeId: '2', timeName: '2부', startTime: '13:00', endTime: '16:00', memberCntNow: null, memberCnt: null }] });
  assert.equal(result.sessions[0].status, 'unknown');
  assert.equal(result.sessions[0].remaining, null);
  assert.equal(result.sessions[0].total, null);
});
