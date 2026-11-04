import Image from "next/image";
import Link from "next/link";
import { courseCatalog } from "../lib/booking-options";
import { educationCards } from "../lib/home-guide";

const freedivingPriceNames = {
  trial: "원데이 체험",
  level1: "프리다이빙 1레벨",
  level2: "프리다이빙 2레벨",
  package12: "프리다이빙 1+2레벨 통합",
};
const won = { trial: "50,000원", level1: "150,000원", level2: "300,000원", package12: "400,000원" };

export default function EducationCourseGrid({ basePath = "" }) {
  return <section id="courses" aria-labelledby="courses-title" className="mx-auto max-w-6xl px-4 py-16 sm:py-24">
    <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
      <div className="max-w-2xl">
        <p className="text-sm font-bold tracking-[0.16em] text-teal-800">BLUE PEACE EDUCATION</p>
        <h2 id="courses-title" className="mt-3 text-3xl font-black leading-tight text-slate-950 sm:text-4xl">다양한 물속 경험을 위한 교육</h2>
        <p className="mt-4 text-base leading-8 text-slate-700">프리다이빙부터 스쿠버, 머메이드, 유스, 수중레저안전, 수중 촬영과 응급처치까지. 현재 안내 중인 과정을 살펴보세요.</p>
      </div>
      <Link href={`${basePath}/inquiry`} className="inline-flex min-h-12 shrink-0 items-center justify-center rounded-xl border border-teal-700 px-5 text-base font-bold text-teal-900">과정을 모르겠다면 상담하기 →</Link>
    </div>

    <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-base font-semibold leading-7 text-amber-950">
      모든 교육과정의 풀장 입장료와 장비 렌탈료는 교육비와 별도입니다. 상담 신청만으로 예약이나 결제가 확정되지 않습니다.
    </div>

    <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      {educationCards.map(card => {
        const course = courseCatalog.find(item => item.id === card.courseId);
        if (!course) return null;
        const levels = card.levelIds ? course.levels.filter(level => card.levelIds.includes(level.id)) : course.levels;
        return <article id={`course-${card.id}`} key={card.id} className="flex scroll-mt-32 flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="relative h-44 overflow-hidden bg-slate-100 sm:h-48"><Image src={card.image} alt={card.imageAlt} fill sizes="(max-width: 767px) 100vw, (max-width: 1279px) 50vw, 33vw" className="object-cover" /></div>
          <div className="flex flex-1 flex-col p-5 sm:p-6">
            <p className="text-sm font-bold text-teal-800">{card.tag}</p>
            <h3 className="mt-2 text-2xl font-black leading-tight text-slate-950">{card.title}</h3>
            <p className="mt-3 text-base leading-7 text-slate-700">{card.description || course.summary}</p>
            <p className="mt-3 text-sm leading-6 text-slate-600"><strong className="text-slate-800">이런 분께:</strong> {card.audience || course.audience}</p>

            {card.id === "freediving" ? <div className="mt-5 rounded-2xl bg-[#ecf3f1] p-4">
              <p className="text-sm font-bold text-teal-900">확정 교육비</p>
              <ul className="mt-2 space-y-2">{["trial", "level1", "level2", "package12"].map(id => <li key={id} className="flex flex-wrap items-baseline justify-between gap-x-3 text-sm leading-6"><span className="text-slate-800">{freedivingPriceNames[id]}</span><strong className="text-base text-slate-950">{won[id]}</strong></li>)}</ul>
              <p className="mt-3 text-sm leading-6 text-teal-950">자격 과정 교육비에는 자격증 발급비가 포함됩니다.</p>
            </div> : <p className="mt-5 text-lg font-black text-teal-900">{card.id === "photo" ? "수중 사진 촬영 교육 15만원" : card.id === "cpr" ? "응급처치·CPR 교육 15만원부터" : course.startingPrice}</p>}

            {card.id === "freediving" && <p className="mt-4 text-sm leading-6 text-slate-700">자격증 취득 전까지 횟수·기간 제한 없는 트레이닝을 지원합니다. 자격증은 평가 기준 충족 시 발급됩니다. 풀장 입장료와 장비 렌탈료는 별도입니다.</p>}
            <details className="group mt-5 border-t border-slate-200 pt-4"><summary className="flex min-h-11 cursor-pointer items-center justify-between text-sm font-bold text-slate-900">과정별 교육비와 안내 보기 <span aria-hidden="true" className="text-teal-700 group-open:rotate-180">⌄</span></summary>
              <ul className="mt-2 divide-y divide-slate-100">{levels.map(level => <li key={level.id} className="py-3 text-sm leading-6"><div className="flex flex-wrap justify-between gap-x-2 font-bold text-slate-900"><span>{card.id === "freediving" && freedivingPriceNames[level.id] || level.name}</span><span>{card.id === "freediving" && won[level.id] || level.price}</span></div><p className="text-slate-600">{level.issuance}</p></li>)}</ul>
              <p className="mt-2 text-sm leading-6 text-slate-600">참여 조건과 수업 횟수 등 미확정 내용은 상담에서 확인합니다.</p>
            </details>
            {course.id === "special" && <p className="mt-4 text-sm leading-6 text-slate-600">상담 화면에서 원하는 스페셜 교육을 선택해 주세요.</p>}
            <Link href={`${basePath}/inquiry?course=${card.id === "photo" ? "photo&level=photo" : card.id === "cpr" ? "cpr" : course.id}`} className="mt-6 flex min-h-12 items-center justify-center rounded-xl bg-[#123847] px-4 text-center text-base font-bold text-white hover:bg-teal-800">{card.title} 상담 시작하기 →</Link>
          </div>
        </article>;
      })}
    </div>
  </section>;
}
