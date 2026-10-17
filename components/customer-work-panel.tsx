'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { bookingPools } from '../lib/booking-options';
import { consultationEndReasons, consultationStatuses } from '../lib/customer-work';

// The authenticated API returns a workflow row and heterogeneous audit/lesson rows.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Work = Record<string, any>;
const emptyLesson = { status:'proposed', lesson_date:'', start_time:'', end_time:'', pool_id:'passnine', customer_agreed:false,
  operation_checked:false, operation_evidence:'', exception_agreed:false, exception_reason:'', travel_checked:false, travel_reason:'', change_reason:'' };
const dateTime = (value?: string) => value ? new Date(value).toLocaleString('ko-KR',{timeZone:'Asia/Seoul'}) : '기록 없음';

export default function CustomerWorkPanel({customerId,onChanged}:{customerId:string;onChanged?:()=>void}) {
  const [data,setData]=useState<Work|null>(null);
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState('');
  const [notice,setNotice]=useState('');
  const [patch,setPatch]=useState<Work>({});
  const [lesson,setLesson]=useState<Work>(emptyLesson);
  const [editingLesson,setEditingLesson]=useState<Work|null>(null);
  const [busy,setBusy]=useState(false);
  const busyLock=useRef(false);
  const workflowKey=useRef<string|null>(null);
  const lessonKey=useRef<string|null>(null);
  const [open,setOpen]=useState(false);
  const load = useCallback(async () => {
    setLoading(true);setError('');
    try {
      const response=await fetch(`/api/instructor/customers/${customerId}/work`,{cache:'no-store'});
      const result=await response.json();
      if(!response.ok) throw new Error(result.error||'조회에 실패했습니다.');
      setData(result);setPatch({});
    } catch(e) {setError(e instanceof Error?e.message:'조회에 실패했습니다.');}
    finally {setLoading(false);}
  },[customerId]);
  useEffect(()=>{if(!open)return;const timer=setTimeout(()=>void load(),0);return()=>clearTimeout(timer);},[open,load]);
  const workflow=data?.workflow;
  const value=(field:string)=>patch[field]===undefined?workflow?.[field]??'':patch[field];
  async function saveWorkflow() {
    if(!Object.keys(patch).length||busyLock.current) return;
    busyLock.current=true;
    workflowKey.current ||= crypto.randomUUID();
    setBusy(true);setError('');setNotice('');
    try {
      const response=await fetch(`/api/instructor/customers/${customerId}/work`,{method:'PATCH',headers:{'Content-Type':'application/json'},
        body:JSON.stringify({revision:workflow?.revision??0,requestKey:workflowKey.current,patch})});
      const result=await response.json();if(!response.ok) throw new Error(result.error);
      workflowKey.current=null;await load();onChanged?.();setNotice('상담 정보가 저장되었습니다.');
    } catch(e) {setError(e instanceof Error?e.message:'저장하지 못했습니다.');}
    finally {busyLock.current=false;setBusy(false);}
  }
  async function saveLesson() {
    if(busyLock.current)return;
    busyLock.current=true;
    lessonKey.current ||= crypto.randomUUID();
    setBusy(true);setError('');setNotice('');
    try {
      const response=await fetch(`/api/instructor/customers/${customerId}/work`,{method:'POST',headers:{'Content-Type':'application/json'},
        body:JSON.stringify({lessonId:editingLesson?.id||null,revision:editingLesson?.revision??0,requestKey:lessonKey.current,lesson})});
      const result=await response.json();if(!response.ok) throw new Error(result.error);
      lessonKey.current=null;setEditingLesson(null);setLesson(emptyLesson);await load();onChanged?.();setNotice('수업 일정이 저장되었습니다. 자동 알림은 발송되지 않습니다.');
    } catch(e) {setError(e instanceof Error?e.message:'수업을 저장하지 못했습니다.');}
    finally {busyLock.current=false;setBusy(false);}
  }
  function editExisting(item:Work) {
    setEditingLesson(item);setLesson({...emptyLesson,...item,start_time:item.start_time?.slice(0,5),end_time:item.end_time?.slice(0,5),
      customer_agreed:item.status==='confirmed',operation_checked:item.status==='confirmed',exception_agreed:!!item.exception_reason,travel_checked:!!item.travel_reason});
  }
  const update=(key:string,v:string|boolean)=>setLesson(old=>({...old,[key]:v}));
  return <div className="mt-3 rounded-xl border border-cyan-200 bg-white p-3 text-base leading-7 break-keep">
    <button type="button" aria-expanded={open} onClick={()=>setOpen(!open)} className="min-h-11 w-full text-left font-bold text-cyan-900">{open?'상담·수업 관리 접기':'상담·수업 관리 열기'} <span aria-hidden="true">{open?'⌃':'⌄'}</span></button>
    {open&&<div className="mt-3 space-y-6 border-t border-slate-200 pt-4">
      {loading&&<p role="status">업무 정보를 불러오는 중입니다…</p>}
      {error&&<p role="alert" className="rounded-lg bg-red-50 p-3 text-red-800">{error}</p>}
      {notice&&<p role="status" className="rounded-lg bg-emerald-50 p-3 text-emerald-800">{notice}</p>}
      {data&&<>
        <section className="space-y-3" aria-label="상담 진행">
          <h5 className="font-bold text-slate-950">상담 진행 · {consultationStatuses[workflow?.status as keyof typeof consultationStatuses]||'진행 상태 미기록'}</h5>
          <p className="text-sm text-slate-600">기존 신청의 희망 일정은 위에 그대로 보존됩니다. 전화 버튼만 눌러서는 연락 기록이 남지 않습니다.</p>
          <label className="block font-semibold">진행 상태<select value={value('status')} onChange={e=>setPatch(v=>({...v,status:e.target.value,end_reason:e.target.value==='closed'?(v.end_reason??workflow?.end_reason??''):''}))} className="mt-1 min-h-12 w-full rounded-lg border p-2 text-base"><option value="">진행 상태 미기록</option>{Object.entries(consultationStatuses).map(([key,label])=><option key={key} value={key}>{label}</option>)}</select></label>
          {value('status')==='closed'&&<label className="block font-semibold">종료 사유<select value={value('end_reason')} onChange={e=>setPatch(v=>({...v,end_reason:e.target.value}))} className="mt-1 min-h-12 w-full rounded-lg border p-2 text-base"><option value="">선택해 주세요</option>{Object.entries(consultationEndReasons).map(([key,label])=><option key={key} value={key}>{label}</option>)}</select></label>}
          <label className="block font-semibold">실제 연락 결과<input value={value('last_contact_result')} onChange={e=>setPatch(v=>({...v,last_contact_result:e.target.value}))} placeholder="예: 통화 후 날짜 확인 중" maxLength={500} className="mt-1 min-h-12 w-full rounded-lg border p-2 text-base"/></label>
          <p className="text-sm text-slate-600">마지막 연락 기록: {dateTime(workflow?.last_contact_at)}</p>
          <label className="block font-semibold">내부 상담 메모<textarea value={value('internal_note')} onChange={e=>setPatch(v=>({...v,internal_note:e.target.value}))} maxLength={3000} rows={3} className="mt-1 w-full rounded-lg border p-2 text-base"/></label>
          <p className="text-sm text-slate-600">내부 메모는 고객에게 공개되지 않습니다. 불필요한 민감정보는 적지 마세요.</p>
          <label className="block font-semibold">다음 할 일<input value={value('task_title')} onChange={e=>setPatch(v=>({...v,task_title:e.target.value}))} maxLength={500} className="mt-1 min-h-12 w-full rounded-lg border p-2 text-base"/></label>
          <label className="block font-semibold">예정 시각 (한국 시간)<input type="datetime-local" value={value('task_due_at')?new Date(value('task_due_at')).toLocaleString('sv-SE',{timeZone:'Asia/Seoul'}).replace(' ','T').slice(0,16):''} onChange={e=>setPatch(v=>({...v,task_due_at:e.target.value?new Date(`${e.target.value}:00+09:00`).toISOString():null}))} className="mt-1 min-h-12 w-full rounded-lg border p-2 text-base"/></label>
          <label className="flex min-h-11 items-center gap-2"><input type="checkbox" checked={patch.task_completed===undefined?!!workflow?.task_completed_at:patch.task_completed} onChange={e=>setPatch(v=>({...v,task_completed:e.target.checked}))}/>할 일 완료</label>
          <button type="button" disabled={busy||!Object.keys(patch).length} onClick={saveWorkflow} className="min-h-12 w-full rounded-xl bg-cyan-800 px-4 font-bold text-white disabled:opacity-50">상담 정보 저장</button>
        </section>
        <section className="space-y-3 border-t pt-4" aria-label="첫 수업 일정">
          <h5 className="font-bold text-slate-950">첫 수업 일정</h5><p className="text-sm text-slate-600">제안은 예약 확정이 아닙니다. 확정은 고객과 실제 합의하고 풀장 운영을 확인한 뒤 기록하세요. 결제나 풀장 예약 완료를 뜻하지 않습니다.</p>
          {data.lessons.length===0?<p className="text-slate-600">등록된 수업 일정이 없습니다.</p>:data.lessons.map((item:Work)=><div key={item.id} className="rounded-lg border p-3"><p className="font-semibold">{item.lesson_date} {item.start_time?.slice(0,5)}–{item.end_time?.slice(0,5)} · {bookingPools[item.pool_id as keyof typeof bookingPools]?.name||item.pool_id}</p><p>{item.status==='proposed'?'제안 중':item.status==='confirmed'?'확정':'취소'} · 담당 강사 기록</p><button type="button" onClick={()=>editExisting(item)} className="mt-2 min-h-11 rounded-lg border px-3 font-semibold">{item.status==='cancelled'?'기록 보기':'일정 변경·취소'}</button></div>)}
          <h6 className="font-semibold">{editingLesson?'수업 일정 변경':'새 수업 제안'}</h6>
          <div className="grid gap-3 sm:grid-cols-2">
            <label>날짜<input type="date" value={lesson.lesson_date||''} onChange={e=>update('lesson_date',e.target.value)} className="mt-1 min-h-12 w-full rounded-lg border p-2 text-base"/></label>
            <label>풀장<select value={lesson.pool_id} onChange={e=>update('pool_id',e.target.value)} className="mt-1 min-h-12 w-full rounded-lg border p-2 text-base">{Object.values(bookingPools).filter(pool=>pool.active).map(pool=><option key={pool.id} value={pool.id}>{pool.name}</option>)}</select></label>
            <label>시작<input type="time" value={lesson.start_time||''} onChange={e=>update('start_time',e.target.value)} className="mt-1 min-h-12 w-full rounded-lg border p-2 text-base"/></label>
            <label>종료<input type="time" value={lesson.end_time||''} onChange={e=>update('end_time',e.target.value)} className="mt-1 min-h-12 w-full rounded-lg border p-2 text-base"/></label>
            <label>상태<select value={lesson.status} onChange={e=>update('status',e.target.value)} className="mt-1 min-h-12 w-full rounded-lg border p-2 text-base"><option value="proposed">제안 중</option><option value="confirmed">확정</option>{editingLesson&&<option value="cancelled">취소</option>}</select></label>
          </div>
          {lesson.status==='confirmed'&&<div className="space-y-3 rounded-lg bg-cyan-50 p-3">
            <label className="flex min-h-11 items-center gap-2"><input type="checkbox" checked={!!lesson.customer_agreed} onChange={e=>update('customer_agreed',e.target.checked)}/>고객과 일정 합의 확인</label>
            <label className="flex min-h-11 items-center gap-2"><input type="checkbox" checked={!!lesson.operation_checked} onChange={e=>update('operation_checked',e.target.checked)}/>해당 날짜의 풀장 운영 여부 확인</label>
            <label className="block">운영 확인 근거<input value={lesson.operation_evidence||''} onChange={e=>update('operation_evidence',e.target.value)} maxLength={500} placeholder="예: 예약 페이지 확인, 풀장 담당자 통화" className="mt-1 min-h-12 w-full rounded-lg border p-2 text-base"/></label>
            <label className="flex min-h-11 items-center gap-2"><input type="checkbox" checked={!!lesson.exception_agreed} onChange={e=>update('exception_agreed',e.target.checked)}/>반복 시간표 밖 예외 일정이면 고객과 합의함</label>
            {lesson.exception_agreed&&<label className="block">예외 합의 사유<input value={lesson.exception_reason||''} onChange={e=>update('exception_reason',e.target.value)} maxLength={500} className="mt-1 min-h-12 w-full rounded-lg border p-2 text-base"/></label>}
            <label className="flex min-h-11 items-center gap-2"><input type="checkbox" checked={!!lesson.travel_checked} onChange={e=>update('travel_checked',e.target.checked)}/>같은 날 다른 풀장 이동 가능 여부 확인</label>
            {lesson.travel_checked&&<label className="block">이동 확인 근거<input value={lesson.travel_reason||''} onChange={e=>update('travel_reason',e.target.value)} maxLength={500} className="mt-1 min-h-12 w-full rounded-lg border p-2 text-base"/></label>}
          </div>}
          {editingLesson?.status==='confirmed'&&<label className="block">변경·취소 사유<input value={lesson.change_reason||''} onChange={e=>update('change_reason',e.target.value)} maxLength={500} className="mt-1 min-h-12 w-full rounded-lg border p-2 text-base"/></label>}
          <div className="flex flex-wrap gap-2"><button type="button" disabled={busy||editingLesson?.status==='cancelled'} onClick={saveLesson} className="min-h-12 rounded-xl bg-cyan-800 px-4 font-bold text-white disabled:opacity-50">{lesson.status==='confirmed'?'고객 합의 확인 후 확정':lesson.status==='cancelled'?'수업 취소 저장':'수업 제안 저장'}</button>{editingLesson&&<button type="button" onClick={()=>{setEditingLesson(null);setLesson(emptyLesson)}} className="min-h-12 rounded-xl border px-4">새 수업 입력</button>}</div>
        </section>
        <details className="border-t pt-4"><summary className="min-h-11 cursor-pointer font-semibold">변경 이력 {data.events.length}건</summary><ol className="mt-2 space-y-2">{data.events.map((event:Work)=><li key={event.id} className="rounded-lg bg-slate-50 p-2 text-sm">{dateTime(event.created_at)} · {event.actor_type==='admin'?'관리자':'강사'} · {event.action}</li>)}</ol></details>
      </>}
    </div>}
  </div>;
}
