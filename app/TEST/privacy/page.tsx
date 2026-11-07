import Link from 'next/link';

export default function TestPrivacyPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 text-slate-800 sm:py-16">
      <article className="mx-auto max-w-3xl rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
        <span className="rounded-full bg-amber-100 px-3 py-1 text-sm font-bold text-amber-900">운영자 검토용 초안</span>
        <h1 className="mt-4 text-2xl font-black text-slate-950">개인정보 처리 안내</h1>
        <p className="mt-3 text-base leading-7 text-slate-600">현재 코드와 데이터 구조에서 확인되는 상담 처리 범위를 정리했습니다. 운영 상담과 다른 모의 제출 화면이며, 실제 방침의 시행일과 외부 서비스 처리 내용은 운영 적용 전에 최종 확인합니다.</p>
        <div className="mt-7 space-y-6 text-base leading-7">
          <section><h2 className="font-black text-slate-950">확인된 수집 항목</h2><p className="mt-2">새 상담 흐름에서는 성함, 휴대폰 번호, 선택 과정, 연락 선호 시간, 문의사항을 받습니다. 유스 인원과 연령은 선택 입력입니다. 광고 유입 정보는 별도 선택 동의가 있는 경우에만 저장하도록 준비했습니다. 과거 신청의 일정 조건은 그대로 보존됩니다.</p></section>
          <section><h2 className="font-black text-slate-950">확인된 이용 목적과 열람 범위</h2><p className="mt-2">관리자는 전체 상담 신청을 확인하며, 로그인한 강사는 본인에게 배정된 신청만 서버에서 조회합니다. 신규 상담은 강사 미배정으로 접수되며 관리자만 확인합니다. 대표가 강사를 배정한 뒤 담당 강사가 필요한 상담 정보를 확인합니다. 공개 데모는 SOLAPI에 실제 발송하지 않습니다.</p></section>
          <section><h2 className="font-black text-slate-950">선택 분석 정보</h2><p className="mt-2">새 상담 신청에서 광고 유입 출처·검색어·캠페인·기기 정보는 선택 동의가 있을 때만 신청에 저장됩니다. 이 동의는 광고성 정보 수신 동의가 아닙니다.</p></section>
          <section className="rounded-2xl border border-amber-200 bg-amber-50 p-4"><h2 className="font-black text-amber-950">운영 적용 전에 확인할 항목</h2><p className="mt-2">교육 미등록 상담은 종료일·마지막 연락일 중 늦은 날부터 90일 보관하고 대표가 매월 점검하기로 했습니다. 대표 김상욱의 개인정보 문의 전화·이메일도 확인됐습니다. SOLAPI 발송 내역은 업체 안내상 12개월로 내부 상담 기록과 구분합니다.</p><ul className="mt-2 list-disc space-y-1 pl-5 text-amber-950"><li>외부 서비스 처리 관계와 백업·삭제 절차</li><li>등록 고객의 별도 보관 기준</li><li>선택 분석 동의 철회 처리</li><li>실제 시행일과 정책 버전</li></ul></section>
          <section><h2 className="font-black text-slate-950">테스트 페이지 처리</h2><p className="mt-2">`/TEST` 상담 화면은 이름과 연락처를 서버, 데이터베이스, 강사 또는 알림 서비스로 전송하지 않습니다. 제출 시 모의 완료 화면만 표시합니다.</p></section>
        </div>
        <Link href="/TEST" className="mt-8 inline-flex min-h-12 items-center rounded-xl bg-cyan-700 px-5 text-base font-bold text-white">테스트 홈으로 돌아가기</Link>
      </article>
    </main>
  );
}
