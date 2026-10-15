"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

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

const trustStats = [
  { value: "892명+", label: "누적 교육생" },
  { value: "소속 전문강사", label: "공정 1:1 매칭" },
  { value: "100%", label: "자격증 발급률" },
  { value: "무제한 진행", label: "실습 보장" },
];

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
  { question: "교육 장소는 어디인가요?", answer: "이론 수업은 블루피스 센터(경상북도 칠곡군 북삼읍 인강1길 38-12, 1층)에서, 풀장 실습은 칠곡 패스나인, 밀양 아리랑 등 희망 일정에 맞는 풀장에서 진행됩니다." },
];

const categories = [
  {
    id: "freediving",
    name: "프리다이빙",
    association: "AIDA / PSA",
    intro: "처음 숨을 고르는 순간부터 더 깊은 도전까지, 블루피스와 함께 단계별로 배웁니다.",
    courses: [
      { title: "1레벨", subtitle: "Freediver", description: "프리다이빙의 기초를 시작하는 과정입니다." },
      { title: "2레벨", subtitle: "Open Water", description: "기본기를 바탕으로 개방 수역 경험을 넓혀가는 과정입니다." },
      { title: "3레벨", subtitle: "Advanced", description: "기술과 안전 절차를 더 깊이 익히는 심화 과정입니다." },
      { title: "4레벨", subtitle: "Master", description: "숙련도를 높이고 다음 단계를 준비하는 과정입니다." },
    ],
  },
  {
    id: "youth",
    name: "유스 프리다이빙",
    association: "PSA",
    intro: "성장 단계에 맞춘 유스 프리다이빙 과정을 블루피스에서 안내합니다.",
    courses: [
      { title: "1레벨", subtitle: "Dolphin", description: "물과 친해지며 프리다이빙의 기초를 익히는 과정입니다." },
      { title: "2레벨", subtitle: "Orca Open Water", description: "기초 경험을 바탕으로 다음 단계에 도전하는 과정입니다." },
      { title: "3레벨", subtitle: "Shark Advanced", description: "유스 다이버의 기술과 자신감을 키우는 심화 과정입니다." },
    ],
  },
  {
    id: "safety",
    name: "수중레저안전요원",
    association: "PSA",
    intro: "수중 활동의 안전 역량을 단계별로 배우는 블루피스 교육입니다.",
    courses: [
      { title: "수중레저안전요원", description: "안전 자격 및 야간 해루질 관련 표준 안전 교육 과정입니다." },
      { title: "마스터 안전요원", description: "상위 등급 수중 안전 관리자 자격 과정입니다." },
    ],
  },
  {
    id: "mermaid",
    name: "머메이드 다이빙",
    association: "PSA",
    intro: "움직임과 표현의 즐거움을 만나는 블루피스 머메이드 과정입니다.",
    courses: [
      { title: "베이직 머메이드", description: "머메이드 다이빙의 기초 움직임을 배우는 과정입니다." },
      { title: "머메이드", description: "기본 동작을 확장하며 물속 표현을 익히는 과정입니다." },
    ],
  },
  {
    id: "scuba",
    name: "스쿠버다이빙",
    association: "PSAI",
    intro: "스쿠버다이빙의 기초부터 심화 과정까지 블루피스에서 만나보세요.",
    courses: [
      { title: "오픈워터", subtitle: "Open Water", description: "스쿠버다이빙의 기본을 배우는 입문 과정입니다." },
      { title: "어드밴스드", subtitle: "Advanced", description: "다양한 환경에 필요한 역량을 넓혀가는 과정입니다." },
    ],
  },
];

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  );
}

