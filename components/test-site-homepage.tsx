'use client';

import Image from 'next/image';
import Link from 'next/link';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import ExpandableText from './expandable-text';
import { testCourses, testFaqs, testReviews } from '../lib/test-site-data';

type Instructor = {
  id: string;
  name: string;
  profile_image: string | null;
  bio: string | null;
  can_passnine?: boolean;
  can_miryang?: boolean;
  course_levels?: Record<string, string | string[]>;
};

type FormErrors = Partial<Record<'course' | 'level' | 'name' | 'phone' | 'pool' | 'days' | 'time' | 'youthCount' | 'youthAges' | 'privacy', string>>;

const dayOptions = ['월', '화', '수', '목', '금', '토', '일', '공휴일'];
const poolOptions = {
  passnine: {
    name: '칠곡 패스나인 풀장',
    times: ['1부 (09:00~11:30)', '2부 (12:30~15:00)', '3부 (16:00~18:30)', '4부 (19:30~22:00)'],
  },
  miryang: {
    name: '밀양 아리랑 풀장',
    times: ['오전부 (08:00~10:00) ※주말만', '1부 (10:00~12:00)', '2부 (12:00~14:00)', '3부 (14:00~16:00)', '4부 (16:00~18:00)', '5부 (18:00~20:00)', '6부 (20:00~22:00)'],
  },
} as const;

const galleryImages = [
  '/DSC00377.jpg', '/DSC01428-Enhanced-NR.jpg', '/DSC01925-Enhanced-NR.jpg',
  '/DSC04183-Enhanced-NR.jpg', '/DSC05737-Enhanced-NR.jpg', '/DSC07168-Enhanced-NR.jpg',
];

const reviewUrl = 'https://map.naver.com/p/entry/place/1768533167?placePath=%2Freview';
const mapUrl = 'https://map.naver.com/p/entry/place/1768533167';

function courseCapabilities(instructor: Instructor) {
  return Object.entries(instructor.course_levels || {}).flatMap(([course, level]) => {
    if (Array.isArray(level)) return level.filter(item => item && item !== '교육 불가').map(item => `${course} · ${item}`);
    return level && level !== '교육 불가' ? [`${course} · ${level}`] : [];
  });
}

function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

