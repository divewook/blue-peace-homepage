"use client";

import { useRef, useState } from "react";

// 운영 전 문의 이메일과 예시 후기를 실제 정보로 교체하세요.
const contactEmail = "hello@example.com";

// 실제 운영 전 강사 사진·자격·경력 및 각자의 오픈채팅 URL을 교체하세요.
// 예시 URL은 카카오 오픈채팅 홈으로 연결되며, 특정 강사의 채팅방은 아닙니다.
const instructors = [
  {
    id: "sanguk",
    name: "상욱",
    role: "대표강사",
    initials: "SW",
    photoUrl: "/KakaoTalk_20261014_203011.jpg",
    certifications: "AIDA / PSA / PSAI 자격 보유",
    experience: "BLUE PEACE 대표 강사",
    specialties: ["성인 프리다이빙", "스쿠버다이빙", "강사 과정"],
    eligibleCategoryIds: ["adult", "scuba"],
    instructorCourseCategoryIds: ["adult"],
    kakaoUrl: "https://open.kakao.com/",
    demo: false,
  },
  {
    id: "minseo",
    name: "민서",
    role: "교육강사",
    initials: "MS",
    photoUrl: "",
    certifications: "PSA 유스 · 머메이드 강사 (예시)",
    experience: "유스 및 머메이드 교육 5년 (예시)",
    specialties: ["유스 프리다이빙", "머메이드 다이빙"],
    eligibleCategoryIds: ["youth", "mermaid"],
    kakaoUrl: "https://open.kakao.com/",
    demo: true,
  },
  {
    id: "jihoon",
    name: "지훈",
    role: "교육강사",
    initials: "JH",
    photoUrl: "",
    certifications: "PSAI 스쿠버 · PSA 응급처치 강사 (예시)",
    experience: "스쿠버 교육 및 현장 안전 운영 6년 (예시)",
    specialties: ["스쿠버다이빙", "스페셜 교육"],
    eligibleCategoryIds: ["scuba", "special"],
    specialCourseTitles: ["응급처치 및 CPR 교육"],
    kakaoUrl: "https://open.kakao.com/",
    demo: true,
  },
  {
    id: "hayeon",
    name: "하연",
    role: "프리다이빙 강사",
    initials: "HY",
    photoUrl: "",
    certifications: "AIDA 프리다이빙 강사 (예시)",
    experience: "입문·오픈워터 교육 4년 (예시)",
    specialties: ["성인 프리다이빙", "입문 교육"],
    eligibleCategoryIds: ["adult"],
    eligibleCourseTitles: { adult: ["1레벨", "2레벨"] },
    kakaoUrl: "https://open.kakao.com/",
    demo: true,
  },
  {
    id: "doyun",
    name: "도윤",
    role: "프리다이빙 강사",
    initials: "DY",
    photoUrl: "",
    certifications: "PSA 프리다이빙 강사 (예시)",
    experience: "어드밴스드 과정 지도 5년 (예시)",
    specialties: ["성인 프리다이빙", "심화 과정"],
    eligibleCategoryIds: ["adult"],
    eligibleCourseTitles: { adult: ["3레벨", "4레벨"] },
    kakaoUrl: "https://open.kakao.com/",
    demo: true,
  },
  {
    id: "yuna",
    name: "유나",
    role: "유스 교육강사",
    initials: "YN",
    photoUrl: "",
    certifications: "PSA 유스 프리다이빙 강사 (예시)",
    experience: "청소년 수중 교육 4년 (예시)",
    specialties: ["유스 프리다이빙", "기초 안전"],
    eligibleCategoryIds: ["youth"],
    eligibleCourseTitles: { youth: ["1레벨", "2레벨"] },
    kakaoUrl: "https://open.kakao.com/",
    demo: true,
  },
  {
    id: "taeho",
    name: "태호",
    role: "수중안전 강사",
    initials: "TH",
    photoUrl: "",
    certifications: "PSA 수중레저안전요원 강사 (예시)",
    experience: "수중 안전 교육 및 현장 운영 7년 (예시)",
    specialties: ["수중레저안전요원", "응급처치"],
    eligibleCategoryIds: ["safety", "special"],
    specialCourseTitles: ["응급처치 및 CPR 교육"],
    instructorCourseCategoryIds: ["safety"],
    kakaoUrl: "https://open.kakao.com/",
    demo: true,
  },
  {
    id: "soyeon",
    name: "소연",
    role: "머메이드 강사",
    initials: "SY",
    photoUrl: "",
    certifications: "PSA 머메이드 강사 (예시)",
    experience: "머메이드·수중 퍼포먼스 교육 5년 (예시)",
    specialties: ["머메이드 다이빙", "수중 표현"],
    eligibleCategoryIds: ["mermaid"],
    kakaoUrl: "https://open.kakao.com/",
    demo: true,
  },
  {
    id: "junho",
    name: "준호",
    role: "스쿠버 강사",
    initials: "JH",
    photoUrl: "",
    certifications: "PSAI 스쿠버 강사 (예시)",
    experience: "해양 스쿠버 교육 6년 (예시)",
    specialties: ["스쿠버다이빙", "해양 실습"],
    eligibleCategoryIds: ["scuba"],
    kakaoUrl: "https://open.kakao.com/",
    demo: true,
  },
  {
    id: "narin",
    name: "나린",
    role: "스페셜 교육강사",
    initials: "NR",
    photoUrl: "",
    certifications: "PSA 응급처치 · 수중 촬영 교육 자격 (예시)",
    experience: "응급처치 및 수중 촬영 교육 3년 (예시)",
    specialties: ["응급처치 및 CPR", "수중 사진 촬영"],
    eligibleCategoryIds: ["special"],
    specialCourseTitles: ["응급처치 및 CPR 교육", "수중 사진 촬영 교육"],
    kakaoUrl: "https://open.kakao.com/",
    demo: true,
  },
];

// 교육 내용 변경 시 각 코스의 curriculum 값만 수정하면 카드에 반영됩니다.
// price는 교육비와 발급비를 합한 총 비용입니다.

