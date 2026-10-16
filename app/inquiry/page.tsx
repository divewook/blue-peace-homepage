'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { getMarketingAttribution } from '../../components/marketing-attribution';
import ExpandableText from '../../components/expandable-text';
import DivingMatcherAnimation from '../../components/diving-matcher-animation';


const dayLabels: Record<string, string> = {
  available_mon: '월', available_tue: '화', available_wed: '수', available_thu: '목',
  available_fri: '금', available_sat: '토', available_sun: '일',
};
const passnineTimeLabels: Record<string, string> = {
  t1: '1부 (09:00~11:30)', t2: '2부 (12:30~15:00)',
  t3: '3부 (16:00~18:30)', t4: '4부 (19:30~22:00)',
};
const miryangTimeLabels: Record<string, string> = {
  t0: '오전부 (08:00~10:00) ※주말만', t1: '1부 (10:00~12:00)',
  t2: '2부 (12:00~14:00)', t3: '3부 (14:00~16:00)',
  t4: '4부 (16:00~18:00)', t5: '5부 (18:00~20:00)', t6: '6부 (20:00~22:00)',
};

interface Instructor {
  id: string;
  name: string;
  profile_image: string | null;
  phone: string | null;
  bio: string | null;
  is_approved: boolean;
  can_passnine: boolean;
  can_miryang: boolean;
  available_mon: boolean;
  available_tue: boolean;
  available_wed: boolean;
  available_thu: boolean;
  available_fri: boolean;
  available_sat: boolean;
  available_sun: boolean;
  passnine_t1: boolean;
  passnine_t2: boolean;
  passnine_t3: boolean;
  passnine_t4: boolean;
  miryang_t0: boolean;
  miryang_t1: boolean;
  miryang_t2: boolean;
  miryang_t3: boolean;
  miryang_t4: boolean;
  miryang_t5: boolean;
  miryang_t6: boolean;
}

const courseLevelOptions: { [key: string]: string[] } = {
  '프리다이빙': ['체험 과정', '1레벨 (프리다이버)', '2레벨 (오픈워터)', '3레벨 (어드밴스드)', '4레벨 (마스터)', '강사 과정', '1+2레벨 패키지', '3+4레벨 패키지'],
  '머메이드 다이빙': ['체험 과정', '1레벨 (베이직 머메이드)', '2레벨 (머메이드)', '3레벨 (오션 머메이드)', '머메이드 강사 과정', '베이직+머메이드 패키지', '머메이드+오션 패키지'],
  '유스 프리다이빙': ['체험 과정', '1레벨 (돌핀)', '2레벨 (오르카)', '3레벨 (샤크)', '유스 강사 과정', '돌핀+오르카 패키지', '오르카+샤크 패키지'],
  '수중레저안전요원': ['수중레저안전요원', '마스터 안전요원', '안전요원 강사 과정'],
  '스쿠버다이빙': ['체험 과정', '오픈워터', '어드벤처', '어드밴스드', '오픈워터+어드밴스드 패키지'],
  '스페셜 교육': ['응급처치 및 CPR 교육', '응급처치 CPR 강사 과정', '수중 사진 촬영 교육'],
};

