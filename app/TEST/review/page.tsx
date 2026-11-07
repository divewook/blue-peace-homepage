import Link from 'next/link';
import Image from 'next/image';

const captures = [
  { title: '모바일 · 과정 선택', src: '/review/selective-mobile-course.png', alt: '기존 과정 및 세부 코스 선택 화면의 모바일 검수 캡처' },
  { title: '모바일 · 상담 입력', src: '/review/selective-mobile-contact.png', alt: '성함과 연락처, 선택 항목 및 별도 동의를 보여주는 모바일 검수 캡처' },
  { title: '모바일 · 모의 완료', src: '/review/selective-mobile-complete.png', alt: '실제 저장 없이 모의 완료 안내를 보여주는 모바일 검수 캡처' },
  { title: 'PC · 과정 선택', src: '/review/selective-desktop-course.png', alt: '기존 과정 및 세부 코스 선택 화면의 PC 검수 캡처' },
];
export default function ReviewPage() {
  const version = process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) || '로컬 검수본';
  return <main className="min-h-screen bg-slate-50 px-4 py-10 text-slate-900"><div className="mx-auto max-w-6xl">
    <h1 className="text-3xl font-black">상담 신청 개편 검수 자료</h1>
    <p className="mt-2 text-sm text-slate-500">검수 페이지 버전: {version} · 화면 캡처 기준: 9c06d2c</p>
    <p className="mt-3 max-w-3xl text-base leading-7">운영 홈페이지의 과정·세부 코스 선택 뒤에 간단한 연락처 입력을 연결한 화면입니다. 이 자료는 가상 입력으로 촬영했으며 공개 데모는 실제 신청, 문자, 카카오톡을 전송하지 않습니다.</p>
    <div className="mt-6 flex flex-wrap gap-3"><Link href="/TEST" className="rounded-xl bg-cyan-700 px-5 py-3 font-bold text-white">테스트 홈페이지</Link><Link href="/TEST/inquiry" className="rounded-xl border border-cyan-700 px-5 py-3 font-bold text-cyan-900">상담 흐름 직접 보기</Link></div>
    <div className="mt-8 grid gap-6 md:grid-cols-2">{captures.map(item=><section key={item.src} className="rounded-2xl border border-slate-200 bg-white p-4"><h2 className="mb-3 text-lg font-bold">{item.title}</h2><Image src={item.src} alt={item.alt} width={950} height={1400} className="h-auto w-full rounded-lg border border-slate-100" unoptimized /></section>)}</div>
    <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-5"><h2 className="text-xl font-black">관리자 화면 · 가상 정보 예시</h2><p className="mt-2 text-sm text-slate-600">실제 관리자 계정이나 고객 데이터에 연결되지 않는 설명용 자료입니다. 운영 화면에는 종료된 새 상담의 90일 보관 점검 필터도 준비했습니다.</p><dl className="mt-4 grid gap-3 text-base sm:grid-cols-2"><div><dt className="font-bold">신청 일시</dt><dd>가상 신청 · 2026.11.05</dd></div><div><dt className="font-bold">고객</dt><dd>가상 고객 · 010-0000-0000</dd></div><div><dt className="font-bold">선택 과정</dt><dd>프리다이빙 · 1레벨</dd></div><div><dt className="font-bold">연락 선호</dt><dd>저녁</dd></div><div><dt className="font-bold">상담 상태</dt><dd>신규 접수</dd></div><div><dt className="font-bold">담당 강사</dt><dd>미배정</dd></div><div><dt className="font-bold">SMS 알림 상태</dt><dd>공개 데모에서는 실제 발송하지 않음</dd></div></dl></section>
    <section className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5"><h2 className="text-xl font-black">SOLAPI 모의 발송 검수</h2><p className="mt-2 text-base leading-7">가상 신청으로 인증 서명, 대표 번호 한 곳으로의 요청 구성, 업체 접수·실패·결과 불명 응답 처리를 격리 테스트했습니다. 이 공개 페이지에서 실제 문자는 발송되지 않습니다.</p><pre className="mt-4 overflow-x-auto whitespace-pre-wrap break-words rounded-xl bg-white p-4 text-sm leading-6">{`[블루피스 신규 상담]\n\n신규 교육 상담이 접수되었습니다.\n\n교육과정: 프리다이빙 1+2레벨\n고객: 가상 고객\n연락 희망: 저녁\n\n상세 내용은 관리자 페이지에서 확인하세요.\nhttps://www.bluepeace.co.kr/admin`}</pre></section>
  </div></main>;
}