const categories = [
  {
    id: "adult",
    name: "성인 프리다이빙",
    association: "AIDA / PSA",
    intro: "처음 숨을 고르는 순간부터 더 깊은 도전까지, 블루피스와 함께 단계별로 배웁니다.",
    courses: [
      { title: "1레벨", subtitle: "Freediver", description: "프리다이빙의 기초를 시작하는 과정입니다. 풀장 또는 해양 실습 중 하나를 선택해 2회 진행합니다.", curriculum: { theory: "1시간", pool: "2회 (택1)", ocean: "2회 (택1)", price: "15만원" } },
      { title: "2레벨", subtitle: "Open Water", description: "기본기를 바탕으로 개방 수역 경험을 넓혀가는 과정입니다.", unlimited: true, curriculum: { theory: "2시간", pool: "무제한", ocean: "무제한", price: "40만원" } },
      { title: "3레벨", subtitle: "Advanced", description: "기술과 안전 절차를 더 깊이 익히는 심화 과정입니다.", unlimited: true, curriculum: { theory: "2시간", pool: "무제한", ocean: "무제한", price: "55만원" } },
      { title: "4레벨", subtitle: "Master", description: "숙련도를 높이고 다음 단계를 준비하는 과정입니다.", unlimited: true, curriculum: { theory: "2시간", pool: "무제한", ocean: "무제한", price: "85만원" } },
      { title: "강사 과정", subtitle: "Instructor", description: "교육자로 나아가기 위한 과정입니다. 자격 요건과 일정은 블루피스에 문의해 주세요.", instructor: true, curriculum: { theory: "별도 문의", pool: "별도 문의", ocean: "별도 문의", price: "별도 문의" } },
    ],
  },
  {
    id: "youth",
    name: "유스 프리다이빙",
    association: "PSA",
    intro: "성장 단계에 맞춘 유스 프리다이빙 과정을 블루피스에서 안내합니다.",
    courses: [
      { title: "1레벨", subtitle: "Dolphin", description: "물과 친해지며 프리다이빙의 기초를 익히는 과정입니다.", curriculum: { theory: "1시간", pool: "4회", ocean: "없음", price: "35만원" } },
      { title: "2레벨", subtitle: "Orca Open Water", description: "기초 경험을 바탕으로 다음 단계에 도전하는 과정입니다.", curriculum: { theory: "1시간 30분", pool: "4회", ocean: "없음", price: "45만원" } },
      { title: "3레벨", subtitle: "Shark Advanced", description: "유스 다이버의 기술과 자신감을 키우는 심화 과정입니다.", curriculum: { theory: "2시간", pool: "4회", ocean: "없음", price: "55만원" } },
      { title: "강사 과정", subtitle: "Youth Instructor", description: "유스 교육자를 위한 과정입니다. 자격 요건과 일정은 블루피스에 문의해 주세요.", instructor: true, curriculum: { theory: "별도 문의", pool: "별도 문의", ocean: "없음", price: "별도 문의" } },
    ],
  },
  {
    id: "safety",
    name: "수중레저안전요원",
    association: "PSA",
    intro: "수중 활동의 안전 역량을 단계별로 배우는 블루피스 교육입니다.",
    courses: [
      { title: "수중레저안전요원", description: "야간 해루질 관련 자격 과정입니다. 실제 활동 가능 범위는 지역 규정을 확인해 주세요.", unlimited: true, curriculum: { theory: "2시간", pool: "무제한", ocean: "희망 시 가능", price: "35만원" } },
      { title: "마스터 수중레저안전요원", description: "야간 해루질 관련 상위 등급 자격 과정입니다. 실제 활동 가능 범위는 지역 규정을 확인해 주세요.", unlimited: true, curriculum: { theory: "2시간", pool: "무제한", ocean: "희망 시 가능", price: "55만원" } },
      { title: "수중레저안전요원 강사 과정", description: "야간 1인 해루질 관련 자격 과정입니다. 실제 활동 가능 범위는 지역 규정을 확인해 주세요.", instructor: true, curriculum: { theory: "별도 문의", pool: "별도 문의", ocean: "필수 진행", price: "별도 문의" } },
    ],
  },
  {
    id: "mermaid",
    name: "머메이드 다이빙",
    association: "PSA",
    intro: "움직임과 표현의 즐거움을 만나는 블루피스 머메이드 과정입니다.",
    courses: [
      { title: "베이직 머메이드", description: "머메이드 다이빙의 기초 움직임을 배우는 과정입니다.", unlimited: true, curriculum: { theory: "2시간", pool: "무제한", ocean: "없음", price: "35만원" } },
      { title: "머메이드", description: "기본 동작을 확장하며 물속 표현을 익히는 과정입니다.", unlimited: true, curriculum: { theory: "2시간", pool: "무제한", ocean: "없음", price: "45만원" } },
      { title: "오션 머메이드", description: "머메이드 동작을 심화하는 과정입니다.", unlimited: true, curriculum: { theory: "2시간", pool: "무제한", ocean: "없음", price: "55만원" } },
      { title: "강사 과정", subtitle: "Mermaid Instructor", description: "머메이드 교육자를 위한 과정입니다. 자격 요건과 일정은 블루피스에 문의해 주세요.", instructor: true, curriculum: { theory: "별도 문의", pool: "별도 문의", ocean: "없음", price: "별도 문의" } },
    ],
  },
  {
    id: "scuba",
    name: "스쿠버다이빙",
    association: "PSAI",
    intro: "스쿠버다이빙의 기초부터 심화 과정까지 블루피스에서 만나보세요.",
    courses: [
      { title: "오픈워터", subtitle: "Open Water", description: "스쿠버다이빙의 기본을 배우는 입문 과정입니다.", curriculum: { theory: "4시간", pool: "2회", ocean: "4회", price: "50만원" } },
      { title: "어드밴처", subtitle: "Adventure", description: "다양한 스쿠버다이빙 경험을 넓혀가는 과정입니다.", curriculum: { theory: "2시간", pool: "2회", ocean: "6회", price: "50만원" } },
      { title: "어드밴스드", subtitle: "Advanced", description: "다양한 환경에 필요한 역량을 넓혀가는 과정입니다.", curriculum: { theory: "2시간", pool: "2회", ocean: "30회", price: "60만원" } },
    ],
  },
  {
    id: "special",
    name: "스페셜 교육",
    association: "PSA",
    intro: "물속과 물 밖에서 활용할 수 있는 특별한 역량을 배워보세요.",
    courses: [
      { title: "응급처치 및 CPR 교육", description: "응급 상황에 대비한 기본 대응 역량을 배우는 과정입니다.", curriculum: { theory: "2시간", pool: "없음", ocean: "없음", price: "15만원" } },
      { title: "수중 사진 촬영 교육", description: "물속의 장면을 사진으로 담는 방법을 배우는 과정입니다.", curriculum: { theory: "2시간", pool: "2회", ocean: "희망 시 가능", price: "15만원" } },
    ],
  },
];

