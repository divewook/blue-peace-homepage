'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

type SessionAvailability = {
  id: string;
  label: string;
  time: string;
  status: 'available' | 'closed' | 'unknown';
  remaining: number | null;
  total: number | null;
};

type AvailabilityResponse = {
  date: string;
  open: boolean;
  reason: string;
  sessions: SessionAvailability[];
  checked_at: string;
  source_url: string;
};

const weekdayLabels = ['일', '월', '화', '수', '목', '금', '토'];

function koreaToday() {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Seoul', year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(new Date());
}

function addDays(date: string, days: number) {
  const value = new Date(`${date}T00:00:00Z`);
  value.setUTCDate(value.getUTCDate() + days);
  return value.toISOString().slice(0, 10);
}

function monthTitle(month: string) {
  const [year, monthNumber] = month.split('-').map(Number);
  return `${year}년 ${monthNumber}월`;
}

function shiftMonth(month: string, amount: number) {
  const [year, monthNumber] = month.split('-').map(Number);
  const next = new Date(Date.UTC(year, monthNumber - 1 + amount, 1));
  return `${next.getUTCFullYear()}-${String(next.getUTCMonth() + 1).padStart(2, '0')}`;
}

function calendarCells(month: string) {
  const [year, monthNumber] = month.split('-').map(Number);
  const first = new Date(Date.UTC(year, monthNumber - 1, 1));
  const lastDay = new Date(Date.UTC(year, monthNumber, 0)).getUTCDate();
  const cells: Array<string | null> = Array(first.getUTCDay()).fill(null);
  for (let day = 1; day <= lastDay; day += 1) {
    cells.push(`${month}-${String(day).padStart(2, '0')}`);
  }
  while (cells.length % 7) cells.push(null);
  return cells;
}

