'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface Instructor {
  id: string;
  name: string;
  profile_image: string | null;
  phone: string | null;
  bio: string | null;
  max_freediving_level: number;
  max_mermaid_level: number;
  max_youth_level: number;
  safety_guard_level: number;
  scuba_level: number;
  first_aid_level: number;
  underwater_photo_level: number;
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

// 과정별 정확한 비용 단가표 반영
const coursePriceTable: { [key: string]: string } = {
  // 프리다이빙
  '프리다이빙:체험 과정': '5만원 (입장료/장비 별도)',
  '1레벨 (프리다이버)': '15만원 (교육비+발급비 포함)',
  '2레벨 (오픈워터)': '35만원 (교육비+발급비 포함)',
  '3레벨 (어드밴스드)': '55만원 (교육비+발급비 포함 / 무제한 트레이닝)',
  '4레벨 (마스터)': '85만원 (교육비+발급비 포함 / 무제한 트레이닝)',
  '1+2레벨 패키지': '40만원 (교육비+발급비 포함 / 패키지 할인)',
  '3+4레벨 패키지': '130만원 (교육비+발급비 포함 / 패키지 할인)',
  
  // 머메이드 다이빙
  '머메이드 다이빙:체험 과정': '10만원 (입장료/장비 별도)',
  '베이직 머메이드': '35만원 (교육비+발급비 포함)',
  '머메이드': '45만원 (교육비+발급비 포함)',
  '오션 머메이드': '55만원 (교육비+발급비 포함)',
  '베이직+머메이드 패키지': '70만원 (교육비+발급비 포함 / 패키지 할인)',
  '머메이드+오션 패키지': '90만원 (교육비+발급비 포함 / 패키지 할인)',

  // 유스 프리다이빙
  '유스 프리다이빙:체험 과정': '10만원 (입장료/장비 별도)',
  '1레벨 (돌핀)': '35만원 (교육비+발급비 포함)',
  '2레벨 (오르카)': '45만원 (교육비+발급비 포함)',
  '3레벨 (샤크)': '55만원 (교육비+발급비 포함)',
  '돌핀+오르카 패키지': '70만원 (교육비+발급비 포함 / 패키지 할인)',
  '오르카+샤크 패키지': '90만원 (교육비+발급비 포함 / 패키지 할인)',

  // 수중레저안전요원
  '수중레저안전요원': '35만원 (교육비+발급비 포함)',
  '마스터 안전요원': '55만원 (교육비+발급비 포함)',

  // 스쿠버다이빙
  '스쿠버다이빙:체험 과정': '10만원 (입장료/장비 별도)',
  '오픈워터': '50만원 (교육비+발급비 포함)',
  '어드벤처': '50만원 (교육비+발급비 포함)',
  '어드밴스드': '60만원 (교육비+발급비 포함)',
  '오픈워터+어드밴스드 패키지': '100만원 (교육비+발급비 포함 / 패키지 할인)',

  // 스페셜 교육
  '응급처치 및 CPR 교육': '15만원 (국제 자격 발급비 포함)',
  '수중 사진 촬영 교육': '15만원 (촬영 테크닉 레슨)',

  // 강사 과정
  '강사 과정': '별도 상담 문의',
  '머메이드 강사 과정': '별도 상담 문의',
  '유스 강사 과정': '별도 상담 문의',
  '안전요원 강사 과정': '별도 상담 문의',
  '응급처치 CPR 강사 과정': '별도 상담 문의',
};

