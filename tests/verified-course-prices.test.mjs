import test from 'node:test';
import assert from 'node:assert/strict';
import { verifiedCoursePrice } from '../lib/verified-course-prices.js';

test('only operator-confirmed freediving prices are presented as confirmed', () => {
  assert.equal(verifiedCoursePrice('freediving', 'trial'), '50,000원');
  assert.equal(verifiedCoursePrice('freediving', 'level1'), '150,000원');
  assert.equal(verifiedCoursePrice('freediving', 'level2'), '300,000원');
  assert.equal(verifiedCoursePrice('freediving', 'package12'), '400,000원');
  assert.equal(verifiedCoursePrice('freediving', 'level3'), null);
  assert.equal(verifiedCoursePrice('scuba', 'openwater'), null);
  assert.equal(verifiedCoursePrice('mermaid', 'level1'), null);
});