export default function MarinaAvailabilityModal({ onClose }: { onClose: () => void }) {
  const today = useMemo(() => koreaToday(), []);
  const lastDate = useMemo(() => addDays(today, 90), [today]);
  const [selectedDate, setSelectedDate] = useState(today);
  const [visibleMonth, setVisibleMonth] = useState(today.slice(0, 7));
  const [availability, setAvailability] = useState<AvailabilityResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);
  const cells = useMemo(() => calendarCells(visibleMonth), [visibleMonth]);
  const firstMonth = today.slice(0, 7);
  const lastMonth = lastDate.slice(0, 7);

  const loadAvailability = useCallback(async (signal: AbortSignal) => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`/api/marina/availability?date=${encodeURIComponent(selectedDate)}`, {
        cache: 'no-store', signal,
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(`${result.error || `예약 현황을 불러오지 못했습니다. (HTTP ${response.status})`}${result.code ? ` (조회 단계: ${result.code})` : ''}`);
      setAvailability(result);
    } catch (fetchError) {
      if (fetchError instanceof DOMException && fetchError.name === 'AbortError') return;
      setAvailability(null);
      setError(fetchError instanceof Error ? fetchError.message : '예약 현황을 불러오지 못했습니다.');
    } finally {
      if (!signal.aborted) setLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(() => void loadAvailability(controller.signal), 0);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [loadAvailability, reloadKey]);

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', closeOnEscape);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', closeOnEscape);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 p-3 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="marina-modal-title" onMouseDown={event => { if (event.target === event.currentTarget) onClose(); }}>
      <div className="max-h-[calc(100dvh-1.5rem)] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-4 shadow-2xl sm:p-6">
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <p className="text-xs font-bold tracking-widest text-cyan-700">BUSAN NORTH PORT MARINA · LIVE</p>
            <h2 id="marina-modal-title" className="mt-1 text-xl font-black text-slate-950">북항마리나 예약 현황</h2>
            <p className="mt-1 text-sm leading-6 text-slate-600">날짜를 선택하면 1~3부의 입장 가능한 잔여 인원을 확인합니다.</p>
          </div>
          <button type="button" onClick={onClose} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xl font-bold text-slate-600" aria-label="닫기">×</button>
        </div>

        <div className="mt-5 grid gap-5 md:grid-cols-[1.05fr_0.95fr]">
          <section className="rounded-2xl border border-slate-200 bg-slate-50 p-3" aria-label="예약 날짜 선택">
            <label className="mb-3 block text-sm font-semibold text-slate-700 md:hidden">조회 날짜
              <input type="date" value={selectedDate} min={today} max={lastDate} onChange={event => { const date = event.target.value; if (date >= today && date <= lastDate) { setSelectedDate(date); setVisibleMonth(date.slice(0, 7)); } }} className="mt-1 min-h-12 w-full rounded-xl border border-slate-300 bg-white px-3 text-base" />
            </label>
            <div className="flex items-center justify-between gap-3 px-1 py-2">
              <button type="button" onClick={() => setVisibleMonth(month => shiftMonth(month, -1))} disabled={visibleMonth <= firstMonth} className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-lg font-bold disabled:opacity-30" aria-label="이전 달">‹</button>
              <strong className="text-base text-slate-900">{monthTitle(visibleMonth)}</strong>
              <button type="button" onClick={() => setVisibleMonth(month => shiftMonth(month, 1))} disabled={visibleMonth >= lastMonth} className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-lg font-bold disabled:opacity-30" aria-label="다음 달">›</button>
            </div>
            <div className="mt-2 grid grid-cols-7 gap-1 text-center">
              {weekdayLabels.map((label, index) => <span key={label} className={`py-2 text-xs font-bold ${index === 0 ? 'text-rose-500' : index === 6 ? 'text-blue-500' : 'text-slate-500'}`}>{label}</span>)}
              {cells.map((date, index) => {
                if (!date) return <span key={`empty-${index}`} aria-hidden="true" />;
                const disabled = date < today || date > lastDate;
                const selected = date === selectedDate;
                return <button key={date} type="button" disabled={disabled} aria-pressed={selected} onClick={() => setSelectedDate(date)} className={`aspect-square min-w-0 rounded-xl text-sm font-bold transition ${selected ? 'bg-cyan-600 text-white shadow-md' : 'bg-white text-slate-700 hover:bg-cyan-50'} disabled:bg-transparent disabled:text-slate-300`}>{Number(date.slice(-2))}</button>;
              })}
            </div>
          </section>

          <section className="rounded-2xl border border-cyan-200 bg-cyan-50 p-4" aria-live="polite">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-bold text-cyan-700">선택 날짜</p>
                <h3 className="mt-1 text-lg font-black text-slate-950">{selectedDate.replaceAll('-', '. ')}</h3>
              </div>
              <button type="button" onClick={() => setReloadKey(key => key + 1)} disabled={loading} className="min-h-10 rounded-xl border border-cyan-200 bg-white px-3 text-xs font-bold text-cyan-800 disabled:opacity-50">새로고침</button>
            </div>

            {loading ? (
              <div className="flex min-h-64 flex-col items-center justify-center text-center">
                <span className="h-9 w-9 animate-spin rounded-full border-4 border-cyan-200 border-t-cyan-600" aria-hidden="true" />
                <p className="mt-3 text-sm font-semibold text-cyan-900">북항마리나 예약 현황 확인 중…</p>
              </div>
            ) : error ? (
              <div className="flex min-h-64 flex-col items-center justify-center text-center">
                <p className="text-sm font-bold leading-6 text-rose-700">{error}</p>
                <button type="button" onClick={() => setReloadKey(key => key + 1)} className="mt-3 min-h-11 rounded-xl bg-slate-900 px-4 text-sm font-bold text-white">다시 조회</button>
              </div>
            ) : availability?.open === false ? (
              <div className="flex min-h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white/70 p-5 text-center">
                <span className="text-3xl" aria-hidden="true">🗓️</span>
                <p className="mt-3 text-sm font-bold leading-6 text-slate-800">{availability.reason}</p>
                <p className="mt-1 text-xs leading-5 text-slate-500">북항마리나 예약 개방 일정에 따라 선택 가능한 날짜가 달라집니다.</p>
              </div>
            ) : (
              <div className="mt-4 space-y-2">
                {availability?.sessions.map(session => (
                  <div key={session.id} className="flex min-h-14 items-center justify-between gap-3 rounded-xl border border-cyan-100 bg-white px-4 py-3">
                    <div>
                      <p className="font-bold text-slate-900">{session.label}</p>
                      <p className="text-xs text-slate-500">{session.time}{session.total != null ? ` · 정원 ${session.total}명` : ''}</p>
                    </div>
                    {session.status === 'available'
                      ? <strong className="text-base text-cyan-700"><span className="text-xl">{session.remaining}</span>명 예약 가능</strong>
                      : session.status === 'closed' ? <strong className="rounded-full bg-rose-100 px-3 py-1.5 text-sm text-rose-700">마감</strong>
                        : <strong className="text-sm text-amber-800">현황 확인 필요</strong>}
                  </div>
                ))}
                {availability?.checked_at && <p className="pt-2 text-center text-[11px] text-slate-500">최근 조회 {new Date(availability.checked_at).toLocaleTimeString('ko-KR', { timeZone: 'Asia/Seoul', hour: '2-digit', minute: '2-digit' })}</p>}
              </div>
            )}
          </section>
        </div>

        <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs leading-5 text-slate-500">잔여 인원은 조회 시점 기준이며 예약 진행 중 달라질 수 있습니다.</p>
          <a href={availability?.source_url || 'https://marina.busanpa.com/marina/diving/agree/PG01.marina?menuCd=DOM_000000103001000000'} target="_blank" rel="noreferrer" className="flex min-h-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 px-4 text-sm font-bold text-slate-700">북항마리나에서 직접 확인 ↗</a>
        </div>
      </div>
    </div>
  );
}
