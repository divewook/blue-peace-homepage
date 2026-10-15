"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";

const contactEmail = "divewook@naver.com";
const contactPhone = "010-9897-8990";
const centerAddress = "경상북도 칠곡군 북삼읍 인강1길 38-12, 1층";
const centerMapEmbedUrl = `https://maps.google.com/maps?q=${encodeURIComponent("경상북도 칠곡군 북삼읍 인강1길 38-12")}&z=17&hl=ko&output=embed`;
const centerMapLink = "https://map.naver.com/p/entry/place/1768533167";
const phoneNotice = "💡 강습 중에는 통화 연결이 어려울 수 있습니다. 연결이 안 될 경우 문자를 남겨주시면 수업 직후 빠르게 확인하여 연락드리겠습니다.";
const instagramUrl = "https://www.instagram.com/bluepeace_diving/";
const business = { name: "블루피스", owner: "김상욱", registration: "460-44-01113" };
const naverReviewUrl = "https://map.naver.com/p/entry/place/1768533167?placePath=%2Freview";
const heroImages = [
  "/DSC02297.jpg",
  "/DSC04128-Enhanced-NR.jpg",
  "/DSC05353-Enhanced-NR.jpg",
  "/DSC06986.jpg",
];
const galleryImages = [
  "DSC00377.jpg", "DSC00606-2.jpg", "DSC01193.jpg", "DSC01428-Enhanced-NR.jpg",
  "DSC01783-Enhanced-NR.jpg", "DSC01925-Enhanced-NR.jpg", "DSC01936.jpg",
  "DSC02031.jpg", "DSC02125-Enhanced-NR.jpg", "DSC02294.jpg",
  "DSC02924-Enhanced-NR.jpg", "DSC03811-Enhanced-NR.jpg", "DSC04002-Enhanced-NR.jpg",
  "DSC04183-Enhanced-NR.jpg", "DSC04188-Enhanced-NR.jpg", "DSC05155-Enhanced-NR.jpg",
  "DSC05737-Enhanced-NR.jpg", "DSC06743.jpg", "DSC07168-Enhanced-NR.jpg",
  "DSC07628.jpg",
].map((filename, index) => ({ src: `/${filename}`, alt: `블루피스 수중 작품 ${index + 1}` }));

const portraitGallerySources = new Set([
  "/DSC01193.jpg", "/DSC01428-Enhanced-NR.jpg", "/DSC01936.jpg",
  "/DSC02031.jpg", "/DSC02125-Enhanced-NR.jpg", "/DSC05737-Enhanced-NR.jpg",
]);

function shuffleItems(items) {
  const shuffled = [...items];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[index]];
  }
  return shuffled;
}

function shuffleGallery(images) {
  const portraits = shuffleItems(images.filter((photo) => portraitGallerySources.has(photo.src)));
  const landscapes = shuffleItems(images.filter((photo) => !portraitGallerySources.has(photo.src)));
  return [portraits[0], ...landscapes.slice(0, 5), ...shuffleItems([...portraits.slice(1), ...landscapes.slice(5)])];
}