// 추가 프로필은 20명 이상일 때의 검색·스크롤 화면을 확인하기 위한 예시입니다.
const additionalInstructorProfiles = [
  ["서진", "성인 프리다이빙", "adult"], ["현우", "스쿠버다이빙", "scuba"],
  ["다은", "머메이드 다이빙", "mermaid"], ["시온", "유스 프리다이빙", "youth"],
  ["재민", "수중레저안전요원", "safety"], ["은별", "스페셜 교육", "special"],
  ["건우", "성인 프리다이빙", "adult"], ["지아", "머메이드 다이빙", "mermaid"],
  ["승민", "스쿠버다이빙", "scuba"], ["채원", "유스 프리다이빙", "youth"],
  ["서율", "수중레저안전요원", "safety"], ["우진", "성인 프리다이빙", "adult"],
];

const directoryInstructors = [
  ...instructors,
  ...additionalInstructorProfiles.map(([name, specialty, categoryId], index) => ({
    id: `sample-${index + 1}`,
    name,
    role: "교육강사 · 예시",
    initials: name.slice(0, 1),
    photoUrl: "",
    certifications: `${specialty} 교육 자격 (예시)`,
    experience: `${specialty} 교육 경력 (예시)`,
    specialties: [specialty],
    eligibleCategoryIds: [categoryId],
    specialCourseTitles: categoryId === "special" ? ["응급처치 및 CPR 교육", "수중 사진 촬영 교육"] : undefined,
    kakaoUrl: "https://open.kakao.com/",
    demo: true,
  })),
];

const trustStats = [
  { value: "2,000명+", label: "누적 교육생" },
  { value: "20명+", label: "소속 전문강사" },
  { value: "100%", label: "자격증 발급률" },
  { value: "무제한", label: "실습 보장" },
];

const sampleReviews = [
  {
    title: "첫 바다의 기억",
    quote: "물속에 들어가기 전엔 긴장했는데, 호흡부터 천천히 배우니 어느새 바다를 즐기고 있었어요.",
    author: "김○○",
    course: "성인 프리다이빙",
  },
  {
    title: "배움의 순간",
    quote: "작은 자세 하나가 달라졌을 뿐인데 물속 움직임이 훨씬 편해졌어요. 제 속도에 맞춰 배울 수 있어 좋았습니다.",
    author: "박○○",
    course: "유스 프리다이빙",
  },
  {
    title: "다음 도전의 시작",
    quote: "기록보다 안전과 기본을 먼저 생각하게 됐어요. 다음 바다에서는 조금 더 여유롭게 다이빙하고 싶습니다.",
    author: "이○○",
    course: "스쿠버다이빙",
  },
  {
    title: "새로운 움직임",
    quote: "물속에서 움직이는 시간이 편안하고 즐거웠어요. 처음부터 차근차근 알려주셔서 부담 없이 배웠습니다.",
    author: "정○○",
    course: "머메이드 다이빙",
  },
];

function ArrowIcon({ diagonal = false }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden="true">
      {diagonal ? <path d="M5 19 19 5M8 5h11v11" /> : <path d="M4 12h16m-7-7 7 7-7 7" />}
    </svg>
  );
}

