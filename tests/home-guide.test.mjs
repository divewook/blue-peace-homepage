import assert from 'node:assert/strict';
import test from 'node:test';
import { courseCatalog } from '../lib/booking-options.js';
import { educationCards, startingGoals } from '../lib/home-guide.js';

test('처음 시작하기 선택은 실제 등록 과정으로만 연결된다', () => {
  const ids = new Set(courseCatalog.map(course => course.id));
  assert.equal(startingGoals.length, 6);
  for (const goal of startingGoals) {
    assert.ok(goal.label && goal.description);
    for (const courseId of goal.courseIds) assert.ok(ids.has(courseId), `${goal.id}: ${courseId}`);
  }
  assert.deepEqual(startingGoals.find(goal => goal.id === 'unsure').courseIds, []);
});

test('일곱 교육 안내 카드가 기존 상담 과정과 유효한 세부 과정을 사용한다', () => {
  assert.equal(educationCards.length, 7);
  for (const card of educationCards) {
    const course = courseCatalog.find(item => item.id === card.courseId);
    assert.ok(course && card.title && card.image.startsWith('/'));
    for (const levelId of card.levelIds || []) assert.ok(course.levels.some(level => level.id === levelId));
  }
});

test('확정된 프리다이빙 네 가지 가격을 공통 과정 원본에서도 사용한다', () => {
  const levels = Object.fromEntries(courseCatalog.find(course => course.id === 'freediving').levels.map(level => [level.id, level]));
  assert.equal(levels.trial.price, '5만원');
  assert.equal(levels.level1.price, '15만원');
  assert.equal(levels.level2.price, '30만원');
  assert.equal(levels.package12.price, '40만원');
  assert.match(levels.level1.issuance, /발급비 포함/);
  assert.match(levels.level2.issuance, /발급비 포함/);
  assert.match(levels.package12.issuance, /발급비 포함/);
});
