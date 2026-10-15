'use client';

import React, { useState, useEffect } from 'react';
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
  can_scuba: boolean;
  can_special: boolean;
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
  const [course, setCourse] = useState<string>('freediving');
  const [level, setLevel] = useState<number | string>(0);
  
  const [pools, setPools] = useState<{ passnine: boolean; miryang: boolean; duryu: boolean }>({
    passnine: true, miryang: false, duryu: false,
  });

  const [days, setDays] = useState<{ [key: string]: boolean }>({
    mon: false, tue: false, wed: false, thu: false, fri: false, sat: true, sun: true,
  });
  
  const [passnineTimes, setPassnineTimes] = useState<{ [key: string]: boolean }>({
    t1: true, t2: true, t3: false, t4: false,
  });
  const [miryangTimes, setMiryangTimes] = useState<{ [key: string]: boolean }>({
    t0: false, t1: true, t2: true, t3: false, t4: false, t5: false, t6: false,
  });

  useEffect(() => {
    setPassnineTimes(pools.passnine ? { t1: true, t2: true, t3: false, t4: false } : { t1: false, t2: false, t3: false, t4: false });
  }, [pools.passnine]);

  useEffect(() => {
    setMiryangTimes(pools.miryang ? { t0: false, t1: true, t2: true, t3: false, t4: false, t5: false, t6: false } : { t0: false, t1: false, t2: false, t3: false, t4: false, t5: false, t6: false });
  }, [pools.miryang]);

  const [loading, setLoading] = useState(false);
  const [matchedInstructor, setMatchedInstructor] = useState<Instructor | null>(null);
  const [noMatch, setNoMatch] = useState(false);

  const handleCourseChange = (c: string) => {
    setCourse(c);
    if (c === 'freediving' || c === 'mermaid' || c === 'youth' || c === 'scuba') setLevel(0);
    else if (c === 'safety') setLevel(101);
    else if (c === 'special') setLevel(201);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setMatchedInstructor(null);
    setNoMatch(false);
    await new Promise((r) => setTimeout(r, 1200));

    try {
      const { data: instructors, error } = await supabase.from('instructors').select('*');
      if (error || !instructors) { setNoMatch(true); setLoading(false); return; }

      const filtered = (instructors as Instructor[]).filter((ins) => {
        if (course === 'freediving' && typeof level === 'number' && ins.max_freediving_level < level) return false;
        if (course === 'mermaid' && typeof level === 'number' && ins.max_mermaid_level < level) return false;
        if (course === 'youth' && typeof level === 'number' && ins.max_youth_level < level) return false;
        if (course === 'safety' && !ins.can_safety_guard) return false;
        if (course === 'scuba' && !ins.can_scuba) return false;
        if (course === 'special' && !ins.can_special) return false;

        if (pools.passnine && !ins.can_passnine) return false;
        if (pools.miryang && !ins.can_miryang) return false;
        if (pools.duryu && !ins.can_duryu) return false;

        const selDays = Object.keys(days).filter((d) => days[d]);
        const dayMap: { [k: string]: keyof Instructor } = {
          mon: 'available_mon', tue: 'available_tue', wed: 'available_wed',
          thu: 'available_thu', fri: 'available_fri', sat: 'available_sat', sun: 'available_sun',
        };
        if (selDays.length > 0 && !selDays.some((d) => ins[dayMap[d]])) return false;

        if (pools.passnine) {
          const selPn = Object.keys(passnineTimes).filter((t) => passnineTimes[t]);
          const pnMap: { [k: string]: keyof Instructor } = { t1: 'passnine_t1', t2: 'passnine_t2', t3: 'passnine_t3', t4: 'passnine_t4' };
          if (selPn.length > 0 && !selPn.some((t) => ins[pnMap[t]])) return false;
        }

        if (pools.miryang) {
          const selMr = Object.keys(miryangTimes).filter((t) => miryangTimes[t]);
          const mrMap: { [k: string]: keyof Instructor } = { t0: 'miryang_t0', t1: 'miryang_t1', t2: 'miryang_t2', t3: 'miryang_t3', t4: 'miryang_t4', t5: 'miryang_t5', t6: 'miryang_t6' };
          if (selMr.length > 0 && !selMr.some((t) => ins[mrMap[t]])) return false;
        }
        return true;
      });

      if (filtered.length > 0) {
        setMatchedInstructor(filtered[Math.floor(Math.random() * filtered.length)]);
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

  const isWeekend = days.sat || days.sun;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 max-w-2xl mx-auto font-sans">
      <header className="text-center mb-6 pt-3">
        <span className="text-xs font-semibold px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">BLUE PEACE SYSTEM</span>
        <h1 className="text-2xl sm:text-3xl font-extrabold mt-3 text-white">🌊 교육 신청 & 1:1 전담 강사 매칭</h1>
        <p className="text-sm text-slate-400 mt-1">원하시는 조건에 100% 부합하는 전문 강사님이 실시간 매칭됩니다.</p>
      </header>

      {/* 1. 교육 과정 */}
      <section className="bg-slate-900/80 p-4 rounded-2xl mb-4 border border-slate-800 shadow-xl">
        <h2 className="text-base font-bold mb-3 text-cyan-400 flex items-center gap-2">
          <span className="w-6 h-6 rounded-lg bg-cyan-500/20 flex items-center justify-center text-xs text-cyan-300">1</span>희망 교육 과정 선택
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {[
            { id: 'freediving', label: '🤿 프리다이빙' },
            { id: 'youth', label: '🐬 유스 프리다이빙' },
            { id: 'mermaid', label: '🧜‍♀️ 머메이드' },
            { id: 'safety', label: '🛡️ 수중레저안전요원' },
            { id: 'scuba', label: '🐠 스쿠버 다이빙' },
            { id: 'special', label: '⭐ 스페셜 교육' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => handleCourseChange(item.id)}
              className={`p-3 rounded-xl border text-left transition text-sm font-medium ${
                course === item.id ? 'bg-cyan-600 border-cyan-400 text-white shadow-lg' : 'bg-slate-800/60 border-slate-700 text-slate-300'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </section>

      {/* 2. 희망 레벨 */}
      <section className="bg-slate-900/80 p-4 rounded-2xl mb-4 border border-slate-800 shadow-xl">
        <h2 className="text-base font-bold mb-3 text-cyan-400 flex items-center gap-2">
          <span className="w-6 h-6 rounded-lg bg-cyan-500/20 flex items-center justify-center text-xs text-cyan-300">2</span>희망 레벨 및 과정 선택
        </h2>

        {course === 'freediving' && (
          <div className="space-y-3">
            <div>
              <p className="text-xs text-slate-400 mb-2 font-semibold">단일 레벨 코스</p>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {[
                  { lvl: 0, title: '체험', sub: 'Discovery' },
                  { lvl: 1, title: '1레벨', sub: 'Freediver' },
                  { lvl: 2, title: '2레벨', sub: 'Open Water' },
                  { lvl: 3, title: '3레벨', sub: 'Advanced' },
                  { lvl: 4, title: '4레벨', sub: 'Master' },
                ].map((item) => (
                  <button key={item.lvl} onClick={() => setLevel(item.lvl)} className={`p-2.5 rounded-xl border text-center transition ${level === item.lvl ? 'bg-cyan-600 border-cyan-400 text-white' : 'bg-slate-800/60 border-slate-700 text-slate-300'}`}>
                    <div className="font-bold text-sm">{item.title}</div>
                    <div className="text-[10px] opacity-75">{item.sub}</div>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs text-cyan-400 mb-2 font-semibold">🌟 추천 패키지 & 전문 과정</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  { lvl: 'p_1_2', title: '1 + 2 레벨 패키지', desc: '입문부터 오픈워터까지' },
                  { lvl: 'p_1_3', title: '1 + 2 + 3 레벨 패키지', desc: '어드밴스드 마스터' },
                  { lvl: 'p_1_4', title: 'All 패키지 (1~4레벨)', desc: '통합 패키지 (강사과정 제외)' },
                  { lvl: 'instructor', title: '🔥 강사 과정', desc: '4레벨 보유자 대상 양성 코스' },
                ].map((item) => (
                  <button key={item.lvl} onClick={() => setLevel(item.lvl)} className={`p-3 rounded-xl border text-left transition flex flex-col justify-between ${level === item.lvl ? 'bg-cyan-600 border-cyan-400 text-white' : 'bg-slate-800/60 border-slate-700 text-slate-300'}`}>
                    <span className="font-bold text-sm">{item.title}</span>
                    <span className="text-xs opacity-85">{item.desc}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {course === 'mermaid' && (
          <div className="space-y-3">
            <div>
              <p className="text-xs text-slate-400 mb-2 font-semibold">단일 레벨 코스</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[{ lvl: 0, title: '체험' }, { lvl: 1, title: '1레벨(베이직)' }, { lvl: 2, title: '2레벨(머메이드)' }, { lvl: 3, title: '3레벨(오션)' }].map((item) => (
                  <button key={item.lvl} onClick={() => setLevel(item.lvl)} className={`p-2.5 rounded-xl border text-center transition ${level === item.lvl ? 'bg-cyan-600 border-cyan-400 text-white' : 'bg-slate-800/60 border-slate-700 text-slate-300'}`}>
                    <div className="font-bold text-sm">{item.title}</div>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs text-cyan-400 mb-2 font-semibold">🌟 패키지 & 전문 과정</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {[{ lvl: 'm_pkg_1_2', title: '베이직+머메이드' }, { lvl: 'm_pkg_2_3', title: '머메이드+오션' }, { lvl: 'm_pkg_all', title: '베이직+머메이드+오션' }].map((item) => (
                  <button key={item.lvl} onClick={() => setLevel(item.lvl)} className={`p-2.5 rounded-xl border text-center transition ${level === item.lvl ? 'bg-cyan-600 border-cyan-400 text-white' : 'bg-slate-800/60 border-slate-700 text-slate-300'}`}>
                    <span className="font-bold text-xs">{item.title}</span>
                  </button>
                ))}
              </div>
              <div className="mt-2">
                <button onClick={() => setLevel('m_instructor')} className={`w-full p-3 rounded-xl border text-center transition ${level === 'm_instructor' ? 'bg-cyan-600 border-cyan-400 text-white' : 'bg-slate-800/60 border-slate-700 text-slate-300'}`}>
                  <span className="font-bold text-sm">🔥 머메이드 강사 과정</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {course === 'youth' && (
          <div className="space-y-3">
            <div>
              <p className="text-xs text-slate-400 mb-2 font-semibold">단일 레벨 코스</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[{ lvl: 0, title: '체험' }, { lvl: 1, title: '1레벨(돌핀)' }, { lvl: 2, title: '2레벨(오르카)' }, { lvl: 3, title: '3레벨(샤크)' }].map((item) => (
                  <button key={item.lvl} onClick={() => setLevel(item.lvl)} className={`p-2.5 rounded-xl border text-center transition ${level === item.lvl ? 'bg-cyan-600 border-cyan-400 text-white' : 'bg-slate-800/60 border-slate-700 text-slate-300'}`}>
                    <div className="font-bold text-sm">{item.title}</div>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs text-cyan-400 mb-2 font-semibold">🌟 유스 패키지 코스</p>
              <div className="grid grid-cols-2 gap-2">
                {[{ lvl: 'y_pkg_1_2', title: '돌핀 + 오르카 패키지' }, { lvl: 'y_pkg_2_3', title: '오르카 + 샤크 패키지' }].map((item) => (
                  <button key={item.lvl} onClick={() => setLevel(item.lvl)} className={`p-3 rounded-xl border text-center transition ${level === item.lvl ? 'bg-cyan-600 border-cyan-400 text-white' : 'bg-slate-800/60 border-slate-700 text-slate-300'}`}>
                    <span className="font-bold text-xs">{item.title}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {course === 'safety' && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {[{ lvl: 101, title: '수중레저안전요원' }, { lvl: 102, title: '마스터 수중레저안전요원' }, { lvl: 103, title: '안전요원 강사과정' }].map((item) => (
              <button key={item.lvl} onClick={() => setLevel(item.lvl)} className={`p-3 rounded-xl border text-center transition ${level === item.lvl ? 'bg-cyan-600 border-cyan-400 text-white' : 'bg-slate-800/60 border-slate-700 text-slate-300'}`}>
                <span className="font-bold text-xs">{item.title}</span>
              </button>
            ))}
          </div>
        )}

        {course === 'scuba' && (
          <div className="space-y-2">
            <div className="grid grid-cols-3 gap-2">
              {[{ lvl: 0, title: '체험 스쿠버' }, { lvl: 1, title: '오픈워터' }, { lvl: 2, title: '어드밴스드' }].map((item) => (
                <button key={item.lvl} onClick={() => setLevel(item.lvl)} className={`p-3 rounded-xl border text-center transition ${level === item.lvl ? 'bg-cyan-600 border-cyan-400 text-white' : 'bg-slate-800/60 border-slate-700 text-slate-300'}`}>
                  <span className="font-bold text-sm">{item.title}</span>
                </button>
              ))}
            </div>
            <button onClick={() => setLevel('scuba_pkg')} className={`w-full p-3 rounded-xl border text-center transition ${level === 'scuba_pkg' ? 'bg-cyan-600 border-cyan-400 text-white' : 'bg-slate-800/60 border-slate-700 text-slate-300'}`}>
              <span className="font-bold text-sm">스쿠버 오픈워터 + 어드밴스드 패키지</span>
            </button>
          </div>
        )}

        {course === 'special' && (
          <div className="grid grid-cols-2 gap-2">
            {[{ lvl: 201, title: '응급처치 교육 CPR' }, { lvl: 202, title: '수중 사진 촬영' }].map((item) => (
              <button key={item.lvl} onClick={() => setLevel(item.lvl)} className={`p-3 rounded-xl border text-center transition ${level === item.lvl ? 'bg-cyan-600 border-cyan-400 text-white' : 'bg-slate-800/60 border-slate-700 text-slate-300'}`}>
                <span className="font-bold text-sm">{item.title}</span>
              </button>
            ))}
          </div>
        )}
      </section>

      {/* 3. 풀장 */}
      <section className="bg-slate-900/80 p-4 rounded-2xl mb-4 border border-slate-800 shadow-xl">
        <h2 className="text-base font-bold mb-3 text-cyan-400 flex items-center gap-2">
          <span className="w-6 h-6 rounded-lg bg-cyan-500/20 flex items-center justify-center text-xs text-cyan-300">3</span>희망 교육 풀장 (복수 선택 가능)
        </h2>
        <div className="space-y-2">
          <label className="flex items-center space-x-3 bg-slate-800/60 p-3 rounded-xl cursor-pointer border border-slate-700">
            <input type="checkbox" checked={pools.passnine} onChange={(e) => setPools({ ...pools, passnine: e.target.checked })} className="w-4 h-4 accent-cyan-500" />
            <span className="text-sm font-medium">칠곡 패스나인 풀장</span>
          </label>
          <label className="flex items-center space-x-3 bg-slate-800/60 p-3 rounded-xl cursor-pointer border border-slate-700">
            <input type="checkbox" checked={pools.miryang} onChange={(e) => setPools({ ...pools, miryang: e.target.checked })} className="w-4 h-4 accent-cyan-500" />
            <span className="text-sm font-medium">밀양 아리랑 풀장</span>
          </label>
        </div>
      </section>

      {/* 4. 요일 */}
      <section className="bg-slate-900/80 p-4 rounded-2xl mb-4 border border-slate-800 shadow-xl">
        <h2 className="text-base font-bold mb-3 text-cyan-400 flex items-center gap-2">
          <span className="w-6 h-6 rounded-lg bg-cyan-500/20 flex items-center justify-center text-xs text-cyan-300">4</span>수업 희망 요일
        </h2>
        <div className="flex justify-between gap-1">
          {[{ id: 'mon', label: '월' }, { id: 'tue', label: '화' }, { id: 'wed', label: '수' }, { id: 'thu', label: '목' }, { id: 'fri', label: '금' }, { id: 'sat', label: '토' }, { id: 'sun', label: '일' }].map((d) => (
            <button key={d.id} onClick={() => setDays({ ...days, [d.id]: !days[d.id] })} className={`flex-1 py-2.5 rounded-xl border text-center font-bold text-xs sm:text-sm transition ${days[d.id] ? 'bg-cyan-600 border-cyan-400 text-white' : 'bg-slate-800/60 border-slate-700 text-slate-400'}`}>
              {d.label}
            </button>
          ))}
        </div>
      </section>

      {/* 5-1. 패스나인 시간대 */}
      {pools.passnine && (
        <section className="bg-slate-900/80 p-4 rounded-2xl mb-4 border border-cyan-500/30 shadow-xl">
          <h2 className="text-sm font-bold mb-3 text-cyan-300">📍 5-1. 칠곡 패스나인 세부 시간대</h2>
          <div className="grid grid-cols-2 gap-2">
            {[{ id: 't1', label: '1부 (09:00~11:30)' }, { id: 't2', label: '2부 (12:30~15:00)' }, { id: 't3', label: '3부 (16:00~18:30)' }, { id: 't4', label: '4부 (19:30~22:00)' }].map((t) => (
              <label key={t.id} className="flex items-center space-x-2 bg-slate-800/60 p-2.5 rounded-xl cursor-pointer border border-slate-700 text-xs sm:text-sm">
                <input type="checkbox" checked={passnineTimes[t.id]} onChange={(e) => setPassnineTimes({ ...passnineTimes, [t.id]: e.target.checked })} className="w-4 h-4 accent-cyan-500" />
                <span>{t.label}</span>
              </label>
            ))}
          </div>
        </section>
      )}

      {/* 5-2. 밀양 아리랑 풀장 시간대 */}
      {pools.miryang && (
        <section className="bg-slate-900/80 p-4 rounded-2xl mb-5 border border-cyan-500/30 shadow-xl">
          <h2 className="text-sm font-bold mb-3 text-cyan-300">📍 5-2. 밀양 아리랑 풀장 세부 시간대</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            <label className={`flex flex-col p-2 rounded-xl border text-xs cursor-pointer ${isWeekend ? 'bg-slate-800/80 border-slate-700' : 'bg-slate-900/40 border-slate-800 opacity-50'}`}>
              <div className="flex items-center space-x-2">
                <input type="checkbox" disabled={!isWeekend} checked={miryangTimes.t0} onChange={(e) => setMiryangTimes({ ...miryangTimes, t0: e.target.checked })} className="w-3.5 h-3.5 accent-cyan-500" />
                <span className="font-bold">조조 오전부 (08~10시)</span>
              </div>
              <span className="text-[10px] text-amber-400 mt-1 pl-5">⚠️ 주말 전용</span>
            </label>
            {[{ id: 't1', label: '1부 (10~12시)' }, { id: 't2', label: '2부 (12~14시)' }, { id: 't3', label: '3부 (14~16시)' }, { id: 't4', label: '4부 (16~18시)' }, { id: 't5', label: '5부 (18~20시)' }, { id: 't6', label: '6부 (20~22시)' }].map((t) => (
              <label key={t.id} className="flex items-center space-x-2 bg-slate-800/60 p-2.5 rounded-xl cursor-pointer border border-slate-700 text-xs">
                <input type="checkbox" checked={miryangTimes[t.id]} onChange={(e) => setMiryangTimes({ ...miryangTimes, [t.id]: e.target.checked })} className="w-3.5 h-3.5 accent-cyan-500" />
                <span>{t.label}</span>
              </label>
            ))}
          </div>
        </section>
      )}

      <button onClick={handleSubmit} disabled={loading} className="w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl text-base sm:text-lg font-extrabold text-white hover:from-cyan-400 hover:to-blue-500 transition shadow-lg cursor-pointer">
        {loading ? '🌊 조건에 딱 맞는 전담 강사님을 매칭 중입니다...' : '🎯 맞춤 강사 매칭 접수하기'}
      </button>

      {matchedInstructor && (
        <div className="mt-6 bg-slate-900 border-2 border-cyan-400 p-6 rounded-2xl text-center shadow-2xl">
          <div className="inline-block bg-cyan-950 text-cyan-300 text-xs px-3 py-1 rounded-full mb-3 border border-cyan-700 font-semibold">🎉 100% 매칭 성공!</div>
          <h2 className="text-2xl font-bold mb-4 text-white">담당 강사: {matchedInstructor.name} 강사님</h2>
          {matchedInstructor.profile_image && <img src={matchedInstructor.profile_image} alt={matchedInstructor.name} className="w-28 h-28 rounded-full mx-auto mb-4 object-cover border-4 border-cyan-500" />}
          <p className="text-slate-300 mb-6 bg-slate-950 p-4 rounded-xl text-sm leading-relaxed border border-slate-800">{matchedInstructor.bio || '친절하고 안전하게 수중 스포츠의 즐거움을 전해드립니다!'}</p>
          {matchedInstructor.kakao_chat_url ? (
            <a href={matchedInstructor.kakao_chat_url} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center px-6 py-3 bg-yellow-400 text-slate-950 font-extrabold rounded-xl hover:bg-yellow-300 transition w-full sm:w-auto">
              💬 강사님과 카카오톡 오픈채팅 상담하기
            </a>
          ) : (
            <p className="text-amber-400 text-sm">카카오톡 오픈채팅 링크 준비중입니다.</p>
          )}
        </div>
      )}

      {noMatch && (
        <div className="mt-6 bg-slate-900 border border-slate-800 p-6 rounded-2xl text-center">
          <p className="text-slate-300 text-sm mb-2">🥲 조건에 정확히 일치하는 강사님이 현재 없습니다.</p>
          <p className="text-xs text-slate-500">풀장이나 시간대 조건을 조금 넓혀서 다시 시도해 보세요!</p>
        </div>
      )}
    </div>
  );
}
