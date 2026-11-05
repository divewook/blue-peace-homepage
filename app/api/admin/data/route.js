import { NextResponse } from "next/server";
import { hasAdminSession } from "../../../../lib/admin-session";
import { createAdminSupabase } from "../../../../lib/admin-supabase";
import { enrichCustomerWork } from "../../../../lib/customer-work-summary";

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
      ? await supabase.from('customer_direct_alerts').select('customer_id,status,attempts,updated_at').in('customer_id', directIds)
      : { data: [], error: null };
    if (alertRows.error) return NextResponse.json({ error: '상담 알림 상태를 불러오지 못했습니다.' }, { status: 503 });
    const alertByCustomer = new Map((alertRows.data ?? []).map(item => [item.customer_id, item]));
    const enriched = await enrichCustomerWork(supabase, customerRows);
    return NextResponse.json({ instructors: instructors.data ?? [],
      customers: enriched.map(item => ({ ...item, delivery_event: deliveryByCustomer.get(item.id) ?? null, direct_alert: alertByCustomer.get(item.id) ?? null })) },
      { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 503 });
  }
}
