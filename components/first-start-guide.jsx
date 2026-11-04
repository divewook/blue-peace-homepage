"use client";

import { useState } from "react";
import Link from "next/link";
import { courseCatalog } from "../lib/booking-options";
import { goalById, startingGoals } from "../lib/home-guide";

export default function FirstStartGuide({ basePath = "" }) {
  const [selectedId, setSelectedId] = useState(null);
  const selected = goalById(selectedId);
  const related = selected?.courseIds.map(id => courseCatalog.find(course => course.id === id)).filter(Boolean) || [];

  return <section id="start" aria-labelledby="start-title" className="bg-[#ecf3f1] px-4 py-16 sm:py-24">
    <div className="mx-auto max-w-6xl">
      <div className="max-w-2xl">
        <p className="text-sm font-bold tracking-[0.16em] text-teal-800">YOUR FIRST STEP</p>
        <h2 id="start-title" className="mt-3 text-3xl font-black leading-tight text-slate-950 sm:text-4xl">처음이라면, 하고 싶은 경험부터 골라보세요.</h2>
        <p className="mt-4 text-base leading-8 text-slate-700">과정 이름이나 레벨을 몰라도 괜찮습니다. 아래에서 마음이 가는 항목 하나만 선택해 보세요.</p>
      </div>

      <div role="group" aria-label="관심 있는 수중 경험 선택" className="mt-9 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {startingGoals.map((goal, index) => <button key={goal.id} type="button" aria-pressed={selectedId === goal.id} onClick={() => { setSelectedId(goal.id); try { sessionStorage.setItem('bluepeace_selected_goal', goal.id); } catch {} }} className={`flex min-h-24 items-start gap-4 rounded-2xl border p-5 text-left transition-colors focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-cyan-600 ${selectedId === goal.id ? "border-teal-700 bg-white ring-2 ring-teal-700/20" : "border-slate-200 bg-white/80 hover:border-teal-400"}`}>
          <span aria-hidden="true" className="font-mono text-sm font-bold text-teal-700">0{index + 1}</span>
          <span className="flex-1 text-base font-bold leading-7 text-slate-900">{goal.label}</span>
          <span aria-hidden="true" className="text-teal-700">{selectedId === goal.id ? "✓" : "↗"}</span>
        </button>)}
      </div>

      {selected && <div id="start-result" role="region" aria-live="polite" aria-label="관심사별 교육 안내" className="mt-6 rounded-3xl bg-[#123847] p-6 text-white sm:p-8">
        <p className="text-sm font-bold text-teal-200">관심사에 맞는 교육 안내</p>
        <h3 className="mt-2 text-xl font-black leading-8 sm:text-2xl">{selected.label}</h3>
        <p className="mt-3 max-w-3xl text-base leading-8 text-slate-100">{selected.description}</p>
        {related.length > 0 && <ul className="mt-6 grid gap-3 sm:grid-cols-2">
          {related.map(course => <li key={course.id} className="rounded-2xl border border-white/20 bg-white/10 p-4">
            <strong className="text-base">{course.name}</strong>
            <p className="mt-1 text-sm leading-6 text-slate-100">{course.summary}</p>
            <a href={`#course-${course.id === "special" ? "photo" : course.id}`} className="mt-3 inline-flex min-h-11 items-center text-sm font-bold text-teal-100 underline underline-offset-4">과정 내용 보기 →</a>
          </li>)}
        </ul>}
        <p className="mt-5 text-sm leading-6 text-slate-200">이 안내는 관심사별 과정 소개입니다. 참여 자격이나 적합성을 확정하는 진단은 아닙니다.</p>
        <Link href={`${basePath}/inquiry?goal=${selected.id}`} className="mt-5 inline-flex min-h-12 items-center justify-center rounded-xl bg-white px-6 text-base font-bold text-[#123847]">이 관심사로 상담 시작하기</Link>
      </div>}
    </div>
  </section>;
}
