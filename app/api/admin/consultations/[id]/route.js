import { NextResponse } from 'next/server';
import { adminSessionFingerprint } from '../../../../../lib/admin-session';
import { createAdminSupabase } from '../../../../../lib/admin-supabase';
import { canInstructorTeachCourse, instructorPublicFields } from '../../../../../lib/instructor-fields';
import { courseForInterest, intakeStatuses, requestKeyPattern } from '../../../../../lib/direct-consultation';

export const runtime = 'nodejs';
const fail = (error,status) => NextResponse.json({error},{status,headers:{'Cache-Control':'private, no-store'}});
function canTeachCategory(instructor,name) {
  const saved=instructor?.course_levels?.[name];
  return Array.isArray(saved)?saved.some(value=>value&&value!=='교육 불가'):typeof saved==='string'&&saved!=='교육 불가';
}
export async function PATCH(request,{params}) {
  const actor=await adminSessionFingerprint();
  if(!actor)return fail('관리자 로그인이 필요합니다.',401);
  const {id}=await params;
  if(!requestKeyPattern.test(id||''))return fail('신청을 찾을 수 없습니다.',404);
  const body=await request.json().catch(()=>null);
  if(!body||!Number.isInteger(body.revision)||body.revision<0||!requestKeyPattern.test(body.requestKey||'')||!['status','assign'].includes(body.action))return fail('변경 요청을 확인해 주세요.',400);
  if(body.action==='status' && !Object.hasOwn(intakeStatuses,body.status))return fail('상담 상태를 확인해 주세요.',400);
  if(body.action==='assign' && !requestKeyPattern.test(body.instructorId||''))return fail('담당 강사를 선택해 주세요.',400);
  try {
    const db=createAdminSupabase();
    const application=await db.from('customers').select('id,consultation_source,interest_course_id,interest_level_id').eq('id',id).maybeSingle();
    if(application.error)throw application.error;
    if(!application.data)return fail('신청을 찾을 수 없습니다.',404);
    if(application.data.consultation_source!=='direct')return fail('기존 자동 매칭 신청은 이 화면에서 변경할 수 없습니다.',409);
    if(body.action==='assign'){
      const lookup=await db.from('instructors').select(`${instructorPublicFields},is_approved`).eq('id',body.instructorId).maybeSingle();
      if(lookup.error)throw lookup.error;
      if(!lookup.data?.is_approved)return fail('현재 승인된 강사를 선택해 주세요.',409);
      const course=courseForInterest(application.data.interest_course_id);
      if(course){
        const selectedLevel=course.levels.find(item=>item.id===application.data.interest_level_id);
        const fits=selectedLevel?canInstructorTeachCourse(lookup.data,course.name,selectedLevel.name):canTeachCategory(lookup.data,course.name);
        if(!fits)return fail('선택한 교육과정의 강사 교육 가능 범위를 확인해 주세요.',409);
      }
    }
    const changed=await db.rpc('save_customer_direct_consultation',{
      p_customer:id,p_expected_revision:body.revision,p_action:body.action,
      p_status:body.action==='status'?body.status:null,p_instructor:body.action==='assign'?body.instructorId:null,
      p_request_key:body.requestKey,p_actor_session:actor,
    });
    if(changed.error){
      const message=changed.error.message||'';
      if(message.includes('stale_revision')||message.includes('already_assigned'))return fail('다른 화면에서 신청이 변경되었습니다. 다시 불러와 주세요.',409);
      if(message.includes('instructor_unavailable'))return fail('현재 승인된 강사가 아닙니다.',409);
      if(message.includes('request_key_conflict'))return fail('이 요청 식별자가 다른 변경에 사용되었습니다.',409);
      throw changed.error;
    }
    return NextResponse.json({customer:changed.data},{headers:{'Cache-Control':'private, no-store'}});
  }catch{return fail('상담 변경을 저장하지 못했습니다.',503);}
}
