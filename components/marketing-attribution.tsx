'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { parseMarketingTouch } from '../lib/marketing-attribution';

const firstKey = 'bluepeace_attribution_first_session';
const latestKey = 'bluepeace_attribution_latest_session';

type Touch = { landing_url: string; referrer_url: string; device_type: string };
export type MarketingAttribution = { first_touch: Touch; latest_touch: Touch };

function deviceType() {
  const agent = navigator.userAgent.toLowerCase();
  if (/ipad|tablet/.test(agent)) return '태블릿';
  if (/mobi|iphone|android/.test(agent)) return '모바일';
  return 'PC';
}

function currentTouch(): Touch {
  const device_type = deviceType();
  const parsed = parseMarketingTouch({ landing_url: window.location.href, referrer_url: document.referrer, device_type }, window.location.origin);
  return { landing_url: parsed?.landing_url || `${window.location.origin}${window.location.pathname}`, referrer_url: parsed?.referrer_url || '', device_type };
}

function readTouch(key: string): Touch | null {
  try {
    const value = JSON.parse(sessionStorage.getItem(key) || 'null');
    return value && typeof value.landing_url === 'string' ? value : null;
  } catch { return null; }
}

export function getMarketingAttribution(): MarketingAttribution {
  const current = currentTouch();
  return { first_touch: readTouch(firstKey) || current, latest_touch: readTouch(latestKey) || current };
}

export default function MarketingAttributionTracker() {
  const pathname = usePathname();
  useEffect(() => {
    if (pathname === '/TEST' || pathname.startsWith('/TEST/')) return;
    try {
      localStorage.removeItem('bluepeace_first_touch');
      const current = currentTouch();
      const parsed = parseMarketingTouch(current, window.location.origin);
      if (!readTouch(firstKey)) sessionStorage.setItem(firstKey, JSON.stringify(current));
      const external = document.referrer && new URL(document.referrer).hostname !== window.location.hostname;
      const tagged = parsed && (parsed.traffic_source || parsed.naver_keyword || parsed.naver_query);
      if (!readTouch(latestKey) || external || tagged) sessionStorage.setItem(latestKey, JSON.stringify(current));
    } catch {}
  }, [pathname]);
  return null;
}
