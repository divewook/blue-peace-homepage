import assert from 'node:assert/strict';
import test from 'node:test';
import { instructorMobile } from '../lib/assignment-delivery.js';
import { instructorPrivateSafeFields, instructorPublicFields, publicMatchedInstructor } from '../lib/instructor-fields.js';

test('private instructor data includes phone while public instructor fields exclude it', () => {
  assert.ok(instructorPrivateSafeFields.split(',').includes('phone'));
  assert.ok(!instructorPublicFields.split(',').includes('phone'));
  assert.deepEqual(publicMatchedInstructor({ name: '가상 강사', phone: '010-1111-2222' }), { name: '가상 강사' });
  assert.equal(publicMatchedInstructor(null), null);
});

test('signup and profile phone validation matches the SMS recipient rule', () => {
  assert.equal(instructorMobile('010-1111-2222'), '01011112222');
  assert.equal(instructorMobile('012-1111-2222'), null);
  assert.equal(instructorMobile('010-111-222'), null);
  assert.equal(instructorMobile(''), null);
});
