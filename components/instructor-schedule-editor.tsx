'use client';

import { useState } from 'react';
import { bookingDays, bookingPools, getAvailableSlots } from '../lib/booking-options';

type Schedule = Record<string, Record<string, string[]>>;
type Props = { value: Schedule; onChange: (next: Schedule) => void; legacy: boolean; error?: string };

export default function InstructorScheduleEditor({ value, onChange, legacy, error }: Props) {
  const [open, setOpen] = useState('passnine:mon');
  const [openPool, setOpenPool] = useState('passnine');
  const [copySource, setCopySource] = useState('');
  const [copyTarget, setCopyTarget] = useState('');
  const pools = [bookingPools.passnine, bookingPools.miryang];
  const slotsFor = (poolId: string, dayId: string) => value[poolId]?.[dayId] || [];
  const setSlots = (poolId: string, dayId: string, slots: string[]) => {
    onChange({ ...value, [poolId]: { ...value[poolId], [dayId]: slots } });
  };
  const copy = (poolId: string) => {
    if (!copySource || !copyTarget || copySource === copyTarget) return;
    const source = slotsFor(poolId, copySource);
    const allowed = getAvailableSlots(poolId, copyTarget).map((slot: { id: string }) => slot.id);
    const next = source.filter(slot => allowed.includes(slot));
    const current = slotsFor(poolId, copyTarget);
    if (current.length && !window.confirm(`${bookingDays.find(day => day.id === copyTarget)?.label}의 기존 ${current.length}개 회차를 덮어쓸까요?`)) return;
    setSlots(poolId, copyTarget, next);
    setOpen(`${poolId}:${copyTarget}`);
  };

  return <div className="space-y-6">
    {legacy && <p className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm leading-6 text-amber-900">기존에는 선택한 모든 요일에 공통 회차가 적용됐습니다. 아래 요일별 시간을 확인하고 저장해 주세요. 저장 전까지 기존 신청과 공개 상태는 유지됩니다.</p>}
    <p className="text-sm leading-6 text-slate-700">시간이 선택된 요일만 수업 가능으로 저장됩니다. 선택하지 않은 요일은 수업 불가입니다. 공휴일은 별도 가능 요일이며 실제 운영 여부는 상담에서 확인합니다.</p>
    {pools.map(pool => <section key={pool.id} className="space-y-3 border-t border-slate-200 pt-5" aria-label={`${pool.name} 요일별 시간`}>
      <button type="button" aria-expanded={openPool === pool.id} onClick={() => { setOpenPool(openPool === pool.id ? '' : pool.id); setCopySource(''); setCopyTarget(''); }} className="flex min-h-12 w-full items-center justify-between text-left text-base font-bold text-slate-950"><span>{pool.name} · {Object.values(value[pool.id] || {}).filter(slots => slots.length).length}개 요일</span><span className="text-sm text-cyan-800">{openPool === pool.id ? '접기' : '시간 설정'}</span></button>
      {openPool === pool.id && <>
      {bookingDays.map(day => {
        const selected = slotsFor(pool.id, day.id);
        const options = getAvailableSlots(pool.id, day.id);
        const isOpen = open === `${pool.id}:${day.id}`;
        return <div key={day.id} className="rounded-xl border border-slate-200 bg-slate-50">
          <button type="button" aria-expanded={isOpen} onClick={() => setOpen(isOpen ? '' : `${pool.id}:${day.id}`)} className="flex min-h-14 w-full items-center justify-between gap-3 px-4 text-left text-sm font-bold text-slate-900">
            <span>{day.label} · {selected.length ? selected.map(slot => pool.slots.find(item => item.id === slot)?.label).join(' · ') : '수업 불가'}</span><span aria-hidden="true">{isOpen ? '접기' : '열기'}</span>
          </button>
          {isOpen && <div className="grid gap-2 border-t border-slate-200 p-3 min-[430px]:grid-cols-2">
            {options.length ? options.map((slot: { id: string; label: string; time: string }) => <label key={slot.id} className="flex min-h-12 items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 text-sm leading-6">
              <input type="checkbox" checked={selected.includes(slot.id)} onChange={event => setSlots(pool.id, day.id, event.target.checked ? [...selected, slot.id] : selected.filter(item => item !== slot.id))} className="h-5 w-5 shrink-0 accent-cyan-700" /><span>{slot.label} · {slot.time}</span>
            </label>) : <p className="text-sm text-slate-600">운영 회차가 없습니다.</p>}
          </div>}
        </div>;
      })}
      <div className="rounded-xl border border-cyan-200 bg-cyan-50 p-3">
        <p className="text-sm font-bold text-cyan-950">다른 요일에 시간 복사</p>
        <div className="mt-2 grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
          <select aria-label={`${pool.name} 복사할 요일`} value={copySource} onChange={event => setCopySource(event.target.value)} className="min-h-12 rounded-xl border border-slate-300 bg-white px-3 text-base"><option value="">복사할 요일</option>{bookingDays.map(day => <option key={day.id} value={day.id}>{day.label}</option>)}</select>
          <select aria-label={`${pool.name} 적용할 요일`} value={copyTarget} onChange={event => setCopyTarget(event.target.value)} className="min-h-12 rounded-xl border border-slate-300 bg-white px-3 text-base"><option value="">적용할 요일</option>{bookingDays.map(day => <option key={day.id} value={day.id}>{day.label}</option>)}</select>
          <button type="button" disabled={!copySource || !copyTarget || copySource === copyTarget || !slotsFor(pool.id, copySource).length} onClick={() => copy(pool.id)} className="min-h-12 rounded-xl bg-cyan-800 px-4 text-sm font-bold text-white disabled:opacity-50">시간 복사</button>
        </div>
        <p className="mt-2 text-sm leading-6 text-cyan-900">복사 대상의 기존 시간은 확인 후 교체됩니다. 대상 요일에 운영하지 않는 회차는 복사되지 않습니다.</p>
      </div>
      </>}
    </section>)}
    {error && <p role="alert" className="rounded-xl bg-rose-50 p-3 text-sm font-bold text-rose-800">{error}</p>}
  </div>;
}
