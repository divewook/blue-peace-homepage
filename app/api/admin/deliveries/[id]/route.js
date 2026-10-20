import { NextResponse } from "next/server";
import { hasAdminSession, adminSessionFingerprint } from "../../../../../lib/admin-session";
import { createAdminSupabase } from "../../../../../lib/admin-supabase";

export const runtime = "nodejs";

export async function POST(request, { params }) {
  if (!(await hasAdminSession())) return NextResponse.json({ error: "관리자 로그인이 필요합니다." }, { status: 401 });
  const origin = request.headers.get("origin");
  if (origin && origin !== request.nextUrl.origin)
    return NextResponse.json({ error: "요청 출처를 확인할 수 없습니다." }, { status: 403 });
  const { id } = await params;
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id))
    return NextResponse.json({ error: "신청번호가 올바르지 않습니다." }, { status: 400 });
  const body = await request.json().catch(() => null);
  if (!body || !["marked", "unmarked"].includes(body.action) ||
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(body.instructorId || "") ||
    !Number.isInteger(body.assignmentGeneration) || body.assignmentGeneration < 0 ||
    !(body.expectedEventId === null || Number.isSafeInteger(body.expectedEventId)) ||
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(body.requestKey || ""))
    return NextResponse.json({ error: "전달 상태 요청을 확인해 주세요." }, { status: 400 });
  try {
    const { data, error } = await createAdminSupabase().rpc("record_customer_assignment_delivery", {
      p_customer: id, p_expected_instructor: body.instructorId,
      p_expected_generation: body.assignmentGeneration, p_action: body.action,
      p_expected_event_id: body.expectedEventId, p_request_key: body.requestKey,
      p_actor_session: await adminSessionFingerprint(),
    });
    if (error) {
      const message = error.message || "";
      if (message.includes("assignment_changed") || message.includes("stale_delivery_state"))
        return NextResponse.json({ error: "배정이나 전달 상태가 변경됐습니다. 목록을 다시 불러와 확인해 주세요." }, { status: 409 });
      if (message.includes("application_not_found")) return NextResponse.json({ error: "신청을 찾을 수 없습니다." }, { status: 404 });
      if (message.includes("delivery_state_unchanged")) return NextResponse.json({ error: "이미 같은 전달 상태입니다. 목록을 새로고침해 주세요." }, { status: 409 });
      return NextResponse.json({ error: "전달 상태를 저장하지 못했습니다." }, { status: 503 });
    }
    return NextResponse.json({ event: { id: data.id, customer_id: data.customer_id,
      instructor_id: data.instructor_id, assignment_generation: data.assignment_generation,
      action: data.action, created_at: data.created_at, actor_identifier: data.actor_identifier } });
  } catch {
    return NextResponse.json({ error: "전달 상태를 저장하지 못했습니다." }, { status: 503 });
  }
}
