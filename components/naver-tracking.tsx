'use client';

import Link from 'next/link';
import { useEffect, useSyncExternalStore } from 'react';
import { usePathname } from 'next/navigation';
import { getNaverTrackingConsent, isNaverTrackingEnabled, onNaverTrackingConsentChanged, reportNaverPageView, setNaverTrackingConsent } from '../lib/naver-lead-conversion';

export default function NaverTracking() {
  const pathname = usePathname();
  const choice = useSyncExternalStore(onNaverTrackingConsentChanged, getNaverTrackingConsent, () => 'hydrating');

  useEffect(() => {
    if (choice === 'yes') void reportNaverPageView(pathname);
  }, [pathname, choice]);

  if (choice === 'hydrating' || !isNaverTrackingEnabled() || (pathname !== '/' && pathname !== '/inquiry') || choice !== null) return null;

  return <aside aria-label="선택 방문 분석 안내" className="border-b border-cyan-200 bg-cyan-50 px-4 py-3 text-slate-900">
    <div className="mx-auto flex max-w-5xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm leading-6 sm:text-base">네이버 광고의 방문·상담 신청 성과를 확인할까요? 동의하면 네이버 방문 분석 스크립트가 실행됩니다. 거부해도 상담할 수 있습니다. <Link href="/privacy" className="font-semibold underline underline-offset-2">개인정보 안내</Link></p>
      <div className="flex shrink-0 gap-2"><button type="button" onClick={() => setNaverTrackingConsent(false)} className="min-h-11 rounded-xl border border-slate-300 bg-white px-4 text-sm font-semibold">허용 안 함</button><button type="button" onClick={() => setNaverTrackingConsent(true)} className="min-h-11 rounded-xl bg-cyan-800 px-4 text-sm font-semibold text-white">방문 분석 허용</button></div>
    </div>
  </aside>;
}
