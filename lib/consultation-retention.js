const ninetyDaysMs = 90 * 24 * 60 * 60 * 1000;

export function consultationRetentionReviewAfter(customer, statusEvents = [], lastContactAt = null) {
  if (customer?.consultation_source !== 'direct' || customer.consultation_status !== 'closed') return null;
  const closure = statusEvents.find(event => event.action === 'status' && event.after_data?.status === 'closed');
  const closedAt = Date.parse(closure?.created_at || '');
  if (!Number.isFinite(closedAt)) return null;
  const contactAt = Date.parse(lastContactAt || '');
  const anchor = Math.max(closedAt, Number.isFinite(contactAt) ? contactAt : closedAt);
  return new Date(anchor + ninetyDaysMs).toISOString();
}
