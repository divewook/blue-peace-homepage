'use client';

import React, { useEffect, useState } from 'react';
import CustomerMatchCard from '../../../components/customer-match-card';
import { hasCompleteInstructorProfile } from '../../../lib/instructor-fields';
import { bookingPools, getInstructorSchedule, validateInstructorSchedule } from '../../../lib/booking-options';
import InstructorScheduleEditor from '../../../components/instructor-schedule-editor';
import MarketingSummary from '../../../components/marketing-summary';
import Pass9AvailabilityModal from '../../../components/pass9-availability-modal';
import DeepstationAvailabilityModal from '../../../components/deepstation-availability-modal';
import ParadiveAvailabilityModal from '../../../components/paradive-availability-modal';
import MarinaAvailabilityModal from '../../../components/marina-availability-modal';

type StatPeriod = 'all' | '1d' | '1w' | '1m' | '6m' | '1y' | 'custom';
const statPeriodOptions: Array<{ key: Exclude<StatPeriod, 'custom'>; label: string }> = [
  { key: '1d', label: '1일(오늘)' }, { key: '1w', label: '1주일' }, { key: '1m', label: '1개월' },
  { key: '6m', label: '6개월' }, { key: '1y', label: '1년' },
];
const instructorPeriodOptions: Array<{ key: StatPeriod; label: string }> = [
  { key: 'all', label: '전체' }, { key: '1w', label: '1주' }, { key: '1m', label: '1개월' },
  { key: '6m', label: '6개월' }, { key: '1y', label: '1년' },
];
const workDashboardLoadTime = Date.now();

function koreaDateString(value = new Date()) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Seoul', year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(value);
}

function shiftDate(date: string, { days = 0, months = 0, years = 0 }: { days?: number; months?: number; years?: number }) {
  const value = new Date(`${date}T00:00:00Z`);
  const originalDay = value.getUTCDate();
  value.setUTCDate(1);
  value.setUTCFullYear(value.getUTCFullYear() + years);
  value.setUTCMonth(value.getUTCMonth() + months);
  const lastDay = new Date(Date.UTC(value.getUTCFullYear(), value.getUTCMonth() + 1, 0)).getUTCDate();
  value.setUTCDate(Math.min(originalDay, lastDay));
  value.setUTCDate(value.getUTCDate() + days);
  return value.toISOString().slice(0, 10);
}

