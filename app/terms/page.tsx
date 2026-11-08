import Link from 'next/link';

export const metadata = {
  title: '상담 및 이용 안내 | 블루피스',
  description: '블루피스 교육 상담과 예약 확정, 별도 비용, 일정 변경·취소 안내를 확인하세요.',
  alternates: { canonical: '/terms' },
};

export default function TermsPage() {
  return (
    <main className="min-h-screen break-keep bg-slate-50 px-4 py-10 text-slate-800 sm:py-16">
      <article className="mx-auto max-w-3xl rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
        <p className="text-sm font-bold text-cyan-700">BLUE PEACE GUIDE</p>
        <h1 className="mt-2 text-2xl font-black text-slate-950">상담 및 이용 안내</h1>
        <div className="mt-8 space-y-7 text-base leading-7">
          <section><h2 className="font-black text-slate-950">상담 요청과 예약</h2><div className="mt-2 space-y-2"><p>홈페이지 신청은 교육 상담 요청입니다.</p><p>강사 가능 여부, 풀장 일정과 추가 비용을 확인하고 고객과 일정을 조율한 뒤 예약이 확정됩니다.</p></div></section>
          <section><h2 className="font-black text-slate-950">비용</h2><div className="mt-2 space-y-2"><p>과정 화면에는 확인된 교육비와 자격 발급비 포함 여부를 표시합니다.</p><p>풀장 입장료와 장비 대여료는 별도이며, 실제 이용 조건에 따라 상담에서 안내합니다.</p></div></section>
          <section><h2 className="font-black text-slate-950">교육 일정</h2><p className="mt-2">신규 상담 신청에서는 풀장·요일·회차를 미리 선택하지 않습니다. 대표가 고객과 연락해 가능한 장소와 일정을 확인합니다. 과거 일정 매칭 신청에 남긴 희망 조건은 당시 상담 대안이며 예약 확정 기록으로 바뀌지 않습니다.</p></section>
          <section><h2 className="font-black text-slate-950">변경·취소</h2><p className="mt-2">예약 확정 전에는 담당자와 일정을 조율할 수 있습니다. 확정 후 변경·취소와 환불 조건은 결제 전에 안내받은 과정 및 풀장 조건에 따릅니다.</p></section>
        </div>
        <Link href="/" className="mt-8 inline-flex min-h-12 items-center rounded-xl bg-cyan-700 px-5 text-base font-bold text-white">홈으로 돌아가기</Link>
      </article>
    </main>
  );
}
