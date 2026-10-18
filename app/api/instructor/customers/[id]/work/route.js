import { NextResponse } from 'next/server';
import { hasAdminSession } from '../../../../../../lib/admin-session';
import { createAdminSupabase } from '../../../../../../lib/admin-supabase';
import { getInstructorSessionId } from '../../../../../../lib/instructor-session';
import { validateLessonInput, validateWorkflowPatch } from '../../../../../../lib/customer-work';

export const runtime = 'nodejs';
const fail = (error, status) => NextResponse.json({ error }, { status });
async function context(params) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id || '')) return { error: fail('신청을 찾을 수 없습니다.',404) };
  const admin = await hasAdminSession();
  const instructorId = admin ? null : await getInstructorSessionId();
  if (!admin && !instructorId) return { error: fail('로그인이 필요합니다.',401) };
  const db = createAdminSupabase();
  const { data: customer, error } = await db.from('customers').select('*').eq('id',id).maybeSingle();
  if (error) throw error;
  if (!customer) return { error: fail('신청을 찾을 수 없습니다.',404) };
  if (!admin) {
    const { data: instructor } = await db.from('instructors').select('id,is_approved').eq('id',instructorId).maybeSingle();
    if (!instructor?.is_approved || customer.matched_instructor_id !== instructorId) return { error: fail('이 신청에 접근할 수 없습니다.',403) };
  }
  return { db, customer, actorType: admin ? 'admin' : 'instructor', actorId: instructorId };
}
function dbFailure(error) {
  const message = error?.message || '';
  if (message.includes('stale_revision')) return fail('다른 화면에서 변경되었습니다. 새로고침 후 다시 확인해 주세요.',409);
  if (message.includes('instructor_confirmed_lesson_overlap') || error?.code === '23P01') return fail('이 강사의 확정 수업과 시간이 겹칩니다.',409);
  if (message.includes('access_denied') || message.includes('assignment_required')) return fail('현재 담당 강사가 아니거나 배정 정보가 변경되었습니다.',403);
  if (message.includes('lesson_assignment_changed')) return fail('담당 강사가 변경된 수업입니다. 기존 수업을 변경하기 전에 관리자에게 확인해 주세요.',409);
  if (message.includes('request_key_conflict')) return fail('요청 식별자가 다른 변경에 사용되었습니다.',409);
  if (message.includes('change_reason_required')) return fail('변경 사유를 입력해 주세요.',400);
  if (message.includes('travel_confirmation_required')) return fail('같은 날 다른 풀장 수업이 있습니다. 이동 가능 여부와 근거를 기록해 주세요.',409);
  if (message.includes('customer_one_active_first_lesson_idx')) return fail('이 신청에 이미 제안·확정된 첫 수업이 있습니다. 기존 일정을 변경해 주세요.',409);
  if (message.includes('future_confirmed_lesson_exists')) return fail('미래 확정 수업이 남아 있어 상담을 종료할 수 없습니다. 일정을 먼저 확인해 주세요.',409);
  if (message.includes('consultation_closed')) return fail('종료된 상담에는 새 수업을 제안하거나 확정할 수 없습니다. 상담 상태를 먼저 정정해 주세요.',409);
  if (message.includes('confirmed_lesson_required')) return fail('확정 수업이 없어 첫 수업 확정 상태로 변경할 수 없습니다.',409);
  return fail('저장하지 못했습니다. 입력값과 최신 신청 상태를 확인해 주세요.',500);
}
export async function GET(_request,{params}) {
  try {
    const ctx=await context(params); if(ctx.error) return ctx.error;
    const [workflow,lessons,events] = await Promise.all([
      ctx.db.from('customer_workflows').select('*').eq('customer_id',ctx.customer.id).maybeSingle(),
      ctx.db.from('customer_lessons').select('*').eq('customer_id',ctx.customer.id).order('created_at',{ascending:false}),
      ctx.db.from('customer_workflow_events').select('*').eq('customer_id',ctx.customer.id).order('created_at',{ascending:false}).limit(50),
    ]);
    if(workflow.error || lessons.error || events.error) throw workflow.error || lessons.error || events.error;
    const now=Date.now();
    return NextResponse.json({customer:ctx.customer,workflow:workflow.data,
      lessons:(lessons.data||[]).map(item=>({...item,is_past:item.status==='confirmed'&&new Date(item.ends_at).getTime()<now})),events:events.data||[]});
  } catch { return fail('업무 정보를 불러오지 못했습니다.',503); }
}
export async function PATCH(request,{params}) {
  try {
    const ctx=await context(params); if(ctx.error) return ctx.error;
    const body=await request.json();
    if(!Number.isInteger(body.revision) || body.revision<0 || !/^[0-9a-f-]{36}$/i.test(body.requestKey||'')) return fail('최신 수정 번호와 요청 식별자를 확인해 주세요.',400);
    const error=validateWorkflowPatch(body.patch); if(error) return fail(error,400);
    const {data,error:dbError}=await ctx.db.rpc('save_customer_workflow',{
      p_customer:ctx.customer.id,p_actor_type:ctx.actorType,p_actor_id:ctx.actorId,
      p_expected_revision:body.revision,p_patch:body.patch,p_request_key:body.requestKey,
    });
    if(dbError) return dbFailure(dbError);
    return NextResponse.json({workflow:data});
  } catch { return fail('상담 정보를 저장하지 못했습니다.',503); }
}
export async function POST(request,{params}) {
  try {
    const ctx=await context(params); if(ctx.error) return ctx.error;
    const body=await request.json();
    if(!Number.isInteger(body.revision) || body.revision<0 || !/^[0-9a-f-]{36}$/i.test(body.requestKey||'')) return fail('최신 수정 번호와 요청 식별자를 확인해 주세요.',400);
    const lessonId=body.lessonId || null;
    const [instructorResult, existingResult, confirmedResult] = await Promise.all([
      ctx.db.from('instructors').select('*').eq('id',ctx.customer.matched_instructor_id).maybeSingle(),
      lessonId ? ctx.db.from('customer_lessons').select('*').eq('id',lessonId).eq('customer_id',ctx.customer.id).maybeSingle() : Promise.resolve({data:null}),
      ctx.db.from('customer_lessons').select('id,status,pool_id,lesson_date').eq('instructor_id',ctx.customer.matched_instructor_id).eq('status','confirmed'),
    ]);
    if(!instructorResult.data || instructorResult.error || confirmedResult.error) return fail('담당 강사 정보를 확인하지 못했습니다.',503);
    if(lessonId && !existingResult.data) return fail('수업을 찾을 수 없습니다.',404);
    const lessonPayload=body.lesson?.status==='cancelled'&&existingResult.data
      ? {...existingResult.data,status:'cancelled',change_reason:body.lesson.change_reason}
      : body.lesson;
    const validation=validateLessonInput(lessonPayload,ctx.customer,instructorResult.data,existingResult.data,confirmedResult.data||[]);
    if(validation) return fail(validation,400);
    const {data,error}=await ctx.db.rpc('save_customer_lesson',{
      p_customer:ctx.customer.id,p_lesson:lessonId,p_actor_type:ctx.actorType,p_actor_id:ctx.actorId,
      p_expected_revision:body.revision,p_payload:lessonPayload,p_request_key:body.requestKey,
    });
    if(error) return dbFailure(error);
    return NextResponse.json({lesson:data});
  } catch { return fail('수업 일정을 저장하지 못했습니다.',503); }
}