export default function HomePage() {
  const [heroIndex, setHeroIndex] = useState(0);
  const [instructors, setInstructors] = useState([]);
  const [openFaq, setOpenFaq] = useState(null);

  // DB에서 승인된 강사 목록을 불러와 방문 시마다 랜덤(Random Shuffle)으로 순서를 섞음
  useEffect(() => {
    const fetchInstructors = async () => {
      const { data, error } = await supabase
        .from('instructors')
        .select('id, name, profile_image, bio, max_freediving_level, is_approved')
        .eq('is_approved', true);

      if (!error && data) {
        setInstructors(shuffleItems(data));
      }
    };

    fetchInstructors();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setHeroIndex((i) => (i + 1) % heroImages.length), 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      
      {/* GNB Navigation */}
      <header className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800 px-4 sm:px-8 py-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-cyan-400 font-black text-xl tracking-wider">BLUE PEACE</span>
          </Link>
          <div className="flex gap-4 sm:gap-6 text-xs sm:text-sm font-semibold text-slate-300">
            <a href="#courses" className="hover:text-cyan-400 transition">교육과정</a>
            <a href="#instructors" className="hover:text-cyan-400 transition">소속강사진</a>
            <a href="#faq" className="hover:text-cyan-400 transition">FAQ</a>
            <Link href="/instructor/mypage" className="text-cyan-400 hover:underline">강사포털</Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-16 sm:py-24 px-4 text-center max-w-4xl mx-auto">
        <span className="text-xs font-bold px-3 py-1 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded-full">
          대구·경북 최대 다이빙 전문 센터
        </span>
        <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black mt-4 text-white leading-tight">
          블루피스와 함께<br />
          <span className="text-cyan-400">당신만의 깊은 바다</span>를 경험하세요.
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-4 max-w-xl mx-auto leading-relaxed">
          수영을 못해도, 물 공포증이 있어도大丈夫! 1:1 맞춤 강사 매칭으로 안전하고 완벽한 교육을 지원합니다.
        </p>

        <div className="mt-8 flex justify-center gap-3">
          <Link
            href="/inquiry?course=freediving"
            className="px-6 py-3.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold rounded-2xl text-xs sm:text-sm transition shadow-lg shadow-cyan-500/20"
          >
            🚀 맞춤 강사 상담 신청하기
          </Link>
        </div>
      </section>

      {/* 통계 바 */}
      <section className="border-y border-slate-800 bg-slate-900/50 py-6">
        <div className="max-w-5xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-4 text-center px-4">
          {trustStats.map((s, idx) => (
            <div key={idx}>
              <p className="text-lg sm:text-xl font-extrabold text-cyan-400">{s.value}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 코스 선택 섹션 (클릭 시 /inquiry?course=... 자동 세팅 연동) */}
      <section id="courses" className="py-16 sm:py-24 px-4 max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <span className="text-xs font-bold text-cyan-400">BLUE PEACE COURSES</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">교육 과정 선택</h2>
          <p className="text-xs text-slate-400 mt-2">희망하시는 코스를 누르시면 전담 매칭 문의 페이지로 바로 이동합니다.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {categories.map((cat) => (
            <div key={cat.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between hover:border-cyan-500/50 transition">
              <div>
                <span className="text-[10px] font-bold text-cyan-400 bg-cyan-950 px-2.5 py-1 rounded-md border border-cyan-800">
                  {cat.association}
                </span>
                <h3 className="text-xl font-bold text-white mt-3">{cat.name}</h3>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">{cat.intro}</p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800/80">
                {/* 쿼리 파라미터가 포함된 문의하기 링크 */}
                <Link
                  href={`/inquiry?course=${cat.id}`}
                  className="w-full py-3 bg-slate-800 hover:bg-cyan-600 text-cyan-300 hover:text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <span>{cat.name} 문의하기</span>
                  <ArrowIcon />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 공정성 보장 소속 강사진 랜덤 노출 섹션 */}
      <section id="instructors" className="py-16 sm:py-24 bg-slate-900/40 border-y border-slate-800/80 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <span className="text-xs font-bold text-cyan-400 bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/20">
            OFFICIAL INSTRUCTORS
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-3">
            🌊 블루피스 공식 소속 강사진
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-2 max-w-2xl mx-auto leading-relaxed">
            블루피스는 특정 강사 지정 없이, 수강생분의 희망 일정과 장소에 가장 완벽히 부합하는 강사님을 100% 공정하게 맞춤 매칭합니다.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mt-10">
            {instructors.map((ins) => (
              <div key={ins.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-center hover:border-cyan-500/40 transition">
                <div className="w-20 h-20 mx-auto rounded-2xl bg-slate-800 overflow-hidden border border-slate-700 mb-3 flex items-center justify-center">
                  {ins.profile_image ? (
                    <img src={ins.profile_image} alt={ins.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-[10px] text-slate-500">프로필 준비중</span>
                  )}
                </div>
                <h3 className="text-sm font-bold text-white">{ins.name} 강사</h3>
                <p className="text-[11px] text-cyan-400 mt-0.5">블루피스 공식 강사</p>
                <p className="text-[11px] text-slate-400 line-clamp-2 mt-2 leading-relaxed">
                  {ins.bio || '안전하고 즐거운 강습을 약속드립니다.'}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ 섹션 */}
      <section id="faq" className="py-16 px-4 max-w-3xl mx-auto">
        <h2 className="text-xl sm:text-2xl font-bold text-white text-center mb-8">❓ 자주 묻는 질문</h2>
        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div key={idx} className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
              <button
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full text-left flex justify-between items-center text-xs sm:text-sm font-bold text-slate-200"
              >
                <span>Q. {faq.question}</span>
                <span className="text-cyan-400">{openFaq === idx ? '▲' : '▼'}</span>
              </button>
              {openFaq === idx && (
                <p className="text-xs text-slate-400 mt-3 pt-3 border-t border-slate-800 leading-relaxed">
                  A. {faq.answer}
                </p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-950 py-10 px-4 text-center text-xs text-slate-500">
        <p className="font-bold text-slate-400 mb-1">{business.name} | 대표: {business.owner}</p>
        <p>사업자등록번호: {business.registration} | 주소: {centerAddress}</p>
        <p className="mt-3 text-[10px] text-slate-600">© BLUE PEACE. All rights reserved.</p>
      </footer>

    </main>
  );
}
