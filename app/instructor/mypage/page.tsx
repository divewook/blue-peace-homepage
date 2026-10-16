'use client';

import React, { useState } from 'react';
import CustomerMatchCard from '../../../components/customer-match-card';
import ExpandableText from '../../../components/expandable-text';
import MarketingSummary from '../../../components/marketing-summary';
import Pass9AvailabilityModal from '../../../components/pass9-availability-modal';
import DeepstationAvailabilityModal from '../../../components/deepstation-availability-modal';
import ParadiveAvailabilityModal from '../../../components/paradive-availability-modal';

const poolTimeOptions = {
  passnine: [
    { key: 'passnine_t1', label: '1부 · 09:00–11:30' },
    { key: 'passnine_t2', label: '2부 · 12:30–15:00' },
    { key: 'passnine_t3', label: '3부 · 16:00–18:30' },
    { key: 'passnine_t4', label: '4부 · 19:30–22:00' },
  ],
  miryang: [
    { key: 'miryang_t0', label: '오전부 · 08:00–10:00 (주말)' },
    { key: 'miryang_t1', label: '1부 · 10:00–12:00' },
    { key: 'miryang_t2', label: '2부 · 12:00–14:00' },
    { key: 'miryang_t3', label: '3부 · 14:00–16:00' },
    { key: 'miryang_t4', label: '4부 · 16:00–18:00' },
    { key: 'miryang_t5', label: '5부 · 18:00–20:00' },
    { key: 'miryang_t6', label: '6부 · 20:00–22:00' },
  ],
};

