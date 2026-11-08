import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getCourse } from '../../../lib/booking-options';
import { getPublicCoursePage, publicCoursePages } from '../../../lib/seo-courses';

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return publicCoursePages.map(page => ({ slug: page.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const page = getPublicCoursePage((await params).slug);
  if (!page) return {};
  return {
    title: page.title,
    description: page.description,
    alternates: { canonical: `/courses/${page.slug}` },
    openGraph: { title: page.title, description: page.description, url: `/courses/${page.slug}`, type: 'website' },
  };
}

export default async function CoursePage({ params }: Props) {
  const page = getPublicCoursePage((await params).slug);
  if (!page) notFound();
  const catalog = getCourse(page.catalogId);
  const levels = catalog?.levels.filter(level => page.levelIds.includes(level.id)) || [];
  const inquiryHref = `/inquiry?course=${page.inquiryCourse}${page.inquiryLevel ? `&level=${page.inquiryLevel}` : ''}`;

  return (
    <main className="min-h-screen break-keep bg-slate-50 px-4 py-8 text-slate-800 sm:py-14">
      <div className="mx-auto max-w-4xl">
        <nav aria-label="위치" className="mb-6 text-sm leading-6 text-slate-600">
          <Link href="/" className="font-semibold text-cyan-800 underline">블루피스 홈</Link> <span aria-hidden="true">/</span> {page.name}
        </nav>
        <header className="rounded-3xl border border-cyan-100 bg-white p-6 sm:p-10">
          <p className="text-sm font-bold text-cyan-700">BLUE PEACE · 대구·경북 수중레저 교육</p>
          <h1 className="mt-3 text-3xl font-black leading-tight text-slate-950 sm:text-4xl">{page.name} 교육 안내</h1>
          <p className="mt-5 text-base leading-8 text-slate-700">{page.intro}</p>
          <p className="mt-4 text-base leading-8 text-slate-700">대구·구미·칠곡·경산을 포함한 대구·경북권에서 교육 과정을 상담합니다. 실제 교육 장소와 일정은 대표가 고객과 확인해 결정합니다.</p>
          <Link href={inquiryHref} className="mt-7 inline-flex min-h-12 items-center rounded-xl bg-cyan-700 px-6 text-base font-bold text-white hover:bg-cyan-800">{page.name} 교육 상담 신청</Link>
          <p className="mt-3 text-sm leading-6 text-slate-600">상담 신청은 수업 예약이나 결제 확정이 아닙니다.</p>
        </header>

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <section className="rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="text-xl font-black text-slate-950">이런 분께 안내합니다</h2>
            <p className="mt-3 text-base leading-8">{page.audience}</p>
          </section>
          <section className="rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="text-xl font-black text-slate-950">상담에서 확인할 내용</h2>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-base leading-7">
              {page.learn.map(item => <li key={item}>{item}</li>)}
            </ul>
          </section>
        </div>

        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-xl font-black text-slate-950">현재 안내 중인 세부 과정</h2>
          <p className="mt-2 text-base leading-7 text-slate-600">과정 이름을 먼저 비교하고, 참여 조건·교육 시간·평가 및 발급 기준은 선택한 과정에 맞춰 확인해 주세요.</p>
          <ul className="mt-4 grid gap-2 sm:grid-cols-2">
            {levels.map(level => <li key={level.id} className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-base font-semibold leading-7">{level.name}</li>)}
          </ul>
          <p className="mt-5 rounded-xl bg-amber-50 p-4 text-base leading-7 text-amber-950">풀장 입장료와 장비 렌탈료는 교육비와 별도입니다. 세부 과정의 교육비와 발급비 포함 여부는 상담 신청 화면에서 확인하고, 실제 이용 조건은 상담에서 다시 안내받으세요.</p>
        </section>

        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-xl font-black text-slate-950">상담 신청 후 진행</h2>
          <ol className="mt-3 list-decimal space-y-2 pl-5 text-base leading-7">
            <li>원하는 분야와 세부 과정을 선택하고 연락처를 남깁니다.</li>
            <li>블루피스 대표가 신청을 확인하고 직접 연락해 교육 조건을 상담합니다.</li>
            <li>장소와 일정을 조율한 뒤 수업 예약 여부를 결정합니다.</li>
          </ol>
          <Link href={inquiryHref} className="mt-6 inline-flex min-h-12 items-center rounded-xl border border-cyan-700 px-5 text-base font-bold text-cyan-800 hover:bg-cyan-50">상담 신청으로 이동</Link>
        </section>
      </div>
    </main>
  );
}
