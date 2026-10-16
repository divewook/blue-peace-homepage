'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

type BuoyPart = { time: string; available: boolean };
type SessionAvailability = {
  id: string;
  label: string;
  time: string;
  front: BuoyPart;
  back: BuoyPart;
};
type AvailabilityResponse = {
  date: string;
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
  for (let day = 1; day <= lastDay; day += 1) cells.push(`${month}-${String(day).padStart(2, '0')}`);
  while (cells.length % 7) cells.push(null);
  return cells;
}

function AvailabilityBadge({ available }: { available: boolean }) {
  return available
    ? <strong className="rounded-full bg-emerald-100 px-3 py-1.5 text-sm text-emerald-700">가능</strong>
    : <strong className="rounded-full bg-slate-200 px-3 py-1.5 text-sm text-slate-600">불가</strong>;
}

export default function DeepstationAvailabilityModal({ onClose }: { onClose: () => void }) {
  const today = useMemo(koreaToday, []);
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
      const response = await fetch(`/api/deepstation/availability?date=${encodeURIComponent(selectedDate)}`, {
        cache: 'no-store', signal,
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || '부이 현황을 불러오지 못했습니다.');
      setAvailability(result);
    } catch (fetchError) {
      if (fetchError instanceof DOMException && fetchError.name === 'AbortError') return;
      setAvailability(null);
      setError(fetchError instanceof Error ? fetchError.message : '부이 현황을 불러오지 못했습니다.');
    } finally {
      if (!signal.aborted) setLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    const controller = new AbortController();
    void loadAvailability(controller.signal);
    return () => controller.abort();
  }, [loadAvailability, reloadKey]);

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); };
    document.addEventListener('keydown', closeOnEscape);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', closeOnEscape);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 p-3 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="deepstation-modal-title" onMouseDown={event => { if (event.target === event.currentTarget) onClose(); }}>
      <div className="max-h-[calc(100dvh-1.5rem)] w-full max-w-3xl overflow-y-auto rounded-3xl bg-white p-4 shadow-2xl sm:p-6">
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <p className="text-xs font-bold tracking-widest text-indigo-700">DEEPSTATION · 36M BUOY</p>
            <h2 id="deepstation-modal-title" className="mt-1 text-xl font-black text-slate-950">딥탱크 부이 예약 현황</h2>
            <p className="mt-1 text-sm leading-6 text-slate-600">프리다이빙 일반권 2인·정시 입장 기준으로 조회합니다.</p>
          </div>
          <button type="button" onClick={onClose} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xl font-bold text-slate-600" aria-label="닫기">×</button>
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
          <section className="rounded-2xl border border-slate-200 bg-slate-50 p-3" aria-label="예약 날짜 선택">
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
                return <button key={date} type="button" disabled={disabled} aria-pressed={selected} onClick={() => setSelectedDate(date)} className={`aspect-square min-h-10 rounded-xl text-sm font-bold transition ${selected ? 'bg-indigo-600 text-white shadow-md' : 'bg-white text-slate-700 hover:bg-indigo-50'} disabled:bg-transparent disabled:text-slate-300`}>{Number(date.slice(-2))}</button>;
              })}
            </div>
          </section>

          <section className="rounded-2xl border border-indigo-200 bg-indigo-50 p-4" aria-live="polite">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-bold text-indigo-700">선택 날짜</p>
                <h3 className="mt-1 text-lg font-black text-slate-950">{selectedDate.replaceAll('-', '. ')}</h3>
              </div>
              <button type="button" onClick={() => setReloadKey(key => key + 1)} disabled={loading} className="min-h-10 rounded-xl border border-indigo-200 bg-white px-3 text-xs font-bold text-indigo-800 disabled:opacity-50">새로고침</button>
            </div>

            {loading ? (
              <div className="flex min-h-80 flex-col items-center justify-center text-center">
                <span className="h-9 w-9 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" aria-hidden="true" />
                <p className="mt-3 text-sm font-semibold text-indigo-950">딥스테이션 예약 현황 확인 중…</p>
                <p className="mt-1 text-xs leading-5 text-indigo-700">안전한 로그인 조회로 처음에는 약 10~20초 걸릴 수 있습니다.</p>
              </div>
            ) : error ? (
              <div className="flex min-h-80 flex-col items-center justify-center text-center">
                <p className="text-sm font-bold leading-6 text-rose-700">{error}</p>
                <button type="button" onClick={() => setReloadKey(key => key + 1)} className="mt-3 min-h-11 rounded-xl bg-slate-900 px-4 text-sm font-bold text-white">다시 조회</button>
              </div>
            ) : (
              <div className="mt-4 space-y-2">
                {availability?.sessions.map(session => (
                  <div key={session.id} className="rounded-xl border border-indigo-100 bg-white p-3">
                    <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-2">
                      <strong className="text-sm text-slate-900">{session.label}</strong>
                      <span className="text-xs font-semibold text-slate-500">{session.time}</span>
                    </div>
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      <div className="flex min-h-14 items-center justify-between gap-2 rounded-lg bg-slate-50 px-3 py-2">
                        <div><p className="text-xs font-bold text-slate-800">전반 부이</p><p className="text-[11px] text-slate-500">{session.front.time}</p></div>
                        <AvailabilityBadge available={session.front.available} />
                      </div>
                      <div className="flex min-h-14 items-center justify-between gap-2 rounded-lg bg-slate-50 px-3 py-2">
                        <div><p className="text-xs font-bold text-slate-800">후반 부이</p><p className="text-[11px] text-slate-500">{session.back.time}</p></div>
                        <AvailabilityBadge available={session.back.available} />
                      </div>
                    </div>
                  </div>
                ))}
                {availability?.checked_at && <p className="pt-2 text-center text-[11px] text-slate-500">최근 조회 {new Date(availability.checked_at).toLocaleTimeString('ko-KR', { timeZone: 'Asia/Seoul', hour: '2-digit', minute: '2-digit' })}</p>}
              </div>
            )}
          </section>
        </div>

        <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs leading-5 text-slate-500">예약 진행 중 현황이 달라질 수 있으니 신청 직전에 다시 확인해 주세요.</p>
          <a href={availability?.source_url || 'https://deepstation.kr/rez/step1.php'} target="_blank" rel="noreferrer" className="flex min-h-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 px-4 text-sm font-bold text-slate-700">딥스테이션에서 직접 확인 ↗</a>
        </div>
      </div>
    </div>
  );
}
