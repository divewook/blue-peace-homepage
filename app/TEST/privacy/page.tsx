import Link from 'next/link';

export default function TestPrivacyPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 text-slate-800 sm:py-16">
      <article className="mx-auto max-w-3xl rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
        <span className="rounded-full bg-amber-100 px-3 py-1 text-sm font-bold text-amber-900">운영자 검토용 초안</span>
        <h1 className="mt-4 text-2xl font-black text-slate-950">개인정보 처리 안내</h1>
        <p className="mt-3 text-base leading-7 text-slate-600">현재 코드와 데이터 구조에서 확인되는 상담 처리 범위를 정리했습니다. 보관 기간과 삭제 문의 절차가 확정되기 전에는 운영 개인정보처리방침으로 사용할 수 없습니다.</p>
        <div className="mt-7 space-y-6 text-base leading-7">
          <section><h2 className="font-black text-slate-950">확인된 수집 항목</h2><p className="mt-2">성함, 휴대폰 번호, 선택 과정, 희망 풀장·요일·시간, 유스 수강 인원과 연령(해당 시), 최초 유입 경로 정보가 운영 신청 데이터에 저장되도록 구현돼 있습니다.</p></section>
          <section><h2 className="font-black text-slate-950">확인된 이용 목적과 열람 범위</h2><p className="mt-2">관리자는 전체 상담 신청을 확인하며, 로그인한 강사는 본인에게 배정된 신청만 서버에서 조회합니다. 운영 신청이 생성되면 설정된 경우 담당 강사와 관리자에게 카카오 알림톡을 보내는 구조가 있습니다.</p></section>
          <section><h2 className="font-black text-slate-950">선택 분석 정보</h2><p className="mt-2">유입 출처·검색어·캠페인·기기 정보가 현재 운영 상담 신청에 함께 저장됩니다. 필수 상담 처리와 분리된 동의 정책 및 미동의 처리 방식은 운영자 확정이 필요합니다.</p></section>
          <section className="rounded-2xl border border-amber-200 bg-amber-50 p-4"><h2 className="font-black text-amber-950">운영자 확정이 필요한 항목</h2><ul className="mt-2 list-disc space-y-1 pl-5 text-amber-950"><li>신청 정보와 알림 기록의 보관 및 파기 기간</li><li>삭제·열람·정정 요청을 받을 연락처와 처리 절차</li><li>담당 강사에게 전달되는 정확한 시점과 범위</li><li>마케팅·분석 정보의 선택 동의와 철회 방법</li><li>처리방침 시행일과 정책 버전</li></ul></section>
          <section><h2 className="font-black text-slate-950">테스트 페이지 처리</h2><p className="mt-2">`/TEST` 상담 화면은 이름과 연락처를 서버, 데이터베이스, 강사 또는 알림 서비스로 전송하지 않습니다. 일정 규칙 검증을 위해 개인정보가 없는 풀장·요일·시간 코드만 테스트 검증 API로 전송합니다.</p></section>
        </div>
        <Link href="/TEST" className="mt-8 inline-flex min-h-12 items-center rounded-xl bg-cyan-700 px-5 text-base font-bold text-white">테스트 홈으로 돌아가기</Link>
      </article>
    </main>
  );
}
