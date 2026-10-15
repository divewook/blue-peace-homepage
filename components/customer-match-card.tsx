type CustomerMatch = {
  id: string;
  name: string;
  phone: string;
  course: string;
  pool: string;
  time_slot?: string;
  preferred_days?: string[];
  preferred_schedule?: Record<string, string[]>;
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
  const sourceDetail = [customer.traffic_source || '직접 방문', customer.traffic_medium].filter(Boolean).join(' · ');

  return (
    <article className="rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:p-5 text-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="font-bold text-slate-950">{customer.name} 님</h4>
            {customer.matched_instructor && <span className="rounded-full bg-cyan-100 px-2.5 py-1 text-xs font-bold text-cyan-900">담당 {customer.matched_instructor} 강사</span>}
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
          <dt className="text-xs font-bold text-slate-500">희망 수업 요일</dt>
          <dd className="mt-1 font-semibold text-slate-900">{days.length ? days.join(' · ') : '요일 정보 없음'}</dd>
        </div>
      </dl>

      <div className="mt-3 rounded-xl bg-white p-3 border border-slate-200">
        <p className="text-xs font-bold text-slate-500">희망 풀장 · 시간대</p>
        <div className="mt-2 space-y-2">
          {Object.entries(schedule).map(([poolName, times]) => (
            <div key={poolName} className="flex flex-col gap-1 sm:flex-row sm:gap-3">
              <span className="shrink-0 font-bold text-slate-900">{poolName}</span>
              <span className="leading-6 text-slate-700">{times.length ? times.join(' · ') : '시간대 정보 없음'}</span>
            </div>
          ))}
        </div>
      </div>

      {showAttribution && (
        <div className="mt-3 rounded-xl border border-indigo-200 bg-indigo-50 p-3">
          <p className="text-xs font-bold text-indigo-900">마케팅 유입 정보</p>
          <div className="mt-2 grid gap-x-5 gap-y-1 text-xs text-slate-700 sm:grid-cols-2">
            <p><span className="font-bold">유입:</span> {sourceDetail}</p>
            <p><span className="font-bold">검색어:</span> {customer.traffic_term || '검색어 미제공'}</p>
            <p><span className="font-bold">캠페인:</span> {[customer.traffic_campaign, customer.traffic_content].filter(Boolean).join(' · ') || '없음'}</p>
            <p><span className="font-bold">기기:</span> {customer.device_type || '확인 불가'}</p>
            <p><span className="font-bold">이전 사이트:</span> {safeHost(customer.referrer_url) || '직접 방문/미제공'}</p>
            <p><span className="font-bold">첫 방문 페이지:</span> {safeLanding(customer.landing_url) || '확인 불가'}</p>
          </div>
        </div>
      )}
    </article>
  );
}
