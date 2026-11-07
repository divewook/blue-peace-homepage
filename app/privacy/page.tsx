import Link from 'next/link';

export const metadata = { title: '개인정보 처리 안내 | 블루피스' };

export default function PrivacyPage() {
  const directPolicyVersion = process.env.BLUEPEACE_DIRECT_PRIVACY_VERSION;

  return (
    <main className="min-h-screen break-keep bg-slate-50 px-4 py-10 text-slate-800 sm:py-16">
      <article className="mx-auto max-w-3xl rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
        <p className="text-sm font-bold text-cyan-700">BLUE PEACE PRIVACY</p>
        <h1 className="mt-2 text-2xl font-black text-slate-950">개인정보 처리 안내</h1>
        <p className="mt-3 text-base leading-7 text-slate-600">블루피스의 교육 상담 신청과 강사 배정 과정에서 처리하는 정보를 안내합니다.</p>

        <div className="mt-8 space-y-8 text-base leading-7">
          <section>
            <h2 className="font-black text-slate-950">상담 방식별 수집 항목</h2>
            <div className="mt-2 space-y-3">
              <p><strong>새 교육 상담:</strong> 필수로 성함·휴대전화·필수 동의 기록을 받습니다. 관심 분야·세부 과정·연락 선호 시간·문의사항은 고객이 선택하거나 입력한 경우에만 저장합니다. 유스 상담의 수강 인원·연령도 입력한 경우에만 저장합니다. 접수 시각과 신청 식별자는 중복 접수 방지와 처리 확인을 위해 기록합니다.</p>
              <p><strong>기존 일정 매칭 신청:</strong> 고객이 입력한 교육 과정, 희망 풀장·요일·회차 등 상담 대안 조건을 보존합니다. 새 상담의 입력 항목 변경으로 과거 신청 내용을 바꾸지 않습니다.</p>
            </div>
          </section>
          <section>
            <h2 className="font-black text-slate-950">이용 목적과 담당자 열람</h2>
            <p className="mt-2">신청 내용은 교육 상담, 고객 연락, 과정·일정 협의와 필요한 경우 담당 강사 배정에 사용합니다. 새 교육 상담은 강사를 자동 배정하지 않으며, 대표 관리자가 확인한 뒤 필요하면 배정합니다.</p>
            <p className="mt-2">관리자는 상담 업무에 필요한 신청 내용을 확인합니다. 강사는 로그인과 담당자 권한 확인 후 현재 자신에게 배정된 신청만 볼 수 있습니다. 담당 강사에게는 고객 성함·연락처·신청 과정·상담 대안 일정·연락 선호 시간·고객 문의사항 등 상담에 필요한 정보가 보일 수 있습니다. 광고 유입 정보와 관리자 내부 메모는 강사 조회 항목에서 제외합니다.</p>
          </section>
          <section>
            <h2 className="font-black text-slate-950">대표 문자 알림</h2>
            <p className="mt-2">새 상담이 정상 접수되면 SOLAPI 문자 서비스를 통해 대표의 등록된 휴대전화로 접수 알림을 보낼 수 있습니다. 문자에는 고객 성함, 신청 과정, 연락 선호 시간만 포함하며 고객 휴대전화 번호와 문의사항·내부 메모는 넣지 않습니다. 문자 알림은 고객이나 강사에게 보내는 자동 안내가 아닙니다.</p>
            <p className="mt-2">블루피스의 상담 기록 보관 기간과 별개로, SOLAPI의 공식 안내에 따르면 2026년 8월 20일 이후 접수된 문자 발송 내역은 생성일부터 12개월 동안 조회할 수 있습니다. <a className="font-bold text-cyan-800 underline" href="https://solapi.com/developers/api/messages">SOLAPI 발송 내역 안내</a></p>
          </section>
          <section>
            <h2 className="font-black text-slate-950">선택 광고 유입 분석</h2>
            <p className="mt-2">별도 선택 동의를 한 경우에만 첫 방문·재방문 출처, UTM 정보, 네이버 광고의 등록 키워드·실제 검색어·광고그룹·소재 식별값과 기기 유형을 상담 신청과 함께 저장합니다. 네이버 방문·신청완료 측정에는 쿠키가 사용될 수 있습니다. 성함·휴대전화·문의사항은 광고 전환 도구에 전달하지 않습니다.</p>
            <p className="mt-2">선택 동의를 거부해도 상담을 신청할 수 있습니다. 이 동의는 광고성 문자나 전화 수신 동의가 아닙니다.</p>
          </section>
          <section>
            <h2 className="font-black text-slate-950">보관 및 파기</h2>
            <p className="mt-2">교육 등록으로 이어지지 않은 일반 상담 기록은 상담 종료일과 마지막 연락일 중 늦은 날부터 90일 보관합니다. 대표가 매월 보관 대상과 미처리 신청을 점검하고 삭제합니다. 자동 삭제 기능은 없습니다.</p>
            <p className="mt-2">교육 등록 고객의 기록과 법령에 따라 별도로 보관해야 하는 항목은 해당 목적과 근거에 맞게 구분해 관리합니다. 위 90일 기준을 문자 업체의 발송 내역에 그대로 적용하지 않습니다.</p>
          </section>
          <section>
            <h2 className="font-black text-slate-950">열람·정정·삭제·동의 철회 요청</h2>
            <p className="mt-2">본인의 정보에 관한 요청은 아래 연락처로 접수해 주세요. 본인 여부와 법령상 보관 필요성을 확인한 뒤 처리 결과를 안내합니다.</p>
            <p className="mt-2">개인정보 문의 담당자: 대표 김상욱</p>
            <p>전화: <a className="font-bold text-cyan-800 underline" href="tel:01098978990">010-9897-8990</a></p>
            <p>이메일: <a className="font-bold text-cyan-800 underline" href="mailto:divewook@naver.com">divewook@naver.com</a></p>
          </section>
          <section>
            <h2 className="font-black text-slate-950">동의 거부</h2>
            <p className="mt-2">필수 개인정보 수집·이용에 동의하지 않으면 홈페이지 상담 신청을 이용할 수 없습니다. 선택 광고 유입 분석에 동의하지 않아도 상담 신청은 가능합니다.</p>
          </section>
        </div>

        <div className="mt-8 space-y-1 text-sm leading-6 text-slate-500">
          <p>기존 일정 매칭 안내 시행일: 2026년 10월 27일</p>
          <p>새 교육 상담 안내 시행일·버전: {directPolicyVersion || '운영 적용 전 · 검토 중'}</p>
        </div>
        <Link href="/" className="mt-6 inline-flex min-h-12 items-center rounded-xl bg-cyan-700 px-5 text-base font-bold text-white">홈으로 돌아가기</Link>
      </article>
    </main>
  );
}
