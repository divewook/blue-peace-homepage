'use client';

import { useRef, useState } from 'react';
import { assignmentSmsUri, buildAssignmentMessage, instructorMobile, matchedCondition, preferredAlternatives } from '../lib/assignment-delivery';

type Assignment = {
  id: string; name: string; phone: string; course: string; created_at: string;
  matched_instructor_id?: string | null; assignment_generation?: number;
  matched_schedule?: { poolId: string; dayId: string; slotId: string } | null;
  schedule_mode?: string; schedule_alternatives?: Array<{ poolId: string; dayId: string; slotId: string }>;
  preferred_pool_options?: Record<string, { days?: string[]; times?: string[] }>;
  preferred_days?: string[]; pool?: string; time_slot?: string;
  delivery_event?: DeliveryEvent | null;
};
type DeliveryEvent = { id: number; instructor_id: string; assignment_generation: number; action: 'marked' | 'unmarked'; created_at: string; actor_identifier: string };
type Instructor = { id: string; name: string; phone?: string | null };

export default function AdminAssignmentDelivery({ customer, instructor, onChanged }:
  { customer: Assignment; instructor?: Instructor; onChanged?: () => void }) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [localEvent, setLocalEvent] = useState<DeliveryEvent | null>(null);
  const messageRef = useRef<HTMLTextAreaElement>(null);
  const numberRef = useRef<HTMLSpanElement>(null);
  const generation = customer.assignment_generation ?? 0;
  const assigned = !!customer.matched_instructor_id && instructor?.id === customer.matched_instructor_id;
  const fromServer = customer.delivery_event?.instructor_id === instructor?.id &&
    customer.delivery_event?.assignment_generation === generation ? customer.delivery_event : null;
  const fromLocal = localEvent?.instructor_id === instructor?.id && localEvent?.assignment_generation === generation ? localEvent : null;
  const currentEvent = fromLocal && (!fromServer || fromLocal.id > fromServer.id) ? fromLocal : fromServer;
  const delivered = assigned && currentEvent?.action === 'marked';
  const mobile = instructorMobile(instructor?.phone);
  const missingPhone = assigned && !instructor?.phone?.trim();
  const contactWarning = missingPhone ? '강사 연락처 등록 필요' : '강사 연락처 확인 필요';
  const message = assigned ? buildAssignmentMessage(customer, instructor) : '';
  const smsUri = assigned ? assignmentSmsUri(instructor?.phone, message) : null;

  async function copyText(value: string, fallback: 'message' | 'number') {
    try {
      if (!navigator.clipboard?.writeText) throw new Error('clipboard unavailable');
      await navigator.clipboard.writeText(value);
      setError('');
      setNotice(fallback === 'message' ? '전달 내용이 복사되었습니다.' : '강사 번호가 복사되었습니다.');
    } catch {
      setNotice('');
      if (fallback === 'message') {
        messageRef.current?.focus(); messageRef.current?.select();
        setError('자동 복사에 실패했습니다. 선택된 문구를 직접 복사해 주세요.');
      } else {
        const selection = window.getSelection();
        if (selection && numberRef.current) {
          const range = document.createRange(); range.selectNodeContents(numberRef.current);
          selection.removeAllRanges(); selection.addRange(range);
        }
        setError('자동 복사에 실패했습니다. 선택된 강사 번호를 직접 복사해 주세요.');
      }
    }
  }

  async function changeDelivery() {
    if (!assigned || busy) return;
    setBusy(true); setNotice(''); setError('');
    try {
      const response = await fetch(`/api/admin/deliveries/${encodeURIComponent(customer.id)}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: delivered ? 'unmarked' : 'marked', instructorId: instructor.id,
          assignmentGeneration: generation, expectedEventId: currentEvent?.id ?? null, requestKey: crypto.randomUUID() }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || '전달 상태를 저장하지 못했습니다.');
      setLocalEvent(result.event);
      setNotice(delivered ? '전달 완료 표시를 취소했습니다. 이전 이력은 보존됩니다.' : '전달 완료로 표시했습니다. 실제 발송·열람 여부는 확인되지 않습니다.');
      onChanged?.();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : '전달 상태를 저장하지 못했습니다.');
    } finally { setBusy(false); }
  }

  return <section className="mt-3 rounded-xl border border-indigo-200 bg-white p-3 text-base leading-7 break-keep" aria-label="강사에게 전달">
    <div className="flex flex-wrap items-center justify-between gap-2">
      <strong className="text-slate-950">강사에게 전달</strong>
      <span className={`rounded-full px-3 py-1 text-sm font-semibold ${delivered ? 'bg-emerald-100 text-emerald-900' : 'bg-amber-100 text-amber-900'}`}>
        {assigned ? delivered ? '전달 완료 표시' : '미전달' : '담당 강사 미배정'}
      </span>
    </div>
    {assigned && !mobile && <p className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-900">{contactWarning} · 문자 작성 기능을 사용할 수 없습니다.</p>}
    {delivered && <p className="mt-1 text-sm text-slate-700">표시 시각: {new Date(currentEvent.created_at).toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })} · 공유 관리자 계정</p>}
    <button type="button" aria-expanded={open} onClick={() => setOpen(value => !value)} className="mt-2 min-h-11 w-full rounded-lg border border-indigo-200 px-3 text-left font-semibold text-indigo-900">
      {open ? '전달 내용 접기' : '신청 정보와 전달 문구 확인'} <span aria-hidden="true">{open ? '⌃' : '⌄'}</span>
    </button>
    {open && <div className="mt-3 space-y-4 border-t border-slate-200 pt-4">
      <dl className="grid gap-2 text-sm sm:grid-cols-2">
        <div><dt className="font-semibold">신청번호</dt><dd className="break-all">{customer.id}</dd></div>
        <div><dt className="font-semibold">접수 시각</dt><dd>{new Date(customer.created_at).toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })}</dd></div>
        <div><dt className="font-semibold">고객</dt><dd>{customer.name} · {customer.phone}</dd></div>
        <div><dt className="font-semibold">신청 과정·레벨</dt><dd>{customer.course || '기록 없음'}</dd></div>
        <div className="sm:col-span-2"><dt className="font-semibold">고객 희망 대안</dt><dd><ol className="list-inside list-decimal">{preferredAlternatives(customer).map((item, index) => <li key={index}>{item}</li>)}</ol></dd></div>
        <div className="sm:col-span-2"><dt className="font-semibold">실제 일치한 상담 가능 조건</dt><dd>{matchedCondition(customer)}</dd></div>
        <div className="sm:col-span-2"><dt className="font-semibold">현재 담당 강사</dt><dd>{assigned ? instructor.name : '담당 강사 미배정'}{assigned && <> · <span ref={numberRef} className="select-text">{instructor.phone || '번호 기록 없음'}</span></>}</dd></div>
      </dl>
      {assigned ? <>
        <div>
          <label htmlFor={`assignment-message-${customer.id}`} className="block font-semibold">전달 문구 미리보기</label>
          <textarea id={`assignment-message-${customer.id}`} ref={messageRef} readOnly value={message} rows={16} className="mt-1 w-full min-w-0 rounded-lg border border-slate-300 bg-slate-50 p-3 text-base leading-7 text-slate-950" />
          <p className="text-sm text-slate-600">상담 담당 배정 안내입니다. 수업 예약·결제 확정이 아닙니다.</p>
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          <button type="button" onClick={() => void copyText(message, 'message')} className="min-h-12 rounded-xl bg-cyan-800 px-4 font-bold text-white">전달 내용 복사</button>
          {smsUri ? <a href={smsUri} className="flex min-h-12 items-center justify-center rounded-xl border border-cyan-700 px-4 text-center font-bold text-cyan-900">담당 강사 문자 작성</a>
            : <button type="button" disabled className="min-h-12 rounded-xl border border-slate-300 px-4 font-bold text-slate-500">{contactWarning}</button>}
          {instructor.phone && <button type="button" onClick={() => void copyText(instructor.phone || '', 'number')} className="min-h-11 rounded-xl border border-slate-300 px-4 font-semibold sm:col-span-2">강사 번호 복사 · {mobile || instructor.phone}</button>}
        </div>
        {!smsUri && <p className="text-sm font-semibold text-amber-900">{contactWarning} · 전달 내용은 복사할 수 있습니다.</p>}
        <p className="text-sm text-slate-700">문자 앱에서 내용을 확인한 뒤 직접 전송해 주세요. 본문이 비어 있으면 복사한 내용을 붙여넣어 주세요.</p>
        <button type="button" disabled={busy} onClick={() => void changeDelivery()} className="min-h-12 w-full rounded-xl border border-emerald-700 px-4 font-bold text-emerald-900 disabled:opacity-50">
          {busy ? '저장 중…' : delivered ? '전달 완료 표시 취소' : '실제로 안내한 뒤 전달 완료 표시'}
        </button>
        <p className="text-sm text-slate-600">복사하거나 문자 작성창을 여는 것만으로 전달 완료되지 않습니다. 완료 표시는 대표가 직접 안내한 뒤 누르세요.</p>
      </> : <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-900">담당 강사 미배정 · 강사 문자 작성과 전달 완료 표시는 배정 후 사용할 수 있습니다.</p>}
      {notice && <p role="status" className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-900">{notice}</p>}
      {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-900">{error}</p>}
    </div>}
  </section>;
}
