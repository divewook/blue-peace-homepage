import { NextResponse } from "next/server";
import { hasAdminSession } from "../../../../../lib/admin-session";
import { createAdminSupabase } from "../../../../../lib/admin-supabase";

export const runtime = "nodejs";

export async function DELETE(_request, { params }) {
  if (!(await hasAdminSession())) return NextResponse.json({ error: "관리자 로그인이 필요합니다." }, { status: 401 });
  const { id } = await params;
  if (!id) return NextResponse.json({ error: "강사 ID가 없습니다." }, { status: 400 });
  try {
    const { data, error } = await createAdminSupabase()
      .from("instructors")
      .delete()
      .eq("id", id)
      .select("id");
    if (error) return NextResponse.json({ error: error.message }, { status: 409 });
    if (!data?.length) return NextResponse.json({ error: "삭제된 계정이 없습니다. 목록을 새로고침해 확인해 주세요." }, { status: 404 });
    return NextResponse.json({ deletedId: id });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 503 });
  }
}

export async function PATCH(request, { params }) {
  if (!(await hasAdminSession())) return NextResponse.json({ error: "관리자 로그인이 필요합니다." }, { status: 401 });
  const { id } = await params;
  const { is_approved } = await request.json().catch(() => ({}));
  if (!id || typeof is_approved !== "boolean") return NextResponse.json({ error: "잘못된 승인 요청입니다." }, { status: 400 });
  try {
    const { data, error } = await createAdminSupabase()
      .from("instructors")
      .update({ is_approved })
      .eq("id", id)
      .select("id,is_approved");
    if (error) return NextResponse.json({ error: error.message }, { status: 409 });
    if (!data?.length) return NextResponse.json({ error: "계정을 찾지 못했습니다." }, { status: 404 });
    return NextResponse.json({ instructor: data[0] });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 503 });
  }
}

