import { scheduleLabel } from '../lib/booking-options';

type CustomerMatch = {
  id: string;
  name: string;
  phone: string;
  course: string;
  pool: string;
  time_slot?: string;
  preferred_days?: string[];
  preferred_schedule?: Record<string, string[]>;
  preferred_pool_options?: Record<string, { days?: string[]; times?: string[] }>;
  schedule_mode?: 'exact' | 'flexible';
  schedule_alternatives?: Array<{ poolId: string; dayId: string; slotId: string }>;
  request_status?: 'matched' | 'pending_assignment';
  youth_participant_count?: number | null;
  youth_ages?: string | null;
  matched_instructor?: string;
  created_at: string;
  traffic_source?: string;
  traffic_medium?: string;
  traffic_campaign?: string;
  traffic_term?: string;
  traffic_content?: string;
  landing_url?: string;
  referrer_url?: string;
  device_type?: string;
};

function safeHost(url?: string) {
  if (!url) return '';
  try { return new URL(url).hostname.replace(/^www\./, ''); } catch { return ''; }
}

function safeLanding(url?: string) {
  if (!url) return '';
  try {
    const parsed = new URL(url);
    return `${parsed.hostname.replace(/^www\./, '')}${parsed.pathname}`;
  } catch { return ''; }
}

export default function CustomerMatchCard({ customer, showAttribution = false }: { customer: CustomerMatch; showAttribution?: boolean }) {
  const days = customer.preferred_days?.length ? customer.preferred_days : [];
  const schedule = customer.preferred_schedule && Object.keys(customer.preferred_schedule).length
    ? customer.preferred_schedule
    : { [customer.pool]: customer.time_slot ? [customer.time_slot] : [] };
  const poolOptions = customer.preferred_pool_options && Object.keys(customer.preferred_pool_options).length
    ? customer.preferred_pool_options
    : Object.fromEntries(Object.entries(schedule).map(([poolName, times]) => [poolName, { days, times }]));
  const sourceDetail = [customer.traffic_source || '직접 방문', customer.traffic_medium].filter(Boolean).join(' · ');
  const exactAlternatives = Array.isArray(customer.schedule_alternatives)
    ? customer.schedule_alternatives.filter(option => option?.poolId && option?.dayId && option?.slotId)
    : [];
  const isPendingAssignment = customer.request_status === 'pending_assignment' || !customer.matched_instructor || customer.matched_instructor === '배정 대기';

  return (
    <article className="break-keep rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="font-bold text-slate-950">{customer.name} 님</h4>
            {isPendingAssignment
              ? <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-900">강사 배정 대기</span>
              : <span className="rounded-full bg-cyan-100 px-2.5 py-1 text-xs font-bold text-cyan-900">담당 {customer.matched_instructor} 강사</span>}
          </div>
          <a href={`tel:${customer.phone}`} className="mt-1 inline-block font-semibold text-cyan-800 hover:underline">{customer.phone}</a>
        </div>
        <time className="text-xs text-slate-500" dateTime={customer.created_at}>{new Date(customer.created_at).toLocaleString('ko-KR')}</time>
      </div>

      <dl className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl bg-white p-3 border border-slate-200">
          <dt className="text-xs font-bold text-slate-500">교육 과정</dt>
          <dd className="mt-1 font-semibold leading-6 text-slate-900">{customer.course}</dd>
        </div>
        <div className="rounded-xl bg-white p-3 border border-slate-200">
          <dt className="text-xs font-bold text-slate-500">희망 요일 전체</dt>
          <dd className="mt-1 font-semibold text-slate-900">{days.length ? days.join(' · ') : '요일 정보 없음'}</dd>
        </div>
      </dl>

      {customer.youth_participant_count && (
        <div className="mt-3 rounded-xl border border-cyan-200 bg-cyan-50 p-3">
          <p className="text-xs font-bold text-cyan-800">유스 수강생 정보</p>
          <p className="mt-1 font-semibold text-slate-900">{customer.youth_participant_count}명 · 연령 {customer.youth_ages || '미입력'}</p>
        </div>
      )}

      <div className="mt-3 rounded-xl bg-white p-3 border border-slate-200">
        <p className="text-xs font-bold text-slate-500">희망 일정</p>
        {customer.schedule_mode === 'flexible' ? (
          <p className="mt-2 font-semibold text-slate-900">상담 후 일정 협의</p>
        ) : exactAlternatives.length ? (
          <ol className="mt-2 space-y-2">
            {exactAlternatives.map((option, index) => <li key={`${option.poolId}-${option.dayId}-${option.slotId}-${index}`} className="rounded-lg bg-slate-50 p-3 font-semibold leading-6 text-slate-900">{index + 1}. {scheduleLabel(option)}</li>)}
          </ol>
        ) : (
          <div className="mt-2 space-y-2">
            {Object.entries(poolOptions).map(([poolName, option]) => (
              <div key={poolName} className="rounded-lg bg-slate-50 p-3">
                <span className="font-bold text-slate-900">{poolName}</span>
                <p className="mt-1 leading-6 text-slate-700"><span className="font-semibold">요일:</span> {option.days?.length ? option.days.join(' · ') : '정보 없음'}</p>
                <p className="leading-6 text-slate-700"><span className="font-semibold">시간:</span> {option.times?.length ? option.times.join(' · ') : '정보 없음'}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {showAttribution && (
        <details className="group mt-3 rounded-xl border border-indigo-200 bg-indigo-50 p-3">
          <summary className="flex min-h-8 cursor-pointer list-none items-center justify-between gap-3 text-xs font-bold text-indigo-900">
            <span>마케팅 유입 정보</span>
            <span aria-hidden="true" className="transition group-open:rotate-180">⌄</span>
          </summary>
          <div className="mt-3 grid gap-x-5 gap-y-1 border-t border-indigo-200 pt-3 text-xs text-slate-700 sm:grid-cols-2">
            <p><span className="font-bold">유입:</span> {sourceDetail}</p>
            <p><span className="font-bold">검색어:</span> {customer.traffic_term || '검색어 미제공'}</p>
            <p><span className="font-bold">캠페인:</span> {[customer.traffic_campaign, customer.traffic_content].filter(Boolean).join(' · ') || '없음'}</p>
            <p><span className="font-bold">기기:</span> {customer.device_type || '확인 불가'}</p>
            <p><span className="font-bold">이전 사이트:</span> {safeHost(customer.referrer_url) || '직접 방문/미제공'}</p>
            <p><span className="font-bold">첫 방문 페이지:</span> {safeLanding(customer.landing_url) || '확인 불가'}</p>
          </div>
        </details>
      )}
    </article>
  );
}
