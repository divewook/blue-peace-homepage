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
  phone: string | null; // 개인 연락처 추가
  bio: string | null;
  
  // 지도 가능 자격 및 레벨 (0: 불가 또는 체험만, 1~4: 가능 레벨)
  max_freediving_level: number;
  max_mermaid_level: number;
  max_youth_level: number;
  can_safety_guard: boolean;
  can_scuba: boolean;
  can_special: boolean;

  // 풀장 및 요일
  can_passnine: boolean;
  can_miryang: boolean;
  available_mon: boolean;
  available_tue: boolean;
  available_wed: boolean;
  available_thu: boolean;
  available_fri: boolean;
  available_sat: boolean;
  available_sun: boolean;

  // 패스나인 시간대 (교육생 페이지 연동)
  passnine_t1: boolean;
  passnine_t2: boolean;
  passnine_t3: boolean;
  passnine_t4: boolean;

  // 밀양 시간대 (교육생 페이지 연동)
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
  
  const [loginId, setLoginId] = useState('');
  const [loginPw, setLoginPw] = useState('');
  
  const [signupName, setSignupName] = useState('');
  const [signupId, setSignupId] = useState('');
  const [signupPw, setSignupPw] = useState('');

  const [currentInstructor, setCurrentInstructor] = useState<Instructor | null>(null);
  const [allInstructors, setAllInstructors] = useState<Instructor[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const fetchInstructors = async () => {
    const { data, error } = await supabase.from('instructors').select('*');
    if (!error && data) {
      setAllInstructors(data);
    }
  };

  useEffect(() => {
    fetchInstructors();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setNotice(null);

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
        is_approved: false,
      },
    ]);
    setLoading(false);

    if (error) {
      setNotice(`⚠️ 회원가입 실패: ${error.message}`);
    } else {
      setNotice('🎉 회원가입 신청이 완료되었습니다! 관리자 승인 후 로그인해 주세요.');
      setViewMode('login');
    }
  };

  // 이미지 파일 업로드 핸들러 (모바일 카메라/갤러리 지원)
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !currentInstructor) return;

    const file = files[0];
    const fileExt = file.name.split('.').pop();
    const fileName = `${currentInstructor.id}_${Math.random()}.${fileExt}`;
    const filePath = `instructor_profiles/${fileName}`;

    setUploadingImage(true);
    const { error: uploadError } = await supabase.storage.from('images').upload(filePath, file);

    if (uploadError) {
      // 버킷이 없을 경우 대비 안내 및 로컬 대응
      setNotice('⚠️ 이미지 업로드 실패 (Supabase Storage "images" 버킷을 확인해주세요)');
      setUploadingImage(false);
      return;
    }

    const { data: publicUrlData } = supabase.storage.from('images').getPublicUrl(filePath);
    const publicUrl = publicUrlData.publicUrl;

    setCurrentInstructor({ ...currentInstructor, profile_image: publicUrl });
    setUploadingImage(false);
    setNotice('📸 프로필 사진이 업로드되었습니다!');
  };

  const handleUpdateProfile = async () => {
    if (!currentInstructor) return;
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
    }
  };

  const handleApproveInstructor = async (id: string, status: boolean) => {
    await supabase.from('instructors').update({ is_approved: status }).eq('id', id);
    fetchInstructors();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 max-w-3xl mx-auto font-sans pb-20">
      
      {/* 헤더 */}
      <header className="text-center mb-6 pt-4">
        <span className="text-[11px] font-semibold px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
          BLUE PEACE INSTRUCTOR PORTAL
        </span>
        <h1 className="text-xl sm:text-2xl font-extrabold mt-3 text-white">
          🔐 강사 마이페이지 & 관리자 대시보드
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
          <h2 className="text-lg font-bold mb-4 text-cyan-400 text-center">강사 / 관리자 로그인</h2>
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
              className="text-xs text-slate-400 hover:text-cyan-400 underline"
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
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 rounded-xl text-white font-bold transition shadow-md cursor-pointer"
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

      {/* 3. 관리자 대시보드 */}
      {viewMode === 'admin' && (
        <div className="space-y-5">
          <div className="flex justify-between items-center bg-slate-900 p-4 rounded-2xl border border-cyan-500/40">
            <div>
              <h2 className="text-base font-bold text-cyan-400">👑 관리자 대시보드</h2>
              <p className="text-[11px] text-slate-400">강사 가입 승인 및 관리</p>
            </div>
            <button
              onClick={() => setViewMode('login')}
              className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-bold rounded-xl border border-slate-700"
            >
              로그아웃
            </button>
          </div>

          <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800">
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
                            className="px-2.5 py-1 bg-red-900/60 hover:bg-red-900 text-red-200 rounded-lg text-xs"
                          >
                            취소
                          </button>
                        ) : (
                          <button
                            onClick={() => handleApproveInstructor(ins.id, true)}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold"
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
        </div>
      )}

      {/* 4. 소속 강사 대시보드 (마이페이지 & 조건 설정) */}
      {viewMode === 'dashboard' && currentInstructor && (
        <div className="space-y-5">
          <div className="flex justify-between items-center bg-slate-900 p-4 rounded-2xl border border-cyan-500/40">
            <div>
              <h2 className="text-base font-bold text-cyan-400">👋 환영합니다, {currentInstructor.name} 강사님!</h2>
              <p className="text-[11px] text-slate-400">모바일 환경에 최적화된 매칭 조건 설정</p>
            </div>
            <button
              onClick={() => { setCurrentInstructor(null); setViewMode('login'); }}
              className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-bold rounded-xl border border-slate-700"
            >
              로그아웃
            </button>
          </div>

          {/* 1. 기본 프로필 및 파일 업로드 */}
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
                <label className="block text-xs text-slate-400">프로필 사진 업로드 (모바일 갤러리/카메라 지원)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="w-full text-xs text-slate-400 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-cyan-600 file:text-white hover:file:bg-cyan-500 cursor-pointer"
                />
                {uploadingImage && <p className="text-[11px] text-cyan-400 animate-pulse">사진 업로드 중...</p>}
              </div>
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">개인 연락처 (전화번호)</label>
              <input
                type="text"
                value={currentInstructor.phone || ''}
                onChange={(e) => setCurrentInstructor({ ...currentInstructor, phone: e.target.value })}
                placeholder="010-0000-0000"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs text-slate-400">강사 소개글 (고객 노출용)</label>
                <span className={`text-[11px] ${(currentInstructor.bio || '').length > 300 ? 'text-red-400 font-bold' : 'text-slate-500'}`}>
                  {(currentInstructor.bio || '').length} / 300자
                </span>
              </div>
              <textarea
                rows={3}
                maxLength={300}
                value={currentInstructor.bio || ''}
                onChange={(e) => setCurrentInstructor({ ...currentInstructor, bio: e.target.value })}
                placeholder="수강생들에게 전할 소개 및 인사말을 적어주세요 (최대 300자)"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          {/* 2. 지도 가능 레벨 및 과정 설정 (클릭형 버튼 UI) */}
          <div className="bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-slate-200">🎯 지도 가능 레벨 및 자격 설정</h3>
            
            {/* 프리다이빙 레벨 선택 */}
            <div>
              <label className="block text-xs text-slate-400 mb-2">프리다이빙 최고 지도 레벨</label>
              <div className="grid grid-cols-5 gap-1.5">
                {[
                  { level: 0, label: '불가' },
                  { level: 1, label: '1레벨' },
                  { level: 2, label: '2레벨' },
                  { level: 3, label: '3레벨' },
                  { level: 4, label: '4레벨/강사' },
                ].map((item) => (
                  <button
                    key={item.level}
                    type="button"
                    onClick={() => setCurrentInstructor({ ...currentInstructor, max_freediving_level: item.level })}
                    className={`py-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
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

            {/* 머메이드 레벨 선택 */}
            <div>
              <label className="block text-xs text-slate-400 mb-2">머메이드 최고 지도 레벨</label>
              <div className="grid grid-cols-4 gap-1.5">
                {[
                  { level: 0, label: '불가' },
                  { level: 1, label: '1레벨' },
                  { level: 2, label: '2레벨' },
                  { level: 3, label: '3레벨' },
                ].map((item) => (
                  <button
                    key={item.level}
                    type="button"
                    onClick={() => setCurrentInstructor({ ...currentInstructor, max_mermaid_level: item.level })}
                    className={`py-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
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

            {/* 유스 프리다이빙 레벨 선택 */}
            <div>
              <label className="block text-xs text-slate-400 mb-2">유스 프리다이빙 최고 레벨</label>
              <div className="grid grid-cols-4 gap-1.5">
                {[
                  { level: 0, label: '불가' },
                  { level: 1, label: '1레벨' },
                  { level: 2, label: '2레벨' },
                  { level: 3, label: '3레벨' },
                ].map((item) => (
                  <button
                    key={item.level}
                    type="button"
                    onClick={() => setCurrentInstructor({ ...currentInstructor, max_youth_level: item.level })}
                    className={`py-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
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

            {/* 기타 자격 여부 */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2">
              <label className={`flex items-center space-x-2 text-xs p-3 rounded-xl border cursor-pointer transition ${currentInstructor.can_safety_guard ? 'bg-cyan-950/40 border-cyan-500 text-cyan-200' : 'bg-slate-800/60 border-slate-700 text-slate-400'}`}>
                <input
                  type="checkbox"
                  checked={currentInstructor.can_safety_guard}
                  onChange={(e) => setCurrentInstructor({ ...currentInstructor, can_safety_guard: e.target.checked })}
                  className="accent-cyan-500 w-4 h-4"
                />
                <span>수중레저안전요원 지도 가능</span>
              </label>
              <label className={`flex items-center space-x-2 text-xs p-3 rounded-xl border cursor-pointer transition ${currentInstructor.can_scuba ? 'bg-cyan-950/40 border-cyan-500 text-cyan-200' : 'bg-slate-800/60 border-slate-700 text-slate-400'}`}>
                <input
                  type="checkbox"
                  checked={currentInstructor.can_scuba}
                  onChange={(e) => setCurrentInstructor({ ...currentInstructor, can_scuba: e.target.checked })}
                  className="accent-cyan-500 w-4 h-4"
                />
                <span>스쿠버다이빙 지도 가능</span>
              </label>
              <label className={`flex items-center space-x-2 text-xs p-3 rounded-xl border cursor-pointer transition ${currentInstructor.can_special ? 'bg-cyan-950/40 border-cyan-500 text-cyan-200' : 'bg-slate-800/60 border-slate-700 text-slate-400'}`}>
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

          {/* 3. 가능 풀장 및 요일 / 시간대 연동 설정 */}
          <div className="bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-slate-200">📍 풀장, 요일 및 세부 시간대 설정</h3>
            
            {/* 요일 선택 */}
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

            {/* 패스나인 풀장 및 시간대 */}
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
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                  {[
                    { key: 'passnine_t1', label: 'T1 (09:00~11:00)' },
                    { key: 'passnine_t2', label: 'T2 (13:00~15:00)' },
                    { key: 'passnine_t3', label: 'T3 (15:30~17:30)' },
                    { key: 'passnine_t4', label: 'T4 (19:00~21:00)' },
                  ].map((t) => (
                    <label key={t.key} className={`flex items-center space-x-2 text-[11px] p-2 rounded-lg border cursor-pointer ${currentInstructor[t.key as keyof Instructor] ? 'bg-cyan-950/60 border-cyan-500 text-cyan-200' : 'bg-slate-900 border-slate-800 text-slate-400'}`}>
                      <input
                        type="checkbox"
                        checked={Boolean(currentInstructor[t.key as keyof Instructor])}
                        onChange={(e) => setCurrentInstructor({ ...currentInstructor, [t.key]: e.target.checked })}
                        className="accent-cyan-500 w-3.5 h-3.5"
                      />
                      <span>{t.label}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* 밀양 아리랑 풀장 및 시간대 */}
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
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                  {[
                    { key: 'miryang_t0', label: 'T0 (06:00~09:00)' },
                    { key: 'miryang_t1', label: 'T1 (09:00~11:00)' },
                    { key: 'miryang_t2', label: 'T2 (11:00~13:00)' },
                    { key: 'miryang_t3', label: 'T3 (13:00~15:00)' },
                    { key: 'miryang_t4', label: 'T4 (15:00~17:00)' },
                    { key: 'miryang_t5', label: 'T5 (17:00~19:00)' },
                    { key: 'miryang_t6', label: 'T6 (19:00~21:00)' },
                  ].map((t) => (
                    <label key={t.key} className={`flex items-center space-x-2 text-[11px] p-2 rounded-lg border cursor-pointer ${currentInstructor[t.key as keyof Instructor] ? 'bg-cyan-950/60 border-cyan-500 text-cyan-200' : 'bg-slate-900 border-slate-800 text-slate-400'}`}>
                      <input
                        type="checkbox"
                        checked={Boolean(currentInstructor[t.key as keyof Instructor])}
                        onChange={(e) => setCurrentInstructor({ ...currentInstructor, [t.key]: e.target.checked })}
                        className="accent-cyan-500 w-3.5 h-3.5"
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
            {loading ? '💾 저장 중...' : '💾 내 프로필 및 조건 변경사항 저장하기'}
          </button>
        </div>
      )}

    </div>
  );
}
