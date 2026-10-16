"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import ExpandableText from "../components/expandable-text";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const centerAddress = "경상북도 칠곡군 북삼읍 인강1길 38-12, 1층";
const centerMapEmbedUrl = `https://maps.google.com/maps?q=${encodeURIComponent("경상북도 칠곡군 북삼읍 인강1길 38-12")}&z=17&hl=ko&output=embed`;
const centerMapLink = "https://map.naver.com/p/entry/place/1768533167";
const naverReviewUrl = "https://map.naver.com/p/entry/place/1768533167?placePath=%2Freview";
const business = { name: "블루피스", owner: "김상욱", registration: "460-44-01113" };

// 기본 백업용 히어로 이미지 (Admin 등록 이미지가 없을 때 동작)
const defaultHeroImages = [
  "/DSC02297.jpg",
  "/DSC04128-Enhanced-NR.jpg",
  "/DSC05353-Enhanced-NR.jpg",
  "/DSC06986.jpg",
];

// 기본 백업용 갤러리 이미지 (Admin 등록 이미지가 없을 때 동작)
const defaultGalleryImages = [
  "DSC00377.jpg", "DSC00606-2.jpg", "DSC01193.jpg", "DSC01428-Enhanced-NR.jpg",
  "DSC01783-Enhanced-NR.jpg", "DSC01925-Enhanced-NR.jpg", "DSC01936.jpg",
  "DSC02031.jpg", "DSC02125-Enhanced-NR.jpg", "DSC02294.jpg",
  "DSC02924-Enhanced-NR.jpg", "DSC03811-Enhanced-NR.jpg", "DSC04002-Enhanced-NR.jpg",
  "DSC04183-Enhanced-NR.jpg", "DSC04188-Enhanced-NR.jpg", "DSC05155-Enhanced-NR.jpg",
  "DSC05737-Enhanced-NR.jpg", "DSC06743.jpg", "DSC07168-Enhanced-NR.jpg",
  "DSC07628.jpg",
].map((filename, index) => ({ src: `/${filename}`, alt: `블루피스 수중 작품 ${index + 1}` }));

// 네이버 플레이스 실제 방문자 리뷰 요약 데이터
const placeReviews = [
  {
    title: "아이의 눈높이에 맞춘 세심한 수업",
    quote: "기본부터 차근차근 지도하고 아이와 소통하며 가능성을 끌어내 준 점이 너무 좋았어요.",
    author: "유니3971",
    course: "유스 프리다이빙",
  },
  {
    title: "컨디션에 맞춘 안전한 레슨",
    quote: "그날의 상태에 맞춰 수업을 이끌어 주고 핀 동작도 하나하나 세심하게 교정해 주셨습니다.",
    author: "cuc****",
    course: "프리다이빙 레벨2",
  },
  {
    title: "친절하고 꼼꼼한 피드백",
    quote: "자세를 하나씩 살펴주고 어려운 부분은 함께 고민해 줬어요. 수업 후 사진과 영상도 고화질로 챙겨주십니다.",
    author: "hos****",
    course: "프리다이빙 입문",
  },
  {
    title: "물 공포증 완벽 극복!",
    quote: "강사님들의 단계적인 지도 덕분에 예전에는 무서웠던 깊은 물도 이제는 편안하게 즐기게 되었습니다.",
    author: "썸띵헬ㅆl",
    course: "프리다이빙",
  },
];

