import { NextResponse } from "next/server";
import { createAdminSupabase } from "../../../../lib/admin-supabase";
import { instructorPublicFields } from "../../../../lib/instructor-fields";

export const runtime = "nodejs";

export async function GET() {
  try {
    const { data, error } = await createAdminSupabase().from("instructors")
      .select(instructorPublicFields).eq("is_approved", true);
    if (error) throw error;
    return NextResponse.json({ instructors: data || [] });
  } catch {
    return NextResponse.json({ error: "강사 정보를 불러오지 못했습니다." }, { status: 503 });
  }
}
