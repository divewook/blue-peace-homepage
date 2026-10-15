"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const centerAddress = "경상북도 칠곡군 북삼읍 인강1길 38-12, 1층";
const centerMapEmbedUrl = `https://maps.google.com/maps?q=${encodeURIComponent("경상북도 칠곡군 북삼읍 인강1길 38-12")}&z=17&hl=ko&output=embed`;
const centerMapLink = "https://map.naver.com/p/entry/place/1768533167";
const business = { name: "블루피스", owner: "김상욱", registration: "460-44-01113" };

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
  { question: "교육 장소는 어디인가요?", answer: "이론 수업은 블루피스 센터에서, 풀장 실습은 칠곡 패스나인, 밀양 아리랑 등 일정에 맞는 풀장에서 진행됩니다." },
];

const categories = [
  {
    id: "freediving",
    name: "프리다이빙",
    association: "AIDA / PSA",
    intro: "처음 숨을 고르는 순간부터 더 깊은 도전까지, 블루피스와 함께 단계별로 배웁니다.",
  },
  {
    id: "youth",
    name: "유스 프리다이빙",
    association: "PSA",
    intro: "성장 단계에 맞춘 유스 프리다이빙 과정을 블루피스에서 안내합니다.",
  },
  {
    id: "safety",
    name: "수중레저안전요원",
    association: "PSA",
    intro: "수중 활동의 안전 역량을 단계별로 배우는 블루피스 교육입니다.",
  },
  {
    id: "mermaid",
    name: "머메이드 다이빙",
    association: "PSA",
    intro: "움직임과 표현의 즐거움을 만나는 블루피스 머메이드 과정입니다.",
  },
  {
    id: "scuba",
    name: "스쿠버다이빙",
    association: "PSAI",
    intro: "스쿠버다이빙의 기초부터 심화 과정까지 블루피스에서 만나보세요.",
  },
  {
    id: "special",
    name: "스페셜 교육",
    association: "PSA",
    intro: "응급처치 CPR 교육 및 수중 사진 촬영 교육 등 특별한 역량을 배워보세요.",
  },
];

