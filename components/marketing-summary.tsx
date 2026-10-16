'use client';

import { useMemo, useState } from 'react';

type CustomerAttribution = {
  traffic_source?: string;
  traffic_term?: string;
  traffic_campaign?: string;
  device_type?: string;
};

function topCounts(customers: CustomerAttribution[], key: keyof CustomerAttribution, emptyLabel: string) {
  const counts = new Map<string, number>();
  customers.forEach(customer => {
    const value = customer[key] || emptyLabel;
    counts.set(value, (counts.get(value) || 0) + 1);
  });
  return [...counts.entries()].sort((a, b) => b[1] - a[1]);
}

export default function MarketingSummary({ customers }: { customers: CustomerAttribution[] }) {
  const [expanded, setExpanded] = useState(false);
  const groups = useMemo(() => [
    { title: '유입 경로', rows: topCounts(customers, 'traffic_source', '직접 방문') },
    { title: '검색 키워드', rows: topCounts(customers.filter(c => c.traffic_term), 'traffic_term', '미제공') },
    { title: '캠페인', rows: topCounts(customers.filter(c => c.traffic_campaign), 'traffic_campaign', '없음') },
    { title: '접속 기기', rows: topCounts(customers, 'device_type', '확인 불가') },
  ], [customers]);

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-bold tracking-widest text-indigo-700">MARKETING ATTRIBUTION</p>
          <h2 className="mt-1 text-lg font-bold text-slate-950">고객 유입 분석</h2>
          <p className="mt-1 text-xs leading-5 text-slate-500">현재 선택한 기간의 신청 완료 고객 {customers.length}건 기준입니다.</p>
        </div>
        <button
          type="button"
          aria-expanded={expanded}
          onClick={() => setExpanded(value => !value)}
          className="min-h-11 shrink-0 rounded-xl border border-indigo-200 bg-indigo-50 px-4 text-sm font-bold text-indigo-800 hover:bg-indigo-100"
        >
          {expanded ? '분석 접기' : '분석 상세 보기'}
        </button>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {groups.map(group => (
          <div key={group.title} className="min-w-0 rounded-2xl border border-slate-200 bg-slate-50 p-3 sm:p-4">
            <p className="text-xs font-bold text-slate-500">{group.title}</p>
            <p className="mt-1 truncate text-sm font-bold text-slate-900" title={group.rows[0]?.[0]}>{group.rows[0]?.[0] || '정보 없음'}</p>
            <p className="mt-1 text-xs font-semibold text-indigo-700">{group.rows[0]?.[1] || 0}건 · {group.rows.length}개 항목</p>
          </div>
        ))}
      </div>

      {expanded && (
        <div className="mt-4 max-h-[28rem] overflow-y-auto rounded-2xl border border-slate-200 bg-slate-50 p-3 sm:p-4">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {groups.map(group => (
              <div key={group.title} className="rounded-2xl border border-slate-200 bg-white p-4">
                <h3 className="text-sm font-bold text-slate-900">{group.title}</h3>
                {group.rows.length ? (
                  <ol className="mt-3 space-y-2">
                    {group.rows.slice(0, 20).map(([label, count]) => (
                      <li key={label} className="flex items-center justify-between gap-3 text-xs">
                        <span className="truncate text-slate-700" title={label}>{label}</span>
                        <span className="shrink-0 rounded-full bg-indigo-50 px-2 py-1 font-bold text-indigo-800">{count}건</span>
                      </li>
                    ))}
                  </ol>
                ) : <p className="mt-3 text-xs text-slate-500">수집된 정보가 없습니다.</p>}
                {group.rows.length > 20 && <p className="mt-3 text-xs font-semibold text-slate-500">상위 20개 항목을 표시합니다.</p>}
              </div>
            ))}
          </div>
          <p className="mt-4 text-xs leading-5 text-slate-500">검색 서비스가 검색어를 숨기면 ‘미제공’으로 표시됩니다. 항목이 많아져도 이 영역 안에서만 스크롤됩니다.</p>
        </div>
      )}
    </section>
  );
}
