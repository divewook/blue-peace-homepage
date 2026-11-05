'use client';
import { useState } from 'react';
import { contactWindowLabels, courseForInterest, intakeStatuses, interestLabels } from '../lib/direct-consultation';
import { goalById } from '../lib/home-guide';

type Instructor = { id:string; name:string; is_approved:boolean; course_levels?:Record<string,string|string[]>; can_passnine?:boolean; can_miryang?:boolean };
type Consultation = { id:string; consultation_status?:string|null; consultation_revision?:number; interest_course_id?:string|null; interest_level_id?:string|null; interest_goal?:string|null; contact_window?:string|null; inquiry_text?:string|null; matched_instructor_id?:string|null };
export default function DirectConsultationAdmin({customer,alert,instructors,onChanged}:{customer:Consultation;alert?:{status:string;attempts:number;provider_message_id?:string|null;provider_group_id?:string|null}|null;instructors:Instructor[];onChanged?:()=>void}){
  const [status,setStatus]=useState(customer.consultation_status||'new');
  const [instructorId,setInstructorId]=useState('');
  const [busy,setBusy]=useState(false);
  const [message,setMessage]=useState('');
  async function save(action:'status'|'assign'){
    if(busy)return;setBusy(true);setMessage('');
    try{
      const response=await fetch(`/api/admin/consultations/${encodeURIComponent(customer.id)}`,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({action,status,instructorId,revision:customer.consultation_revision||0,requestKey:crypto.randomUUID()})});
      const result=await response.json();
      if(!response.ok)throw new Error(result.error||'변경 사항을 저장하지 못했습니다.');
      setMessage(action==='assign'?'담당 강사를 배정했습니다.':'상담 상태를 저장했습니다.');onChanged?.();
    }catch(cause){setMessage(cause instanceof Error?cause.message:'변경 사항을 저장하지 못했습니다.');}
    finally{setBusy(false);}
  }
  async function retryAlert(){
    if(busy)return;
    if(alert?.status==='failed' && !window.confirm('업체에서 실제 발송되지 않았는지 확인했나요? 확인 후 다시 시도해 주세요.'))return;
    setBusy(true);setMessage('');
    try{
      const response=await fetch(`/api/admin/consultations/${encodeURIComponent(customer.id)}/alert`,{method:'POST'});
      const result=await response.json();
      if(!response.ok)throw new Error(result.error||'알림 재시도 요청에 실패했습니다.');
      setMessage('알림 재시도를 접수했습니다. 상태를 새로고침해 확인해 주세요.');onChanged?.();
    }catch(cause){setMessage(cause instanceof Error?cause.message:'알림 재시도 요청에 실패했습니다.');}
    finally{setBusy(false);}
  }
  return <section className="mt-3 rounded-xl border border-teal-200 bg-white p-4 text-sm leading-7"><h5 className="text-base font-black text-teal-950">대표 직접 상담</h5>
    <div className="mt-2 rounded-xl bg-slate-50 p-3 text-sm"><p className="font-bold">대표 SMS: {alert?.status==='sent'?'SOLAPI 접수 기록':alert?.status==='failed'?'접수 실패':alert?.status==='skipped'?'발송 설정 필요':alert?.status==='unknown'?'발송 결과 확인 필요':alert?.status==='sending'?'발송 결과 확인 중':alert?.status==='pending'?'발송 대기':'기록 없음'}</p><p className="text-slate-600">SOLAPI 접수는 휴대전화 수신 확인을 뜻하지 않습니다. 결과 확인 필요 상태에서는 업체 발송 내역을 먼저 확인해 주세요.</p>{alert?.provider_group_id&&<p className="mt-1 break-all text-slate-600">업체 그룹 ID: {alert.provider_group_id}</p>}{(alert?.status==='failed'||alert?.status==='skipped'||alert?.status==='pending')&&<button type="button" disabled={busy} onClick={()=>void retryAlert()} className="mt-2 min-h-11 rounded-lg border border-slate-400 px-3 font-bold">알림 다시 시도</button>}</div>
    <dl className="mt-2 grid gap-x-4 gap-y-1 sm:grid-cols-2"><div><dt className="font-bold">관심 교육</dt><dd>{interestLabels[customer.interest_course_id as keyof typeof interestLabels]||'기록 없음'}{customer.interest_level_id?` · ${customer.interest_level_id === 'consult' ? '상담 후 세부 과정 결정' : courseForInterest(customer.interest_course_id)?.levels.find(item=>item.id===customer.interest_level_id)?.name||'세부 과정 기록 없음'}`:''}</dd></div><div><dt className="font-bold">연락 선호</dt><dd>{contactWindowLabels[customer.contact_window as keyof typeof contactWindowLabels]||'미선택'}</dd></div>{customer.interest_goal&&<div className="sm:col-span-2"><dt className="font-bold">처음 시작하기 관심사</dt><dd>{goalById(customer.interest_goal)?.label||'기록 없음'}</dd></div>}{customer.inquiry_text&&<div className="sm:col-span-2"><dt className="font-bold">고객 문의</dt><dd className="whitespace-pre-wrap break-words">{customer.inquiry_text}</dd></div>}</dl>
    <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto]"><label className="block font-bold">상담 진행 상태<select value={status} onChange={event=>setStatus(event.target.value)} className="mt-1 min-h-12 w-full rounded-xl border border-slate-300 bg-white px-3 text-base font-normal">{Object.entries(intakeStatuses).map(([id,label])=><option key={id} value={id}>{label}</option>)}</select></label><button type="button" disabled={busy||status===customer.consultation_status} onClick={()=>void save('status')} className="min-h-12 self-end rounded-xl bg-[#123847] px-5 font-bold text-white disabled:opacity-50">상태 저장</button></div>
    <div className="mt-4 border-t border-slate-200 pt-4"><label className="block font-bold">상담 후 담당 강사 선택<select value={instructorId} onChange={event=>setInstructorId(event.target.value)} className="mt-1 min-h-12 w-full rounded-xl border border-slate-300 bg-white px-3 text-base font-normal"><option value="">강사를 선택해 주세요</option>{instructors.filter(item=>item.is_approved).map(item=><option key={item.id} value={item.id}>{item.name}{customer.matched_instructor_id===item.id?' · 현재 담당':''}</option>)}</select></label>{instructorId&&(()=>{const ins=instructors.find(item=>item.id===instructorId);return <p className="mt-2 text-sm leading-6 text-slate-600">교육 설정: {Object.entries(ins?.course_levels||{}).filter(([,value])=>Array.isArray(value)?value.length>0:value&&value!=='교육 불가').map(([key])=>key).join(' · ')||'설정 확인 필요'}<br/>활동 풀장: {[ins?.can_passnine&&'패스나인',ins?.can_miryang&&'밀양'].filter(Boolean).join(' · ')||'설정 확인 필요'} · 실제 일정은 상담 후 확인</p>})()}<button type="button" disabled={busy||!instructorId||instructorId===customer.matched_instructor_id} onClick={()=>void save('assign')} className="mt-3 min-h-12 rounded-xl border border-teal-800 px-5 font-bold text-teal-900 disabled:opacity-50">담당 강사 배정</button><p className="mt-2 text-xs leading-5 text-slate-600">자동 배정은 하지 않습니다. 선택한 강사의 교육 가능 범위는 서버에서도 확인합니다.</p></div>
    {message&&<p role="status" className="mt-3 rounded-xl bg-slate-100 p-3 font-semibold">{message}</p>}
  </section>;
}
