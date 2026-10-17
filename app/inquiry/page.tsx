'use client';

import Link from 'next/link';
import { FormEvent, Suspense, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { getMarketingAttribution } from '../../components/marketing-attribution';
import { canInstructorTeachCourse } from '../../lib/instructor-fields';
import { bookingDays, bookingPools, courseCatalog, getAvailableSlots, getCourse, getPool, scheduleLabel, validateScheduleAlternatives } from '../../lib/booking-options';

type ScheduleAlternative = { id: string; poolId: string; dayId: string; slotId: string };
type ErrorMap = Record<string, string>;
type PublicInstructor = Record<string, unknown> & { id: string; name: string; course_levels?: Record<string, string | string[]> };

const steps = [
  { id: 1, label: '과정 선택' }, { id: 2, label: '가능 일정' },
  { id: 3, label: '비용 확인' }, { id: 4, label: '연락처·동의' },
];
const courseParamMap: Record<string, string> = {
  freediving: 'freediving', youth: 'youth', safety: 'safety', mermaid: 'mermaid', scuba: 'scuba', special: 'special',
};
const dayFieldSuffix: Record<string, string> = {
  mon: 'mon', tue: 'tue', wed: 'wed', thu: 'thu', fri: 'fri', sat: 'sat', sun: 'sun', holiday: 'holiday',
};
const poolInstructorFields = {
  passnine: { enabled: 'can_passnine', dayPrefix: 'passnine_day_', timePrefix: 'passnine_' },
  miryang: { enabled: 'can_miryang', dayPrefix: 'miryang_day_', timePrefix: 'miryang_' },
} as const;

function newSchedule(id = `schedule-${Date.now()}`): ScheduleAlternative {
  return { id, poolId: '', dayId: '', slotId: '' };
}
function formatPhone(value: string) {
  const raw = value.replace(/\D/g, '').slice(0, 11);
  if (raw.length <= 3) return raw;
  if (raw.length <= 7) return `${raw.slice(0, 3)}-${raw.slice(3)}`;
  return `${raw.slice(0, 3)}-${raw.slice(3, 7)}-${raw.slice(7)}`;
}
function instructorMatchesSchedule(instructor: PublicInstructor, option: ScheduleAlternative) {
  const config = poolInstructorFields[option.poolId as keyof typeof poolInstructorFields];
  if (!config) return false;
  return instructor[config.enabled] === true
    && instructor[`${config.dayPrefix}${dayFieldSuffix[option.dayId]}`] === true
    && instructor[`${config.timePrefix}${option.slotId}`] === true;
}
function instructorCanTeachCategory(instructor: PublicInstructor, courseName: string) {
  const saved = instructor.course_levels?.[courseName];
  return Array.isArray(saved)
    ? saved.some(item => typeof item === 'string' && item && item !== '교육 불가')
    : typeof saved === 'string' && saved !== '교육 불가';
}
function focusField(id: string) {
  window.setTimeout(() => document.getElementById(id)?.focus(), 0);
}

function TestInquiryForm() {
  const searchParams = useSearchParams();
  const [step, setStep] = useState(1);
  const [courseId, setCourseId] = useState('');
  const [levelId, setLevelId] = useState('');
  const [scheduleMode, setScheduleMode] = useState<'exact' | 'flexible'>('exact');
  const [alternatives, setAlternatives] = useState<ScheduleAlternative[]>([newSchedule('schedule-1')]);
  const [scheduleNotice, setScheduleNotice] = useState('');
  const [youthCount, setYouthCount] = useState('');
  const [youthAges, setYouthAges] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [marketingAccepted, setMarketingAccepted] = useState(false);
  const [errors, setErrors] = useState<ErrorMap>({});
  const [submitting, setSubmitting] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [matchedInstructor, setMatchedInstructor] = useState<PublicInstructor | null>(null);
  const [requestStatus, setRequestStatus] = useState<'matched' | 'pending_assignment'>('pending_assignment');
  const [requestKey, setRequestKey] = useState('');

  const selectedCourse = useMemo(() => getCourse(courseId), [courseId]);
  const selectedLevel = selectedCourse?.levels.find((level: { id: string }) => level.id === levelId) || null;

  useEffect(() => {
    const queryCourse = courseParamMap[searchParams.get('course') || ''];
    try {
      const saved = JSON.parse(sessionStorage.getItem('bluepeace_inquiry_draft') || 'null');
      if (!saved || typeof saved !== 'object') {
        if (queryCourse) setCourseId(queryCourse);
        return;
      }
      const savedCourseIsValid = saved.courseId === 'unsure' || Boolean(getCourse(saved.courseId));
      const courseToRestore = queryCourse || (savedCourseIsValid ? saved.courseId : '');
      setCourseId(courseToRestore);
      if (queryCourse && saved.courseId !== queryCourse) return;
      if (typeof saved.levelId === 'string') setLevelId(saved.levelId);
      if (saved.scheduleMode === 'exact' || saved.scheduleMode === 'flexible') setScheduleMode(saved.scheduleMode);
      if (Array.isArray(saved.alternatives) && saved.alternatives.length) {
        setAlternatives(saved.alternatives.slice(0, 8).map((item: ScheduleAlternative, index: number) => ({
          id: `restored-${index}`, poolId: item.poolId || '', dayId: item.dayId || '', slotId: item.slotId || '',
        })));
      }
    } catch {}
  }, [searchParams]);

  useEffect(() => {
    try { sessionStorage.setItem('bluepeace_inquiry_draft', JSON.stringify({ courseId, levelId, scheduleMode, alternatives })); } catch {}
  }, [courseId, levelId, scheduleMode, alternatives]);

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem('bluepeace_request_key');
      const next = saved || crypto.randomUUID();
      if (!saved) sessionStorage.setItem('bluepeace_request_key', next);
      setRequestKey(next);
    } catch {
      setRequestKey(crypto.randomUUID());
    }
  }, []);

  function chooseCourse(nextCourseId: string) {
    setCourseId(nextCourseId);
    setLevelId('');
    if (nextCourseId !== 'youth') { setYouthCount(''); setYouthAges(''); }
    setErrors(previous => ({ ...previous, course: '', level: '', youth: '' }));
  }
  function updateSchedule(id: string, field: keyof Omit<ScheduleAlternative, 'id'>, value: string) {
    setScheduleNotice('');
    setAlternatives(previous => previous.map(item => {
      if (item.id !== id) return item;
      const next = { ...item, [field]: value };
      if (field === 'poolId') { next.dayId = ''; next.slotId = ''; }
      if (field === 'dayId') {
        const remainsValid = getAvailableSlots(next.poolId, value).some((slot: { id: string }) => slot.id === item.slotId);
        if (item.slotId && !remainsValid) {
          next.slotId = '';
          setScheduleNotice('요일 변경으로 이용할 수 없게 된 시간 선택을 해제했습니다. 새 시간대를 선택해 주세요.');
        }
      }
      return next;
    }));
    setErrors(previous => ({ ...previous, schedules: '' }));
  }
  function addSchedule() {
    if (alternatives.length < 8) setAlternatives(previous => [...previous, newSchedule(`schedule-${Date.now()}-${previous.length}`)]);
  }
  function removeSchedule(id: string) {
    setAlternatives(previous => previous.length === 1 ? [newSchedule('schedule-1')] : previous.filter(item => item.id !== id));
  }
  function validateStep(targetStep: number) {
    const nextErrors: ErrorMap = {};
    if (targetStep === 1) {
      if (!courseId) nextErrors.course = '원하는 교육 분야를 선택해 주세요.';
      if (courseId && courseId !== 'unsure' && !levelId) nextErrors.level = '세부 과정을 선택하거나 상담 후 결정하기를 선택해 주세요.';
      if (courseId === 'youth' && (!/^\d+$/.test(youthCount) || Number(youthCount) < 1 || Number(youthCount) > 20 || !youthAges.trim())) nextErrors.youth = '유스 수강 인원(1~20명)과 각 수강생의 연령을 입력해 주세요.';
    }
    if (targetStep === 2) {
      const result = validateScheduleAlternatives({ mode: scheduleMode, alternatives });
      if (!result.valid) nextErrors.schedules = result.errors[0];
    }
    if (targetStep === 4) {
      if (!name.trim()) nextErrors.name = '상담받을 분의 성함을 입력해 주세요.';
      if (!/^010-\d{4}-\d{4}$/.test(phone)) nextErrors.phone = '010으로 시작하는 휴대폰 번호 11자리를 입력해 주세요.';
      if (!privacyAccepted) nextErrors.privacy = '필수 개인정보 처리 안내를 확인하고 동의해 주세요.';
    }
    setErrors(nextErrors);
    const first = Object.keys(nextErrors)[0];
    if (first) focusField(`field-${first}`);
    return Object.keys(nextErrors).length === 0;
  }
  function goNext() {
    if (!validateStep(step)) return;
    setStep(current => Math.min(4, current + 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  async function submitRequest(event: FormEvent) {
    event.preventDefault();
    if (submitting || !validateStep(4)) return;
    setSubmitting(true);
    setErrors({});
    try {
      const instructorResponse = await fetch('/api/public/instructors', { cache: 'no-store' });
      const instructorResult = await instructorResponse.json().catch(() => ({}));
      const instructors: PublicInstructor[] = instructorResponse.ok && Array.isArray(instructorResult.instructors) ? instructorResult.instructors : [];
      const courseMatched = courseId === 'unsure'
        ? []
        : instructors.filter(instructor => {
            if (!selectedCourse) return false;
            return levelId === 'consult'
              ? instructorCanTeachCategory(instructor, selectedCourse.name)
              : Boolean(selectedLevel && canInstructorTeachCourse(instructor, selectedCourse.name, selectedLevel.name));
          });
      const qualified = scheduleMode === 'flexible'
        ? courseMatched
        : courseMatched.filter(instructor => alternatives.some(option => instructorMatchesSchedule(instructor, option)));
      const selectedInstructor = qualified.length ? qualified[Math.floor(Math.random() * qualified.length)] : null;
      const response = await fetch('/api/matches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          request_key: requestKey,
          name: name.trim(),
          phone,
          course_id: courseId,
          level_id: levelId,
          schedule_mode: scheduleMode,
          schedule_alternatives: alternatives,
          youth_participant_count: courseId === 'youth' ? Number(youthCount) : null,
          youth_ages: courseId === 'youth' ? youthAges.trim() : null,
          privacy_accepted: privacyAccepted,
          marketing_accepted: marketingAccepted,
          attribution: marketingAccepted ? getMarketingAttribution() : null,
          instructor_id: selectedInstructor?.id || null,
        }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || !result.id) {
        if (response.status === 400 && typeof result.error === 'string' && result.error.includes('일정')) {
          setStep(2);
          setErrors({ schedules: result.error });
          focusField('field-schedules');
          return;
        }
        throw new Error(result.error || '상담 요청을 저장하지 못했습니다.');
      }
      setMatchedInstructor(result.instructor ? { ...selectedInstructor, ...result.instructor } as PublicInstructor : null);
      setRequestStatus(result.status === 'matched' ? 'matched' : 'pending_assignment');
      try {
        sessionStorage.removeItem('bluepeace_inquiry_draft');
        sessionStorage.removeItem('bluepeace_request_key');
      } catch {}
      setCompleted(true);
    } catch (error) {
      setErrors({ submit: error instanceof Error ? error.message : '연결이 끊겼습니다. 입력 내용은 유지되어 있으니 다시 시도해 주세요.' });
      focusField('field-submit');
    } finally { setSubmitting(false); }
  }

  if (completed) {
    return <main className="min-h-screen break-keep bg-slate-50 px-4 py-10 text-slate-800 sm:py-16"><section className="mx-auto max-w-2xl rounded-3xl border border-cyan-200 bg-white p-5 shadow-lg sm:p-8">
      <div className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-sm font-bold text-emerald-900">상담 요청 접수 완료</div>
      <h1 className="mt-4 break-keep text-2xl font-black leading-9 text-slate-950">상담 요청이 정상적으로 접수됐습니다.</h1>
      <div className="mt-3 space-y-2 text-base leading-7 text-slate-600">
        <p>아직 수업 예약이나 결제가 확정된 단계는 아닙니다.</p>
        <p>선택한 과정과 일정을 확인한 뒤 연락을 통해 최종 일정을 조율합니다.</p>
      </div>
      <dl className="mt-6 space-y-4 rounded-2xl bg-slate-50 p-4 text-sm sm:p-5">
        <div><dt className="font-bold text-slate-500">과정</dt><dd className="mt-1 text-base font-bold text-slate-900">{courseId === 'unsure' ? '상담 후 과정 결정' : `${selectedCourse?.name} · ${levelId === 'consult' ? '상담 후 세부 과정 결정' : selectedLevel?.name}`}</dd></div>
        <div><dt className="font-bold text-slate-500">가능 일정</dt><dd className="mt-1 space-y-1 text-base text-slate-900">{scheduleMode === 'flexible' ? '상담 후 일정 협의' : alternatives.map(option => <span key={option.id} className="block">{scheduleLabel(option)}</span>)}</dd></div>
        <div><dt className="font-bold text-slate-500">강사 배정</dt><dd className="mt-1 text-base text-slate-900">{requestStatus === 'matched' && matchedInstructor ? `${matchedInstructor.name} 강사와 연결됐습니다.` : '운영자가 과정과 일정을 확인한 뒤 담당 강사를 안내합니다.'}</dd></div>
      </dl>
      <div className="mt-6 rounded-2xl border border-slate-200 p-4"><h2 className="font-black text-slate-950">앞으로 진행되는 순서</h2><ol className="mt-3 space-y-2 text-sm leading-6 text-slate-700"><li>1. 신청 내용과 가능한 강사를 확인합니다.</li><li>2. 연락을 통해 과정과 비용을 안내합니다.</li><li>3. 풀장 일정과 수업 시간을 조율합니다.</li><li>4. 고객 확인 후 예약을 확정합니다.</li></ol></div>
      <div className="mt-6 grid gap-3 sm:grid-cols-2">{matchedInstructor?.phone && <a href={`tel:${matchedInstructor.phone}`} className="flex min-h-12 items-center justify-center rounded-xl border border-cyan-300 bg-cyan-50 px-4 text-base font-bold text-cyan-900">담당 강사에게 전화하기</a>}<Link href="/" className="flex min-h-12 items-center justify-center rounded-xl bg-cyan-700 px-4 text-base font-bold text-white">홈으로 돌아가기</Link></div>
    </section></main>;
  }

  return <main className="min-h-screen break-keep bg-slate-50 px-3 pb-28 pt-5 text-slate-800 sm:px-6 sm:py-10"><div className="mx-auto max-w-3xl">
    <div className="mb-5 flex items-center justify-between gap-3"><Link href="/" className="text-sm font-bold text-cyan-800">← 블루피스 홈</Link><span className="rounded-full bg-cyan-100 px-3 py-1 text-xs font-bold text-cyan-900">상담 요청 · 예약 확정 전</span></div>
    <header><p className="text-sm font-bold text-cyan-700">BLUE PEACE CONSULTATION</p><h1 className="mt-2 break-keep text-2xl font-black leading-9 text-slate-950 sm:text-3xl">과정과 가능한 일정을 먼저 확인해요.</h1><div className="mt-2 space-y-1 text-base leading-7 text-slate-600"><p>신청 내용을 바탕으로 가능한 강사와 풀장 일정을 확인합니다.</p><p>상담 요청 단계에서는 예약이나 결제가 확정되지 않습니다.</p></div></header>
    <nav aria-label="상담 신청 진행 단계" className="mt-7 grid grid-cols-4 gap-1 sm:gap-2">{steps.map(item => <button key={item.id} type="button" disabled={item.id > step} onClick={() => item.id < step && setStep(item.id)} aria-current={step === item.id ? 'step' : undefined} className={`min-h-14 rounded-xl border px-1 py-2 text-xs font-bold sm:text-sm ${step === item.id ? 'border-cyan-700 bg-cyan-700 text-white' : item.id < step ? 'border-cyan-200 bg-cyan-50 text-cyan-900' : 'border-slate-200 bg-white text-slate-400'}`}><span className="block text-[11px] opacity-80">{item.id}/4</span>{item.label}</button>)}</nav>
    <form onSubmit={submitRequest} className="mt-5 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-7">
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

      {step === 2 && <section aria-labelledby="step-schedule-title"><h2 id="step-schedule-title" className="text-xl font-black text-slate-950">2. 실제로 가능한 일정을 알려주세요</h2><p className="mt-2 text-base leading-7 text-slate-600">각 행은 서로 다른 대안입니다. 여러 행을 입력해도 여러 수업을 예약하는 것이 아닙니다.</p>
        <fieldset className="mt-5 grid gap-3 sm:grid-cols-2"><legend className="sr-only">일정 선택 방식</legend><label className={`flex cursor-pointer gap-3 rounded-2xl border p-4 ${scheduleMode === 'exact' ? 'border-cyan-600 bg-cyan-50' : 'border-slate-200'}`}><input type="radio" name="schedule-mode" checked={scheduleMode === 'exact'} onChange={() => setScheduleMode('exact')} className="mt-1 h-5 w-5 accent-cyan-700" /><span><strong className="block text-base text-slate-950">가능 일정 직접 선택</strong><span className="mt-1 block text-sm leading-6 text-slate-600">장소·요일·시간을 한 묶음으로 선택</span></span></label><label className={`flex cursor-pointer gap-3 rounded-2xl border p-4 ${scheduleMode === 'flexible' ? 'border-cyan-600 bg-cyan-50' : 'border-slate-200'}`}><input type="radio" name="schedule-mode" checked={scheduleMode === 'flexible'} onChange={() => { setScheduleMode('flexible'); setErrors(previous => ({ ...previous, schedules: '' })); }} className="mt-1 h-5 w-5 accent-cyan-700" /><span><strong className="block text-base text-slate-950">일정 협의 가능</strong><span className="mt-1 block text-sm leading-6 text-slate-600">모든 시간이 가능하다는 뜻이 아니며 상담 후 결정</span></span></label></fieldset>
        {scheduleMode === 'exact' && <div id="field-schedules" tabIndex={-1} className="mt-5 space-y-4">{alternatives.map((option, index) => { const pool = getPool(option.poolId); const availableSlots = getAvailableSlots(option.poolId, option.dayId); return <fieldset key={option.id} className="rounded-2xl border border-slate-200 p-4"><legend className="px-1 text-base font-black text-slate-950">가능 일정 {index + 1}</legend><div className="grid gap-4 sm:grid-cols-3">
          <label className="text-sm font-bold text-slate-700">풀장<select aria-label={`가능 일정 ${index + 1} 풀장`} value={option.poolId} onChange={event => updateSchedule(option.id, 'poolId', event.target.value)} className="mt-1 min-h-12 w-full rounded-xl border border-slate-300 bg-white px-3 text-base"><option value="">선택</option>{Object.values(bookingPools).filter(poolOption => poolOption.active).map(poolOption => <option key={poolOption.id} value={poolOption.id}>{poolOption.name}</option>)}</select></label>
          <label className="text-sm font-bold text-slate-700">요일<select aria-label={`가능 일정 ${index + 1} 요일`} value={option.dayId} disabled={!option.poolId} onChange={event => updateSchedule(option.id, 'dayId', event.target.value)} className="mt-1 min-h-12 w-full rounded-xl border border-slate-300 bg-white px-3 text-base disabled:bg-slate-100"><option value="">선택</option>{bookingDays.map(day => <option key={day.id} value={day.id}>{day.label}</option>)}</select></label>
          <label className="text-sm font-bold text-slate-700">시간대<select aria-label={`가능 일정 ${index + 1} 시간대`} value={option.slotId} disabled={!option.dayId} onChange={event => updateSchedule(option.id, 'slotId', event.target.value)} className="mt-1 min-h-12 w-full rounded-xl border border-slate-300 bg-white px-3 text-base disabled:bg-slate-100"><option value="">선택</option>{availableSlots.map((slot: { id: string; label: string; time: string; restriction?: string }) => <option key={slot.id} value={slot.id}>{slot.label} {slot.time}{slot.restriction ? ` · ${slot.restriction}` : ''}</option>)}</select></label>
        </div>{option.dayId === 'holiday' && <p className="mt-3 rounded-xl bg-amber-50 p-3 text-sm leading-6 text-amber-900">공휴일은 일반 평일·주말과 운영이 같다고 확정하지 않습니다. 선택한 회차의 실제 운영 여부를 상담에서 확인합니다.</p>}{pool?.notice && <p className="mt-3 text-sm leading-6 text-slate-600">{pool.notice}</p>}<button type="button" onClick={() => removeSchedule(option.id)} className="mt-3 min-h-11 rounded-xl px-3 text-sm font-bold text-rose-700">이 일정 삭제</button></fieldset>; })}<button type="button" onClick={addSchedule} disabled={alternatives.length >= 8} className="min-h-12 w-full rounded-xl border border-cyan-300 bg-cyan-50 px-4 text-base font-bold text-cyan-900 disabled:opacity-50">+ 가능 일정 추가</button><div aria-disabled="true" className="rounded-2xl border border-amber-200 bg-amber-50 p-4"><strong className="text-base text-slate-900">대구 두류풀장 · 선택 불가</strong><p className="mt-1 text-sm leading-6 text-amber-900">{bookingPools.duryu.notice}</p></div></div>}
        {scheduleNotice && <p role="status" className="mt-3 rounded-xl bg-blue-50 p-3 text-sm font-bold leading-6 text-blue-900">{scheduleNotice}</p>}{errors.schedules && <p role="alert" className="mt-3 text-sm font-bold leading-6 text-rose-700">{errors.schedules}</p>}
      </section>}

      {step === 3 && <section aria-labelledby="step-review-title"><h2 id="step-review-title" className="text-xl font-black text-slate-950">3. 선택 내용과 예상 비용을 확인해 주세요</h2><p className="mt-2 text-base leading-7 text-slate-600">교육비 외 비용은 확정 자료가 없어 임의로 합산하지 않습니다. 상담에서 총 예상액을 다시 확인하세요.</p><div className="mt-5 space-y-4">
        <div className="rounded-2xl border border-slate-200 p-4"><div className="flex items-start justify-between gap-3"><div><p className="text-sm font-bold text-slate-500">교육 과정</p><p className="mt-1 text-lg font-black text-slate-950">{courseId === 'unsure' ? '상담 후 과정 결정' : `${selectedCourse?.name} · ${levelId === 'consult' ? '상담 후 세부 과정 결정' : selectedLevel?.name}`}</p></div><button type="button" onClick={() => setStep(1)} className="min-h-11 rounded-xl px-3 text-sm font-bold text-cyan-800">수정</button></div></div>
        <div className="rounded-2xl border border-slate-200 p-4"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="text-sm font-bold text-slate-500">가능 일정</p><div className="mt-2 space-y-2 text-base font-bold leading-7 text-slate-900">{scheduleMode === 'flexible' ? <p>상담 후 일정 협의</p> : alternatives.map(option => <p key={option.id}>{scheduleLabel(option)}</p>)}</div></div><button type="button" onClick={() => setStep(2)} className="min-h-11 rounded-xl px-3 text-sm font-bold text-cyan-800">수정</button></div></div>
        <div className="rounded-2xl border border-cyan-200 bg-cyan-50 p-4"><h3 className="text-base font-black text-cyan-950">비용 구분</h3><dl className="mt-3 divide-y divide-cyan-200 text-sm"><div className="flex justify-between gap-3 py-3"><dt className="font-bold text-slate-700">교육비</dt><dd className="text-right font-black text-slate-950">{selectedLevel?.price || '상담 후 안내'}</dd></div><div className="flex justify-between gap-3 py-3"><dt className="font-bold text-slate-700">자격 발급비</dt><dd className="text-right font-bold text-slate-900">{selectedLevel?.issuance || '과정 결정 후 확인'}</dd></div><div className="flex justify-between gap-3 py-3"><dt className="font-bold text-slate-700">풀장 입장료</dt><dd className="text-right font-bold text-amber-900">별도 · 금액 확인 필요</dd></div><div className="flex justify-between gap-3 py-3"><dt className="font-bold text-slate-700">장비 렌탈료</dt><dd className="text-right font-bold text-amber-900">별도 · 보유 장비 확인 후 안내</dd></div></dl><p className="mt-3 text-sm leading-6 text-cyan-950">‘무제한 트레이닝’ 안내가 있는 과정도 풀장 입장료와 장비 비용까지 무료라는 의미로 확정하지 않습니다. 적용 범위와 기간은 운영자 확인이 필요합니다.</p></div>
      </div></section>}

      {step === 4 && <section aria-labelledby="step-contact-title"><h2 id="step-contact-title" className="break-keep text-xl font-black text-slate-950">4. 상담받을 연락처를 입력해 주세요</h2><div className="mt-2 space-y-1 text-base leading-7 text-slate-600"><p>과정과 일정을 확인했습니다.</p><p>연락처는 상담과 강사 배정에만 사용합니다.</p></div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2"><div><label className="text-sm font-bold text-slate-700" htmlFor="field-name">성함</label><input id="field-name" autoComplete="name" value={name} onChange={event => { setName(event.target.value); setErrors(previous => ({ ...previous, name: '' })); }} aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? 'error-name' : undefined} className="mt-1 min-h-12 w-full rounded-xl border border-slate-300 px-3 text-base" />{errors.name && <p id="error-name" role="alert" className="mt-1 text-sm font-bold text-rose-700">{errors.name}</p>}</div><div><label className="text-sm font-bold text-slate-700" htmlFor="field-phone">휴대폰 번호</label><input id="field-phone" inputMode="tel" autoComplete="tel" value={phone} onChange={event => { setPhone(formatPhone(event.target.value)); setErrors(previous => ({ ...previous, phone: '' })); }} placeholder="010-0000-0000" aria-invalid={Boolean(errors.phone)} aria-describedby={errors.phone ? 'error-phone' : undefined} className="mt-1 min-h-12 w-full rounded-xl border border-slate-300 px-3 text-base" />{errors.phone && <p id="error-phone" role="alert" className="mt-1 text-sm font-bold text-rose-700">{errors.phone}</p>}</div></div>
        <div id="field-privacy" tabIndex={-1} className="mt-6 space-y-3 border-t border-slate-200 pt-6"><label className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-4 ${errors.privacy ? 'border-rose-400 bg-rose-50' : 'border-slate-200 bg-slate-50'}`}><input type="checkbox" checked={privacyAccepted} onChange={event => { setPrivacyAccepted(event.target.checked); setErrors(previous => ({ ...previous, privacy: '' })); }} className="mt-1 h-5 w-5 shrink-0 accent-cyan-700" /><span className="text-sm leading-6 text-slate-700"><strong className="text-base text-slate-950">[필수] 상담 처리를 위한 개인정보 안내 확인</strong><br />운영 서비스는 성함·연락처·과정·일정 조건을 상담과 강사 배정에 사용합니다. 담당 강사 배정 후 해당 강사와 관리자가 신청 내용을 확인할 수 있습니다.</span></label>{errors.privacy && <p role="alert" className="text-sm font-bold text-rose-700">{errors.privacy}</p>}
          <details className="rounded-2xl border border-slate-200 p-4"><summary className="min-h-8 cursor-pointer text-sm font-bold text-cyan-900">개인정보 처리 상세 보기</summary><div className="mt-3 space-y-2 border-t border-slate-200 pt-3 text-sm leading-7 text-slate-700"><p><strong>수집 항목:</strong> 성함, 연락처, 과정, 희망 일정, 유스 인원·연령(해당 시)</p><p><strong>이용 목적:</strong> 상담, 강사 매칭, 일정 조율</p><p><strong>열람 범위:</strong> 관리자와 배정된 담당 강사</p><p><strong>삭제 문의:</strong> 블루피스 대표 연락처로 요청할 수 있습니다.</p><Link href="/privacy" className="inline-block font-bold text-cyan-800 underline">개인정보 처리 안내 보기</Link></div></details>
          <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-slate-200 p-4"><input type="checkbox" checked={marketingAccepted} onChange={event => setMarketingAccepted(event.target.checked)} className="mt-1 h-5 w-5 shrink-0 accent-cyan-700" /><span className="text-sm leading-6 text-slate-700"><strong className="text-base text-slate-950">[선택] 분석·마케팅 정보 활용 동의</strong><br />선택하지 않아도 상담을 신청할 수 있습니다.</span></label>
        </div>{errors.submit && <p id="field-submit" tabIndex={-1} role="alert" className="mt-4 rounded-xl bg-rose-50 p-3 text-sm font-bold leading-6 text-rose-800">{errors.submit}</p>}<button type="submit" disabled={submitting || !requestKey} className="mt-6 min-h-14 w-full rounded-2xl bg-cyan-700 px-5 text-base font-black text-white shadow-lg shadow-cyan-700/20 disabled:cursor-wait disabled:opacity-60">{submitting ? '상담 요청을 안전하게 접수하고 있습니다…' : '상담 요청 보내기'}</button>
      </section>}

      <div className={`mt-7 gap-3 border-t border-slate-200 pt-5 ${step === 1 ? 'hidden sm:flex' : 'flex'}`}>{step > 1 && <button type="button" onClick={() => setStep(current => current - 1)} className="min-h-12 flex-1 rounded-xl border border-slate-300 bg-white px-4 text-base font-bold text-slate-700">이전 단계</button>}{step < 4 && <button type="button" onClick={goNext} className="hidden min-h-12 flex-[1.4] rounded-xl bg-cyan-700 px-4 text-base font-black text-white sm:block">{step === 1 ? '가능 일정 선택하기' : step === 2 ? '선택 내용 확인' : '연락처 입력하기'}</button>}</div>
    </form>
  </div>{step < 4 && <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 p-3 shadow-[0_-8px_24px_rgba(15,23,42,0.12)] backdrop-blur sm:hidden" style={{ paddingBottom: 'max(12px, env(safe-area-inset-bottom))' }}><button type="button" onClick={goNext} className="mx-auto min-h-12 w-full max-w-3xl rounded-xl bg-cyan-700 px-4 text-base font-black text-white">{step === 1 ? '가능 일정 선택하기' : step === 2 ? '선택 내용 확인' : '연락처 입력하기'}</button></div>}</main>;
}

export default function TestInquiryPage() {
  return <Suspense fallback={<div className="min-h-screen bg-slate-50 p-8 text-center text-base text-slate-600">상담 화면을 준비하고 있습니다…</div>}><TestInquiryForm /></Suspense>;
}
