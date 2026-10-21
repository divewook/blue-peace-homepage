import { NextResponse } from "next/server";
import { createAdminSupabase } from "../../../../lib/admin-supabase";
import { getInstructorSessionId } from "../../../../lib/instructor-session";
import { enrichCustomerWork } from "../../../../lib/customer-work-summary";
import { instructorCustomerFields } from "../../../../lib/customer-fields";

export const runtime = "nodejs";

export async function GET() {
  const instructorId = await getInstructorSessionId();
  if (!instructorId) return NextResponse.json({ error: "강사 로그인이 필요합니다." }, { status: 401 });
  try {
    const supabase = createAdminSupabase();
    const { data: instructor, error: instructorError } = await supabase
      .from("instructors").select("id,is_approved").eq("id", instructorId).maybeSingle();
    if (instructorError || !instructor?.is_approved) {
      return NextResponse.json({ error: "강사 계정을 확인할 수 없습니다." }, { status: 403 });
    }
    const { data, error } = await supabase.from("customers").select(instructorCustomerFields)
      .eq("matched_instructor_id", instructorId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return NextResponse.json({ customers: await enrichCustomerWork(supabase, data ?? []) });
  } catch {
    return NextResponse.json({ error: "매칭 내역을 불러오지 못했습니다." }, { status: 503 });
  }
}
