import { NextResponse } from "next/server";
import { hasAdminSession } from "../../../../lib/admin-session";
import { createAdminSupabase } from "../../../../lib/admin-supabase";
import { enrichCustomerWork } from "../../../../lib/customer-work-summary";
import { consultationRetentionReviewAfter } from "../../../../lib/consultation-retention";

export const runtime = "nodejs";

export async function GET() {
  if (!(await hasAdminSession())) return NextResponse.json({ error: "관리자 로그인이 필요합니다." }, { status: 401 });
  try {
    const supabase = createAdminSupabase();
    const instructors = await supabase
      .from("instructors")
      .select("id,name,username,phone,is_approved,created_at,course_levels,can_passnine,can_miryang")
      .order("created_at", { ascending: false });
    if (instructors.error) {
      return NextResponse.json({ error: instructors.error.message }, { status: 500 });
    }

    const customers = await supabase
      .from("customers")
      .select("*")
      .order("created_at", { ascending: false });
    if (customers.error) {
      return NextResponse.json({ error: customers.error.message }, { status: 500 });
    }
    const customerRows = customers.data ?? [];
    const customerById = new Map(customerRows.map(item => [item.id, item]));
    let deliveryByCustomer = new Map();
    if (customerRows.length) {
      const deliveries = await supabase.from("customer_assignment_delivery_events")
        .select("id,customer_id,instructor_id,assignment_generation,action,created_at,actor_identifier")
        .in("customer_id", customerRows.map(item => item.id)).order("id", { ascending: false });
      if (deliveries.error) return NextResponse.json({ error: "전달 상태를 불러오지 못했습니다." }, { status: 503 });
      deliveryByCustomer = new Map();
      for (const event of deliveries.data ?? []) {
        const customer = customerById.get(event.customer_id);
        if (customer?.matched_instructor_id === event.instructor_id &&
          customer.assignment_generation === event.assignment_generation &&
          !deliveryByCustomer.has(event.customer_id)) deliveryByCustomer.set(event.customer_id, event);
      }
    }
    const directIds = customerRows.filter(item => item.consultation_source === 'direct').map(item => item.id);
    const alertRows = directIds.length
      ? await supabase.from('customer_direct_alerts').select('customer_id,status,attempts,updated_at,provider_message_id,provider_group_id').in('customer_id', directIds)
      : { data: [], error: null };
    if (alertRows.error) return NextResponse.json({ error: '상담 알림 상태를 불러오지 못했습니다.' }, { status: 503 });
    const alertByCustomer = new Map((alertRows.data ?? []).map(item => [item.customer_id, item]));
    const closedDirectIds = customerRows.filter(item => item.consultation_source === 'direct' && item.consultation_status === 'closed').map(item => item.id);
    const [closingEvents, contactRows] = closedDirectIds.length
      ? await Promise.all([
        supabase.from('customer_consultation_events').select('customer_id,action,after_data,created_at')
          .in('customer_id', closedDirectIds).eq('action', 'status').order('created_at', { ascending: false }),
        supabase.from('customer_workflows').select('customer_id,last_contact_at').in('customer_id', closedDirectIds),
      ])
      : [{ data: [], error: null }, { data: [], error: null }];
    if (closingEvents.error || contactRows.error) return NextResponse.json({ error: '상담 보관 점검일을 불러오지 못했습니다.' }, { status: 503 });
    const lastClosedEvent = new Map();
    for (const event of closingEvents.data ?? []) {
      if (event.after_data?.status === 'closed' && !lastClosedEvent.has(event.customer_id)) lastClosedEvent.set(event.customer_id, event);
    }
    const lastContactByCustomer = new Map((contactRows.data ?? []).map(item => [item.customer_id, item.last_contact_at]));
    const enriched = await enrichCustomerWork(supabase, customerRows);
    return NextResponse.json({ instructors: instructors.data ?? [],
      customers: enriched.map(item => ({ ...item, delivery_event: deliveryByCustomer.get(item.id) ?? null, direct_alert: alertByCustomer.get(item.id) ?? null,
        retention_review_after: consultationRetentionReviewAfter(item, lastClosedEvent.has(item.id) ? [lastClosedEvent.get(item.id)] : [], lastContactByCustomer.get(item.id)) })) },
      { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 503 });
  }
}
