import { NextResponse } from 'next/server';
import { hasAdminSession } from '../../../../../lib/admin-session';
import { createAdminSupabase } from '../../../../../lib/admin-supabase';

export const runtime = 'nodejs';

export async function DELETE(_request, { params }) {
  if (!(await hasAdminSession())) return NextResponse.json({ error: '관리자 로그인이 필요합니다.' }, { status: 401 });
  const { id } = await params;
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id || '')) {
    return NextResponse.json({ error: '신청번호를 확인해 주세요.' }, { status: 400 });
  }
  try {
    const { data, error } = await createAdminSupabase().from('customers').delete().eq('id', id).select('id');
    if (error) throw error;
    if (!data?.length) return NextResponse.json({ error: '신청을 찾을 수 없습니다. 목록을 새로고침해 주세요.' }, { status: 404 });
    return NextResponse.json({ deletedId: id }, { headers: { 'Cache-Control': 'private, no-store' } });
  } catch {
    return NextResponse.json({ error: '신청 이력을 삭제하지 못했습니다. 다시 시도해 주세요.' }, { status: 503 });
  }
}
