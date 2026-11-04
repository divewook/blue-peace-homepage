'use client';
import Link from 'next/link';
import { FormEvent, Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { courseCatalog } from '../lib/booking-options';
import { getMarketingAttribution } from './marketing-attribution';
import { getNaverTrackingConsent, onNaverTrackingConsentChanged, reportNaverLeadOnce, setNaverTrackingConsent } from '../lib/naver-lead-conversion';
import { contactWindowLabels, directInterests, interestLabels } from '../lib/direct-consultation';
import { goalById } from '../lib/home-guide';
import { verifiedCoursePrice } from '../lib/verified-course-prices';

type Interest = keyof typeof interestLabels;
type WindowChoice = keyof typeof contactWindowLabels;
function formatPhone(value: string) { const v=value.replace(/\D/g,'').slice(0,11); return v.length<=3?v:v.length<=7?`${v.slice(0,3)}-${v.slice(3)}`:`${v.slice(0,3)}-${v.slice(3,7)}-${v.slice(7)}`; }
function queryInterest(course: string, level: string): Interest { if(course==='special') return level==='photo'?'photo':['cpr','instructor'].includes(level)?'cpr':'unsure'; return directInterests.includes(course)?course as Interest:'unsure'; }

function FormContent({demo,basePath}:{demo:boolean;basePath:string}) {
  const params=useSearchParams();
  const [interest,setInterest]=useState<Interest>('unsure');
  const [level,setLevel]=useState('');
  const [goal,setGoal]=useState('');
  const [name,setName]=useState('');
  const [phone,setPhone]=useState('');
  const [contactWindow,setContactWindow]=useState<WindowChoice|''>('');
  const [inquiry,setInquiry]=useState('');
  const [privacy,setPrivacy]=useState(false);
  const [marketing,setMarketing]=useState(false);
  const [requestKey,setRequestKey]=useState('');
  const [busy,setBusy]=useState(false);
  const [completed,setCompleted]=useState(false);
  const [error,setError]=useState('');
  useEffect(()=>{
    const timer=setTimeout(()=>{
      const course=params.get('course')||''; const queryLevel=params.get('level')||''; const next=queryInterest(course,queryLevel);
      const category=['photo','cpr'].includes(next)?'special':next;
      const valid=courseCatalog.find(item=>item.id===category)?.levels.some(item=>item.id===queryLevel);
      setInterest(next); setLevel(valid?queryLevel:'');
      let queryGoal=params.get('goal')||'';
      if(!queryGoal){try{queryGoal=sessionStorage.getItem('bluepeace_selected_goal')||'';}catch{}}
      setGoal(goalById(queryGoal)?queryGoal:'');
      const keyName=demo?'bluepeace_demo_consultation_key':'bluepeace_direct_consultation_key';
      try { const key=sessionStorage.getItem(keyName)||crypto.randomUUID(); sessionStorage.setItem(keyName,key); setRequestKey(key);
        if(!demo && sessionStorage.getItem('bluepeace_direct_consultation_completed_key')===key) setCompleted(true);
      }
      catch { setRequestKey(crypto.randomUUID()); }
    },0); return ()=>clearTimeout(timer);
  },[params,demo]);
  useEffect(()=>{if(demo)return;const update=()=>setMarketing(getNaverTrackingConsent()==='yes');update();return onNaverTrackingConsentChanged(update);},[demo]);
  const category=['photo','cpr'].includes(interest)?'special':interest;
  const levels=courseCatalog.find(item=>item.id===category)?.levels.filter(item=>interest==='photo'?item.id==='photo':interest==='cpr'?['cpr','instructor'].includes(item.id):true)||[];
  const selectedLevel=levels.find(item=>item.id===level);
  async function submit(event:FormEvent){
    event.preventDefault(); if(busy)return;
    if(!name.trim()){setError('성함을 입력해 주세요.');document.getElementById('consult-name')?.focus();return;}
    if(!/^010-\d{4}-\d{4}$/.test(phone)){setError('휴대폰 번호를 확인해 주세요.');document.getElementById('consult-phone')?.focus();return;}
    if(!privacy){setError('필수 개인정보 처리에 동의해 주세요.');document.getElementById('consult-privacy')?.focus();return;}
    if(!requestKey){setError('신청 준비 중입니다. 잠시 후 다시 시도해 주세요.');return;}
    setBusy(true);setError('');
    if(demo){setCompleted(true);setBusy(false);return;}
    try {
      const response=await fetch('/api/consultations',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({request_key:requestKey,name:name.trim(),phone,interest_id:interest,level_id:level,goal_id:goal,contact_window:contactWindow,inquiry_text:inquiry,privacy_accepted:privacy,marketing_accepted:marketing,attribution:marketing?getMarketingAttribution():null})});
      const result=await response.json().catch(()=>({})); if(!response.ok||!result.id)throw new Error(result.error||'신청 결과를 확인하지 못했습니다. 다시 시도해 주세요.');
      if(response.status===201)void reportNaverLeadOnce(result,marketing);
      setCompleted(true);try{sessionStorage.setItem('bluepeace_direct_consultation_completed_key',requestKey);}catch{}
    }catch(cause){setError(cause instanceof Error?cause.message:'연결이 끊겼습니다. 입력 내용은 유지됩니다.');}
    finally{setBusy(false);}
  }
  if(completed)return <main className="min-h-screen bg-slate-50 px-4 py-14"><section className="mx-auto max-w-xl rounded-3xl border bg-white p-6 sm:p-9"><p className="text-sm font-bold text-teal-800">BLUE PEACE CONSULTATION</p><h1 className="mt-3 text-2xl font-black leading-9">{demo?'상담 신청 화면을 확인했습니다.':'교육 상담 신청이 완료되었습니다.'}</h1>{demo&&<p className="mt-3 rounded-xl bg-amber-50 p-3 text-sm font-bold text-amber-900">공개 미리보기입니다. 입력 내용은 저장·전송되지 않았습니다.</p>}<p className="mt-4 text-base leading-8">{demo?'실제 신청 화면에서는 블루피스 담당자가 내용을 확인한 후 연락드립니다. 이 미리보기에서는 연락이 오지 않습니다.':'블루피스 담당자가 신청하신 내용을 확인한 후 연락드리겠습니다.'}</p><p className="mt-2 text-base leading-8">블루피스에 관심을 가져주셔서 감사합니다.</p><p className="mt-5 text-sm leading-6 text-slate-600">관심 교육: {interestLabels[interest]}{selectedLevel?` · ${selectedLevel.name}`:''}{contactWindow?` / 연락 선호: ${contactWindowLabels[contactWindow]}`:''}</p><div className="mt-6 flex flex-wrap gap-3"><Link href={basePath||'/'} className="inline-flex min-h-12 items-center rounded-xl bg-[#123847] px-5 text-base font-bold text-white">홈으로 돌아가기</Link><button type="button" onClick={()=>{const key=crypto.randomUUID();setRequestKey(key);setCompleted(false);setName('');setPhone('');setInquiry('');setPrivacy(false);try{sessionStorage.setItem(demo?'bluepeace_demo_consultation_key':'bluepeace_direct_consultation_key',key);sessionStorage.removeItem('bluepeace_direct_consultation_completed_key');}catch{}}} className="min-h-12 rounded-xl border border-slate-300 px-5 text-base font-bold">새 상담 작성</button></div></section></main>;
  return <main className="min-h-screen break-keep bg-[#f7f8f5] px-4 py-8 text-slate-900 sm:py-14"><div className="mx-auto max-w-2xl"><Link href={basePath||'/'} className="inline-flex min-h-11 items-center text-sm font-bold text-teal-800">← 블루피스 홈</Link><header className="mt-4"><p className="text-sm font-bold tracking-widest text-teal-800">BLUE PEACE CONSULTATION</p><h1 className="mt-2 text-3xl font-black">교육 상담 신청</h1><p className="mt-3 text-base leading-8 text-slate-700">과정을 몰라도 신청할 수 있습니다. 대표가 내용을 확인하고 직접 상담합니다.</p><p className="text-sm leading-6 text-slate-600">신청만으로 수업 예약이나 결제가 확정되지 않습니다.</p></header>
  {demo&&<p className="mt-5 rounded-xl bg-amber-50 p-4 text-sm font-bold leading-6 text-amber-950">공개 미리보기 · 입력 내용은 저장·전송되지 않습니다. 실제 개인정보를 입력하지 마세요.</p>}
  <form onSubmit={submit} className="mt-6 space-y-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
    <fieldset><legend className="text-lg font-black">관심 교육과정 <span className="text-sm font-normal text-slate-500">선택</span></legend><div className="mt-3 grid gap-2 sm:grid-cols-2">{directInterests.map(id=><label key={id} className={`flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border px-4 py-2 text-base ${interest===id?'border-teal-700 bg-teal-50 font-bold':'border-slate-200'}`}><input type="radio" name="interest" checked={interest===id} onChange={()=>{setInterest(id as Interest);setLevel('');}} className="h-5 w-5 accent-teal-700"/>{interestLabels[id as Interest]}</label>)}</div></fieldset>
    {goal&&<p className="rounded-xl bg-teal-50 p-4 text-sm leading-6 text-teal-900">처음 시작하기에서 고른 관심사: <strong>{goalById(goal)?.label}</strong></p>}
    {levels.length>0&&<div><label htmlFor="consult-level" className="block text-base font-bold">세부 교육과정 <span className="text-sm font-normal text-slate-500">선택</span></label><select id="consult-level" value={level} onChange={event=>setLevel(event.target.value)} className="mt-2 min-h-12 w-full rounded-xl border border-slate-300 bg-white px-3 text-base"><option value="">상담 후 결정</option>{levels.map(item=><option key={item.id} value={item.id}>{item.name}{verifiedCoursePrice(category,item.id)?` · ${verifiedCoursePrice(category,item.id)}`:' · 가격 확인 중'}</option>)}</select></div>}
    <div><label htmlFor="consult-window" className="block text-base font-bold">연락받기 편한 시간대 <span className="text-sm font-normal text-slate-500">선택</span></label><select id="consult-window" value={contactWindow} onChange={event=>setContactWindow(event.target.value as WindowChoice|'')} className="mt-2 min-h-12 w-full rounded-xl border border-slate-300 bg-white px-3 text-base"><option value="">선택하지 않음</option>{Object.entries(contactWindowLabels).map(([id,label])=><option key={id} value={id}>{label}</option>)}</select><p className="mt-1 text-sm leading-6 text-slate-600">통화 가능 시간을 참고하는 선택이며 전화 예약은 아닙니다.</p></div>
    <div><label htmlFor="consult-inquiry" className="block text-base font-bold">문의사항 <span className="text-sm font-normal text-slate-500">선택</span></label><textarea id="consult-inquiry" value={inquiry} onChange={event=>setInquiry(event.target.value.slice(0,2000))} maxLength={2000} rows={4} className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-3 text-base leading-7" placeholder="궁금한 점을 편하게 적어 주세요."/></div>
    <div className="grid gap-4 sm:grid-cols-2"><div><label htmlFor="consult-name" className="block text-base font-bold">성함 <span className="text-rose-700">필수</span></label><input id="consult-name" required maxLength={100} autoComplete="name" value={name} onChange={event=>setName(event.target.value)} className="mt-2 min-h-12 w-full rounded-xl border border-slate-300 px-3 text-base"/></div><div><label htmlFor="consult-phone" className="block text-base font-bold">휴대폰 번호 <span className="text-rose-700">필수</span></label><input id="consult-phone" required inputMode="tel" autoComplete="tel" value={phone} onChange={event=>setPhone(formatPhone(event.target.value))} placeholder="010-0000-0000" className="mt-2 min-h-12 w-full rounded-xl border border-slate-300 px-3 text-base"/></div></div>
    <div className="space-y-3 border-t border-slate-200 pt-5"><label className="flex items-start gap-3 text-sm leading-6"><input id="consult-privacy" type="checkbox" checked={privacy} onChange={event=>setPrivacy(event.target.checked)} className="mt-1 h-5 w-5 shrink-0 accent-teal-700"/><span><strong className="text-base">[필수] 개인정보 수집·이용 동의</strong><br/>성함, 연락처와 상담 내용을 교육 상담에 사용합니다. <Link href={`${basePath}/privacy`} className="font-bold text-teal-800 underline">자세히 보기</Link></span></label><label className="flex items-start gap-3 text-sm leading-6"><input type="checkbox" checked={marketing} onChange={event=>{setMarketing(event.target.checked);if(!demo)setNaverTrackingConsent(event.target.checked);}} className="mt-1 h-5 w-5 shrink-0 accent-teal-700"/><span><strong className="text-base">[선택] 방문 분석·광고 유입 정보 활용</strong><br/>선택하지 않아도 상담을 신청할 수 있습니다.</span></label></div>
    {error&&<p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm font-semibold leading-6 text-rose-800">{error}</p>}
    <button type="submit" disabled={busy||!requestKey} className="min-h-12 w-full rounded-xl bg-[#123847] px-5 text-base font-bold text-white disabled:opacity-50">{busy?'신청 확인 중…':'교육 상담 신청하기'}</button>
  </form></div></main>;
}
export default function DirectConsultationForm(props:{demo:boolean;basePath:string}){return <Suspense fallback={<main className="min-h-screen p-8 text-base">상담 화면을 준비하고 있습니다…</main>}><FormContent {...props}/></Suspense>;}
