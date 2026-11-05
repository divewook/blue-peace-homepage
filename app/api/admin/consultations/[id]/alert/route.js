import { after, NextResponse } from 'next/server';
import { hasAdminSession } from '../../../../../../lib/admin-session';
import { createAdminSupabase } from '../../../../../../lib/admin-supabase';
import { deliverDirectConsultationAlert } from '../../../../../../lib/direct-consultation-alert';
import { requestKeyPattern } from '../../../../../../lib/direct-consultation';

export const runtime = 'nodejs';
export async function POST(_request, { params }) {
  if (!(await hasAdminSession())) return NextResponse.json({ error: '관리자 로그인이 필요합니다.' }, { status: 401 });
  const { id } = await params;
  if (!requestKeyPattern.test(id || '')) return NextResponse.json({ error: '신청을 찾을 수 없습니다.' }, { status: 404 });
  const db = createAdminSupabase();
  const job = await db.from('customer_direct_alerts').select('status').eq('customer_id', id).maybeSingle();
  if (job.error || !job.data) return NextResponse.json({ error: '알림 기록을 찾을 수 없습니다.' }, { status: 404 });
  if (job.data.status === 'pending') {
    after(() => deliverDirectConsultationAlert(id));
    return NextResponse.json({ status:'pending' }, { status: 202, headers:{'Cache-Control':'private, no-store'} });
  }
  if (!['skipped', 'failed'].includes(job.data.status)) return NextResponse.json({ error: '현재 알림은 다시 시도할 수 없습니다.' }, { status: 409 });
  const update = await db.from('customer_direct_alerts').update({ status:'pending', last_error:null, updated_at:new Date().toISOString() }).eq('customer_id', id).eq('status', job.data.status).select('customer_id').maybeSingle();
  if (update.error || !update.data) return NextResponse.json({ error: '다른 관리자 작업이 먼저 처리되었습니다.' }, { status: 409 });
  after(() => deliverDirectConsultationAlert(id));
  return NextResponse.json({ status:'pending' }, { status: 202, headers:{'Cache-Control':'private, no-store'} });
}
