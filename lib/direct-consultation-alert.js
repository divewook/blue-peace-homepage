import 'server-only';
import { createAdminSupabase } from './admin-supabase';
import { sendKakaoAlimtalk } from './kakao-alimtalk';

// The insert trigger creates the job atomically with the customer record.
// Only the pending -> sending transition can claim it, so duplicate responses
// and concurrent callbacks never submit a second provider request.
export async function deliverDirectConsultationAlert(customerId) {
  const db = createAdminSupabase();
  const claim = await db.rpc('claim_direct_consultation_alert', { p_customer: customerId });
  if (claim.error || claim.data !== true) return { status: 'not_claimed' };
  let status = 'failed';
  let errorCode = 'delivery_failed';
  try {
    const result = await db.from('customers').select('name,course,contact_window').eq('id', customerId).single();
    if (result.error) throw result.error;
    const alert = await sendKakaoAlimtalk({
      eventType: 'match_requested', recipientRole: 'admin', phone: process.env.KAKAO_ADMIN_PHONE,
      variables: { customerName: result.data.name, course: result.data.course,
        contactWindow: result.data.contact_window || '미선택', instructorName: '대표 상담',
        pool: '상담 후 협의', schedule: '상담 후 협의' },
    });
    status = alert.status === 'sent' ? 'sent' : alert.status === 'skipped' ? 'skipped' : 'failed';
    errorCode = status === 'skipped' ? 'provider_not_configured' : status === 'failed' ? 'provider_failed' : null;
  } catch { errorCode = 'delivery_failed'; }
  await db.from('customer_direct_alerts').update({ status, last_error: errorCode, updated_at: new Date().toISOString() }).eq('customer_id', customerId).eq('status', 'sending');
  return { status };
}
