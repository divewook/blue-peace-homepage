import assert from 'node:assert/strict';
import test from 'node:test';
import { parseMarketingAttribution, parseMarketingTouch } from '../lib/marketing-attribution.js';
import { isNewConsultationConversion, reportNaverLeadOnce } from '../lib/naver-lead-conversion.js';
import { instructorCustomerFields } from '../lib/customer-fields.js';

test('네이버 등록 키워드와 실제 검색어를 분리하고 허용한 URL 항목만 남긴다', () => {
  const touch = parseMarketingTouch({
    landing_url: 'https://www.bluepeace.co.kr/inquiry?course=freediving&n_keyword=프리다이빙&n_query=대구%20프리다이빙&n_ad_group=grp-123&n_ad=nad-456&name=고객비밀',
    referrer_url: 'https://search.naver.com/search.naver?query=다이빙&private=hidden',
    device_type: '모바일',
    traffic_source: 'forged',
  });
  assert.equal(touch.naver_keyword, '프리다이빙');
  assert.equal(touch.naver_query, '대구 프리다이빙');
  assert.equal(touch.naver_ad_group, 'grp-123');
  assert.equal(touch.naver_ad, 'nad-456');
  assert.equal(touch.traffic_source, 'Naver');
  assert.equal(touch.traffic_medium, 'paid_search');
  assert.ok(!touch.landing_url.includes('name='));
  assert.ok(!touch.referrer_url.includes('private='));
});

test('UTM, 첫 유입과 최근 유입은 분리되고 출처가 없으면 추정하지 않는다', () => {
  const { first, latest } = parseMarketingAttribution({
    first_touch: { landing_url: 'https://www.bluepeace.co.kr/?utm_source=blog&utm_campaign=autumn', referrer_url: '' },
    latest_touch: { landing_url: 'https://www.bluepeace.co.kr/inquiry?course=scuba&utm_source=instagram&utm_medium=social', referrer_url: '' },
  });
  assert.equal(first.traffic_source, 'blog');
  assert.equal(first.traffic_campaign, 'autumn');
  assert.equal(latest.traffic_source, 'instagram');
  assert.equal(latest.traffic_medium, 'social');
  const noSource = parseMarketingTouch({ landing_url: 'https://www.bluepeace.co.kr/inquiry', referrer_url: '' });
  assert.equal(noSource.traffic_source, null);
  assert.equal(noSource.naver_query, null);
});

test('외부 랜딩 URL과 과도한 입력은 신뢰하지 않는다', () => {
  assert.equal(parseMarketingTouch({ landing_url: 'https://other.example/?n_query=forged' }), null);
  const touch = parseMarketingTouch({ landing_url: `https://www.bluepeace.co.kr/?n_query=${'가'.repeat(250)}&n_ad=bad%20id` });
  assert.equal(touch.naver_query.length, 200);
  assert.equal(touch.naver_ad, null);
});

test('강사 신청 조회 필드에 광고 분석 정보가 포함되지 않는다', () => {
  const fields = instructorCustomerFields.split(',');
  assert.ok(fields.includes('name') && fields.includes('schedule_alternatives'));
  for (const field of ['naver_keyword', 'naver_query', 'naver_ad_group', 'naver_ad', 'attribution_latest', 'traffic_source']) {
    assert.ok(!fields.includes(field));
  }
});

test('새 신청 저장만 전환 대상이며, 식별키가 없으면 측정 실패가 신청을 막지 않는다', async () => {
  assert.equal(isNewConsultationConversion({ id: 'saved', duplicate: false }), true);
  assert.equal(isNewConsultationConversion({ id: 'saved', duplicate: true }), false);
  assert.equal(isNewConsultationConversion({}), false);
  assert.equal(await reportNaverLeadOnce({ id: 'saved', duplicate: false }, true), false);
  assert.equal(await reportNaverLeadOnce({ id: 'saved', duplicate: false }, false), false);
});

test('격리된 가짜 네이버 스크립트에서도 신청당 한 번만 기록하고 차단 실패를 흡수한다', async () => {
  const oldId = process.env.NEXT_PUBLIC_NAVER_WCS_ACCOUNT_ID;
  const oldEnabled = process.env.NEXT_PUBLIC_NAVER_WCS_ENABLED;
  const oldWindow = globalThis.window;
  const oldDocument = globalThis.document;
  const oldStorage = globalThis.sessionStorage;
  const sent = [];
  const saved = new Map();
  try {
    process.env.NEXT_PUBLIC_NAVER_WCS_ACCOUNT_ID = 'test-only';
    process.env.NEXT_PUBLIC_NAVER_WCS_ENABLED = 'true';
    globalThis.sessionStorage = { getItem: key => saved.get(key) || null, setItem: (key, value) => saved.set(key, value) };
    globalThis.window = { wcs: { inflow: () => {}, trans: value => sent.push(value) }, wcs_do: () => {} };
    assert.equal(await reportNaverLeadOnce({ id: 'saved-one' }, true), true);
    assert.equal(await reportNaverLeadOnce({ id: 'saved-one' }, true), false);
    assert.deepEqual(sent, [{ type: 'lead' }]);
    globalThis.window = {};
    globalThis.document = { createElement: () => ({}), head: { appendChild: script => script.onerror() } };
    assert.equal(await reportNaverLeadOnce({ id: 'saved-two' }, true), false);
  } finally {
    if (oldId === undefined) delete process.env.NEXT_PUBLIC_NAVER_WCS_ACCOUNT_ID;
    else process.env.NEXT_PUBLIC_NAVER_WCS_ACCOUNT_ID = oldId;
    if (oldEnabled === undefined) delete process.env.NEXT_PUBLIC_NAVER_WCS_ENABLED;
    else process.env.NEXT_PUBLIC_NAVER_WCS_ENABLED = oldEnabled;
    globalThis.window = oldWindow;
    globalThis.document = oldDocument;
    globalThis.sessionStorage = oldStorage;
  }
});