const initialGallery = (() => {
  const portrait = galleryImages.find((photo) => portraitGallerySources.has(photo.src));
  const landscapes = galleryImages.filter((photo) => !portraitGallerySources.has(photo.src));
  const featured = [portrait, ...landscapes.slice(0, 5)];
  return [...featured, ...galleryImages.filter((photo) => !featured.includes(photo))];
})();
const faqs = [
  { question: "수영을 못해도 가능한가요?", answer: "가능합니다. 수영 실력보다 물에 적응하는 과정부터 천천히 진행합니다." },
  { question: "물 공포가 있어도 괜찮나요?", answer: "괜찮습니다. 강사가 옆에서 단계별로 안내하며 편안하게 적응할 수 있도록 도와드립니다." },
  { question: "준비물은 무엇인가요?", answer: "수영복 또는 래시가드, 수건, 개인 샤워도구를 준비해주세요." },
  { question: "교육 시간은 얼마나 걸리나요?", answer: "과정별로 다르며, 체험 과정은 약 3시간 기준으로 진행됩니다." },
  { question: "사진과 영상도 받을 수 있나요?", answer: "네. 수업 중 촬영한 사진과 영상은 선별 및 보정 후 전달해드립니다." },
  { question: "추가 비용이 있나요?", answer: "풀장 입장료, 장비 렌탈료는 별도입니다." },
  { question: "자격증은 어디서 발급되나요?", answer: "AIDA · PSA 국제 자격증 발급이 가능하며, 과정과 목표에 맞춰 안내해드립니다." },
  { question: "자격증 취득까지 얼마나 걸리나요?", answer: "개인별 습득 속도에 따라 다릅니다. 자격 취득 전까지 무제한 트레이닝을 지원합니다." },
  { question: "혼자 신청해도 괜찮나요?", answer: "물론입니다. 혼자 오셔도 편하게 수업받을 수 있고, 이후 트레이닝과 커뮤니티도 함께할 수 있습니다." },
  { question: "교육 장소는 어디인가요?", answer: "이론 수업은 블루피스 센터(경상북도 칠곡군 북삼읍 인강1길 38-12, 1층)에서, 풀장 실습은 패스나인 등 일정에 맞는 풀장에서 진행됩니다." },
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

function GalleryTile({ photo, onOpen, className = "", sizes = "(min-width: 1024px) 50vw, 50vw" }) {
  return (
    <button
      type="button"
      onClick={() => onOpen(photo)}
      aria-label={`${photo.alt} 확대 보기`}
      className={`group relative block h-full w-full overflow-hidden rounded-xl bg-[#d9e5e1] text-left shadow-[0_14px_30px_rgba(20,51,62,.08)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4c8d88] ${className}`}
    >
      <Image src={photo.src} alt={photo.alt} fill sizes={sizes} className="object-cover transition-transform duration-700 group-hover:scale-105" />
      <span aria-hidden="true" className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/55 to-transparent px-4 pb-3 pt-8 text-xs font-medium text-white/90 opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">원본 보기 ↗</span>
    </button>
  );
}

function SentenceText({ children }) {
  return String(children).split(/(?<=\.)\s+(?=\S)/u).map((sentence, index) => (
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
    <button type="button" onClick={() => onSelect(category.id)} className={`group flex shrink-0 snap-start items-end justify-between gap-3 overflow-hidden border border-[#d9dfdc] bg-white text-left text-[#142c36] shadow-[0_12px_35px_rgba(21,49,55,.05)] transition hover:-translate-y-1 hover:border-[#6eaaa4] hover:shadow-[0_20px_45px_rgba(21,49,55,.1)] ${mobile ? "min-h-28 w-[44vw] max-w-[190px] rounded-2xl p-3.5" : "min-h-44 rounded-[1.5rem] p-6"} ${!mobile && index % 3 === 1 ? "lg:translate-y-6" : ""}`}>
      <span className="min-w-0"><span className="block text-[9px] font-bold tracking-[.14em] text-[#4c8d88] sm:text-[10px]">0{index + 1} / {category.association}</span><span className={`mt-3 block break-keep font-semibold tracking-tight ${mobile ? "text-sm leading-snug" : "text-xl"}`}>{category.name}</span><span className="mt-2 block text-[10px] text-[#6a7d7e] sm:text-xs">{category.courses.length}개 과정</span></span>
      <span className="shrink-0 text-[#4c8d88] transition-transform group-hover:translate-x-1"><ArrowIcon /></span>
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
  const [openFaq, setOpenFaq] = useState(null);
  const [shuffledGallery, setShuffledGallery] = useState(initialGallery);
  const [showAllGallery, setShowAllGallery] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const dialogRef = useRef(null);
  const lightboxRef = useRef(null);
  const activeCategory = categories.find((category) => category.id === activeTab);
  const selectedInstructor = directoryInstructors.find((instructor) => instructor.id === selectedInstructorId);
  const generalInquiryUrl = `mailto:${contactEmail}?subject=${encodeURIComponent(`블루피스 ${inquiryCourse || "교육"} 전체 문의`)}`;
  const previewGallery = shuffledGallery.slice(0, 6);

  const orderedInstructors = useMemo(() => instructorOrder.map((id) => directoryInstructors.find((instructor) => instructor.id === id)), [instructorOrder]);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => setHeroIndex((index) => (index + 1) % heroImages.length), 5000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    setShuffledGallery(shuffleGallery(galleryImages));
  }, []);

  function openLightbox(photo) {
    setSelectedPhoto(photo);
    if (!lightboxRef.current?.open) lightboxRef.current?.showModal();
  }

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
    <main className="overflow-hidden bg-[#f5f3ec] text-[#142c36]">
      <style jsx global>{`html { scroll-behavior: smooth; } @media (prefers-reduced-motion: reduce) { html { scroll-behavior: auto; } } @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } } .no-scrollbar { scrollbar-width: none; } .no-scrollbar::-webkit-scrollbar { display: none; }`}</style>
      <header className="relative z-30 border-b border-[#dfe3de] bg-[#f5f3ec] text-[#142c36]">
        <nav aria-label="주 메뉴" className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-3 px-5 py-4 sm:px-10 lg:px-16">
          <a href="#top" className="flex items-center gap-2.5 text-xl font-bold tracking-[-0.06em] sm:text-2xl">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#14333e]"><Image src="/화이트 로고.png" alt="" width={28} height={28} className="h-7 w-7 shrink-0 object-contain" /></span>
            <span className="flex flex-col leading-none">Blue Peace<span className="mt-1 hidden text-[9px] font-medium tracking-[.08em] text-[#60777a] sm:block">대구·경북 최대 다이빙 전문 센터</span></span><span className="text-[#69a8a0]">.</span>
          </a>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] font-medium sm:gap-x-6 sm:text-sm lg:gap-x-8">
            <a href="#courses" className="transition hover:text-[#4c8d88]">교육과정</a>
            <a href="#instructors" className="transition hover:text-[#4c8d88]">강사진</a>
            <a href="#reviews" className="transition hover:text-[#4c8d88]">후기</a>
            <a href="#faq" className="transition hover:text-[#4c8d88]">FAQ</a>
            <a href="#contact" className="rounded-full bg-[#14333e] px-3 py-2 text-white transition hover:bg-[#326a70] sm:px-5 sm:py-2.5">교육문의 ↗</a>
          </div>
        </nav>
      </header>

      <section id="top" className="bg-[#f5f3ec] px-5 pb-8 pt-7 sm:px-10 sm:pb-14 sm:pt-12 lg:px-16">
        <div className="mx-auto grid max-w-[1440px] items-stretch gap-8 lg:min-h-[650px] lg:grid-cols-[.92fr_1.08fr] lg:gap-0">
          <div className="relative z-10 flex flex-col justify-center py-5 lg:py-16 lg:pr-10">
            <p className="mb-5 break-keep text-[11px] font-semibold tracking-[0.13em] text-[#688080] sm:text-sm">대구·경북 최대 다이빙 전문 센터</p>
            <h1 className="max-w-[720px] break-keep text-[clamp(2.1rem,3.8vw,4.4rem)] font-semibold leading-[1.3] tracking-[-0.065em]">
              <span className="block">블루피스와 함께 처음의 설렘부터 깊은 몰입까지,</span>
              <span className="mt-3 block text-[#4c8d88]">당신만의 바다를 만나보세요.</span>
            </h1>
            <div className="mt-9 flex flex-wrap gap-3">
              <button type="button" onClick={() => openInquiry()} className="inline-flex min-h-13 items-center gap-8 rounded-full bg-[#14333e] px-6 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(20,51,62,.14)] transition hover:-translate-y-0.5 hover:bg-[#326a70] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#4c8d88]">교육 문의하기 <ArrowIcon diagonal /></button>
              <a href="#courses" className="inline-flex min-h-13 items-center gap-6 rounded-full border border-[#b7c7c3] px-6 text-sm font-semibold text-[#14333e] transition hover:border-[#4c8d88] hover:bg-white">코스 둘러보기 <ArrowIcon /></a>
            </div>
          </div>
          <div className="relative isolate min-h-[360px] overflow-hidden rounded-[1.25rem] bg-[#0b3445] shadow-[0_30px_70px_rgba(18,49,61,.13)] sm:min-h-[520px] lg:min-h-[650px] lg:rounded-[1.5rem]">
            {heroImages.map((src, index) => <div key={src} className={`absolute inset-0 -z-10 transition-opacity duration-[1800ms] ease-in-out motion-reduce:transition-none ${heroIndex === index ? "opacity-100" : "opacity-0"}`} aria-hidden="true"><Image src={src} alt="" fill priority={index === 0} sizes="(min-width: 1024px) 55vw, 100vw" quality={85} className="object-cover" /></div>)}
            <div className="absolute inset-0 bg-gradient-to-t from-[#062735]/60 via-transparent to-transparent" />
            <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between border-t border-white/50 pt-4 text-white sm:bottom-8 sm:left-8 sm:right-8">
              <span className="text-[10px] font-semibold tracking-[.15em]">블루피스와 함께하는 바다</span>
              <span className="font-serif text-lg italic">0{heroIndex + 1} / 04</span>
            </div>
          </div>
        </div>
      </section>

      <section aria-label="블루피스 주요 수치" className="border-y border-[#e3e7e1] bg-white px-5 py-8 sm:px-10 sm:py-10 lg:px-16">
        <div className="mx-auto max-w-[1312px] lg:grid lg:grid-cols-[220px_1fr] lg:items-center">
          <p className="mb-5 text-[11px] font-bold uppercase tracking-[0.25em] text-[#4c8d88] lg:mb-0">Blue Peace<br />in numbers</p>
          <div className="grid grid-cols-2 gap-y-6 sm:grid-cols-4">
            {trustStats.map((stat, index) => (
              <div key={stat.label} className={`border-l border-[#d9e3df] px-4 sm:px-6`}>
                <p className={`break-keep font-semibold tracking-[-0.06em] text-[#14333e] sm:text-4xl ${index === 3 ? "text-[1.35rem]" : "text-2xl"}`}>{stat.value}</p>
                <p className="mt-2 text-xs font-medium text-[#60777a] sm:text-sm">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="courses" className="bg-[#f5f3ec] px-5 py-12 text-[#142c36] sm:px-10 sm:py-20 lg:px-16 lg:py-28">
        <div className="mx-auto max-w-[1312px]">
          <div className="mb-6 flex flex-col gap-3 sm:mb-9 sm:flex-row sm:items-end sm:justify-between sm:gap-5">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#4c8d88]">Blue Peace programs</p>
              <h2 className="mt-2 text-3xl font-semibold tracking-[-0.06em] sm:mt-4 sm:text-5xl">교육 과정 안내</h2>
            </div>
            <p className="max-w-md break-keep text-sm leading-[1.9] text-[#60777a]">블루피스의 6가지 교육 분야를 살펴보고, 나에게 맞는 코스를 선택해 보세요.</p>
          </div>

          <div role="tablist" aria-label="교육 분야 선택" className="grid grid-cols-3 gap-1 border-y border-[#cfdbd6] py-3 sm:grid-cols-4 lg:grid-cols-7">
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
                className={`min-h-12 min-w-0 break-keep rounded-full px-2 py-2.5 text-center text-[11px] font-semibold leading-snug transition-colors duration-300 sm:px-3 sm:text-xs xl:text-sm ${activeTab === category.id ? "bg-[#14333e] text-white" : "text-[#526b70] hover:bg-white hover:text-[#14333e]"}`}
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
                <div className="hidden gap-4 pb-6 sm:grid sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
                  {categories.map((category, index) => <OverviewCard key={category.id} category={category} index={index} onSelect={setActiveTab} />)}
                </div>
              </>
            ) : <>
            <div className="mb-4 flex flex-col gap-3 border-b border-[#d4dfda] px-1 pb-5 sm:mb-6 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#4c8d88]">Selected program</p>
                <h3 className="mt-1 text-xl font-semibold tracking-[-0.04em] sm:text-3xl">{activeCategory.name}</h3>
                <p className="mt-2 max-w-2xl break-keep text-xs leading-[1.8] text-[#60777a] sm:text-sm"><SentenceText>{activeCategory.intro}</SentenceText></p>
              </div>
              <span className="inline-flex self-start rounded-full border border-[#bad2cc] bg-white px-3 py-1.5 text-[11px] font-bold text-[#416f6e] sm:self-center">발급 협회 · {activeCategory.association}</span>
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
                  <article key={`${activeCategory.id}-${course.title}`} className={`flex h-full w-[84vw] max-w-[360px] shrink-0 snap-center flex-col rounded-[1.4rem] border p-4 text-[#142c36] shadow-[0_14px_42px_rgba(19,51,62,.06)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_55px_rgba(19,51,62,.11)] sm:p-6 md:w-auto md:max-w-none ${course.instructor ? "border-[#c6ae83] bg-[#f7f0e3]" : "border-[#d9e3df] bg-white"}`}>
                    <div className="flex h-6 items-start justify-between gap-4">
                      <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold tracking-wide ${course.instructor ? "bg-[#d7bd8c] text-[#3e392e]" : "bg-[#e9f2ee] text-[#3e7775]"}`}>발급 협회 · {activeCategory.association}</span>
                      <span className="text-xs font-semibold text-[#9aaba9]">{String(index + 1).padStart(2, "0")}</span>
                    </div>
                    <div className="flex h-10 items-center sm:h-12" aria-label={course.instructor ? "강사 과정 별도 문의" : course.unlimited ? "자격증 취득할 때까지 무제한 진행" : undefined}>
                      {course.instructor && <span className="inline-flex max-w-full rounded-full border border-[#c6ae83] px-3 py-1.5 text-[11px] font-extrabold leading-5 text-[#8a682e]">★ 강사 과정 · 별도 문의</span>}
                      {course.unlimited && <span className="inline-flex max-w-full rounded-full bg-[#e4f0eb] px-3 py-1.5 text-[11px] font-extrabold leading-5 text-[#30716b]">∞ 자격증 취득할 때까지 무제한 진행</span>}
                    </div>
                    <div className="min-h-14 break-keep sm:min-h-20">
                      <h4 className="text-xl font-semibold leading-tight tracking-[-0.04em] sm:text-2xl">{course.title}</h4>
                      {course.subtitle && <p className="mt-0.5 text-xs font-medium text-[#4d8884] sm:text-sm">{course.subtitle}</p>}
                    </div>
                    <p className="min-h-12 break-keep text-xs leading-[1.8] text-[#60777a] sm:min-h-16 sm:text-sm"><SentenceText>{course.description}</SentenceText></p>

                    <dl className="mb-4 mt-3 grid grid-cols-2 gap-2 sm:mb-5 sm:mt-4">
                      {curriculumFields.map((field) => (
                        <div key={field.key} className={`flex h-[68px] min-w-0 flex-col justify-center rounded-xl border px-2.5 py-2 sm:h-[76px] sm:px-3 ${field.key === "price" ? "border-[#c3dad3] bg-[#e9f2ee]" : "border-[#e6ebe6] bg-[#f8f9f6]"}`}>
                          <dt className="flex items-center gap-1 whitespace-nowrap text-[10px] font-bold leading-4 text-[#698080] sm:text-[11px]">
                            <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[8px] ${course.instructor ? "bg-[#d7bd8c] text-[#3e392e]" : "bg-[#deeeea] text-[#36736d]"}`}>{field.symbol}</span>
                            {field.label}
                          </dt>
                          <dd title={activeCategory.id === "adult" && index === 0 && (field.key === "pool" || field.key === "ocean") ? "풀장 실습 2회 또는 해양 실습 2회 중 하나를 선택합니다." : undefined} className={`mt-1 whitespace-nowrap text-[12px] font-semibold leading-5 sm:text-[14px] ${field.key === "price" ? "text-[#276b65]" : "text-[#18343e]"}`}>{curriculum[field.key]}</dd>
                        </div>
                      ))}
                    </dl>
                    <button type="button" onClick={() => openInquiry(`${activeCategory.name} · ${course.title}`, null, activeCategory.id, course.title)} className={`mt-auto inline-flex min-h-11 items-center justify-between gap-4 rounded-xl px-4 text-xs font-bold transition hover:-translate-y-0.5 sm:text-sm ${course.instructor ? "bg-[#d7bd8c] text-[#283329]" : "bg-[#14333e] text-white"}`}>교육 문의하기 <ArrowIcon diagonal /></button>
                  </article>
                );
              })}
            </div>
            <p className="mt-5 break-keep text-xs leading-[1.8] text-[#697f80]"><SentenceText>표시된 총 비용은 교육비와 발급비를 합한 금액입니다. 일정과 응시 조건은 블루피스에 문의해 주세요. 수중레저안전요원 자격과 야간 해루질 활동 가능 범위는 지역 규정, 허가 및 현장 조건을 별도로 확인해 주세요.</SentenceText></p>
            </>}
          </div>
        </div>
      </section>

      <section id="gallery" className="bg-white px-5 py-12 text-[#142c36] sm:px-10 sm:py-20 lg:px-16 lg:py-28">
        <div className="mx-auto max-w-[1312px]">
          <div className="mb-7 grid gap-4 border-t border-[#cbdad5] pt-5 sm:mb-10 lg:grid-cols-[1fr_.7fr] lg:items-end">
            <div><p className="text-xs font-bold uppercase tracking-[0.3em] text-[#4c8d88]">The blue moment / 02</p><h2 className="mt-3 text-3xl font-semibold leading-tight tracking-[-0.06em] sm:text-5xl">말보다 오래 남는<br />바다의 순간</h2></div>
            <div><p className="max-w-md break-keep text-sm leading-[1.9] text-[#60777a] sm:text-base">고요한 물속, 부드러운 빛, 자유로운 움직임.</p><p className="mt-1 max-w-md break-keep text-sm leading-[1.9] text-[#60777a] sm:text-base">블루피스가 사랑하는 바다의 장면을 만나보세요.</p></div>
          </div>
          <div className="space-y-2.5 sm:space-y-4">
            <div className="grid h-[300px] grid-cols-2 grid-rows-2 gap-2.5 sm:h-[520px] sm:gap-4">
              <GalleryTile photo={previewGallery[0]} onOpen={openLightbox} className="row-span-2" />
              <GalleryTile photo={previewGallery[1]} onOpen={openLightbox} />
              <GalleryTile photo={previewGallery[2]} onOpen={openLightbox} />
            </div>
            <div className="grid h-[130px] grid-cols-2 gap-2.5 sm:h-[240px] sm:gap-4">
              <GalleryTile photo={previewGallery[3]} onOpen={openLightbox} />
              <GalleryTile photo={previewGallery[4]} onOpen={openLightbox} />
            </div>
            <div className="h-[130px] sm:h-[240px]">
              <GalleryTile photo={previewGallery[5]} onOpen={openLightbox} sizes="100vw" />
            </div>
          </div>
          {showAllGallery && (
            <div className="mt-2.5 grid auto-rows-[130px] grid-cols-2 gap-2.5 sm:mt-4 sm:auto-rows-[210px] sm:gap-4 lg:grid-cols-4">
              {shuffledGallery.slice(6).map((photo, index) => <GalleryTile key={photo.src} photo={photo} onOpen={openLightbox} className={index >= 12 ? "lg:col-span-2" : ""} sizes="(min-width: 1024px) 25vw, 50vw" />)}
            </div>
          )}
          <div className="mt-6 flex justify-center sm:mt-8">
            <button type="button" onClick={() => setShowAllGallery((current) => !current)} aria-expanded={showAllGallery} className="inline-flex min-h-12 items-center justify-center rounded-full border border-[#b8cbc5] px-6 text-sm font-semibold text-[#14333e] transition hover:border-[#4c8d88] hover:bg-[#f0f5f1] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4c8d88]">
              {showAllGallery ? "수중 작품 접기" : `블루피스 수중 작품 더보기 (+${galleryImages.length - previewGallery.length}장)`}
            </button>
          </div>
        </div>
      </section>

      <dialog
        ref={lightboxRef}
        aria-label="수중 작품 확대 보기"
        onClose={() => setSelectedPhoto(null)}
        onClick={(event) => { if (event.target === event.currentTarget) lightboxRef.current?.close(); }}
        className="fixed inset-0 m-0 h-dvh max-h-none w-screen max-w-none border-0 bg-black/95 p-4 text-white backdrop:bg-black/90 sm:p-8 [&[open]]:flex [&[open]]:items-center [&[open]]:justify-center"
      >
        <button type="button" onClick={() => lightboxRef.current?.close()} aria-label="수중 작품 닫기" className="absolute right-4 top-4 z-10 flex h-12 w-12 items-center justify-center rounded-full border border-white/40 bg-black/55 text-3xl leading-none text-white transition hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:right-8 sm:top-8">×</button>
        {selectedPhoto && <img src={selectedPhoto.src} alt={selectedPhoto.alt} className="pointer-events-none block max-h-[calc(100dvh-2rem)] max-w-full object-contain sm:max-h-[calc(100dvh-4rem)]" />}
      </dialog>

      <section id="instructors" className="bg-[#f5f3ec] px-5 py-12 text-[#142c36] sm:px-10 sm:py-20 lg:px-16 lg:py-28">
        <div className="mx-auto max-w-[1312px]">
          <div className="mb-5 flex flex-col gap-2 sm:mb-10 lg:flex-row lg:items-end lg:justify-between lg:gap-5">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#4c8d88]">Meet our instructors / 03</p>
              <h2 className="mt-2 break-keep text-3xl font-semibold leading-tight tracking-[-0.06em] sm:mt-5 sm:text-5xl">나의 바다를 함께할 강사진</h2>
            </div>
            <p className="max-w-lg break-keep text-xs leading-[1.9] text-[#60777a] sm:text-base"><SentenceText>BLUE PEACE 대표강사 김상욱을 소개합니다. 전체 강사진과 각 강사의 문의 가능 코스는 강사 선택 창에서 확인해 주세요.</SentenceText></p>
          </div>
          <div className="ml-auto max-w-5xl">
            {[directoryInstructors[0]].map((instructor) => (
              <article key={instructor.id} className="flex h-full min-w-0 flex-col overflow-hidden rounded-[1.5rem] border border-[#dfe6df] bg-white shadow-[0_22px_65px_rgba(20,51,62,.08)] md:flex-row">
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
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#4c8d88]">{instructor.role}</p>
                  <h3 className="mt-1 text-2xl font-semibold tracking-[-0.05em] sm:mt-2 sm:text-3xl">{instructor.name}</h3>
                  <div className="mt-3 border-t border-[#dfe6df] pt-3 text-sm leading-relaxed sm:mt-6 sm:pt-5">
                    <p className="text-xs font-bold text-[#4c8d88]">소속 및 자격</p>
                    <p className="mt-1 break-keep text-[#60777a]">{instructor.experience} · {instructor.certifications}</p>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1.5 sm:mt-6 sm:gap-2">
                    {instructor.specialties.map((specialty) => <span key={specialty} className="rounded-full border border-[#cbdcd6] bg-[#f2f7f3] px-2.5 py-1 text-[11px] font-semibold text-[#416f6e] sm:px-3 sm:py-1.5 sm:text-xs">{specialty}</span>)}
                  </div>
                  <div className="mt-auto pt-4 sm:pt-8">
                    <button type="button" onClick={() => openInquiry()} className="inline-flex min-h-11 w-full items-center justify-between gap-3 rounded-xl bg-[#14333e] px-4 text-xs font-bold text-white transition hover:bg-[#326a70] sm:min-h-12 sm:px-5 sm:text-sm">
                      전체 강사진 및 문의 가능 코스 보기 <ArrowIcon diagonal />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="faq" className="bg-white px-5 py-12 text-[#142c36] sm:px-10 sm:py-20 lg:px-16 lg:py-28">
        <div className="mx-auto grid max-w-[1312px] gap-8 lg:grid-cols-[.7fr_1.3fr] lg:gap-16">
          <div className="lg:sticky lg:top-10 lg:self-start">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#4c8d88]">Before you dive / 04</p>
            <h2 className="mt-2 break-keep text-3xl font-semibold leading-tight tracking-[-0.06em] sm:mt-5 sm:text-5xl">처음 시작하는 분들이<br />가장 많이 묻는 질문</h2>
            <p className="mt-4 break-keep text-sm leading-[1.9] text-[#60777a]"><SentenceText>처음이라 궁금한 점들을 모았습니다. 더 자세한 내용은 상담에서 편하게 물어보세요.</SentenceText></p>
          </div>
          <div className="divide-y divide-[#dce6e0] border-t border-[#9dbbb2]">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div key={faq.question} className="overflow-hidden">
                  <h3>
                    <button type="button" aria-expanded={isOpen} aria-controls={`faq-answer-${index}`} onClick={() => setOpenFaq(isOpen ? null : index)} className="flex w-full items-center gap-3 px-1 py-4 text-left sm:py-5">
                      <span className="shrink-0 text-xs font-bold text-[#4c8d88]">Q.{String(index + 1).padStart(2, "0")}</span>
                      <span className="flex-1 break-keep text-sm font-semibold leading-relaxed sm:text-base">{faq.question}</span>
                      <span aria-hidden="true" className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[#c8d8d1] text-lg leading-none text-[#3b7771] transition-transform duration-300 ${isOpen ? "rotate-45" : ""}`}>+</span>
                    </button>
                  </h3>
                  <div id={`faq-answer-${index}`} aria-hidden={!isOpen} className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out motion-reduce:transition-none ${isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
                    <div className="overflow-hidden"><p className="break-keep px-1 pb-5 text-sm leading-[1.9] text-[#60777a]"><SentenceText>{faq.answer}</SentenceText></p></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section id="location" aria-labelledby="location-title" className="border-y border-[#dce5dc] bg-[#edf1eb] px-5 py-12 text-[#142c36] sm:px-10 sm:py-18 lg:px-16 lg:py-22">
        <div className="mx-auto max-w-[1312px]">
          <div className="mb-6 flex flex-col gap-5 sm:mb-9 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[.3em] text-[#4c8d88]">Visit Blue Peace / 05</p>
              <h2 id="location-title" className="mt-3 break-keep text-3xl font-semibold leading-tight tracking-[-.06em] sm:text-5xl">블루피스 센터 오시는 길</h2>
              <p className="mt-4 break-keep text-sm leading-[1.9] text-[#60777a]">이론 교육장: 블루피스 센터 ({centerAddress})</p>
            </div>
            <a href={centerMapLink} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 self-start items-center gap-4 rounded-full bg-[#14333e] px-5 text-sm font-semibold text-white transition hover:bg-[#326a70] lg:self-auto">네이버 지도에서 길찾기 <ArrowIcon diagonal /></a>
          </div>
          <div className="relative aspect-[4/3] min-h-[300px] overflow-hidden rounded-[1.25rem] border border-[#d3dfd6] bg-[#dce8e1] shadow-[0_18px_42px_rgba(20,51,62,.08)] sm:aspect-[16/8]">
            <iframe
              title="블루피스 센터 위치 지도"
              src={centerMapEmbedUrl}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
              className="absolute inset-0 h-full w-full border-0"
            />
          </div>
          <div className="mt-7 grid gap-0 border-t border-[#b4cbc0] md:grid-cols-2 md:gap-8">
            {[
              { number: "01", label: "주차 안내", detail: "Center 1층 출입문 맞은편 담벼락 편안하게 주차 가능" },
              { number: "02", label: "대중교통 안내", detail: "북삼역 하차 후 택시 이용 시 약 3~5분 소요 (기본요금 거리)" },
            ].map((item) => (
              <div key={item.number} className="grid gap-1 border-b border-[#cedbd1] py-5 sm:grid-cols-[45px_130px_1fr] sm:items-start sm:gap-3 sm:py-7">
                <span className="text-xs font-bold text-[#4c8d88]">{item.number}</span>
                <h3 className="text-sm font-semibold sm:text-base">{item.label}</h3>
                <p className="break-keep text-sm leading-[1.85] text-[#60777a]">{item.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="reviews" className="bg-[#f5f3ec] px-5 py-12 text-[#142c36] sm:px-10 sm:py-20 lg:px-16 lg:py-28">
        <div className="mx-auto max-w-[1312px]">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#4c8d88]">Naver Place reviews / 06</p>
            <h2 className="mt-2 break-keep text-3xl font-semibold tracking-[-0.06em] sm:mt-5 sm:text-5xl">바다를 경험한 사람들의 이야기</h2>
            <p className="mt-3 break-keep text-xs leading-[1.9] text-[#60777a] sm:mt-5 sm:text-base"><SentenceText>블루피스 네이버 플레이스에 공개된 방문자 후기의 핵심 내용을 짧게 요약했습니다. 원문은 네이버 플레이스에서 확인할 수 있습니다.</SentenceText></p>
          </div>
          <div className="no-scrollbar -mx-6 mt-5 flex snap-x snap-mandatory gap-3 overflow-x-auto px-6 pb-3 sm:mx-0 sm:mt-10 sm:grid sm:grid-cols-2 sm:gap-5 sm:overflow-visible sm:px-0 xl:grid-cols-4">
            {placeReviews.map((review) => (
              <article key={review.title} className="flex w-[82vw] max-w-[310px] shrink-0 snap-center flex-col rounded-[1.4rem] border border-[#dfe6df] bg-white p-5 shadow-[0_15px_40px_rgba(20,51,62,.05)] sm:h-full sm:w-auto sm:max-w-none sm:p-7">
                <div className="flex items-center justify-between gap-3"><span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[#03c75a] text-lg font-black text-white" aria-hidden="true">N</span><span className="text-[10px] font-bold text-[#829493]">방문자 리뷰 요약</span></div>
                <h3 className="mt-4 text-lg font-semibold sm:mt-7 sm:text-xl">{review.title}</h3>
                <p className="mt-2 flex-1 break-keep text-xs leading-[1.9] text-[#60777a] sm:mt-4 sm:text-sm"><SentenceText>{review.quote}</SentenceText></p>
                <div className="mt-5 border-t border-[#e3e9e3] pt-3 sm:mt-8 sm:pt-5"><p className="text-sm font-bold text-[#142c36]">{review.author}</p><p className="mt-1 text-xs font-medium text-[#4c8d88]">{review.course}</p></div>
              </article>
            ))}
          </div>
          <a href={naverReviewUrl} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex min-h-11 items-center gap-4 rounded-full border border-[#b8cbc5] bg-white px-4 text-xs font-bold text-[#14333e] transition hover:border-[#4c8d88] hover:bg-[#f0f5f1] sm:mt-9 sm:min-h-12 sm:px-6 sm:text-sm">네이버 플레이스 실시간 리뷰 전체보기 <ArrowIcon diagonal /></a>
        </div>
      </section>

      <section id="contact" className="relative overflow-hidden bg-[#051b2d] px-6 py-10 text-white sm:px-10 sm:py-20 lg:px-16 lg:py-24">
        <div className="absolute -right-20 -top-48 h-[450px] w-[450px] rounded-full border border-white/10" />
        <div className="absolute -right-10 -top-36 h-[450px] w-[450px] rounded-full border border-white/10" />
        <div className="relative mx-auto flex max-w-[1312px] flex-col gap-7 lg:flex-row lg:items-end lg:justify-between lg:gap-10">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#7bd7e5]">Your journey starts here</p>
            <h2 className="mt-2 text-3xl font-semibold leading-tight tracking-[-0.06em] sm:mt-5 sm:text-6xl">당신의 바다는<br />여기서 시작됩니다.</h2>
            <p className="mt-3 text-sm leading-relaxed text-white/65 sm:mt-6 sm:text-base">블루피스의 교육 코스와 일정을 편하게 문의해 주세요.</p>
          </div>
          <div className="flex w-full max-w-lg flex-col gap-3 lg:w-auto">
            <div className="flex flex-col gap-2 sm:flex-row">
              <button type="button" onClick={() => openInquiry()} className="inline-flex min-h-13 items-center justify-between gap-6 rounded-full bg-[#b7ebf0] px-6 text-sm font-bold text-[#08384f] transition hover:bg-white">교육 문의하기 <ArrowIcon diagonal /></button>
              <a href={`tel:${contactPhone}`} className="inline-flex min-h-13 items-center justify-between gap-6 rounded-full border border-white/45 px-6 text-sm font-semibold text-white transition hover:bg-white/10">전화 상담 · {contactPhone} <ArrowIcon diagonal /></a>
            </div>
            <p className="max-w-lg break-keep rounded-xl border border-white/15 bg-white/[.07] px-4 py-3 text-xs leading-[1.8] text-white/80"><SentenceText>{phoneNotice}</SentenceText> <a href={`sms:${contactPhone}`} className="mt-2 inline-block font-bold text-[#b7ebf0] underline underline-offset-4">문자 남기기 ↗</a></p>
          </div>
        </div>
      </section>

      <dialog
        ref={dialogRef}
        aria-labelledby="inquiry-title"
        aria-describedby="inquiry-description"
        onClose={() => { setSelectedInstructorId(null); setReservationStep("select"); }}
        onClick={(event) => { if (event.target === event.currentTarget) dialogRef.current?.close(); }}
        className="fixed inset-0 m-auto h-[90dvh] max-h-[800px] w-[94vw] max-w-5xl overflow-hidden rounded-[1.5rem] border border-[#d5e2dc] bg-[#f7f6f1] p-0 text-[#142c36] shadow-[0_35px_100px_rgba(2,24,42,.32)] backdrop:bg-[#061e28]/75 [&[open]]:flex [&[open]]:flex-col"
      >
        <div className="z-10 flex shrink-0 items-start justify-between gap-4 border-b border-[#d5e2dc] bg-[#f7f6f1]/95 px-5 py-4 backdrop-blur-md sm:px-8 sm:py-6">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#3b8178]">Blue Peace · Personal inquiry</p>
            <h2 id="inquiry-title" className="mt-1 break-keep text-2xl font-semibold tracking-[-0.05em] sm:mt-2 sm:text-3xl">{reservationStep === "select" ? "강사 선택" : reservationStep === "form" ? "상담 예약 양식" : "상담 양식 확인"}</h2>
            <p id="inquiry-description" className="mt-1 break-keep text-xs leading-relaxed text-[#5b7481] sm:mt-2 sm:text-sm">{reservationStep === "select" ? "원하시는 블루피스 전문 강사를 선택해 주세요." : reservationStep === "form" ? "필요한 내용을 적으면 상담 문구가 자동으로 정리됩니다." : "오픈채팅으로 메시지를 보내면 상담 신청이 전달됩니다."}</p>
            <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] leading-[1.6] sm:text-xs">
              <a href={`tel:${contactPhone}`} className="shrink-0 font-bold text-[#1f6965] underline underline-offset-4">전화 상담 {contactPhone}</a>
              <a href={`sms:${contactPhone}`} className="shrink-0 font-bold text-[#1f6965] underline underline-offset-4">문자 남기기 ↗</a>
            </div>
            <p className="mt-1 max-w-2xl break-keep text-[11px] leading-[1.6] text-[#60777a] sm:text-xs"><SentenceText>{phoneNotice}</SentenceText></p>
          </div>
          <button type="button" onClick={() => dialogRef.current?.close()} aria-label="강사 선택 창 닫기" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#d1e0e5] bg-white text-xl text-[#31566a] transition hover:bg-[#e7f2f5]">×</button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-5 sm:px-8 sm:py-7">
          {inquiryCourse && <p className="mb-4 inline-flex max-w-full break-keep rounded-full bg-[#e7f2ed] px-4 py-2 text-xs font-bold text-[#0b6781]">문의 과정 · {inquiryCourse}</p>}
          {reservationStep === "select" && <>
          <div className="mb-5 border-b border-[#d5e2dc] pb-5">
            <p className="mb-3 text-xs font-bold text-[#426575]">전문 분야별 필터</p>
            <select aria-label="강사 전문 분야 선택" value={instructorFilter} onChange={(event) => { setInstructorFilter(event.target.value); setSelectedInstructorId(null); }} className="h-12 w-full rounded-xl border border-[#d5e2dc] bg-white px-4 text-sm font-semibold text-[#15394b] outline-none focus:border-[#3b8178] focus:ring-2 focus:ring-[#b2e2e9] md:hidden">
              {[{ id: "all", name: "전체" }, ...categories].map((category) => {
                const count = category.id === "all" ? eligibleInstructors.length : eligibleInstructors.filter((instructor) => Boolean(instructor.courses[category.id])).length;
                return <option key={category.id} value={category.id} disabled={count === 0}>{category.name} ({count}명)</option>;
              })}
            </select>
            <div className="hidden gap-2 overflow-x-auto pb-2 md:flex" aria-label="강사 전문 분야 필터">
              {[{ id: "all", name: "전체" }, ...categories].map((category) => {
                const count = category.id === "all" ? eligibleInstructors.length : eligibleInstructors.filter((instructor) => Boolean(instructor.courses[category.id])).length;
                return <button key={category.id} type="button" aria-pressed={instructorFilter === category.id} disabled={count === 0} onClick={() => { setInstructorFilter(category.id); setSelectedInstructorId(null); }} className={`shrink-0 whitespace-nowrap rounded-full border px-4 py-2 text-xs font-bold transition ${instructorFilter === category.id ? "border-[#14333e] bg-[#14333e] text-white" : "border-[#d5e2dc] bg-white text-[#527181] hover:border-[#76b8c7]"} disabled:cursor-not-allowed disabled:opacity-40`}>{category.name} <span className="ml-1 opacity-70">({count}명)</span></button>;
              })}
            </div>
            <p className="no-scrollbar mt-3 overflow-x-auto whitespace-nowrap rounded-lg bg-[#e7f2ed] px-3 py-2 text-xs font-semibold text-[#3b7771]" aria-live="polite">💡 선택하신 [{inquiryCourse || (instructorFilter === "all" ? "전체 교육" : categories.find((category) => category.id === instructorFilter)?.name)}] 과정을 진행할 수 있는 전문 강사 총 {visibleInstructors.length}명</p>
          </div>
          <div className="max-h-[400px] overflow-y-auto overscroll-contain rounded-2xl border border-[#d5e2dc] bg-[#f2f5f0] p-3 sm:p-4">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {visibleInstructors.map((instructor) => (
              <button
                key={instructor.id}
                type="button"
                aria-pressed={selectedInstructorId === instructor.id}
                onClick={() => setSelectedInstructorId(instructor.id)}
                className={`min-w-0 rounded-2xl border p-4 text-left transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3b8178] ${selectedInstructorId === instructor.id ? "border-[#3b8178] bg-[#e6f4f6] shadow-[0_8px_25px_rgba(11,113,138,.14)]" : "border-[#d5e2dc] bg-white hover:border-[#8dc6d3]"}`}
              >
                <span className="flex items-center gap-3">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#14333e] text-sm font-semibold text-white">
                    {instructor.photoUrl ? <img src={instructor.photoUrl} alt="" className="h-full w-full object-cover object-[center_35%]" /> : instructor.initials}
                  </span>
                  <span className="min-w-0"><span className="block text-[11px] font-bold text-[#3b8178]">{instructor.role}</span><span className="block text-lg font-semibold">{instructor.name}</span></span>
                  <span aria-hidden="true" className={`ml-auto flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-xs ${selectedInstructorId === instructor.id ? "border-[#3b8178] bg-[#3b8178] text-white" : "border-[#a8c2ca] text-transparent"}`}>✓</span>
                </span>
                <span className="mt-3 block break-keep text-[11px] leading-5 text-[#66808a]">{instructor.experience} · {instructor.certifications}</span>
                <span className="mt-4 flex flex-wrap gap-1.5">
                  {inquiryCourseTitle && <span className="rounded-full bg-[#d9f3ee] px-2.5 py-1 text-[10px] font-bold text-[#086e73]">{inquiryCourseTitle} 가능</span>}
                  {Object.keys(instructor.courses).map((id) => <span key={id} className="rounded-full bg-[#e6f0eb] px-2.5 py-1 text-[10px] font-bold text-[#3b7771]">{categories.find((category) => category.id === id)?.name}</span>)}
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
                <label className="block text-sm font-semibold text-[#31586a]">성함 <span className="text-[#b75353]">*</span><input name="name" type="text" autoComplete="name" required maxLength={40} value={reservation.name} onChange={(event) => updateReservation("name", event.target.value)} placeholder="성함을 입력해 주세요" className="mt-2 h-12 w-full rounded-xl border border-[#d5e2dc] bg-white px-4 font-normal outline-none focus:border-[#3b8178] focus:ring-2 focus:ring-[#b2e2e9]" /></label>
                <label className="block text-sm font-semibold text-[#31586a]">연락처 <span className="text-[#b75353]">*</span><input name="phone" type="tel" inputMode="numeric" autoComplete="tel" required pattern="[0-9]{3}-[0-9]{4}-[0-9]{4}" maxLength={13} value={reservation.phone} onChange={(event) => updateReservation("phone", event.target.value)} placeholder="010-0000-0000" title="휴대전화 번호 11자리를 입력해 주세요" className="mt-2 h-12 w-full rounded-xl border border-[#d5e2dc] bg-white px-4 font-normal outline-none focus:border-[#3b8178] focus:ring-2 focus:ring-[#b2e2e9]" /></label>
                <label className="block text-sm font-semibold text-[#31586a]">인원 <span className="text-[#b75353]">*</span><input name="people" type="number" min="1" max="99" required value={reservation.people} onChange={(event) => updateReservation("people", event.target.value)} className="mt-2 h-12 w-full rounded-xl border border-[#d5e2dc] bg-white px-4 font-normal outline-none focus:border-[#3b8178] focus:ring-2 focus:ring-[#b2e2e9]" /></label>
                <label className="block text-sm font-semibold text-[#31586a]">수업 희망 일정 <span className="text-[#b75353]">*</span><input name="schedule" type="date" required value={reservation.schedule} onChange={(event) => updateReservation("schedule", event.target.value)} className="mt-2 h-12 w-full rounded-xl border border-[#d5e2dc] bg-white px-4 font-normal text-[#15394b] outline-none focus:border-[#3b8178] focus:ring-2 focus:ring-[#b2e2e9]" /></label>
              </div>
              <label className="block text-sm font-semibold text-[#31586a]">기타 문의사항<textarea name="message" rows={4} maxLength={1000} value={reservation.message} onChange={(event) => updateReservation("message", event.target.value)} placeholder="궁금한 점을 편하게 적어 주세요" className="mt-2 w-full resize-y rounded-xl border border-[#d5e2dc] bg-white px-4 py-3 font-normal outline-none focus:border-[#3b8178] focus:ring-2 focus:ring-[#b2e2e9]" /></label>
              <p className="break-keep text-xs leading-relaxed text-[#6a8793]">입력 내용은 이 기기에서 상담 문구로 정리됩니다. 접수하기를 누르면 복사 안내가 먼저 나타납니다. 이후 오픈채팅방으로 이동해 내용을 직접 보내야 상담이 전달됩니다.</p>
            </form>
          )}
        </div>
        <div className="z-10 shrink-0 border-t border-[#d5e2dc] bg-[#f7f6f1]/95 px-5 py-3 shadow-[0_-10px_30px_rgba(6,44,67,.08)] backdrop-blur-md sm:px-8 sm:py-4">
          {reservationStep === "select" && <>
            <p className="mb-2 truncate text-xs font-medium text-[#426575]">{selectedInstructor ? `선택한 강사 · ${selectedInstructor.role} ${selectedInstructor.name}` : "상담할 강사를 선택해 주세요"}</p>
            <div className="flex flex-col gap-2 sm:flex-row">
              <button type="button" disabled={!selectedInstructor} onClick={() => setReservationStep("form")} className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-[#14333e] px-4 text-center text-sm font-bold text-white transition hover:bg-[#326a70] disabled:cursor-not-allowed disabled:bg-[#c7d9df] disabled:text-[#6e8791]">{selectedInstructor ? "이 강사에게 상담 문의하기" : "강사를 먼저 선택해 주세요"} <ArrowIcon diagonal /></button>
              <a href={generalInquiryUrl} className="inline-flex min-h-11 flex-1 items-center justify-center rounded-xl border border-[#a8c9d3] bg-white px-4 text-center text-xs font-bold text-[#14333e] transition hover:bg-[#eaf5f7] sm:min-h-12 sm:text-sm">전체 문의 / 강사 배정 요청</a>
            </div>
          </>}
          {reservationStep === "form" && <div className="flex gap-2"><button type="button" onClick={() => setReservationStep("select")} className="min-h-12 rounded-xl border border-[#a8c9d3] bg-white px-4 text-sm font-bold text-[#14333e]">이전</button><button type="submit" form="consultation-form" className="min-h-12 flex-1 rounded-xl bg-[#14333e] px-5 text-sm font-bold text-white transition hover:bg-[#326a70]">접수하기</button></div>}
        </div>
        {reservationStep === "confirm" && (
          <div role="dialog" aria-modal="true" aria-labelledby="confirmation-title" className="absolute inset-0 z-30 flex items-center justify-center overflow-y-auto bg-[#031c2c]/85 p-4 backdrop-blur-sm sm:p-8">
            <div className="my-auto w-full max-w-lg rounded-2xl border border-[#add9e0] bg-[#f7fbfc] p-6 shadow-[0_25px_70px_rgba(0,0,0,.32)] sm:p-8">
              <p className="text-[11px] font-bold uppercase tracking-[.2em] text-[#3b8178]">Blue Peace · Final check</p>
              <h3 id="confirmation-title" className="mt-3 break-keep text-2xl font-semibold leading-tight text-[#102e40]">{copySucceeded ? "📋 상담 양식이 복사되었습니다" : "📋 상담 양식을 확인해 주세요"}</h3>
              {copySucceeded ? (
                <div className="mt-5 space-y-3 break-keep text-sm leading-relaxed text-[#4f6e7d]">
                  <p>작성하신 상담 신청 양식이 클립보드에 자동 복사되었습니다.</p>
                  <p>아래 [오픈채팅방 이동] 버튼을 누르신 후, 열리는 카카오톡 채팅창에 &lsquo;붙여넣기(Ctrl+V 또는 꾹 눌러 붙여넣기)&rsquo;하여 메시지를 보내주세요.</p>
                  <p>담당 강사님이 내용을 확인하는 대로 빠르고 친절하게 안내해 드립니다.</p>
                </div>
              ) : (
                <div className="mt-5 space-y-3 text-sm leading-relaxed text-[#4f6e7d]"><p>브라우저에서 자동 복사를 허용하지 않았습니다. 아래 내용을 직접 복사한 뒤 오픈채팅방에 붙여넣어 주세요.</p><textarea aria-label="상담 내용 복사본" readOnly value={submissionText} rows={6} onFocus={(event) => event.target.select()} className="w-full rounded-xl border border-[#d5e2dc] bg-white p-3 text-xs" /></div>
              )}
              <div className="mt-6 flex flex-col gap-2 sm:flex-row">
                {!copySucceeded && <button type="button" onClick={async () => { try { await navigator.clipboard.writeText(submissionText); setCopySucceeded(true); } catch { setCopySucceeded(false); } }} className="min-h-12 rounded-xl border border-[#a8c9d3] bg-white px-4 text-sm font-bold text-[#14333e]">다시 복사</button>}
                <a href={selectedInstructor?.kakaoUrl || "https://open.kakao.com/"} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-12 flex-1 items-center justify-center rounded-xl bg-[#14333e] px-5 text-center text-sm font-bold text-white transition hover:bg-[#326a70]">오픈채팅방으로 이동하기 ↗</a>
                <button type="button" onClick={() => setReservationStep("form")} className="min-h-12 rounded-xl border border-[#a8c9d3] bg-white px-4 text-sm font-bold text-[#14333e]">양식 수정</button>
              </div>
            </div>
          </div>
        )}
      </dialog>

      <footer className="border-t border-white/10 bg-[#031a2a] px-6 py-10 text-white/65 sm:px-10 sm:py-14 lg:px-16">
        <div className="mx-auto grid max-w-[1312px] gap-8 sm:grid-cols-2 lg:grid-cols-[1.2fr_1fr_1fr]">
          <div>
            <p className="text-2xl font-bold tracking-[-0.05em] text-white">Blue Peace<span className="text-[#76d8e8]">.</span></p>
            <p className="mt-3 max-w-xs break-keep text-sm leading-relaxed">바다를 배우고, 더 자유롭게 경험하는 시간.</p>
          </div>
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-[#8ad6df]">Business</p>
            <dl className="space-y-1.5 text-sm leading-relaxed">
              <div className="flex gap-3"><dt className="w-24 shrink-0 text-white/45">상호</dt><dd>{business.name}</dd></div>
              <div className="flex gap-3"><dt className="w-24 shrink-0 text-white/45">대표자</dt><dd>{business.owner}</dd></div>
              <div className="flex gap-3"><dt className="w-24 shrink-0 text-white/45">사업자등록번호</dt><dd>{business.registration}</dd></div>
              <div className="flex gap-3"><dt className="w-24 shrink-0 text-white/45">이론 센터</dt><dd className="break-keep">{centerAddress}</dd></div>
            </dl>
          </div>
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-[#8ad6df]">Connect</p>
            <div className="flex flex-col items-start gap-2 text-sm">
              <a href={`tel:${contactPhone}`} className="font-semibold text-white underline decoration-white/25 underline-offset-4 transition hover:text-[#b7ebf0]">전화 상담 · {contactPhone}</a>
              <a href={`mailto:${contactEmail}`} className="underline decoration-white/25 underline-offset-4 transition hover:text-white">{contactEmail}</a>
              <a href={instagramUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 underline decoration-white/25 underline-offset-4 transition hover:text-white">Instagram · @bluepeace_diving <ArrowIcon diagonal /></a>
            </div>
          </div>
        </div>
        <div className="mx-auto mt-9 max-w-[1312px] border-t border-white/10 pt-5 text-xs text-white/40">© {new Date().getFullYear()} Blue Peace. All rights reserved.</div>
      </footer>
    </main>
  );
}
