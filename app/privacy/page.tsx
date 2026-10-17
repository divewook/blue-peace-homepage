import Link from 'next/link';

export const metadata = { title: '개인정보 처리 안내 | 블루피스' };

export default function PrivacyPage() {
  return (
    <main className="min-h-screen break-keep bg-slate-50 px-4 py-10 text-slate-800 sm:py-16">
      <article className="mx-auto max-w-3xl rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
        <p className="text-sm font-bold text-cyan-700">BLUE PEACE PRIVACY</p>
        <h1 className="mt-2 text-2xl font-black text-slate-950">개인정보 처리 안내</h1>
        <p className="mt-3 text-base leading-7 text-slate-600">블루피스 상담 신청 과정에서 처리하는 개인정보와 이용 범위를 안내합니다.</p>

        <div className="mt-8 space-y-7 text-base leading-7">
          <section><h2 className="font-black text-slate-950">수집하는 정보</h2><p className="mt-2">성함, 휴대폰 번호, 선택 과정, 희망 풀장·요일·시간을 수집합니다. 유스 과정은 수강 인원과 연령을 추가로 수집합니다.</p></section>
          <section><h2 className="font-black text-slate-950">이용 목적</h2><p className="mt-2">교육 상담, 가능한 강사 확인, 풀장 일정 조율과 예약 안내에 사용합니다.</p></section>
          <section><h2 className="font-black text-slate-950">열람 및 전달 범위</h2><p className="mt-2">관리자는 신청 내용을 확인할 수 있습니다. 강사가 배정되면 해당 담당 강사에게 상담에 필요한 신청 내용과 연락처가 전달됩니다.</p></section>
          <section><h2 className="font-black text-slate-950">선택 분석 정보</h2><p className="mt-2">유입 경로, 검색어, 캠페인과 기기 유형은 선택 동의한 경우에만 신청 정보와 함께 저장합니다. 동의하지 않아도 상담을 신청할 수 있습니다.</p></section>
          <section><h2 className="font-black text-slate-950">보관 및 삭제</h2><p className="mt-2">상담과 강사 배정에 필요한 기간 동안 보관하며, 처리 목적이 끝났거나 삭제 요청을 받으면 관계 법령상 보관 의무가 있는 경우를 제외하고 삭제합니다.</p></section>
          <section><h2 className="font-black text-slate-950">열람·정정·삭제 문의</h2><div className="mt-2 space-y-1"><p>전화: <a className="font-bold text-cyan-800 underline" href="tel:01098978990">010-9897-8990</a></p><p>이메일: <a className="font-bold text-cyan-800 underline" href="mailto:divewook@naver.com">divewook@naver.com</a></p></div></section>
          <section><h2 className="font-black text-slate-950">동의를 거부할 권리</h2><p className="mt-2">필수 정보 처리에 동의하지 않으면 홈페이지 상담 신청을 이용할 수 없습니다. 선택 분석·마케팅 동의는 거부해도 상담 신청에 제한이 없습니다.</p></section>
        </div>

        <p className="mt-8 text-sm text-slate-500">시행일: 2026년 10월 17일</p>
        <Link href="/" className="mt-6 inline-flex min-h-12 items-center rounded-xl bg-cyan-700 px-5 text-base font-bold text-white">홈으로 돌아가기</Link>
      </article>
    </main>
  );
}
