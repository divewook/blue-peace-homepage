"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";

const contactEmail = "divewook@naver.com";
const naverReviewUrl = "https://map.naver.com/p/entry/place/1768533167/review";
const heroImages = [
  "/DSC02297.jpg",
  "/DSC04128-Enhanced-NR.jpg",
  "/DSC05353-Enhanced-NR.jpg",
  "/DSC06986.jpg",
];

// 코스명은 아래 categories의 title과 정확히 일치시켜 주세요.
// 실제 사진·자격·경력·카카오 오픈채팅 주소는 확인된 정보만 등록합니다.
const instructorRecords = [
  {
    id: "kim-sanguk", name: "김상욱", role: "대표강사",
    photoUrl: "/KakaoTalk_20261014_203011.jpg",
    certifications: "AIDA / PSA / PSAI 자격 보유",
    experience: "BLUE PEACE 대표 강사",
    kakaoUrl: "https://open.kakao.com/o/sJyAtrkg",
    courses: {
      adult: ["1레벨", "2레벨", "3레벨", "4레벨", "강사 과정"],
      youth: ["1레벨", "2레벨", "3레벨", "강사 과정"],
      safety: ["수중레저안전요원", "마스터 수중레저안전요원", "수중레저안전요원 강사 과정"],
      scuba: ["오픈워터", "어드밴처", "어드밴스드"],
      special: ["응급처치 및 CPR 교육", "수중 사진 촬영 교육"],
    },
  },
  { id: "kwon-jeonghyeon", name: "권정현", courses: {
    adult: ["1레벨", "2레벨"],
    special: ["수중 사진 촬영 교육", "응급처치 및 CPR 교육"],
  } },
  { id: "kim-namyun", name: "김남윤", courses: { adult: ["1레벨", "2레벨"] } },
  { id: "kim-dayoung", name: "김다영", courses: {
    adult: ["1레벨", "2레벨", "3레벨"],
    youth: ["1레벨", "2레벨", "3레벨"],
  } },
  { id: "kim-yeji", name: "김예지", courses: { adult: ["1레벨", "2레벨"] } },
  { id: "kim-heejin", name: "김희진", courses: { adult: ["1레벨"] } },
  { id: "seo-hyobin", name: "서효빈", courses: {
    adult: ["1레벨", "2레벨", "3레벨"],
    youth: ["1레벨", "2레벨", "3레벨"],
    mermaid: ["베이직 머메이드", "머메이드", "오션 머메이드"],
    special: ["응급처치 및 CPR 교육"],
  } },
  { id: "son-juyoung", name: "손주영", courses: {
    adult: ["1레벨", "2레벨", "3레벨"],
    youth: ["1레벨", "2레벨", "3레벨"],
    mermaid: ["베이직 머메이드", "머메이드", "오션 머메이드"],
    special: ["응급처치 및 CPR 교육"],
  } },
  { id: "lee-gijun", name: "이기준", courses: {
    adult: ["1레벨", "2레벨", "3레벨"],
    special: ["응급처치 및 CPR 교육"],
  } },
  { id: "choi-wonyong", name: "최원용", courses: {
    adult: ["1레벨", "2레벨", "3레벨"],
    youth: ["1레벨", "2레벨", "3레벨"],
    special: ["응급처치 및 CPR 교육"],
  } },
  { id: "kim-inae", name: "김인애", courses: {
    adult: ["1레벨", "2레벨", "3레벨"],
    youth: ["1레벨", "2레벨", "3레벨"],
  } },
  { id: "kim-bongjun", name: "김봉준", courses: {
    adult: ["1레벨", "2레벨", "3레벨", "4레벨"],
    youth: ["1레벨", "2레벨", "3레벨"],
    safety: ["수중레저안전요원", "마스터 수중레저안전요원"],
    special: ["응급처치 및 CPR 교육"],
  } },
];

// 교육 내용 변경 시 각 코스의 curriculum 값만 수정하면 카드에 반영됩니다.
// price는 교육비와 발급비를 합한 총 비용입니다.

const categories = [
  {
    id: "adult",
    name: "프리다이빙",
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

const directoryInstructors = instructorRecords.map((record) => ({
  ...record,
  role: record.role || "교육강사",
  initials: record.name.slice(-2),
  photoUrl: record.photoUrl || "",
  certifications: record.certifications || "PSA 자격 보유",
  experience: record.experience || "BLUE PEACE 소속 강사",
  specialties: Object.keys(record.courses).map((id) => categories.find((category) => category.id === id).name),
  kakaoUrl: record.kakaoUrl || "https://open.kakao.com/",
}));

// 대표강사는 고정하고 나머지 강사만 Fisher–Yates 방식으로 섞습니다.
function shuffledInstructorIds() {
  const others = directoryInstructors.slice(1).map((instructor) => instructor.id);
  for (let index = others.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [others[index], others[randomIndex]] = [others[randomIndex], others[index]];
  }
  return [directoryInstructors[0].id, ...others];
}

const trustStats = [
  { value: "892명+", label: "누적 교육생" },
  { value: "22명", label: "소속 전문강사" },
  { value: "100%", label: "자격증 발급률" },
  { value: "무제한 진행", label: "실습 보장" },
];

// 네이버 플레이스의 공개 방문자 리뷰를 짧게 요약했습니다. 원문은 출처 링크에서 확인할 수 있습니다.
const placeReviews = [
  {
    title: "아이의 눈높이에 맞춘 수업",
    quote: "기본부터 차근차근 지도하고 아이와 소통하며 가능성을 끌어내 준 점이 좋았어요.",
    author: "유니3971",
    course: "유스 프리다이빙",
  },
  {
    title: "컨디션에 맞춘 세심한 지도",
    quote: "그날의 상태에 맞춰 수업을 이끌어 주고 핀 동작도 세심하게 교정해 주셨어요.",
    author: "cuc****",
    course: "유스 프리다이빙",
  },
  {
    title: "꼼꼼한 피드백",
    quote: "자세를 하나씩 살펴주고 어려운 부분은 함께 고민해 줬어요. 사진과 영상으로 복습할 수 있어 좋았습니다.",
    author: "hos****",
    course: "프리다이빙 수업",
  },
  {
    title: "조금씩 쌓인 자신감",
    quote: "강사님들의 단계적인 지도 덕분에 예전에는 어려웠던 10m 깊이도 한결 편안해졌어요.",
    author: "썸띵헬ㅆl",
    course: "프리다이빙",
  },
];

function ArrowIcon({ diagonal = false }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden="true">
      {diagonal ? <path d="M5 19 19 5M8 5h11v11" /> : <path d="M4 12h16m-7-7 7 7-7 7" />}
    </svg>
  );
}

function SentenceText({ children }) {
  return String(children).split(/(?<=\.)\s+(?=[가-힣])/u).map((sentence, index) => (
    <span key={index} className="block">{sentence}</span>
  ));
}

const courseTabs = [{ id: "all", name: "전체" }, ...categories];
const courseTabNames = { adult: "프리다이빙", youth: "유스 프리다이빙", safety: "수중레저안전요원(해루질)", mermaid: "머메이드 다이빙", scuba: "스쿠버다이빙", special: "스페셜 교육" };
const mobileCourseRows = [["adult", "youth", "mermaid", "safety"], ["scuba", "special"]];

function formatPhone(value) {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length > 7) return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
  if (digits.length > 3) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return digits;
}

