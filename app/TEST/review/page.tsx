import Image from 'next/image';
import Link from 'next/link';

export const metadata = { title: '블루피스 화면 검수 자료', robots: { index: false, follow: false } };

const captures = [
  { src: '/review/home-mobile.jpg', title: '메인 · 모바일 390px', detail: '지역 안내, 교육 진입 버튼과 과정 카드', width: 390, height: 1400 },
  { src: '/review/home-desktop.jpg', title: '메인 · PC 1440px', detail: '첫 화면과 처음 시작하기 동선', width: 1440, height: 1050 },
  { src: '/review/inquiry-mobile.jpg', title: '상담 신청 · 모바일 390px', detail: '실제 화면을 모의 입력 없이 촬영', width: 390, height: 1500 },
  { src: '/review/completion-mobile.jpg', title: '상담 완료 · 모바일 390px', detail: '브라우저 안에서만 처리한 모의 완료 화면', width: 390, height: 820 },
  { src: '/review/admin-fake-mobile.jpg', title: '관리자 상담 · 가상 데이터', detail: '격리된 로컬 화면에서 가상 고객·강사 정보로 촬영. 공개 관리자 기능이 아닙니다.', width: 390, height: 1500 },
];

export default function ReviewPage() {
  return <main className="min-h-screen break-keep bg-[#f7f8f5] px-4 py-10 text-slate-900 sm:py-16">
    <div className="mx-auto max-w-6xl">
      <Link href="/TEST" className="inline-flex min-h-11 items-center font-bold text-teal-800">← 미리보기 홈</Link>
      <p className="mt-5 text-sm font-bold tracking-widest text-teal-800">BLUE PEACE REVIEW</p>
      <h1 className="mt-2 text-3xl font-black">화면 검수 자료</h1>
      <p className="mt-4 max-w-3xl text-base leading-8 text-slate-700">공개 미리보기의 주요 화면을 PC와 모바일 브라우저에서 자동 촬영했습니다. 관리자 화면은 가상 데이터가 들어간 이미지입니다. 실제 운영 고객·강사 정보나 관리자 로그인 기능은 포함하지 않습니다.</p>
      <p className="mt-3 max-w-3xl rounded-xl bg-amber-50 p-4 text-sm leading-7 text-amber-950">이미지는 해당 배포 시점의 검수 자료입니다. 실제 조작은 <Link href="/TEST" className="font-bold underline">미리보기 홈</Link>에서 확인해 주세요. 공개 상담 제출은 데이터가 저장되지 않는 모의 동작입니다.</p>
      <div className="mt-8 grid gap-7 lg:grid-cols-2">
        {captures.map(item => <article key={item.src} className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <h2 className="text-xl font-black">{item.title}</h2>
          <p className="mt-1 text-sm leading-6 text-slate-600">{item.detail}</p>
          <a href={item.src} className="mt-2 inline-flex min-h-11 items-center font-bold text-teal-800 underline">원본 이미지 열기</a>
          <div className="mt-3 max-h-[650px] overflow-auto rounded-xl border border-slate-200 bg-slate-100">
            <Image src={item.src} width={item.width} height={item.height} alt={`${item.title} 검수 화면`} className="h-auto w-full" unoptimized />
          </div>
        </article>)}
      </div>
    </div>
  </main>;
}
