import 'server-only';
import { createAdminSupabase } from './admin-supabase';
import { sendSolapiConsultationSms } from './solapi-sms';

// The insert trigger creates the job atomically with the consultation.
// A conditional pending -> sending claim prevents concurrent sends.
export async function deliverDirectConsultationAlert(customerId) {
  const db = createAdminSupabase();
  const claim = await db.rpc('claim_direct_consultation_alert', { p_customer: customerId });
  if (claim.error || claim.data !== true) return { status: 'not_claimed' };
  let delivery = { status: 'unknown', errorCode: 'delivery_state_unknown' };
  try {
    const result = await db.from('customers').select('name,course,contact_window').eq('id', customerId).single();
    if (result.error) throw result.error;
    delivery = await sendSolapiConsultationSms({ name: result.data.name, course: result.data.course, contactWindow: result.data.contact_window });
  } catch { delivery = { status: 'unknown', errorCode: 'delivery_state_unknown' }; }
  const update = await db.from('customer_direct_alerts').update({
    status: delivery.status, last_error: delivery.errorCode || null,
    provider: 'solapi', provider_message_id: delivery.messageId || null,
    provider_group_id: delivery.groupId || null, updated_at: new Date().toISOString(),
  }).eq('customer_id', customerId).eq('status', 'sending');
  // A failed DB update leaves 'sending' visible for manual provider reconciliation.
  // Never fire a second request to compensate for a lost update.
  if (update.error) return { status: 'unknown' };
  return { status: delivery.status };
}
