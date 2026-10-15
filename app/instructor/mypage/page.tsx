'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function InstructorPortal() {
  const [view, setView] = useState<'login' | 'signup' | 'dashboard' | 'profile_setup'>('login');
  
  // 로그인 입력값
  const [loginId, setLoginId] = useState('');
  const [loginPw, setLoginPw] = useState('');

  // 회원가입 입력값
  const [signupName, setSignupName] = useState('');
  const [signupId, setSignupId] = useState('');
  const [signupPw, setSignupPw] = useState('');
  const [signupPhone, setSignupPhone] = useState('');

  // 로그인된 강사 정보 및 매칭 고객 리스트
  const [currentInstructor, setCurrentInstructor] = useState<any>(null);
  const [customers, setCustomers] = useState<any[]>([]);
  const [statPeriod, setStatPeriod] = useState<'1d' | '1w' | '1m' | '6m' | '1y'>('1m');

  // 프로필 설정 상태값 (복수 선택 버튼)
  const [profileImg, setProfileImg] = useState('');
  const [bio, setBio] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedLevels, setSelectedLevels] = useState<{ [key: string]: boolean }>({});
  const [selectedPools, setSelectedPools] = useState<{ [key: string]: boolean }>({});
  const [selectedDays, setSelectedDays] = useState<{ [key: string]: boolean }>({});
  const [selectedTimes, setSelectedTimes] = useState<{ [key: string]: boolean }>({});

  // 1. 강사 로그인 처리
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
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
    loadInstructorProfile(data);

    // 최초 프로필 설정 여부 체크 (사진이나 소개가 비어있으면 프로필 설정 화면으로)
    if (!data.profile_image) {
      setView('profile_setup');
    } else {
      setView('dashboard');
      fetchMyCustomers(data.name);
    }
  };

  // 2. 강사 회원가입 처리 (유효성 검증 포함)
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    // 아이디 유효성: 영문 또는 영문+숫자만 가능
    const idRegex = /^[A-Za-z0-9]+$/;
    if (!idRegex.test(signupId)) {
      alert('아이디는 영문 또는 영문+숫자 조합만 가능합니다.');
      return;
    }

    // 비밀번호 유효성: 영문, 숫자, 특수문자 조합 가능 / 8~13자리
    const pwRegex = /^[A-Za-z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]{8,13}$/;
    if (!pwRegex.test(signupPw)) {
      alert('비밀번호는 8자리~13자리만 가능하며 영문, 숫자, 특수문자 조합이 가능합니다.');
      return;
    }

    const { error } = await supabase.from('instructors').insert([
      {
        name: signupName,
        username: signupId,
        password: signupPw,
        phone: signupPhone,
        is_approved: false, // 승인 대기
      }
    ]);

    if (error) {
      alert('회원가입 실패 (이미 존재하는 아이디일 수 있습니다): ' + error.message);
    } else {
      alert('✅ 회원가입 신청이 완료되었습니다!\n관리자 승인 후 로그인이 가능합니다.');
      setView('login');
    }
  };

  // 내 매칭 고객 리스트 조회
  const fetchMyCustomers = async (instructorName: string) => {
    const { data } = await supabase
      .from('customers')
      .select('*')
      .eq('matched_instructor', instructorName)
      .order('created_at', { ascending: false });
    if (data) setCustomers(data);
  };

  const loadInstructorProfile = (ins: any) => {
    setProfileImg(ins.profile_image || '');
    setBio(ins.bio || '');
    setPhone(ins.phone || '');
    // JSON 데이터 로드 또는 기본값
  };

  // 파일 업로드 (5MB 이하 및 사이즈 안내)
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('❌ 파일 용량이 5MB를 초과했습니다! 5MB 이하의 적당한 사이즈의 사진을 첨부해 주세요.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const result = uploadEvent.target?.result as string;
      setProfileImg(result);
    };
    reader.readAsDataURL(file);
  };

  // 프로필 설정 저장
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileImg) {
      alert('최초 프로필 설정 시 자신의 프로필 이미지는 필수입니다.');
      return;
    }

    const { error } = await supabase
      .from('instructors')
      .update({
        profile_image: profileImg,
        bio,
        phone,
      })
      .eq('id', currentInstructor.id);

    if (error) {
      alert('프로필 저장 오류: ' + error.message);
    } else {
      alert('✅ 프로필 설정이 완료되었습니다!');
      setView('dashboard');
      fetchMyCustomers(currentInstructor.name);
    }
  };

  // 기간별 필터링
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

  const myFilteredCustomers = customers.filter(c => filterByPeriod(c.created_at));

  // --- 뷰 1: 로그인 화면 ---
  if (view === 'login') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
        <div className="bg-white border border-slate-200 p-8 rounded-3xl shadow-xl max-w-md w-full text-center space-y-6">
          <div>
            <span className="text-xs font-bold px-3 py-1 bg-cyan-100 text-cyan-800 rounded-full">BLUE PEACE INSTRUCTOR PORTAL</span>
            <h1 className="text-2xl font-black text-slate-900 mt-3">🌊 소속 강사 로그인</h1>
          </div>
          <form onSubmit={handleLogin} className="space-y-4 text-left">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">아이디</label>
              <input
                type="text"
                value={loginId}
                onChange={(e) => setLoginId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">비밀번호</label>
              <input
                type="password"
                value={loginPw}
                onChange={(e) => setLoginPw(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none"
                required
              />
            </div>
            <button type="submit" className="w-full py-3.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl text-sm transition">
              로그인하기
            </button>
          </form>
          <div className="flex justify-between items-center text-xs pt-2">
            <a href="/" className="text-slate-400 hover:underline">← 메인으로</a>
            <button onClick={() => setView('signup')} className="text-cyan-600 font-bold hover:underline">
              소속강사 회원가입하기 →
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- 뷰 2: 회원가입 화면 ---
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
              <label className="block font-semibold text-slate-600 mb-1">아이디 (영문 또는 영문+숫자)</label>
              <input type="text" value={signupId} onChange={(e) => setSignupId(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5" required />
            </div>
            <div>
              <label className="block font-semibold text-slate-600 mb-1">비밀번호 (8~13자리, 영문/숫자/특수문자)</label>
              <input type="password" value={signupPw} onChange={(e) => setSignupPw(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5" required />
            </div>
            <div>
              <label className="block font-semibold text-slate-600 mb-1">연락처</label>
              <input type="text" value={signupPhone} onChange={(e) => setSignupPhone(e.target.value)} placeholder="010-0000-0000" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5" required />
            </div>
            <button type="submit" className="w-full py-3.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl text-xs transition">
              회원가입 신청
            </button>
          </form>
          <button onClick={() => setView('login')} className="text-xs text-slate-400 hover:underline">
            ← 로그인 화면으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  // --- 뷰 3: 최초 프로필 설정 화면 ---
  if (view === 'profile_setup') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
        <div className="bg-white border border-slate-200 p-8 rounded-3xl shadow-xl max-w-lg w-full space-y-6">
          <div className="text-center">
            <span className="text-xs font-bold px-3 py-1 bg-cyan-100 text-cyan-800 rounded-full">FIRST PROFILE SETUP</span>
            <h1 className="text-xl font-black text-slate-900 mt-2">환영합니다! 프로필을 설정해 주세요</h1>
            <p className="text-xs text-slate-500 mt-1">최초 로그인 시 프로필 사진 및 교육 가능 옵션을 설정해야 이용 가능합니다.</p>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-5 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">프로필 사진 첨부 (필수)</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs"
                required
              />
              <p className="text-[10px] text-amber-600 mt-1">
                ※ 사진 용량은 5MB 이하로, 지나치게 큰 사이즈의 사진은 업로드에 실패할 수 있으니 적당한 사이즈로 첨부해 주세요.
              </p>
              {profileImg && (
                <div className="mt-3 w-20 h-20 rounded-xl overflow-hidden border border-slate-200">
                  <img src={profileImg} alt="미리보기" className="w-full h-full object-cover" />
                </div>
              )}
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">강사 소개 및 인사말</label>
              <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3" placeholder="소개글을 작성해주세요" />
            </div>

            <button type="submit" className="w-full py-3.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl text-sm">
              설정 완료 및 대시보드 입장 🚀
            </button>
          </form>
        </div>
      </div>
    );
  }

  // --- 뷰 4: 강사 대시보드 화면 ---
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 p-4 sm:p-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* 상단 바 */}
        <div className="flex justify-between items-center bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200">
              {profileImg ? <img src={profileImg} alt="프로필" className="w-full h-full object-cover" /> : null}
            </div>
            <div>
              <h1 className="text-lg font-black text-slate-900"><span className="text-cyan-600">{currentInstructor?.name}</span> 강사님 마이페이지</h1>
              <p className="text-xs text-slate-500">블루피스 소속 강사 포털</p>
            </div>
          </div>
          <button onClick={() => setView('login')} className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl">
            로그아웃
          </button>
        </div>

        {/* 통계 및 필터 */}
        <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-base font-bold text-slate-900">📊 나에게 매칭된 고객 통계 ({myFilteredCustomers.length}건)</h2>
            <div className="flex gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold">
              {[
                { key: '1d', label: '1일' },
                { key: '1w', label: '1주일' },
                { key: '1m', label: '1개월' },
                { key: '6m', label: '6개월' },
                { key: '1y', label: '1년' },
              ].map(p => (
                <button
                  key={p.key}
                  onClick={() => setStatPeriod(p.key as any)}
                  className={`px-3 py-1.5 rounded-lg transition ${statPeriod === p.key ? 'bg-white text-cyan-700 shadow-xs' : 'text-slate-500'}`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3 pt-2">
            {myFilteredCustomers.map(cus => (
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
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
