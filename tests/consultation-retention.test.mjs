import test from 'node:test';
import assert from 'node:assert/strict';
import { consultationRetentionReviewAfter } from '../lib/consultation-retention.js';

const customer = { consultation_source: 'direct', consultation_status: 'closed' };
const closed = [{ action: 'status', after_data: { status: 'closed' }, created_at: '2026-11-01T00:00:00Z' }];

test('only a closed direct consultation with a recorded closing date has a review date', () => {
  assert.equal(consultationRetentionReviewAfter({ ...customer, consultation_status: 'registered' }, closed), null);
  assert.equal(consultationRetentionReviewAfter({ ...customer, consultation_source: null }, closed), null);
  assert.equal(consultationRetentionReviewAfter(customer, []), null);
});

test('90-day review starts from the later of closing and last contact', () => {
  assert.equal(consultationRetentionReviewAfter(customer, closed), '2027-01-30T00:00:00.000Z');
  assert.equal(consultationRetentionReviewAfter(customer, closed, '2026-11-10T00:00:00Z'), '2027-02-08T00:00:00.000Z');
  assert.equal(consultationRetentionReviewAfter(customer, closed, '2026-10-20T00:00:00Z'), '2027-01-30T00:00:00.000Z');
});