const trustStats = [
  { value: "892명+", label: "누적 교육생" },
  { value: "맞춤 강사진", label: "공정 1:1 매칭" },
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
  { id: "freediving", name: "프리다이빙", association: "AIDA / PSA", intro: "처음 숨을 고르는 순간부터 더 깊은 도전까지 단계별로 배웁니다." },
  { id: "youth", name: "유스 프리다이빙", association: "PSA", intro: "성장 단계에 맞춘 청소년 전문 프리다이빙 코스입니다." },
  { id: "safety", name: "수중레저안전요원", association: "PSA", intro: "안전 자격 및 야간 해루질 표준 안전 교육 과정입니다." },
  { id: "mermaid", name: "머메이드 다이빙", association: "PSA", intro: "우아한 움직임과 신비로운 표현을 익히는 머메이드 코스입니다." },
  { id: "scuba", name: "스쿠버다이빙", association: "PSAI", intro: "장비를 착용하고 더욱 아늑하게 바닷속을 만나는 과정입니다." },
  { id: "special", name: "스페셜 교육", association: "PSA", intro: "응급처치 CPR 교육 및 수중 사진 촬영 교육 전문 레슨입니다." },
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
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  );
}

export default function HomePage() {
  const [heroIndex, setHeroIndex] = useState(0);
  const [heroImages, setHeroImages] = useState(defaultHeroImages);
  const [galleryPhotos, setGalleryPhotos] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [showAllInstructors, setShowAllInstructors] = useState(false); // 전체 강사진 보기 토글
  const [openFaq, setOpenFaq] = useState(null);
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  // DB 데이터 불러오기 및 무작위 섞기
  useEffect(() => {
    const fetchData = async () => {
      // 1. 강사 정보
      const instructorResponse = await fetch('/api/public/instructors', { cache: 'no-store' });
      const { instructors: insData = [] } = instructorResponse.ok ? await instructorResponse.json() : {};
      if (insData && insData.length > 0) {
        setInstructors(shuffleItems(insData));
      }

      // 2. 관리자 등록 갤러리/슬라이드 사진 조회 (있을 경우 반영)
      const { data: galleryData } = await supabase.from('admin_galleries').select('image_url, is_hero');
      
      if (galleryData && galleryData.length > 0) {
        const heroList = galleryData.filter(g => g.is_hero).map(g => g.image_url);
        if (heroList.length > 0) setHeroImages(shuffleItems(heroList));

        const photoList = galleryData.map(g => ({ src: g.image_url, alt: '블루피스 수중 작품' }));
        setGalleryPhotos(shuffleItems(photoList).slice(0, 8));
      } else {
        setGalleryPhotos(shuffleItems(defaultGalleryImages).slice(0, 8));
      }
    };

    fetchData();
  }, []);

  // Hero 이미지 자동 슬라이드 (5초 간격)
  useEffect(() => {
    if (heroImages.length === 0) return;
    const timer = setInterval(() => setHeroIndex((i) => (i + 1) % heroImages.length), 5000);
    return () => clearInterval(timer);
  }, [heroImages]);

  // 노출할 강사진 목록 (기본 4명 / 버튼 클릭 시 전체)
  const visibleInstructors = showAllInstructors ? instructors : instructors.slice(0, 4);

  return (
    <main className="min-h-screen bg-slate-50 pb-24 text-slate-800 font-sans md:pb-0">
      
      {/* 모바일 화면에 완벽 반응하는 고급 GNB 헤더 */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-sm px-4 sm:px-8 py-3.5">
        <div className="max-w-6xl mx-auto flex justify-between items-center gap-3">
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <span className="text-cyan-600 font-black text-lg sm:text-xl tracking-wider">BLUE PEACE</span>
          </Link>
          
          <nav className="flex min-w-0 flex-1 items-center justify-end gap-4 sm:gap-6 text-xs sm:text-sm font-semibold text-slate-600 overflow-x-auto no-scrollbar whitespace-nowrap py-2">
            <a href="#courses" className="hover:text-cyan-600 transition shrink-0">교육과정</a>
            <a href="#instructors" className="hover:text-cyan-600 transition shrink-0">맞춤강사진</a>
            <a href="#faq" className="hover:text-cyan-600 transition shrink-0">FAQ</a>
            <a href="#gallery" className="hover:text-cyan-600 transition shrink-0">갤러리</a>
            <a href="#reviews" className="hover:text-cyan-600 transition shrink-0">후기</a>
            <a href="#location" className="hover:text-cyan-600 transition shrink-0">오시는길</a>
            <Link href="/instructor/mypage" className="text-cyan-600 hover:text-cyan-700 font-bold shrink-0 bg-cyan-50 px-2.5 py-1 rounded-lg border border-cyan-200">
              강사포털
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-12 sm:py-20 px-4 max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        <div className="text-center lg:text-left">
          <span className="text-xs font-bold px-3.5 py-1.5 bg-cyan-100 text-cyan-800 border border-cyan-200 rounded-full inline-block mb-3">
            ✨ 대구·경북 최대 다이빙 전문 센터
          </span>
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-slate-900 leading-[1.35]">
            블루피스와 함께<br />
            <span className="text-cyan-600">당신만의 깊은 바다</span>를 경험하세요.
          </h1>
          <p className="text-sm text-slate-600 mt-4 leading-7 font-medium">
            수영을 못해도, 물 공포증이 있어도 괜찮습니다.<br />
            1:1 맞춤 강사 매칭으로 안전하고 완벽한 교육을 지원합니다.
          </p>

          <div className="mt-8 flex justify-center lg:justify-start">
            <Link
              href="/inquiry?course=freediving"
              className="min-h-12 px-7 py-4 bg-cyan-600 hover:bg-cyan-500 text-white font-extrabold rounded-2xl text-sm transition shadow-lg shadow-cyan-600/25 flex items-center gap-2"
            >
              <span>🚀 맞춤 강사 상담 신청하기</span>
              <ArrowIcon />
            </Link>
          </div>
        </div>

        {/* 텍스트/숫자 없는 순수 대형 비주얼 이미지 슬라이더 */}
        <div className="relative h-72 sm:h-96 rounded-3xl overflow-hidden border border-slate-200 shadow-xl bg-slate-100">
          {heroImages.map((src, index) => (
            <div
              key={src}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                heroIndex === index ? "opacity-100" : "opacity-0"
              }`}
            >
              <Image src={src} alt="블루피스 메인 사진" fill className="object-cover" priority={index === 0} />
            </div>
          ))}
        </div>
      </section>

      {/* 신뢰도 요약 통계 바 */}
      <section className="border-y border-slate-200 bg-white py-6 shadow-sm">
        <div className="max-w-5xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-4 text-center px-4">
          {trustStats.map((s, idx) => (
            <div key={idx}>
              <p className="text-lg sm:text-2xl font-black text-cyan-600">{s.value}</p>
              <p className="text-xs text-slate-500 font-medium mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 교육 과정 선택 섹션 */}
      <section id="courses" className="py-16 sm:py-24 px-4 max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <span className="text-xs font-bold text-cyan-600 tracking-wider">BLUE PEACE COURSES</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">교육 과정 안내</h2>
          <p className="text-xs text-slate-500 mt-2">희망하시는 코스를 누르시면 전담 매칭 문의 페이지로 바로 이동합니다.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat) => (
            <div key={cat.id} className="bg-white border border-slate-200/90 rounded-2xl p-6 flex flex-col justify-between hover:border-cyan-400 transition-all duration-300 shadow-sm hover:shadow-md">
              <div>
                <span className="text-[10px] font-bold text-cyan-700 bg-cyan-50 px-2.5 py-1 rounded-md border border-cyan-200">
                  {cat.association}
                </span>
                <h3 className="text-xl font-bold text-slate-900 mt-3">{cat.name}</h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">{cat.intro}</p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100">
                <Link
                  href={`/inquiry?course=${cat.id}`}
                  className="w-full py-3 bg-slate-900 hover:bg-cyan-600 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <span>{cat.name} 문의하기</span>
                  <ArrowIcon />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 블루피스 맞춤형 강사진 섹션 (기본 4명 랜덤 / 전체보기 버튼 지원) */}
      <section id="instructors" className="py-16 sm:py-24 bg-white border-y border-slate-200 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <span className="text-xs font-bold text-cyan-600 bg-cyan-50 px-3 py-1 rounded-full border border-cyan-200">
            BLUE PEACE INSTRUCTORS
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-3">
            🌊 블루피스 맞춤형 강사진
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-2 max-w-2xl mx-auto leading-relaxed font-medium">
            블루피스는 특정 강사 지정 없이, 수강생분의 희망 일정과 장소에<br />
            가장 완벽히 부합하는 강사님을 100% 공정하게 맞춤 매칭합니다.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5 mt-10">
            {visibleInstructors.map((ins) => (
              <div key={ins.id} className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-left sm:text-center hover:border-cyan-400 transition-all duration-300 shadow-sm group">
                <div className="w-20 h-20 sm:mx-auto rounded-2xl bg-slate-200 overflow-hidden border border-slate-300 mb-3 flex items-center justify-center group-hover:scale-105 transition-transform shadow-inner">
                  {ins.profile_image ? (
                    <img src={ins.profile_image} alt={ins.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-[10px] text-slate-400">프로필 준비중</span>
                  )}
                </div>
                <h3 className="text-sm font-bold text-slate-900">{ins.name} 강사</h3>
                <p className="text-[11px] text-cyan-600 font-semibold mt-0.5">블루피스 공식 강사</p>
                <ExpandableText
                  text={ins.bio || '안전하고 즐거운 강습을 약속드립니다.'}
                  collapsedLines={3}
                  threshold={62}
                  className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600"
                  buttonClassName="bg-white text-cyan-700 border border-cyan-200"
                />
              </div>
            ))}
          </div>

          {/* 전체 강사진 확인하기 버튼 */}
          {instructors.length > 4 && (
            <div className="mt-8">
              <button
                type="button"
                onClick={() => setShowAllInstructors(!showAllInstructors)}
                className="py-3 px-6 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm rounded-xl transition shadow-md inline-flex items-center gap-2 cursor-pointer"
              >
                <span>{showAllInstructors ? '강사진 간단히 보기 ▲' : `전체 강사진 확인하기 (${instructors.length}명) ∨`}</span>
              </button>
            </div>
          )}
        </div>
      </section>

      {/* FAQ 자주 묻는 질문 섹션 */}
      <section id="faq" className="py-16 px-4 max-w-3xl mx-auto">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 text-center mb-8">❓ 자주 묻는 질문</h2>
        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div key={idx} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
              <button
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full text-left flex justify-between items-center text-xs sm:text-sm font-bold text-slate-800"
              >
                <span>Q. {faq.question}</span>
                <span className="text-cyan-600 font-bold">{openFaq === idx ? '▲' : '▼'}</span>
              </button>
              {openFaq === idx && (
                <p className="text-xs text-slate-600 mt-3 pt-3 border-t border-slate-100 leading-relaxed font-medium">
                  A. {faq.answer}
                </p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 📸 블루피스 수중 순간들 */}
      <section id="gallery" className="py-16 px-4 max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <span className="text-xs font-bold text-cyan-600 tracking-wider">GALLERY</span>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">📸 블루피스 수중 순간들</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5">
          {galleryPhotos.map((img, idx) => (
            <div
              key={idx}
              onClick={() => setSelectedPhoto(img.src)}
              className="relative h-40 sm:h-52 rounded-2xl overflow-hidden border border-slate-200 cursor-pointer group shadow-sm bg-slate-100"
            >
              <Image src={img.src} alt={img.alt} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-xs text-white font-bold backdrop-blur-xs">
                확대 보기 ↗
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ⭐ 네이버 플레이스 실제 방문자 리뷰 섹션 */}
      <section id="reviews" className="py-16 bg-white border-y border-slate-200 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            NAVER REVIEWS
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-3">
            ⭐ 생생한 수강생 네이버 실제 리뷰
          </h2>
          <p className="text-xs text-slate-500 mt-2">블루피스 네이버 플레이스에 남겨주신 수강생분들의 솔직한 후기입니다.</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-10 text-left">
            {placeReviews.map((rev, idx) => (
              <div key={idx} className="bg-slate-50 border border-slate-200 p-5 rounded-2xl flex flex-col justify-between shadow-sm">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded">
                      {rev.course}
                    </span>
                    <span className="text-xs text-amber-500">★★★★★</span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 mb-2">{rev.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed font-medium">"{rev.quote}"</p>
                </div>
                <p className="text-[11px] text-slate-400 mt-4 pt-3 border-t border-slate-200 text-right">
                  작성자: {rev.author} 님
                </p>
              </div>
            ))}
          </div>

          <div className="mt-8">
            <a
              href={naverReviewUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 py-3.5 px-6 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl text-xs sm:text-sm transition shadow-md"
            >
              <span>💚 네이버 플레이스에서 모든 리뷰 직접 확인하기 ↗</span>
            </a>
          </div>
        </div>
      </section>

      {/* Center Location (지도 및 길찾기) */}
      <section id="location" className="py-16 px-4 max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div>
            <span className="text-xs font-bold text-cyan-600 bg-cyan-50 px-3 py-1 rounded-full border border-cyan-200">
              LOCATION
            </span>
            <h2 className="text-2xl font-bold text-slate-900 mt-3">📍 블루피스 센터 찾아오시는 길</h2>
            
            <div className="mt-6 space-y-4 text-xs sm:text-sm text-slate-700">
              <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-1 shadow-sm">
                <p className="text-cyan-600 font-bold">🏠 센터 주소</p>
                <p className="text-slate-900 font-semibold">{centerAddress}</p>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-1 shadow-sm">
                <p className="text-cyan-600 font-bold">🚗 주차 안내</p>
                <p className="text-slate-600 leading-relaxed font-medium">
                  센터 건물 전용 주차장 및 인근 골목 무료 주차가 상시 가능하므로 편하게 방문해 주시면 됩니다.
                </p>
              </div>

              <a
                href={centerMapLink}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 py-3 px-5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl transition text-xs shadow-sm"
              >
                🗺️ 네이버 지도에서 길찾기 ↗
              </a>
            </div>
          </div>

          <div className="h-72 sm:h-80 rounded-2xl overflow-hidden border border-slate-200 shadow-md bg-white">
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

      {/* 수중 사진 큰 화면 모달 Lightbox */}
      {selectedPhoto && (
        <div
          onClick={() => setSelectedPhoto(null)}
          className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 cursor-pointer"
        >
          <div className="relative max-w-4xl max-h-[85vh] w-full h-full">
            <Image src={selectedPhoto} alt="확대 사진" fill className="object-contain" />
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-10 px-4 text-center text-xs text-slate-500">
        <p className="font-bold text-slate-700 mb-1">{business.name} | 대표: {business.owner}</p>
        <p>사업자등록번호: {business.registration} | 주소: {centerAddress}</p>
        <p className="mt-3 text-[10px] text-slate-400">© BLUE PEACE. All rights reserved.</p>
      </footer>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-cyan-100 bg-white/95 px-4 pt-3 shadow-[0_-8px_24px_rgba(15,23,42,0.12)] backdrop-blur md:hidden" style={{ paddingBottom: 'max(12px, env(safe-area-inset-bottom))' }}>
        <Link
          href="/inquiry?course=freediving"
          className="mx-auto flex min-h-12 max-w-md items-center justify-center rounded-2xl bg-cyan-600 px-5 text-base font-extrabold text-white shadow-lg shadow-cyan-600/20"
        >
          지금 맞춤 강사 신청하기
        </Link>
      </div>

    </main>
  );
}