const dayOptions = [
  { key: 'mon', label: '월' }, { key: 'tue', label: '화' }, { key: 'wed', label: '수' },
  { key: 'thu', label: '목' }, { key: 'fri', label: '금' }, { key: 'sat', label: '토' },
  { key: 'sun', label: '일' }, { key: 'holiday', label: '공휴일' },
];
const emptyPoolDays = () => Object.fromEntries(dayOptions.map(day => [day.key, false]));

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
  const [deletingInstructorId, setDeletingInstructorId] = useState<string | null>(null);
  const [statPeriod, setStatPeriod] = useState<'1d' | '1w' | '1m' | '6m' | '1y'>('1m');

  // 프로필 설정 상태값
  const [profileImg, setProfileImg] = useState('');
  const [isProcessingImage, setIsProcessingImage] = useState(false);
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
  const [poolDays, setPoolDays] = useState<Record<string, Record<string, boolean>>>({ passnine: emptyPoolDays(), miryang: emptyPoolDays() });
  const [selectedSpecialCourses, setSelectedSpecialCourses] = useState<string[]>([]);
  const [showPass9Availability, setShowPass9Availability] = useState(false);
  const [showDeepstationAvailability, setShowDeepstationAvailability] = useState(false);
  const [showParadiveAvailability, setShowParadiveAvailability] = useState(false);

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

    if (loginId.trim() === 'admin') {
      try {
        const response = await fetch('/api/admin/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: loginId.trim(), password: loginPw }),
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || '관리자 로그인에 실패했습니다.');
        setLoginPw('');
        setView('admin_dashboard');
        await fetchAdminData();
      } catch (error) {
        alert(error instanceof Error ? error.message : '관리자 로그인에 실패했습니다.');
      }
      return;
    }

    const loginResponse = await fetch('/api/instructor/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: loginId.trim(), password: loginPw }),
    }).catch(() => null);
    const loginResult = await loginResponse?.json().catch(() => ({}));
    if (!loginResponse?.ok || !loginResult?.instructor) {
      alert(loginResult?.error || '로그인에 실패했습니다. 다시 시도해 주세요.');
      return;
    }
    const data = loginResult.instructor;
    setLoginPw('');

    setCurrentInstructor(data);
    setProfileImg(data.profile_image || '');
    setBio(data.bio || '');
    const savedSpecialCourses = data.course_levels?.['스페셜 교육'];
    setSelectedSpecialCourses(Array.isArray(savedSpecialCourses)
      ? savedSpecialCourses.filter((value: unknown) => typeof value === 'string' && value !== '교육 불가')
      : typeof savedSpecialCourses === 'string' && savedSpecialCourses !== '교육 불가' ? [savedSpecialCourses] : []);
    setMaxLevels(Object.fromEntries(Object.entries(courseLevelMap).map(([course, levels]) => [
      course,
      (course !== '스페셜 교육' && typeof data.course_levels?.[course] === 'string' ? data.course_levels[course] : null) || (
        course === '프리다이빙' ? levels[data.max_freediving_level || 0] :
        course === '머메이드 다이빙' ? levels[data.max_mermaid_level || 0] :
        course === '유스 프리다이빙' ? levels[data.max_youth_level || 0] :
        '교육 불가'
      ) || '교육 불가',
    ])));
    setSelectedTimes(Object.fromEntries(
      Object.values(poolTimeOptions).flat().map(({ key }) => [key, !!data[key]])
    ));
    setSelectedPools({
      passnine: !!data.can_passnine,
      miryang: !!data.can_miryang,
    });
    setPoolDays(Object.fromEntries(['passnine', 'miryang'].map(pool => [pool,
      Object.fromEntries(dayOptions.map(day => [day.key, !!data[`${pool}_day_${day.key}`]]))
    ])));

    if (!data.profile_image) {
      setView('profile_setup');
    } else {
      setView('instructor_dashboard');
      fetchMyCustomers();
    }
  };

  const handleLogout = () => {
    if (view === 'admin_dashboard') {
      void fetch('/api/admin/session', { method: 'DELETE' });
    } else if (currentInstructor) {
      void fetch('/api/instructor/session', { method: 'DELETE' });
    }
    setLoginId('');
    setLoginPw('');
    setCurrentInstructor(null);
    setCustomers([]);
    setAllInstructors([]);
    setAllCustomers([]);
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

    const response = await fetch('/api/instructor/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: signupName, username: signupId, password: signupPw, phone: signupPhone }),
    }).catch(() => null);
    const result = await response?.json().catch(() => ({}));
    if (!response?.ok) {
      alert('회원가입 실패: ' + (result?.error || '잠시 후 다시 시도해 주세요.'));
    } else {
      alert('✅ 회원가입 신청 완료! 관리자 승인 후 로그인 가능합니다.');
      setView('login');
    }
  };

  const fetchAdminData = async () => {
    const response = await fetch('/api/admin/data', { cache: 'no-store' });
    const result = await response.json();
    if (!response.ok) {
      alert(result.error || '관리자 목록을 불러오지 못했습니다.');
      return;
    }
    setAllInstructors(result.instructors || []);
    setAllCustomers(result.customers || []);
  };

  const toggleApproval = async (id: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/admin/instructors/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_approved: !currentStatus }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || '승인 상태 변경에 실패했습니다.');
      setAllInstructors(previous => previous.map(ins => ins.id === id ? { ...ins, is_approved: !currentStatus } : ins));
    } catch (error) {
      alert(error instanceof Error ? error.message : '승인 상태 변경에 실패했습니다.');
    }
  };

  const handleDeleteInstructor = async (id: string) => {
    if (deletingInstructorId || !confirm('정말 이 강사 계정을 데이터베이스에서 완전히 삭제하시겠습니까?')) return;
    setDeletingInstructorId(id);
    try {
      const response = await fetch(`/api/admin/instructors/${encodeURIComponent(id)}`, { method: 'DELETE' });
      const result = await response.json();
      if (!response.ok || result.deletedId !== id) throw new Error(result.error || '계정 삭제를 확인하지 못했습니다.');
      setAllInstructors(previous => previous.filter(ins => ins.id !== id));
      alert('강사 계정이 데이터베이스에서 삭제되었습니다.');
    } catch (error) {
      alert('삭제 실패: ' + (error instanceof Error ? error.message : '알 수 없는 오류'));
    } finally {
      setDeletingInstructorId(null);
    }
  };

  const fetchMyCustomers = async () => {
    try {
      const response = await fetch('/api/instructor/customers', { cache: 'no-store' });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || '매칭 내역을 불러오지 못했습니다.');
      setCustomers(result.customers || []);
    } catch (error) {
      alert(error instanceof Error ? error.message : '매칭 내역을 불러오지 못했습니다.');
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';

    if (!file.type.startsWith('image/')) {
      alert('이미지 파일을 선택해 주세요.');
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      alert('사진 원본은 20MB 이하로 선택해 주세요.');
      return;
    }

    setIsProcessingImage(true);
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      try {
        const scale = Math.min(1, 1280 / Math.max(image.width, image.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.round(image.width * scale));
        canvas.height = Math.max(1, Math.round(image.height * scale));
        const context = canvas.getContext('2d');
        if (!context) throw new Error('사진을 처리할 수 없습니다.');
        context.fillStyle = '#ffffff';
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        setProfileImg(canvas.toDataURL('image/jpeg', 0.82));
      } catch {
        alert('사진을 처리하지 못했습니다. 다른 사진을 선택해 주세요.');
      } finally {
        URL.revokeObjectURL(objectUrl);
        setIsProcessingImage(false);
      }
    };
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      setIsProcessingImage(false);
      alert('이 사진 형식은 브라우저에서 열 수 없습니다. JPG 또는 PNG 사진을 선택해 주세요.');
    };
    image.src = objectUrl;
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isProcessingImage) return;
    if (!profileImg) {
      alert('프로필 사진은 필수입니다.');
      return;
    }
    const activePools = ['passnine', 'miryang'].filter(pool => selectedPools[pool]);
    if (!activePools.length) {
      alert('수업 가능한 풀장을 하나 이상 선택해 주세요.');
      return;
    }
    const incompletePool = activePools.find(pool => !Object.values(poolDays[pool] || {}).some(Boolean)
      || !poolTimeOptions[pool as keyof typeof poolTimeOptions].some(time => selectedTimes[time.key]));
    if (incompletePool) {
      alert(`${incompletePool === 'passnine' ? '칠곡 패스나인' : '밀양 아리랑'} 풀장의 가능 요일과 시간대를 각각 하나 이상 선택해 주세요.`);
      return;
    }

    const legacyDayAvailability = Object.fromEntries(dayOptions.filter(day => day.key !== 'holiday').map(day => [
      `available_${day.key}`,
      activePools.some(pool => poolDays[pool]?.[day.key]),
    ]));

    const updateData = {
      profile_image: profileImg,
      bio,
      course_levels: { ...maxLevels, '스페셜 교육': selectedSpecialCourses },
      max_freediving_level: Math.max(0, courseLevelMap['프리다이빙'].indexOf(maxLevels['프리다이빙'])),
      max_mermaid_level: Math.max(0, courseLevelMap['머메이드 다이빙'].indexOf(maxLevels['머메이드 다이빙'])),
      max_youth_level: Math.max(0, courseLevelMap['유스 프리다이빙'].indexOf(maxLevels['유스 프리다이빙'])),
      can_safety_guard: maxLevels['수중레저안전요원'] !== '교육 불가',
      can_scuba: maxLevels['스쿠버다이빙'] !== '교육 불가',
      can_special: selectedSpecialCourses.length > 0,
      ...Object.fromEntries(Object.values(poolTimeOptions).flat().map(({ key }) => [key, !!selectedPools[key.startsWith('passnine') ? 'passnine' : 'miryang'] && !!selectedTimes[key]])),
      can_passnine: !!selectedPools['passnine'],
      can_miryang: !!selectedPools['miryang'],
      ...legacyDayAvailability,
      ...Object.fromEntries(['passnine', 'miryang'].flatMap(pool => dayOptions.map(day => [
        `${pool}_day_${day.key}`,
        !!selectedPools[pool] && !!poolDays[pool]?.[day.key],
      ]))),
    };

    const response = await fetch('/api/instructor/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updateData),
    }).catch(() => null);
    const result = await response?.json().catch(() => ({}));
    if (!response?.ok) {
      alert('저장 오류: ' + (result?.error || '잠시 후 다시 시도해 주세요.'));
    } else {
      alert('✅ 프로필 및 수업 설정이 성공적으로 저장되었습니다!');
      setCurrentInstructor(result.instructor || { ...currentInstructor, ...updateData });
      setView('instructor_dashboard');
      fetchMyCustomers();
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
              <input type="text" value={loginId} onChange={(e) => setLoginId(e.target.value)} autoComplete="username" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-base focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-100" required />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">비밀번호</label>
              <input type="password" value={loginPw} onChange={(e) => setLoginPw(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); e.currentTarget.form?.requestSubmit(); } }} autoComplete="current-password" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-base focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-100" required />
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
              <input type="text" value={signupName} onChange={(e) => setSignupName(e.target.value)} autoComplete="name" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-base" required />
            </div>
            <div>
              <label className="block font-semibold text-slate-600 mb-1">아이디 (영문, 숫자 조합)</label>
              <input type="text" value={signupId} onChange={(e) => setSignupId(e.target.value)} autoComplete="username" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-base" required />
            </div>
            <div>
              <label className="block font-semibold text-slate-600 mb-1">비밀번호 (8~13자리, 영문/숫자/특수문자)</label>
              <input type="password" value={signupPw} onChange={(e) => setSignupPw(e.target.value)} autoComplete="new-password" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-base" required />
            </div>
            <div>
              <label className="block font-semibold text-slate-600 mb-1">연락처 (자동 하이픈)</label>
              <input type="tel" inputMode="tel" autoComplete="tel" value={signupPhone} onChange={(e) => handlePhoneInput(e.target.value, setSignupPhone)} placeholder="010-0000-0000" maxLength={13} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-base" required />
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
        <div className="bg-white border border-slate-200 p-5 sm:p-8 rounded-3xl shadow-xl max-w-2xl w-full space-y-6">
          <div className="text-center">
            <span className="text-xs font-bold px-3 py-1 bg-cyan-100 text-cyan-800 rounded-full">PROFILE SETTING</span>
            <h1 className="text-xl font-black text-slate-900 mt-2">프로필 및 수업 설정</h1>
            <p className="text-xs text-slate-500 mt-1">수업 가능한 코스와 레벨, 풀장 및 시간대를 설정해 주세요.</p>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-6 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">프로필 사진 첨부 (필수)</label>
              <input type="file" accept="image/*" onChange={handleImageUpload} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2" />
              <p className="text-[10px] text-amber-600 mt-1">원본 20MB 이하 · 저장할 때 화면용 크기로 자동 조정됩니다.</p>
              {isProcessingImage && <p className="text-xs text-cyan-700 mt-2" role="status">사진을 처리하는 중입니다…</p>}
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
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-base leading-7"
                placeholder="인사말 작성 (최대 300자)"
              />
              <p className="text-[10px] text-cyan-700 mt-1">※ 이 강사 소개란은 신규 교육생에게 노출됩니다.</p>
            </div>

            <div className="space-y-4 border-t border-slate-100 pt-4">
              <label className="block font-bold text-slate-900 text-sm">🏊‍♂️ 수업 가능 코스 및 최고 교육 가능 레벨 선택</label>
              {Object.entries(courseLevelMap).map(([courseName, levels]) => (
                <div key={courseName} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                  <p className="font-bold text-cyan-800">{courseName}</p>
                  {courseName === '스페셜 교육' && <p className="text-xs leading-5 text-slate-500">교육 가능한 항목을 모두 선택해 주세요.</p>}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {(courseName === '스페셜 교육' ? levels.filter(level => level !== '교육 불가') : levels).map(lvl => {
                      const currentVal = maxLevels[courseName] || '교육 불가';
                      const isSelected = courseName === '스페셜 교육' ? selectedSpecialCourses.includes(lvl) : currentVal === lvl;
                      return (
                        <button
                          key={lvl}
                          type="button"
                          onClick={() => courseName === '스페셜 교육'
                            ? setSelectedSpecialCourses(previous => previous.includes(lvl) ? previous.filter(value => value !== lvl) : [...previous, lvl])
                            : setMaxLevels({ ...maxLevels, [courseName]: lvl })}
                          className={`min-h-12 py-3 px-2 rounded-xl text-xs leading-5 font-bold border transition cursor-pointer ${
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

            <div className="border-t border-slate-100 pt-4 space-y-4">
              <div>
                <label className="block font-bold text-slate-900 text-sm">🌊 풀장별 수업 가능 요일 · 시간대</label>
                <p className="mt-1 text-xs leading-5 text-slate-500">풀장마다 가능한 요일과 시간대를 따로 선택해 주세요. 공휴일도 선택할 수 있습니다.</p>
              </div>
              
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                <label className="flex min-h-12 items-center gap-3 rounded-xl p-2 text-sm font-bold text-slate-900 cursor-pointer">
                  <input type="checkbox" checked={selectedPools['passnine'] || false} onChange={(e) => setSelectedPools({ ...selectedPools, passnine: e.target.checked })} className="accent-cyan-600 w-5 h-5 shrink-0" />
                  <span>칠곡 패스나인 풀장</span>
                </label>
                {selectedPools['passnine'] && (
                  <div className="space-y-4 pt-1">
                    <div>
                      <p className="mb-2 text-xs font-bold text-slate-600">수업 가능 요일</p>
                      <div className="grid grid-cols-4 gap-2 sm:grid-cols-8">
                        {dayOptions.map(day => <button key={day.key} type="button" onClick={() => setPoolDays(previous => ({ ...previous, passnine: { ...previous.passnine, [day.key]: !previous.passnine?.[day.key] } }))} className={`min-h-11 rounded-xl border text-sm font-bold ${poolDays.passnine?.[day.key] ? 'border-cyan-500 bg-cyan-600 text-white' : 'border-slate-200 bg-white text-slate-600'}`}>{day.label}</button>)}
                      </div>
                    </div>
                    <div>
                      <p className="mb-2 text-xs font-bold text-slate-600">수업 가능 시간대</p>
                      <div className="grid grid-cols-1 gap-2 min-[430px]:grid-cols-2">
                    {poolTimeOptions.passnine.map(t => (
                      <label key={t.key} className={`flex min-h-12 items-center gap-3 p-3 text-sm leading-5 rounded-xl border cursor-pointer ${selectedTimes[t.key] ? 'bg-cyan-50 border-cyan-500 font-bold text-cyan-900' : 'bg-white border-slate-200'}`}>
                        <input type="checkbox" checked={selectedTimes[t.key] || false} onChange={(e) => setSelectedTimes({ ...selectedTimes, [t.key]: e.target.checked })} className="accent-cyan-600 w-5 h-5 shrink-0" />
                        <span>{t.label}</span>
                      </label>
                    ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                <label className="flex min-h-12 items-center gap-3 rounded-xl p-2 text-sm font-bold text-slate-900 cursor-pointer">
                  <input type="checkbox" checked={selectedPools['miryang'] || false} onChange={(e) => setSelectedPools({ ...selectedPools, miryang: e.target.checked })} className="accent-cyan-600 w-5 h-5 shrink-0" />
                  <span>밀양 아리랑 풀장</span>
                </label>
                {selectedPools['miryang'] && (
                  <div className="space-y-4 pt-1">
                    <div>
                      <p className="mb-2 text-xs font-bold text-slate-600">수업 가능 요일</p>
                      <div className="grid grid-cols-4 gap-2 sm:grid-cols-8">
                        {dayOptions.map(day => <button key={day.key} type="button" onClick={() => setPoolDays(previous => ({ ...previous, miryang: { ...previous.miryang, [day.key]: !previous.miryang?.[day.key] } }))} className={`min-h-11 rounded-xl border text-sm font-bold ${poolDays.miryang?.[day.key] ? 'border-cyan-500 bg-cyan-600 text-white' : 'border-slate-200 bg-white text-slate-600'}`}>{day.label}</button>)}
                      </div>
                    </div>
                    <div>
                      <p className="mb-2 text-xs font-bold text-slate-600">수업 가능 시간대</p>
                      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {poolTimeOptions.miryang.map(t => (
                      <label key={t.key} className={`flex min-h-12 items-center gap-3 p-3 text-sm leading-5 rounded-xl border cursor-pointer ${selectedTimes[t.key] ? 'bg-cyan-50 border-cyan-500 font-bold text-cyan-900' : 'bg-white border-slate-200'}`}>
                        <input type="checkbox" checked={selectedTimes[t.key] || false} onChange={(e) => setSelectedTimes({ ...selectedTimes, [t.key]: e.target.checked })} className="accent-cyan-600 w-5 h-5 shrink-0" />
                        <span>{t.label}</span>
                      </label>
                    ))}
                      </div>
                    </div>
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
              <button type="submit" disabled={isProcessingImage} className="py-4 disabled:opacity-50 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-2xl text-sm cursor-pointer shadow-md">
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
      const count = filteredAllCustomers.filter(c => c.matched_instructor_id === ins.id || (!c.matched_instructor_id && c.matched_instructor === ins.name)).length;
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

          <section className="rounded-3xl border border-indigo-200 bg-gradient-to-br from-indigo-950 to-slate-900 p-5 text-white shadow-lg sm:p-6" aria-labelledby="pool-availability-tools">
            <p className="text-xs font-bold tracking-widest text-indigo-200">POOL AVAILABILITY · ADMIN TEST</p>
            <h2 id="pool-availability-tools" className="mt-1 text-xl font-black">풀장 예약 현황 점검</h2>
            <p className="mt-2 text-sm leading-6 text-slate-300">전체 풀장 연동이 완료되기 전까지 관리자 페이지에서만 조회하고 확인할 수 있습니다.</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <button type="button" onClick={() => setShowPass9Availability(true)} className="min-h-12 rounded-2xl bg-white px-4 py-3 text-sm font-bold text-slate-950 hover:bg-cyan-50">패스나인 예약 현황 확인</button>
              <button type="button" onClick={() => setShowDeepstationAvailability(true)} className="min-h-12 rounded-2xl bg-indigo-100 px-4 py-3 text-sm font-bold text-indigo-950 hover:bg-indigo-200">딥스테이션 딥탱크 부이 예약 현황</button>
              <button type="button" onClick={() => setShowParadiveAvailability(true)} className="min-h-12 rounded-2xl bg-cyan-100 px-4 py-3 text-sm font-bold text-cyan-950 hover:bg-cyan-200">파라다이브 딥탱크 부이 예약 현황</button>
            </div>
          </section>

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
                        <button onClick={() => handleDeleteInstructor(ins.id)} disabled={deletingInstructorId !== null} className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg font-bold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
                          {deletingInstructorId === ins.id ? '삭제 중...' : '삭제'}
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

            <MarketingSummary customers={filteredAllCustomers} />

            <div className="pt-4 border-t border-slate-100">
              <h3 className="text-base font-bold text-slate-900 mb-3">📋 전체 고객 매칭 세부 내역 ({filteredAllCustomers.length}건)</h3>
              <div className="space-y-3">
                {filteredAllCustomers.map(cus => (
                  <CustomerMatchCard key={cus.id} customer={cus} showAttribution />
                ))}
              </div>
            </div>
          </div>

          {showPass9Availability && <Pass9AvailabilityModal onClose={() => setShowPass9Availability(false)} />}
          {showDeepstationAvailability && <DeepstationAvailabilityModal onClose={() => setShowDeepstationAvailability(false)} />}
          {showParadiveAvailability && <ParadiveAvailabilityModal onClose={() => setShowParadiveAvailability(false)} />}
        </div>
      </div>
    );
  }

  // --- [뷰 5] 강사 페이지 (Instructor Dashboard) ---
  const myFilteredCustomers = customers.filter(c => filterByPeriod(c.created_at));
  const savedLevels = currentInstructor?.course_levels || {};
  const availableCourses = Object.entries(courseLevelMap)
    .map(([name, levels]) => {
      const legacyLevel = name === '프리다이빙' ? levels[currentInstructor?.max_freediving_level || 0]
        : name === '머메이드 다이빙' ? levels[currentInstructor?.max_mermaid_level || 0]
        : name === '유스 프리다이빙' ? levels[currentInstructor?.max_youth_level || 0]
        : name === '수중레저안전요원' && currentInstructor?.can_safety_guard ? '교육 가능'
        : name === '스쿠버다이빙' && currentInstructor?.can_scuba ? '교육 가능'
        : name === '스페셜 교육' && currentInstructor?.can_special ? '교육 가능'
        : '교육 불가';
      const savedLevel = savedLevels[name];
      return { name, level: Array.isArray(savedLevel) ? savedLevel : savedLevel || legacyLevel || '교육 불가' };
    })
    .filter(course => Array.isArray(course.level) ? course.level.length > 0 : course.level !== '교육 불가');
  const availablePools = [
    { key: 'passnine', name: '칠곡 패스나인 풀장', times: poolTimeOptions.passnine },
    { key: 'miryang', name: '밀양 아리랑 풀장', times: poolTimeOptions.miryang },
  ].filter(pool => currentInstructor?.[`can_${pool.key}`]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 px-4 py-6 sm:px-8 sm:py-10 font-sans">
      <div className="max-w-5xl mx-auto space-y-6">
        <header className="rounded-3xl bg-slate-900 p-5 sm:p-8 text-white shadow-lg">
          <div className="flex flex-col sm:flex-row sm:items-start gap-5">
            <div className="w-20 h-20 shrink-0 rounded-2xl overflow-hidden bg-slate-700 border border-white/20">
              {profileImg && <img src={profileImg} alt={`${currentInstructor?.name} 강사 프로필`} className="w-full h-full object-cover" />}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold tracking-widest text-cyan-300">BLUE PEACE · INSTRUCTOR</p>
              <h1 className="mt-2 text-2xl sm:text-3xl font-bold leading-snug break-keep">{currentInstructor?.name} 강사님</h1>
              <ExpandableText
                text={bio || '소개글을 작성하면 이곳에 표시됩니다.'}
                collapsedLines={3}
                threshold={90}
                className="mt-2 whitespace-pre-wrap text-sm leading-7 text-slate-200"
                buttonClassName="bg-white/10 text-cyan-200 border border-white/20"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => setView('profile_setup')} className="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-sm font-bold cursor-pointer">프로필 · 수업 수정</button>
              <button onClick={handleLogout} className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm font-semibold cursor-pointer">로그아웃</button>
            </div>
          </div>
        </header>

        <section aria-labelledby="teaching-summary" className="space-y-4">
          <div>
            <p className="text-xs font-bold tracking-widest text-cyan-700">TEACHING PROFILE</p>
            <h2 id="teaching-summary" className="mt-1 text-xl sm:text-2xl font-bold">내 수업 가능 정보</h2>
            <p className="mt-1 text-sm text-slate-600">설정한 교육 과정과 수업 가능 일정을 한눈에 확인하세요.</p>
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm lg:col-span-2">
              <div className="flex items-center justify-between gap-3 mb-4">
                <h3 className="text-base font-bold">교육 가능 코스</h3>
                <span className="text-xs font-bold text-cyan-800 bg-cyan-50 rounded-full px-3 py-1">{availableCourses.length}개 과정</span>
              </div>
              {availableCourses.length ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  {availableCourses.map(course => (
                    <div key={course.name} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <p className="text-sm font-bold text-slate-900">{course.name}</p>
                      <p className="mt-1 text-sm leading-6 text-cyan-800 break-keep">{Array.isArray(course.level) ? course.level.join(' · ') : course.level}</p>
                    </div>
                  ))}
                </div>
              ) : <p className="text-sm text-slate-600">설정된 교육 가능 코스가 없습니다. 프로필에서 코스를 선택해 주세요.</p>}
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm lg:col-span-2">
              <h3 className="text-base font-bold mb-4">풀장별 수업 가능 일정</h3>
              {availablePools.length ? (
                <div className="space-y-4">
                  {availablePools.map(pool => {
                    const times = pool.times.filter(time => currentInstructor?.[time.key]);
                    const poolDaysForDisplay = dayOptions.filter(day => currentInstructor?.[`${pool.key}_day_${day.key}`]);
                    return (
                      <div key={pool.key} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <p className="text-sm font-bold">{pool.name}</p>
                        <div className="mt-3">
                          <p className="text-xs font-bold text-slate-500">가능 요일</p>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {poolDaysForDisplay.length ? poolDaysForDisplay.map(day => <span key={day.key} className="rounded-lg bg-cyan-600 px-2.5 py-1.5 text-xs font-bold text-white">{day.label}</span>) : <span className="text-sm text-slate-600">선택한 요일이 없습니다.</span>}
                          </div>
                        </div>
                        <p className="mt-3 text-xs font-bold text-slate-500">가능 시간대</p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {times.length ? times.map(time => <span key={time.key} className="rounded-lg bg-cyan-50 px-2.5 py-1.5 text-xs font-semibold text-cyan-900">{time.label}</span>)
                            : <span className="text-sm text-slate-600">선택한 시간대가 없습니다.</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : <p className="text-sm text-slate-600">설정된 풀장이 없습니다. 프로필에서 풀장과 시간대를 선택해 주세요.</p>}
            </div>
          </div>
        </section>

        <div className="bg-white border border-slate-200 p-5 sm:p-6 rounded-3xl shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-4">
            <h2 className="text-lg font-bold text-slate-900 leading-snug break-keep">매칭된 수강생 · 신청 내역 <span className="text-cyan-700">({myFilteredCustomers.length}건)</span></h2>
            <div className="flex flex-wrap gap-1 bg-slate-100 p-1 rounded-xl text-sm font-semibold">
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
              <p className="text-xs text-slate-400 py-6 text-center">선택하신 기간에 매칭된 수강생이 없습니다.</p>
            ) : (
              myFilteredCustomers.map(cus => (
                <CustomerMatchCard key={cus.id} customer={cus} />
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

