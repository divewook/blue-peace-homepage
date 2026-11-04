import test from 'node:test';
import assert from 'node:assert/strict';
import { verifiedCoursePrice } from '../lib/verified-course-prices.js';
import { courseCatalog } from '../lib/booking-options.js';

test('only operator-confirmed freediving prices are presented as confirmed', () => {
  assert.equal(verifiedCoursePrice('freediving', 'trial'), '50,000원');
  assert.equal(verifiedCoursePrice('freediving', 'level1'), '150,000원');
  assert.equal(verifiedCoursePrice('freediving', 'level2'), '300,000원');
  assert.equal(verifiedCoursePrice('freediving', 'package12'), '400,000원');
  assert.equal(verifiedCoursePrice('freediving', 'level3'), null);
  assert.equal(verifiedCoursePrice('scuba', 'openwater'), null);
  assert.equal(verifiedCoursePrice('mermaid', 'level1'), null);
});

test('unverified catalog prices are not exposed as numerical offers', () => {
  for (const course of courseCatalog) {
    if (course.id !== 'freediving') assert.equal(course.startingPrice, '가격 확인 중');
    for (const level of course.levels) {
      if (course.id === 'freediving' && verifiedCoursePrice(course.id, level.id)) continue;
      assert.doesNotMatch(level.price, /\d+\s*만|\d{2,3},\d{3}/);
    }
  }
});
