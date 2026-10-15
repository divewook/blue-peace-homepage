'use client';

import React, { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface Instructor {
  id: string;
  name: string;
  profile_image: string | null;
  bio: string | null;
  kakao_chat_url: string | null;
  max_freediving_level: number;
  max_mermaid_level: number;
  max_youth_level: number;
  can_safety_guard: boolean;
  can_duryu: boolean;
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

export default function InquiryPage() {
  const [course, setCourse] = useState<'freediving' | 'mermaid' | 'youth' | 'safety'>('freediving');
  const [level, setLevel] = useState<number>(0); // 0: 체험, 1: 1레벨, 2: 1+2, 3: 1+2+3, 4: All/상급
  const [pools, setPools] = useState<{ passnine: boolean; miryang: boolean; duryu: boolean }>({
    passnine: true,
    miryang: false,
    duryu: false,
  });
  const [days, setDays] = useState<{ [key: string]: boolean }>({
    mon: false, tue: false, wed: false, thu: false, fri: false, sat: true, sun: true,
  });
  
  // 풀장별 시간대
  const [passnineTimes, setPassnineTimes] = useState<{ [key: string]: boolean }>({
    t1: true, t2: true, t3: false, t4: false,
  });
  const [miryangTimes, setMiryangTimes] = useState<{ [key: string]: boolean }>({
    t0: false, t1: true, t2: true, t3: false, t4: false, t5: false, t6: false,
  });

  const [loading, setLoading] = useState(false);
  const [matchedInstructor, setMatchedInstructor] = useState<Instructor | null>(null);
  const [noMatch, setNoMatch] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    setMatchedInstructor(null);
    setNoMatch(false);

    // 최소 2초간 매칭 애니메이션 연출
    await new Promise((resolve) => setTimeout(resolve, 2000));

    try {
      const { data: instructors, error } = await supabase.from('instructors').select('*');
      if (error || !instructors) {
        setNoMatch(true);
        setLoading(false);
        return;
      }

      // 100% 조건 매칭 필터링
      const filtered = (instructors as Instructor[]).filter((ins) => {
        // 1. 종목 & 레벨 체크
        if (course === 'freediving' && ins.max_freediving_level < level) return false;
        if (course === 'mermaid' && ins.max_mermaid_level < level) return false;
        if (course === 'youth' && ins.max_youth_level < level) return false;
        if (course === 'safety' && !ins.can_safety_guard) return false;

        // 2. 선택된 풀장 가능 여부 체크
        if (pools.passnine && !ins.can_passnine) return false;
        if (pools.miryang && !ins.can_miryang) return false;
        if (pools.duryu && !ins.can_duryu) return false;

        // 3. 선택된 요일 중 최소 하나 이상 매칭되는지
        const selectedDays = Object.keys(days).filter((d) => days[d]);
        const dayMap: { [key: string]: keyof Instructor } = {
          mon: 'available_mon', tue: 'available_tue', wed: 'available_wed',
          thu: 'available_thu', fri: 'available_fri', sat: 'available_sat', sun: 'available_sun',
        };
        const hasMatchingDay = selectedDays.some((d) => ins[dayMap[d]] === true);
        if (selectedDays.length > 0 && !hasMatchingDay) return false;

        // 4. 세부 시간대 체크 (패스나인)
        if (pools.passnine) {
          const selectedPnTimes = Object.keys(passnineTimes).filter((t) => passnineTimes[t]);
          const pnMap: { [key: string]: keyof Instructor } = {
            t1: 'passnine_t1', t2: 'passnine_t2', t3: 'passnine_t3', t4: 'passnine_t4',
          };
          const hasMatchingPnTime = selectedPnTimes.some((t) => ins[pnMap[t]] === true);
          if (selectedPnTimes.length > 0 && !hasMatchingPnTime) return false;
        }

        // 5. 세부 시간대 체크 (밀양)
        if (pools.miryang) {
          const selectedMrTimes = Object.keys(miryangTimes).filter((t) => miryangTimes[t]);
          const mrMap: { [key: string]: keyof Instructor } = {
            t0: 'miryang_t0', t1: 'miryang_t1', t2: 'miryang_t2', t3: 'miryang_t3',
            t4: 'miryang_t4', t5: 'miryang_t5', t6: 'miryang_t6',
          };
          const hasMatchingMrTime = selectedMrTimes.some((t) => ins[mrMap[t]] === true);
          if (selectedMrTimes.length > 0 && !hasMatchingMrTime) return false;
        }

        return true;
      });

      if (filtered.length > 0) {
        // 조건 만족 강사 중 랜덤 1명 추출
        const randomIndex = Math.floor(Math.random() * filtered.length);
        setMatchedInstructor(filtered[randomIndex]);
      } else {
        setNoMatch(true);
      }
    } catch (err) {
      console.error(err);
      setNoMatch(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6 max-w-3xl mx-auto font-sans">
      <h1 className="text-3xl font-bold text-center mb-8 text-cyan-400">🌊 블루피스 교육 신청 & 1:1 강사 매칭</h1>

      {/* 1. 종목 선택 */}
      <section className="bg-slate-800 p-5 rounded-2xl mb-6 border border-slate-700">
        <h2 className="text-xl font-semibold mb-3 text-cyan-300">1. 어떤 교육 과정을 희망하시나요?</h2>
        <div className="grid grid-cols-2 gap-3">
          {[
            { id: 'freediving', label: '🤿 프리다이빙' },
            { id: 'mermaid', label: '🧜‍♀️ 머메이드' },
            { id: 'youth', label: '🐬 유스 프리다이빙' },
            { id: 'safety', label: '🛡️ 수중레저안전요원' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setCourse(item.id as any)}
              className={`p-3 rounded-xl border text-center transition font-medium ${
                course === item.id ? 'bg-cyan-600 border-cyan-400 text-white' : 'bg-slate-700 border-slate-600 text-slate-300'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </section>

      {/* 2. 레벨 선택 */}
      <section className="bg-slate-800 p-5 rounded-2xl mb-6 border border-slate-700">
        <h2 className="text-xl font-semibold mb-3 text-cyan-300">2. 원하는 희망 레벨 / 패키지</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { level: 0, label: '체험 과정 (원데이/입문)' },
            { level: 1, label: '1레벨 단일' },
            { level: 2, label: '1+2레벨 패키지 (추천)' },
            { level: 3, label: '1+2+3레벨 패키지' },
            { level: 4, label: 'All 패키지 (강사과정 포함)' },
          ].map((item) => (
            <button
              key={item.level}
              onClick={() => setLevel(item.level)}
              className={`p-3 rounded-xl border text-center transition font-medium text-sm ${
                level === item.level ? 'bg-cyan-600 border-cyan-400 text-white' : 'bg-slate-700 border-slate-600 text-slate-300'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </section>

      {/* 3. 희망 풀장 선택 */}
      <section className="bg-slate-800 p-5 rounded-2xl mb-6 border border-slate-700">
        <h2 className="text-xl font-semibold mb-3 text-cyan-300">3. 희망 교육 풀장 (복수 선택 가능)</h2>
        <div className="space-y-3">
          <label className="flex items-center space-x-3 bg-slate-700 p-3 rounded-xl cursor-pointer">
            <input
              type="checkbox"
              checked={pools.passnine}
              onChange={(e) => setPools({ ...pools, passnine: e.target.checked })}
              className="w-5 h-5 accent-cyan-500"
            />
            <span>칠곡 패스나인 풀장</span>
          </label>

          <label className="flex items-center space-x-3 bg-slate-700 p-3 rounded-xl cursor-pointer">
            <input
              type="checkbox"
              checked={pools.miryang}
              onChange={(e) => setPools({ ...pools, miryang: e.target.checked })}
              className="w-5 h-5 accent-cyan-500"
            />
            <span>밀양 풀장</span>
          </label>

          <label className="flex items-center justify-between bg-slate-700/50 p-3 rounded-xl opacity-60">
            <div className="flex items-center space-x-3">
              <input type="checkbox" disabled checked={false} className="w-5 h-5" />
              <span>대구 두류 풀장</span>
            </div>
            <span className="text-xs text-amber-400 bg-amber-950/80 px-2 py-1 rounded">⚠️ 내부 공사중 (일시 이용 불가)</span>
          </label>
        </div>
        <p className="text-xs text-slate-400 mt-3">* 레벨 테스트 진행 시 일부 풀장에서 제약이 있어 타 지역 풀장에서 진행될 수 있습니다.</p>
      </section>

      {/* 4. 희망 요일 선택 */}
      <section className="bg-slate-800 p-5 rounded-2xl mb-6 border border-slate-700">
        <h2 className="text-xl font-semibold mb-3 text-cyan-300">4. 수업 희망 요일</h2>
        <div className="flex justify-between gap-2">
          {[
            { id: 'mon', label: '월' }, { id: 'tue', label: '화' }, { id: 'wed', label: '수' },
            { id: 'thu', label: '목' }, { id: 'fri', label: '금' }, { id: 'sat', label: '토' }, { id: 'sun', label: '일' },
          ].map((d) => (
            <button
              key={d.id}
              onClick={() => setDays({ ...days, [d.id]: !days[d.id] })}
              className={`flex-1 py-3 rounded-xl border text-center font-bold text-sm ${
                days[d.id] ? 'bg-cyan-600 border-cyan-400 text-white' : 'bg-slate-700 border-slate-600 text-slate-400'
              }`}
            >
              {d.label}
            </button>
          ))}
        </div>
      </section>

      {/* 5. 풀장별 세부 시간대 */}
      {pools.passnine && (
        <section className="bg-slate-800 p-5 rounded-2xl mb-6 border border-slate-700">
          <h2 className="text-lg font-semibold mb-3 text-cyan-300">5-1. 칠곡 패스나인 시간대 선택</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { id: 't1', label: '1부 (09:00 ~ 11:30)' },
              { id: 't2', label: '2부 (12:30 ~ 15:00)' },
              { id: 't3', label: '3부 (16:00 ~ 18:30)' },
              { id: 't4', label: '4부 (19:30 ~ 22:00)' },
            ].map((t) => (
              <label key={t.id} className="flex items-center space-x-2 bg-slate-700 p-3 rounded-xl cursor-pointer text-sm">
                <input
                  type="checkbox"
                  checked={passnineTimes[t.id]}
                  onChange={(e) => setPassnineTimes({ ...passnineTimes, [t.id]: e.target.checked })}
                  className="w-4 h-4 accent-cyan-500"
                />
                <span>{t.label}</span>
              </label>
            ))}
          </div>
        </section>
      )}

      {pools.miryang && (
        <section className="bg-slate-800 p-5 rounded-2xl mb-6 border border-slate-700">
          <h2 className="text-lg font-semibold mb-3 text-cyan-300">5-2. 밀양 풀장 시간대 선택</h2>
          <div className="grid grid-cols-2 gap-3 text-sm">
            {[
              { id: 't0', label: '주말 오전 (08:00 ~ 10:00)' },
              { id: 't1', label: '1부 (10:00 ~ 12:00)' },
              { id: 't2', label: '2부 (12:00 ~ 14:00)' },
              { id: 't3', label: '3부 (14:00 ~ 16:00)' },
              { id: 't4', label: '4부 (16:00 ~ 18:00)' },
              { id: 't5', label: '5부 (18:00 ~ 20:00)' },
              { id: 't6', label: '6부 (20:00 ~ 22:00)' },
            ].map((t) => (
              <label key={t.id} className="flex items-center space-x-2 bg-slate-700 p-3 rounded-xl cursor-pointer">
                <input
                  type="checkbox"
                  checked={miryangTimes[t.id]}
                  onChange={(e) => setMiryangTimes({ ...miryangTimes, [t.id]: e.target.checked })}
                  className="w-4 h-4 accent-cyan-500"
                />
                <span>{t.label}</span>
              </label>
            ))}
          </div>
        </section>
      )}

      {/* 매칭 실행 버튼 */}
      <button
        onClick={handleSubmit}
        disabled={loading}
        className="w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl text-lg font-bold text-white hover:from-cyan-400 hover:to-blue-500 transition shadow-lg shadow-cyan-900/40"
      >
        {loading ? '🌊 조건에 딱 맞는 전담 강사님을 매칭 중입니다...' : '🎯 맞춤 강사 매칭 접수하기'}
      </button>

      {/* 매칭 결과 출력 */}
      {matchedInstructor && (
        <div className="mt-8 bg-slate-800 border-2 border-cyan-400 p-6 rounded-2xl text-center animate-fade-in shadow-2xl">
          <div className="inline-block bg-cyan-950 text-cyan-300 text-xs px-3 py-1 rounded-full mb-3 border border-cyan-700">
            🎉 100% 매칭 성공!
          </div>
          <h2 className="text-2xl font-bold mb-4 text-white">담당 강사: {matchedInstructor.name} 강사님</h2>
          
          {matchedInstructor.profile_image && (
            <img
              src={matchedInstructor.profile_image}
              alt={matchedInstructor.name}
              className="w-32 h-32 rounded-full mx-auto mb-4 object-cover border-4 border-cyan-500"
            />
          )}

          <p className="text-slate-300 mb-6 bg-slate-900/60 p-4 rounded-xl text-sm leading-relaxed">
            {matchedInstructor.bio || '친절하고 안전하게 프리다이빙의 즐거움을 알려드립니다!'}
          </p>

          {matchedInstructor.kakao_chat_url ? (
            <a
              href={matchedInstructor.kakao_chat_url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center px-6 py-3 bg-yellow-400 text-slate-900 font-bold rounded-xl hover:bg-yellow-300 transition w-full sm:w-auto"
            >
              💬 강사님과 카카오톡 오픈채팅 상담하기
            </a>
          ) : (
            <p className="text-amber-400 text-sm">카카오톡 오픈채팅 링크 준비중입니다.</p>
          )}
        </div>
      )}

      {noMatch && (
        <div className="mt-8 bg-slate-800 border border-slate-700 p-6 rounded-2xl text-center">
          <p className="text-slate-300 mb-4">선택하신 조건에 해당되는 강사님이 현재 없습니다.</p>
          <p className="text-xs text-slate-400">대표 상담을 통해 스케줄 조율이 가능하니 아래로 문의해 주세요!</p>
        </div>
      )}
    </div>
  );
}