function statDateRange(period: StatPeriod, customStart: string, customEnd: string) {
  const today = koreaDateString();
  if (period === 'custom') return [customStart, customEnd].sort();
  const startDates: Record<Exclude<StatPeriod, 'custom' | 'all'>, string> = {
    '1d': today,
    '1w': shiftDate(today, { days: -6 }),
    '1m': shiftDate(today, { months: -1 }),
    '6m': shiftDate(today, { months: -6 }),
    '1y': shiftDate(today, { years: -1 }),
  };
  return [period === 'all' ? '' : startDates[period], today];
}

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
  const [customersLoading, setCustomersLoading] = useState(false);
  const [customersError, setCustomersError] = useState('');
  const [workFilter, setWorkFilter] = useState<'all'|'overdue'|'contact'|'lessons'>('all');
  const [allInstructors, setAllInstructors] = useState<any[]>([]);
  const [allCustomers, setAllCustomers] = useState<any[]>([]);
  const [deletingInstructorId, setDeletingInstructorId] = useState<string | null>(null);
  const [statPeriod, setStatPeriod] = useState<StatPeriod>('1m');
  const [customStartDate, setCustomStartDate] = useState(() => shiftDate(koreaDateString(), { months: -1 }));
  const [customEndDate, setCustomEndDate] = useState(koreaDateString);

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
  const [scheduleByDay, setScheduleByDay] = useState<Record<string, Record<string, string[]>>>({ passnine: {}, miryang: {} });
  const [selectedSpecialCourses, setSelectedSpecialCourses] = useState<string[]>([]);
  const [showPass9Availability, setShowPass9Availability] = useState(false);
  const [showDeepstationAvailability, setShowDeepstationAvailability] = useState(false);
  const [showParadiveAvailability, setShowParadiveAvailability] = useState(false);
  const [showMarinaAvailability, setShowMarinaAvailability] = useState(false);
  const [profileSection, setProfileSection] = useState<'public' | 'courses' | 'schedule'>('public');
  const [profileDirty, setProfileDirty] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSaveError, setProfileSaveError] = useState('');
  const [dashboardNotice, setDashboardNotice] = useState('');

  useEffect(() => {
    if (view !== 'profile_setup' || !profileDirty) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [view, profileDirty]);

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
        setStatPeriod('1m');
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
    setScheduleByDay(getInstructorSchedule(data));

    if (!data.profile_image) {
      setProfileSection('public');
      setProfileDirty(false);
      setView('profile_setup');
    } else {
      setStatPeriod('all');
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
    setStatPeriod('1m');
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
    setCustomersLoading(true);
    setCustomersError('');
    try {
      const response = await fetch('/api/instructor/customers', { cache: 'no-store' });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || '매칭 내역을 불러오지 못했습니다.');
      setCustomers(result.customers || []);
    } catch (error) {
      setCustomersError(error instanceof Error ? error.message : '매칭 내역을 불러오지 못했습니다.');
    } finally {
      setCustomersLoading(false);
    }
  };

  const openProfileSection = (section: 'public' | 'courses' | 'schedule') => {
    setProfileSection(section);
    setProfileDirty(false);
    setProfileSaveError('');
    setView('profile_setup');
  };

  const leaveProfileSetup = () => {
    if (profileDirty && !window.confirm('저장하지 않은 변경이 있습니다. 변경을 버리고 나갈까요?')) return;
    setProfileDirty(false);
    setProfileSaveError('');
    setView('instructor_dashboard');
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
    if (isProcessingImage || profileSaving) return;
    if (profileSection === 'public' && !profileImg) {
      setProfileSaveError('프로필 사진을 선택해 주세요.');
      return;
    }
    if (profileSection === 'schedule') {
      const checked = validateInstructorSchedule(scheduleByDay);
      if (!checked.valid) { setProfileSaveError(checked.error || '요일별 시간표를 확인해 주세요.'); return; }
    }
    const updateData = profileSection === 'public'
      ? { section: 'public', profile_image: profileImg, bio }
      : profileSection === 'courses'
        ? {
            section: 'courses',
            course_levels: { ...maxLevels, '스페셜 교육': selectedSpecialCourses },
            max_freediving_level: Math.max(0, courseLevelMap['프리다이빙'].indexOf(maxLevels['프리다이빙'])),
            max_mermaid_level: Math.max(0, courseLevelMap['머메이드 다이빙'].indexOf(maxLevels['머메이드 다이빙'])),
            max_youth_level: Math.max(0, courseLevelMap['유스 프리다이빙'].indexOf(maxLevels['유스 프리다이빙'])),
            can_safety_guard: maxLevels['수중레저안전요원'] !== '교육 불가',
            can_scuba: maxLevels['스쿠버다이빙'] !== '교육 불가',
            can_special: selectedSpecialCourses.length > 0,
          }
        : { section: 'schedule', schedule_by_day: scheduleByDay, schedule_revision: currentInstructor?.schedule_revision ?? 0 };

    setProfileSaving(true);
    setProfileSaveError('');
    const response = await fetch('/api/instructor/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updateData),
    }).catch(() => null);
    const result = await response?.json().catch(() => ({}));
    if (!response?.ok) {
      setProfileSaveError(result?.error || '잠시 후 다시 시도해 주세요.');
    } else {
      setCurrentInstructor(result.instructor || { ...currentInstructor, ...updateData });
      if (profileSection === 'schedule' && result.instructor) setScheduleByDay(getInstructorSchedule(result.instructor));
      setProfileDirty(false);
      setDashboardNotice('설정이 저장되었습니다. 기존의 다른 설정도 그대로 유지되었습니다.');
      setView('instructor_dashboard');
      fetchMyCustomers();
    }
    setProfileSaving(false);
  };

  const filterByPeriod = (dateString: string) => {
    if (statPeriod === 'all') return true;
    const parsed = new Date(dateString);
    if (Number.isNaN(parsed.getTime())) return false;
    const customerDate = koreaDateString(parsed);
    const [startDate, endDate] = statDateRange(statPeriod, customStartDate, customEndDate);
    return customerDate >= startDate && customerDate <= endDate;
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

          <div className="grid grid-cols-3 gap-2" role="tablist" aria-label="설정 영역">
            {([['public', '공개 프로필'], ['courses', '교육 설정'], ['schedule', '일정 설정']] as const).map(([key, label]) => (
              <button key={key} type="button" role="tab" aria-selected={profileSection === key} onClick={() => setProfileSection(key)} className={`min-h-12 rounded-xl border px-2 text-sm font-bold ${profileSection === key ? 'border-cyan-600 bg-cyan-50 text-cyan-900' : 'border-slate-200 bg-white text-slate-600'}`}>{profileSection === key ? '✓ ' : ''}{label}</button>
            ))}
          </div>

          <form onSubmit={handleSaveProfile} onChangeCapture={() => setProfileDirty(true)} className="space-y-6 text-sm">
            {profileSection === 'public' && <><div>
              <label className="block font-bold text-slate-700 mb-1">프로필 사진 첨부 (필수)</label>
              <input type="file" accept="image/*" onChange={handleImageUpload} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2" />
              <p className="mt-1 text-sm leading-6 text-amber-700">원본 20MB 이하 · 기존 사진은 다시 첨부하지 않아도 유지됩니다.</p>
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
                <span className="text-sm text-slate-500">{bio.length} / 300자</span>
              </div>
              <textarea
                value={bio}
                onChange={(e) => { if (e.target.value.length <= 300) setBio(e.target.value); }}
                rows={3}
                maxLength={300}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-base leading-7"
                placeholder="인사말 작성 (최대 300자)"
              />
              <p className="mt-1 text-sm leading-6 text-cyan-800">이 소개는 홈페이지의 강사 소개에 표시됩니다.</p>
            </div></>}

            {profileSection === 'courses' && <div className="space-y-4">
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
                          aria-pressed={isSelected}
                          onClick={() => { setProfileDirty(true); courseName === '스페셜 교육'
                            ? setSelectedSpecialCourses(previous => previous.includes(lvl) ? previous.filter(value => value !== lvl) : [...previous, lvl])
                            : setMaxLevels({ ...maxLevels, [courseName]: lvl }); }}
                          className={`min-h-12 py-3 px-2 rounded-xl text-xs leading-5 font-bold border transition cursor-pointer ${
                            isSelected ? 'bg-cyan-600 text-white border-cyan-500 shadow-xs' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {isSelected ? '✓ ' : ''}{lvl}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>}

            {profileSection === 'schedule' && <InstructorScheduleEditor
              value={scheduleByDay}
              onChange={next => { setScheduleByDay(next); setProfileDirty(true); setProfileSaveError(''); }}
              legacy={currentInstructor?.schedule_by_day == null}
            />}


            {profileSaveError && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-800">저장하지 못했습니다. {profileSaveError}</div>}

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button type="button" onClick={leaveProfileSetup} className="min-h-12 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl text-sm cursor-pointer">
                취소
              </button>
              <button type="submit" disabled={isProcessingImage || profileSaving} className="min-h-12 disabled:opacity-50 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-2xl text-sm cursor-pointer shadow-md">
                {profileSaving ? '저장 중…' : '설정 저장하기'}
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
    const [rangeStart, rangeEnd] = statDateRange(statPeriod, customStartDate, customEndDate);
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
            <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <button type="button" onClick={() => setShowPass9Availability(true)} className="min-h-12 rounded-2xl bg-white px-4 py-3 text-sm font-bold text-slate-950 hover:bg-cyan-50">패스나인 예약 현황 확인</button>
              <button type="button" onClick={() => setShowDeepstationAvailability(true)} className="min-h-12 rounded-2xl bg-indigo-100 px-4 py-3 text-sm font-bold text-indigo-950 hover:bg-indigo-200">딥스테이션 딥탱크 부이 예약 현황</button>
              <button type="button" onClick={() => setShowParadiveAvailability(true)} className="min-h-12 rounded-2xl bg-cyan-100 px-4 py-3 text-sm font-bold text-cyan-950 hover:bg-cyan-200">파라다이브 딥탱크 부이 예약 현황</button>
              <button type="button" onClick={() => setShowMarinaAvailability(true)} className="min-h-12 rounded-2xl bg-emerald-100 px-4 py-3 text-sm font-bold text-emerald-950 hover:bg-emerald-200">북항마리나 예약 현황</button>
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
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 border-b border-slate-100 pb-4">
              <h2 className="text-lg font-bold text-slate-900">📊 강사별 매칭 통계</h2>
              <div className="flex max-w-full flex-wrap gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold">
                {statPeriodOptions.map(p => (
                  <button key={p.key} type="button" onClick={() => setStatPeriod(p.key)} className={`min-h-10 px-3 py-1.5 rounded-lg transition cursor-pointer ${statPeriod === p.key ? 'bg-white text-cyan-700 shadow-xs' : 'text-slate-500'}`}>
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            <div className={`rounded-2xl border p-4 ${statPeriod === 'custom' ? 'border-cyan-300 bg-cyan-50' : 'border-slate-200 bg-slate-50'}`}>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                <label className="flex-1 text-xs font-bold text-slate-600">
                  시작일
                  <input type="date" value={customStartDate} max={koreaDateString()} onChange={event => setCustomStartDate(event.target.value)} className="mt-1 min-h-12 w-full rounded-xl border border-slate-300 bg-white px-3 text-base text-slate-900" />
                </label>
                <label className="flex-1 text-xs font-bold text-slate-600">
                  종료일
                  <input type="date" value={customEndDate} max={koreaDateString()} onChange={event => setCustomEndDate(event.target.value)} className="mt-1 min-h-12 w-full rounded-xl border border-slate-300 bg-white px-3 text-base text-slate-900" />
                </label>
                <button type="button" onClick={() => setStatPeriod('custom')} disabled={!customStartDate || !customEndDate} className="min-h-12 rounded-xl bg-slate-900 px-5 text-sm font-bold text-white disabled:opacity-40">설정 기간 적용</button>
              </div>
              <p className="mt-2 text-xs leading-5 text-slate-500">
                {statPeriod === 'custom' ? `${rangeStart.replaceAll('-', '. ')}부터 ${rangeEnd.replaceAll('-', '. ')}까지의 매칭을 표시합니다.` : '시작일과 종료일을 선택하면 원하는 기간만 따로 확인할 수 있습니다.'}
              </p>
            </div>

            <div className="flex flex-col gap-1 rounded-2xl bg-slate-900 px-4 py-3 text-white sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs font-semibold text-slate-300">조회 기간 <span className="ml-1 text-sm font-bold text-white">{rangeStart.replaceAll('-', '. ')} ~ {rangeEnd.replaceAll('-', '. ')}</span></p>
              <p className="text-sm font-bold text-cyan-300">전체 {filteredAllCustomers.length}건</p>
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
                  <CustomerMatchCard key={cus.id} customer={cus} showAttribution onWorkChanged={fetchAdminData} />
                ))}
              </div>
            </div>
          </div>

          {showPass9Availability && <Pass9AvailabilityModal onClose={() => setShowPass9Availability(false)} />}
          {showDeepstationAvailability && <DeepstationAvailabilityModal onClose={() => setShowDeepstationAvailability(false)} />}
          {showParadiveAvailability && <ParadiveAvailabilityModal onClose={() => setShowParadiveAvailability(false)} />}
          {showMarinaAvailability && <MarinaAvailabilityModal onClose={() => setShowMarinaAvailability(false)} />}
        </div>
      </div>
    );
  }

  // --- [뷰 5] 강사 페이지 (Instructor Dashboard) ---
  const workPriority = (customer: { workflow?: { task_title?: string; task_completed_at?: string; task_due_at?: string; status?: string }; next_lesson?: unknown }) => {
    if (customer.workflow?.task_title && !customer.workflow?.task_completed_at && customer.workflow.task_due_at && new Date(customer.workflow.task_due_at).getTime() < workDashboardLoadTime) return 0;
    if (!customer.workflow?.status || customer.workflow.status === 'contact_needed') return 1;
    if (customer.next_lesson) return 2;
    if (customer.workflow.status === 'schedule_discussion') return 3;
    return 4;
  };
  const myFilteredCustomers = customers.filter(c => filterByPeriod(c.created_at) &&
    (workFilter === 'all' || (workFilter === 'overdue' && workPriority(c) === 0) ||
      (workFilter === 'contact' && workPriority(c) === 1) || (workFilter === 'lessons' && !!c.next_lesson)));
  const orderedCustomers = [...myFilteredCustomers].sort((a, b) => workPriority(a) - workPriority(b));
  const overdueWork = customers.filter(c => workPriority(c) === 0).length;
  const contactWork = customers.filter(c => workPriority(c) === 1).length;
  const upcomingLessons = customers.filter(c => !!c.next_lesson).length;
  const nearestLesson = customers.filter(c => !!c.next_lesson)
    .sort((a,b) => `${a.next_lesson.lesson_date} ${a.next_lesson.start_time}`.localeCompare(`${b.next_lesson.lesson_date} ${b.next_lesson.start_time}`))[0];
  const showWorkGroup = (group: 'overdue'|'contact'|'lessons') => {
    setStatPeriod('all');setWorkFilter(group);
    requestAnimationFrame(() => document.getElementById('applications-heading')?.scrollIntoView({behavior:'smooth'}));
  };
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
  const currentSchedule = getInstructorSchedule(currentInstructor);
  const availablePools = [bookingPools.passnine, bookingPools.miryang].filter(pool =>
    (currentInstructor?.schedule_by_day != null || currentInstructor?.[`can_${pool.id}`]) && Object.values(currentSchedule?.[pool.id] || {}).some((slots: unknown) => Array.isArray(slots) && slots.length));

  const profileComplete = hasCompleteInstructorProfile(currentInstructor);
  const approved = currentInstructor?.is_approved === true;
  const publicAndMatchBaseReady = approved && profileComplete;

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-5 text-slate-900 sm:px-8 sm:py-8 font-sans">
      <div className="mx-auto max-w-5xl space-y-5">
        <header className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex items-center gap-3">
            <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-slate-200">
              {profileImg && <img src={profileImg} alt={`${currentInstructor?.name} 강사 프로필`} className="h-full w-full object-cover" />}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-cyan-700">강사 업무 페이지</p>
              <h1 className="truncate text-xl font-bold">{currentInstructor?.name} 강사님</h1>
            </div>
            <button onClick={handleLogout} className="min-h-11 rounded-xl border border-slate-300 px-3 text-sm font-semibold text-slate-700">로그아웃</button>
          </div>
          <div className="mt-4 flex flex-wrap gap-2 text-sm">
            <span className={`rounded-full px-3 py-1.5 font-semibold ${approved ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-800'}`}>{approved ? '✓ 관리자 승인 완료' : '관리자 승인 대기'}</span>
            <span className={`rounded-full px-3 py-1.5 font-semibold ${publicAndMatchBaseReady ? 'bg-cyan-50 text-cyan-900' : 'bg-slate-100 text-slate-700'}`}>{publicAndMatchBaseReady ? '✓ 홈페이지 공개 · 매칭 기본 조건 충족' : '프로필 또는 일정 설정 필요'}</span>
          </div>
          <p className="mt-3 break-keep text-sm leading-6 text-slate-600">개별 신청 배정은 고객이 고른 과정과 풀장·요일·시간이 모두 일치할 때 결정됩니다.</p>
        </header>

        {dashboardNotice && <div role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm leading-6 text-emerald-900">{dashboardNotice}</div>}

        {!customersLoading && !customersError && customers.length > 0 && <section aria-label="처리할 일 요약" className="grid grid-cols-3 gap-2">
          <button type="button" aria-pressed={workFilter==='overdue'} onClick={() => showWorkGroup('overdue')} className="min-h-20 rounded-xl border border-amber-200 bg-white p-2 text-center text-sm font-semibold">기한 지난 일<br/><strong className="text-xl">{overdueWork}</strong>건</button>
          <button type="button" aria-pressed={workFilter==='contact'} onClick={() => showWorkGroup('contact')} className="min-h-20 rounded-xl border border-cyan-200 bg-white p-2 text-center text-sm font-semibold">연락·상태<br/><strong className="text-xl">{contactWork}</strong>건</button>
          <button type="button" aria-pressed={workFilter==='lessons'} onClick={() => showWorkGroup('lessons')} className="min-h-20 rounded-xl border border-emerald-200 bg-white p-2 text-center text-sm font-semibold">예정 수업<br/><strong className="text-xl">{upcomingLessons}</strong>건</button>
        </section>}
        {nearestLesson && !customersLoading && !customersError && <p className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm leading-6 text-emerald-950 break-keep">
          <strong>가장 가까운 확정 수업</strong> · {nearestLesson.next_lesson.lesson_date} {nearestLesson.next_lesson.start_time.slice(0,5)} · {nearestLesson.name} 님
          <span className="block text-emerald-900">사이트에 등록된 일정입니다. 풀장 예약·결제 완료 여부는 별도로 확인해 주세요.</span>
        </p>}

        <section aria-labelledby="applications-heading" className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <div className="border-b border-slate-100 pb-4">
            <p className="text-sm font-bold text-cyan-700">신청 업무</p>
            <div className="mt-1 flex flex-wrap items-end justify-between gap-2">
              <h2 id="applications-heading" className="text-xl font-bold break-keep">배정된 상담 신청</h2>
              <p className="text-sm font-semibold text-slate-700">전체 {customers.length}건 · 현재 {myFilteredCustomers.length}건</p>
            </div>
            <p className="mt-2 text-sm leading-6 text-slate-600">기간은 고객의 상담 신청 접수일을 기준으로 합니다. 처음에는 오래된 미처리 신청도 빠지지 않도록 전체를 표시합니다.</p>
            {workFilter!=='all' && <button type="button" onClick={()=>setWorkFilter('all')} className="mt-2 min-h-11 rounded-lg border border-cyan-300 px-3 text-sm font-semibold text-cyan-800">업무 분류 해제 · 전체 보기</button>}
            <div className="mt-4 grid grid-cols-3 gap-2 min-[430px]:flex min-[430px]:flex-wrap" aria-label="신청 기간 필터">
              {instructorPeriodOptions.map(option => (
                <button key={option.key} type="button" aria-pressed={statPeriod === option.key} onClick={() => {setStatPeriod(option.key);setWorkFilter('all')}} className={`min-h-11 rounded-xl border px-3 text-sm font-bold ${statPeriod === option.key ? 'border-cyan-600 bg-cyan-50 text-cyan-900' : 'border-slate-200 bg-white text-slate-600'}`}>{statPeriod === option.key ? '✓ ' : ''}{option.label}</button>
              ))}
            </div>
          </div>
          <div className="pt-4">
            {customersLoading ? <div role="status" className="rounded-xl bg-slate-50 p-6 text-center text-sm text-slate-600">신청 내역을 불러오는 중입니다…</div>
              : customersError ? <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-5"><p className="font-bold text-red-900">신청 내역을 불러오지 못했습니다.</p><p className="mt-1 text-sm leading-6 text-red-800">{customersError}</p><button type="button" onClick={fetchMyCustomers} className="mt-3 min-h-11 rounded-xl bg-red-800 px-4 text-sm font-bold text-white">다시 불러오기</button></div>
              : customers.length === 0 ? <div className="rounded-xl bg-slate-50 p-6 text-center"><p className="font-bold">아직 배정된 상담 신청이 없습니다.</p><p className="mt-2 text-sm leading-6 text-slate-600">신청이 배정되면 이곳에서 고객 정보와 요청 조건을 확인할 수 있습니다.</p></div>
              : myFilteredCustomers.length === 0 ? <div className="rounded-xl bg-slate-50 p-6 text-center"><p className="font-bold">{workFilter==='all'?'선택한 기간에 접수된 신청이 없습니다.':'이 분류에 해당하는 업무가 없습니다.'}</p><button type="button" onClick={() => {setStatPeriod('all');setWorkFilter('all')}} className="mt-3 min-h-11 rounded-xl border border-slate-300 bg-white px-4 text-sm font-bold">전체 신청 보기</button></div>
              : <div className="space-y-3">{orderedCustomers.map(customer => <CustomerMatchCard key={customer.id} customer={customer} onWorkChanged={fetchMyCustomers} />)}</div>}
          </div>
        </section>

        <section aria-labelledby="settings-heading" className="space-y-3">
          <div>
            <p className="text-sm font-bold text-cyan-700">내 정보</p>
            <h2 id="settings-heading" className="mt-1 text-xl font-bold">프로필과 수업 설정</h2>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            <article className="rounded-2xl border border-slate-200 bg-white p-4">
              <h3 className="font-bold">공개 프로필</h3><p className="mt-2 text-sm leading-6 text-slate-600">사진 {profileImg ? '등록됨' : '미등록'} · 소개글 {bio.trim() ? '등록됨' : '미등록'}</p>
              <button type="button" onClick={() => openProfileSection('public')} className="mt-4 min-h-11 w-full rounded-xl border border-slate-300 text-sm font-bold">공개 프로필 편집</button>
            </article>
            <article className="rounded-2xl border border-slate-200 bg-white p-4">
              <h3 className="font-bold">교육 설정</h3><p className="mt-2 text-sm leading-6 text-slate-600">교육 가능 분야 {availableCourses.length}개</p><p className="mt-1 line-clamp-2 text-sm leading-6 text-slate-500">{availableCourses.map(course => course.name).join(' · ') || '설정된 분야 없음'}</p>
              <button type="button" onClick={() => openProfileSection('courses')} className="mt-4 min-h-11 w-full rounded-xl border border-slate-300 text-sm font-bold">교육 설정 편집</button>
            </article>
            <article className="rounded-2xl border border-slate-200 bg-white p-4">
              <h3 className="font-bold">일정 설정</h3><p className="mt-2 text-sm leading-6 text-slate-600">수업 가능 풀장 {availablePools.length}곳</p><p className="mt-1 line-clamp-2 text-sm leading-6 text-slate-500">{availablePools.map(pool => pool.name).join(' · ') || '설정된 풀장 없음'}</p>
              <button type="button" onClick={() => openProfileSection('schedule')} className="mt-4 min-h-11 w-full rounded-xl border border-slate-300 text-sm font-bold">일정 설정 편집</button>
            </article>
          </div>
        </section>
      </div>
    </div>
  );
}
