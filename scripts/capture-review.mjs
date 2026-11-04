// Capture only local demo pages. Admin responses are intercepted with fabricated
// data before any request can reach a real API. No production credentials used.
import { mkdir } from 'node:fs/promises';
import { chromium } from 'playwright-core';
import { reviewVersion } from '../lib/review-version.js';

const demoBase = process.env.BLUEPEACE_CAPTURE_DEMO_URL || 'http://127.0.0.1:3190';
const adminBase = process.env.BLUEPEACE_CAPTURE_ADMIN_URL || 'http://127.0.0.1:3191';
const output = new URL('../public/review/', import.meta.url);
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium', headless: true, args: ['--no-sandbox'] });

async function shot(page, name, fullPage = false) {
  await page.evaluate(version => {
    document.querySelector('[data-review-version]')?.remove();
    const label = document.createElement('span');
    label.dataset.reviewVersion = version;
    label.textContent = `검수 ${version}`;
    Object.assign(label.style, { position: 'fixed', bottom: '8px', right: '8px', zIndex: '10000', padding: '4px 8px', background: '#123847', color: '#fff', fontSize: '12px', borderRadius: '6px' });
    document.body.append(label);
  }, reviewVersion);
  await page.screenshot({ path: new URL(name, output).pathname, type: 'jpeg', quality: 78, fullPage });
}
async function assertNoOverflow(page, name) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
  if (overflow) throw new Error(`${name}: horizontal overflow`);
}

try {
  const mobile = await browser.newPage({ viewport: { width: 390, height: 900 }, deviceScaleFactor: 1 });
  await mobile.goto(`${demoBase}/TEST`, { waitUntil: 'networkidle' });
  await assertNoOverflow(mobile, 'mobile home');
  await shot(mobile, 'home-mobile.jpg', true);

  const desktop = await browser.newPage({ viewport: { width: 1440, height: 1050 }, deviceScaleFactor: 1 });
  await desktop.goto(`${demoBase}/TEST`, { waitUntil: 'networkidle' });
  await assertNoOverflow(desktop, 'desktop home');
  await shot(desktop, 'home-desktop.jpg');

  let consultationRequests = 0;
  mobile.on('request', request => { if (request.url().includes('/api/consultations')) consultationRequests++; });
  await mobile.goto(`${demoBase}/TEST/inquiry`, { waitUntil: 'networkidle' });
  if (!await mobile.getByRole('radio', { name: '아직 잘 모르겠어요' }).isChecked()) throw new Error('direct inquiry interest default changed');
  if (await mobile.locator('#consult-level').count()) throw new Error('direct inquiry unexpectedly selected a level');
  await assertNoOverflow(mobile, 'direct mobile inquiry');
  await shot(mobile, 'inquiry-direct-mobile.jpg', true);
  await mobile.goto(`${demoBase}/TEST/inquiry?course=freediving&level=level1`, { waitUntil: 'networkidle' });
  if (!await mobile.getByRole('radio', { name: '프리다이빙', exact: true }).isChecked()) throw new Error('linked inquiry interest not selected');
  if (await mobile.locator('#consult-level').inputValue() !== 'level1') throw new Error('linked inquiry level not selected');
  await mobile.getByRole('radio', { name: '스쿠버다이빙' }).check();
  if (await mobile.locator('#consult-level').inputValue() !== '') throw new Error('old level retained after interest change');
  await mobile.getByRole('radio', { name: '프리다이빙', exact: true }).check();
  if (await mobile.locator('#consult-level').inputValue() !== '') throw new Error('old level returned after interest change');
  await mobile.locator('#consult-level').selectOption('level1');
  await assertNoOverflow(mobile, 'mobile inquiry');
  await shot(mobile, 'inquiry-mobile.jpg', true);
  await mobile.locator('#consult-name').fill('가상 고객');
  await mobile.locator('#consult-phone').fill('01000000000');
  await mobile.locator('#consult-privacy').check();
  await mobile.locator('button[type=submit]').click();
  await mobile.getByRole('heading', { name: '상담 신청 화면을 확인했습니다.' }).waitFor();
  await shot(mobile, 'completion-mobile.jpg');
  if (consultationRequests) throw new Error('public demo attempted an API consultation request');

  const admin = await browser.newPage({ viewport: { width: 390, height: 1500 }, deviceScaleFactor: 1 });
  await admin.route(`${adminBase}/api/admin/**`, async route => {
    const path = new URL(route.request().url()).pathname;
    const json = path === '/api/admin/data' ? {
      instructors: [{ id: '11111111-1111-4111-8111-111111111111', name: '가상 강사', username: 'sample-instructor', phone: '010-0000-0000', is_approved: true, created_at: '2030-01-01T00:00:00Z', course_levels: { '프리다이빙': ['1레벨 (프리다이버)'] }, can_passnine: true, can_miryang: false }],
      customers: [{ id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', name: '가상 고객', phone: '010-0000-0000', course: '프리다이빙 (1레벨)', pool: '상담 후 협의', time_slot: '상담 후 협의', matched_instructor: '배정 대기', matched_instructor_id: null, request_status: 'pending_assignment', consultation_source: 'direct', consultation_status: 'new', consultation_revision: 0, interest_course_id: 'freediving', interest_level_id: 'level1', contact_window: 'evening', inquiry_text: '첫 수업 내용을 상담하고 싶습니다.', created_at: new Date().toISOString(), schedule_mode: 'flexible', schedule_alternatives: [] }],
    } : { ok: true };
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(json) });
  });
  await admin.goto(`${adminBase}/admin`, { waitUntil: 'networkidle' });
  await admin.locator('input[type=password]').fill('local-mock-only');
  await admin.getByRole('button', { name: '관리자 접속' }).click();
  await admin.getByRole('button', { name: /신규 상담 전체 1건/ }).waitFor();
  await admin.getByRole('button', { name: /신규 상담 전체 1건/ }).click();
  await admin.getByText('대표 직접 상담', { exact: true }).scrollIntoViewIfNeeded();
  await admin.evaluate(() => {
    const banner = document.createElement('div');
    banner.textContent = '가상 데이터 화면 · 실제 관리자 서비스가 아닙니다';
    Object.assign(banner.style, { position: 'fixed', top: '0', left: '0', right: '0', zIndex: '9999', background: '#7c2d12', color: 'white', padding: '12px', fontSize: '15px', fontWeight: 'bold', textAlign: 'center' });
    document.body.append(banner);
  });
  await assertNoOverflow(admin, 'mock admin');
  await shot(admin, 'admin-fake-mobile.jpg');
  console.log('Captured review images. Public demo consultation API calls:', consultationRequests);
} finally {
  await browser.close();
}