function shuffleItems(items) {
  const shuffled = [...items];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[index]];
  }
  return shuffled;
}

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
  const [selectedPhoto, setSelectedPhoto] = useState(null);

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
            <a href="#location" className="hover:text-cyan-400 transition">오시는길</a>
            <Link href="/instructor/mypage" className="text-cyan-400 hover:underline">강사포털</Link>
          </div>
        </div>
      </header>

      {/* Hero Section with Dynamic Photo Slider */}
      <section className="relative py-12 sm:py-20 px-4 max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        <div className="text-center lg:text-left">
          <span className="text-xs font-bold px-3 py-1 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded-full inline-block">
            대구·경북 최대 다이빙 전문 센터
          </span>
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black mt-4 text-white leading-tight">
            블루피스와 함께<br />
            <span className="text-cyan-400">당신만의 깊은 바다</span>를 경험하세요.
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-4 leading-relaxed">
            수영을 못해도, 물 공포증이 있어도 괜찮습니다.<br />
            1:1 맞춤 강사 매칭으로 안전하고 완벽한 교육을 지원합니다.
          </p>

          <div className="mt-8 flex justify-center lg:justify-start gap-3">
            <Link
              href="/inquiry?course=freediving"
              className="px-6 py-3.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold rounded-2xl text-xs sm:text-sm transition shadow-lg shadow-cyan-500/20"
            >
              🚀 맞춤 강사 상담 신청하기
            </Link>
          </div>
        </div>

        {/* 대형 비주얼 이미지 슬라이더 카드 */}
        <div className="relative h-64 sm:h-96 rounded-3xl overflow-hidden border border-slate-800 shadow-2xl">
          {heroImages.map((src, index) => (
            <div
              key={src}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                heroIndex === index ? "opacity-100" : "opacity-0"
              }`}
            >
              <Image src={src} alt="블루피스 현장 사진" fill className="object-cover" priority={index === 0} />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />
            </div>
          ))}
          <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center text-xs text-white/80 font-medium bg-slate-950/60 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10">
            <span>🌊 BLUE PEACE DIVING CENTER</span>
            <span>0{heroIndex + 1} / 04</span>
          </div>
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

      {/* 코스 선택 섹션 */}
      <section id="courses" className="py-16 sm:py-24 px-4 max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <span className="text-xs font-bold text-cyan-400">BLUE PEACE COURSES</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">교육 과정 선택</h2>
          <p className="text-xs text-slate-400 mt-2">희망하시는 코스를 누르시면 전담 매칭 문의 페이지로 바로 이동합니다.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {categories.map((cat) => (
            <div key={cat.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between hover:border-cyan-500/50 transition shadow-lg">
              <div>
                <span className="text-[10px] font-bold text-cyan-400 bg-cyan-950 px-2.5 py-1 rounded-md border border-cyan-800">
                  {cat.association}
                </span>
                <h3 className="text-xl font-bold text-white mt-3">{cat.name}</h3>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">{cat.intro}</p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800/80">
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

      {/* 맞춤형 강사진 랜덤 노출 섹션 */}
      <section id="instructors" className="py-16 sm:py-24 bg-slate-900/40 border-y border-slate-800/80 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <span className="text-xs font-bold text-cyan-400 bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/20">
            BLUE PEACE INSTRUCTORS
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-3">
            🌊 블루피스 맞춤형 강사진
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-2 max-w-2xl mx-auto leading-relaxed">
            블루피스는 특정 강사 지정 없이, 수강생분의 희망 일정과 장소에 가장 완벽히 부합하는 강사님을 100% 공정하게 맞춤 매칭합니다.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mt-10">
            {instructors.map((ins) => (
              <div key={ins.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-center hover:border-cyan-500/50 transition-all duration-300 shadow-lg group">
                <div className="w-20 h-20 mx-auto rounded-2xl bg-slate-800 overflow-hidden border border-slate-700 mb-3 flex items-center justify-center group-hover:scale-105 transition-transform">
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

      {/* 수중 작품 갤러리 섹션 (생동감 추가) */}
      <section className="py-16 px-4 max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <span className="text-xs font-bold text-cyan-400">GALLERY</span>
          <h2 className="text-xl sm:text-2xl font-bold text-white mt-1">📸 블루피스 수중 순간들</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {galleryImages.slice(0, 8).map((img, idx) => (
            <div
              key={idx}
              onClick={() => setSelectedPhoto(img.src)}
              className="relative h-40 sm:h-52 rounded-2xl overflow-hidden border border-slate-800 cursor-pointer group"
            >
              <Image src={img.src} alt={img.alt} fill className="object-cover group-hover:scale-110 transition-transform duration-500" />
              <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-xs text-cyan-300 font-bold">
                확대 보기 ↗
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 센터 오시는 길 & 지도 섹션 */}
      <section id="location" className="py-16 bg-slate-900/60 border-t border-slate-800 px-4">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div>
            <span className="text-xs font-bold text-cyan-400 bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/20">
              LOCATION
            </span>
            <h2 className="text-2xl font-bold text-white mt-3">📍 블루피스 센터 찾아오시는 길</h2>
            
            <div className="mt-6 space-y-4 text-xs sm:text-sm text-slate-300">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
                <p className="text-cyan-400 font-bold">🏠 정확한 주소</p>
                <p className="text-white font-medium">{centerAddress}</p>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
                <p className="text-cyan-400 font-bold">🚗 주차 안내</p>
                <p className="text-slate-300 leading-relaxed">
                  센터 건물 전용 주차장 및 인근 골목 무료 주차가 항상 가능하므로 편하게 방문해 주시면 됩니다.
                </p>
              </div>

              <a
                href={centerMapLink}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 py-3 px-5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl transition text-xs"
              >
                🗺️ 네이버 지도에서 길찾기 ↗
              </a>
            </div>
          </div>

          {/* 구글 지도 Embed */}
          <div className="h-72 sm:h-80 rounded-2xl overflow-hidden border border-slate-800 shadow-xl">
            <iframe
              src={centerMapEmbedUrl}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen={false}
              loading="lazy"
              title="블루피스 센터 지도"
            />
          </div>
        </div>
      </section>

      {/* 이미지 확대 모달 */}
      {selectedPhoto && (
        <div
          onClick={() => setSelectedPhoto(null)}
          className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer"
        >
          <div className="relative max-w-3xl max-h-[85vh] w-full h-full">
            <Image src={selectedPhoto} alt="확대 사진" fill className="object-contain" />
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-950 py-10 px-4 text-center text-xs text-slate-500">
        <p className="font-bold text-slate-400 mb-1">{business.name} | 대표: {business.owner}</p>
        <p>사업자등록번호: {business.registration} | 주소: {centerAddress}</p>
        <p className="mt-3 text-[10px] text-slate-600">© BLUE PEACE. All rights reserved.</p>
      </footer>

    </main>
  );
}