// 금액 키 조회 헬퍼 (체험 과정은 코스별로 금액이 다르므로 조합 키 지원)
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
  const [submitting, setSubmitting] = useState(false);

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);

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
    const rawValue = e.target.value.replace(/[^0-9]/g, '');
    let formatted = rawValue;
    if (rawValue.length > 3 && rawValue.length <= 7) {
      formatted = `${rawValue.slice(0, 3)}-${rawValue.slice(3)}`;
    } else if (rawValue.length > 7) {
      formatted = `${rawValue.slice(0, 3)}-${rawValue.slice(3, 7)}-${rawValue.slice(7, 11)}`;
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
    setShowConfirmModal(true);
  };

  const handleFinalSubmit = async () => {
    setShowConfirmModal(false);
    setSubmitting(true);
    setMatchedInstructor(null);
    setNoMatchFound(false);
    setShowResultModal(false);

    const randomDelay = Math.floor(Math.random() * 1500) + 3000;

    setTimeout(async () => {
      const { data: instructors, error } = await supabase
        .from('instructors')
        .select('*')
        .eq('is_approved', true);

      if (error || !instructors || instructors.length === 0) {
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

        if (course === '프리다이빙' && ins.max_freediving_level === 0) return false;
        if (course === '머메이드 다이빙' && ins.max_mermaid_level === 0) return false;
        if (course === '유스 프리다이빙' && ins.max_youth_level === 0) return false;
        if (course === '수중레저안전요원' && ins.safety_guard_level === 0) return false;
        if (course === '스쿠버다이빙' && ins.scuba_level === 0) return false;

        return true;
      });

      setSubmitting(false);

      if (qualifiedInstructors.length === 0) {
        setNoMatchFound(true);
      } else {
        const randomIndex = Math.floor(Math.random() * qualifiedInstructors.length);
        const selected = qualifiedInstructors[randomIndex];
        setMatchedInstructor(selected);

        await supabase.from('customers').insert([
          {
            name,
            phone,
            course: `${course} (${detailLevel})`,
            pool: canPassnine && canMiryang ? '패스나인/밀양' : canPassnine ? '칠곡 패스나인' : '밀양 아리랑',
            time_slot: '복수 선택 조건',
            matched_instructor: selected.name,
          },
        ]);
      }

      setShowResultModal(true);
    }, randomDelay);
  };

  const handleCloseAndGoHome = () => {
    setShowResultModal(false);
    router.push('/');
  };

  return (
    <div className="bg-white border border-slate-200 p-5 sm:p-8 rounded-3xl shadow-xl max-w-xl mx-auto text-slate-800">
      
      {/* 뒤로가기 버튼 */}
      <div className="mb-4">
        <button
          onClick={() => router.push('/')}
          className="text-xs font-bold text-slate-500 hover:text-cyan-600 transition flex items-center gap-1 cursor-pointer"
        >
          ← 메인 홈페이지로 돌아가기
        </button>
      </div>

      <h2 className="text-xl sm:text-2xl font-black text-slate-900 mb-6 text-center">🌊 수강생 맞춤 강사 매칭 신청</h2>

      <form onSubmit={handleOpenConfirmModal} className="space-y-5">
        
        {/* 성함 및 연락처 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">성함</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="성함을 입력하세요"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:border-cyan-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">연락처</label>
            <input
              type="text"
              value={phone}
              onChange={handlePhoneChange}
              placeholder="010-0000-0000"
              maxLength={13}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:border-cyan-500 focus:outline-none"
              required
            />
          </div>
        </div>

        {/* 1차 희망 교육 코스 선택 */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-2">1. 희망 교육 코스 분야</label>
          <div className="grid grid-cols-3 gap-1.5">
            {[
              '프리다이빙', '머메이드 다이빙', '유스 프리다이빙',
              '수중레저안전요원', '스쿠버다이빙', '스페셜 교육'
            ].map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => handleCourseChange(c)}
                className={`py-2.5 px-1 rounded-xl text-[11px] sm:text-xs font-bold border transition cursor-pointer ${
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

        {/* 2차 세부 레벨 / 과정 / 패키지 선택 & 금액 실시간 안내 */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
          <div className="flex justify-between items-center mb-2">
            <label className="block text-xs font-bold text-cyan-700">2. [{course}] 세부 과정 선택</label>
            <span className="text-[11px] font-extrabold text-cyan-800 bg-cyan-100 px-2.5 py-0.5 rounded-full">
              💰 {getPriceText(course, detailLevel)}
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
            {courseLevelOptions[course]?.map((lvl) => (
              <button
                key={lvl}
                type="button"
                onClick={() => setDetailLevel(lvl)}
                className={`py-2.5 px-2 rounded-xl text-xs font-medium border transition cursor-pointer ${
                  detailLevel === lvl
                    ? 'bg-cyan-600 border-cyan-500 text-white font-bold shadow-sm'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>
          
          {/* 가독성이 좋아진 안내 문구 */}
          <p className="text-[11px] text-slate-500 mt-3 leading-relaxed border-t border-slate-200 pt-2">
            ※ 체험 과정을 제외한 모든 과정은 교육비+발급비 포함이며, 지역별 풀장 입장료와 장비 렌탈료는 별도입니다.
          </p>
        </div>

        {/* 희망 요일 복수 선택 */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-2">3. 희망 수업 요일 (복수 선택 가능)</label>
          <div className="grid grid-cols-7 gap-1">
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
                className={`py-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
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

        {/* 칠곡 패스나인 풀장 세부 시간대 복수 선택 */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2.5">
          <label className="flex items-center space-x-2 text-xs font-bold text-slate-900 cursor-pointer">
            <input
              type="checkbox"
              checked={canPassnine}
              onChange={(e) => setCanPassnine(e.target.checked)}
              className="accent-cyan-600 w-4 h-4"
            />
            <span>칠곡 패스나인 풀장 (시간대 복수 선택 가능)</span>
          </label>
          {canPassnine && (
            <div className="grid grid-cols-2 gap-2 pt-1">
              {[
                { key: 't1', label: '1부 (09:00~11:00)' },
                { key: 't2', label: '2부 (13:00~15:00)' },
                { key: 't3', label: '3부 (15:30~17:30)' },
                { key: 't4', label: '4부 (19:00~21:00)' },
              ].map((t) => (
                <label key={t.key} className={`flex items-center space-x-2 text-xs p-2.5 rounded-xl border cursor-pointer ${passnineSlots[t.key] ? 'bg-cyan-50 border-cyan-500 text-cyan-900 font-bold' : 'bg-white border-slate-200 text-slate-600'}`}>
                  <input
                    type="checkbox"
                    checked={passnineSlots[t.key]}
                    onChange={(e) => setPassnineSlots({ ...passnineSlots, [t.key]: e.target.checked })}
                    className="accent-cyan-600 w-4 h-4"
                  />
                  <span>{t.label}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* 밀양 아리랑 풀장 세부 시간대 복수 선택 */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2.5">
          <label className="flex items-center space-x-2 text-xs font-bold text-slate-900 cursor-pointer">
            <input
              type="checkbox"
              checked={canMiryang}
              onChange={(e) => setCanMiryang(e.target.checked)}
              className="accent-cyan-600 w-4 h-4"
            />
            <span>밀양 아리랑 풀장 (시간대 복수 선택 가능)</span>
          </label>
          {canMiryang && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              {[
                { key: 't0', label: '오전부 (06:00~09:00) ※주말 전용' },
                { key: 't1', label: '오전 1부 (09:00~11:00)' },
                { key: 't2', label: '오전 2부 (11:00~13:00)' },
                { key: 't3', label: '오후 1부 (13:00~15:00)' },
                { key: 't4', label: '오후 2부 (15:00~17:00)' },
                { key: 't5', label: '저녁 1부 (17:00~19:00)' },
                { key: 't6', label: '저녁 2부 (19:00~21:00)' },
              ].map((t) => (
                <label key={t.key} className={`flex items-center space-x-2 text-xs p-2.5 rounded-xl border cursor-pointer ${miryangSlots[t.key] ? 'bg-cyan-50 border-cyan-500 text-cyan-900 font-bold' : 'bg-white border-slate-200 text-slate-600'}`}>
                  <input
                    type="checkbox"
                    checked={miryangSlots[t.key]}
                    onChange={(e) => setMiryangSlots({ ...miryangSlots, [t.key]: e.target.checked })}
                    className="accent-cyan-600 w-4 h-4"
                  />
                  <span>{t.label}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        <button
          type="submit"
          className="w-full py-4 bg-cyan-600 hover:bg-cyan-500 rounded-2xl text-white font-extrabold transition shadow-lg shadow-cyan-600/20 mt-2 cursor-pointer"
        >
          🎯 선택 옵션 및 예상 금액 확인 후 매칭하기
        </button>
      </form>

      {/* 1단계: 옵션 재확인 및 금액 확인 모달 */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-cyan-200 p-6 sm:p-7 rounded-3xl space-y-4 shadow-2xl max-w-md w-full relative">
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

      {/* 잠수 다이버 3~4.5초 무작위 로딩 애니메이션 모달 */}
      {submitting && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-md flex flex-col items-center justify-center p-4">
          <div className="relative w-28 h-28 mb-4">
            <div className="w-full h-full animate-bounce flex items-center justify-center text-5xl">
              🥽
            </div>
            <div className="absolute top-0 right-2 w-3 h-3 bg-cyan-400 rounded-full animate-ping opacity-75" />
            <div className="absolute top-4 right-6 w-2 h-2 bg-blue-300 rounded-full animate-pulse" />
          </div>
          <h3 className="text-base sm:text-lg font-bold text-white text-center animate-pulse">
            🫧 블루피스 전담 잠수 다이버가<br />맞춤형 담당 강사님을 찾는 중입니다...
          </h3>
          <p className="text-xs text-slate-300 mt-2">선택하신 요일과 세부 과정 레벨 조건을 실시간 분석하고 있습니다.</p>
        </div>
      )}

      {/* 2단계: 최종 매칭 결과 팝업 모달 */}
      {showResultModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-cyan-200 p-6 sm:p-8 rounded-3xl text-center space-y-4 shadow-2xl max-w-md w-full relative animate-in fade-in zoom-in duration-300">
            
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
                  <p className="text-xs sm:text-sm text-slate-600 font-medium">
                    {matchedInstructor.bio || '친절하고 안전하게 교육을 진행해 드립니다.'}
                  </p>

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
    <div className="min-h-screen bg-slate-50 text-slate-800 p-4 sm:p-8 font-sans flex items-center justify-center">
      <Suspense fallback={<div className="text-center text-slate-500 text-sm py-10">매칭 페이지 로딩 중...</div>}>
        <InquiryFormContent />
      </Suspense>
    </div>
  );
}
