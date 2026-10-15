'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface Instructor {
  id: string;
  name: string;
  username: string;
  password?: string;
  is_approved: boolean;
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

export default function InstructorMyPage() {
  const [viewMode, setViewMode] = useState<'login' | 'signup' | 'dashboard' | 'admin'>('login');
  
  // 로그인 입력값
  const [loginId, setLoginId] = useState('');
  const [loginPw, setLoginPw] = useState('');
  
  // 회원가입 입력값
  const [signupName, setSignupName] = useState('');
  const [signupId, setSignupId] = useState('');
  const [signupPw, setSignupPw] = useState('');

  const [currentInstructor, setCurrentInstructor] = useState<Instructor | null>(null);
  const [allInstructors, setAllInstructors] = useState<Instructor[]>([]);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  // 강사 목록 불러오기
  const fetchInstructors = async () => {
    const { data, error } = await supabase.from('instructors').select('*');
    if (!error && data) {
      setAllInstructors(data);
    }
  };

  useEffect(() => {
    fetchInstructors();
  }, []);

  // 로그인 처리
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setNotice(null);

    // 1. 관리자 계정 체크 (admin / ksu0393!)
    if (loginId.trim() === 'admin' && loginPw === 'ksu0393!') {
      setViewMode('admin');
      fetchInstructors();
      return;
    }

    setLoading(true);
    const { data, error } = await supabase
      .from('instructors')
      .select('*')
      .eq('username', loginId.trim())
      .single();

    setLoading(false);

    if (error || !data) {
      setNotice('⚠️ 존재하지 않는 아이디이거나 비밀번호가 틀렸습니다.');
      return;
    }

    if (!data.is_approved) {
      setNotice('⏳ 관리자의 승인이 대기 중입니다. 승인 후 로그인이 가능합니다.');
      return;
    }

    setCurrentInstructor(data);
    setViewMode('dashboard');
  };

  // 회원가입 처리
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setNotice(null);

    if (!signupName || !signupId || !signupPw) {
      setNotice('⚠️ 모든 항목을 입력해 주세요.');
      return;
    }

    setLoading(true);
    const { error } = await supabase.from('instructors').insert([
      {
        name: signupName,
        username: signupId,
        password: signupPw,
        is_approved: false, // 기본 미승인 상태
        max_freediving_level: 0,
        max_mermaid_level: 0,
        max_youth_level: 0,
        can_safety_guard: false,
        can_scuba: false,
        can_special: false,
        can_duryu: false,
        can_passnine: false,
        can_miryang: false,
      },
    ]);
    setLoading(false);

    if (error) {
      setNotice('⚠️ 회원가입 실패 (이미 사용 중인 아이디일 수 있습니다.)');
    } else {
      setNotice('🎉 회원가입이 완료되었습니다! 관리자 승인 후 로그인해 주세요.');
      setViewMode('login');
    }
  };

  // 강사 정보 업데이트
  const handleUpdateProfile = async () => {
    if (!currentInstructor) return;
    setLoading(true);
    const { error } = await supabase
      .from('instructors')
      .update(currentInstructor)
      .eq('id', currentInstructor.id);
    setLoading(false);

    if (error) {
      setNotice('⚠️ 정보 수정 중 오류가 발생했습니다.');
    } else {
      setNotice('✨ 강사 프로필 및 매칭 조건이 성공적으로 저장되었습니다!');
    }
  };

  // 관리자 기능: 강사 승인
  const handleApproveInstructor = async (id: string, status: boolean) => {
    await supabase.from('instructors').update({ is_approved: status }).eq('id', id);
    fetchInstructors();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 max-w-4xl mx-auto font-sans">
      
      {/* 상단 헤더 */}
      <header className="text-center mb-8 pt-4">
        <span className="text-xs font-semibold px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
          BLUE PEACE INSTRUCTOR PORTAL
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold mt-3 text-white">
          🔐 강사 마이페이지 & 관리자 대시보드
        </h1>
      </header>

      {notice && (
        <div className="mb-6 bg-slate-900 border border-cyan-500 text-cyan-300 p-4 rounded-xl text-sm text-center font-semibold shadow-lg">
          {notice}
        </div>
      )}

      {/* 1. 로그인 화면 */}
      {viewMode === 'login' && (
        <div className="max-w-md mx-auto bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl">
          <h2 className="text-xl font-bold mb-4 text-cyan-400 text-center">로그인</h2>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs text-slate-400 mb-1">아이디</label>
              <input
                type="text"
                value={loginId}
                onChange={(e) => setLoginId(e.target.value)}
                placeholder="아이디를 입력하세요"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white focus:border-cyan-500 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">비밀번호</label>
              <input
                type="password"
                value={loginPw}
                onChange={(e) => setLoginPw(e.target.value)}
                placeholder="비밀번호를 입력하세요"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white focus:border-cyan-500 focus:outline-none"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-cyan-600 hover:bg-cyan-500 rounded-xl text-white font-bold transition shadow-md"
            >
              {loading ? '로그인 중...' : '로그인'}
            </button>
          </form>
          <div className="mt-4 text-center">
            <button
              onClick={() => { setViewMode('signup'); setNotice(null); }}
              className="text-xs text-slate-400 hover:text-cyan-400 underline"
            >
              소속 강사 회원가입 하러가기 →
            </button>
          </div>
        </div>
      )}

      {/* 2. 회원가입 화면 */}
      {viewMode === 'signup' && (
        <div className="max-w-md mx-auto bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl">
          <h2 className="text-xl font-bold mb-4 text-cyan-400 text-center">소속 강사 회원가입</h2>
          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label className="block text-xs text-slate-400 mb-1">강사 성함</label>
              <input
                type="text"
                value={signupName}
                onChange={(e) => setSignupName(e.target.value)}
                placeholder="성함을 입력하세요"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white focus:border-cyan-500 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">아이디</label>
              <input
                type="text"
                value={signupId}
                onChange={(e) => setSignupId(e.target.value)}
                placeholder="사용할 아이디"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white focus:border-cyan-500 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">비밀번호</label>
              <input
                type="password"
                value={signupPw}
                onChange={(e) => setSignupPw(e.target.value)}
                placeholder="비밀번호"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white focus:border-cyan-500 focus:outline-none"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 rounded-xl text-white font-bold transition shadow-md"
            >
              {loading ? '가입 신청 중...' : '회원가입 신청'}
            </button>
          </form>
          <div className="mt-4 text-center">
            <button
              onClick={() => { setViewMode('login'); setNotice(null); }}
              className="text-xs text-slate-400 hover:text-cyan-400 underline"
            >
              ← 로그인 화면으로 돌아가기
            </button>
          </div>
        </div>
      )}

      {/* 3. 관리자 대시보드 (admin / ksu0393!) */}
      {viewMode === 'admin' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center bg-slate-900 p-4 rounded-2xl border border-cyan-500/40">
            <div>
              <h2 className="text-lg font-bold text-cyan-400">👑 관리자 대시보드 (Admin)</h2>
              <p className="text-xs text-slate-400 mt-0.5">강사 가입 승인 및 기초 유입 통계 확인</p>
            </div>
            <button
              onClick={() => setViewMode('login')}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-bold rounded-xl border border-slate-700"
            >
              로그아웃
            </button>
          </div>

          {/* 기초 통계 카드 그리드 */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 text-center">
              <span className="text-xs text-slate-400">오늘 홈페이지 유입수</span>
              <p className="text-2xl font-extrabold text-cyan-400 mt-1">142 명</p>
              <span className="text-[10px] text-slate-500 mt-1 block">주요 유입경로: 네이버 검색 / 직접 접속</span>
            </div>
            <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 text-center">
              <span className="text-xs text-slate-400">등록된 총 소속 강사</span>
              <p className="text-2xl font-extrabold text-blue-400 mt-1">{allInstructors.length} 명</p>
            </div>
            <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 text-center">
              <span className="text-xs text-slate-400">이번 달 총 매칭 건수</span>
              <p className="text-2xl font-extrabold text-emerald-400 mt-1">28 건</p>
            </div>
          </div>

          {/* 강사 가입 승인 관리 테이블 */}
          <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800">
            <h3 className="text-base font-bold mb-3 text-slate-200">👥 소속 강사 가입 승인 관리</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 text-xs">
                    <th className="pb-2">강사명</th>
                    <th className="pb-2">아이디</th>
                    <th className="pb-2">승인 상태</th>
                    <th className="pb-2 text-right">관리</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {allInstructors.map((ins) => (
                    <tr key={ins.id} className="text-xs">
                      <td className="py-3 font-bold text-white">{ins.name}</td>
                      <td className="py-3 text-slate-400">{ins.username}</td>
                      <td className="py-3">
                        {ins.is_approved ? (
                          <span className="px-2 py-0.5 bg-emerald-950 text-emerald-400 rounded border border-emerald-800">승인됨</span>
                        ) : (
                          <span className="px-2 py-0.5 bg-amber-950 text-amber-400 rounded border border-amber-800">승인 대기중</span>
                        )}
                      </td>
                      <td className="py-3 text-right">
                        {ins.is_approved ? (
                          <button
                            onClick={() => handleApproveInstructor(ins.id, false)}
                            className="px-3 py-1 bg-red-900/60 hover:bg-red-900 text-red-200 rounded-lg text-xs"
                          >
                            승인 취소
                          </button>
                        ) : (
                          <button
                            onClick={() => handleApproveInstructor(ins.id, true)}
                            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold"
                          >
                            승인하기
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 4. 소속 강사 대시보드 (마이페이지 & 정보 수정) */}
      {viewMode === 'dashboard' && currentInstructor && (
        <div className="space-y-6">
          <div className="flex justify-between items-center bg-slate-900 p-4 rounded-2xl border border-cyan-500/40">
            <div>
              <h2 className="text-lg font-bold text-cyan-400">👋 환영합니다, {currentInstructor.name} 강사님!</h2>
              <p className="text-xs text-slate-400 mt-0.5">매칭 가능한 본인의 프로필과 가능 조건을 직접 관리하세요.</p>
            </div>
            <button
              onClick={() => { setCurrentInstructor(null); setViewMode('login'); }}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-bold rounded-xl border border-slate-700"
            >
              로그아웃
            </button>
          </div>

          {/* 프로필 기본 정보 수정 */}
          <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-slate-200">📝 기본 프로필 설정</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1">프로필 이미지 URL</label>
                <input
                  type="text"
                  value={currentInstructor.profile_image || ''}
                  onChange={(e) => setCurrentInstructor({ ...currentInstructor, profile_image: e.target.value })}
                  placeholder="이미지 주소를 입력하세요"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">카카오톡 오픈채팅 링크</label>
                <input
                  type="text"
                  value={currentInstructor.kakao_chat_url || ''}
                  onChange={(e) => setCurrentInstructor({ ...currentInstructor, kakao_chat_url: e.target.value })}
                  placeholder="https://open.kakao.com/..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">강사 소개글 (Bio)</label>
              <textarea
                rows={3}
                value={currentInstructor.bio || ''}
                onChange={(e) => setCurrentInstructor({ ...currentInstructor, bio: e.target.value })}
                placeholder="수강생들에게 전할 소개 및 인사말을 적어주세요."
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          {/* 지도 가능 레벨 및 과정 설정 */}
          <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-slate-200">🎯 지도 가능 레벨 및 과정 설정</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">프리다이빙 최고 지도 레벨 (0~4)</label>
                <input
                  type="number"
                  min={0}
                  max={4}
                  value={currentInstructor.max_freediving_level}
                  onChange={(e) => setCurrentInstructor({ ...currentInstructor, max_freediving_level: Number(e.target.value) })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">머메이드 최고 지도 레벨 (0~3)</label>
                <input
                  type="number"
                  min={0}
                  max={3}
                  value={currentInstructor.max_mermaid_level}
                  onChange={(e) => setCurrentInstructor({ ...currentInstructor, max_mermaid_level: Number(e.target.value) })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">유스 프리다이빙 최고 레벨 (0~3)</label>
                <input
                  type="number"
                  min={0}
                  max={3}
                  value={currentInstructor.max_youth_level}
                  onChange={(e) => setCurrentInstructor({ ...currentInstructor, max_youth_level: Number(e.target.value) })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
              <label className="flex items-center space-x-2 text-xs bg-slate-800/60 p-2.5 rounded-xl border border-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={currentInstructor.can_safety_guard}
                  onChange={(e) => setCurrentInstructor({ ...currentInstructor, can_safety_guard: e.target.checked })}
                  className="accent-cyan-500 w-4 h-4"
                />
                <span>수중레저안전요원 지도 가능</span>
              </label>
              <label className="flex items-center space-x-2 text-xs bg-slate-800/60 p-2.5 rounded-xl border border-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={currentInstructor.can_scuba}
                  onChange={(e) => setCurrentInstructor({ ...currentInstructor, can_scuba: e.target.checked })}
                  className="accent-cyan-500 w-4 h-4"
                />
                <span>스쿠버다이빙 지도 가능</span>
              </label>
              <label className="flex items-center space-x-2 text-xs bg-slate-800/60 p-2.5 rounded-xl border border-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={currentInstructor.can_special}
                  onChange={(e) => setCurrentInstructor({ ...currentInstructor, can_special: e.target.checked })}
                  className="accent-cyan-500 w-4 h-4"
                />
                <span>스페셜 교육 지도 가능</span>
              </label>
            </div>
          </div>

          {/* 가능 풀장 및 요일 설정 */}
          <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-slate-200">📍 가능 풀장 및 요일 설정</h3>
            <div className="grid grid-cols-2 gap-3">
              <label className="flex items-center space-x-2 text-xs bg-slate-800/60 p-2.5 rounded-xl border border-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={currentInstructor.can_passnine}
                  onChange={(e) => setCurrentInstructor({ ...currentInstructor, can_passnine: e.target.checked })}
                  className="accent-cyan-500 w-4 h-4"
                />
                <span>칠곡 패스나인 풀장 가능</span>
              </label>
              <label className="flex items-center space-x-2 text-xs bg-slate-800/60 p-2.5 rounded-xl border border-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={currentInstructor.can_miryang}
                  onChange={(e) => setCurrentInstructor({ ...currentInstructor, can_miryang: e.target.checked })}
                  className="accent-cyan-500 w-4 h-4"
                />
                <span>밀양 아리랑 풀장 가능</span>
              </label>
            </div>

            <div>
              <p className="text-xs text-slate-400 mb-2">수업 가능 요일</p>
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
                    onClick={() => setCurrentInstructor({
                      ...currentInstructor,
                      [d.key]: !currentInstructor[d.key as keyof Instructor]
                    })}
                    className={`py-2 rounded-lg text-xs font-bold border transition ${
                      currentInstructor[d.key as keyof Instructor] 
                        ? 'bg-cyan-600 border-cyan-400 text-white' 
                        : 'bg-slate-800 border-slate-700 text-slate-400'
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={handleUpdateProfile}
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl text-base font-extrabold text-white hover:from-cyan-400 hover:to-blue-500 transition shadow-lg cursor-pointer"
          >
            {loading ? '💾 저장 중...' : '💾 내 프로필 및 조건 변경사항 저장하기'}
          </button>
        </div>
      )}

    </div>
  );
}
