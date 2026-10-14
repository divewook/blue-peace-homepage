"use client";

import { useState } from "react";

// 운영 전 문의 이메일과 예시 후기를 실제 정보로 교체하세요.
const contactEmail = "hello@example.com";

// 교육 내용 변경 시 각 코스의 curriculum 값만 수정하면 카드에 반영됩니다.
// price는 교육비와 발급비를 합한 총 비용입니다.

const categories = [
  {
    id: "adult",
    name: "성인 프리다이빙",
    association: "AIDA / PSA",
    intro: "처음 숨을 고르는 순간부터 더 깊은 도전까지, 블루피스와 함께 단계별로 배웁니다.",
    courses: [
      { title: "1레벨", subtitle: "Freediver", description: "프리다이빙의 기초를 시작하는 과정입니다.", curriculum: { theory: "1시간", pool: "2회 (해양 2회와 택1)", ocean: "2회 (풀장 2회와 택1)", price: "15만원" } },
      { title: "2레벨", subtitle: "Open Water", description: "기본기를 바탕으로 개방 수역 경험을 넓혀가는 과정입니다.", unlimited: true, curriculum: { theory: "2시간", pool: "무제한 (취득까지)", ocean: "무제한 (취득까지)", price: "40만원" } },
      { title: "3레벨", subtitle: "Advanced", description: "기술과 안전 절차를 더 깊이 익히는 심화 과정입니다.", unlimited: true, curriculum: { theory: "2시간", pool: "무제한 (취득까지)", ocean: "무제한 (취득까지)", price: "55만원" } },
      { title: "4레벨", subtitle: "Master", description: "숙련도를 높이고 다음 단계를 준비하는 과정입니다.", unlimited: true, curriculum: { theory: "2시간", pool: "무제한 (취득까지)", ocean: "무제한 (취득까지)", price: "85만원" } },
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
      { title: "수중레저안전요원", description: "야간 해루질 관련 자격 과정입니다. 실제 활동 가능 범위는 지역 규정을 확인해 주세요.", unlimited: true, curriculum: { theory: "2시간", pool: "무제한 (자격증 취득까지)", ocean: "희망 시 가능", price: "35만원" } },
      { title: "마스터 수중레저안전요원", description: "야간 해루질 관련 상위 등급 자격 과정입니다. 실제 활동 가능 범위는 지역 규정을 확인해 주세요.", unlimited: true, curriculum: { theory: "2시간", pool: "무제한 (자격증 취득까지)", ocean: "희망 시 가능", price: "55만원" } },
      { title: "수중레저안전요원 강사 과정", description: "야간 1인 해루질 관련 자격 과정입니다. 실제 활동 가능 범위는 지역 규정을 확인해 주세요.", instructor: true, curriculum: { theory: "별도 문의", pool: "별도 문의", ocean: "필수 진행", price: "별도 문의" } },
    ],
  },
  {
    id: "mermaid",
    name: "머메이드 다이빙",
    association: "PSA",
    intro: "움직임과 표현의 즐거움을 만나는 블루피스 머메이드 과정입니다.",
    courses: [
      { title: "베이직 머메이드", description: "머메이드 다이빙의 기초 움직임을 배우는 과정입니다.", unlimited: true, curriculum: { theory: "2시간", pool: "무제한 (자격증 취득까지)", ocean: "없음", price: "35만원" } },
      { title: "머메이드", description: "기본 동작을 확장하며 물속 표현을 익히는 과정입니다.", unlimited: true, curriculum: { theory: "2시간", pool: "무제한 (자격증 취득까지)", ocean: "없음", price: "45만원" } },
      { title: "오션 머메이드", description: "머메이드 동작을 심화하는 과정입니다.", unlimited: true, curriculum: { theory: "2시간", pool: "무제한 (자격증 취득까지)", ocean: "없음", price: "55만원" } },
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

const sampleReviews = [
  {
    title: "첫 바다의 기억",
    quote: "물속에 들어가기 전엔 긴장했는데, 호흡부터 천천히 배우니 어느새 바다를 즐기고 있었어요.",
    author: "블루피스 성인 프리다이빙 · 예시 후기",
  },
  {
    title: "배움의 순간",
    quote: "작은 자세 하나가 달라졌을 뿐인데 물속 움직임이 훨씬 편해졌어요. 제 속도에 맞춰 배울 수 있어 좋았습니다.",
    author: "블루피스 유스 프리다이빙 · 예시 후기",
  },
  {
    title: "다음 도전의 시작",
    quote: "기록보다 안전과 기본을 먼저 생각하게 됐어요. 다음 바다에서는 조금 더 여유롭게 다이빙하고 싶습니다.",
    author: "블루피스 스쿠버다이빙 · 예시 후기",
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
  const activeCategory = categories[activeTab];

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
            <a href="#instructors" className="transition hover:text-[#8ce5ed]">블루피스 소개</a>
            <a href="#reviews" className="transition hover:text-[#8ce5ed]">수강생 후기</a>
            <a href="#contact" className="hidden rounded-full border border-white/55 px-5 py-2.5 transition hover:bg-white hover:text-[#073d57] md:inline-flex">교육 문의 ↗</a>
          </div>
        </nav>
      </header>

      <section id="top" className="relative isolate flex min-h-[780px] items-center bg-[#073954] text-white sm:min-h-[850px]">
        <div
          className="absolute inset-0 -z-20 bg-cover bg-[center_36%]"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1743656619958-68d85790bdb4?auto=format&fit=crop&w=2400&q=90')" }}
        />
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(2,24,42,.84)_0%,rgba(3,35,55,.63)_48%,rgba(3,42,62,.22)_100%)]" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-[#031b2f]/75 via-transparent to-[#031b2f]/20" />
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
            <a href="#contact" className="inline-flex min-h-14 items-center gap-8 rounded-full bg-[#b7ebf0] px-7 text-sm font-bold text-[#08384f] shadow-[0_10px_0_#58aab8,0_22px_35px_rgba(0,0,0,.28)] transition duration-200 hover:-translate-y-1 hover:shadow-[0_14px_0_#58aab8,0_26px_40px_rgba(0,0,0,.3)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">
              교육 문의하기 <ArrowIcon diagonal />
            </a>
            <a href="#courses" className="inline-flex min-h-14 items-center gap-8 rounded-full border border-white/60 bg-white/10 px-7 text-sm font-semibold text-white shadow-[0_12px_28px_rgba(0,0,0,.18)] backdrop-blur-md transition hover:-translate-y-1 hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">
              코스 둘러보기 <ArrowIcon />
            </a>
          </div>
        </div>
        <div className="absolute bottom-7 left-6 right-6 mx-auto flex max-w-[1312px] items-center justify-between border-t border-white/25 pt-5 text-[10px] font-semibold uppercase tracking-[0.28em] text-white/65 sm:left-10 sm:right-10 lg:left-16 lg:right-16">
          <span>Ocean is calling</span><span>Scroll to explore ↓</span>
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
                className={`min-h-14 rounded-2xl px-3 py-3 text-center text-xs font-bold leading-5 transition sm:text-sm ${activeTab === index ? "bg-[#083b57] text-white shadow-[0_9px_20px_rgba(8,59,87,.25)]" : "text-[#456879] hover:bg-[#edf6f8] hover:text-[#083b57]"}`}
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
                  { key: "price", label: "총 비용 · 교육비 + 발급비", symbol: "₩" },
                ];
                return (
                  <article key={`${activeCategory.id}-${course.title}`} className={`flex h-full flex-col rounded-[1.75rem] border p-7 transition duration-300 hover:-translate-y-1 sm:p-8 ${course.instructor ? "border-[#c49b58] bg-[#0d4056] text-white shadow-[0_22px_55px_rgba(8,59,87,.2)]" : "border-[#d9e7ec] bg-white text-[#102e40] shadow-[0_16px_42px_rgba(18,57,78,.08)]"}`}>
                    <div className="flex items-start justify-between gap-4">
                      <span className={`rounded-full px-3 py-1.5 text-[11px] font-bold tracking-wide ${course.instructor ? "bg-[#e6bd73] text-[#15384a]" : "bg-[#e5f4f6] text-[#08728d]"}`}>발급 협회 · {activeCategory.association}</span>
                      <span className={`text-xs font-semibold ${course.instructor ? "text-[#e6bd73]" : "text-[#9ab2bc]"}`}>{String(index + 1).padStart(2, "0")}</span>
                    </div>
                    {course.instructor && <span className="mt-8 inline-flex self-start rounded-full border border-[#e6bd73]/60 px-3 py-1.5 text-[11px] font-extrabold tracking-wide text-[#f3d396]">★ 강사 과정 · 별도 문의</span>}
                    {course.unlimited && <span className="mt-8 inline-flex max-w-full self-start rounded-full bg-[#d9f3ee] px-3 py-1.5 text-[11px] font-extrabold leading-5 text-[#086e73]">∞ 자격증 취득할 때까지 {activeCategory.id === "adult" ? "풀장/해양 실습" : "풀장 실습"} 무제한 진행</span>}
                    <h4 className={`${course.instructor || course.unlimited ? "mt-4 text-2xl sm:text-[1.7rem]" : "mt-10 text-2xl"} font-semibold leading-tight tracking-[-0.04em]`}>{course.title}</h4>
                    {course.subtitle && <p className={`mt-1 text-sm font-medium ${course.instructor ? "text-[#a6d5df]" : "text-[#087f9b]"}`}>{course.subtitle}</p>}
                    <p className={`mt-5 min-h-16 text-sm leading-7 ${course.instructor ? "text-white/75" : "text-[#5c7381]"}`}>{course.description}</p>

                    <dl className="mt-6 grid grid-cols-2 gap-2.5">
                      {curriculumFields.map((field) => (
                        <div key={field.key} className={`min-h-28 rounded-2xl border p-4 ${course.instructor ? "border-white/15 bg-white/10" : field.key === "price" ? "border-[#b6dce4] bg-[#e3f3f6]" : "border-[#e1ebef] bg-[#f2f7f9]"}`}>
                          <dt className={`flex items-center gap-2 text-[11px] font-bold leading-4 ${course.instructor ? "text-[#d4e9ec]" : "text-[#577786]"}`}>
                            <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] ${course.instructor ? "bg-[#e6bd73] text-[#12384c]" : "bg-white text-[#087f9b]"}`}>{field.symbol}</span>
                            {field.label}
                          </dt>
                          <dd className={`mt-3 break-keep text-sm font-semibold leading-6 sm:text-base ${course.instructor ? "text-white" : field.key === "price" ? "text-[#075d78]" : "text-[#173c4c]"}`}>{curriculum[field.key]}</dd>
                        </div>
                      ))}
                    </dl>
                    <a href={`mailto:${contactEmail}?subject=${encodeURIComponent(`블루피스 ${activeCategory.name} - ${course.title} 교육 문의`)}`} className={`mt-7 inline-flex min-h-12 items-center justify-between gap-4 rounded-full px-5 text-sm font-bold transition hover:-translate-y-0.5 ${course.instructor ? "bg-[#e6bd73] text-[#12384c] shadow-[0_8px_20px_rgba(0,0,0,.18)]" : "bg-[#0b5b77] text-white shadow-[0_8px_20px_rgba(11,91,119,.18)]"}`}>교육 문의하기 <ArrowIcon diagonal /></a>
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
        <div className="mx-auto grid max-w-[1312px] items-center gap-12 lg:grid-cols-2 lg:gap-20">
          <div className="relative h-[440px] overflow-hidden rounded-[2rem] bg-[#0e607b] shadow-[0_25px_70px_rgba(18,57,78,.16)] sm:h-[560px]">
            <div className="absolute inset-0 bg-cover bg-center" role="img" aria-label="바다에서 다이빙하는 프리다이버의 참고 이미지" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1674786375512-0b1d38fda375?auto=format&fit=crop&w=1300&q=85')" }} />
            <div className="absolute inset-0 bg-gradient-to-t from-[#082b44]/65 to-transparent" />
            <span className="absolute bottom-7 left-7 rounded-full border border-white/60 bg-white/10 px-4 py-2 text-xs text-white backdrop-blur-sm">블루피스 소개용 예시 이미지</span>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#087f9b]">About Blue Peace</p>
            <h2 className="mt-5 text-4xl font-semibold leading-[1.2] tracking-[-0.06em] sm:text-5xl">바다를 함께할<br />블루피스</h2>
            <p className="mt-7 max-w-lg text-base leading-8 text-[#587182]">블루피스는 처음 물속으로 향하는 순간부터 다음 단계의 도전까지, 각 과정의 목표에 맞춘 교육 경험을 안내합니다. 호흡과 움직임, 안전을 차근차근 익히며 자신만의 바다를 만나보세요.</p>
            <div className="mt-9 rounded-2xl border border-[#d9e8ec] bg-white p-6 shadow-[0_14px_40px_rgba(18,57,78,.06)]">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#087f9b]">Blue Peace education</p>
              <p className="mt-3 text-xl font-semibold">각자의 속도로, 바다와 더 가까이</p>
              <p className="mt-2 text-sm leading-7 text-[#6a818b]">교육 과정과 담당 강사진의 실제 소개는 준비되는 대로 블루피스 이름으로 안내합니다. 세부 일정과 참여 조건은 교육 문의를 통해 확인해 주세요.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="reviews" className="bg-[#eaf2f5] px-6 py-24 sm:px-10 lg:px-16 lg:py-28">
        <div className="mx-auto max-w-[1312px]">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#087f9b]">Student stories</p>
            <h2 className="mt-5 text-4xl font-semibold tracking-[-0.06em] sm:text-5xl">바다를 경험한 사람들의 이야기</h2>
            <p className="mt-5 leading-8 text-[#587182]">아래 문구는 블루피스 사이트 화면 구성을 위한 예시입니다. 실제 수강생의 동의를 받은 후기로 교체해 주세요.</p>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {sampleReviews.map((review) => (
              <article key={review.title} className="rounded-[1.5rem] border border-[#dce8ec] bg-white p-8 shadow-[0_16px_45px_rgba(18,57,78,.07)]">
                <span className="text-5xl leading-none text-[#7fcbd7]" aria-hidden="true">“</span>
                <h3 className="mt-8 text-xl font-semibold">{review.title}</h3>
                <p className="mt-4 min-h-20 text-sm leading-7 text-[#708892]">{review.quote}</p>
                <div className="mt-6 border-t border-[#e5eef0] pt-5 text-xs font-medium text-[#087f9b]">{review.author}</div>
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
          <a href={`mailto:${contactEmail}`} className="inline-flex min-h-14 items-center justify-between gap-10 self-start rounded-full bg-[#b7ebf0] px-7 text-sm font-bold text-[#08384f] shadow-[0_10px_0_#58aab8,0_22px_35px_rgba(0,0,0,.22)] transition hover:-translate-y-1 lg:self-auto">교육 문의하기 <ArrowIcon diagonal /></a>
        </div>
      </section>

      <footer className="bg-[#032b40] px-6 py-10 text-white/60 sm:px-10 lg:px-16">
        <div className="mx-auto flex max-w-[1312px] flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div><p className="text-xl font-bold tracking-[-0.05em] text-white">Blue Peace<span className="text-[#76d8e8]">.</span></p><p className="mt-3 text-xs">© {new Date().getFullYear()} Blue Peace. All rights reserved.</p></div>
          <p className="text-xs">문의: {contactEmail} <span className="text-white/35">(예시 주소)</span></p>
        </div>
      </footer>
    </main>
  );
}
