'use client';

import Link from 'next/link';
import { FormEvent, Suspense, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { getMarketingAttribution } from './marketing-attribution';
import { getNaverTrackingConsent, reportNaverLeadOnce, setNaverTrackingConsent } from '../lib/naver-lead-conversion';
import { courseCatalog, getCourse } from '../lib/booking-options';

type ErrorMap = Record<string, string>;
const courseParamMap: Record<string, string> = { freediving:'freediving', youth:'youth', safety:'safety', mermaid:'mermaid', scuba:'scuba', special:'special' };
const contactWindows = [ ['','선택 안 함'], ['morning','오전'], ['afternoon','오후'], ['evening','저녁'], ['anytime','언제든 가능'] ];
function formatPhone(value: string) {
  const raw = value.replace(/\D/g,'').slice(0,11);
  if (raw.length <= 3) return raw;
  if (raw.length <= 7) return `${raw.slice(0,3)}-${raw.slice(3)}`;
  return `${raw.slice(0,3)}-${raw.slice(3,7)}-${raw.slice(7)}`;
}
function focusField(id: string) { window.setTimeout(() => document.getElementById(id)?.focus(),0); }

function Form({demo}: {demo:boolean}) {
  const searchParams = useSearchParams();
  const [step,setStep] = useState(1);
  const [courseId,setCourseId] = useState('');
  const [levelId,setLevelId] = useState('');
  const [youthCount,setYouthCount] = useState('');
  const [youthAges,setYouthAges] = useState('');
  const [name,setName] = useState('');
  const [phone,setPhone] = useState('');
  const [contactWindow,setContactWindow] = useState('');
  const [inquiryText,setInquiryText] = useState('');
  const [privacyAccepted,setPrivacyAccepted] = useState(false);
  const [marketingAccepted,setMarketingAccepted] = useState(false);
  const [errors,setErrors] = useState<ErrorMap>({});
  const [submitting,setSubmitting] = useState(false);
  const [completed,setCompleted] = useState(false);
  const [requestKey,setRequestKey] = useState('');
  const [ready,setReady] = useState(false);
  const selectedCourse = useMemo(() => getCourse(courseId),[courseId]);
  const selectedLevel = selectedCourse?.levels.find((level: {id:string}) => level.id === levelId);
  const home = demo ? '/TEST' : '/';
  const privacy = demo ? '/TEST/privacy' : '/privacy';

  useEffect(() => {
    const timer = window.setTimeout(() => {
    const queryCourse = courseParamMap[searchParams.get('course') || ''];
    let draft: {courseId?:string;levelId?:string;youthCount?:string;youthAges?:string}|null = null;
    try { draft=JSON.parse(sessionStorage.getItem('bluepeace_inquiry_draft')||'null'); } catch {}
    // Direct visits begin with an undecided course; a link may carry only the
    // explicitly requested category. Never restore a stale course as a choice.
    const nextCourse = queryCourse || 'unsure';
    setCourseId(nextCourse || 'unsure');
    if (draft?.courseId === nextCourse && (draft.levelId === 'consult' || getCourse(nextCourse)?.levels.some(level => level.id === draft?.levelId))) {
      setLevelId(draft.levelId || '');
      if (nextCourse === 'youth') { setYouthCount(draft.youthCount || ''); setYouthAges(draft.youthAges || ''); }
    }
    try {
      const key=sessionStorage.getItem('bluepeace_direct_request_key') || crypto.randomUUID();
      sessionStorage.setItem('bluepeace_direct_request_key',key);
      setRequestKey(key);
    } catch { setRequestKey(crypto.randomUUID()); }
    setMarketingAccepted(getNaverTrackingConsent() === 'yes');
    setReady(true);
    }, 0);
    return () => window.clearTimeout(timer);
  },[searchParams]);
  useEffect(() => {
    if (!ready) return;
    try { sessionStorage.setItem('bluepeace_inquiry_draft',JSON.stringify({courseId,levelId,youthCount,youthAges})); } catch {}
  },[ready,courseId,levelId,youthCount,youthAges]);
  function chooseCourse(nextCourseId:string) {
    setCourseId(nextCourseId); setLevelId('');
    if(nextCourseId !== 'youth') { setYouthCount(''); setYouthAges(''); }
    setErrors(previous=>({...previous,course:'',level:'',youth:''}));
  }
  function validate(target:number) {
    const next:ErrorMap={};
    if(target===1) {
      if(!courseId) next.course='교육 분야를 선택해 주세요.';
      if(courseId && courseId !== 'unsure' && !levelId) next.level='세부 과정을 선택하거나 상담 후 결정하기를 선택해 주세요.';
      if(courseId==='youth' && (youthCount || youthAges) && (!/^\d+$/.test(youthCount) || Number(youthCount)<1 || Number(youthCount)>20 || !youthAges.trim())) next.youth='유스 정보를 입력하려면 인원(1~20명)과 연령을 모두 입력해 주세요.';
    } else {
      if(!name.trim()) next.name='성함을 입력해 주세요.';
      if(!/^010-\d{4}-\d{4}$/.test(phone)) next.phone='010으로 시작하는 휴대폰 번호 11자리를 입력해 주세요.';
      if(!privacyAccepted) next.privacy='필수 개인정보 처리에 동의해 주세요.';
    }
    setErrors(next);
    const first=Object.keys(next)[0]; if(first) focusField(`field-${first}`);
    return !first;
  }
  async function submit(event:FormEvent) {
    event.preventDefault();
    if(submitting || !validate(2)) return;
    if(demo) { setCompleted(true); return; }
    setSubmitting(true);
    try {
      const response=await fetch('/api/consultations',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({
        request_key:requestKey,name:name.trim(),phone,interest_id:courseId,level_id:levelId,
        youth_participant_count:courseId==='youth' && youthCount ? Number(youthCount):null,
        youth_ages:courseId==='youth' ? youthAges.trim()||null:null,
        contact_window:contactWindow,inquiry_text:inquiryText.trim(),privacy_accepted:privacyAccepted,
        marketing_accepted:marketingAccepted,attribution:marketingAccepted?getMarketingAttribution():null,
      })});
      const result=await response.json().catch(()=>({}));
      if(!response.ok || !result.id) throw new Error(result.error || '상담 신청을 저장하지 못했습니다. 다시 시도해 주세요.');
      if(response.status===201) void reportNaverLeadOnce(result,marketingAccepted);
      try { sessionStorage.removeItem('bluepeace_inquiry_draft'); sessionStorage.removeItem('bluepeace_direct_request_key'); } catch {}
      setCompleted(true);
    } catch(error) {
      setErrors({submit:error instanceof Error?error.message:'연결이 끊겼습니다. 입력 내용은 유지됩니다.'});
      focusField('field-submit');
    } finally { setSubmitting(false); }
  }
  if(completed) return <main className="min-h-screen break-keep bg-slate-50 px-4 py-10 text-slate-800"><section className="mx-auto max-w-2xl rounded-3xl border border-cyan-200 bg-white p-6 shadow-sm sm:p-8">
    {demo && <p className="mb-4 rounded-lg bg-amber-100 p-3 text-sm font-bold text-amber-950">모의 완료 화면입니다. 신청 정보는 저장하거나 전송하지 않았습니다.</p>}
    <h1 className="text-2xl font-black leading-9 text-slate-950">교육 상담 신청이 완료되었습니다.</h1>
    <p className="mt-5 text-base leading-7">블루피스 담당자가 신청하신 내용을 확인한 후 연락드리겠습니다.</p>
    <p className="mt-3 text-base leading-7">블루피스에 관심을 가져주셔서 감사합니다.</p>
    <p className="mt-5 text-base font-bold">{courseId==='unsure'?'상담 후 과정 결정':`${selectedCourse?.name} · ${levelId==='consult'?'상담 후 세부 과정 결정':selectedLevel?.name}`}</p>
    <p className="mt-2 text-sm leading-6 text-slate-600">상담 신청 접수 단계이며 수업 예약이나 결제가 확정된 것은 아닙니다.</p>
    <Link href={home} className="mt-6 flex min-h-12 items-center justify-center rounded-xl bg-cyan-700 px-4 font-bold text-white">홈으로 돌아가기</Link>
  </section></main>;
  return <main className="min-h-screen break-keep bg-slate-50 px-3 pb-28 pt-5 text-slate-800 sm:px-6 sm:py-10"><div className="mx-auto max-w-3xl">
    <div className="mb-5 flex items-center justify-between gap-3"><Link href={home} className="text-sm font-bold text-cyan-800">← 블루피스 홈</Link><span className="rounded-full bg-cyan-100 px-3 py-1 text-sm font-bold text-cyan-900">교육 상담 신청 · 예약 확정 전</span></div>
    <header><p className="text-sm font-bold text-cyan-700">BLUE PEACE CONSULTATION</p><h1 className="mt-2 text-2xl font-black leading-9 text-slate-950 sm:text-3xl">과정을 고르고 상담을 신청해 주세요.</h1><p className="mt-2 text-base leading-7 text-slate-600">상담 후 풀장과 일정을 함께 정합니다. 지금 수업이 예약되거나 결제되는 것은 아닙니다.</p></header>
    <nav aria-label="상담 신청 진행 단계" className="mt-7 grid grid-cols-2 gap-2">{[['1','과정 선택'],['2','연락처·동의']].map(([id,label])=><button key={id} type="button" disabled={Number(id)>step} onClick={()=>Number(id)<step&&setStep(Number(id))} aria-current={step===Number(id)?'step':undefined} className={`min-h-14 rounded-xl border px-2 py-2 text-sm font-bold ${step===Number(id)?'border-cyan-700 bg-cyan-700 text-white':Number(id)<step?'border-cyan-200 bg-cyan-50 text-cyan-900':'border-slate-200 bg-white text-slate-500'}`}>{id}/2 · {label}</button>)}</nav>
    <form onSubmit={submit} className="mt-5 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-7">
      {step === 1 && <section aria-labelledby="step-course-title">
        <h2 id="step-course-title" className="text-xl font-black text-slate-950">1. 교육 목적과 과정을 선택해 주세요</h2><p className="mt-2 text-base leading-7 text-slate-600">과정을 잘 몰라도 상담을 시작할 수 있습니다. 과정 링크로 들어온 경우 교육 분야만 유지하고 세부 과정은 직접 선택합니다.</p>
        <div id="field-course" tabIndex={-1} className="mt-5 grid gap-3 sm:grid-cols-2">
          <button type="button" aria-pressed={courseId === 'unsure'} onClick={() => chooseCourse('unsure')} className={`min-h-24 rounded-2xl border p-4 text-left ${courseId === 'unsure' ? 'border-cyan-600 bg-cyan-50 ring-2 ring-cyan-100' : 'border-slate-200 bg-white'}`}><span className="block text-base font-black text-slate-950">과정을 잘 모르겠어요</span><span className="mt-1 block text-sm leading-6 text-slate-600">목표와 경험을 상담한 뒤 과정 결정</span>{courseId === 'unsure' && <span className="mt-2 block text-sm font-bold text-cyan-800">✓ 선택됨</span>}</button>
          {courseCatalog.map(course => <button key={course.id} type="button" aria-pressed={courseId === course.id} onClick={() => chooseCourse(course.id)} className={`min-h-24 rounded-2xl border p-4 text-left ${courseId === course.id ? 'border-cyan-600 bg-cyan-50 ring-2 ring-cyan-100' : 'border-slate-200 bg-white'}`}><span className="block text-base font-black text-slate-950">{course.name}</span><span className="mt-1 block text-sm leading-6 text-slate-600">{course.audience}</span><span className="mt-2 block text-sm font-bold text-cyan-800">{course.startingPrice}{courseId === course.id ? ' · ✓ 선택됨' : ''}</span></button>)}
        </div>{errors.course && <p role="alert" className="mt-2 text-sm font-bold text-rose-700">{errors.course}</p>}
        {selectedCourse && <div className="mt-6 border-t border-slate-200 pt-6"><div className="rounded-2xl bg-slate-50 p-4"><div className="flex flex-wrap items-center justify-between gap-2"><h3 className="text-lg font-black text-slate-950">{selectedCourse.name}</h3><span className="rounded-full bg-white px-3 py-1 text-sm font-bold text-cyan-800">{selectedCourse.association}</span></div><p className="mt-3 text-base leading-7 text-slate-700">{selectedCourse.summary}</p><dl className="mt-4 grid gap-3 text-sm leading-6 sm:grid-cols-2"><div><dt className="font-bold text-slate-500">참여 조건</dt><dd className="text-slate-800">{selectedCourse.prerequisite}</dd></div><div><dt className="font-bold text-slate-500">예상 구성</dt><dd className="text-slate-800">{selectedCourse.duration}</dd></div></dl></div>
          <fieldset id="field-level" tabIndex={-1} className="mt-5"><legend className="text-base font-black text-slate-950">세부 과정</legend><p className="mt-1 text-sm text-slate-600">선택한 과정의 교육비와 발급비 포함 여부를 함께 확인하세요.</p><div className="mt-3 space-y-2">{selectedCourse.levels.map((level: { id: string; name: string; price: string; issuance: string }) => <label key={level.id} className={`flex min-h-16 cursor-pointer items-start gap-3 rounded-xl border p-3 ${levelId === level.id ? 'border-cyan-600 bg-cyan-50' : 'border-slate-200'}`}><input type="radio" name="level" checked={levelId === level.id} onChange={() => { setLevelId(level.id); setErrors(previous => ({ ...previous, level: '' })); }} className="mt-1 h-5 w-5 accent-cyan-700" /><span className="min-w-0 flex-1"><strong className="block text-base text-slate-950">{level.name}</strong><span className="mt-1 block text-sm leading-6 text-slate-600">{level.price} · {level.issuance}</span></span>{levelId === level.id && <span className="text-sm font-bold text-cyan-800">선택</span>}</label>)}<label className={`flex min-h-16 cursor-pointer items-start gap-3 rounded-xl border p-3 ${levelId === 'consult' ? 'border-cyan-600 bg-cyan-50' : 'border-slate-200'}`}><input type="radio" name="level" checked={levelId === 'consult'} onChange={() => { setLevelId('consult'); setErrors(previous => ({ ...previous, level: '' })); }} className="mt-1 h-5 w-5 accent-cyan-700" /><span><strong className="block text-base text-slate-950">상담 후 세부 과정 결정</strong><span className="mt-1 block text-sm leading-6 text-slate-600">분야만 선택하고 세부 단계는 상담에서 결정합니다.</span></span></label></div></fieldset>{errors.level && <p role="alert" className="mt-2 text-sm font-bold text-rose-700">{errors.level}</p>}
        </div>}
        {courseId === 'youth' && <fieldset id="field-youth" tabIndex={-1} className="mt-5 rounded-2xl border border-cyan-200 bg-cyan-50 p-4"><legend className="px-1 text-base font-black text-cyan-950">유스 수강생 정보</legend><div className="mt-2 grid gap-4 sm:grid-cols-2"><label className="text-sm font-bold text-slate-700">수강 인원<input type="number" min="1" max="20" value={youthCount} onChange={event => setYouthCount(event.target.value)} className="mt-1 min-h-12 w-full rounded-xl border border-cyan-200 bg-white px-3 text-base" /></label><label className="text-sm font-bold text-slate-700">수강생 연령<input value={youthAges} onChange={event => setYouthAges(event.target.value.slice(0, 200))} placeholder="예: 만 12세, 만 14세" className="mt-1 min-h-12 w-full rounded-xl border border-cyan-200 bg-white px-3 text-base" /></label></div>{errors.youth && <p role="alert" className="mt-2 text-sm font-bold text-rose-700">{errors.youth}</p>}</fieldset>}
      </section>}

      {step===2 && <section aria-labelledby="contact-title"><h2 id="contact-title" className="text-xl font-black text-slate-950">2. 연락받을 정보를 입력해 주세요</h2>
        <div className="mt-4 rounded-xl border border-cyan-200 bg-cyan-50 p-4"><p className="text-sm font-bold text-cyan-900">선택한 교육과정</p><p className="mt-1 text-base font-bold text-slate-950">{courseId==='unsure'?'상담 후 과정 결정':`${selectedCourse?.name} · ${levelId==='consult'?'상담 후 세부 과정 결정':selectedLevel?.name}`}</p><button type="button" onClick={()=>setStep(1)} className="mt-2 min-h-11 text-sm font-bold text-cyan-800 underline">과정 변경</button></div>
        <div className="mt-5 grid gap-4 sm:grid-cols-2"><div><label htmlFor="field-name" className="text-sm font-bold">성함 <span className="text-rose-700">필수</span></label><input id="field-name" autoComplete="name" value={name} onChange={event=>{setName(event.target.value);setErrors(previous=>({...previous,name:''}));}} aria-invalid={!!errors.name} aria-describedby={errors.name?'error-name':undefined} className="mt-1 min-h-12 w-full rounded-xl border border-slate-300 px-3 text-base" />{errors.name&&<p id="error-name" role="alert" className="mt-1 text-sm text-rose-700">{errors.name}</p>}</div><div><label htmlFor="field-phone" className="text-sm font-bold">휴대전화 <span className="text-rose-700">필수</span></label><input id="field-phone" inputMode="tel" autoComplete="tel" value={phone} onChange={event=>{setPhone(formatPhone(event.target.value));setErrors(previous=>({...previous,phone:''}));}} placeholder="010-0000-0000" aria-invalid={!!errors.phone} aria-describedby={errors.phone?'error-phone':undefined} className="mt-1 min-h-12 w-full rounded-xl border border-slate-300 px-3 text-base" />{errors.phone&&<p id="error-phone" role="alert" className="mt-1 text-sm text-rose-700">{errors.phone}</p>}</div></div>
        <label htmlFor="field-contact" className="mt-5 block text-sm font-bold">연락받기 편한 시간대 <span className="font-normal text-slate-500">선택</span></label><select id="field-contact" value={contactWindow} onChange={event=>setContactWindow(event.target.value)} className="mt-1 min-h-12 w-full rounded-xl border border-slate-300 bg-white px-3 text-base">{contactWindows.map(([id,label])=><option key={id} value={id}>{label}</option>)}</select>
        <label htmlFor="field-inquiry" className="mt-5 block text-sm font-bold">문의사항 <span className="font-normal text-slate-500">선택</span></label><textarea id="field-inquiry" value={inquiryText} maxLength={2000} onChange={event=>setInquiryText(event.target.value)} rows={4} className="mt-1 w-full rounded-xl border border-slate-300 p-3 text-base" placeholder="궁금한 점이 있으면 적어 주세요." />
        <div id="field-privacy" tabIndex={-1} className="mt-6 space-y-3 border-t border-slate-200 pt-6"><label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4"><input type="checkbox" checked={privacyAccepted} onChange={event=>{setPrivacyAccepted(event.target.checked);setErrors(previous=>({...previous,privacy:''}));}} className="mt-1 h-5 w-5 shrink-0 accent-cyan-700" /><span className="text-sm leading-6"><strong className="text-base">[필수] 상담을 위한 개인정보 수집·이용 동의</strong><br />성함, 휴대전화, 선택 과정, 연락 선호 시간, 문의 내용을 상담 처리와 담당자 연락에 사용합니다. 추후 담당 강사가 배정되면 상담에 필요한 정보가 전달될 수 있습니다.</span></label>{errors.privacy&&<p role="alert" className="text-sm font-bold text-rose-700">{errors.privacy}</p>}
          <details className="rounded-xl border border-slate-200 p-4"><summary className="min-h-11 cursor-pointer text-sm font-bold text-cyan-900">개인정보 처리 안내 자세히 보기</summary><div className="mt-2 space-y-2 text-sm leading-6"><p>교육 등록으로 이어지지 않은 상담은 상담 종료일과 마지막 연락일 중 늦은 날부터 90일 보관하고, 대표가 매월 점검·삭제합니다.</p><p>신규 상담 접수 시 대표에게 문자 알림을 보낼 수 있습니다. 문자 발송 내역은 SOLAPI의 별도 보관 기준이 적용됩니다.</p><Link href={privacy} className="font-bold text-cyan-800 underline">개인정보 처리 안내 보기</Link></div></details>
          <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-slate-200 p-4"><input type="checkbox" checked={marketingAccepted} onChange={event=>{setMarketingAccepted(event.target.checked);setNaverTrackingConsent(event.target.checked);}} className="mt-1 h-5 w-5 shrink-0 accent-cyan-700" /><span className="text-sm leading-6"><strong className="text-base">[선택] 광고 유입 분석 활용 동의</strong><br />동의한 경우에만 UTM·네이버 검색광고 유입 정보와 신청완료 전환을 분석합니다. 광고성 연락 수신 동의는 아닙니다. 동의하지 않아도 상담할 수 있습니다.</span></label></div>
        {errors.submit&&<p id="field-submit" tabIndex={-1} role="alert" className="mt-4 rounded-xl bg-rose-50 p-3 text-sm font-bold leading-6 text-rose-800">{errors.submit}</p>}
        <button type="submit" disabled={submitting||!requestKey} className="mt-6 min-h-14 w-full rounded-xl bg-cyan-700 px-4 text-base font-black text-white disabled:opacity-60">{submitting?'상담 신청을 저장하고 있습니다…':'교육 상담 신청하기'}</button>
      </section>}
      <div className="mt-6 border-t border-slate-200 pt-4">{step===1?<button type="button" onClick={()=>{if(validate(1)){setStep(2);window.scrollTo({top:0,behavior:'smooth'});}}} className="hidden min-h-12 w-full rounded-xl bg-cyan-700 px-4 font-bold text-white sm:block">연락처 입력하기</button>:<button type="button" onClick={()=>setStep(1)} className="min-h-12 rounded-xl border border-slate-300 px-4 font-bold">이전 단계</button>}</div>
    </form></div>{step===1&&<div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 p-3 shadow-lg backdrop-blur sm:hidden" style={{paddingBottom:'max(12px, env(safe-area-inset-bottom))'}}><button type="button" onClick={()=>{if(validate(1)){setStep(2);window.scrollTo({top:0,behavior:'smooth'});}}} className="min-h-12 w-full rounded-xl bg-cyan-700 px-4 font-bold text-white">연락처 입력하기</button></div>}</main>;
}
export default function SelectiveConsultationForm({demo=false}:{demo?:boolean}) {
  return <Suspense fallback={<div className="min-h-screen bg-slate-50 p-8 text-center">상담 화면을 준비하고 있습니다…</div>}><Form demo={demo}/></Suspense>;
}
