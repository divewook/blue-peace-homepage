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

interface CustomerBooking {
  id: string;
  created_at: string;
  name: string;
  phone: string;
  course: string;
  pool: string;
  time_slot: string;
  matched_instructor: string;
}

export default function InstructorMyPage() {
  const [viewMode, setViewMode] = useState<'login' | 'signup' | 'dashboard' | 'admin' | 'settings'>('login');
  
  const [loginId, setLoginId] = useState('');
  const [loginPw, setLoginPw] = useState('');
  
  const [signupName, setSignupName] = useState('');
  const [signupId, setSignupId] = useState('');
  const [signupPw, setSignupPw] = useState('');

  const [currentPwInput, setCurrentPwInput] = useState('');
  const [newPwInput, setNewPwInput] = useState('');

  const [currentInstructor, setCurrentInstructor] = useState<Instructor | null>(null);
  const [allInstructors, setAllInstructors] = useState<Instructor[]>([]);
  const [bookings, setBookings] = useState<CustomerBooking[]>([]);
  
  const [statsPeriod, setStatsPeriod] = useState<'1d' | '1w' | '1m' | '6m' | '1y'>('1m');
  const [adminSelectedInstructorId, setAdminSelectedInstructorId] = useState<string>('all');

  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const fetchData = async () => {
    const { data: insData } = await supabase.from('instructors').select('*');
    if (insData) setAllInstructors(insData);

    const { data: bookData } = await supabase.from('customers').select('*').order('created_at', { ascending: false });
    if (bookData) setBookings(bookData);
  };

  useEffect(() => {
    fetchData();
  }, []);

  // 로그아웃 및 입력값 완전 초기화 함수
  const handleLogout = () => {
    setCurrentInstructor(null);
    setLoginId('');
    setLoginPw('');
    setNotice(null);
    setViewMode('login');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setNotice(null);

    if (loginId.trim() === 'admin' && loginPw === 'ksu0393!') {
      setViewMode('admin');
      fetchData();
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

    if (data.password && data.password !== loginPw) {
      setNotice('⚠️ 비밀번호가 일치하지 않습니다.');
      return;
    }

    if (!data.is_approved) {
      setNotice('⏳ 관리자의 승인이 대기 중입니다. 승인 후 로그인이 가능합니다.');
      return;
    }

    setCurrentInstructor(data);
    
    // 프로필 미입력 강사는 무조건 설정 화면으로 강제 이동
    if (!data.phone || !data.bio) {
      setViewMode('settings');
      setNotice('✨ 최초 로그인입니다! 고객 매칭을 위해 프로필 및 조건을 먼저 설정해 주세요.');
    } else {
      setViewMode('dashboard');
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setNotice(null);

    const idRegex = /^[a-zA-Z0-9]+$/;
    if (!idRegex.test(signupId)) {
      setNotice('⚠️ 아이디는 영문 또는 영문+숫자 조합으로만 입력해 주세요.');
      return;
    }

    if (signupPw.length < 8 || signupPw.length > 13) {
      setNotice('⚠️ 비밀번호는 8자리 이상 13자리 이하로 입력해 주세요.');
      return;
    }

    setLoading(true);
    const { error } = await supabase.from('instructors').insert([
      {
        name: signupName,
        username: signupId.trim(),
        password: signupPw,
        is_approved: false,
      },
    ]);
    setLoading(false);

    if (error) {
      setNotice(`⚠️ 회원가입 실패 (이미 사용 중인 아이디일 수 있습니다): ${error.message}`);
    } else {
      setNotice('🎉 회원가입 신청이 완료되었습니다! 관리자 승인 후 로그인해 주세요.');
      setViewMode('login');
    }
  };

  const handleChangePassword = async () => {
    if (!currentInstructor) return;
    if (currentInstructor.password && currentInstructor.password !== currentPwInput) {
      setNotice('⚠️ 현재 비밀번호가 올바르지 않습니다.');
      return;
    }
    if (newPwInput.length < 8 || newPwInput.length > 13) {
      setNotice('⚠️ 새 비밀번호는 8자리 이상 13자리 이하로 입력해 주세요.');
      return;
    }

    setLoading(true);
    const { error } = await supabase
      .from('instructors')
      .update({ password: newPwInput })
      .eq('id', currentInstructor.id);
    setLoading(false);

    if (error) {
      setNotice(`⚠️ 비밀번호 변경 실패: ${error.message}`);
    } else {
      setCurrentInstructor({ ...currentInstructor, password: newPwInput });
      setCurrentPwInput('');
      setNewPwInput('');
      setNotice('🔒 비밀번호가 성공적으로 변경되었습니다!');
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/[^0-9]/g, '');
    let formatted = rawValue;
    if (rawValue.length > 3 && rawValue.length <= 7) {
      formatted = `${rawValue.slice(0, 3)}-${rawValue.slice(3)}`;
    } else if (rawValue.length > 7) {
      formatted = `${rawValue.slice(0, 3)}-${rawValue.slice(3, 7)}-${rawValue.slice(7, 11)}`;
    }
    if (currentInstructor) {
      setCurrentInstructor({ ...currentInstructor, phone: formatted });
    }
  };

  // 이미지 용량(5MB 제한) 및 해상도(2000px 제한) 검증 및 업로드 핸들러
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !currentInstructor) return;

    const file = files[0];
    const MAX_SIZE_MB = 5;
    const MAX_BYTES = MAX_SIZE_MB * 1024 * 1024;

    // 1. 용량 검증
    if (file.size > MAX_BYTES) {
      setNotice(`⚠️ 이미지 업로드 실패: 파일 용량이 너무 큽니다 (${(file.size / (1024 * 1024)).MB?.toFixed?.(1) || Math.round(file.size / (1024*1024))}MB). 5MB 이하의 이미지를 첨부해 주세요.`);
      e.target.value = '';
      return;
    }

    setUploadingImage(true);

    // 2. 해상도(크기) 검증
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.src = objectUrl;

    img.onload = async () => {
      URL.revokeObjectURL(objectUrl);
      const MAX_DIMENSION = 2000;

      if (img.width > MAX_DIMENSION || img.height > MAX_DIMENSION) {
        setUploadingImage(false);
        setNotice(`⚠️ 이미지 업로드 실패: 해상도(픽셀 크기)가 너무 큽니다 (${img.width}x${img.height}px). 가로/세로 2000px 이하의 이미지를 사용해 주세요.`);
        e.target.value = '';
        return;
      }

      // 검증 통과 시 안전하게 Base64 데이터 또는 스토리지 업로드 처리
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        const base64Result = uploadEvent.target?.result as string;
        setCurrentInstructor({ ...currentInstructor, profile_image: base64Result });
        setUploadingImage(false);
        setNotice('📸 프로필 사진이 정상적으로 첨부되었습니다! 아래 저장하기를 눌러주세요.');
      };
      reader.readAsDataURL(file);
    };

    img.onerror = () => {
      setUploadingImage(false);
      setNotice('⚠️ 이미지 파일 형식을 읽어오지 못했습니다. 다른 이미지로 시도해 주세요.');
    };
  };

  const handleUpdateProfile = async () => {
    if (!currentInstructor) return;
    
    // 필수 프로필 입력 검증
    if (!currentInstructor.phone || !currentInstructor.bio) {
      setNotice('⚠️ 개인 연락처와 강사 소개글은 필수 입력 항목입니다.');
      return;
    }

    setLoading(true);
    const { error } = await supabase
      .from('instructors')
      .update(currentInstructor)
      .eq('id', currentInstructor.id);
    setLoading(false);

    if (error) {
      setNotice(`⚠️ 저장 실패: ${error.message}`);
    } else {
      setNotice('✨ 프로필 및 매칭 조건이 성공적으로 저장되었습니다!');
      setViewMode('dashboard');
    }
  };

  const handleApproveInstructor = async (id: string, status: boolean) => {
    await supabase.from('instructors').update({ is_approved: status }).eq('id', id);
    fetchData();
  };

  const filterByPeriod = (items: CustomerBooking[]) => {
    const now = new Date().getTime();
    const msMap = {
      '1d': 24 * 60 * 60 * 1000,
      '1w': 7 * 24 * 60 * 60 * 1000,
      '1m': 30 * 24 * 60 * 60 * 1000,
      '6m': 180 * 24 * 60 * 60 * 1000,
      '1y': 365 * 24 * 60 * 60 * 1000,
    };
    const limit = msMap[statsPeriod];
    return items.filter(b => now - new Date(b.created_at).getTime() <= limit);
  };

  const myBookings = currentInstructor ? filterByPeriod(bookings.filter(b => b.matched_instructor === currentInstructor.name)) : [];

  const getFreedivingLabel = (lvl: number) => {
    switch(lvl) {
      case 1: return '1레벨 (프리다이버)';
      case 2: return '2레벨 (어드밴스드)';
      case 3: return '3레벨 (마스터)';
      case 4: return '4레벨 (강사 - 하위 레벨 전체 가능)';
      default: return '불가';
    }
  };

  const getMermaidYouthLabel = (lvl: number) => {
    switch(lvl) {
      case 1: return '1레벨';
      case 2: return '2레벨';
      case 3: return '3레벨 (강사 - 하위 레벨 전체 가능)';
      default: return '불가';
    }
  };

  const getSafetyGuardLabel = (lvl: number) => {
    switch(lvl) {
      case 1: return '수중레저안전요원';
      case 2: return '마스터 안전요원';
      case 3: return '안전요원 강사';
      default: return '불가';
    }
  };

  const getScubaLabel = (lvl: number) => {
    switch(lvl) {
      case 1: return '오픈워터~마스터';
      case 2: return '스쿠버 강사';
      default: return '불가';
    }
  };

  const getGeneralEduLabel = (lvl: number) => {
    switch(lvl) {
      case 1: return '일반 교육 가능';
      case 2: return '전문 강사';
      default: return '불가';
    }
  };

  // 대시보드 진입 시 프로필 미입력자 차단 핸들러
  const handleGoDashboard = () => {
    if (!currentInstructor?.phone || !currentInstructor?.bio) {
      setNotice('⚠️ 최초 강사 가입 후 프로필 및 연락처를 반드시 입력해야 대시보드로 이동할 수 있습니다.');
      setViewMode('settings');
      return;
    }
    setViewMode('dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 max-w-4xl mx-auto font-sans pb-24">
      
      <header className="text-center mb-6 pt-4">
        <span className="text-[11px] font-semibold px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
          BLUE PEACE INSTRUCTOR PORTAL
        </span>
        <h1 className="text-xl sm:text-2xl font-extrabold mt-3 text-white">
          🔐 강사 마이페이지 & 대시보드
        </h1>
      </header>

      {notice && (
        <div className="mb-5 bg-slate-900 border border-cyan-500 text-cyan-300 p-3.5 rounded-xl text-xs sm:text-sm text-center font-semibold shadow-lg">
          {notice}
        </div>
      )}

      {/* 1. 로그인 화면 */}
      {viewMode === 'login' && (
        <div className="max-w-md mx-auto bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-xl">
          <h2 className="text-lg font-bold mb-4 text-cyan-400 text-center">강사 로그인</h2>
          <form onSubmit={handleLogin} className="space-y-3.5">
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
              className="w-full py-3 bg-cyan-600 hover:bg-cyan-500 rounded-xl text-white font-bold transition shadow-md cursor-pointer"
            >
              {loading ? '로그인 중...' : '로그인'}
            </button>
          </form>
          <div className="mt-4 text-center">
            <button
              onClick={() => { setViewMode('signup'); setNotice(null); }}
              className="text-xs text-slate-400 hover:text-cyan-400 underline cursor-pointer"
            >
              소속 강사 회원가입 신청하기 →
            </button>
          </div>
        </div>
      )}

      {/* 2. 회원가입 화면 */}
      {viewMode === 'signup' && (
        <div className="max-w-md mx-auto bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-xl">
          <h2 className="text-lg font-bold mb-4 text-cyan-400 text-center">소속 강사 회원가입</h2>
          <form onSubmit={handleSignup} className="space-y-3.5">
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
              <label className="block text-xs text-slate-400 mb-1">아이디 (영문 또는 영문+숫자)</label>
              <input
                type="text"
                value={signupId}
                onChange={(e) => setSignupId(e.target.value)}
                placeholder="예: instructor1"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white focus:border-cyan-500 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">비밀번호 (8~13자리)</label>
              <input
                type="password"
                value={signupPw}
                onChange={(e) => setSignupPw(e.target.value)}
                placeholder="8~13자리 비밀번호"
                maxLength={13}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white focus:border-cyan-500 focus:outline-none"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 rounded-xl text-white font-bold transition shadow-md cursor-pointer"
            >
              {loading ? '가입 신청 중...' : '회원가입 신청'}
            </button>
          </form>
          <div className="mt-4 text-center">
            <button
              onClick={() => { setViewMode('login'); setNotice(null); }}
              className="text-xs text-slate-400 hover:text-cyan-400 underline cursor-pointer"
            >
              ← 로그인 화면으로 돌아가기
            </button>
          </div>
        </div>
      )}

      {/* 3. 관리자 대시보드 */}
      {viewMode === 'admin' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center bg-slate-900 p-4 rounded-2xl border border-cyan-500/40">
            <div>
              <h2 className="text-base font-bold text-cyan-400">👑 관리자 대시보드</h2>
              <p className="text-[11px] text-slate-400">강사 승인 및 강사별 매칭 통계 모니터링</p>
            </div>
            <button
              onClick={handleLogout}
              className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-bold rounded-xl border border-slate-700 cursor-pointer"
            >
              로그아웃
            </button>
          </div>

          <div className="bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-800">
            <h3 className="text-sm font-bold mb-3 text-slate-200">👥 소속 강사 승인 관리</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="pb-2">강사명</th>
                    <th className="pb-2">아이디</th>
                    <th className="pb-2">상태</th>
                    <th className="pb-2 text-right">관리</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {allInstructors.map((ins) => (
                    <tr key={ins.id}>
                      <td className="py-3 font-bold text-white">{ins.name}</td>
                      <td className="py-3 text-slate-400">{ins.username}</td>
                      <td className="py-3">
                        {ins.is_approved ? (
                          <span className="px-2 py-0.5 bg-emerald-950 text-emerald-400 rounded border border-emerald-800 text-[11px]">승인됨</span>
                        ) : (
                          <span className="px-2 py-0.5 bg-amber-950 text-amber-400 rounded border border-amber-800 text-[11px]">대기중</span>
                        )}
                      </td>
                      <td className="py-3 text-right">
                        {ins.is_approved ? (
                          <button
                            onClick={() => handleApproveInstructor(ins.id, false)}
                            className="px-2.5 py-1 bg-red-900/60 hover:bg-red-900 text-red-200 rounded-lg text-xs cursor-pointer"
                          >
                            취소
                          </button>
                        ) : (
                          <button
                            onClick={() => handleApproveInstructor(ins.id, true)}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold cursor-pointer"
                          >
                            승인
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <h3 className="text-sm font-bold text-slate-200">📊 강사별 매칭 및 통계 모니터링</h3>
              
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <select
                  value={adminSelectedInstructorId}
                  onChange={(e) => setAdminSelectedInstructorId(e.target.value)}
                  className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white"
                >
                  <option value="all">전체 강사 보기</option>
                  {allInstructors.filter(i => i.is_approved).map(ins => (
                    <option key={ins.id} value={ins.name}>{ins.name} 강사님</option>
                  ))}
                </select>

                <div className="flex bg-slate-800 rounded-xl p-1 border border-slate-700 text-[11px]">
                  {(['1d', '1w', '1m', '6m', '1y'] as const).map(p => (
                    <button
                      key={p}
                      onClick={() => setStatsPeriod(p)}
                      className={`px-2 py-1 rounded-lg font-bold transition cursor-pointer ${statsPeriod === p ? 'bg-cyan-600 text-white' : 'text-slate-400'}`}
                    >
                      {p === '1d' ? '1일' : p === '1w' ? '1주일' : p === '1m' ? '1달' : p === '6m' ? '6개월' : '1년'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {(() => {
              const targetBookings = adminSelectedInstructorId === 'all' 
                ? filterByPeriod(bookings) 
                : filterByPeriod(bookings.filter(b => b.matched_instructor === adminSelectedInstructorId));
              
              return (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-center">
                      <p className="text-[11px] text-slate-400">선택 기간 총 매칭 건수</p>
                      <p className="text-xl font-extrabold text-cyan-400 mt-1">{targetBookings.length} 건</p>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs sm:text-sm">
                      <thead>
                        <tr className="border-b border-slate-800 text-slate-400">
                          <th className="pb-2">접수 일시</th>
                          <th className="pb-2">담당 강사</th>
                          <th className="pb-2">고객 성함</th>
                          <th className="pb-2">연락처</th>
                          <th className="pb-2">코스</th>
                          <th className="pb-2">풀장 및 시간대</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {targetBookings.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="py-6 text-center text-slate-500 text-xs">
                              해당 기간에 매칭된 내역이 없습니다.
                            </td>
                          </tr>
                        ) : (
                          targetBookings.map((b) => (
                            <tr key={b.id}>
                              <td className="py-2.5 text-slate-400">{new Date(b.created_at).toLocaleDateString()}</td>
                              <td className="py-2.5 font-bold text-cyan-300">{b.matched_instructor}</td>
                              <td className="py-2.5 font-bold text-white">{b.name}</td>
                              <td className="py-2.5 text-slate-300">{b.phone}</td>
                              <td className="py-2.5 text-slate-300">{b.course}</td>
                              <td className="py-2.5 text-slate-400">{b.pool} / {b.time_slot}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* 4. 강사 메인 대시보드 */}
      {viewMode === 'dashboard' && currentInstructor && (
        <div className="space-y-6">
          <div className="flex justify-between items-center bg-slate-900 p-4 rounded-2xl border border-cyan-500/40">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-slate-800 overflow-hidden shrink-0 border border-slate-700 flex items-center justify-center">
                {currentInstructor.profile_image ? (
                  <img src={currentInstructor.profile_image} alt="프로필" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-[10px] text-slate-500">사진없음</span>
                )}
              </div>
              <div>
                <h2 className="text-base font-bold text-cyan-400">👋 {currentInstructor.name} 강사님 대시보드</h2>
                <p className="text-[11px] text-slate-400">연락처: {currentInstructor.phone || '미등록'}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode('settings')}
                className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-xs font-bold rounded-xl text-white transition cursor-pointer"
              >
                프로필/조건 수정
              </button>
              <button
                onClick={handleLogout}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-bold rounded-xl border border-slate-700 cursor-pointer"
              >
                로그아웃
              </button>
            </div>
          </div>

          <div className="bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-slate-200">📌 내 설정 조건 명백한 요약</h3>
            
            <div className="space-y-3 text-xs">
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1">
                <p className="text-cyan-400 font-bold">✨ 강사 소개글</p>
                <p className="text-slate-300">{currentInstructor.bio || '등록된 소개글이 없습니다.'}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2">
                  <p className="text-cyan-400 font-bold">🎯 지도 가능 코스 및 자격</p>
                  <ul className="space-y-1 text-slate-300">
                    <li>• 프리다이빙: <span className="text-white font-semibold">{getFreedivingLabel(currentInstructor.max_freediving_level)}</span></li>
                    <li>• 머메이드: <span className="text-white font-semibold">{getMermaidYouthLabel(currentInstructor.max_mermaid_level)}</span></li>
                    <li>• 유스 프리다이빙: <span className="text-white font-semibold">{getMermaidYouthLabel(currentInstructor.max_youth_level)}</span></li>
                    <li>• 안전요원: <span className="text-white font-semibold">{getSafetyGuardLabel(currentInstructor.safety_guard_level)}</span></li>
                    <li>• 스쿠버다이빙: <span className="text-white font-semibold">{getScubaLabel(currentInstructor.scuba_level)}</span></li>
                    <li>• 응급처치 교육: <span className="text-white font-semibold">{getGeneralEduLabel(currentInstructor.first_aid_level)}</span></li>
                    <li>• 수중 사진 교육: <span className="text-white font-semibold">{getGeneralEduLabel(currentInstructor.underwater_photo_level)}</span></li>
                  </ul>
                </div>

                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2">
                  <p className="text-cyan-400 font-bold">📍 풀장 및 수업 가능 요일/시간대</p>
                  <div className="space-y-1.5 text-slate-300">
                    <p>• <strong className="text-white">가능 요일:</strong> {[
                      currentInstructor.available_mon ? '월' : '',
                      currentInstructor.available_tue ? '화' : '',
                      currentInstructor.available_wed ? '수' : '',
                      currentInstructor.available_thu ? '목' : '',
                      currentInstructor.available_fri ? '금' : '',
                      currentInstructor.available_sat ? '토' : '',
                      currentInstructor.available_sun ? '일' : '',
                    ].filter(Boolean).join(', ') || '선택된 요일 없음'}</p>
                    
                    <p>• <strong className="text-white">패스나인:</strong> {currentInstructor.can_passnine ? [
                      currentInstructor.passnine_t1 ? '1부' : '',
                      currentInstructor.passnine_t2 ? '2부' : '',
                      currentInstructor.passnine_t3 ? '3부' : '',
                      currentInstructor.passnine_t4 ? '4부' : '',
                    ].filter(Boolean).join(', ') || '풀장만 선택됨' : '불가'}</p>

                    <p>• <strong className="text-white">밀양아리랑:</strong> {currentInstructor.can_miryang ? [
                      currentInstructor.miryang_t0 ? '조조부' : '',
                      currentInstructor.miryang_t1 ? '오전1부' : '',
                      currentInstructor.miryang_t2 ? '오전2부' : '',
                      currentInstructor.miryang_t3 ? '오후1부' : '',
                      currentInstructor.miryang_t4 ? '오후2부' : '',
                      currentInstructor.miryang_t5 ? '저녁1부' : '',
                      currentInstructor.miryang_t6 ? '저녁2부' : '',
                    ].filter(Boolean).join(', ') || '풀장만 선택됨' : '불가'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-200">📋 나에게 매칭된 고객 리스트</h3>
                <p className="text-[11px] text-slate-400">기간별 매칭 통계 및 수강생 정보 확인</p>
              </div>

              <div className="flex bg-slate-800 rounded-xl p-1 border border-slate-700 text-[11px]">
                {(['1d', '1w', '1m', '6m', '1y'] as const).map(p => (
                  <button
                    key={p}
                    onClick={() => setStatsPeriod(p)}
                    className={`px-2 py-1 rounded-lg font-bold transition cursor-pointer ${statsPeriod === p ? 'bg-cyan-600 text-white' : 'text-slate-400'}`}
                  >
                    {p === '1d' ? '1일' : p === '1w' ? '1주일' : p === '1m' ? '1달' : p === '6m' ? '6개월' : '1년'}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-center">
                <p className="text-[11px] text-slate-400">선택 기간 매칭 수</p>
                <p className="text-xl font-extrabold text-cyan-400 mt-1">{myBookings.length} 건</p>
              </div>
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-center">
                <p className="text-[11px] text-slate-400">매칭 상태</p>
                <p className="text-sm font-bold text-emerald-400 mt-1">정상 운영중 🚀</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="pb-2">접수 일시</th>
                    <th className="pb-2">고객 성함</th>
                    <th className="pb-2">연락처</th>
                    <th className="pb-2">희망 코스</th>
                    <th className="pb-2">풀장 / 시간대</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {myBookings.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-500 text-xs">
                        해당 기간에 매칭된 고객이 없습니다.
                      </td>
                    </tr>
                  ) : (
                    myBookings.map((b) => (
                      <tr key={b.id}>
                        <td className="py-3 text-slate-400">{new Date(b.created_at).toLocaleDateString()}</td>
                        <td className="py-3 font-bold text-white">{b.name}</td>
                        <td className="py-3 text-cyan-300">{b.phone}</td>
                        <td className="py-3 text-slate-300">{b.course}</td>
                        <td className="py-3 text-slate-400">{b.pool} / {b.time_slot}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 5. 프로필 및 조건 설정 화면 */}
      {viewMode === 'settings' && currentInstructor && (
        <div className="space-y-5">
          <div className="flex justify-between items-center bg-slate-900 p-4 rounded-2xl border border-cyan-500/40">
            <div>
              <h2 className="text-base font-bold text-cyan-400">⚙️ 프로필 및 매칭 조건 설정</h2>
              <p className="text-[11px] text-slate-400">모바일 환경에 최적화된 설정 페이지</p>
            </div>
            <button
              onClick={handleGoDashboard}
              className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-bold rounded-xl border border-slate-700 cursor-pointer"
            >
              ← 대시보드로 돌아가기
            </button>
          </div>

          <div className="bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-slate-200">📝 기본 프로필 설정</h3>
            
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="w-20 h-20 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center overflow-hidden shrink-0">
                {currentInstructor.profile_image ? (
                  <img src={currentInstructor.profile_image} alt="프로필" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xs text-slate-500">사진 없음</span>
                )}
              </div>
              <div className="w-full space-y-2">
                <label className="block text-xs text-slate-400">프로필 사진 업로드 (최대 5MB, 해상도 2000px 이하)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="w-full text-xs text-slate-400 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-cyan-600 file:text-white hover:file:bg-cyan-500 cursor-pointer"
                />
                {uploadingImage && <p className="text-[11px] text-cyan-400 animate-pulse">사진 처리 중...</p>}
              </div>
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">개인 연락처 (자동 하이픈)</label>
              <input
                type="text"
                value={currentInstructor.phone || ''}
                onChange={handlePhoneChange}
                placeholder="010-0000-0000"
                maxLength={13}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs text-slate-400">강사 소개글 (최대 300자)</label>
                <span className={`text-[11px] ${(currentInstructor.bio || '').length > 300 ? 'text-red-400 font-bold' : 'text-slate-500'}`}>
                  {(currentInstructor.bio || '').length} / 300자
                </span>
              </div>
              <textarea
                rows={3}
                maxLength={300}
                value={currentInstructor.bio || ''}
                onChange={(e) => setCurrentInstructor({ ...currentInstructor, bio: e.target.value })}
                placeholder="수강생들에게 전할 소개 및 인사말을 적어주세요"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div className="bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-slate-200">🔒 비밀번호 재설정</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">현재 비밀번호</label>
                <input
                  type="password"
                  value={currentPwInput}
                  onChange={(e) => setCurrentPwInput(e.target.value)}
                  placeholder="현재 비밀번호 입력"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">새 비밀번호 (8~13자리)</label>
                <input
                  type="password"
                  value={newPwInput}
                  onChange={(e) => setNewPwInput(e.target.value)}
                  placeholder="새 비밀번호 (8~13자리)"
                  maxLength={13}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>
            <button
              type="button"
              onClick={handleChangePassword}
              disabled={loading}
              className="py-2.5 px-4 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold rounded-xl text-white transition cursor-pointer"
            >
              비밀번호 변경하기
            </button>
          </div>

          <div className="bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-slate-200">🎯 지도 가능 레벨 및 자격 설정</h3>
            
            <div>
              <label className="block text-xs text-slate-400 mb-2">프리다이빙 최고 지도 레벨</label>
              <div className="grid grid-cols-5 gap-1.5">
                {[
                  { level: 0, label: '불가' },
                  { level: 1, label: '1레벨 (프리다이버)' },
                  { level: 2, label: '2레벨 (어드밴스드)' },
                  { level: 3, label: '3레벨 (마스터)' },
                  { level: 4, label: '4레벨 (강사)' },
                ].map((item) => (
                  <button
                    key={item.level}
                    type="button"
                    onClick={() => setCurrentInstructor({ ...currentInstructor, max_freediving_level: item.level })}
                    className={`py-2 px-1 rounded-xl text-[11px] sm:text-xs font-bold border transition cursor-pointer ${
                      currentInstructor.max_freediving_level === item.level
                        ? 'bg-cyan-600 border-cyan-400 text-white shadow'
                        : 'bg-slate-800 border-slate-700 text-slate-400'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-2">머메이드 최고 지도 레벨</label>
              <div className="grid grid-cols-4 gap-1.5">
                {[
                  { level: 0, label: '불가' },
                  { level: 1, label: '1레벨' },
                  { level: 2, label: '2레벨' },
                  { level: 3, label: '3레벨 (강사)' },
                ].map((item) => (
                  <button
                    key={item.level}
                    type="button"
                    onClick={() => setCurrentInstructor({ ...currentInstructor, max_mermaid_level: item.level })}
                    className={`py-2 px-1 rounded-xl text-[11px] sm:text-xs font-bold border transition cursor-pointer ${
                      currentInstructor.max_mermaid_level === item.level
                        ? 'bg-cyan-600 border-cyan-400 text-white shadow'
                        : 'bg-slate-800 border-slate-700 text-slate-400'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-2">유스 프리다이빙 최고 레벨</label>
              <div className="grid grid-cols-4 gap-1.5">
                {[
                  { level: 0, label: '불가' },
                  { level: 1, label: '1레벨' },
                  { level: 2, label: '2레벨' },
                  { level: 3, label: '3레벨 (강사)' },
                ].map((item) => (
                  <button
                    key={item.level}
                    type="button"
                    onClick={() => setCurrentInstructor({ ...currentInstructor, max_youth_level: item.level })}
                    className={`py-2 px-1 rounded-xl text-[11px] sm:text-xs font-bold border transition cursor-pointer ${
                      currentInstructor.max_youth_level === item.level
                        ? 'bg-cyan-600 border-cyan-400 text-white shadow'
                        : 'bg-slate-800 border-slate-700 text-slate-400'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-2">수중레저안전요원 자격</label>
              <div className="grid grid-cols-4 gap-1.5">
                {[
                  { level: 0, label: '불가' },
                  { level: 1, label: '수중레저안전요원' },
                  { level: 2, label: '마스터 안전요원' },
                  { level: 3, label: '안전요원 강사' },
                ].map((item) => (
                  <button
                    key={item.level}
                    type="button"
                    onClick={() => setCurrentInstructor({ ...currentInstructor, safety_guard_level: item.level })}
                    className={`py-2 px-1 rounded-xl text-[11px] sm:text-xs font-bold border transition cursor-pointer ${
                      (currentInstructor.safety_guard_level ?? 0) === item.level
                        ? 'bg-cyan-600 border-cyan-400 text-white shadow'
                        : 'bg-slate-800 border-slate-700 text-slate-400'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-2">스쿠버다이빙 자격</label>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { level: 0, label: '불가' },
                  { level: 1, label: '오픈워터~마스터' },
                  { level: 2, label: '스쿠버 강사' },
                ].map((item) => (
                  <button
                    key={item.level}
                    type="button"
                    onClick={() => setCurrentInstructor({ ...currentInstructor, scuba_level: item.level })}
                    className={`py-2 px-1 rounded-xl text-[11px] sm:text-xs font-bold border transition cursor-pointer ${
                      (currentInstructor.scuba_level ?? 0) === item.level
                        ? 'bg-cyan-600 border-cyan-400 text-white shadow'
                        : 'bg-slate-800 border-slate-700 text-slate-400'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-2">응급처치 교육 (EFR 등)</label>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { level: 0, label: '불가' },
                  { level: 1, label: '일반 교육 가능' },
                  { level: 2, label: '응급처치 강사' },
                ].map((item) => (
                  <button
                    key={item.level}
                    type="button"
                    onClick={() => setCurrentInstructor({ ...currentInstructor, first_aid_level: item.level })}
                    className={`py-2 px-1 rounded-xl text-[11px] sm:text-xs font-bold border transition cursor-pointer ${
                      (currentInstructor.first_aid_level ?? 0) === item.level
                        ? 'bg-cyan-600 border-cyan-400 text-white shadow'
                        : 'bg-slate-800 border-slate-700 text-slate-400'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-2">수중 사진 교육</label>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { level: 0, label: '불가' },
                  { level: 1, label: '일반 교육 가능' },
                  { level: 2, label: '수중사진 강사' },
                ].map((item) => (
                  <button
                    key={item.level}
                    type="button"
                    onClick={() => setCurrentInstructor({ ...currentInstructor, underwater_photo_level: item.level })}
                    className={`py-2 px-1 rounded-xl text-[11px] sm:text-xs font-bold border transition cursor-pointer ${
                      (currentInstructor.underwater_photo_level ?? 0) === item.level
                        ? 'bg-cyan-600 border-cyan-400 text-white shadow'
                        : 'bg-slate-800 border-slate-700 text-slate-400'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-slate-200">📍 풀장, 요일 및 세부 시간대 설정</h3>
            
            <div>
              <p className="text-xs text-slate-400 mb-2">수업 가능 요일</p>
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
                    onClick={() => setCurrentInstructor({
                      ...currentInstructor,
                      [d.key]: !currentInstructor[d.key as keyof Instructor]
                    })}
                    className={`py-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
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

            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2.5">
              <label className="flex items-center space-x-2 text-xs font-bold text-white cursor-pointer">
                <input
                  type="checkbox"
                  checked={currentInstructor.can_passnine}
                  onChange={(e) => setCurrentInstructor({ ...currentInstructor, can_passnine: e.target.checked })}
                  className="accent-cyan-500 w-4 h-4"
                />
                <span>칠곡 패스나인 풀장 수업 가능</span>
              </label>
              {currentInstructor.can_passnine && (
                <div className="grid grid-cols-2 gap-2 pt-1">
                  {[
                    { key: 'passnine_t1', label: '1부 (09:00~11:00)' },
                    { key: 'passnine_t2', label: '2부 (13:00~15:00)' },
                    { key: 'passnine_t3', label: '3부 (15:30~17:30)' },
                    { key: 'passnine_t4', label: '4부 (19:00~21:00)' },
                  ].map((t) => (
                    <label key={t.key} className={`flex items-center space-x-2 text-xs p-2.5 rounded-lg border cursor-pointer ${currentInstructor[t.key as keyof Instructor] ? 'bg-cyan-950/60 border-cyan-500 text-cyan-200' : 'bg-slate-900 border-slate-800 text-slate-400'}`}>
                      <input
                        type="checkbox"
                        checked={Boolean(currentInstructor[t.key as keyof Instructor])}
                        onChange={(e) => setCurrentInstructor({ ...currentInstructor, [t.key]: e.target.checked })}
                        className="accent-cyan-500 w-4 h-4"
                      />
                      <span>{t.label}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2.5">
              <label className="flex items-center space-x-2 text-xs font-bold text-white cursor-pointer">
                <input
                  type="checkbox"
                  checked={currentInstructor.can_miryang}
                  onChange={(e) => setCurrentInstructor({ ...currentInstructor, can_miryang: e.target.checked })}
                  className="accent-cyan-500 w-4 h-4"
                />
                <span>밀양 아리랑 풀장 수업 가능</span>
              </label>
              {currentInstructor.can_miryang && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  {[
                    { key: 'miryang_t0', label: '조조부 (06:00~09:00)' },
                    { key: 'miryang_t1', label: '오전 1부 (09:00~11:00)' },
                    { key: 'miryang_t2', label: '오전 2부 (11:00~13:00)' },
                    { key: 'miryang_t3', label: '오후 1부 (13:00~15:00)' },
                    { key: 'miryang_t4', label: '오후 2부 (15:00~17:00)' },
                    { key: 'miryang_t5', label: '저녁 1부 (17:00~19:00)' },
                    { key: 'miryang_t6', label: '저녁 2부 (19:00~21:00)' },
                  ].map((t) => (
                    <label key={t.key} className={`flex items-center space-x-2 text-xs p-2.5 rounded-lg border cursor-pointer ${currentInstructor[t.key as keyof Instructor] ? 'bg-cyan-950/60 border-cyan-500 text-cyan-200' : 'bg-slate-900 border-slate-800 text-slate-400'}`}>
                      <input
                        type="checkbox"
                        checked={Boolean(currentInstructor[t.key as keyof Instructor])}
                        onChange={(e) => setCurrentInstructor({ ...currentInstructor, [t.key]: e.target.checked })}
                        className="accent-cyan-500 w-4 h-4"
                      />
                      <span>{t.label}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>

          <button
            onClick={handleUpdateProfile}
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl text-sm font-extrabold text-white hover:from-cyan-400 hover:to-blue-500 transition shadow-lg cursor-pointer"
          >
            {loading ? '💾 저장 중...' : '💾 프로필 및 조건 변경사항 저장하기'}
          </button>
        </div>
      )}

    </div>
  );
}
