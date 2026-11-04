// Prices confirmed by the operator on 2026-11-04 for the new homepage.
// Historic catalog prices remain in booking-options for old request records.
export const verifiedFreedivingPrices = Object.freeze({
  trial: '50,000원',
  level1: '150,000원',
  level2: '300,000원',
  package12: '400,000원',
});

export function verifiedCoursePrice(courseId, levelId) {
  return courseId === 'freediving' ? verifiedFreedivingPrices[levelId] || null : null;
}
