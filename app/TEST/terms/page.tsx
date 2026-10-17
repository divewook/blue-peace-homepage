import Link from 'next/link';

export default function TestTermsPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 text-slate-800 sm:py-16">
      <article className="mx-auto max-w-3xl rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
        <span className="rounded-full bg-amber-100 px-3 py-1 text-sm font-bold text-amber-900">운영자 검토용 안내</span>
        <h1 className="mt-4 text-2xl font-black text-slate-950">상담 및 이용 안내</h1>
        <div className="mt-7 space-y-6 text-base leading-7">
          <section><h2 className="font-black text-slate-950">상담 요청과 예약</h2><p className="mt-2">홈페이지의 신청은 교육 상담 요청입니다. 강사 가능 여부, 풀장 일정, 추가 비용을 확인하고 일정을 조율한 뒤 예약이 확정됩니다.</p></section>
          <section><h2 className="font-black text-slate-950">비용</h2><p className="mt-2">표시된 교육비와 발급비 포함 여부는 현재 저장소의 가격표를 기준으로 합니다. 풀장 입장료와 장비 렌탈료는 별도이며 확정 금액 자료가 없어 상담에서 확인해야 합니다.</p></section>
          <section><h2 className="font-black text-slate-950">일정</h2><p className="mt-2">입력한 여러 일정은 가능한 대안이며 여러 회차 예약을 뜻하지 않습니다. 공휴일과 풀장 운영 상태는 상담 시 다시 확인합니다.</p></section>
          <section className="rounded-2xl border border-amber-200 bg-amber-50 p-4"><h2 className="font-black text-amber-950">확정이 필요한 운영 정책</h2><ul className="mt-2 list-disc space-y-1 pl-5 text-amber-950"><li>결제 시점과 수단</li><li>예약 변경·취소·환불 기준</li><li>노쇼 및 지각 처리</li><li>무제한 트레이닝의 기간·예약 조건·별도 비용</li><li>강사 변경 요청 절차</li></ul></section>
        </div>
        <Link href="/TEST" className="mt-8 inline-flex min-h-12 items-center rounded-xl bg-cyan-700 px-5 text-base font-bold text-white">테스트 홈으로 돌아가기</Link>
      </article>
    </main>
  );
}
