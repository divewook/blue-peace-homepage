import assert from 'node:assert/strict';
import { test } from 'node:test';
import { buildCustomerWorkSummary, customerWorkPriority, customerWorkTotals } from '../lib/customer-work-summary.js';

const now = Date.parse('2026-10-18T00:00:00Z');
const instructor = '11111111-1111-4111-8111-111111111111';
const otherInstructor = '22222222-2222-4222-8222-222222222222';
const customer = id => ({ id, matched_instructor_id: instructor, created_at: '2026-01-01T00:00:00Z' });
const lesson = (customerId, endsAt, assignedInstructor = instructor, suffix = '19:30') => ({
  customer_id: customerId, instructor_id: assignedInstructor, status: 'confirmed',
  ends_at: endsAt, lesson_date: endsAt.slice(0, 10), start_time: suffix,
});

test('proposals and past confirmed lessons do not count as upcoming', () => {
  const rows = buildCustomerWorkSummary([customer('a')], [{ customer_id: 'a', status: 'first_lesson_confirmed' }], [
    { ...lesson('a', '2030-01-01T00:00:00Z'), status: 'proposed' },
    lesson('a', '2026-10-17T00:00:00Z'),
  ], now);
  assert.equal(rows[0].upcoming_lesson_count, 0);
  assert.equal(rows[0].past_unresolved_lesson_count, 1);
  assert.equal(rows[0].next_lesson, null);
  assert.equal(customerWorkPriority(rows[0], now), 1);
  assert.equal(customerWorkTotals(rows, now).contact, 1);
});

test('future lessons count actual sessions and find nearest session', () => {
  const rows = buildCustomerWorkSummary([customer('a'), customer('b')], [
    { customer_id: 'a', status: 'first_lesson_confirmed' },
    { customer_id: 'b', status: 'schedule_discussion' },
  ], [
    lesson('a', '2030-01-02T00:00:00Z'), lesson('a', '2030-01-01T00:00:00Z'),
    lesson('b', '2030-01-03T00:00:00Z'),
  ], now);
  assert.equal(rows[0].upcoming_lesson_count, 2);
  assert.equal(customerWorkTotals(rows, now).upcoming, 3);
  assert.equal(customerWorkTotals(rows, now).nearest.id, 'a');
  assert.equal(customerWorkTotals(rows, now).nearest.next_lesson.ends_at, '2030-01-01T00:00:00Z');
});

test('completed or closed tasks leave the work queue; changing due date can reopen them', () => {
  const base = customer('a');
  const completed = { ...base, workflow: { status: 'consulting', task_title: '연락', task_due_at: '2026-10-17T00:00:00Z', task_completed_at: '2026-10-17T01:00:00Z' } };
  assert.equal(customerWorkPriority(completed, now), 4);
  assert.equal(customerWorkPriority({ ...completed, workflow: { ...completed.workflow, task_completed_at: null } }, now), 0);
  assert.equal(customerWorkPriority({ ...completed, workflow: { ...completed.workflow, status: 'closed', task_completed_at: null } }, now), 5);
});

test('reassigned future lessons are flagged without counting as current instructor lessons', () => {
  const rows = buildCustomerWorkSummary([customer('a')], [{ customer_id: 'a', status: 'closed' }], [
    lesson('a', '2030-01-01T00:00:00Z', otherInstructor),
  ], now);
  assert.equal(rows[0].upcoming_lesson_count, 0);
  assert.equal(rows[0].reassigned_future_lesson_count, 1);
  assert.equal(rows[0].closed_with_future_lesson, true);
  assert.equal(customerWorkTotals(rows, now).upcoming, 0);
});
