'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import CustomerMatchCard from '../../components/customer-match-card';
import MarketingSummary from '../../components/marketing-summary';

interface Instructor {
  id: string;
  name: string;
  username: string;
  is_approved: boolean;
  created_at: string;
}

interface CustomerLead {
  id: string;
  matched_instructor_id: string | null;
  name: string;
  phone: string;
  course: string;
  pool: string;
  time_slot?: string;
  preferred_days?: string[];
  preferred_schedule?: Record<string, string[]>;
  matched_instructor: string;
  created_at: string;
  traffic_source?: string;
  traffic_medium?: string;
  traffic_campaign?: string;
  traffic_term?: string;
  traffic_content?: string;
  landing_url?: string;
  referrer_url?: string;
  device_type?: string;
}

export default function AdminDashboard() {
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [adminPw, setAdminPw] = useState('');
  
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [customers, setCustomers] = useState<CustomerLead[]>([]);
  const [statPeriod, setStatPeriod] = useState<'1d' | '1w' | '1m' | '6m' | '1y'>('1m');
  const [selectedInstructorId, setSelectedInstructorId] = useState<string | null>(null);
  const [visibleCustomerCount, setVisibleCustomerCount] = useState(5);
  const [modalVisibleCount, setModalVisibleCount] = useState(10);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const response = await fetch('/api/admin/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: adminPw }),
    });
    const result = await response.json();
    if (response.ok) {
      setAdminPw('');
      setIsAdminLoggedIn(true);
      void fetchAdminData();
    } else {
      alert(result.error || '관리자 로그인에 실패했습니다.');
    }
  };

  const fetchAdminData = async () => {
    const response = await fetch('/api/admin/data', { cache: 'no-store' });
    const result = await response.json();
    if (!response.ok) {
      alert(result.error || '관리자 데이터를 불러오지 못했습니다.');
      return;
    }
    setInstructors(result.instructors || []);
    setCustomers(result.customers || []);
  };

  const toggleApproval = async (id: string, currentStatus: boolean) => {
    const response = await fetch(`/api/admin/instructors/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_approved: !currentStatus }),
    });
    if (response.ok) void fetchAdminData();
    else alert((await response.json()).error || '승인 변경에 실패했습니다.');
  };

  const deleteInstructor = async (id: string) => {
    if (confirm('정말 이 강사를 삭제하시겠습니까?')) {
      const response = await fetch(`/api/admin/instructors/${encodeURIComponent(id)}`, { method: 'DELETE' });
      if (response.ok) void fetchAdminData();
      else alert((await response.json()).error || '강사 삭제에 실패했습니다.');
    }
  };

  // 기간별 필터링 함수
  const filterByPeriod = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffDays = diffTime / (1000 * 3600 * 24);

    if (statPeriod === '1d') return diffDays <= 1;
    if (statPeriod === '1w') return diffDays <= 7;
    if (statPeriod === '1m') return diffDays <= 30;
    if (statPeriod === '6m') return diffDays <= 180;
    if (statPeriod === '1y') return diffDays <= 365;
    return true;
  };

  const filteredCustomers = customers.filter(c => filterByPeriod(c.created_at));

  const matchesInstructor = (customer: CustomerLead, instructor: Instructor) =>
    customer.matched_instructor_id === instructor.id
    || (!customer.matched_instructor_id && customer.matched_instructor === instructor.name);

  // 강사별 통계 집계
  const instructorStats = instructors.map(ins => {
    const count = filteredCustomers.filter(customer => matchesInstructor(customer, ins)).length;
    return { id: ins.id, name: ins.name, count };
  });
  const selectedInstructor = instructors.find(instructor => instructor.id === selectedInstructorId);
  const selectedInstructorCustomers = selectedInstructor
    ? filteredCustomers.filter(customer => matchesInstructor(customer, selectedInstructor))
    : [];

  const changePeriod = (period: typeof statPeriod) => {
    setStatPeriod(period);
    setVisibleCustomerCount(5);
    setModalVisibleCount(10);
  };

  const openInstructorDetails = (id: string) => {
    setSelectedInstructorId(id);
    setModalVisibleCount(10);
  };

  if (!isAdminLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
        <div className="bg-white border border-slate-200 p-8 rounded-3xl shadow-xl max-w-sm w-full text-center space-y-4">
          <h1 className="text-xl font-black text-slate-900">🛡️ 블루피스 관리자 로그인</h1>
          <form onSubmit={handleAdminLogin} className="space-y-3">
            <input
              type="password"
              value={adminPw}
              onChange={(e) => setAdminPw(e.target.value)}
              placeholder="관리자 비밀번호 입력"
              autoComplete="current-password"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-base focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-100"
              required
            />
            <button type="submit" className="w-full py-3 bg-slate-900 text-white font-bold rounded-xl text-xs">
              관리자 접속
            </button>
          </form>
          <Link href="/" className="text-xs text-slate-400 hover:underline inline-block">← 메인으로</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 p-4 sm:p-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        
        <div className="flex justify-between items-center bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div>
            <span className="text-xs font-bold px-3 py-1 bg-cyan-100 text-cyan-800 rounded-full">ADMIN DASHBOARD</span>
            <h1 className="text-2xl font-black text-slate-900 mt-2">블루피스 통합 관리 센터</h1>
          </div>
          <button onClick={() => { void fetch('/api/admin/session', { method: 'DELETE' }); setIsAdminLoggedIn(false); setCustomers([]); }} className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl">
            로그아웃
          </button>
        </div>

        {/* 1. 소속 강사 승인 및 관리 */}
        <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-slate-900">👥 소속 강사 계정 관리 및 승인</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400">
                  <th className="py-3">강사명</th>
                  <th className="py-3">아이디</th>
                  <th className="py-3">승인 상태</th>
                  <th className="py-3 text-right">관리</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {instructors.map(ins => (
                  <tr key={ins.id}>
                    <td className="py-3 font-bold text-slate-900">{ins.name}</td>
                    <td className="py-3 text-slate-600">{ins.username}</td>
                    <td className="py-3">
                      <span className={`px-2.5 py-1 rounded-full font-bold text-[10px] ${ins.is_approved ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                        {ins.is_approved ? '승인됨' : '승인 대기중'}
                      </span>
                    </td>
                    <td className="py-3 text-right space-x-2">
                      <button
                        onClick={() => toggleApproval(ins.id, ins.is_approved)}
                        className={`px-3 py-1.5 rounded-lg font-bold text-white ${ins.is_approved ? 'bg-amber-600 hover:bg-amber-500' : 'bg-cyan-600 hover:bg-cyan-500'}`}
                      >
                        {ins.is_approved ? '승인 취소' : '강사 승인'}
                      </button>
                      <button onClick={() => deleteInstructor(ins.id)} className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg font-bold">
                        삭제
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 2. 매칭 통계 및 기간별 필터 */}
        <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-4">
            <h2 className="text-lg font-bold text-slate-900">📊 강사별 매칭 통계</h2>
            <div className="flex gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold">
              {[
                { key: '1d', label: '1일' },
                { key: '1w', label: '1주일' },
                { key: '1m', label: '1개월' },
                { key: '6m', label: '6개월' },
                { key: '1y', label: '1년' },
              ].map(p => (
                <button
                  key={p.key}
                  onClick={() => changePeriod(p.key as typeof statPeriod)}
                  className={`px-3 py-1.5 rounded-lg transition ${statPeriod === p.key ? 'bg-white text-cyan-700 shadow-xs' : 'text-slate-500'}`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {instructorStats.map(stat => (
              <button
                type="button"
                key={stat.id}
                onClick={() => openInstructorDetails(stat.id)}
                className="group min-h-28 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center transition hover:border-cyan-400 hover:bg-cyan-50 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2"
                aria-label={`${stat.name} 강사 매칭 ${stat.count}건 세부 내역 보기`}
              >
                <p className="text-xs text-slate-500 font-bold">{stat.name} 강사</p>
                <p className="text-2xl font-black text-cyan-600 mt-1">{stat.count}건</p>
                <p className="mt-2 text-xs font-bold text-cyan-700">세부 내역 보기 <span aria-hidden="true" className="inline-block transition group-hover:translate-x-0.5">→</span></p>
              </button>
            ))}
          </div>

          <MarketingSummary customers={filteredCustomers} />

          {/* 3. 고객 매칭 세부 내역 (과정, 레벨, 풀장, 요일/시간) */}
          <div className="pt-4 border-t border-slate-100">
            <h3 className="text-base font-bold text-slate-900 mb-3">📋 고객 매칭 세부 신청 내역 ({filteredCustomers.length}건)</h3>
            <div className="space-y-3">
              {filteredCustomers.slice(0, visibleCustomerCount).map(cus => (
                <CustomerMatchCard key={cus.id} customer={cus} showAttribution onWorkChanged={fetchAdminData} />
              ))}
            </div>
            {filteredCustomers.length > visibleCustomerCount && (
              <button
                type="button"
                onClick={() => setVisibleCustomerCount(count => count + 5)}
                className="mt-4 min-h-11 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm font-bold text-slate-700 hover:bg-slate-50"
              >
                최근 고객 5건 더 보기 ({filteredCustomers.length - visibleCustomerCount}건 남음)
              </button>
            )}
            {filteredCustomers.length > 5 && visibleCustomerCount >= filteredCustomers.length && (
              <button
                type="button"
                onClick={() => setVisibleCustomerCount(5)}
                className="mt-4 min-h-11 w-full rounded-xl px-4 text-sm font-bold text-slate-500 hover:bg-slate-50"
              >
                최근 5건만 보기
              </button>
            )}
          </div>

        </div>

      </div>

      {selectedInstructor && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="instructor-match-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-3 backdrop-blur-sm sm:p-6"
          onMouseDown={(event) => { if (event.target === event.currentTarget) setSelectedInstructorId(null); }}
        >
          <div className="flex max-h-[calc(100dvh-1.5rem)] w-full max-w-3xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl sm:max-h-[calc(100dvh-3rem)]">
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 p-5 sm:p-6">
              <div>
                <p className="text-xs font-bold tracking-widest text-cyan-700">MATCH DETAILS</p>
                <h2 id="instructor-match-title" className="mt-1 text-xl font-black text-slate-950">{selectedInstructor.name} 강사 매칭 세부 내역</h2>
                <p className="mt-1 text-sm text-slate-600">선택한 기간 기준 총 {selectedInstructorCustomers.length}건입니다.</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedInstructorId(null)}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-slate-100 text-lg font-bold text-slate-600 hover:bg-slate-200"
                aria-label="세부 내역 닫기"
              >
                ✕
              </button>
            </div>
            <div className="overflow-y-auto p-4 sm:p-6">
              {selectedInstructorCustomers.length ? (
                <div className="space-y-3">
                  {selectedInstructorCustomers.slice(0, modalVisibleCount).map(customer => (
                    <CustomerMatchCard key={customer.id} customer={customer} showAttribution onWorkChanged={fetchAdminData} />
                  ))}
                  {selectedInstructorCustomers.length > modalVisibleCount && (
                    <button
                      type="button"
                      onClick={() => setModalVisibleCount(count => count + 10)}
                      className="min-h-11 w-full rounded-xl border border-cyan-200 bg-cyan-50 px-4 text-sm font-bold text-cyan-800 hover:bg-cyan-100"
                    >
                      10건 더 보기 ({selectedInstructorCustomers.length - modalVisibleCount}건 남음)
                    </button>
                  )}
                </div>
              ) : (
                <div className="rounded-2xl bg-slate-50 p-8 text-center text-sm text-slate-500">선택한 기간에 매칭된 고객이 없습니다.</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