function OverviewCard({ category, index, onSelect, mobile = false }) {
  return (
    <button type="button" onClick={() => onSelect(category.id)} className={`group flex shrink-0 snap-start items-center justify-between gap-2 rounded-2xl border border-white/15 bg-white/[.07] text-left shadow-[inset_0_1px_0_rgba(255,255,255,.1)] backdrop-blur-lg transition hover:border-[#91dee3]/60 hover:bg-white/[.12] ${mobile ? "min-h-24 w-[44vw] max-w-[190px] p-3" : "min-h-32 p-6"}`}>
      <span className="min-w-0"><span className="block text-[9px] font-bold tracking-[.14em] text-[#85cfd8] sm:text-[10px]">0{index + 1} / {category.association}</span><span className={`mt-1.5 block break-keep font-semibold tracking-tight ${mobile ? "text-sm leading-snug" : "text-xl"}`}>{category.name}</span><span className="mt-1 block text-[10px] text-white/55 sm:text-xs">{category.courses.length}개 과정</span></span>
      <span className="shrink-0 text-[#8cdde3] transition-transform group-hover:translate-x-1"><ArrowIcon /></span>
    </button>
  );
}

export default function HomePage() {
  const [activeTab, setActiveTab] = useState("all");
  const [heroIndex, setHeroIndex] = useState(0);
  const [selectedInstructorId, setSelectedInstructorId] = useState(null);
  const [inquiryCourse, setInquiryCourse] = useState("");
  const [inquiryCategoryId, setInquiryCategoryId] = useState(null);
  const [inquiryCourseTitle, setInquiryCourseTitle] = useState(null);
  const [instructorFilter, setInstructorFilter] = useState("all");
  const [instructorOrder, setInstructorOrder] = useState(() => directoryInstructors.map((instructor) => instructor.id));
  const [reservationStep, setReservationStep] = useState("select");
  const [reservation, setReservation] = useState({ name: "", phone: "", people: "1", schedule: "", message: "" });
  const [submissionText, setSubmissionText] = useState("");
  const [copySucceeded, setCopySucceeded] = useState(false);
  const dialogRef = useRef(null);
  const activeCategory = categories.find((category) => category.id === activeTab);
  const selectedInstructor = directoryInstructors.find((instructor) => instructor.id === selectedInstructorId);
  const generalInquiryUrl = `mailto:${contactEmail}?subject=${encodeURIComponent(`블루피스 ${inquiryCourse || "교육"} 전체 문의`)}`;

  const orderedInstructors = useMemo(() => instructorOrder.map((id) => directoryInstructors.find((instructor) => instructor.id === id)), [instructorOrder]);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => setHeroIndex((index) => (index + 1) % heroImages.length), 5000);
    return () => window.clearInterval(timer);
  }, []);

  const eligibleInstructors = orderedInstructors.filter((instructor) => {
    if (!inquiryCategoryId) return true;
    return instructor.courses[inquiryCategoryId]?.includes(inquiryCourseTitle) || false;
  });
  const visibleInstructors = eligibleInstructors.filter((instructor) =>
    instructorFilter === "all" || Boolean(instructor.courses[instructorFilter])
  );

  function openInquiry(course = "", instructorId = null, categoryId = null, courseTitle = null) {
    setInstructorOrder(shuffledInstructorIds());
    setInquiryCourse(course);
    setSelectedInstructorId(instructorId);
    setInquiryCategoryId(categoryId);
    setInquiryCourseTitle(courseTitle);
    setInstructorFilter("all");
    setReservationStep("select");
    setReservation({ name: "", phone: "", people: "1", schedule: "", message: "" });
    setSubmissionText("");
    setCopySucceeded(false);
    if (!dialogRef.current?.open) dialogRef.current?.showModal();
  }

  function updateReservation(field, value) {
    setReservation((current) => ({ ...current, [field]: field === "phone" ? formatPhone(value) : value }));
  }

  async function submitReservation(event) {
    event.preventDefault();
    if (!selectedInstructor) return;
    const text = [
      "[블루피스 교육 상담 예약]",
      `담당 강사: ${selectedInstructor.role} ${selectedInstructor.name}`,
      `문의 과정: ${inquiryCourse || "상담 후 결정"}`,
      `성함: ${reservation.name.trim()}`,
      `연락처: ${reservation.phone.trim()}`,
      `인원: ${reservation.people}명`,
      `수업 희망 일정: ${reservation.schedule.trim()}`,
      `기타 문의사항: ${reservation.message.trim() || "없음"}`,
    ].join("\n");
    setSubmissionText(text);
    try {
      if (!navigator.clipboard?.writeText) throw new Error("Clipboard unavailable");
      await navigator.clipboard.writeText(text);
      setCopySucceeded(true);
    } catch {
      setCopySucceeded(false);
    }
    setReservationStep("confirm");
  }

  function handleTabKeyDown(event, index) {
    let nextIndex = index;
    if (event.key === "ArrowRight") nextIndex = (index + 1) % courseTabs.length;
    else if (event.key === "ArrowLeft") nextIndex = (index - 1 + courseTabs.length) % courseTabs.length;
    else if (event.key === "Home") nextIndex = 0;
    else if (event.key === "End") nextIndex = courseTabs.length - 1;
    else return;
    event.preventDefault();
    setActiveTab(courseTabs[nextIndex].id);
    document.getElementById(`course-tab-${courseTabs[nextIndex].id}`)?.focus();
  }

  return (
    <main className="overflow-hidden bg-[#061f32] text-white">
      <style jsx global>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } } .no-scrollbar { scrollbar-width: none; } .no-scrollbar::-webkit-scrollbar { display: none; }`}</style>
      <header className="absolute inset-x-0 top-0 z-30 border-b border-white/15 text-white">
        <nav aria-label="주 메뉴" className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-5 px-6 py-5 sm:px-10 lg:px-16">
          <a href="#top" className="flex items-center gap-3 text-xl font-bold tracking-[-0.06em] sm:text-2xl">
            <Image src="/화이트 로고.png" alt="" width={36} height={36} className="h-9 w-9 shrink-0 object-contain" />
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

      <section id="top" className="relative isolate flex min-h-[640px] items-center bg-[#031827] text-white sm:min-h-[760px]">
        {heroImages.map((src, index) => (
          <div key={src} className={`absolute inset-0 -z-20 transition-opacity duration-[1800ms] ease-in-out motion-reduce:transition-none ${heroIndex === index ? "opacity-100" : "opacity-0"}`} aria-hidden="true">
            <Image src={src} alt="" fill priority={index === 0} sizes="100vw" quality={85} className="object-cover object-center" />
          </div>
        ))}
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(1,15,27,.90)_0%,rgba(2,27,45,.68)_48%,rgba(3,42,62,.25)_100%)]" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-[#031b2f]/75 via-transparent to-[#031b2f]/20" />
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_80%_18%,rgba(134,231,235,.22),transparent_42%),radial-gradient(ellipse_at_22%_100%,rgba(0,121,155,.25),transparent_48%)]" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-44 bg-gradient-to-t from-[#042c43] to-transparent" />
        <div className="mx-auto w-full max-w-[1440px] px-6 pb-20 pt-40 sm:px-10 sm:pb-28 lg:px-16 lg:pt-52">
          <div className="mb-8 flex items-center gap-4 text-[11px] font-semibold uppercase tracking-[0.35em] text-[#b4e8ed] sm:text-xs">
            <span className="h-px w-10 bg-[#8adbe6]" /> Into the blue
          </div>
          <p className="mb-4 text-base font-light tracking-[0.26em] text-white/80 sm:text-lg">BLUE PEACE · FREE DIVING EXPERIENCE</p>
          <h1 className="max-w-5xl break-keep text-[clamp(2.5rem,7.2vw,7rem)] font-semibold leading-[1.09] tracking-[-0.075em] sm:text-[clamp(3.25rem,7.2vw,7rem)]">
            바다 속에서 만나는<br />가장 완벽한 <span className="text-[#a6e7eb]">자유</span>
          </h1>
          <p className="mt-6 max-w-xl break-keep text-sm leading-relaxed text-white/80 sm:mt-8 sm:text-lg"><SentenceText>숨을 고르는 순간, 세상은 조용해집니다. 블루피스와 함께 처음의 설렘부터 깊은 몰입까지, 당신만의 바다를 만나보세요.</SentenceText></p>
          <div className="mt-8 flex flex-wrap gap-3 sm:mt-10 sm:gap-4">
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

      <section aria-label="블루피스 주요 수치" className="relative z-10 bg-[#031e30] px-6 py-7 text-white sm:px-10 sm:py-9 lg:px-16">
        <div className="mx-auto max-w-[1312px]">
          <p className="mb-5 text-[11px] font-bold uppercase tracking-[0.25em] text-[#91dbe4]">Blue Peace in numbers</p>
          <div className="grid grid-cols-2 gap-y-4 sm:grid-cols-4 sm:gap-y-7">
            {trustStats.map((stat, index) => (
              <div key={stat.label} className={`px-3 sm:px-6 ${index > 0 ? "border-l border-white/15" : ""}`}>
                <p className={`break-keep font-semibold tracking-[-0.06em] text-[#b7ebf0] sm:text-4xl ${index === 3 ? "text-[1.35rem]" : "text-2xl"}`}>{stat.value}</p>
                <p className="mt-2 text-xs font-medium text-white/65 sm:text-sm">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="courses" className="bg-[#061f32] px-5 py-10 text-white sm:px-10 sm:py-20 lg:px-16 lg:py-24">
        <div className="mx-auto max-w-[1312px]">
          <div className="mb-6 flex flex-col gap-3 sm:mb-9 sm:flex-row sm:items-end sm:justify-between sm:gap-5">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#7ad7df]">Blue Peace programs</p>
              <h2 className="mt-2 text-3xl font-semibold tracking-[-0.06em] sm:mt-4 sm:text-5xl">교육 과정 안내</h2>
            </div>
            <p className="max-w-md break-keep text-sm leading-relaxed text-white/65">블루피스의 6가지 교육 분야를 살펴보고, 나에게 맞는 코스를 선택해 보세요.</p>
          </div>

          <div role="tablist" aria-label="교육 분야 선택" className="grid grid-cols-3 gap-2 rounded-2xl border border-white/15 bg-white/[.06] p-2 shadow-[inset_0_1px_0_rgba(255,255,255,.12)] backdrop-blur-xl sm:grid-cols-4 lg:grid-cols-7">
            {courseTabs.map((category, index) => (
              <button
                key={category.id}
                type="button"
                role="tab"
                id={`course-tab-${category.id}`}
                aria-controls="course-panel"
                aria-selected={activeTab === category.id}
                tabIndex={activeTab === category.id ? 0 : -1}
                onClick={() => setActiveTab(category.id)}
                onKeyDown={(event) => handleTabKeyDown(event, index)}
                className={`min-h-12 min-w-0 break-keep rounded-xl px-2 py-2.5 text-center text-[11px] font-semibold leading-snug transition-colors duration-300 sm:px-3 sm:text-xs xl:text-sm ${activeTab === category.id ? "bg-[#b4e8e8] text-[#042739] shadow-[0_6px_20px_rgba(87,217,225,.2)]" : "text-white/70 hover:bg-white/10 hover:text-white"}`}
              >
                {courseTabNames[category.id] || category.name}
              </button>
            ))}
          </div>

          <div id="course-panel" key={activeTab} role="tabpanel" aria-labelledby={`course-tab-${activeTab}`} tabIndex={0} className="mt-5 animate-[fadeIn_.35s_ease-out] outline-none motion-reduce:animate-none sm:mt-7">
            {activeTab === "all" ? (
              <>
                <div className="space-y-2.5 sm:hidden">
                  {mobileCourseRows.map((row, rowIndex) => (
                    <div key={rowIndex} className="no-scrollbar -mx-5 flex snap-x snap-mandatory gap-2.5 overflow-x-auto px-5 pb-1">
                      {row.map((id) => {
                        const category = categories.find((item) => item.id === id);
                        return <OverviewCard key={id} category={category} index={categories.findIndex((item) => item.id === id)} onSelect={setActiveTab} mobile />;
                      })}
                    </div>
                  ))}
                </div>
                <div className="hidden gap-4 sm:grid sm:grid-cols-2 lg:grid-cols-3">
                  {categories.map((category, index) => <OverviewCard key={category.id} category={category} index={index} onSelect={setActiveTab} />)}
                </div>
              </>
            ) : <>
            <div className="mb-4 flex flex-col gap-3 rounded-2xl border border-white/15 bg-white/[.07] px-5 py-5 shadow-[inset_0_1px_0_rgba(255,255,255,.1)] backdrop-blur-xl sm:mb-6 sm:flex-row sm:items-center sm:justify-between sm:px-7">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#8ce0e7]">Selected program</p>
                <h3 className="mt-1 text-xl font-semibold tracking-[-0.04em] sm:text-3xl">{activeCategory.name}</h3>
                <p className="mt-1 max-w-2xl break-keep text-xs leading-relaxed text-white/70 sm:text-sm"><SentenceText>{activeCategory.intro}</SentenceText></p>
              </div>
              <span className="inline-flex self-start rounded-full border border-white/25 bg-white/10 px-3 py-1.5 text-[11px] font-bold text-white sm:self-center">발급 협회 · {activeCategory.association}</span>
            </div>

            <div className="no-scrollbar -mx-5 flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-3 md:mx-0 md:grid md:grid-cols-2 md:overflow-visible md:px-0 xl:grid-cols-3">
              {activeCategory.courses.map((course, index) => {
                const curriculum = course.curriculum;
                const curriculumFields = [
                  { key: "theory", label: "이론 시간", symbol: "01" },
                  { key: "pool", label: "풀장 실습", symbol: "02" },
                  { key: "ocean", label: "해양 실습", symbol: "03" },
                  { key: "price", label: "총 비용", symbol: "₩" },
                ];
                return (
                  <article key={`${activeCategory.id}-${course.title}`} className={`flex h-full w-[84vw] max-w-[360px] shrink-0 snap-center flex-col rounded-2xl border p-4 shadow-[inset_0_1px_0_rgba(255,255,255,.13),0_14px_36px_rgba(0,0,0,.13)] backdrop-blur-xl transition duration-300 hover:-translate-y-1 sm:p-6 md:w-auto md:max-w-none ${course.instructor ? "border-[#d8b777]/65 bg-[linear-gradient(145deg,rgba(119,94,50,.22),rgba(255,255,255,.06))]" : "border-white/15 bg-white/[.07]"}`}>
                    <div className="flex h-6 items-start justify-between gap-4">
                      <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold tracking-wide ${course.instructor ? "bg-[#e6bd73] text-[#15384a]" : "bg-[#b4e8e8]/15 text-[#aee4e8]"}`}>발급 협회 · {activeCategory.association}</span>
                      <span className="text-xs font-semibold text-white/35">{String(index + 1).padStart(2, "0")}</span>
                    </div>
                    <div className="flex h-10 items-center sm:h-12" aria-label={course.instructor ? "강사 과정 별도 문의" : course.unlimited ? "자격증 취득할 때까지 무제한 진행" : undefined}>
                      {course.instructor && <span className="inline-flex max-w-full rounded-full border border-[#e6bd73]/60 px-3 py-1.5 text-[11px] font-extrabold leading-5 text-[#f3d396]">★ 강사 과정 · 별도 문의</span>}
                      {course.unlimited && <span className="inline-flex max-w-full rounded-full bg-[#b4e8e8]/15 px-3 py-1.5 text-[11px] font-extrabold leading-5 text-[#aee4e8]">∞ 자격증 취득할 때까지 무제한 진행</span>}
                    </div>
                    <div className="min-h-14 break-keep sm:min-h-20">
                      <h4 className="text-xl font-semibold leading-tight tracking-[-0.04em] sm:text-2xl">{course.title}</h4>
                      {course.subtitle && <p className="mt-0.5 text-xs font-medium text-[#9ed8de] sm:text-sm">{course.subtitle}</p>}
                    </div>
                    <p className="min-h-12 break-keep text-xs leading-relaxed text-white/70 sm:min-h-16 sm:text-sm"><SentenceText>{course.description}</SentenceText></p>

                    <dl className="mb-4 mt-3 grid grid-cols-2 gap-2 sm:mb-5 sm:mt-4">
                      {curriculumFields.map((field) => (
                        <div key={field.key} className={`flex h-[68px] min-w-0 flex-col justify-center rounded-xl border px-2.5 py-2 sm:h-[76px] sm:px-3 ${field.key === "price" ? "border-[#9ed8de]/35 bg-[#9ed8de]/15" : "border-white/10 bg-white/[.055]"}`}>
                          <dt className="flex items-center gap-1 whitespace-nowrap text-[10px] font-bold leading-4 text-white/55 sm:text-[11px]">
                            <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[8px] ${course.instructor ? "bg-[#e6bd73] text-[#12384c]" : "bg-white/10 text-[#9ed8de]"}`}>{field.symbol}</span>
                            {field.label}
                          </dt>
                          <dd title={activeCategory.id === "adult" && index === 0 && (field.key === "pool" || field.key === "ocean") ? "풀장 실습 2회 또는 해양 실습 2회 중 하나를 선택합니다." : undefined} className={`mt-1 whitespace-nowrap text-[12px] font-semibold leading-5 sm:text-[14px] ${field.key === "price" ? "text-[#b6eeee]" : "text-white"}`}>{curriculum[field.key]}</dd>
                        </div>
                      ))}
                    </dl>
                    <button type="button" onClick={() => openInquiry(`${activeCategory.name} · ${course.title}`, null, activeCategory.id, course.title)} className={`mt-auto inline-flex min-h-11 items-center justify-between gap-4 rounded-xl px-4 text-xs font-bold transition hover:-translate-y-0.5 sm:text-sm ${course.instructor ? "bg-[#e6bd73] text-[#12384c]" : "bg-[#aee4e8] text-[#062b3d]"}`}>교육 문의하기 <ArrowIcon diagonal /></button>
                  </article>
                );
              })}
            </div>
            <p className="mt-5 break-keep text-xs leading-relaxed text-white/50"><SentenceText>표시된 총 비용은 교육비와 발급비를 합한 금액입니다. 일정과 응시 조건은 블루피스에 문의해 주세요. 수중레저안전요원 자격과 야간 해루질 활동 가능 범위는 지역 규정, 허가 및 현장 조건을 별도로 확인해 주세요.</SentenceText></p>
            </>}
          </div>
        </div>
      </section>

      <section id="gallery" className="bg-[#09273b] px-6 py-10 text-white sm:px-10 sm:py-20 lg:px-16 lg:py-24">
        <div className="mx-auto grid max-w-[1312px] gap-5 lg:grid-cols-[.8fr_1.2fr] lg:items-center lg:gap-16">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#7bd7e5]">The blue moment</p>
            <h2 className="mt-2 text-3xl font-semibold leading-tight tracking-[-0.06em] sm:mt-5 sm:text-5xl">말보다 오래 남는<br />바다의 순간</h2>
            <p className="mt-4 max-w-md break-keep text-sm leading-relaxed text-white/75 sm:mt-6 sm:text-lg">고요한 물속, 부드러운 빛, 자유로운 움직임.</p>
            <p className="mt-1 max-w-md break-keep text-sm leading-relaxed text-white/75 sm:mt-3 sm:text-lg">블루피스가 사랑하는 바다의 장면을 만나보세요.</p>
          </div>
          <div className="relative mx-auto aspect-[2/3] w-full max-w-[240px] overflow-hidden rounded-2xl bg-[#0c6a84] shadow-[0_25px_60px_rgba(0,0,0,.26)] sm:max-w-[360px] lg:max-w-[400px]">
            <Image src="/DSC02240.jpg" alt="햇살이 들어오는 물속에서 다이빙하는 블루피스의 장면" fill sizes="(min-width: 1024px) 460px, 90vw" className="object-contain" />
          </div>
        </div>
      </section>

      <section id="instructors" className="bg-[#061f32] px-6 py-10 sm:px-10 sm:py-20 lg:px-16 lg:py-24">
        <div className="mx-auto max-w-[1312px]">
          <div className="mb-5 flex flex-col gap-2 sm:mb-10 lg:flex-row lg:items-end lg:justify-between lg:gap-5">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#7ad7df]">Meet our instructors</p>
              <h2 className="mt-2 break-keep text-3xl font-semibold leading-tight tracking-[-0.06em] sm:mt-5 sm:text-5xl">나의 바다를 함께할 강사진</h2>
            </div>
            <p className="max-w-lg break-keep text-xs leading-relaxed text-white/60 sm:text-base"><SentenceText>BLUE PEACE 대표강사 김상욱을 소개합니다. 전체 강사진과 각 강사의 문의 가능 코스는 강사 선택 창에서 확인해 주세요.</SentenceText></p>
          </div>
          <div className="mx-auto max-w-4xl">
            {[directoryInstructors[0]].map((instructor) => (
              <article key={instructor.id} className="flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border border-white/15 bg-white/[.06] shadow-[inset_0_1px_0_rgba(255,255,255,.13),0_20px_50px_rgba(0,0,0,.2)] backdrop-blur-xl transition hover:border-white/25 md:flex-row">
                <div className="relative mx-auto mt-4 flex h-44 w-44 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-[linear-gradient(145deg,#0d6780,#062f4b)] text-white sm:mt-6 sm:h-64 sm:w-64 md:m-0 md:h-[360px] md:w-[360px] md:self-start md:rounded-none">
                  {instructor.photoUrl ? (
                    <Image src={instructor.photoUrl} alt={`${instructor.name} 강사 프로필`} fill sizes="(min-width: 768px) 360px, 90vw" className="object-cover object-[center_35%]" />
                  ) : (
                    <>
                      <div className="absolute -right-12 -top-20 h-64 w-64 rounded-full border border-white/20" />
                      <div className="absolute -right-4 -top-12 h-64 w-64 rounded-full border border-white/15" />
                      <span className="relative text-7xl font-light tracking-[-0.08em] text-white/85">{instructor.initials}</span>
                    </>
                  )}
                  {!instructor.photoUrl && <span className="absolute bottom-5 left-6 rounded-full border border-white/40 bg-[#062f4b]/55 px-3 py-1.5 text-[11px] font-semibold text-white backdrop-blur-sm">사진 등록 예정</span>}
                </div>
                <div className="flex flex-1 flex-col p-5 sm:p-8">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#8adddf]">{instructor.role}</p>
                  <h3 className="mt-1 text-2xl font-semibold tracking-[-0.05em] sm:mt-2 sm:text-3xl">{instructor.name}</h3>
                  <div className="mt-3 border-t border-white/15 pt-3 text-sm leading-relaxed sm:mt-6 sm:pt-5">
                    <p className="text-xs font-bold text-[#8adddf]">소속 및 자격</p>
                    <p className="mt-1 break-keep text-white/65">{instructor.experience} · {instructor.certifications}</p>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1.5 sm:mt-6 sm:gap-2">
                    {instructor.specialties.map((specialty) => <span key={specialty} className="rounded-full border border-white/15 bg-white/[.08] px-2.5 py-1 text-[11px] font-semibold text-[#bce8e8] sm:px-3 sm:py-1.5 sm:text-xs">{specialty}</span>)}
                  </div>
                  <div className="mt-auto pt-4 sm:pt-8">
                    <button type="button" onClick={() => openInquiry()} className="inline-flex min-h-11 w-full items-center justify-between gap-3 rounded-xl bg-[#aee4e8] px-4 text-xs font-bold text-[#062b3d] transition hover:bg-white sm:min-h-12 sm:px-5 sm:text-sm">
                      전체 강사진 및 문의 가능 코스 보기 <ArrowIcon diagonal />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="reviews" className="bg-[#09283d] px-6 py-10 sm:px-10 sm:py-20 lg:px-16 lg:py-24">
        <div className="mx-auto max-w-[1312px]">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#7ad7df]">Naver Place reviews</p>
            <h2 className="mt-2 break-keep text-3xl font-semibold tracking-[-0.06em] sm:mt-5 sm:text-5xl">네이버 플레이스에서 남긴 이야기</h2>
            <p className="mt-3 break-keep text-xs leading-relaxed text-white/60 sm:mt-5 sm:text-base"><SentenceText>블루피스 네이버 플레이스에 공개된 방문자 후기의 핵심 내용을 짧게 요약했습니다. 원문은 네이버 플레이스에서 확인할 수 있습니다.</SentenceText></p>
          </div>
          <div className="no-scrollbar -mx-6 mt-5 flex snap-x snap-mandatory gap-3 overflow-x-auto px-6 pb-3 sm:mx-0 sm:mt-10 sm:grid sm:grid-cols-2 sm:gap-5 sm:overflow-visible sm:px-0 xl:grid-cols-4">
            {placeReviews.map((review) => (
              <article key={review.title} className="flex w-[82vw] max-w-[310px] shrink-0 snap-center flex-col rounded-2xl border border-white/15 bg-white/[.07] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,.12),0_14px_36px_rgba(0,0,0,.14)] backdrop-blur-xl sm:h-full sm:w-auto sm:max-w-none sm:p-7">
                <div className="flex items-center justify-between gap-3"><span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[#03c75a] text-lg font-black text-white" aria-hidden="true">N</span><span className="text-[10px] font-bold text-white/50">방문자 리뷰 요약</span></div>
                <h3 className="mt-4 text-lg font-semibold sm:mt-7 sm:text-xl">{review.title}</h3>
                <p className="mt-2 flex-1 break-keep text-xs leading-relaxed text-white/70 sm:mt-4 sm:text-sm"><SentenceText>{review.quote}</SentenceText></p>
                <div className="mt-5 border-t border-white/15 pt-3 sm:mt-8 sm:pt-5"><p className="text-sm font-bold text-white">{review.author}</p><p className="mt-1 text-xs font-medium text-[#8adddf]">{review.course}</p></div>
              </article>
            ))}
          </div>
          <a href={naverReviewUrl} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex min-h-11 items-center gap-4 rounded-xl border border-white/25 bg-white/[.08] px-4 text-xs font-bold text-white backdrop-blur-lg transition hover:bg-white/15 sm:mt-9 sm:min-h-12 sm:px-6 sm:text-sm">네이버 플레이스 실시간 리뷰 보기 <ArrowIcon diagonal /></a>
        </div>
      </section>

      <section id="contact" className="relative overflow-hidden bg-[#051b2d] px-6 py-10 text-white sm:px-10 sm:py-20 lg:px-16 lg:py-24">
        <div className="absolute -right-20 -top-48 h-[450px] w-[450px] rounded-full border border-white/10" />
        <div className="absolute -right-10 -top-36 h-[450px] w-[450px] rounded-full border border-white/10" />
        <div className="relative mx-auto flex max-w-[1312px] flex-col gap-6 lg:flex-row lg:items-end lg:justify-between lg:gap-10">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#7bd7e5]">Your journey starts here</p>
            <h2 className="mt-2 text-3xl font-semibold leading-tight tracking-[-0.06em] sm:mt-5 sm:text-6xl">당신의 바다는<br />여기서 시작됩니다.</h2>
            <p className="mt-3 text-sm leading-relaxed text-white/65 sm:mt-6 sm:text-base">블루피스의 교육 코스와 일정을 편하게 문의해 주세요.</p>
          </div>
          <button type="button" onClick={() => openInquiry()} className="inline-flex min-h-14 items-center justify-between gap-10 self-start rounded-full bg-[#b7ebf0] px-7 text-sm font-bold text-[#08384f] shadow-[0_10px_0_#58aab8,0_22px_35px_rgba(0,0,0,.22)] transition hover:-translate-y-1 lg:self-auto">교육 문의하기 <ArrowIcon diagonal /></button>
        </div>
      </section>

      <dialog
        ref={dialogRef}
        aria-labelledby="inquiry-title"
        aria-describedby="inquiry-description"
        onClose={() => { setSelectedInstructorId(null); setReservationStep("select"); }}
        onClick={(event) => { if (event.target === event.currentTarget) dialogRef.current?.close(); }}
        className="fixed inset-0 m-auto h-[90dvh] max-h-[800px] w-[94vw] max-w-5xl overflow-hidden rounded-2xl border border-[#c9dfe5] bg-[#f4f8fa] p-0 text-[#102e40] shadow-[0_35px_100px_rgba(2,24,42,.4)] backdrop:bg-[#021b2c]/75 [&[open]]:flex [&[open]]:flex-col"
      >
        <div className="z-10 flex shrink-0 items-start justify-between gap-4 border-b border-[#d9e7ec] bg-[#f4f8fa]/95 px-5 py-4 backdrop-blur-md sm:px-8 sm:py-6">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#087f9b]">Blue Peace · Personal inquiry</p>
            <h2 id="inquiry-title" className="mt-1 break-keep text-2xl font-semibold tracking-[-0.05em] sm:mt-2 sm:text-3xl">{reservationStep === "select" ? "강사 선택" : reservationStep === "form" ? "상담 예약 양식" : "상담 양식 확인"}</h2>
            <p id="inquiry-description" className="mt-1 break-keep text-xs leading-relaxed text-[#5b7481] sm:mt-2 sm:text-sm">{reservationStep === "select" ? "원하시는 블루피스 전문 강사를 선택해 주세요." : reservationStep === "form" ? "필요한 내용을 적으면 상담 문구가 자동으로 정리됩니다." : "오픈채팅으로 메시지를 보내면 상담 신청이 전달됩니다."}</p>
          </div>
          <button type="button" onClick={() => dialogRef.current?.close()} aria-label="강사 선택 창 닫기" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#d1e0e5] bg-white text-xl text-[#31566a] transition hover:bg-[#e7f2f5]">×</button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-5 sm:px-8 sm:py-7">
          {inquiryCourse && <p className="mb-4 inline-flex max-w-full break-keep rounded-full bg-[#e0f1f4] px-4 py-2 text-xs font-bold text-[#0b6781]">문의 과정 · {inquiryCourse}</p>}
          {reservationStep === "select" && <>
          <div className="mb-5 border-b border-[#d9e7ec] pb-5">
            <p className="mb-3 text-xs font-bold text-[#426575]">전문 분야별 필터</p>
            <select aria-label="강사 전문 분야 선택" value={instructorFilter} onChange={(event) => { setInstructorFilter(event.target.value); setSelectedInstructorId(null); }} className="h-12 w-full rounded-xl border border-[#cfe1e6] bg-white px-4 text-sm font-semibold text-[#15394b] outline-none focus:border-[#0b718a] focus:ring-2 focus:ring-[#b2e2e9] md:hidden">
              {[{ id: "all", name: "전체" }, ...categories].map((category) => {
                const count = category.id === "all" ? eligibleInstructors.length : eligibleInstructors.filter((instructor) => Boolean(instructor.courses[category.id])).length;
                return <option key={category.id} value={category.id} disabled={count === 0}>{category.name} ({count}명)</option>;
              })}
            </select>
            <div className="hidden gap-2 overflow-x-auto pb-2 md:flex" aria-label="강사 전문 분야 필터">
              {[{ id: "all", name: "전체" }, ...categories].map((category) => {
                const count = category.id === "all" ? eligibleInstructors.length : eligibleInstructors.filter((instructor) => Boolean(instructor.courses[category.id])).length;
                return <button key={category.id} type="button" aria-pressed={instructorFilter === category.id} disabled={count === 0} onClick={() => { setInstructorFilter(category.id); setSelectedInstructorId(null); }} className={`shrink-0 whitespace-nowrap rounded-full border px-4 py-2 text-xs font-bold transition ${instructorFilter === category.id ? "border-[#0b5b77] bg-[#0b5b77] text-white" : "border-[#cfe1e6] bg-white text-[#527181] hover:border-[#76b8c7]"} disabled:cursor-not-allowed disabled:opacity-40`}>{category.name} <span className="ml-1 opacity-70">({count}명)</span></button>;
              })}
            </div>
            <p className="no-scrollbar mt-3 overflow-x-auto whitespace-nowrap rounded-lg bg-[#e0f1f4] px-3 py-2 text-xs font-semibold text-[#0b607a]" aria-live="polite">💡 선택하신 [{inquiryCourse || (instructorFilter === "all" ? "전체 교육" : categories.find((category) => category.id === instructorFilter)?.name)}] 과정을 진행할 수 있는 전문 강사 총 {visibleInstructors.length}명</p>
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
                <span className="mt-3 block break-keep text-[11px] leading-5 text-[#66808a]">{instructor.experience} · {instructor.certifications}</span>
                <span className="mt-4 flex flex-wrap gap-1.5">
                  {inquiryCourseTitle && <span className="rounded-full bg-[#d9f3ee] px-2.5 py-1 text-[10px] font-bold text-[#086e73]">{inquiryCourseTitle} 가능</span>}
                  {Object.keys(instructor.courses).map((id) => <span key={id} className="rounded-full bg-[#e4f2f5] px-2.5 py-1 text-[10px] font-bold text-[#0b607a]">{categories.find((category) => category.id === id)?.name}</span>)}
                  {Object.entries(instructor.courses).filter(([, titles]) => titles.some((title) => title.includes("강사 과정"))).map(([id]) => <span key={`instructor-${id}`} className="rounded-full bg-[#f9edcf] px-2.5 py-1 text-[10px] font-bold text-[#8b6222]">{categories.find((category) => category.id === id)?.name} 강사 과정</span>)}
                </span>
              </button>
            ))}
            </div>
            {visibleInstructors.length === 0 && <p className="px-4 py-14 text-center text-sm text-[#66808a]">{eligibleInstructors.length === 0 ? "현재 이 과정의 담당 강사가 등록되지 않았습니다. 전체 문의를 이용해 주세요." : "조건에 맞는 강사가 없습니다. 필터나 이름을 다시 확인해 주세요."}</p>}
          </div>

          </>}
          {reservationStep === "form" && selectedInstructor && (
            <form id="consultation-form" onSubmit={submitReservation} className="mx-auto max-w-2xl space-y-4">
              <div className="rounded-xl border border-[#bddde4] bg-[#e8f4f6] p-4 text-sm text-[#28586b]">담당 강사 <strong className="ml-2 text-[#093e58]">{selectedInstructor.role} {selectedInstructor.name}</strong></div>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block text-sm font-semibold text-[#31586a]">성함 <span className="text-[#b75353]">*</span><input name="name" type="text" autoComplete="name" required maxLength={40} value={reservation.name} onChange={(event) => updateReservation("name", event.target.value)} placeholder="성함을 입력해 주세요" className="mt-2 h-12 w-full rounded-xl border border-[#cfe1e6] bg-white px-4 font-normal outline-none focus:border-[#0b718a] focus:ring-2 focus:ring-[#b2e2e9]" /></label>
                <label className="block text-sm font-semibold text-[#31586a]">연락처 <span className="text-[#b75353]">*</span><input name="phone" type="tel" inputMode="numeric" autoComplete="tel" required pattern="[0-9]{3}-[0-9]{4}-[0-9]{4}" maxLength={13} value={reservation.phone} onChange={(event) => updateReservation("phone", event.target.value)} placeholder="010-0000-0000" title="휴대전화 번호 11자리를 입력해 주세요" className="mt-2 h-12 w-full rounded-xl border border-[#cfe1e6] bg-white px-4 font-normal outline-none focus:border-[#0b718a] focus:ring-2 focus:ring-[#b2e2e9]" /></label>
                <label className="block text-sm font-semibold text-[#31586a]">인원 <span className="text-[#b75353]">*</span><input name="people" type="number" min="1" max="99" required value={reservation.people} onChange={(event) => updateReservation("people", event.target.value)} className="mt-2 h-12 w-full rounded-xl border border-[#cfe1e6] bg-white px-4 font-normal outline-none focus:border-[#0b718a] focus:ring-2 focus:ring-[#b2e2e9]" /></label>
                <label className="block text-sm font-semibold text-[#31586a]">수업 희망 일정 <span className="text-[#b75353]">*</span><input name="schedule" type="date" required value={reservation.schedule} onChange={(event) => updateReservation("schedule", event.target.value)} className="mt-2 h-12 w-full rounded-xl border border-[#cfe1e6] bg-white px-4 font-normal text-[#15394b] outline-none focus:border-[#0b718a] focus:ring-2 focus:ring-[#b2e2e9]" /></label>
              </div>
              <label className="block text-sm font-semibold text-[#31586a]">기타 문의사항<textarea name="message" rows={4} maxLength={1000} value={reservation.message} onChange={(event) => updateReservation("message", event.target.value)} placeholder="궁금한 점을 편하게 적어 주세요" className="mt-2 w-full resize-y rounded-xl border border-[#cfe1e6] bg-white px-4 py-3 font-normal outline-none focus:border-[#0b718a] focus:ring-2 focus:ring-[#b2e2e9]" /></label>
              <p className="break-keep text-xs leading-relaxed text-[#6a8793]">입력 내용은 이 기기에서 상담 문구로 정리됩니다. 접수하기를 누르면 복사 안내가 먼저 나타납니다. 이후 오픈채팅방으로 이동해 내용을 직접 보내야 상담이 전달됩니다.</p>
            </form>
          )}
        </div>
        <div className="z-10 shrink-0 border-t border-[#d9e7ec] bg-[#f4f8fa]/95 px-5 py-3 shadow-[0_-10px_30px_rgba(6,44,67,.08)] backdrop-blur-md sm:px-8 sm:py-4">
          {reservationStep === "select" && <>
            <p className="mb-2 truncate text-xs font-medium text-[#426575]">{selectedInstructor ? `선택한 강사 · ${selectedInstructor.role} ${selectedInstructor.name}` : "상담할 강사를 선택해 주세요"}</p>
            <div className="flex flex-col gap-2 sm:flex-row">
              <button type="button" disabled={!selectedInstructor} onClick={() => setReservationStep("form")} className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-[#0b5b77] px-4 text-center text-sm font-bold text-white transition hover:bg-[#08465e] disabled:cursor-not-allowed disabled:bg-[#c7d9df] disabled:text-[#6e8791]">{selectedInstructor ? "이 강사에게 상담 문의하기" : "강사를 먼저 선택해 주세요"} <ArrowIcon diagonal /></button>
              <a href={generalInquiryUrl} className="inline-flex min-h-11 flex-1 items-center justify-center rounded-xl border border-[#a8c9d3] bg-white px-4 text-center text-xs font-bold text-[#0b5b77] transition hover:bg-[#eaf5f7] sm:min-h-12 sm:text-sm">전체 문의 / 강사 배정 요청</a>
            </div>
          </>}
          {reservationStep === "form" && <div className="flex gap-2"><button type="button" onClick={() => setReservationStep("select")} className="min-h-12 rounded-xl border border-[#a8c9d3] bg-white px-4 text-sm font-bold text-[#0b5b77]">이전</button><button type="submit" form="consultation-form" className="min-h-12 flex-1 rounded-xl bg-[#0b5b77] px-5 text-sm font-bold text-white transition hover:bg-[#08465e]">접수하기</button></div>}
        </div>
        {reservationStep === "confirm" && (
          <div role="dialog" aria-modal="true" aria-labelledby="confirmation-title" className="absolute inset-0 z-30 flex items-center justify-center overflow-y-auto bg-[#031c2c]/85 p-4 backdrop-blur-sm sm:p-8">
            <div className="my-auto w-full max-w-lg rounded-2xl border border-[#add9e0] bg-[#f7fbfc] p-6 shadow-[0_25px_70px_rgba(0,0,0,.32)] sm:p-8">
              <p className="text-[11px] font-bold uppercase tracking-[.2em] text-[#0b718a]">Blue Peace · Final check</p>
              <h3 id="confirmation-title" className="mt-3 break-keep text-2xl font-semibold leading-tight text-[#102e40]">{copySucceeded ? "📋 상담 양식이 복사되었습니다" : "📋 상담 양식을 확인해 주세요"}</h3>
              {copySucceeded ? (
                <div className="mt-5 space-y-3 break-keep text-sm leading-relaxed text-[#4f6e7d]">
                  <p>작성하신 상담 신청 양식이 클립보드에 자동 복사되었습니다.</p>
                  <p>아래 [오픈채팅방 이동] 버튼을 누르신 후, 열리는 카카오톡 채팅창에 &lsquo;붙여넣기(Ctrl+V 또는 꾹 눌러 붙여넣기)&rsquo;하여 메시지를 보내주세요.</p>
                  <p>담당 강사님이 내용을 확인하는 대로 빠르고 친절하게 안내해 드립니다.</p>
                </div>
              ) : (
                <div className="mt-5 space-y-3 text-sm leading-relaxed text-[#4f6e7d]"><p>브라우저에서 자동 복사를 허용하지 않았습니다. 아래 내용을 직접 복사한 뒤 오픈채팅방에 붙여넣어 주세요.</p><textarea aria-label="상담 내용 복사본" readOnly value={submissionText} rows={6} onFocus={(event) => event.target.select()} className="w-full rounded-xl border border-[#cfe1e6] bg-white p-3 text-xs" /></div>
              )}
              <div className="mt-6 flex flex-col gap-2 sm:flex-row">
                {!copySucceeded && <button type="button" onClick={async () => { try { await navigator.clipboard.writeText(submissionText); setCopySucceeded(true); } catch { setCopySucceeded(false); } }} className="min-h-12 rounded-xl border border-[#a8c9d3] bg-white px-4 text-sm font-bold text-[#0b5b77]">다시 복사</button>}
                <a href={selectedInstructor?.kakaoUrl || "https://open.kakao.com/"} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-12 flex-1 items-center justify-center rounded-xl bg-[#0b5b77] px-5 text-center text-sm font-bold text-white transition hover:bg-[#08465e]">오픈채팅방으로 이동하기 ↗</a>
                <button type="button" onClick={() => setReservationStep("form")} className="min-h-12 rounded-xl border border-[#a8c9d3] bg-white px-4 text-sm font-bold text-[#0b5b77]">양식 수정</button>
              </div>
            </div>
          </div>
        )}
      </dialog>

      <footer className="bg-[#032b40] px-6 py-10 text-white/60 sm:px-10 lg:px-16">
        <div className="mx-auto flex max-w-[1312px] flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div><p className="text-xl font-bold tracking-[-0.05em] text-white">Blue Peace<span className="text-[#76d8e8]">.</span></p><p className="mt-3 text-xs">© {new Date().getFullYear()} Blue Peace. All rights reserved.</p></div>
          <p className="text-xs">문의: <a href={`mailto:${contactEmail}`} className="underline decoration-white/30 underline-offset-4 hover:text-white">{contactEmail}</a></p>
        </div>
      </footer>
    </main>
  );
}
