'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
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

function InquiryFormContent() {
  const searchParams = useSearchParams();
  const initialCourseParam = searchParams.get('course');

  // URL 파라미터(?course=...)에 따른 초기 선택 코스 자동 지정
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
  const [pool, setPool] = useState('칠곡 패스나인');
  const [timeSlot, setTimeSlot] = useState('1부 (09:00~11:00)');
  const [day, setDay] = useState('available_mon');

  const [matchedInstructor, setMatchedInstructor] = useState<Instructor | null>(null);
  const [noMatchFound, setNoMatchFound] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // URL 파라미터 변경 감지 및 반영
  useEffect(() => {
    if (initialCourseParam) {
      setCourse(getInitialCourse(initialCourseParam));
    }
  }, [initialCourseParam]);

  // 전화번호 자동 하이픈
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) {
      alert('성함과 연락처를 입력해 주세요.');
      return;
    }

    setSubmitting(true);
    setMatchedInstructor(null);
    setNoMatchFound(false);

    // 승인된 강사 목록 조회
    const { data: instructors, error } = await supabase
      .from('instructors')
      .select('*')
      .eq('is_approved', true);

    if (error || !instructors || instructors.length === 0) {
      setSubmitting(false);
      setNoMatchFound(true);
      return;
    }

    // 조건에 부합하는 강사 필터링
    const qualifiedInstructors = instructors.filter((ins: Instructor) => {
      // 1. 요일 조건
      if (!ins[day as keyof Instructor]) return false;

      // 2. 풀장 및 시간대 조건
      if (pool === '칠곡 패스나인') {
        if (!ins.can_passnine) return false;
        if (timeSlot.includes('1부') && !ins.passnine_t1) return false;
        if (timeSlot.includes('2부') && !ins.passnine_t2) return false;
        if (timeSlot.includes('3부') && !ins.passnine_t3) return false;
        if (timeSlot.includes('4부') && !ins.passnine_t4) return false;
      } else if (pool === '밀양 아리랑') {
        if (!ins.can_miryang) return false;
        if (timeSlot.includes('조조부') && !ins.miryang_t0) return false;
        if (timeSlot.includes('오전 1부') && !ins.miryang_t1) return false;
        if (timeSlot.includes('오전 2부') && !ins.miryang_t2) return false;
        if (timeSlot.includes('오후 1부') && !ins.miryang_t3) return false;
        if (timeSlot.includes('오후 2부') && !ins.miryang_t4) return false;
        if (timeSlot.includes('저녁 1부') && !ins.miryang_t5) return false;
        if (timeSlot.includes('저녁 2부') && !ins.miryang_t6) return false;
      }

      // 3. 자격 레벨 조건
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
      // 공정한 2명 이상일 경우 무작위(Random) 1명 매칭
      const randomIndex = Math.floor(Math.random() * qualifiedInstructors.length);
      const selected = qualifiedInstructors[randomIndex];
      setMatchedInstructor(selected);

      // 매칭 접수 결과 DB 저장
      await supabase.from('customers').insert([
        {
          name,
          phone,
          course,
          pool,
          time_slot: timeSlot,
          matched_instructor: selected.name,
        },
      ]);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 p-5 sm:p-7 rounded-2xl shadow-xl max-w-xl mx-auto">
      <h2 className="text-xl font-bold text-cyan-400 mb-6 text-center">🌊 수강생 맞춤 강사 매칭 신청</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs text-slate-400 mb-1">성함</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="성함을 입력하세요"
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:border-cyan-500 focus:outline-none"
            required
          />
        </div>

        <div>
          <label className="block text-xs text-slate-400 mb-1">연락처</label>
          <input
            type="text"
            value={phone}
            onChange={handlePhoneChange}
            placeholder="010-0000-0000"
            maxLength={13}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:border-cyan-500 focus:outline-none"
            required
          />
        </div>

        <div>
          <label className="block text-xs text-slate-400 mb-1">희망 교육 코스</label>
          <select
            value={course}
            onChange={(e) => setCourse(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:border-cyan-500 focus:outline-none"
          >
            <option value="프리다이빙">프리다이빙</option>
            <option value="머메이드 다이빙">머메이드 다이빙</option>
            <option value="유스 프리다이빙">유스 프리다이빙</option>
            <option value="수중레저안전요원">수중레저안전요원</option>
            <option value="스쿠버다이빙">스쿠버다이빙</option>
            <option value="스페셜 교육">스페셜 교육</option>
          </select>
        </div>

        <div>
          <label className="block text-xs text-slate-400 mb-1">희망 요일</label>
          <select
            value={day}
            onChange={(e) => setDay(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:border-cyan-500 focus:outline-none"
          >
            <option value="available_mon">월요일</option>
            <option value="available_tue">화요일</option>
            <option value="available_wed">수요일</option>
            <option value="available_thu">목요일</option>
            <option value="available_fri">금요일</option>
            <option value="available_sat">토요일</option>
            <option value="available_sun">일요일</option>
          </select>
        </div>

        <div>
          <label className="block text-xs text-slate-400 mb-1">희망 풀장</label>
          <select
            value={pool}
            onChange={(e) => {
              setPool(e.target.value);
              if (e.target.value === '칠곡 패스나인') {
                setTimeSlot('1부 (09:00~11:00)');
              } else {
                setTimeSlot('오전 1부 (09:00~11:00)');
              }
            }}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:border-cyan-500 focus:outline-none"
          >
            <option value="칠곡 패스나인">칠곡 패스나인</option>
            <option value="밀양 아리랑">밀양 아리랑</option>
          </select>
        </div>

        <div>
          <label className="block text-xs text-slate-400 mb-1">희망 시간대</label>
          <select
            value={timeSlot}
            onChange={(e) => setTimeSlot(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:border-cyan-500 focus:outline-none"
          >
            {pool === '칠곡 패스나인' ? (
              <>
                <option value="1부 (09:00~11:00)">1부 (09:00~11:00)</option>
                <option value="2부 (13:00~15:00)">2부 (13:00~15:00)</option>
                <option value="3부 (15:30~17:30)">3부 (15:30~17:30)</option>
                <option value="4부 (19:00~21:00)">4부 (19:00~21:00)</option>
              </>
            ) : (
              <>
                <option value="조조부 (06:00~09:00)">조조부 (06:00~09:00)</option>
                <option value="오전 1부 (09:00~11:00)">오전 1부 (09:00~11:00)</option>
                <option value="오전 2부 (11:00~13:00)">오전 2부 (11:00~13:00)</option>
                <option value="오후 1부 (13:00~15:00)">오후 1부 (13:00~15:00)</option>
                <option value="오후 2부 (15:00~17:00)">오후 2부 (15:00~17:00)</option>
                <option value="저녁 1부 (17:00~19:00)">저녁 1부 (17:00~19:00)</option>
                <option value="저녁 2부 (19:00~21:00)">저녁 2부 (19:00~21:00)</option>
              </>
            )}
          </select>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 rounded-xl text-white font-extrabold transition shadow-lg mt-2 cursor-pointer"
        >
          {submitting ? '매칭 조건 확인 중...' : '🎯 맞춤 담당 강사 매칭하기'}
        </button>
      </form>

      {/* 매칭 실패 시 */}
      {noMatchFound && (
        <div className="mt-6 bg-slate-950 p-4 rounded-xl border border-amber-500/40 text-center text-amber-300 text-xs sm:text-sm">
          ⚠️ 선택하신 조건에 가능한 강사님이 현재 수업 중이거나 일정 조정이 필요합니다.<br />
          센터 대표 연락처(010-9897-8990)로 연락 주시면 빠르게 안내 도와드리겠습니다!
        </div>
      )}

      {/* 매칭 성공 시 강사 정보 및 전화/문자 버튼 */}
      {matchedInstructor && (
        <div className="bg-slate-950 border border-cyan-500/50 p-5 rounded-2xl text-center space-y-4 shadow-2xl mt-6">
          <div className="inline-block px-3.5 py-1 bg-cyan-500/10 rounded-full text-cyan-400 font-extrabold text-xs sm:text-sm border border-cyan-500/20">
            🎉 맞춤 담당 강사 매칭 완료!
          </div>

          <h3 className="text-lg sm:text-xl font-bold text-white">
            <span className="text-cyan-400">{matchedInstructor.name}</span> 강사님이 담당으로 매칭되었습니다!
          </h3>

          <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 max-w-md mx-auto space-y-3">
            {matchedInstructor.profile_image && (
              <img
                src={matchedInstructor.profile_image}
                alt={matchedInstructor.name}
                className="w-20 h-20 rounded-full mx-auto object-cover border-2 border-cyan-500 shadow-md"
              />
            )}
            <p className="text-xs sm:text-sm text-slate-300 font-medium">
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
                className="py-3 bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/30 text-xs sm:text-sm font-bold rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                💬 문자 보내기
              </a>
            </div>

            <p className="text-[11px] text-amber-400 font-medium pt-1 leading-relaxed">
              ※ 강사님이 수업 중이라 전화를 받지 못할 경우, 문자를 남겨주시면 최우선으로 확인 후 연락드립니다!
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function InquiryPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 font-sans">
      <header className="text-center mb-6 pt-4">
        <span className="text-[11px] font-semibold px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
          BLUE PEACE MATCHING SYSTEM
        </span>
        <h1 className="text-xl sm:text-2xl font-extrabold mt-3 text-white">
          🌊 수강생 매칭 & 문의
        </h1>
      </header>

      <Suspense fallback={<div className="text-center text-slate-400 text-sm py-10">매칭 페이지 로딩 중...</div>}>
        <InquiryFormContent />
      </Suspense>
    </div>
  );
}
