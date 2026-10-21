import { useState } from 'react';
import { scheduleLabel } from '../lib/booking-options';
import CustomerWorkPanel from './customer-work-panel';
import AdminAssignmentDelivery from './admin-assignment-delivery';
import { consultationStatuses } from '../lib/customer-work';

export type CustomerMatch = {
  id: string;
  matched_instructor_id?: string | null;
  assignment_generation?: number;
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
  matched_schedule?: { poolId: string; dayId: string; slotId: string } | null;
  delivery_event?: { id: number; instructor_id: string; assignment_generation: number; action: 'marked' | 'unmarked'; created_at: string; actor_identifier: string } | null;
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
  naver_keyword?: string | null;
  naver_query?: string | null;
  naver_ad_group?: string | null;
  naver_ad?: string | null;
  attribution_latest?: {
    traffic_source?: string | null; traffic_medium?: string | null; traffic_campaign?: string | null;
    naver_keyword?: string | null; naver_query?: string | null;
  } | null;
  landing_url?: string;
  referrer_url?: string;
  device_type?: string;
  workflow?: { status?: string | null; task_title?: string | null; task_due_at?: string | null; task_completed_at?: string | null } | null;
  next_lesson?: { lesson_date: string; start_time: string; status: string } | null;
  upcoming_lesson_count?: number;
  past_unresolved_lesson_count?: number;
  closed_with_future_lesson?: boolean;
  reassigned_future_lesson_count?: number;
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

export default function CustomerMatchCard({ customer, showAttribution = false, adminInstructor, onWorkChanged }: { customer: CustomerMatch; showAttribution?: boolean; adminInstructor?: { id: string; name: string; phone?: string | null }; onWorkChanged?: () => void }) {
  const [deleting, setDeleting] = useState(false);
  const [deleted, setDeleted] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  async function deleteApplication() {
    if (deleting || !window.confirm(`${customer.name} 님의 상담 신청을 영구 삭제할까요? 연결된 상담 상태·메모·수업 일정·전달 이력도 함께 삭제됩니다. 복구할 수 없습니다.`)) return;
    setDeleting(true);
    setDeleteError('');
    try {
      const response = await fetch(`/api/admin/customers/${encodeURIComponent(customer.id)}`, { method: 'DELETE' });
      const result = await response.json();
      if (!response.ok || result.deletedId !== customer.id) throw new Error(result.error || '삭제 결과를 확인하지 못했습니다.');
      setDeleted(true);
      onWorkChanged?.();
    } catch (error) {
      setDeleteError(error instanceof Error ? error.message : '삭제하지 못했습니다.');
    } finally { setDeleting(false); }
  }
  const days = customer.preferred_days?.length ? customer.preferred_days : [];
  const schedule = customer.preferred_schedule && Object.keys(customer.preferred_schedule).length
    ? customer.preferred_schedule
    : { [customer.pool]: customer.time_slot ? [customer.time_slot] : [] };
  const poolOptions = customer.preferred_pool_options && Object.keys(customer.preferred_pool_options).length
    ? customer.preferred_pool_options
    : Object.fromEntries(Object.entries(schedule).map(([poolName, times]) => [poolName, { days, times }]));
  const sourceDetail = [customer.traffic_source || '확인 불가', customer.traffic_medium].filter(Boolean).join(' · ');
  const exactAlternatives = Array.isArray(customer.schedule_alternatives)
    ? customer.schedule_alternatives.filter(option => option?.poolId && option?.dayId && option?.slotId)
    : [];
  const isPendingAssignment = customer.request_status === 'pending_assignment' || !customer.matched_instructor_id;

  if (deleted) return null;

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
      {customer.matched_schedule && <p className="mt-3 rounded-xl bg-cyan-50 p-3 text-sm font-semibold leading-6 text-cyan-900">배정 시 일치한 상담 가능 일정: {scheduleLabel(customer.matched_schedule)} · 실제 수업 예약은 상담 후 확정</p>}

      <div className="mt-3 rounded-xl border border-slate-200 bg-white p-3 text-base leading-7">
        <p className="font-bold text-slate-900">상담: {customer.workflow?.status ? consultationStatuses[customer.workflow.status as keyof typeof consultationStatuses] : '진행 상태 미기록'}</p>
        {customer.closed_with_future_lesson && <p className="font-semibold text-amber-900">종료된 상담에 미래 확정 수업이 남아 있습니다. 담당자와 일정을 확인해 주세요.</p>}
        {!!customer.past_unresolved_lesson_count && customer.workflow?.status !== 'closed' && <p className="font-semibold text-amber-900">지난 확정 수업 {customer.past_unresolved_lesson_count}건의 진행 여부를 확인하고 상담 상태를 정리해 주세요. 자동으로 완료되지 않습니다.</p>}
        {!!customer.reassigned_future_lesson_count && <p className="font-semibold text-amber-900">담당 변경 전 강사에게 연결된 미래 수업 {customer.reassigned_future_lesson_count}건이 남아 있습니다. 대표에게 확인해 주세요.</p>}
        {customer.workflow?.task_title && !customer.workflow.task_completed_at && <p>다음 할 일: {customer.workflow.task_title}{customer.workflow.task_due_at ? ` · ${new Date(customer.workflow.task_due_at).toLocaleString('ko-KR')}` : ''}</p>}
        {customer.next_lesson && <p>가까운 확정 수업: {customer.next_lesson.lesson_date} {customer.next_lesson.start_time.slice(0, 5)}</p>}
      </div>
      <CustomerWorkPanel customerId={customer.id} onChanged={onWorkChanged} />
      {showAttribution && <AdminAssignmentDelivery customer={customer} instructor={adminInstructor} onChanged={onWorkChanged} />}

      {showAttribution && (
        <details className="group mt-3 rounded-xl border border-indigo-200 bg-indigo-50 p-3">
          <summary className="flex min-h-8 cursor-pointer list-none items-center justify-between gap-3 text-xs font-bold text-indigo-900">
            <span>마케팅 유입 정보</span>
            <span aria-hidden="true" className="transition group-open:rotate-180">⌄</span>
          </summary>
          <div className="mt-3 grid gap-x-5 gap-y-1 border-t border-indigo-200 pt-3 text-xs text-slate-700 sm:grid-cols-2">
            <p><span className="font-bold">첫 유입:</span> {sourceDetail}</p>
            <p><span className="font-bold">네이버 등록 키워드:</span> {customer.naver_keyword || '확인 불가'}</p>
            <p><span className="font-bold">네이버 실제 검색어:</span> {customer.naver_query || '확인 불가'}</p>
            <p><span className="font-bold">광고그룹·소재 ID:</span> {[customer.naver_ad_group, customer.naver_ad].filter(Boolean).join(' · ') || '확인 불가'}</p>
            <p><span className="font-bold">UTM 캠페인·검색어:</span> {[customer.traffic_campaign, customer.traffic_term].filter(Boolean).join(' · ') || '확인 불가'}</p>
            <p><span className="font-bold">같은 탭의 최근 유입:</span> {customer.attribution_latest?.traffic_source || '확인 불가'}{customer.attribution_latest?.traffic_medium ? ` · ${customer.attribution_latest.traffic_medium}` : ''}</p>
            <p><span className="font-bold">기기:</span> {customer.device_type || '확인 불가'}</p>
            <p><span className="font-bold">이전 사이트:</span> {safeHost(customer.referrer_url) || '직접 방문/미제공'}</p>
            <p><span className="font-bold">첫 방문 페이지:</span> {safeLanding(customer.landing_url) || '확인 불가'}</p>
          </div>
        </details>
      )}
      {showAttribution && <details className="mt-3 rounded-xl border border-rose-200 bg-white p-3">
        <summary className="min-h-11 cursor-pointer py-2 font-semibold text-rose-800">상담 이력 관리</summary>
        <p className="mt-2 text-sm leading-6 text-slate-700">삭제하면 신청과 연결된 상담 메모·수업 일정·전달 이력도 함께 영구 삭제됩니다.</p>
        <button type="button" disabled={deleting} onClick={() => void deleteApplication()} className="mt-3 min-h-11 rounded-xl border border-rose-700 px-4 font-bold text-rose-800 disabled:opacity-50">{deleting ? '삭제 중…' : '이 신청 영구 삭제'}</button>
        {deleteError && <p role="alert" className="mt-2 text-sm font-semibold text-rose-800">{deleteError}</p>}
      </details>}
    </article>
  );
}
