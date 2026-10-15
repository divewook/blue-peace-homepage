'use client';

import { useEffect } from 'react';

const storageKey = 'bluepeace_first_touch';

export type MarketingAttribution = {
  landing_url: string;
  referrer_url: string;
  traffic_source: string;
  traffic_medium: string;
  traffic_campaign: string;
  traffic_term: string;
  traffic_content: string;
  device_type: string;
};

const searchHosts: Record<string, { source: string; keys: string[] }> = {
  'google.': { source: 'Google', keys: ['q'] },
  'search.naver.': { source: 'Naver', keys: ['query'] },
  'search.daum.': { source: 'Daum', keys: ['q'] },
  'bing.': { source: 'Bing', keys: ['q'] },
};

function clip(value: string | null | undefined, length = 500) {
  return (value || '').slice(0, length);
}

function inferDevice() {
  const agent = navigator.userAgent.toLowerCase();
  if (/ipad|tablet/.test(agent)) return '태블릿';
  if (/mobi|iphone|android/.test(agent)) return '모바일';
  return 'PC';
}

function createAttribution(): MarketingAttribution {
  const current = new URL(window.location.href);
  const referrer = document.referrer ? new URL(document.referrer) : null;
  const externalReferrer = referrer && referrer.hostname !== current.hostname ? referrer : null;
  const searchEngine = externalReferrer
    ? Object.entries(searchHosts).find(([host]) => externalReferrer.hostname.includes(host))?.[1]
    : undefined;
  const source = current.searchParams.get('utm_source')
    || searchEngine?.source
    || externalReferrer?.hostname.replace(/^www\./, '')
    || '직접 방문';
  const medium = current.searchParams.get('utm_medium')
    || (searchEngine ? 'organic' : externalReferrer ? 'referral' : 'direct');
  const referrerTerm = searchEngine?.keys
    .map(key => externalReferrer?.searchParams.get(key))
    .find(Boolean);

  return {
    landing_url: clip(current.href),
    referrer_url: clip(externalReferrer?.href),
    traffic_source: clip(source, 100),
    traffic_medium: clip(medium, 100),
    traffic_campaign: clip(current.searchParams.get('utm_campaign'), 200),
    traffic_term: clip(
      current.searchParams.get('utm_term')
      || current.searchParams.get('keyword')
      || current.searchParams.get('query')
      || referrerTerm,
      200,
    ),
    traffic_content: clip(current.searchParams.get('utm_content'), 200),
    device_type: inferDevice(),
  };
}

export function getMarketingAttribution(): MarketingAttribution {
  try {
    const saved = localStorage.getItem(storageKey);
    if (saved) return { ...JSON.parse(saved), device_type: inferDevice() };
  } catch {}
  return createAttribution();
}

export default function MarketingAttributionTracker() {
  useEffect(() => {
    try {
      if (!localStorage.getItem(storageKey)) {
        localStorage.setItem(storageKey, JSON.stringify(createAttribution()));
      }
    } catch {}
  }, []);
  return null;
}
