import { NextResponse } from "next/server";
import { hasAdminSession } from "../../../../lib/admin-session";
import { createAdminSupabase } from "../../../../lib/admin-supabase";

export const runtime = "nodejs";

export async function GET() {
  if (!(await hasAdminSession())) return NextResponse.json({ error: "관리자 로그인이 필요합니다." }, { status: 401 });
  try {
    const supabase = createAdminSupabase();
    const instructors = await supabase
      .from("instructors")
      .select("id,name,username,is_approved,created_at")
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

    return NextResponse.json({ instructors: instructors.data ?? [], customers: customers.data ?? [] });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 503 });
  }
}