const coursePriceTable: { [key: string]: string } = {
  '프리다이빙:체험 과정': '5만원 (입장료/장비 별도)',
  '1레벨 (프리다이버)': '15만원 (교육비+발급비 포함)',
  '2레벨 (오픈워터)': '35만원 (교육비+발급비 포함)',
  '3레벨 (어드밴스드)': '55만원 (교육비+발급비 포함 / 무제한 트레이닝)',
  '4레벨 (마스터)': '85만원 (교육비+발급비 포함 / 무제한 트레이닝)',
  '1+2레벨 패키지': '40만원 (교육비+발급비 포함 / 패키지 할인)',
  '3+4레벨 패키지': '130만원 (교육비+발급비 포함 / 패키지 할인)',
  
  '머메이드 다이빙:체험 과정': '10만원 (입장료/장비 별도)',
  '1레벨 (베이직 머메이드)': '35만원 (교육비+발급비 포함)',
  '2레벨 (머메이드)': '45만원 (교육비+발급비 포함)',
  '3레벨 (오션 머메이드)': '55만원 (교육비+발급비 포함)',
  '베이직+머메이드 패키지': '70만원 (교육비+발급비 포함 / 패키지 할인)',
  '머메이드+오션 패키지': '90만원 (교육비+발급비 포함 / 패키지 할인)',

  '유스 프리다이빙:체험 과정': '10만원 (입장료/장비 별도)',
  '1레벨 (돌핀)': '35만원 (교육비+발급비 포함)',
  '2레벨 (오르카)': '45만원 (교육비+발급비 포함)',
  '3레벨 (샤크)': '55만원 (교육비+발급비 포함)',
  '돌핀+오르카 패키지': '70만원 (교육비+발급비 포함 / 패키지 할인)',
  '오르카+샤크 패키지': '90만원 (교육비+발급비 포함 / 패키지 할인)',

  '수중레저안전요원': '35만원 (교육비+발급비 포함)',
  '마스터 안전요원': '55만원 (교육비+발급비 포함)',

  '스쿠버다이빙:체험 과정': '10만원 (입장료/장비 별도)',
  '오픈워터': '50만원 (교육비+발급비 포함)',
  '어드벤처': '50만원 (교육비+발급비 포함)',
  '어드밴스드': '60만원 (교육비+발급비 포함)',
  '오픈워터+어드밴스드 패키지': '100만원 (교육비+발급비 포함 / 패키지 할인)',

  '응급처치 및 CPR 교육': '15만원 (국제 자격 발급비 포함)',
  '수중 사진 촬영 교육': '15만원 (촬영 테크닉 레슨)',
  '강사 과정': '별도 상담 문의',
  '머메이드 강사 과정': '별도 상담 문의',
  '유스 강사 과정': '별도 상담 문의',
  '안전요원 강사 과정': '별도 상담 문의',
  '응급처치 CPR 강사 과정': '별도 상담 문의',
};

const getPriceText = (courseName: string, levelName: string) => {
  if (levelName === '체험 과정') {
    return coursePriceTable[`${courseName}:${levelName}`] || '10만원 (입장료/장비 별도)';
  }
  return coursePriceTable[levelName] || '상담 시 안내';
};

function InquiryFormContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialCourseParam = searchParams.get('course');

  const getInitialCourse = (param: string | null) => {
    switch (param) {
      case 'freediving': return '프리다이빙';
      case 'mermaid': return '머메이드 다이빙';
      case 'youth': return '유스 프리다이빙';
      case 'safety': return '수중레저안전요원';
      case 'scuba': return '스쿠버다이빙';
      case 'special': return '스페셜 교육';
      default: return '프리다이빙';
    }
  };

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [course, setCourse] = useState(() => getInitialCourse(initialCourseParam));
  const [detailLevel, setDetailLevel] = useState(courseLevelOptions['프리다이빙'][0]);

  const [selectedDays, setSelectedDays] = useState<{ [key: string]: boolean }>({
    available_mon: true,
    available_tue: false,
    available_wed: false,
    available_thu: false,
    available_fri: false,
    available_sat: false,
    available_sun: false,
  });

  const [canPassnine, setCanPassnine] = useState(true);
  const [passnineSlots, setPassnineSlots] = useState<{ [key: string]: boolean }>({
    t1: true, t2: false, t3: false, t4: false
  });

  const [canMiryang, setCanMiryang] = useState(false);
  const [miryangSlots, setMiryangSlots] = useState<{ [key: string]: boolean }>({
    t0: false, t1: false, t2: false, t3: false, t4: false, t5: false, t6: false
  });

  const [matchedInstructor, setMatchedInstructor] = useState<Instructor | null>(null);
  const [noMatchFound, setNoMatchFound] = useState(false);
  const [submissionError, setSubmissionError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);

  useEffect(() => {
    if (initialCourseParam) {
      const selected = getInitialCourse(initialCourseParam);
      setCourse(selected);
      setDetailLevel(courseLevelOptions[selected][0]);
    }
  }, [initialCourseParam]);

  const handleCourseChange = (selectedCourse: string) => {
    setCourse(selectedCourse);
    setDetailLevel(courseLevelOptions[selectedCourse][0]);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/[^0-9]/g, '').slice(0, 11);
    let formatted = rawValue;
    if (rawValue.length > 3 && rawValue.length <= 7) {
      formatted = `${rawValue.slice(0, 3)}-${rawValue.slice(3)}`;
    } else if (rawValue.length > 7) {
      formatted = `${rawValue.slice(0, 3)}-${rawValue.slice(3, 7)}-${rawValue.slice(7)}`;
    }
    setPhone(formatted);
  };

  const toggleDay = (key: string) => {
    setSelectedDays(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleOpenConfirmModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) {
      alert('성함과 연락처를 입력해 주세요.');
      return;
    }
    if (!privacyAccepted) {
      alert('개인정보 수집 및 이용에 동의해 주세요.');
      return;
    }
    setShowConfirmModal(true);
  };

  const handleFinalSubmit = async () => {
    if (submitting) return;
    setShowConfirmModal(false);
    setSubmitting(true);
    setMatchedInstructor(null);
    setNoMatchFound(false);
    setSubmissionError('');
    setShowResultModal(false);

    const randomDelay = Math.floor(Math.random() * 2001) + 3000;

    setTimeout(async () => {
      try {
      const instructorResponse = await fetch('/api/public/instructors', { cache: 'no-store' });
      const instructorResult = await instructorResponse.json().catch(() => ({}));
      if (!instructorResponse.ok) throw new Error(instructorResult.error || '강사 정보를 불러오지 못했습니다. 다시 시도해 주세요.');
      const instructors = instructorResult.instructors as Instructor[];
      if (!instructors || instructors.length === 0) {
        setSubmitting(false);
        setNoMatchFound(true);
        setShowResultModal(true);
        return;
      }

      const qualifiedInstructors = instructors.filter((ins: Instructor) => {
        const dayMatch = Object.keys(selectedDays).some(dayKey => selectedDays[dayKey] && ins[dayKey as keyof Instructor]);
        if (!dayMatch) return false;

        let passnineMatch = false;
        if (canPassnine && ins.can_passnine) {
          if ((passnineSlots.t1 && ins.passnine_t1) ||
              (passnineSlots.t2 && ins.passnine_t2) ||
              (passnineSlots.t3 && ins.passnine_t3) ||
              (passnineSlots.t4 && ins.passnine_t4)) {
            passnineMatch = true;
          }
        }

        let miryangMatch = false;
        if (canMiryang && ins.can_miryang) {
          if ((miryangSlots.t0 && ins.miryang_t0) ||
              (miryangSlots.t1 && ins.miryang_t1) ||
              (miryangSlots.t2 && ins.miryang_t2) ||
              (miryangSlots.t3 && ins.miryang_t3) ||
              (miryangSlots.t4 && ins.miryang_t4) ||
              (miryangSlots.t5 && ins.miryang_t5) ||
              (miryangSlots.t6 && ins.miryang_t6)) {
            miryangMatch = true;
          }
        }

        if (!passnineMatch && !miryangMatch) return false;
        return true;
      });

      if (qualifiedInstructors.length === 0) {
        setNoMatchFound(true);
      } else {
        const randomIndex = Math.floor(Math.random() * qualifiedInstructors.length);
        const selected = qualifiedInstructors[randomIndex];
        const preferredDays = Object.entries(selectedDays)
          .filter(([, selectedDay]) => selectedDay)
          .map(([day]) => dayLabels[day]);
        const preferredSchedule = {
          ...(canPassnine ? {
            '칠곡 패스나인': Object.entries(passnineSlots)
              .filter(([, selectedTime]) => selectedTime)
              .map(([slot]) => passnineTimeLabels[slot]),
          } : {}),
          ...(canMiryang ? {
            '밀양 아리랑': Object.entries(miryangSlots)
              .filter(([, selectedTime]) => selectedTime)
              .map(([slot]) => miryangTimeLabels[slot]),
          } : {}),
        };
        const response = await fetch('/api/matches', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name,
            phone,
            course: `${course} (${detailLevel})`,
            pool: canPassnine && canMiryang ? '패스나인/밀양' : canPassnine ? '칠곡 패스나인' : '밀양 아리랑',
            time_slot: [...preferredDays, ...Object.values(preferredSchedule).flat()].join(' · '),
            preferred_days: preferredDays,
            preferred_schedule: preferredSchedule,
            attribution: getMarketingAttribution(),
            instructor_id: selected.id,
          }),
        });
        const result = await response.json();
        if (!response.ok || !result.id) throw new Error(result.error || '신청 내용을 저장하지 못했습니다.');
        setMatchedInstructor({ ...selected, phone: result.instructor?.phone || null });
      }
      } catch (saveError) {
        setSubmissionError(saveError instanceof Error ? saveError.message : '신청 내용을 저장하지 못했습니다. 다시 시도해 주세요.');
      }
      setSubmitting(false);
      setShowResultModal(true);
    }, randomDelay);
  };

  const handleCloseAndGoHome = () => {
    setShowResultModal(false);
    router.push('/');
  };

  return (
    <div className="bg-white border border-slate-200 p-5 sm:p-8 rounded-3xl shadow-xl max-w-xl mx-auto text-slate-800">
      
      <h2 className="text-xl sm:text-2xl font-black text-slate-900 mb-6 text-center">🌊 수강생 맞춤 강사 매칭 신청</h2>

      <form id="match-request-form" onSubmit={handleOpenConfirmModal} className="space-y-6">
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">성함</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="성함을 입력하세요"
              autoComplete="name"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-base text-slate-900 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-100"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">연락처</label>
            <input
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              value={phone}
              onChange={handlePhoneChange}
              placeholder="010-0000-0000"
              maxLength={13}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-base text-slate-900 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-100"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-2">1. 희망 교육 코스 분야</label>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {[
              '프리다이빙', '머메이드 다이빙', '유스 프리다이빙',
              '수중레저안전요원', '스쿠버다이빙', '스페셜 교육'
            ].map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => handleCourseChange(c)}
                className={`min-h-12 px-3 py-3 rounded-xl text-sm font-bold leading-5 border transition cursor-pointer ${
                  course === c
                    ? 'bg-cyan-600 border-cyan-500 text-white shadow-sm'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
          <div className="mb-3 flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between">
            <label className="block text-xs font-bold text-cyan-700">2. [{course}] 세부 과정 선택</label>
            <span className="text-xs font-extrabold text-cyan-800 bg-cyan-100 px-3 py-1.5 rounded-full leading-5">
              💰 {getPriceText(course, detailLevel)}
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {courseLevelOptions[course]?.map((lvl) => (
              <button
                key={lvl}
                type="button"
                onClick={() => setDetailLevel(lvl)}
                className={`min-h-12 py-3 px-3 rounded-xl text-sm leading-5 font-medium border transition cursor-pointer ${
                  detailLevel === lvl
                    ? 'bg-cyan-600 border-cyan-500 text-white font-bold shadow-sm'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>
          
          <p className="text-xs text-slate-500 mt-4 leading-6 border-t border-slate-200 pt-3">
            ※ 체험 과정을 제외한 모든 과정은 교육비+발급비 포함이며, 지역별 풀장 입장료와 장비 렌탈료는 별도입니다.
          </p>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-2">3. 희망 수업 요일 (복수 선택 가능)</label>
          <div className="grid grid-cols-4 gap-2 sm:grid-cols-7">
            {[
              { key: 'available_mon', label: '월' },
              { key: 'available_tue', label: '화' },
              { key: 'available_wed', label: '수' },
              { key: 'available_thu', label: '목' },
              { key: 'available_fri', label: '금' },
              { key: 'available_sat', label: '토' },
              { key: 'available_sun', label: '일' },
            ].map((d) => (
              <button
                key={d.key}
                type="button"
                onClick={() => toggleDay(d.key)}
                className={`min-h-11 rounded-xl text-sm font-bold border transition cursor-pointer ${
                  selectedDays[d.key]
                    ? 'bg-cyan-600 border-cyan-500 text-white shadow-sm'
                    : 'bg-slate-50 border-slate-200 text-slate-600'
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>

        {/* 칠곡 패스나인 풀장 세부 시간대 (정확한 시간대 적용) */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2.5">
          <label className="flex min-h-12 items-center gap-3 rounded-xl p-2 text-sm font-bold leading-6 text-slate-900 cursor-pointer">
            <input
              type="checkbox"
              checked={canPassnine}
              onChange={(e) => setCanPassnine(e.target.checked)}
              className="accent-cyan-600 w-5 h-5 shrink-0"
            />
            <span>칠곡 패스나인 풀장 (시간대 복수 선택 가능)</span>
          </label>
          {canPassnine && (
            <div className="grid grid-cols-1 gap-2 pt-1 min-[430px]:grid-cols-2">
              {[
                { key: 't1', label: '1부 (09:00~11:30)' },
                { key: 't2', label: '2부 (12:30~15:00)' },
                { key: 't3', label: '3부 (16:00~18:30)' },
                { key: 't4', label: '4부 (19:30~22:00)' },
              ].map((t) => (
                <label key={t.key} className={`flex min-h-12 items-center gap-3 text-sm leading-5 p-3 rounded-xl border cursor-pointer ${passnineSlots[t.key] ? 'bg-cyan-50 border-cyan-500 text-cyan-900 font-bold' : 'bg-white border-slate-200 text-slate-600'}`}>
                  <input
                    type="checkbox"
                    checked={passnineSlots[t.key]}
                    onChange={(e) => setPassnineSlots({ ...passnineSlots, [t.key]: e.target.checked })}
                    className="accent-cyan-600 w-5 h-5 shrink-0"
                  />
                  <span>{t.label}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* 밀양 아리랑 풀장 세부 시간대 (정확한 시간대 적용) */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2.5">
          <label className="flex min-h-12 items-center gap-3 rounded-xl p-2 text-sm font-bold leading-6 text-slate-900 cursor-pointer">
            <input
              type="checkbox"
              checked={canMiryang}
              onChange={(e) => setCanMiryang(e.target.checked)}
              className="accent-cyan-600 w-5 h-5 shrink-0"
            />
            <span>밀양 아리랑 풀장 (시간대 복수 선택 가능)</span>
          </label>
          {canMiryang && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              {[
                { key: 't0', label: '오전부 (08:00~10:00) ※주말만' },
                { key: 't1', label: '1부 (10:00~12:00)' },
                { key: 't2', label: '2부 (12:00~14:00)' },
                { key: 't3', label: '3부 (14:00~16:00)' },
                { key: 't4', label: '4부 (16:00~18:00)' },
                { key: 't5', label: '5부 (18:00~20:00)' },
                { key: 't6', label: '6부 (20:00~22:00)' },
              ].map((t) => (
                <label key={t.key} className={`flex min-h-12 items-center gap-3 text-sm leading-5 p-3 rounded-xl border cursor-pointer ${miryangSlots[t.key] ? 'bg-cyan-50 border-cyan-500 text-cyan-900 font-bold' : 'bg-white border-slate-200 text-slate-600'}`}>
                  <input
                    type="checkbox"
                    checked={miryangSlots[t.key]}
                    onChange={(e) => setMiryangSlots({ ...miryangSlots, [t.key]: e.target.checked })}
                    className="accent-cyan-600 w-5 h-5 shrink-0"
                  />
                  <span>{t.label}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        <div aria-disabled="true" className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <div className="flex items-start gap-2">
            <input type="checkbox" disabled className="mt-0.5 h-4 w-4" aria-label="대구 두류풀장 선택 불가" />
            <div>
              <p className="text-xs font-bold text-slate-800">대구 두류풀장</p>
              <p className="mt-1 text-xs font-semibold text-amber-800">내부 공사 중으로 현재 일시 이용이 불가합니다.</p>
            </div>
          </div>
        </div>

        <label className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-600 cursor-pointer">
          <input
            type="checkbox"
            checked={privacyAccepted}
            onChange={(event) => setPrivacyAccepted(event.target.checked)}
            className="mt-0.5 h-5 w-5 shrink-0 accent-cyan-600"
            required
          />
          <span><strong className="text-slate-800">개인정보 수집 및 이용 동의 (필수)</strong><br />강사 매칭과 상담, 서비스 분석을 위해 이름·연락처·신청 조건·유입 경로 정보가 저장됩니다.</span>
        </label>

        <button
          type="submit"
          className="hidden md:block w-full min-h-14 py-4 bg-cyan-600 hover:bg-cyan-500 rounded-2xl text-white text-base font-extrabold transition shadow-lg shadow-cyan-600/20 mt-2 cursor-pointer"
        >
          🎯 선택 옵션 및 예상 금액 확인 후 매칭하기
        </button>

        <button
          type="button"
          onClick={() => router.push('/')}
          className="w-full py-2 text-xs font-bold text-slate-500 hover:text-cyan-700 transition cursor-pointer"
        >
          ← 메인페이지로 이동하기
        </button>
      </form>

      {!showConfirmModal && !submitting && !showResultModal && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-cyan-100 bg-white/95 px-4 pt-3 shadow-[0_-8px_24px_rgba(15,23,42,0.14)] backdrop-blur md:hidden" style={{ paddingBottom: 'max(12px, env(safe-area-inset-bottom))' }}>
          <button
            type="submit"
            form="match-request-form"
            className="mx-auto flex min-h-12 w-full max-w-xl items-center justify-center rounded-2xl bg-cyan-600 px-4 text-base font-extrabold text-white shadow-lg shadow-cyan-600/20"
          >
            선택 내용 확인하고 매칭하기
          </button>
        </div>
      )}

      {showConfirmModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-h-[calc(100dvh-2rem)] overflow-y-auto bg-white border border-cyan-200 p-5 sm:p-7 rounded-3xl space-y-4 shadow-2xl max-w-md w-full relative">
            <h3 className="text-lg font-black text-slate-900 text-center border-b border-slate-100 pb-3">
              📋 매칭 신청 옵션 최종 확인
            </h3>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2 text-xs sm:text-sm text-slate-700">
              <p><span className="font-bold text-slate-900">신청자:</span> {name} 님 ({phone})</p>
              <p><span className="font-bold text-slate-900">선택 과정:</span> {course} - {detailLevel}</p>
              <p><span className="font-bold text-cyan-700">안내 비용:</span> <span className="font-extrabold text-cyan-800">{getPriceText(course, detailLevel)}</span></p>
              <p className="text-[11px] text-slate-500 pt-1 leading-relaxed border-t border-slate-200 mt-2 pt-2">
                ※ 체험 과정을 제외한 모든 과정은 교육비+발급비 포함이며, 지역별 풀장 입장료와 장비 렌탈료는 별도입니다.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition cursor-pointer"
              >
                조건 수정하기
              </button>
              <button
                onClick={handleFinalSubmit}
                className="py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-extrabold rounded-xl text-xs transition shadow-md cursor-pointer"
              >
                🚀 최종 매칭 진행
              </button>
            </div>
          </div>
        </div>
      )}

      {submitting && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-md flex flex-col items-center justify-center p-4">
          <DivingMatcherAnimation />
          <h3 className="mt-6 max-w-sm text-center text-lg font-black leading-8 text-white sm:text-xl">
            블루피스 꼬마 다이버가 물속을 탐험하며<br />딱 맞는 강사님을 찾고 있어요!
          </h3>
          <p className="mt-3 max-w-xs text-center text-sm leading-6 text-cyan-100">조금만 기다려 주세요.<br />곧 반가운 강사님과 수면 위로 올라올게요 🫧</p>
          <div className="mt-5 flex gap-2" aria-hidden="true">
            <span className="h-2 w-2 animate-pulse rounded-full bg-cyan-300" />
            <span className="h-2 w-2 animate-pulse rounded-full bg-cyan-300 [animation-delay:200ms]" />
            <span className="h-2 w-2 animate-pulse rounded-full bg-cyan-300 [animation-delay:400ms]" />
          </div>
        </div>
      )}

      {showResultModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-h-[calc(100dvh-2rem)] overflow-y-auto bg-white border border-cyan-200 p-5 sm:p-8 rounded-3xl text-center space-y-4 shadow-2xl max-w-md w-full relative animate-in fade-in zoom-in duration-300">
            
            <button
              onClick={handleCloseAndGoHome}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 text-lg font-bold p-1 cursor-pointer"
            >
              ✕
            </button>

            {matchedInstructor ? (
              <>
                <div className="inline-block px-4 py-1.5 bg-cyan-50 rounded-full text-cyan-700 font-extrabold text-xs sm:text-sm border border-cyan-200">
                  🎉 맞춤 담당 강사 매칭 완료!
                </div>

                <h3 className="text-lg sm:text-xl font-bold text-slate-900">
                  <span className="text-cyan-600">{matchedInstructor.name}</span> 강사님이 담당으로 매칭되었습니다!
                </h3>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                  {matchedInstructor.profile_image && (
                    <img
                      src={matchedInstructor.profile_image}
                      alt={matchedInstructor.name}
                      className="w-20 h-20 rounded-full mx-auto object-cover border-2 border-cyan-500 shadow-md"
                    />
                  )}
                  <ExpandableText
                    text={matchedInstructor.bio || '친절하고 안전하게 교육을 진행해 드립니다.'}
                    collapsedLines={3}
                    threshold={70}
                    className="whitespace-pre-wrap text-sm font-medium leading-6 text-slate-600"
                    buttonClassName="bg-white text-cyan-700 border border-cyan-200"
                  />

                  <div className="pt-2 grid grid-cols-2 gap-2">
                    <a
                      href={`tel:${matchedInstructor.phone}`}
                      className="py-3 bg-cyan-600 hover:bg-cyan-500 text-white text-xs sm:text-sm font-bold rounded-xl flex items-center justify-center gap-1.5 transition shadow cursor-pointer"
                    >
                      📞 전화 걸기
                    </a>
                    <a
                      href={`sms:${matchedInstructor.phone}`}
                      className="py-3 bg-white hover:bg-slate-100 text-cyan-700 border border-cyan-300 text-xs sm:text-sm font-bold rounded-xl flex items-center justify-center gap-1.5 transition shadow-sm cursor-pointer"
                    >
                      💬 문자 보내기
                    </a>
                  </div>

                  <p className="text-[11px] text-amber-600 font-semibold pt-1 leading-relaxed">
                    ※ 강사님이 수업 중이라 전화를 받지 못할 경우,<br />
                    문자를 남겨주시면 최우선으로 확인 후 연락드립니다!
                  </p>
                </div>
              </>
            ) : submissionError ? (
              <div role="alert" className="space-y-3">
                <h3 className="text-lg font-bold text-rose-700">신청이 완료되지 않았습니다</h3>
                <p className="text-sm text-slate-700">{submissionError}</p>
                <p className="text-sm text-slate-600">신청 정보가 저장되지 않았습니다. 다시 시도해 주세요.</p>
              </div>
            ) : noMatchFound ? (
              <>
                <div className="inline-block px-4 py-1.5 bg-amber-50 rounded-full text-amber-700 font-extrabold text-xs sm:text-sm border border-amber-200">
                  ⚠️ 일정이 맞지 않습니다
                </div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  선택하신 조건에 가능한 강사님이<br />현재 수업 중이거나 일정 조정이 필요합니다.
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed pt-2">
                  센터 대표 연락처(<span className="font-bold text-cyan-600">010-9897-8990</span>)로 연락 주시면 빠르게 일정 조율을 도와드리겠습니다!
                </p>
                <div className="pt-3">
                  <a
                    href="tel:010-9897-8990"
                    className="py-3 px-6 bg-cyan-600 hover:bg-cyan-500 text-white text-xs sm:text-sm font-bold rounded-xl inline-block transition shadow cursor-pointer"
                  >
                    📞 대표 센터에 직접 문의하기
                  </a>
                </div>
              </>
            ) : null}

            <button
              onClick={handleCloseAndGoHome}
              className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition mt-2 cursor-pointer"
            >
              메인 홈페이지로 돌아가기 ↗
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

export default function InquiryPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 px-3 pb-28 pt-4 sm:p-8 font-sans flex items-start sm:items-center justify-center">
      <Suspense fallback={<div className="text-center text-slate-500 text-sm py-10">매칭 페이지 로딩 중...</div>}>
        <InquiryFormContent />
      </Suspense>
    </div>
  );
}
