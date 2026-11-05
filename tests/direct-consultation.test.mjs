import test from 'node:test';
import assert from 'node:assert/strict';
import { displayDirectCourse, validateDirectConsultation } from '../lib/direct-consultation.js';

const valid = {
  request_key: 'a1b2c3d4-1234-4123-8123-123456789abc', name: '가상 사용자', phone: '010-1234-5678',
  privacy_accepted: true, interest_id: 'unsure', level_id: '', goal_id: 'unsure',
  contact_window: '', inquiry_text: '',
};

test('course, contact window, and inquiry are optional while identity and consent are required', () => {
  assert.equal(validateDirectConsultation(valid), null);
  assert.match(validateDirectConsultation({ ...valid, name: '' }), /성함/);
  assert.match(validateDirectConsultation({ ...valid, phone: '010-123-4567' }), /휴대폰/);
  assert.match(validateDirectConsultation({ ...valid, privacy_accepted: false }), /동의/);
});

test('course and goal must be recognized; specialty levels cannot cross interests', () => {
  assert.equal(validateDirectConsultation({ ...valid, interest_id: 'special', level_id: 'consult' }), null);
  assert.equal(validateDirectConsultation({ ...valid, interest_id: 'freediving', level_id: 'level1' }), null);
  assert.match(validateDirectConsultation({ ...valid, interest_id: 'scuba', level_id: 'level1' }), /세부/);
  assert.match(validateDirectConsultation({ ...valid, interest_id: 'freediving', level_id: '' }), /세부/);
  assert.equal(validateDirectConsultation({ ...valid, interest_id: 'photo', level_id: 'photo', goal_id: 'special', contact_window: 'evening' }), null);
  assert.match(validateDirectConsultation({ ...valid, interest_id: 'photo', level_id: 'cpr' }), /세부/);
  assert.match(validateDirectConsultation({ ...valid, interest_id: 'unknown' }), /분야/);
  assert.match(validateDirectConsultation({ ...valid, goal_id: 'unknown' }), /관심사/);
  assert.match(validateDirectConsultation({ ...valid, contact_window: 'at 10:00' }), /시간대/);
});

test('request key and message size are validated server side', () => {
  assert.match(validateDirectConsultation({ ...valid, request_key: 'same' }), /식별자/);
  assert.match(validateDirectConsultation({ ...valid, inquiry_text: 'a'.repeat(2001) }), /2,000/);
  assert.equal(displayDirectCourse('freediving','level2'), '프리다이빙 (2레벨 (오픈워터))');
  assert.equal(displayDirectCourse('special','consult'), '스페셜 교육 (상담 후 세부 과정 결정)');
});
