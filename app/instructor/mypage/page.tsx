'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const courseLevelMap: { [key: string]: string[] } = {
  '프리다이빙': ['교육 불가', '체험 과정', '1레벨 (프리다이버)', '2레벨 (오픈워터)', '3레벨 (어드밴스드)', '4레벨 (마스터)', '강사 과정'],
  '머메이드 다이빙': ['교육 불가', '체험 과정', '1레벨 (베이직 머메이드)', '2레벨 (머메이드)', '3레벨 (오션 머메이드)', '머메이드 강사 과정'],
  '유스 프리다이빙': ['교육 불가', '체험 과정', '1레벨 (돌핀)', '2레벨 (오르카)', '3레벨 (샤크)', '유스 강사 과정'],
  '수중레저안전요원': ['교육 불가', '수중레저안전요원', '마스터 안전요원', '안전요원 강사 과정'],
  '스쿠버다이빙': ['교육 불가', '체험 과정', '오픈워터', '어드벤처', '어드밴스드', '오픈워터+어드밴스드 패키지'],
  '스페셜 교육': ['교육 불가', '응급처치 및 CPR 교육', '응급처치 CPR 강사 과정', '수중 사진 촬영 교육'],
};

export default function InstructorPortal() {
  const [view, setView] = useState<'login' | 'signup' | 'instructor_dashboard' | 'admin_dashboard' | 'profile_setup'>('login');
  
  const [loginId, setLoginId] = useState('');
  const [loginPw, setLoginPw] = useState('');

  const [signupName, setSignupName] = useState('');
  const [signupId, setSignupId] = useState('');
  const [signupPw, setSignupPw] = useState('');
  const [signupPhone, setSignupPhone] = useState('');

  const [currentInstructor, setCurrentInstructor] = useState<any>(null);
  const [customers, setCustomers] = useState<any[]>([]);
  const [allInstructors, setAllInstructors] = useState<any[]>([]);
  const [allCustomers, setAllCustomers] = useState<any[]>([]);
  const [statPeriod, setStatPeriod] = useState<'1d' | '1w' | '1m' | '6m' | '1y'>('1m');

  // 프로필 설정 상태값
  const [profileImg, setProfileImg] = useState('');
  const [bio, setBio] = useState('');
  const [maxLevels, setMaxLevels] = useState<{ [key: string]: string }>({
    '프리다이빙': '교육 불가',
    '머메이드 다이빙': '교육 불가',
    '유스 프리다이빙': '교육 불가',
    '수중레저안전요원': '교육 불가',
    '스쿠버다이빙': '교육 불가',
    '스페셜 교육': '교육 불가',
  });
  const [selectedPools, setSelectedPools] = useState<{ [key: string]: boolean }>({});
  const [selectedTimes, setSelectedTimes] = useState<{ [key: string]: boolean }>({});
  const [selectedDays, setSelectedDays] = useState<{ [key: string]: boolean }>({});

  const handlePhoneInput = (val: string, setter: (v: string) => void) => {
    const raw = val.replace(/[^0-9]/g, '').slice(0, 11);
    let formatted = raw;
    if (raw.length > 3 && raw.length <= 7) {
      formatted = `${raw.slice(0, 3)}-${raw.slice(3)}`;
    } else if (raw.length > 7) {
      formatted = `${raw.slice(0, 3)}-${raw.slice(3, 7)}-${raw.slice(7)}`;
    }
    setter(formatted);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (loginId.trim() === 'admin' && loginPw.trim() === 'ksu0393!') {
      setView('admin_dashboard');
      fetchAdminData();
      return;
    }

    const { data, error } = await supabase
      .from('instructors')
      .select('*')
      .eq('username', loginId.trim())
      .eq('password', loginPw.trim())
      .single();

    if (error || !data) {
      alert('아이디 또는 비밀번호가 일치하지 않습니다.');
      return;
    }

    if (!data.is_approved) {
      alert('⚠️ 관리자의 승인 대기 중입니다. 관리자 승인 후에 로그인이 가능합니다!');
      return;
    }

    setCurrentInstructor(data);
    setProfileImg(data.profile_image || '');
    setBio(data.bio || '');
    if (data.max_levels) setMaxLevels(data.max_levels);
    if (data.selected_pools) setSelectedPools(data.selected_pools);
    if (data.selected_times) setSelectedTimes(data.selected_times);
    if (data.selected_days) setSelectedDays(data.selected_days);

    if (!data.profile_image) {
      setView('profile_setup');
    } else {
      setView('instructor_dashboard');
      fetchMyCustomers(data.name);
    }
  };

  const handleLogout = () => {
    setLoginId('');
    setLoginPw('');
    setCurrentInstructor(null);
    setView('login');
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    const idRegex = /^[A-Za-z0-9]+$/;
    if (!idRegex.test(signupId)) {
      alert('아이디는 영문 또는 영문+숫자 조합만 가능합니다.');
      return;
    }

    const pwRegex = /^[A-Za-z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]{8,13}$/;
    if (!pwRegex.test(signupPw)) {
      alert('비밀번호는 8~13자리만 가능하며 영문, 숫자, 특수문자 조합이 가능합니다.');
      return;
    }

    const { error } = await supabase.from('instructors').insert([
      { name: signupName, username: signupId, password: signupPw, phone: signupPhone, is_approved: false }
    ]);

    if (error) {
      alert('회원가입 실패: ' + error.message);
    } else {
      alert('✅ 회원가입 신청 완료! 관리자 승인 후 로그인 가능합니다.');
      setView('login');
    }
  };

  const fetchAdminData = async () => {
    const { data: insData } = await supabase.from('instructors').select('*').order('created_at', { ascending: false });
    if (insData) setAllInstructors(insData);

    const { data: cusData } = await supabase.from('customers').select('*').order('created_at', { ascending: false });
    if (cusData) setAllCustomers(cusData);
  };

  const toggleApproval = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase.from('instructors').update({ is_approved: !currentStatus }).eq('id', id);
    if (!error) fetchAdminData();
  };

  const handleDeleteInstructor = async (id: string) => {
    if (confirm('정말 이 강사 계정을 데이터베이스에서 완전히 삭제하시겠습니까?')) {
      const { error } = await supabase.from('instructors').delete().eq('id', id);
      if (error) {
        alert('삭제 실패: ' + error.message);
      } else {
        alert('성공적으로 삭제되었습니다.');
        fetchAdminData();
      }
    }
  };

  const fetchMyCustomers = async (instructorName: string) => {
    const { data } = await supabase
      .from('customers')
      .select('*')
      .eq('matched_instructor', instructorName)
      .order('created_at', { ascending: false });
    if (data) setCustomers(data);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('❌ 파일 용량이 5MB를 초과했습니다!');
      return;
    }

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      setProfileImg(uploadEvent.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  // 프로필 설정 저장 (수정하기 포함)
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileImg) {
      alert('프로필 사진은 필수입니다.');
      return;
    }

    const updateData = {
      profile_image: profileImg,
      bio,
      max_levels: maxLevels,
      selected_pools: selectedPools,
      selected_times: selectedTimes,
      selected_days: selectedDays,
    };

    const { error } = await supabase
      .from('instructors')
      .update(updateData)
      .eq('id', currentInstructor.id);

    if (error) {
      alert('저장 오류: ' + error.message);
    } else {
      alert('✅ 프로필 및 수업 설정이 성공적으로 저장되었습니다!');
      setCurrentInstructor({ ...currentInstructor, ...updateData });
      setView('instructor_dashboard');
      fetchMyCustomers(currentInstructor.name);
    }
  };

  const filterByPeriod = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = (now.getTime() - date.getTime()) / (1000 * 3600 * 24);
    if (statPeriod === '1d') return diffDays <= 1;
    if (statPeriod === '1w') return diffDays <= 7;
    if (statPeriod === '1m') return diffDays <= 30;
    if (statPeriod === '6m') return diffDays <= 180;
    if (statPeriod === '1y') return diffDays <= 365;
    return true;
  };

  // --- [뷰 1] 로그인 화면 ---
  if (view === 'login') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
        <div className="bg-white border border-slate-200 p-8 rounded-3xl shadow-xl max-w-md w-full text-center space-y-6">
          <div>
            <span className="text-xs font-bold px-3 py-1 bg-cyan-100 text-cyan-800 rounded-full">BLUE PEACE PORTAL</span>
            <h1 className="text-2xl font-black text-slate-900 mt-3">🌊 통합 로그인</h1>
          </div>
          <form onSubmit={handleLogin} className="space-y-4 text-left">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">아이디</label>
              <input type="text" value={loginId} onChange={(e) => setLoginId(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none" required />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">비밀번호</label>
              <input type="password" value={loginPw} onChange={(e) => setLoginPw(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none" required />
            </div>
            <button type="submit" className="w-full py-3.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl text-sm transition cursor-pointer">
              로그인하기
            </button>
          </form>
          <div className="flex justify-between items-center text-xs pt-2">
            <a href="/" className="text-slate-400 hover:underline">← 메인으로</a>
            <button onClick={() => setView('signup')} className="text-cyan-600 font-bold hover:underline cursor-pointer">
              소속강사 회원가입 →
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- [뷰 2] 회원가입 화면 ---
  if (view === 'signup') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
        <div className="bg-white border border-slate-200 p-8 rounded-3xl shadow-xl max-w-md w-full text-center space-y-6">
          <h1 className="text-xl font-black text-slate-900">📝 소속 강사 회원가입</h1>
          <form onSubmit={handleSignup} className="space-y-4 text-left text-xs">
            <div>
              <label className="block font-semibold text-slate-600 mb-1">성함</label>
              <input type="text" value={signupName} onChange={(e) => setSignupName(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5" required />
            </div>
            <div>
              <label className="block font-semibold text-slate-600 mb-1">아이디 (영문, 숫자 조합)</label>
              <input type="text" value={signupId} onChange={(e) => setSignupId(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5" required />
            </div>
            <div>
              <label className="block font-semibold text-slate-600 mb-1">비밀번호 (8~13자리, 영문/숫자/특수문자)</label>
              <input type="password" value={signupPw} onChange={(e) => setSignupPw(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5" required />
            </div>
            <div>
              <label className="block font-semibold text-slate-600 mb-1">연락처 (자동 하이픈)</label>
              <input type="text" value={signupPhone} onChange={(e) => handlePhoneInput(e.target.value, setSignupPhone)} placeholder="010-0000-0000" maxLength={13} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5" required />
            </div>
            <button type="submit" className="w-full py-3.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl text-xs transition cursor-pointer">
              회원가입 신청
            </button>
          </form>
          <button onClick={() => setView('login')} className="text-xs text-slate-400 hover:underline cursor-pointer">
            ← 로그인 화면으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  // --- [뷰 3] 프로필 설정 및 수정 화면 ---
  if (view === 'profile_setup') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans py-10">
        <div className="bg-white border border-slate-200 p-8 rounded-3xl shadow-xl max-w-2xl w-full space-y-6">
          <div className="text-center">
            <span className="text-xs font-bold px-3 py-1 bg-cyan-100 text-cyan-800 rounded-full">PROFILE SETTING</span>
            <h1 className="text-xl font-black text-slate-900 mt-2">프로필 및 수업 설정</h1>
            <p className="text-xs text-slate-500 mt-1">수업 가능한 코스와 레벨, 풀장 및 시간대를 설정해 주세요.</p>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-6 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">프로필 사진 첨부 (필수)</label>
              <input type="file" accept="image/*" onChange={handleImageUpload} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2" />
              <p className="text-[10px] text-amber-600 mt-1">※ 5MB 이하의 적당한 사이즈 사진</p>
              {profileImg && (
                <div className="mt-2 w-20 h-20 rounded-xl overflow-hidden border border-slate-200">
                  <img src={profileImg} alt="미리보기" className="w-full h-full object-cover" />
                </div>
              )}
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block font-bold text-slate-700">강사 소개 및 인사말</label>
                <span className="text-[10px] text-slate-400">{bio.length} / 300자</span>
              </div>
              <textarea
                value={bio}
                onChange={(e) => { if (e.target.value.length <= 300) setBio(e.target.value); }}
                rows={3}
                maxLength={300}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3"
                placeholder="인사말 작성 (최대 300자)"
              />
              <p className="text-[10px] text-cyan-700 mt-1">※ 이 강사 소개란은 신규 교육생에게 노출됩니다.</p>
            </div>

            <div className="space-y-4 border-t border-slate-100 pt-4">
              <label className="block font-bold text-slate-900 text-sm">🏊‍♂️ 수업 가능 코스 및 최고 교육 가능 레벨 선택</label>
              {Object.entries(courseLevelMap).map(([courseName, levels]) => (
                <div key={courseName} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                  <p className="font-bold text-cyan-800">{courseName}</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                    {levels.map(lvl => {
                      const currentVal = maxLevels[courseName] || '교육 불가';
                      const isSelected = currentVal === lvl;
                      return (
                        <button
                          key={lvl}
                          type="button"
                          onClick={() => setMaxLevels({ ...maxLevels, [courseName]: lvl })}
                          className={`py-2.5 px-2 rounded-xl text-[11px] font-bold border transition cursor-pointer ${
                            isSelected ? 'bg-cyan-600 text-white border-cyan-500 shadow-xs' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {lvl}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-slate-100 pt-4 space-y-2">
              <label className="block font-bold text-slate-900 text-sm">📅 수업 가능 요일 선택 (복수 선택)</label>
              <div className="grid grid-cols-7 gap-1">
                {[
                  { key: 'mon', label: '월' },
                  { key: 'tue', label: '화' },
                  { key: 'wed', label: '수' },
                  { key: 'thu', label: '목' },
                  { key: 'fri', label: '금' },
                  { key: 'sat', label: '토' },
                  { key: 'sun', label: '일' },
                ].map(d => (
                  <button
                    key={d.key}
                    type="button"
                    onClick={() => setSelectedDays({ ...selectedDays, [d.key]: !selectedDays[d.key] })}
                    className={`py-2 rounded-xl font-bold border transition cursor-pointer ${
                      selectedDays[d.key] ? 'bg-cyan-600 text-white border-cyan-500' : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="border-t border-slate-100 pt-4 space-y-4">
              <label className="block font-bold text-slate-900 text-sm">🌊 수업 가능 풀장 및 시간대 선택</label>
              
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                <label className="flex items-center space-x-2 font-bold text-slate-900 cursor-pointer">
                  <input type="checkbox" checked={selectedPools['passnine'] || false} onChange={(e) => setSelectedPools({ ...selectedPools, passnine: e.target.checked })} className="accent-cyan-600 w-4 h-4" />
                  <span>칠곡 패스나인 풀장</span>
                </label>
                {selectedPools['passnine'] && (
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    {['1부 (09:00~11:30)', '2부 (12:30~15:00)', '3부 (16:00~18:30)', '4부 (19:30~22:00)'].map(t => (
                      <label key={t} className={`flex items-center space-x-2 p-2.5 rounded-xl border cursor-pointer ${selectedTimes[`passnine_${t}`] ? 'bg-cyan-50 border-cyan-500 font-bold text-cyan-900' : 'bg-white border-slate-200'}`}>
                        <input type="checkbox" checked={selectedTimes[`passnine_${t}`] || false} onChange={(e) => setSelectedTimes({ ...selectedTimes, [`passnine_${t}`]: e.target.checked })} className="accent-cyan-600" />
                        <span>{t}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                <label className="flex items-center space-x-2 font-bold text-slate-900 cursor-pointer">
                  <input type="checkbox" checked={selectedPools['miryang'] || false} onChange={(e) => setSelectedPools({ ...selectedPools, miryang: e.target.checked })} className="accent-cyan-600 w-4 h-4" />
                  <span>밀양 아리랑 풀장</span>
                </label>
                {selectedPools['miryang'] && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    {['오전부 (08:00~10:00) ※주말만', '1부 (10:00~12:00)', '2부 (12:00~14:00)', '3부 (14:00~16:00)', '4부 (16:00~18:00)', '5부 (18:00~20:00)', '6부 (20:00~22:00)'].map(t => (
                      <label key={t} className={`flex items-center space-x-2 p-2.5 rounded-xl border cursor-pointer ${selectedTimes[`miryang_${t}`] ? 'bg-cyan-50 border-cyan-500 font-bold text-cyan-900' : 'bg-white border-slate-200'}`}>
                        <input type="checkbox" checked={selectedTimes[`miryang_${t}`] || false} onChange={(e) => setSelectedTimes({ ...selectedTimes, [`miryang_${t}`]: e.target.checked })} className="accent-cyan-600" />
                        <span>{t}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-slate-100 p-4 rounded-2xl border border-slate-300 opacity-60">
                <span className="font-bold text-slate-500 line-through">대구 두류풀장 (현재 공사 중 - 선택 불가)</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button type="button" onClick={() => setView('instructor_dashboard')} className="py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl text-sm cursor-pointer">
                취소
              </button>
              <button type="submit" className="py-4 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-2xl text-sm cursor-pointer shadow-md">
                설정 저장하기 🚀
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // --- [뷰 4] 관리자 페이지 (Admin Dashboard) ---
  if (view === 'admin_dashboard') {
    const filteredAllCustomers = allCustomers.filter(c => filterByPeriod(c.created_at));
    const instructorStats = allInstructors.map(ins => {
      const count = filteredAllCustomers.filter(c => c.matched_instructor === ins.name).length;
      return { name: ins.name, count };
    });

    return (
      <div className="min-h-screen bg-slate-50 text-slate-800 p-4 sm:p-8 font-sans">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="flex justify-between items-center bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <div>
              <span className="text-xs font-bold px-3 py-1 bg-cyan-100 text-cyan-800 rounded-full">ADMIN PAGE</span>
              <h1 className="text-2xl font-black text-slate-900 mt-2">🛡️ 블루피스 관리자 대시보드</h1>
            </div>
            <button onClick={handleLogout} className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl cursor-pointer">
              로그아웃
            </button>
          </div>

          <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-slate-900">👥 소속 강사 계정 관리 및 승인</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400">
                    <th className="py-3">강사명</th>
                    <th className="py-3">아이디</th>
                    <th className="py-3">승인 상태</th>
                    <th className="py-3 text-right">관리</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {allInstructors.map(ins => (
                    <tr key={ins.id}>
                      <td className="py-3 font-bold text-slate-900">{ins.name}</td>
                      <td className="py-3 text-slate-600">{ins.username}</td>
                      <td className="py-3">
                        <span className={`px-2.5 py-1 rounded-full font-bold text-[10px] ${ins.is_approved ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                          {ins.is_approved ? '승인됨' : '승인 대기중'}
                        </span>
                      </td>
                      <td className="py-3 text-right space-x-2">
                        <button onClick={() => toggleApproval(ins.id, ins.is_approved)} className={`px-3 py-1.5 rounded-lg font-bold text-white cursor-pointer ${ins.is_approved ? 'bg-amber-600' : 'bg-cyan-600'}`}>
                          {ins.is_approved ? '승인 취소' : '강사 승인'}
                        </button>
                        <button onClick={() => handleDeleteInstructor(ins.id)} className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg font-bold cursor-pointer">
                          삭제
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-4">
              <h2 className="text-lg font-bold text-slate-900">📊 강사별 매칭 통계</h2>
              <div className="flex gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold">
                {[{ key: '1d', label: '1일' }, { key: '1w', label: '1주일' }, { key: '1m', label: '1개월' }, { key: '6m', label: '6개월' }, { key: '1y', label: '1년' }].map(p => (
                  <button key={p.key} onClick={() => setStatPeriod(p.key as any)} className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${statPeriod === p.key ? 'bg-white text-cyan-700 shadow-xs' : 'text-slate-500'}`}>
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {instructorStats.map(stat => (
                <div key={stat.name} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-center">
                  <p className="text-xs text-slate-500 font-bold">{stat.name} 강사</p>
                  <p className="text-2xl font-black text-cyan-600 mt-1">{stat.count}건</p>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-slate-100">
              <h3 className="text-base font-bold text-slate-900 mb-3">📋 전체 고객 매칭 세부 내역 ({filteredAllCustomers.length}건)</h3>
              <div className="space-y-3">
                {filteredAllCustomers.map(cus => (
                  <div key={cus.id} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">{cus.name} 님 ({cus.phone})</span>
                        <span className="text-[10px] bg-cyan-100 text-cyan-800 font-bold px-2 py-0.5 rounded">담당: {cus.matched_instructor}</span>
                      </div>
                      <p className="text-cyan-700 font-semibold mt-1">과정 및 레벨: {cus.course}</p>
                      <p className="text-slate-600 mt-0.5">희망 풀장 및 시간: {cus.pool}</p>
                    </div>
                    <span className="text-[11px] text-slate-400">{new Date(cus.created_at).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- [뷰 5] 강사 페이지 (Instructor Dashboard - 내 설정 및 통계/고객 리스트 확인) ---
  const myFilteredCustomers = customers.filter(c => filterByPeriod(c.created_at));

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 p-4 sm:p-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* 상단 프로필 요약 및 수정 버튼 */}
        <div className="flex justify-between items-center bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shadow-xs">
              {profileImg ? <img src={profileImg} alt="프로필" className="w-full h-full object-cover" /> : null}
            </div>
            <div>
              <span className="text-[10px] font-bold px-2.5 py-0.5 bg-cyan-100 text-cyan-800 rounded-full">INSTRUCTOR DASHBOARD</span>
              <h1 className="text-lg font-black text-slate-900 mt-1"><span className="text-cyan-600">{currentInstructor?.name}</span> 강사님 마이페이지</h1>
              <p className="text-xs text-slate-500 mt-0.5">{bio || '등록된 소개글이 없습니다.'}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setView('profile_setup')} className="px-4 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded-xl shadow-sm transition cursor-pointer">
              ⚙️ 내 프로필/수업 수정
            </button>
            <button onClick={handleLogout} className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer">
              로그아웃
            </button>
          </div>
        </div>

        {/* 내 설정 정보 요약 카드 */}
        <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">📋 내가 설정한 수업 가능 정보 요약</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
              <p className="font-bold text-cyan-800">🏊‍♂️ 교육 코스별 가능 레벨</p>
              <div className="space-y-1">
                {Object.entries(maxLevels || {}).map(([course, level]) => (
                  <p key={course} className="text-slate-700">
                    <span className="font-semibold text-slate-900">{course}:</span> <span className={level === '교육 불가' ? 'text-slate-400' : 'text-cyan-700 font-bold'}>{level}</span>
                  </p>
                ))}
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
              <div>
                <p className="font-bold text-cyan-800 mb-1">📅 수업 가능 요일</p>
                <div className="flex gap-1.5 flex-wrap">
                  {['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'].map(d => (
                    <span key={d} className={`px-2.5 py-1 rounded-lg text-[11px] font-bold ${selectedDays[d] ? 'bg-cyan-600 text-white' : 'bg-slate-200 text-slate-400'}`}>
                      {d.toUpperCase()}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <p className="font-bold text-cyan-800 mb-1">🌊 수업 가능 풀장 및 시간대</p>
                <div className="space-y-1 text-slate-700">
                  <p><span className="font-semibold">패스나인:</span> {selectedPools['passnine'] ? '선택함' : '선택 안 함'}</p>
                  <p><span className="font-semibold">밀양 아리랑:</span> {selectedPools['miryang'] ? '선택함' : '선택 안 함'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 나에게 매칭된 고객 통계 및 리스트 */}
        <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-slate-900">📊 나에게 매칭된 고객 통계 및 신청 내역 ({myFilteredCustomers.length}건)</h2>
            <div className="flex gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold">
              {[{ key: '1d', label: '1일' }, { key: '1w', label: '1주일' }, { key: '1m', label: '1개월' }, { key: '6m', label: '6개월' }, { key: '1y', label: '1년' }].map(p => (
                <button
                  key={p.key}
                  onClick={() => setStatPeriod(p.key as any)}
                  className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${statPeriod === p.key ? 'bg-white text-cyan-700 shadow-xs' : 'text-slate-500'}`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3 pt-2">
            {myFilteredCustomers.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">선택하신 기간 내 매칭된 수강생 내역이 없습니다.</p>
            ) : (
              myFilteredCustomers.map(cus => (
                <div key={cus.id} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs">
                  <div>
                    <p className="font-bold text-slate-900 text-sm">{cus.name} 님 ({cus.phone})</p>
                    <p className="text-cyan-700 font-semibold mt-1">과정 및 레벨: {cus.course}</p>
                    <p className="text-slate-600 mt-0.5">희망 풀장 및 시간: {cus.pool}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <a href={`tel:${cus.phone}`} className="px-3 py-1.5 bg-cyan-600 text-white rounded-lg font-bold">전화</a>
                    <a href={`sms:${cus.phone}`} className="px-3 py-1.5 bg-slate-100 text-cyan-700 border border-cyan-300 rounded-lg font-bold">문자</a>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
