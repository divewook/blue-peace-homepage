'use client';

import React, { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function InstructorMypage() {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    profile_image: '',
    bio: '',
    kakao_chat_url: '',
    max_freediving_level: 2,
    max_mermaid_level: 0,
    max_youth_level: 0,
    can_safety_guard: false,
    can_passnine: true,
    can_miryang: false,
    can_duryu: false,
    available_mon: true,
    available_tue: true,
    available_wed: true,
    available_thu: true,
    available_fri: true,
    available_sat: true,
    available_sun: true,
    passnine_t1: true,
    passnine_t2: true,
    passnine_t3: false,
    passnine_t4: false,
    miryang_t0: false,
    miryang_t1: true,
    miryang_t2: true,
    miryang_t3: false,
    miryang_t4: false,
    miryang_t5: false,
    miryang_t6: false,
  });

  const handleSave = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert('로그인이 필요합니다. 먼저 로그인해 주세요!');
        setLoading(false);
        return;
      }

      const { error } = await supabase.from('instructors').upsert({
        id: user.id,
        ...form,
      });

      if (error) {
        alert('저장 중 오류가 발생했습니다: ' + error.message);
      } else {
        alert('강사 프로필 및 매칭 스케줄이 성공적으로 저장되었습니다! 🎉');
      }
    } catch (err) {
      console.error(err);
      alert('오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6 max-w-3xl mx-auto font-sans">
      <h1 className="text-3xl font-bold text-center mb-8 text-cyan-400">👨‍🏫 강사 전용 마이페이지</h1>

      {/* 기본 인적사항 */}
      <section className="bg-slate-800 p-5 rounded-2xl mb-6 border border-slate-700 space-y-4">
        <h2 className="text-xl font-semibold text-cyan-300">1. 강사 기본 프로필</h2>
        <div>
          <label className="block text-sm mb-1 text-slate-300">강사 성함 / 닉네임</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="예: 김블루 강사"
            className="w-full p-3 rounded-xl bg-slate-700 border border-slate-600 text-white"
          />
        </div>

        <div>
          <label className="block text-sm mb-1 text-slate-300">프로필 이미지 URL</label>
          <input
            type="text"
            value={form.profile_image}
            onChange={(e) => setForm({ ...form, profile_image: e.target.value })}
            placeholder="https://..."
            className="w-full p-3 rounded-xl bg-slate-700 border border-slate-600 text-white text-sm"
          />
        </div>

        <div>
          <label className="block text-sm mb-1 text-slate-300">카카오톡 오픈채팅 링크</label>
          <input
            type="text"
            value={form.kakao_chat_url}
            onChange={(e) => setForm({ ...form, kakao_chat_url: e.target.value })}
            placeholder="https://open.kakao.com/o/..."
            className="w-full p-3 rounded-xl bg-slate-700 border border-slate-600 text-white text-sm"
          />
        </div>

        <div>
          <label className="block text-sm mb-1 text-slate-300">강사 한줄 소개글</label>
          <textarea
            value={form.bio}
            onChange={(e) => setForm({ ...form, bio: e.target.value })}
            rows={3}
            placeholder="수강생들에게 보여질 소개글을 적어주세요."
            className="w-full p-3 rounded-xl bg-slate-700 border border-slate-600 text-white text-sm"
          />
        </div>
      </section>

      {/* 지도 가능 코스 & 레벨 */}
      <section className="bg-slate-800 p-5 rounded-2xl mb-6 border border-slate-700 space-y-4">
        <h2 className="text-xl font-semibold text-cyan-300">2. 지도 가능 종목 및 최고 레벨</h2>
        <div>
          <label className="block text-sm mb-1 text-slate-300">프리다이빙 지도 최고 가능 레벨</label>
          <select
            value={form.max_freediving_level}
            onChange={(e) => setForm({ ...form, max_freediving_level: Number(e.target.value) })}
            className="w-full p-3 rounded-xl bg-slate-700 border border-slate-600 text-white"
          >
            <option value={0}>체험 과정만 가능</option>
            <option value={1}>1레벨까지 가능</option>
            <option value={2}>2레벨(1+2패키지)까지 가능</option>
            <option value={3}>3레벨(1+2+3패키지)까지 가능</option>
            <option value={4}>All 패키지 (강사급) 가능</option>
          </select>
        </div>
      </section>

      {/* 출강 가능 풀장 */}
      <section className="bg-slate-800 p-5 rounded-2xl mb-6 border border-slate-700">
        <h2 className="text-xl font-semibold mb-3 text-cyan-300">3. 출강 가능 풀장</h2>
        <div className="space-y-2">
          <label className="flex items-center space-x-3 bg-slate-700 p-3 rounded-xl cursor-pointer">
            <input
              type="checkbox"
              checked={form.can_passnine}
              onChange={(e) => setForm({ ...form, can_passnine: e.target.checked })}
              className="w-5 h-5 accent-cyan-500"
            />
            <span>칠곡 패스나인 풀장</span>
          </label>
          <label className="flex items-center space-x-3 bg-slate-700 p-3 rounded-xl cursor-pointer">
            <input
              type="checkbox"
              checked={form.can_miryang}
              onChange={(e) => setForm({ ...form, can_miryang: e.target.checked })}
              className="w-5 h-5 accent-cyan-500"
            />
            <span>밀양 풀장</span>
          </label>
        </div>
      </section>

      <button
        onClick={handleSave}
        disabled={loading}
        className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl text-lg font-bold text-white hover:from-emerald-400 hover:to-teal-500 transition shadow-lg shadow-teal-900/40"
      >
        {loading ? '저장 중...' : '💾 마이페이지 정보 저장하기'}
      </button>
    </div>
  );
}