export default function TestSiteHomepage() {
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [instructorsLoading, setInstructorsLoading] = useState(true);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [pool, setPool] = useState<'' | keyof typeof poolOptions>('');
  const [days, setDays] = useState<string[]>([]);
  const [time, setTime] = useState('');
  const [youthCount, setYouthCount] = useState('');
  const [youthAges, setYouthAges] = useState('');
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitted, setSubmitted] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const selectedCourse = useMemo(
    () => testCourses.find(course => course.id === selectedCourseId),
    [selectedCourseId],
  );
  const selectedPrice = selectedCourse?.levels.find(level => level.name === selectedLevel)?.price || '';

  useEffect(() => {
    const controller = new AbortController();
    async function loadInstructors() {
      try {
        const response = await fetch('/api/public/instructors', { cache: 'no-store', signal: controller.signal });
        const result = await response.json();
        if (response.ok && Array.isArray(result.instructors)) setInstructors(result.instructors);
      } catch (error) {
        if (!(error instanceof DOMException && error.name === 'AbortError')) setInstructors([]);
      } finally {
        if (!controller.signal.aborted) setInstructorsLoading(false);
      }
    }
    void loadInstructors();
    return () => controller.abort();
  }, []);

  function chooseCourse(courseId: string, moveToForm = true) {
    const course = testCourses.find(item => item.id === courseId);
    setSelectedCourseId(courseId);
    setSelectedLevel(course?.levels[0]?.name || '');
    setErrors(previous => ({ ...previous, course: undefined, level: undefined }));
    if (moveToForm) window.setTimeout(() => scrollToId('test-consultation'), 0);
  }

  function changePool(nextPool: keyof typeof poolOptions) {
    setPool(nextPool);
    setDays([]);
    setTime('');
    setErrors(previous => ({ ...previous, pool: undefined, days: undefined, time: undefined }));
  }

  function toggleDay(day: string) {
    setDays(previous => previous.includes(day) ? previous.filter(item => item !== day) : [...previous, day]);
    setErrors(previous => ({ ...previous, days: undefined }));
  }

  function formatPhone(value: string) {
    const digits = value.replace(/\D/g, '').slice(0, 11);
    if (digits.length <= 3) return digits;
    if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
    return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
  }

  function validateForm() {
    const nextErrors: FormErrors = {};
    if (!selectedCourse) nextErrors.course = '상담할 교육 과정을 선택해 주세요.';
    if (selectedCourse && !selectedLevel) nextErrors.level = '세부 과정을 선택해 주세요.';
    if (!name.trim()) nextErrors.name = '상담받을 분의 성함을 입력해 주세요.';
    if (!/^010-\d{4}-\d{4}$/.test(phone)) nextErrors.phone = '010으로 시작하는 휴대폰 번호 11자리를 입력해 주세요.';
    if (!pool) nextErrors.pool = '희망 풀장을 선택해 주세요.';
    if (days.length === 0) nextErrors.days = '가능한 요일을 한 개 이상 선택해 주세요.';
    if (!time) nextErrors.time = '희망 시간대를 선택해 주세요.';
    if (selectedCourseId === 'youth' && (!youthCount || Number(youthCount) < 1)) nextErrors.youthCount = '유스 수강 인원을 입력해 주세요.';
    if (selectedCourseId === 'youth' && !youthAges.trim()) nextErrors.youthAges = '수강생의 연령을 입력해 주세요.';
    if (!privacyAccepted) nextErrors.privacy = '개인정보 수집 안내를 확인하고 동의해 주세요.';
    setErrors(nextErrors);
    const firstError = Object.keys(nextErrors)[0];
    if (firstError) window.setTimeout(() => document.getElementById(`test-${firstError}`)?.focus(), 0);
    return Object.keys(nextErrors).length === 0;
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!validateForm()) return;
    setSubmitted(true);
  }

  return (
    <main className="min-h-screen bg-[#f5f8f7] pb-24 text-slate-800 md:pb-0">
      <div className="sticky top-0 z-[60] border-b border-amber-300 bg-amber-300 px-3 py-2 text-center text-xs font-black tracking-wide text-amber-950 shadow-sm">
        테스트 페이지 · 운영 페이지 아님 · 입력 정보는 저장되거나 전송되지 않습니다
      </div>

      <header className="sticky top-8 z-50 border-b border-slate-200 bg-white/95 px-4 py-3 shadow-sm backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <Link href="/TEST" className="shrink-0 text-lg font-black tracking-wider text-cyan-700">BLUE PEACE <span className="text-xs text-amber-600">TEST</span></Link>
          <nav aria-label="테스트 페이지 주요 메뉴" className="flex min-w-0 gap-4 overflow-x-auto whitespace-nowrap py-2 text-xs font-bold text-slate-600 sm:gap-6">
            <a href="#test-courses">과정·가격</a><a href="#test-instructors">강사진</a><a href="#test-process">상담 절차</a><a href="#test-faq">FAQ</a><a href="#test-consultation" className="text-cyan-700">상담 신청</a>
          </nav>
        </div>
      </header>

      <section className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:py-20 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
        <div>
          <p className="inline-flex rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-xs font-bold text-cyan-800">나에게 맞는 교육부터 천천히 선택하세요</p>
          <h1 className="mt-4 text-3xl font-black leading-tight text-slate-950 sm:text-5xl">상담 전에 과정과 비용을<br /><span className="text-cyan-700">먼저 비교해 보세요.</span></h1>
          <p className="mt-5 max-w-xl text-sm leading-7 text-slate-600 sm:text-base">프리다이빙부터 유스, 안전요원, 머메이드, 스쿠버, 스페셜 교육까지 원하는 과정을 먼저 고른 뒤 일정과 장소를 상담합니다.</p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <button type="button" onClick={() => scrollToId('test-courses')} className="min-h-12 rounded-2xl bg-cyan-700 px-6 py-3 text-sm font-extrabold text-white shadow-lg shadow-cyan-700/20">교육 과정 선택하기</button>
            <button type="button" onClick={() => scrollToId('test-process')} className="min-h-12 rounded-2xl border border-slate-300 bg-white px-6 py-3 text-sm font-bold text-slate-700">상담부터 예약까지 보기</button>
          </div>
          <p className="mt-3 text-xs font-semibold text-amber-700">상담 신청은 예약 확정이나 결제가 아닙니다.</p>
        </div>
        <div className="relative h-80 overflow-hidden rounded-[2rem] bg-slate-200 shadow-2xl sm:h-[30rem]">
          <Image src="/DSC02297.jpg" alt="블루피스 프리다이빙 교육 현장" fill priority sizes="(max-width: 1024px) 100vw, 55vw" className="object-cover" />
          <div className="absolute inset-x-4 bottom-4 rounded-2xl bg-slate-950/75 p-4 text-white backdrop-blur-sm sm:inset-x-6 sm:bottom-6">
            <p className="text-xs font-bold text-cyan-200">BLUE PEACE EDUCATION</p>
            <p className="mt-1 text-sm font-semibold leading-6">희망 과정 · 일정 · 장소를 확인한 뒤 가능한 강사와 상담을 연결합니다.</p>
          </div>
        </div>
      </section>

      <section aria-label="서비스 진행 원칙" className="border-y border-slate-200 bg-white px-4 py-6">
        <div className="mx-auto grid max-w-5xl gap-3 sm:grid-cols-3">
          {[
            ['01', '과정 먼저 선택', '대표 버튼에서 특정 과정이 자동 선택되지 않습니다.'],
            ['02', '일정·장소 확인', '풀장, 요일, 시간대를 비워 둔 상태에서 직접 선택합니다.'],
            ['03', '상담 후 예약 확정', '강사 확인과 일정 조율을 거쳐 예약이 확정됩니다.'],
          ].map(item => <div key={item[0]} className="rounded-2xl bg-slate-50 p-4"><span className="text-xs font-black text-cyan-700">{item[0]}</span><h2 className="mt-1 font-black text-slate-900">{item[1]}</h2><p className="mt-1 text-xs leading-5 text-slate-600">{item[2]}</p></div>)}
        </div>
      </section>

      <section id="test-courses" className="mx-auto max-w-6xl scroll-mt-28 px-4 py-16 sm:py-24">
        <div className="max-w-2xl">
          <p className="text-xs font-black tracking-widest text-cyan-700">COURSES & PRICING</p>
          <h2 className="mt-2 text-2xl font-black text-slate-950 sm:text-3xl">교육 과정과 확인된 가격</h2>
          <p className="mt-3 text-sm leading-7 text-slate-600">현재 저장소의 운영 가격표를 기준으로 표시합니다. 풀장 입장료와 장비 렌탈료는 별도이며, 정확한 총액은 일정과 장비 확인 후 안내됩니다.</p>
        </div>
        <div className="mt-9 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {testCourses.map(course => (
            <article key={course.id} className={`overflow-hidden rounded-3xl border bg-white shadow-sm transition ${selectedCourseId === course.id ? 'border-cyan-500 ring-2 ring-cyan-100' : 'border-slate-200 hover:border-cyan-300'}`}>
              <div className="relative h-44 bg-slate-200"><Image src={course.image} alt={`${course.name} 교육 이미지`} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover" /></div>
              <div className="p-5">
                <div className="flex items-start justify-between gap-3"><div><p className="text-[11px] font-bold text-cyan-700">{course.association}</p><h3 className="mt-1 text-xl font-black text-slate-950">{course.name}</h3></div><strong className="shrink-0 rounded-full bg-cyan-50 px-3 py-1.5 text-xs text-cyan-800">{course.headlinePrice}</strong></div>
                <p className="mt-3 text-sm leading-6 text-slate-600">{course.intro}</p>
                <dl className="mt-4 grid gap-2 rounded-2xl bg-slate-50 p-3 text-xs"><div className="flex gap-2"><dt className="w-14 shrink-0 font-bold text-slate-800">시간</dt><dd className="text-slate-600">{course.duration}</dd></div><div className="flex gap-2"><dt className="w-14 shrink-0 font-bold text-slate-800">횟수</dt><dd className="text-slate-600">{course.sessions}</dd></div></dl>
                <details className="mt-4 rounded-xl border border-slate-200 px-3 py-2"><summary className="cursor-pointer text-sm font-bold text-slate-800">단계별 가격 전체 보기</summary><ul className="mt-3 space-y-2 border-t border-slate-100 pt-3">{course.levels.map(level => <li key={level.name} className="text-xs leading-5"><strong className="block text-slate-800">{level.name}</strong><span className="text-slate-600">{level.price}</span></li>)}</ul></details>
                <button type="button" onClick={() => chooseCourse(course.id)} className="mt-4 min-h-12 w-full rounded-xl bg-slate-900 px-4 text-sm font-bold text-white hover:bg-cyan-700">{course.shortName} 상담 신청하기</button>
              </div>
            </article>
          ))}
        </div>
        <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs leading-6 text-amber-900"><strong>가격 외 확인이 필요한 정보</strong><br />체험 과정 외 정확한 수업 시간·횟수, 과정별 세부 자격 조건과 일부 준비물은 저장소에서 확인되지 않아 상담 시 안내로 표시했습니다.</div>
      </section>

      <section id="test-instructors" className="scroll-mt-28 border-y border-slate-200 bg-white px-4 py-16 sm:py-24">
        <div className="mx-auto max-w-6xl">
          <p className="text-xs font-black tracking-widest text-cyan-700">INSTRUCTORS</p>
          <div className="mt-2 flex flex-col justify-between gap-3 sm:flex-row sm:items-end"><div><h2 className="text-2xl font-black text-slate-950 sm:text-3xl">현재 공개 가능한 강사진</h2><p className="mt-2 text-sm leading-6 text-slate-600">승인, 프로필 사진, 교육 과정과 일정 설정을 완료한 공개 프로필만 표시합니다.</p></div>{!instructorsLoading && <span className="w-fit rounded-full bg-cyan-50 px-3 py-1.5 text-xs font-bold text-cyan-800">공개 프로필 {instructors.length}명</span>}</div>
          {instructorsLoading ? <p className="mt-8 rounded-2xl bg-slate-50 p-6 text-center text-sm text-slate-500">강사진을 확인하고 있습니다.</p> : instructors.length === 0 ? <p className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-6 text-center text-sm text-amber-800">현재 공개 가능한 강사 프로필을 불러오지 못했습니다.</p> : (
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {instructors.map(instructor => {
                const capabilities = courseCapabilities(instructor);
                const pools = [instructor.can_passnine ? '칠곡 패스나인' : '', instructor.can_miryang ? '밀양 아리랑' : ''].filter(Boolean);
                return <article key={instructor.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                  <div className="flex items-center gap-4"><div className="h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-slate-200">{instructor.profile_image ? <img src={instructor.profile_image} alt={`${instructor.name} 강사 프로필`} width="80" height="80" loading="lazy" referrerPolicy="no-referrer" className="h-full w-full object-cover" /> : null}</div><div><h3 className="text-lg font-black text-slate-950">{instructor.name} 강사</h3><p className="mt-1 text-xs font-bold text-cyan-700">블루피스 공개 프로필</p></div></div>
                  <ExpandableText text={instructor.bio || '등록된 소개글이 없습니다.'} collapsedLines={4} threshold={90} className="mt-4 whitespace-pre-wrap text-sm leading-6 text-slate-600" buttonClassName="bg-white text-cyan-700 border border-cyan-200" />
                  <div className="mt-4 border-t border-slate-200 pt-4"><p className="text-xs font-black text-slate-800">교육 가능 과정</p><div className="mt-2 flex flex-wrap gap-1.5">{capabilities.length ? capabilities.map(item => <span key={item} className="rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-700">{item}</span>) : <span className="text-xs text-slate-500">프로필 상담 시 확인</span>}</div><p className="mt-3 text-xs text-slate-600"><strong className="text-slate-800">가능 풀장</strong> · {pools.join(' · ') || '상담 시 확인'}</p></div>
                </article>;
              })}
            </div>
          )}
          <p className="mt-5 text-xs leading-5 text-slate-500">강사별 자격증 번호, 발급 기관, 지도 경력은 현재 공개 API에 구조화된 자료가 없어 임의로 표시하지 않았습니다.</p>
        </div>
      </section>

      <section id="test-process" className="mx-auto max-w-6xl scroll-mt-28 px-4 py-16 sm:py-24">
        <div className="grid gap-8 lg:grid-cols-2">
          <div><p className="text-xs font-black tracking-widest text-cyan-700">MATCHING PROCESS</p><h2 className="mt-2 text-2xl font-black text-slate-950 sm:text-3xl">상담 신청부터 예약 확정까지</h2><p className="mt-3 text-sm leading-7 text-slate-600">선택한 과정과 풀장별 요일·시간대를 기준으로 교육 가능한 강사를 확인합니다.</p><ol className="mt-6 space-y-3">{[
            ['1', '상담 신청', '과정, 연락처, 희망 풀장과 일정을 남깁니다.'],
            ['2', '강사 가능 여부 확인', '선택 과정과 일정에 맞는 강사를 확인합니다.'],
            ['3', '연락 상담', '세부 목표, 준비물, 예상 추가 비용을 확인합니다.'],
            ['4', '일정 조율 및 예약 확정', '풀장 일정과 결제·변경 기준을 확인한 뒤 예약을 확정합니다.'],
          ].map(step => <li key={step[0]} className="flex gap-3 rounded-2xl border border-slate-200 bg-white p-4"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-cyan-700 text-sm font-black text-white">{step[0]}</span><div><h3 className="font-black text-slate-900">{step[1]}</h3><p className="mt-1 text-xs leading-5 text-slate-600">{step[2]}</p></div></li>)}</ol></div>
          <div className="rounded-3xl bg-slate-900 p-6 text-white sm:p-8"><p className="text-xs font-black tracking-widest text-cyan-300">SAFETY INFORMATION</p><h2 className="mt-2 text-2xl font-black">수업 전 확인하는 안전 절차</h2><ul className="mt-6 space-y-4 text-sm leading-6 text-slate-200"><li>• 신청자의 수영 경험, 물 적응 정도, 목표 과정을 상담합니다.</li><li>• 과정과 수강생 조건에 맞는 강사의 가능 일정을 확인합니다.</li><li>• 풀장, 회차, 준비물과 별도 비용을 예약 확정 전에 다시 안내합니다.</li><li>• 당일 컨디션에 맞춰 단계적으로 수업한다는 기존 운영 안내를 따릅니다.</li></ul><p className="mt-6 rounded-2xl bg-white/10 p-4 text-xs leading-5 text-slate-300">강사 대 교육생 비율이나 감독 인원처럼 확인되지 않은 수치는 표시하지 않았습니다.</p></div>
        </div>
      </section>

      <section id="test-consultation" className="scroll-mt-28 border-y border-slate-200 bg-white px-4 py-16 sm:py-24">
        <div className="mx-auto max-w-3xl">
          <p className="text-center text-xs font-black tracking-widest text-cyan-700">TEST CONSULTATION</p><h2 className="mt-2 text-center text-2xl font-black text-slate-950 sm:text-3xl">교육 상담 신청 연습</h2><p className="mx-auto mt-3 max-w-xl text-center text-sm leading-7 text-slate-600">예약 확정이 아닌 상담 신청 단계입니다. 이 테스트 폼은 네트워크 요청을 보내지 않으며 입력 내용은 저장되지 않습니다.</p>
          <form noValidate onSubmit={handleSubmit} className="mt-8 space-y-6 rounded-3xl border border-slate-200 bg-slate-50 p-4 shadow-sm sm:p-7">
            <fieldset><legend className="text-sm font-black text-slate-900">1. 상담 과정</legend><label htmlFor="test-course" className="mt-3 block text-xs font-bold text-slate-600">원하는 과정</label><select id="test-course" value={selectedCourseId} onChange={event => chooseCourse(event.target.value, false)} aria-invalid={Boolean(errors.course)} aria-describedby={errors.course ? 'test-course-error' : undefined} className="mt-1 min-h-12 w-full rounded-xl border border-slate-300 bg-white px-3 text-base"><option value="">과정을 선택해 주세요</option>{testCourses.map(course => <option key={course.id} value={course.id}>{course.name}</option>)}</select>{errors.course ? <p id="test-course-error" role="alert" className="mt-1 text-xs font-bold text-rose-600">{errors.course}</p> : null}
              {selectedCourse ? <><label htmlFor="test-level" className="mt-4 block text-xs font-bold text-slate-600">세부 과정</label><select id="test-level" value={selectedLevel} onChange={event => { setSelectedLevel(event.target.value); setErrors(previous => ({ ...previous, level: undefined })); }} aria-invalid={Boolean(errors.level)} className="mt-1 min-h-12 w-full rounded-xl border border-slate-300 bg-white px-3 text-base"><option value="">세부 과정을 선택해 주세요</option>{selectedCourse.levels.map(level => <option key={level.name} value={level.name}>{level.name}</option>)}</select>{errors.level ? <p role="alert" className="mt-1 text-xs font-bold text-rose-600">{errors.level}</p> : null}{selectedPrice ? <p className="mt-3 rounded-xl bg-cyan-50 p-3 text-sm font-bold leading-6 text-cyan-900">안내 가격 · {selectedPrice}</p> : null}<button type="button" onClick={() => scrollToId('test-courses')} className="mt-2 text-xs font-bold text-cyan-700 underline underline-offset-4">다른 과정 비교하기</button></> : null}
            </fieldset>

            <fieldset className="border-t border-slate-200 pt-6"><legend className="text-sm font-black text-slate-900">2. 연락받을 정보</legend><div className="mt-3 grid gap-4 sm:grid-cols-2"><label className="text-xs font-bold text-slate-600">성함<input id="test-name" value={name} onChange={event => { setName(event.target.value); setErrors(previous => ({ ...previous, name: undefined })); }} aria-invalid={Boolean(errors.name)} className="mt-1 min-h-12 w-full rounded-xl border border-slate-300 bg-white px-3 text-base" placeholder="성함 입력" />{errors.name ? <span role="alert" className="mt-1 block text-xs text-rose-600">{errors.name}</span> : null}</label><label className="text-xs font-bold text-slate-600">휴대폰 번호<input id="test-phone" inputMode="numeric" value={phone} onChange={event => { setPhone(formatPhone(event.target.value)); setErrors(previous => ({ ...previous, phone: undefined })); }} aria-invalid={Boolean(errors.phone)} className="mt-1 min-h-12 w-full rounded-xl border border-slate-300 bg-white px-3 text-base" placeholder="010-0000-0000" />{errors.phone ? <span role="alert" className="mt-1 block text-xs text-rose-600">{errors.phone}</span> : null}</label></div></fieldset>

            {selectedCourseId === 'youth' ? <fieldset className="rounded-2xl border border-cyan-200 bg-cyan-50 p-4"><legend className="px-1 text-sm font-black text-cyan-950">유스 과정 추가 정보</legend><div className="grid gap-4 sm:grid-cols-2"><label className="text-xs font-bold text-cyan-900">수강 인원<input id="test-youthCount" type="number" min="1" max="20" value={youthCount} onChange={event => { setYouthCount(event.target.value); setErrors(previous => ({ ...previous, youthCount: undefined })); }} className="mt-1 min-h-12 w-full rounded-xl border border-cyan-200 bg-white px-3 text-base" placeholder="예: 2" />{errors.youthCount ? <span role="alert" className="mt-1 block text-xs text-rose-600">{errors.youthCount}</span> : null}</label><label className="text-xs font-bold text-cyan-900">수강생 연령<input id="test-youthAges" value={youthAges} onChange={event => { setYouthAges(event.target.value); setErrors(previous => ({ ...previous, youthAges: undefined })); }} className="mt-1 min-h-12 w-full rounded-xl border border-cyan-200 bg-white px-3 text-base" placeholder="예: 만 12세, 만 14세" />{errors.youthAges ? <span role="alert" className="mt-1 block text-xs text-rose-600">{errors.youthAges}</span> : null}</label></div></fieldset> : null}

            <fieldset className="border-t border-slate-200 pt-6"><legend className="text-sm font-black text-slate-900">3. 희망 풀장·요일·시간대</legend><div id="test-pool" tabIndex={-1} className="mt-3 grid gap-3 sm:grid-cols-2">{Object.entries(poolOptions).map(([key, option]) => <label key={key} className={`flex min-h-14 cursor-pointer items-center gap-3 rounded-xl border p-3 text-sm font-bold ${pool === key ? 'border-cyan-500 bg-cyan-50 text-cyan-900' : 'border-slate-300 bg-white text-slate-700'}`}><input type="radio" name="test-pool" checked={pool === key} onChange={() => changePool(key as keyof typeof poolOptions)} className="h-5 w-5 accent-cyan-700" />{option.name}</label>)}</div>{errors.pool ? <p role="alert" className="mt-1 text-xs font-bold text-rose-600">{errors.pool}</p> : null}<div aria-disabled="true" className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3"><p className="text-sm font-bold text-slate-800">대구 두류풀장 · 선택 불가</p><p className="mt-1 text-xs leading-5 text-amber-800">기존 홈페이지 안내 기준 2026.10.17 내부 공사 중입니다. 이용 가능 여부는 상담 시 다시 확인합니다.</p></div>
              {pool ? <div className="mt-5 space-y-5"><div><p className="text-xs font-bold text-slate-600">가능한 요일</p><div id="test-days" tabIndex={-1} className="mt-2 grid grid-cols-4 gap-2 sm:grid-cols-8">{dayOptions.map(day => <button key={day} type="button" aria-pressed={days.includes(day)} onClick={() => toggleDay(day)} className={`min-h-11 rounded-xl border text-sm font-bold ${days.includes(day) ? 'border-cyan-600 bg-cyan-700 text-white' : 'border-slate-300 bg-white text-slate-600'}`}>{day}</button>)}</div>{errors.days ? <p role="alert" className="mt-1 text-xs font-bold text-rose-600">{errors.days}</p> : null}</div><div><label htmlFor="test-time" className="text-xs font-bold text-slate-600">희망 시간대</label><select id="test-time" value={time} onChange={event => { setTime(event.target.value); setErrors(previous => ({ ...previous, time: undefined })); }} className="mt-1 min-h-12 w-full rounded-xl border border-slate-300 bg-white px-3 text-base"><option value="">시간대를 선택해 주세요</option>{poolOptions[pool].times.map(option => <option key={option} value={option}>{option}</option>)}</select>{errors.time ? <p role="alert" className="mt-1 text-xs font-bold text-rose-600">{errors.time}</p> : null}</div></div> : null}
            </fieldset>

            <div id="privacy" className="border-t border-slate-200 pt-6"><label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-slate-300 bg-white p-4 text-sm leading-6 text-slate-600"><input id="test-privacy" type="checkbox" checked={privacyAccepted} onChange={event => { setPrivacyAccepted(event.target.checked); setErrors(previous => ({ ...previous, privacy: undefined })); }} className="mt-1 h-5 w-5 shrink-0 accent-cyan-700" /><span><strong className="text-slate-900">개인정보 수집 안내 확인 (테스트)</strong><br />운영 폼에서 상담을 위해 사용하는 항목을 연습 입력합니다. 테스트에서는 브라우저 상태에만 잠시 표시되며 서버, 데이터베이스, 운영자에게 전송되지 않습니다. 운영 보관 기간과 상세 처리방침은 현재 저장소에서 확인이 필요합니다.</span></label>{errors.privacy ? <p role="alert" className="mt-1 text-xs font-bold text-rose-600">{errors.privacy}</p> : null}</div>
            <button type="submit" className="min-h-14 w-full rounded-2xl bg-cyan-700 px-5 text-base font-black text-white shadow-lg shadow-cyan-700/20">테스트 상담 신청 완료 화면 보기</button>
          </form>
        </div>
      </section>

      <section id="test-faq" className="mx-auto max-w-4xl scroll-mt-28 px-4 py-16 sm:py-24"><p className="text-center text-xs font-black tracking-widest text-cyan-700">FAQ</p><h2 className="mt-2 text-center text-2xl font-black text-slate-950">상담 전 자주 묻는 질문</h2><div className="mt-8 space-y-3">{testFaqs.map((faq, index) => <div key={faq.question} className="rounded-2xl border border-slate-200 bg-white p-4"><button type="button" aria-expanded={openFaq === index} onClick={() => setOpenFaq(openFaq === index ? null : index)} className="flex min-h-10 w-full items-center justify-between gap-4 text-left text-sm font-bold text-slate-900"><span>Q. {faq.question}</span><span aria-hidden="true" className="text-cyan-700">{openFaq === index ? '−' : '+'}</span></button>{openFaq === index ? <p className="mt-3 border-t border-slate-100 pt-3 text-sm leading-7 text-slate-600">A. {faq.answer}</p> : null}</div>)}</div></section>

      <section className="border-y border-slate-200 bg-white px-4 py-16"><div className="mx-auto max-w-6xl"><div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end"><div><p className="text-xs font-black tracking-widest text-cyan-700">REVIEWS</p><h2 className="mt-2 text-2xl font-black text-slate-950">기존 네이버 후기 요약</h2></div><a href={reviewUrl} target="_blank" rel="noreferrer" className="text-sm font-bold text-cyan-700 underline underline-offset-4">네이버 원문 목록 확인 ↗</a></div><div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{testReviews.map(review => <article key={review.title} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><p className="text-xs font-bold text-cyan-700">{review.course}</p><h3 className="mt-2 font-black text-slate-900">{review.title}</h3><p className="mt-3 text-xs leading-6 text-slate-600">“{review.quote}”</p><p className="mt-4 text-[11px] text-slate-500">{review.author} · 작성 시기와 개별 원문은 네이버 목록에서 확인</p></article>)}</div></div></section>

      <section className="mx-auto max-w-6xl px-4 py-16"><p className="text-center text-xs font-black tracking-widest text-cyan-700">GALLERY</p><h2 className="mt-2 text-center text-2xl font-black text-slate-950">실제 블루피스 수중 사진</h2><div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3">{galleryImages.map((src, index) => <div key={src} className="relative h-44 overflow-hidden rounded-2xl bg-slate-200 sm:h-64"><Image src={src} alt={`블루피스 수중 교육 및 촬영 사진 ${index + 1}`} fill sizes="(max-width: 640px) 50vw, 33vw" className="object-cover" /></div>)}</div></section>

      <section className="border-t border-slate-200 bg-slate-900 px-4 py-16 text-white"><div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-2"><div><p className="text-xs font-black tracking-widest text-cyan-300">LOCATION</p><h2 className="mt-2 text-2xl font-black">블루피스 센터</h2><p className="mt-4 text-sm leading-7 text-slate-300">경상북도 칠곡군 북삼읍 인강1길 38-12, 1층</p><div className="mt-5 rounded-2xl bg-white/10 p-4 text-sm leading-6 text-slate-200"><strong className="text-white">주차 안내</strong><br />기존 홈페이지에는 센터 건물 전용 주차장과 인근 골목 주차가 안내되어 있습니다. 현장 상황은 방문 전에 확인해 주세요.</div><a href={mapUrl} target="_blank" rel="noreferrer" className="mt-5 inline-flex min-h-12 items-center rounded-xl bg-cyan-600 px-5 text-sm font-bold text-white">네이버 지도에서 길찾기 ↗</a></div><div className="overflow-hidden rounded-3xl bg-white"><iframe src="https://maps.google.com/maps?q=%EA%B2%BD%EC%83%81%EB%B6%81%EB%8F%84%20%EC%B9%A0%EA%B3%A1%EA%B5%B0%20%EB%B6%81%EC%82%BC%EC%9D%8D%20%EC%9D%B8%EA%B0%951%EA%B8%B8%2038-12&z=17&hl=ko&output=embed" title="블루피스 센터 지도" loading="lazy" referrerPolicy="no-referrer-when-downgrade" className="h-80 w-full border-0" /></div></div></section>

      <footer className="border-t border-slate-700 bg-slate-950 px-4 py-8 text-center text-xs leading-6 text-slate-400"><p className="font-bold text-amber-300">현재 화면은 테스트 페이지이며 운영 문의를 접수하지 않습니다.</p><p className="mt-2">블루피스 · 대표 김상욱 · 사업자등록번호 460-44-01113</p><Link href="/" className="mt-3 inline-block font-bold text-cyan-300 underline underline-offset-4">운영 홈페이지로 이동</Link></footer>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 p-3 shadow-[0_-8px_30px_rgba(15,23,42,0.12)] backdrop-blur md:hidden">
        <div className="mx-auto grid max-w-md grid-cols-2 gap-2">
          <button type="button" onClick={() => scrollToId('test-courses')} className="min-h-12 rounded-xl border border-slate-300 bg-white px-3 text-sm font-bold text-slate-700">과정 비교</button>
          <button type="button" onClick={() => scrollToId('test-consultation')} className="min-h-12 rounded-xl bg-cyan-700 px-3 text-sm font-black text-white">상담 신청 연습</button>
        </div>
      </div>

      {submitted ? <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="test-complete-title"><div className="w-full max-w-md rounded-3xl bg-white p-6 text-center shadow-2xl sm:p-8"><span className="text-4xl" aria-hidden="true">🧪</span><h2 id="test-complete-title" className="mt-3 text-xl font-black text-slate-950">테스트 상담 신청 화면 완료</h2><p className="mt-3 text-sm leading-7 text-slate-600">입력한 내용은 서버나 운영 데이터베이스로 전송되지 않았고 운영자에게 알림도 발송되지 않았습니다.</p><div className="mt-5 rounded-2xl bg-slate-50 p-4 text-left text-xs leading-6 text-slate-600"><p><strong className="text-slate-900">선택 과정</strong> · {selectedCourse?.name} / {selectedLevel}</p><p><strong className="text-slate-900">희망 일정</strong> · {pool ? poolOptions[pool].name : ''} / {days.join(' · ')} / {time}</p><p><strong className="text-slate-900">다음 실제 절차</strong> · 상담 → 강사 확인 → 일정 조율 → 예약 확정</p></div><button type="button" onClick={() => setSubmitted(false)} className="mt-5 min-h-12 w-full rounded-xl bg-slate-900 px-4 text-sm font-bold text-white">입력 화면으로 돌아가기</button></div></div> : null}
    </main>
  );
}
