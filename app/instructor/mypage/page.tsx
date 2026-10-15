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
  is_approved: boolean;
}

interface CustomerLead {
  id: string;
  name: string;
  phone: string;
  course: string;
  pool: string;
  matched_instructor: string;
  created_at: string;
}

export default function InstructorMyPage() {
  const [instructor, setInstructor] = useState<Instructor | null>(null);
  const [customers, setCustomers] = useState<CustomerLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchPhone, setSearchPhone] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // 강사 로그인 조회 (전화번호 기준)
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchPhone) {
      alert('연락처를 입력해 주세요.');
      return;
    }

    const cleanPhone = searchPhone.replace(/-/g, '').trim();
    const { data, error } = await supabase
      .from('instructors')
      .select('*')
      .ilike('phone', `%${cleanPhone}%`)
      .single();

    if (error || !data) {
      alert('등록되지 않은 강사 연락처입니다. 센터 관리자에게 문의해 주세요.');
      return;
    }

    setInstructor(data);
    setIsLoggedIn(true);
    fetchMatchedCustomers(data.name);
  };

  // 나에게 매칭된 고객 리스트 불러오기
  const fetchMatchedCustomers = async (instructorName: string) => {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('matched_instructor', instructorName)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setCustomers(data);
    }
  };

  // 강사 정보 업데이트 저장
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!instructor) return;

    setSaving(true);
    const { error } = await supabase
      .from('instructors')
      .update(instructor)
      .eq('id', instructor.id);

    setSaving(false);

    if (error) {
      alert('저장 중 오류가 발생했습니다: ' + error.message);
    } else {
      alert('✅ 강사 프로필 및 스케줄 정보가 성공적으로 업데이트되었습니다!');
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-800 p-4 sm:p-8 flex items-center justify-center font-sans">
        <div className="bg-white border border-slate-200 p-8 rounded-3xl shadow-xl max-w-md w-full text-center space-y-6">
          <div>
            <span className="text-xs font-bold px-3 py-1 bg-cyan-100 text-cyan-800 rounded-full">
              BLUE PEACE INSTRUCTOR PORTAL
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 mt-3">🌊 강사 마이페이지 로그인</h1>
            <p className="text-xs text-slate-500 mt-1">등록하신 본인의 휴대폰 번호를 입력해 주세요.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4 text-left">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">연락처</label>
              <input
                type="text"
                value={searchPhone}
                onChange={(e) => setSearchPhone(e.target.value)}
                placeholder="010-0000-0000"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 focus:border-cyan-500 focus:outline-none"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full py-3.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl transition shadow-md cursor-pointer text-sm"
            >
              로그인 및 내 정보 확인
            </button>
          </form>
          <div className="pt-2">
            <a href="/" className="text-xs text-slate-400 hover:text-cyan-600 transition font-medium">
              ← 메인 홈페이지로 돌아가기
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 p-4 sm:p-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* 상단 GNB 및 로그아웃 */}
        <div className="flex justify-between items-center bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-cyan-100 border border-cyan-200 overflow-hidden flex items-center justify-center font-bold text-cyan-700">
              {instructor?.profile_image ? (
                <img src={instructor.profile_image} alt={instructor.name} className="w-full h-full object-cover" />
              ) : (
                instructor?.name?.[0]
              )}
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-black text-slate-900">
                <span className="text-cyan-600">{instructor?.name}</span> 강사님 마이페이지
              </h1>
              <p className="text-xs text-slate-500">블루피스 공식 소속 강사 포털</p>
            </div>
          </div>
          <button
            onClick={() => setIsLoggedIn(false)}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer"
          >
            로그아웃
          </button>
        </div>

        {/* 🌟 [신규 추가] 나에게 매칭된 고객(수강생) 문의/신청 리스트 */}
        <div className="bg-white border border-cyan-200 p-6 sm:p-7 rounded-3xl shadow-md space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span>🎯 나에게 매칭된 수강생 신청 내역</span>
              <span className="text-xs px-2.5 py-0.5 bg-cyan-100 text-cyan-800 font-extrabold rounded-full">
                {customers.length}명
              </span>
            </h2>
            <button
              onClick={() => fetchMatchedCustomers(instructor!.name)}
              className="text-xs text-cyan-600 hover:text-cyan-700 font-bold underline cursor-pointer"
            >
              새로고침 ↻
            </button>
          </div>

          {customers.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs">
              아직 매칭된 수강생 문의 내역이 없습니다. 수강생이 매칭을 완료하면 이곳에 실시간으로 표시됩니다!
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {customers.map((cus) => (
                <div key={cus.id} className="bg-slate-50 border border-slate-200 p-4 rounded-2xl flex flex-col justify-between shadow-xs space-y-3">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-bold text-slate-900">{cus.name} 님</span>
                      <span className="text-[10px] text-slate-400">{new Date(cus.created_at).toLocaleDateString()}</span>
                    </div>
                    <p className="text-xs font-semibold text-cyan-700">과정: {cus.course}</p>
                    <p className="text-xs text-slate-600 mt-0.5">희망 풀장: {cus.pool}</p>
                    <p className="text-xs text-slate-500 mt-0.5">연락처: <span className="font-bold text-slate-800">{cus.phone}</span></p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200/60">
                    <a
                      href={`tel:${cus.phone}`}
                      className="py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded-xl text-center transition shadow-xs cursor-pointer"
                    >
                      📞 전화 걸기
                    </a>
                    <a
                      href={`sms:${cus.phone}`}
                      className="py-2 bg-white hover:bg-slate-100 text-cyan-700 border border-cyan-300 text-xs font-bold rounded-xl text-center transition shadow-xs cursor-pointer"
                    >
                      💬 문자 보내기
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 기존 강사 프로필 및 스케줄 수정 폼 */}
        <form onSubmit={handleUpdateProfile} className="bg-white border border-slate-200 p-6 sm:p-8 rounded-3xl shadow-sm space-y-6">
          <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
            ⚙️ 내 프로필 및 수업 가능 일정 관리
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">강사 성함</label>
              <input
                type="text"
                value={instructor?.name || ''}
                onChange={(e) => setInstructor({ ...instructor!, name: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">연락처</label>
              <input
                type="text"
                value={instructor?.phone || ''}
                onChange={(e) => setInstructor({ ...instructor!, phone: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">프로필 이미지 URL</label>
            <input
              type="text"
              value={instructor?.profile_image || ''}
              onChange={(e) => setInstructor({ ...instructor!, profile_image: e.target.value })}
              placeholder="https://... 이미지 주소 입력"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">강사 소개 및 인사말</label>
            <textarea
              value={instructor?.bio || ''}
              onChange={(e) => setInstructor({ ...instructor!, bio: e.target.value })}
              rows={3}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900"
              placeholder="수강생들에게 전할 인사말을 입력하세요"
            />
          </div>

          <div className="pt-4 border-t border-slate-100">
            <h3 className="text-xs font-bold text-cyan-700 mb-3">📅 수업 가능 요일 설정</h3>
            <div className="grid grid-cols-7 gap-1.5">
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
                  onClick={() => setInstructor({ ...instructor!, [d.key]: !instructor![d.key as keyof Instructor] })}
                  className={`py-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
                    instructor![d.key as keyof Instructor]
                      ? 'bg-cyan-600 border-cyan-500 text-white shadow-xs'
                      : 'bg-slate-50 border-slate-200 text-slate-500'
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white font-extrabold rounded-2xl text-xs sm:text-sm transition shadow-md cursor-pointer"
          >
            {saving ? '저장 중...' : '💾 변경된 정보 저장하기'}
          </button>
        </form>

      </div>
    </div>
  );
}
