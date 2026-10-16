import serverlessChromium from "@sparticuz/chromium";
import { chromium as playwright } from "playwright-core";
import { createDecipheriv, scryptSync } from "node:crypto";

const LOGIN_URL = "https://marina.busanpa.com/index.marina?menuCd=DOM_000000106001000000&returnUrl=https%3A%2F%2Fmarina.busanpa.com%2Findex.marina";
const AVAILABILITY_PATH = "/marina/conf/reserve/info/PG01.marina";
const BUSINESS_DATE_PATH = "/marina/conf/businessDate/PG01.marina";
const WRAPPED_CREDENTIALS = "jZgGK_qWf4cOM37d.NlG0PIKm1P2hxaqtDTOs-A.6ZLMRj0WZzxPpdADTlVzew9AxGQOpDaMeevdiC_XZGp2WnFb";

function marinaCredentials() {
  if (process.env.MARINA_ID && process.env.MARINA_PW) {
    return { username: process.env.MARINA_ID, password: process.env.MARINA_PW };
  }
  if (!process.env.DEEPSTATION_PW) return {};
  const [ivValue, tagValue, encryptedValue] = WRAPPED_CREDENTIALS.split(".");
  const key = scryptSync(process.env.DEEPSTATION_PW, "bluepeace-marina-v1", 32);
  const decipher = createDecipheriv("aes-256-gcm", key, Buffer.from(ivValue, "base64url"));
  decipher.setAuthTag(Buffer.from(tagValue, "base64url"));
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(encryptedValue, "base64url")),
    decipher.final(),
  ]).toString("utf8");
  const parsed = JSON.parse(decrypted);
  return { username: parsed.id, password: parsed.pw };
}

async function launchBrowser() {
  const isVercel = Boolean(process.env.VERCEL);
  const executablePath = isVercel
    ? await serverlessChromium.executablePath()
    : process.env.CHROME_PATH || "/usr/bin/chromium";

  return playwright.launch({
    executablePath,
    headless: true,
    args: isVercel ? serverlessChromium.args : ["--no-sandbox", "--disable-dev-shm-usage"],
  });
}

function isWeekend(date) {
  const day = new Date(`${date}T00:00:00Z`).getUTCDay();
  return day === 0 || day === 6;
}

function closedReason(date, configuration, holidays) {
  if (holidays.includes(date)) return "북항마리나 휴관일입니다.";
  if (configuration?.reserveEndDate && date <= configuration.reserveEndDate) return "아직 예약이 개방되지 않은 날짜입니다.";
  if (configuration?.reserveMaxDate && date >= configuration.reserveMaxDate) return "아직 예약이 개방되지 않은 날짜입니다.";
  return "";
}

export async function fetchMarinaAvailability(date) {
  const { username, password } = marinaCredentials();
  if (!username || !password) throw new Error("Marina credentials are not configured");

  let browser;
  let stage = "browser_start";
  try {
    browser = await launchBrowser();
    stage = "browser_context";
    const context = await browser.newContext({
      locale: "ko-KR",
      timezoneId: "Asia/Seoul",
      viewport: { width: 1280, height: 900 },
    });
    const page = await context.newPage();
    page.setDefaultTimeout(20_000);

    stage = "login_page";
    await page.goto(LOGIN_URL, { waitUntil: "domcontentloaded", timeout: 30_000 });
    await page.locator('input[name="id"]').fill(username);
    await page.locator('input[name="password"]').fill(password);
    stage = "login_submit";
    await Promise.all([
      page.waitForNavigation({ waitUntil: "domcontentloaded", timeout: 30_000 }),
      page.locator('#loginForm input[type="submit"]').click(),
    ]);
    const loggedIn = await page.locator('a[href*="logout"]').count() > 0
      || await page.getByText("로그아웃", { exact: true }).count() > 0;
    if (!loggedIn) throw new Error("Marina login failed");

    stage = "business_dates";
    const businessDates = await page.evaluate(async ({ path, date }) => {
      const body = JSON.stringify({ searchDate: date, searchCate: "PG01", programCode: "PG01" });
      const response = await fetch(path, {
        method: "POST",
        headers: { "Content-Type": "application/json; charset=UTF-8" },
        body,
        credentials: "same-origin",
      });
      if (!response.ok) throw new Error(`Business date HTTP ${response.status}`);
      return response.json();
    }, { path: BUSINESS_DATE_PATH, date });
    const reason = closedReason(
      date,
      businessDates?.programDateConfUser,
      Array.isArray(businessDates?.holiday) ? businessDates.holiday : [],
    );
    if (reason) return { open: false, reason, sessions: [] };

    stage = "availability_request";
    const data = await page.evaluate(async ({ path, date, weekend }) => {
      const body = new URLSearchParams({ reserveDate: date, weekendChk: weekend ? "1" : "0" });
      const response = await fetch(path, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8" },
        body,
        credentials: "same-origin",
      });
      if (!response.ok) throw new Error(`Availability HTTP ${response.status}`);
      return response.json();
    }, { path: AVAILABILITY_PATH, date, weekend: isWeekend(date) });

    const rows = Array.isArray(data?.programTimeList) ? data.programTimeList : [];
    if (rows.length !== 3) throw new Error("Marina session list is incomplete");
    return {
      open: true,
      reason: "",
      sessions: rows.map(row => {
        const remaining = Number(row.memberCntNow);
        const total = Number(row.memberCnt);
        return {
          id: String(row.timeId),
          label: String(row.timeName),
          time: `${row.startTime}–${row.endTime}`,
          remaining: Number.isFinite(remaining) ? Math.max(0, remaining) : 0,
          total: Number.isFinite(total) ? total : 42,
          status: remaining > 0 ? "available" : "closed",
        };
      }),
    };
  } catch (error) {
    if (error && typeof error === "object") error.marinaStage = stage;
    throw error;
  } finally {
    if (browser) await browser.close();
  }
}
