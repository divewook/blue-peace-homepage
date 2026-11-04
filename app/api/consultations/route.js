import { after, NextResponse } from 'next/server';
import { createAdminSupabase } from '../../../lib/admin-supabase';
import { displayDirectCourse, validateDirectConsultation } from '../../../lib/direct-consultation';
import { parseMarketingAttribution } from '../../../lib/marketing-attribution';
import { sendKakaoAlimtalk } from '../../../lib/kakao-alimtalk';

export const runtime = 'nodejs';
const noStore = { 'Cache-Control': 'private, no-store' };

export async function POST(request) {
  if (process.env.BLUEPEACE_PUBLIC_DEMO === 'true') return NextResponse.json({ error: '공개 미리보기에서는 실제 상담을 접수하지 않습니다.' }, { status: 403, headers: noStore });
  const body = await request.json().catch(() => null);
  const invalid = validateDirectConsultation(body);
  if (invalid) return NextResponse.json({ error: invalid }, { status: 400, headers: noStore });
  try {
    const db = createAdminSupabase();
    const existing = await db.from('customers').select('id,request_status').eq('request_key', body.request_key).maybeSingle();
    if (existing.error) throw existing.error;
    if (existing.data) return NextResponse.json({ id: existing.data.id, duplicate: true, status: existing.data.request_status }, { headers: noStore });
    const { first, latest } = body.marketing_accepted === true
      ? parseMarketingAttribution(body.attribution, new URL(request.url).origin)
      : { first: null, latest: null };
    const level = body.level_id || null;
    const course = displayDirectCourse(body.interest_id, level);
    const insert = {
      name: body.name.trim(), phone: body.phone, course,
      pool: '상담 후 협의', time_slot: '상담 후 협의', matched_instructor: '배정 대기',
      matched_instructor_id: null, request_status: 'pending_assignment',
      schedule_mode: 'flexible', schedule_alternatives: [], request_key: body.request_key,
      consultation_source: 'direct', consultation_status: 'new',
      interest_course_id: body.interest_id, interest_level_id: level,
      interest_goal: body.goal_id || null, contact_window: body.contact_window || null,
      inquiry_text: body.inquiry_text.trim() || null,
      privacy_consent_version: '2026-11-04', privacy_consent_at: new Date().toISOString(),
      marketing_consent: body.marketing_accepted === true,
      landing_url: first?.landing_url || null, referrer_url: first?.referrer_url || null,
      traffic_source: first?.traffic_source || null, traffic_medium: first?.traffic_medium || null,
      traffic_campaign: first?.traffic_campaign || null, traffic_term: first?.traffic_term || null,
      traffic_content: first?.traffic_content || null, device_type: first?.device_type || null,
      naver_keyword: first?.naver_keyword || null, naver_query: first?.naver_query || null,
      naver_ad_group: first?.naver_ad_group || null, naver_ad: first?.naver_ad || null,
      attribution_latest: latest,
    };
    const saved = await db.from('customers').insert(insert).select('id').single();
    if (saved.error) {
      if (saved.error.code === '23505') {
        const duplicate = await db.from('customers').select('id,request_status').eq('request_key', body.request_key).maybeSingle();
        if (duplicate.data) return NextResponse.json({ id: duplicate.data.id, duplicate: true, status: duplicate.data.request_status }, { headers: noStore });
      }
      throw saved.error;
    }
    after(async () => {
      await sendKakaoAlimtalk({ eventType: 'match_requested', recipientRole: 'admin', phone: process.env.KAKAO_ADMIN_PHONE,
        variables: { customerName: body.name.trim(), instructorName: '대표 상담', course, pool: '상담 후 협의', schedule: '연락 시간 선호 확인' } });
    });
    return NextResponse.json({ id: saved.data.id, status: 'pending_assignment' }, { status: 201, headers: noStore });
  } catch {
    return NextResponse.json({ error: '상담 신청을 저장하지 못했습니다. 잠시 후 다시 시도해 주세요.' }, { status: 503, headers: noStore });
  }
}