export default function HomePage() {
  const [activeTab, setActiveTab] = useState(0);
  const [selectedInstructorId, setSelectedInstructorId] = useState(null);
  const [inquiryCourse, setInquiryCourse] = useState("");
  const [inquiryCategoryId, setInquiryCategoryId] = useState(null);
  const [inquiryCourseTitle, setInquiryCourseTitle] = useState(null);
  const [inquiryIsInstructorCourse, setInquiryIsInstructorCourse] = useState(false);
  const [instructorFilter, setInstructorFilter] = useState("all");
  const [instructorSearch, setInstructorSearch] = useState("");
  const dialogRef = useRef(null);
  const activeCategory = categories[activeTab];
  const selectedInstructor = directoryInstructors.find((instructor) => instructor.id === selectedInstructorId);
  const generalInquiryUrl = `mailto:${contactEmail}?subject=${encodeURIComponent(`블루피스 ${inquiryCourse || "교육"} 전체 문의`)}`;

  const eligibleInstructors = directoryInstructors.filter((instructor) => {
    if (!inquiryCategoryId) return true;
    if (!instructor.eligibleCategoryIds.includes(inquiryCategoryId)) return false;
    if (inquiryIsInstructorCourse && !instructor.instructorCourseCategoryIds?.includes(inquiryCategoryId)) return false;
    if (inquiryCourseTitle && instructor.eligibleCourseTitles?.[inquiryCategoryId] && !instructor.eligibleCourseTitles[inquiryCategoryId].includes(inquiryCourseTitle)) return false;
    if (inquiryCategoryId === "special" && inquiryCourseTitle && !instructor.specialCourseTitles?.includes(inquiryCourseTitle)) return false;
    return true;
  });
  const visibleInstructors = eligibleInstructors.filter((instructor) =>
    (instructorFilter === "all" || instructor.eligibleCategoryIds.includes(instructorFilter)) &&
    instructor.name.toLocaleLowerCase("ko").includes(instructorSearch.trim().toLocaleLowerCase("ko"))
  );

  function openInquiry(course = "", instructorId = null, categoryId = null, courseTitle = null, isInstructorCourse = false) {
    setInquiryCourse(course);
    setSelectedInstructorId(instructorId);
    setInquiryCategoryId(categoryId);
    setInquiryCourseTitle(courseTitle);
    setInquiryIsInstructorCourse(isInstructorCourse);
    setInstructorFilter("all");
    setInstructorSearch("");
    if (!dialogRef.current?.open) dialogRef.current?.showModal();
  }

  function handleTabKeyDown(event, index) {
    let nextIndex = index;
    if (event.key === "ArrowRight") nextIndex = (index + 1) % categories.length;
    else if (event.key === "ArrowLeft") nextIndex = (index - 1 + categories.length) % categories.length;
    else if (event.key === "Home") nextIndex = 0;
    else if (event.key === "End") nextIndex = categories.length - 1;
    else return;
    event.preventDefault();
    setActiveTab(nextIndex);
    document.getElementById(`course-tab-${categories[nextIndex].id}`)?.focus();
  }

  return (
    <main className="overflow-hidden bg-[#f5f8fa] text-[#102e40]">
      <header className="absolute inset-x-0 top-0 z-30 border-b border-white/15 text-white">
        <nav aria-label="주 메뉴" className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-5 px-6 py-5 sm:px-10 lg:px-16">
          <a href="#top" className="flex items-center gap-3 text-xl font-bold tracking-[-0.06em] sm:text-2xl">
            <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/60 text-lg font-light">~</span>
            Blue Peace<span className="text-[#76d8e8]">.</span>
          </a>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-medium sm:text-sm lg:gap-x-9">
            <a href="#courses" className="transition hover:text-[#8ce5ed]">교육 과정</a>
            <a href="#gallery" className="transition hover:text-[#8ce5ed]">갤러리</a>
            <a href="#instructors" className="transition hover:text-[#8ce5ed]">강사진 소개</a>
            <a href="#reviews" className="transition hover:text-[#8ce5ed]">수강생 후기</a>
            <button type="button" onClick={() => openInquiry()} className="hidden rounded-full border border-white/55 px-5 py-2.5 transition hover:bg-white hover:text-[#073d57] md:inline-flex">교육 문의 ↗</button>
          </div>
        </nav>
      </header>

      <section id="top" className="relative isolate flex min-h-[780px] items-center bg-[#073954] text-white sm:min-h-[850px]">
        <div
          className="absolute inset-0 -z-20 bg-cover bg-[center_36%] lg:bg-fixed"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1743656619958-68d85790bdb4?auto=format&fit=crop&w=2400&q=90')" }}
        />
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(2,24,42,.84)_0%,rgba(3,35,55,.63)_48%,rgba(3,42,62,.22)_100%)]" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-[#031b2f]/75 via-transparent to-[#031b2f]/20" />
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_80%_18%,rgba(134,231,235,.22),transparent_42%),radial-gradient(ellipse_at_22%_100%,rgba(0,121,155,.25),transparent_48%)]" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-44 bg-gradient-to-t from-[#042c43] to-transparent" />
        <div className="mx-auto w-full max-w-[1440px] px-6 pb-28 pt-48 sm:px-10 lg:px-16 lg:pt-52">
          <div className="mb-8 flex items-center gap-4 text-[11px] font-semibold uppercase tracking-[0.35em] text-[#b4e8ed] sm:text-xs">
            <span className="h-px w-10 bg-[#8adbe6]" /> Into the blue
          </div>
          <p className="mb-4 text-base font-light tracking-[0.26em] text-white/80 sm:text-lg">BLUE PEACE · FREE DIVING EXPERIENCE</p>
          <h1 className="max-w-5xl text-[clamp(3.25rem,7.2vw,7rem)] font-semibold leading-[1.09] tracking-[-0.075em]">
            바다 속에서 만나는<br />가장 완벽한 <span className="text-[#a6e7eb]">자유</span>
          </h1>
          <p className="mt-8 max-w-xl text-sm leading-8 text-white/80 sm:text-lg">
            숨을 고르는 순간, 세상은 조용해집니다. 블루피스와 함께 처음의 설렘부터 깊은 몰입까지, 당신만의 바다를 만나보세요.
          </p>
          <div className="mt-10 flex flex-wrap gap-3 sm:gap-4">
            <button type="button" onClick={() => openInquiry()} className="inline-flex min-h-14 items-center gap-8 rounded-full bg-[#b7ebf0] px-7 text-sm font-bold text-[#08384f] shadow-[0_10px_0_#58aab8,0_22px_35px_rgba(0,0,0,.28)] transition duration-200 hover:-translate-y-1 hover:shadow-[0_14px_0_#58aab8,0_26px_40px_rgba(0,0,0,.3)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">
              교육 문의하기 <ArrowIcon diagonal />
            </button>
            <a href="#courses" className="inline-flex min-h-14 items-center gap-8 rounded-full border border-white/60 bg-white/10 px-7 text-sm font-semibold text-white shadow-[0_12px_28px_rgba(0,0,0,.18)] backdrop-blur-md transition hover:-translate-y-1 hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">
              코스 둘러보기 <ArrowIcon />
            </a>
          </div>
        </div>
        <div className="absolute bottom-7 left-6 right-6 mx-auto flex max-w-[1312px] items-center justify-between border-t border-white/25 pt-5 text-[10px] font-semibold uppercase tracking-[0.28em] text-white/65 sm:left-10 sm:right-10 lg:left-16 lg:right-16">
          <span>Ocean is calling</span><span>Scroll to explore ↓</span>
        </div>
      </section>

      <section aria-label="블루피스 주요 수치 예시" className="relative z-10 bg-[#042c43] px-6 py-9 text-white sm:px-10 lg:px-16">
        <div className="mx-auto max-w-[1312px]">
          <p className="mb-5 text-[11px] font-bold uppercase tracking-[0.25em] text-[#91dbe4]">Blue Peace in numbers <span className="ml-2 rounded-full border border-white/25 px-2 py-1 normal-case tracking-normal text-white/60">예시 수치 · 확인 후 교체</span></p>
          <div className="grid grid-cols-2 gap-y-7 sm:grid-cols-4">
            {trustStats.map((stat, index) => (
              <div key={stat.label} className={`px-3 sm:px-6 ${index > 0 ? "border-l border-white/15" : ""}`}>
                <p className="text-3xl font-semibold tracking-[-0.06em] text-[#b7ebf0] sm:text-4xl">{stat.value}</p>
                <p className="mt-2 text-xs font-medium text-white/65 sm:text-sm">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-[1440px] gap-10 px-6 py-24 sm:px-10 lg:grid-cols-[1fr_1.1fr] lg:items-end lg:gap-20 lg:px-16 lg:py-32">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#087f9b]">Beyond the surface</p>
          <h2 className="mt-5 text-4xl font-semibold leading-[1.2] tracking-[-0.06em] sm:text-5xl">깊어질수록,<br />더 선명해지는 나.</h2>
        </div>
        <p className="max-w-xl text-base leading-8 text-[#587182] sm:text-lg">
          프리다이빙은 숫자로 깊이를 증명하는 일이 아닙니다. 호흡과 움직임을 알아가며, 바다 안에서 나만의 속도와 자유를 발견하는 경험입니다.
        </p>
      </section>

      <section id="courses" className="bg-[#eaf2f5] px-6 py-24 sm:px-10 lg:px-16 lg:py-32">
        <div className="mx-auto max-w-[1312px]">
          <div className="mb-10 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#087f9b]">Blue Peace programs</p>
              <h2 className="mt-4 text-4xl font-semibold tracking-[-0.06em] sm:text-5xl">교육 과정 안내</h2>
            </div>
            <p className="max-w-md text-sm leading-7 text-[#637b89]">블루피스의 6가지 교육 분야를 살펴보고, 나에게 맞는 코스를 선택해 보세요.</p>
          </div>

          <div role="tablist" aria-label="교육 분야 선택" className="grid grid-cols-2 gap-2 rounded-[1.5rem] border border-[#d9e7ec] bg-white p-2 shadow-[0_12px_35px_rgba(18,57,78,.07)] sm:grid-cols-3 lg:grid-cols-6">
            {categories.map((category, index) => (
              <button
                key={category.id}
                type="button"
                role="tab"
                id={`course-tab-${category.id}`}
                aria-controls="course-panel"
                aria-selected={activeTab === index}
                tabIndex={activeTab === index ? 0 : -1}
                onClick={() => setActiveTab(index)}
                onKeyDown={(event) => handleTabKeyDown(event, index)}
                className={`min-h-14 break-keep rounded-2xl px-3 py-3 text-center text-xs font-bold leading-5 transition sm:text-sm ${activeTab === index ? "bg-[#083b57] text-white shadow-[0_9px_20px_rgba(8,59,87,.25)]" : "text-[#456879] hover:bg-[#edf6f8] hover:text-[#083b57]"}`}
              >
                {category.name}
              </button>
            ))}
          </div>

          <div id="course-panel" role="tabpanel" aria-labelledby={`course-tab-${activeCategory.id}`} tabIndex={0} className="mt-8 outline-none">
            <div className="mb-8 flex flex-col gap-4 rounded-[1.75rem] bg-[#0b4b67] px-7 py-7 text-white shadow-[0_18px_45px_rgba(8,59,87,.14)] sm:flex-row sm:items-center sm:justify-between sm:px-9">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#8ce0e7]">Selected program</p>
                <h3 className="mt-2 text-2xl font-semibold tracking-[-0.04em] sm:text-3xl">{activeCategory.name}</h3>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-white/75">{activeCategory.intro}</p>
              </div>
              <span className="inline-flex self-start rounded-full border border-white/30 bg-white/10 px-4 py-2 text-xs font-bold text-white sm:self-center">발급 협회 · {activeCategory.association}</span>
            </div>

            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {activeCategory.courses.map((course, index) => {
                const curriculum = course.curriculum;
                const curriculumFields = [
                  { key: "theory", label: "이론 시간", symbol: "01" },
                  { key: "pool", label: "풀장 실습", symbol: "02" },
                  { key: "ocean", label: "해양 실습", symbol: "03" },
                  { key: "price", label: "총 비용", symbol: "₩" },
                ];
                return (
                  <article key={`${activeCategory.id}-${course.title}`} className={`flex h-full min-w-0 flex-col rounded-[1.75rem] border p-6 transition duration-300 hover:-translate-y-1 sm:p-8 ${course.instructor ? "border-[#c49b58] bg-[#0d4056] text-white shadow-[0_22px_55px_rgba(8,59,87,.2)]" : "border-[#d9e7ec] bg-white text-[#102e40] shadow-[0_16px_42px_rgba(18,57,78,.08)]"}`}>
                    <div className="flex h-8 items-start justify-between gap-4">
                      <span className={`rounded-full px-3 py-1.5 text-[11px] font-bold tracking-wide ${course.instructor ? "bg-[#e6bd73] text-[#15384a]" : "bg-[#e5f4f6] text-[#08728d]"}`}>발급 협회 · {activeCategory.association}</span>
                      <span className={`text-xs font-semibold ${course.instructor ? "text-[#e6bd73]" : "text-[#9ab2bc]"}`}>{String(index + 1).padStart(2, "0")}</span>
                    </div>
                    <div className="flex h-16 items-center" aria-label={course.instructor ? "강사 과정 별도 문의" : course.unlimited ? "자격증 취득할 때까지 무제한 진행" : undefined}>
                      {course.instructor && <span className="inline-flex max-w-full rounded-full border border-[#e6bd73]/60 px-3 py-1.5 text-[11px] font-extrabold leading-5 text-[#f3d396]">★ 강사 과정 · 별도 문의</span>}
                      {course.unlimited && <span className="inline-flex max-w-full rounded-full bg-[#d9f3ee] px-3 py-1.5 text-[11px] font-extrabold leading-5 text-[#086e73]">∞ 자격증 취득할 때까지 무제한 진행</span>}
                    </div>
                    <div className="min-h-20 break-keep md:min-h-28">
                      <h4 className="text-2xl font-semibold leading-tight tracking-[-0.04em] sm:text-[1.65rem]">{course.title}</h4>
                      {course.subtitle && <p className={`mt-1 text-sm font-medium ${course.instructor ? "text-[#a6d5df]" : "text-[#087f9b]"}`}>{course.subtitle}</p>}
                    </div>
                    <p className={`min-h-24 break-keep text-sm leading-7 md:min-h-36 ${course.instructor ? "text-white/75" : "text-[#5c7381]"}`}>{course.description}</p>

                    <dl className="mb-7 mt-4 grid grid-cols-2 gap-2.5">
                      {curriculumFields.map((field) => (
                        <div key={field.key} className={`flex h-[102px] min-w-0 flex-col justify-center rounded-2xl border px-3 py-3 sm:h-[108px] sm:px-4 ${course.instructor ? "border-white/15 bg-white/10" : field.key === "price" ? "border-[#b6dce4] bg-[#e3f3f6]" : "border-[#e1ebef] bg-[#f2f7f9]"}`}>
                          <dt className={`flex items-center gap-1.5 whitespace-nowrap text-[10px] font-bold leading-4 sm:text-[11px] ${course.instructor ? "text-[#d4e9ec]" : "text-[#577786]"}`}>
                            <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[9px] sm:h-6 sm:w-6 sm:text-[10px] ${course.instructor ? "bg-[#e6bd73] text-[#12384c]" : "bg-white text-[#087f9b]"}`}>{field.symbol}</span>
                            {field.label}
                          </dt>
                          <dd title={activeCategory.id === "adult" && index === 0 && (field.key === "pool" || field.key === "ocean") ? "풀장 실습 2회 또는 해양 실습 2회 중 하나를 선택합니다." : undefined} className={`mt-2 whitespace-nowrap text-[13px] font-semibold leading-5 sm:text-[15px] ${course.instructor ? "text-white" : field.key === "price" ? "text-[#075d78]" : "text-[#173c4c]"}`}>{curriculum[field.key]}</dd>
                        </div>
                      ))}
                    </dl>
                    <button type="button" onClick={() => openInquiry(`${activeCategory.name} · ${course.title}`, null, activeCategory.id, course.title, Boolean(course.instructor))} className={`mt-auto inline-flex min-h-12 items-center justify-between gap-4 rounded-full px-5 text-sm font-bold transition hover:-translate-y-0.5 ${course.instructor ? "bg-[#e6bd73] text-[#12384c] shadow-[0_8px_20px_rgba(0,0,0,.18)]" : "bg-[#0b5b77] text-white shadow-[0_8px_20px_rgba(11,91,119,.18)]"}`}>교육 문의하기 <ArrowIcon diagonal /></button>
                  </article>
                );
              })}
            </div>
            <p className="mt-7 text-xs leading-6 text-[#617e8a]">표시된 총 비용은 교육비와 발급비를 합한 금액입니다. 일정과 응시 조건은 블루피스에 문의해 주세요. 수중레저안전요원 자격과 야간 해루질 활동 가능 범위는 지역 규정, 허가 및 현장 조건을 별도로 확인해 주세요.</p>
          </div>
        </div>
      </section>

      <section id="gallery" className="bg-[#062c43] px-6 py-24 text-white sm:px-10 lg:px-16 lg:py-32">
        <div className="mx-auto grid max-w-[1312px] gap-12 lg:grid-cols-[.8fr_1.2fr] lg:items-center lg:gap-20">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#7bd7e5]">The blue moment</p>
            <h2 className="mt-5 text-4xl font-semibold leading-[1.2] tracking-[-0.06em] sm:text-5xl">말보다 오래 남는<br />바다의 순간</h2>
            <p className="mt-6 max-w-md leading-8 text-white/65">고요한 물속, 부드러운 빛, 자유로운 움직임. 블루피스가 사랑하는 바다의 장면을 만나보세요.</p>
          </div>
          <div className="relative h-[420px] overflow-hidden rounded-[2rem] bg-[#0c6a84] shadow-[0_30px_80px_rgba(0,0,0,.28)] sm:h-[500px]">
            <div className="absolute inset-0 bg-cover bg-center" role="img" aria-label="깊은 바다에서 하강하는 프리다이버" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1743656620385-5afe20b69b9d?auto=format&fit=crop&w=1600&q=85')" }} />
            <div className="absolute inset-0 bg-gradient-to-t from-[#031f35]/50 to-transparent" />
            <span className="absolute bottom-7 left-7 text-xs font-semibold uppercase tracking-[0.3em] text-white/90">Explore the silence</span>
          </div>
        </div>
      </section>

      <section id="instructors" className="px-6 py-24 sm:px-10 lg:px-16 lg:py-32">
        <div className="mx-auto max-w-[1312px]">
          <div className="mb-11 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#087f9b]">Meet our instructors</p>
              <h2 className="mt-5 break-keep text-4xl font-semibold leading-[1.2] tracking-[-0.06em] sm:text-5xl">나의 바다를 함께할 강사진</h2>
            </div>
            <p className="max-w-lg break-keep text-sm leading-7 text-[#587182] sm:text-base">블루피스의 교육 분야를 살펴보고, 상담하고 싶은 강사를 직접 선택해 주세요. 아래는 대표 프로필이며 전체 22명 목록은 문의 창에서 볼 수 있습니다. 상욱 강사를 제외한 프로필은 예시입니다.</p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {directoryInstructors.slice(0, 6).map((instructor) => (
              <article key={instructor.id} className="flex h-full min-w-0 flex-col overflow-hidden rounded-[1.75rem] border border-[#d9e7ec] bg-white shadow-[0_18px_50px_rgba(18,57,78,.09)] transition hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(18,57,78,.15)]">
                <div className="relative flex h-56 items-center justify-center overflow-hidden bg-[linear-gradient(145deg,#0d6780,#062f4b)] text-white sm:h-64">
                  {instructor.photoUrl ? (
                    <img src={instructor.photoUrl} alt={`${instructor.name} 강사 프로필`} className="h-full w-full object-cover object-[center_35%]" />
                  ) : (
                    <>
                      <div className="absolute -right-12 -top-20 h-64 w-64 rounded-full border border-white/20" />
                      <div className="absolute -right-4 -top-12 h-64 w-64 rounded-full border border-white/15" />
                      <span className="relative text-7xl font-light tracking-[-0.08em] text-white/85">{instructor.initials}</span>
                    </>
                  )}
                  {instructor.demo && <span className="absolute bottom-5 left-6 rounded-full border border-white/40 bg-[#062f4b]/55 px-3 py-1.5 text-[11px] font-semibold text-white backdrop-blur-sm">예시 프로필 · 사진 등록 예정</span>}
                </div>
                <div className="flex flex-1 flex-col p-7 sm:p-8">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#087f9b]">{instructor.role}</p>
                  <h3 className="mt-2 text-3xl font-semibold tracking-[-0.05em]">{instructor.name}</h3>
                  <div className="mt-6 space-y-4 border-t border-[#e2ebee] pt-5 text-sm leading-6">
                    <div><p className="text-xs font-bold text-[#087f9b]">보유 자격증</p><p className="mt-1 break-keep text-[#5c7381]">{instructor.certifications}</p></div>
                    <div><p className="text-xs font-bold text-[#087f9b]">주요 경력</p><p className="mt-1 break-keep text-[#5c7381]">{instructor.experience}</p></div>
                  </div>
                  <div className="mt-6 flex flex-wrap gap-2">
                    {instructor.specialties.map((specialty) => <span key={specialty} className="rounded-full bg-[#e8f4f6] px-3 py-1.5 text-xs font-semibold text-[#0b607a]">{specialty}</span>)}
                  </div>
                  <div className="mt-auto pt-8">
                    <button type="button" onClick={() => openInquiry("강사진 소개", instructor.id)} className="inline-flex min-h-12 w-full items-center justify-between gap-3 rounded-full bg-[#0b5b77] px-5 text-sm font-bold text-white shadow-[0_8px_20px_rgba(11,91,119,.18)] transition hover:-translate-y-0.5">
                      이 강사에게 문의하기 <ArrowIcon diagonal />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
          <button type="button" onClick={() => openInquiry()} className="mt-10 inline-flex min-h-12 items-center gap-4 rounded-full border border-[#8bbdca] bg-white px-6 text-sm font-bold text-[#0b5b77] transition hover:bg-[#e8f4f6]">전체 강사진 보기 <ArrowIcon /></button>
        </div>
      </section>

      <section id="reviews" className="bg-[#eaf2f5] px-6 py-24 sm:px-10 lg:px-16 lg:py-28">
        <div className="mx-auto max-w-[1312px]">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#087f9b]">Student stories</p>
            <h2 className="mt-5 text-4xl font-semibold tracking-[-0.06em] sm:text-5xl">바다를 경험한 사람들의 이야기</h2>
            <p className="mt-5 leading-8 text-[#587182]">아래 이름과 후기는 화면 구성을 위한 예시입니다. 실제 수강생의 동의를 받은 후기 원문으로 교체해 주세요.</p>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {sampleReviews.map((review) => (
              <article key={review.title} className="flex h-full flex-col rounded-[1.5rem] border border-[#dce8ec] bg-white p-7 shadow-[0_16px_45px_rgba(18,57,78,.07)]">
                <div className="flex items-center justify-between gap-3"><span className="text-lg tracking-[0.12em] text-[#d6a859]" aria-label="별점 5점 만점">★★★★★</span><span className="text-[10px] font-bold text-[#86a0aa]">예시 후기</span></div>
                <h3 className="mt-7 text-xl font-semibold">{review.title}</h3>
                <p className="mt-4 flex-1 break-keep text-sm leading-7 text-[#708892]">“{review.quote}”</p>
                <div className="mt-8 border-t border-[#e5eef0] pt-5"><p className="text-sm font-bold text-[#12384c]">{review.author}</p><p className="mt-1 text-xs font-medium text-[#087f9b]">{review.course}</p></div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="contact" className="relative overflow-hidden bg-[#06364e] px-6 py-24 text-white sm:px-10 lg:px-16 lg:py-28">
        <div className="absolute -right-20 -top-48 h-[450px] w-[450px] rounded-full border border-white/10" />
        <div className="absolute -right-10 -top-36 h-[450px] w-[450px] rounded-full border border-white/10" />
        <div className="relative mx-auto flex max-w-[1312px] flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#7bd7e5]">Your journey starts here</p>
            <h2 className="mt-5 text-4xl font-semibold leading-[1.15] tracking-[-0.06em] sm:text-6xl">당신의 바다는<br />여기서 시작됩니다.</h2>
            <p className="mt-6 text-base text-white/65">블루피스의 교육 코스와 일정을 편하게 문의해 주세요.</p>
          </div>
          <button type="button" onClick={() => openInquiry()} className="inline-flex min-h-14 items-center justify-between gap-10 self-start rounded-full bg-[#b7ebf0] px-7 text-sm font-bold text-[#08384f] shadow-[0_10px_0_#58aab8,0_22px_35px_rgba(0,0,0,.22)] transition hover:-translate-y-1 lg:self-auto">교육 문의하기 <ArrowIcon diagonal /></button>
        </div>
      </section>

      <dialog
        ref={dialogRef}
        aria-labelledby="inquiry-title"
        aria-describedby="inquiry-description"
        onClose={() => setSelectedInstructorId(null)}
        onClick={(event) => { if (event.target === event.currentTarget) dialogRef.current?.close(); }}
        className="m-auto max-h-[90dvh] w-[92vw] max-w-5xl overflow-y-auto rounded-[1.75rem] border border-[#c9dfe5] bg-[#f4f8fa] p-0 text-[#102e40] shadow-[0_35px_100px_rgba(2,24,42,.4)] backdrop:bg-[#021b2c]/75"
      >
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-[#d9e7ec] bg-[#f4f8fa]/95 px-5 py-5 backdrop-blur-md sm:px-8 sm:py-6">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#087f9b]">Blue Peace · Personal inquiry</p>
            <h2 id="inquiry-title" className="mt-2 break-keep text-2xl font-semibold tracking-[-0.05em] sm:text-3xl">강사 선택</h2>
            <p id="inquiry-description" className="mt-2 break-keep text-sm leading-6 text-[#5b7481]">원하시는 블루피스 전문 강사를 선택해 주세요.</p>
          </div>
          <button type="button" onClick={() => dialogRef.current?.close()} aria-label="강사 선택 창 닫기" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#d1e0e5] bg-white text-xl text-[#31566a] transition hover:bg-[#e7f2f5]">×</button>
        </div>

        <div className="px-5 py-6 sm:px-8 sm:py-8">
          {inquiryCourse && <p className="mb-6 inline-flex max-w-full break-keep rounded-full bg-[#e0f1f4] px-4 py-2 text-xs font-bold text-[#0b6781]">문의 과정 · {inquiryCourse}</p>}
          <div className="mb-5 border-b border-[#d9e7ec] pb-5">
            <p className="mb-3 text-xs font-bold text-[#426575]">전문 분야별 필터 <span className="font-normal text-[#8199a3]">· 선택한 코스에 맞는 강사 안에서 검색합니다</span></p>
            <div className="flex gap-2 overflow-x-auto pb-2" aria-label="강사 전문 분야 필터">
              {[{ id: "all", name: "전체" }, ...categories].map((category) => {
                const count = category.id === "all" ? eligibleInstructors.length : eligibleInstructors.filter((instructor) => instructor.eligibleCategoryIds.includes(category.id)).length;
                return <button key={category.id} type="button" aria-pressed={instructorFilter === category.id} disabled={count === 0} onClick={() => { setInstructorFilter(category.id); setSelectedInstructorId(null); }} className={`shrink-0 rounded-full border px-4 py-2 text-xs font-bold transition ${instructorFilter === category.id ? "border-[#0b5b77] bg-[#0b5b77] text-white" : "border-[#cfe1e6] bg-white text-[#527181] hover:border-[#76b8c7]"} disabled:cursor-not-allowed disabled:opacity-40`}>{category.name} <span className="ml-1 opacity-70">{count}</span></button>;
              })}
            </div>
            <label htmlFor="instructor-search" className="mt-5 block text-xs font-bold text-[#426575]">강사 이름 검색</label>
            <input id="instructor-search" type="search" value={instructorSearch} onChange={(event) => { setInstructorSearch(event.target.value); setSelectedInstructorId(null); }} placeholder="강사 이름을 입력해 주세요" className="mt-2 h-12 w-full rounded-xl border border-[#cfe1e6] bg-white px-4 text-sm text-[#15394b] outline-none transition placeholder:text-[#91a5ae] focus:border-[#0b718a] focus:ring-2 focus:ring-[#b2e2e9]" />
            <p className="mt-3 text-xs text-[#66808a]" aria-live="polite">검색 결과 {visibleInstructors.length}명 · 강사별 가능 코스는 등록 정보 기준입니다.</p>
          </div>
          <div className="max-h-[400px] overflow-y-auto overscroll-contain rounded-2xl border border-[#d9e7ec] bg-[#edf4f6] p-3 sm:p-4">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {visibleInstructors.map((instructor) => (
              <button
                key={instructor.id}
                type="button"
                aria-pressed={selectedInstructorId === instructor.id}
                onClick={() => setSelectedInstructorId(instructor.id)}
                className={`min-w-0 rounded-2xl border p-4 text-left transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#087f9b] ${selectedInstructorId === instructor.id ? "border-[#0b718a] bg-[#e6f4f6] shadow-[0_8px_25px_rgba(11,113,138,.14)]" : "border-[#d9e7ec] bg-white hover:border-[#8dc6d3]"}`}
              >
                <span className="flex items-center gap-3">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#0b5b77] text-sm font-semibold text-white">
                    {instructor.photoUrl ? <img src={instructor.photoUrl} alt="" className="h-full w-full object-cover object-[center_35%]" /> : instructor.initials}
                  </span>
                  <span className="min-w-0"><span className="block text-[11px] font-bold text-[#087f9b]">{instructor.role}</span><span className="block text-lg font-semibold">{instructor.name}</span></span>
                  <span aria-hidden="true" className={`ml-auto flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-xs ${selectedInstructorId === instructor.id ? "border-[#0b718a] bg-[#0b718a] text-white" : "border-[#a8c2ca] text-transparent"}`}>✓</span>
                </span>
                <span className="mt-4 flex flex-wrap gap-1.5">
                  {inquiryCourseTitle && <span className="rounded-full bg-[#d9f3ee] px-2.5 py-1 text-[10px] font-bold text-[#086e73]">{inquiryCourseTitle} 가능</span>}
                  {instructor.eligibleCategoryIds.map((id) => <span key={id} className="rounded-full bg-[#e4f2f5] px-2.5 py-1 text-[10px] font-bold text-[#0b607a]">{categories.find((category) => category.id === id)?.name}</span>)}
                  {instructor.instructorCourseCategoryIds?.map((id) => <span key={`instructor-${id}`} className="rounded-full bg-[#f9edcf] px-2.5 py-1 text-[10px] font-bold text-[#8b6222]">{categories.find((category) => category.id === id)?.name} 강사 과정</span>)}
                </span>
                {instructor.demo && <span className="mt-3 block text-[10px] text-[#92a3aa]">예시 프로필</span>}
              </button>
            ))}
            </div>
            {visibleInstructors.length === 0 && <p className="px-4 py-14 text-center text-sm text-[#66808a]">조건에 맞는 강사가 없습니다. 필터나 이름을 다시 확인해 주세요.</p>}
          </div>

          <div className="mt-7 rounded-2xl border border-[#d7e7eb] bg-white p-5 sm:p-6">
            <p className="text-xs font-bold text-[#087f9b]">선택한 강사</p>
            <p className="mt-2 break-keep text-sm text-[#506c7a]">{selectedInstructor ? `${selectedInstructor.role} ${selectedInstructor.name} 강사에게 상담을 요청합니다.` : "위 목록에서 상담하고 싶은 강사를 선택해 주세요."}</p>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              {selectedInstructor ? (
                <a href={selectedInstructor.kakaoUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-full bg-[#0b5b77] px-5 text-center text-sm font-bold text-white transition hover:bg-[#08465e]">이 강사에게 상담 문의하기 <ArrowIcon diagonal /></a>
              ) : (
                <button type="button" disabled className="inline-flex min-h-12 flex-1 cursor-not-allowed items-center justify-center rounded-full bg-[#c7d9df] px-5 text-sm font-bold text-[#6e8791]">강사를 먼저 선택해 주세요</button>
              )}
              <a href={generalInquiryUrl} className="inline-flex min-h-12 flex-1 items-center justify-center rounded-full border border-[#a8c9d3] bg-white px-5 text-center text-sm font-bold text-[#0b5b77] transition hover:bg-[#eaf5f7]">전체 대표 번호 / 랜덤 배정 문의</a>
            </div>
            <p className="mt-4 break-keep text-xs leading-5 text-[#78909b]">현재 강사별 링크는 카카오 오픈채팅 홈으로 연결되는 예시입니다. 대표 번호 등록 전까지 전체 문의는 예시 이메일로 연결됩니다.</p>
          </div>
        </div>
      </dialog>

      <footer className="bg-[#032b40] px-6 py-10 text-white/60 sm:px-10 lg:px-16">
        <div className="mx-auto flex max-w-[1312px] flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div><p className="text-xl font-bold tracking-[-0.05em] text-white">Blue Peace<span className="text-[#76d8e8]">.</span></p><p className="mt-3 text-xs">© {new Date().getFullYear()} Blue Peace. All rights reserved.</p></div>
          <p className="text-xs">문의: {contactEmail} <span className="text-white/35">(예시 주소)</span></p>
        </div>
      </footer>
    </main>
  );
}
