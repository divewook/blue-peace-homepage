import serverlessChromium from "@sparticuz/chromium";
import { chromium as playwright } from "playwright-core";

const LOGIN_URL = "https://paradive.co.kr/service/pc/index.php";
export const PARADIVE_BOOKING_URL = "https://paradive.co.kr/service/pc/page/reservation01.php";
const WEEKDAY_PRODUCT_ID = "10";
const WEEKEND_PRODUCT_ID = "190";

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

function parseSessions(html) {
  const pattern = /freservation_time_select\('([^']+)',\s*'([^']*)',\s*'([^']*)',\s*'([^']*)'/g;
  return [...html.matchAll(pattern)].map((match, index) => ({
    id: match[1],
    label: `${index + 1}부`,
    start: match[2],
    end: match[3],
    disabled: match[4] === "disabled",
  }));
}

export async function fetchParadiveAvailability(date) {
  const hasDedicatedCredentials = Boolean(process.env.PARADIVE_ID && process.env.PARADIVE_PW);
  const username = hasDedicatedCredentials ? process.env.PARADIVE_ID : process.env.DEEPSTATION_ID;
  const password = hasDedicatedCredentials ? process.env.PARADIVE_PW : process.env.DEEPSTATION_PW;
  if (!username || !password) throw new Error("Paradive credentials are not configured");

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
    const loginResult = await page.evaluate(async ({ username, password }) => {
      const body = new URLSearchParams({
        op: "login",
        mem_id: username,
        mem_pwd: password,
        save_id: "0",
        url: "",
      });
      const response = await fetch("/service/pc/ajax/ajax.login.send.php", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body,
        credentials: "same-origin",
      });
      if (!response.ok) throw new Error(`Login HTTP ${response.status}`);
      return response.json();
    }, { username, password });
    if (loginResult?.login_status !== "success") throw new Error("Paradive login failed");

    const weekend = isWeekend(date);
    const productId = weekend ? WEEKEND_PRODUCT_ID : WEEKDAY_PRODUCT_ID;
    const ticketType = weekend ? "weekend" : "weekday";

    stage = "reservation_product";
    const productReady = await page.evaluate(async ({ productId }) => {
      const body = new URLSearchParams({
        uf_idx: "1",
        uc_idx: "1",
        us_idx: productId,
        od_license: "Y",
      });
      const response = await fetch("/service/pc/page/reservation02.php", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body,
        credentials: "same-origin",
      });
      const html = await response.text();
      return response.ok && html.includes(`value="${productId}"`) && html.includes("od_exercise_bui_select");
    }, { productId });
    if (!productReady) throw new Error("Paradive reservation product unavailable");

    stage = "session_list";
    const timeHtml = await page.evaluate(async ({ date, productId }) => {
      const body = new URLSearchParams({
        uf_idx: "1",
        uc_idx: "1",
        us_idx: productId,
        od_date: date,
        us_time: "2",
      });
      const response = await fetch("/service/pc/ajax/ajax.reservation.time.list.php", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body,
        credentials: "same-origin",
      });
      if (!response.ok) throw new Error(`Time list HTTP ${response.status}`);
      return response.text();
    }, { date, productId });
    const sessionList = parseSessions(timeHtml);
    if (sessionList.length !== 5) throw new Error("Paradive session list is incomplete");

    stage = "buoy_status";
    const buoyStates = await page.evaluate(async ({ date, sessionIds }) => {
      const check = async (step, buoy) => {
        const body = new URLSearchParams({
          op: "select",
          od_date: date,
          od_step: step,
          od_exercise_select: "2",
          od_exercise_bui_select: buoy,
        });
        const response = await fetch("/service/pc/ajax/ajax.reservation.bui.select.php", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body,
          credentials: "same-origin",
        });
        if (!response.ok) throw new Error(`Buoy status HTTP ${response.status}`);
        return response.json();
      };

      return Promise.all(sessionIds.map(async id => {
        const [front, back] = await Promise.all([check(id, "1"), check(id, "2")]);
        return { id, front, back };
      }));
    }, { date, sessionIds: sessionList.filter(session => !session.disabled).map(session => session.id) });
    const stateById = new Map(buoyStates.map(state => [state.id, state]));

    return {
      ticketType,
      sessions: sessionList.map(session => {
        const state = stateById.get(session.id);
        return {
          id: session.id,
          label: session.label,
          time: `${session.start}–${session.end}`,
          front: { available: !session.disabled && state?.front?.status === "success" },
          back: { available: !session.disabled && state?.back?.status === "success" },
        };
      }),
    };
  } catch (error) {
    if (error && typeof error === "object") error.paradiveStage = stage;
    throw error;
  } finally {
    if (browser) await browser.close();
  }
}
