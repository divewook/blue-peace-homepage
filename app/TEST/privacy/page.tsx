import Link from 'next/link';

export default function TestPrivacyPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 text-slate-800 sm:py-16">
      <article className="mx-auto max-w-3xl rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
        <span className="rounded-full bg-amber-100 px-3 py-1 text-sm font-bold text-amber-900">운영자 검토용 초안</span>
        <h1 className="mt-4 text-2xl font-black text-slate-950">개인정보 처리 안내</h1>
        <p className="mt-3 text-base leading-7 text-slate-600">현재 코드와 데이터 구조에서 확인되는 상담 처리 범위를 정리했습니다. 보관 기간과 삭제 문의 절차가 확정되기 전에는 운영 개인정보처리방침으로 사용할 수 없습니다.</p>
        <div className="mt-7 space-y-6 text-base leading-7">
          <section><h2 className="font-black text-slate-950">확인된 수집 항목</h2><p className="mt-2">새 상담에서는 성함과 휴대폰 번호를 필수로, 관심 과정·세부 과정·연락 선호 시간대·문의사항을 선택적으로 입력합니다. 선택 동의 시 유입 경로를 기록합니다. 기존 신청에는 풀장·요일·시간 및 유스 수강 정보가 있을 수 있습니다.</p></section>
          <section><h2 className="font-black text-slate-950">확인된 이용 목적과 열람 범위</h2><p className="mt-2">대표 관리자는 전체 신청을 확인합니다. 새 신청은 강사에게 자동 배정하지 않으며, 대표가 상담 후 배정하면 로그인한 담당 강사만 필요한 신청 내용을 조회합니다. 운영 알림이 설정된 경우 새 신청은 관리자에게만 전송합니다.</p></section>
          <section><h2 className="font-black text-slate-950">선택 분석 정보</h2><p className="mt-2">새 상담 신청에서는 선택 동의한 경우에만 유입 출처·검색어·캠페인·기기 정보를 저장하도록 준비했습니다. 미동의 시 신규 신청에는 이 정보를 저장하지 않습니다. 기존 신청과 기존 정책 기록은 별도로 확인해야 합니다.</p></section>
          <section className="rounded-2xl border border-amber-200 bg-amber-50 p-4"><h2 className="font-black text-amber-950">운영자 확정이 필요한 항목</h2><ul className="mt-2 list-disc space-y-1 pl-5 text-amber-950"><li>신청 정보와 알림 기록의 보관 및 파기 기간</li><li>열람·정정·삭제 요청의 확인·처리 절차</li><li>담당 강사에게 전달되는 정확한 시점과 범위</li><li>분석 정보의 선택 동의 철회 방법</li><li>처리방침 시행일과 정책 버전</li></ul></section>
          <section><h2 className="font-black text-slate-950">테스트 페이지 처리</h2><p className="mt-2">공개 미리보기의 상담 화면은 이름과 연락처를 서버, 데이터베이스, 강사 또는 알림 서비스로 전송하지 않습니다. 제출은 브라우저 안의 모의 완료 화면으로 처리합니다.</p></section>
        </div>
        <Link href="/TEST" className="mt-8 inline-flex min-h-12 items-center rounded-xl bg-cyan-700 px-5 text-base font-bold text-white">테스트 홈으로 돌아가기</Link>
      </article>
    </main>
  );
}
