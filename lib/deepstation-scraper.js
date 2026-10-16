import serverlessChromium from "@sparticuz/chromium";
import { chromium as playwright } from "playwright-core";
import { parseDeepstationAvailability } from "./deepstation-availability";

const LOGIN_URL = "https://deepstation.kr/bbs/login.php";
const STEP_ONE_URL = "https://deepstation.kr/rez/step1.php";

async function launchBrowser() {
  const isVercel = Boolean(process.env.VERCEL);
  const executablePath = isVercel
    ? await serverlessChromium.executablePath()
    : process.env.CHROME_PATH || "/usr/bin/chromium";

  return playwright.launch({
    executablePath,
    headless: true,
    args: isVercel
      ? serverlessChromium.args
      : ["--no-sandbox", "--disable-dev-shm-usage"],
  });
}

async function waitForBotGuard(page) {
  if (!page.url().includes("/bg/check.php")) return;
  await page.waitForURL(url => !url.toString().includes("/bg/check.php"), { timeout: 30_000 });
  await page.waitForLoadState("domcontentloaded");
}

export async function fetchDeepstationAvailability(date) {
  const username = process.env.DEEPSTATION_ID;
  const password = process.env.DEEPSTATION_PW;
  if (!username || !password) throw new Error("Deepstation credentials are not configured");

  const browser = await launchBrowser();
  try {
    const context = await browser.newContext({
      locale: "ko-KR",
      timezoneId: "Asia/Seoul",
      viewport: { width: 1280, height: 900 },
    });
    const page = await context.newPage();
    page.setDefaultTimeout(20_000);
    page.on("dialog", dialog => dialog.dismiss().catch(() => {}));

    await page.goto(LOGIN_URL, { waitUntil: "domcontentloaded", timeout: 30_000 });
    await page.locator("#login_id").fill(username);
    await page.locator("#login_pw").fill(password);
    await page.locator('input[type="submit"]').click();
    await page.waitForURL(url => !url.pathname.includes("login.php") && !url.pathname.includes("login_check.php"), {
      timeout: 30_000,
    });
    await waitForBotGuard(page);
    await page.locator('a[href*="logout.php"]').first().waitFor({ state: "attached", timeout: 10_000 })
      .catch(() => { throw new Error("Deepstation login failed"); });

    await page.goto(STEP_ONE_URL, { waitUntil: "domcontentloaded", timeout: 30_000 });
    await waitForBotGuard(page);
    if (await page.locator("#chk1").count() === 0) throw new Error("Deepstation agreement page unavailable");

    await page.locator("#chk1").check();
    await page.locator("#btn_ok").click();
    await page.waitForURL(url => url.pathname.includes("/rez/step2.php"), { timeout: 20_000 });
    await page.waitForLoadState("domcontentloaded");
    if (!page.url().includes("/rez/step2.php")) throw new Error("Deepstation reservation page unavailable");
    await page.locator('[name="rtype"]').first().waitFor({ state: "attached", timeout: 10_000 });

    await page.evaluate(() => {
      const setValue = (selector, value) => {
        const element = document.querySelector(selector);
        if (!element) throw new Error(`Missing reservation field: ${selector}`);
        element.value = value;
      };
      const freeDiving = document.querySelector('[name="rtype"][value="프리다이빙"]');
      const generalTicket = document.querySelector('[name="ticket_type"][value="gen"]');
      if (!freeDiving || !generalTicket) throw new Error("Missing Deepstation reservation options");
      freeDiving.checked = true;
      generalTicket.checked = true;
      setValue('[name="arrival_time"]', "0");
      setValue('[name="users_m"]', "2");
      setValue('[name="users_f"]', "0");
      setValue('[name="buoy_use"]', "1");
    });
    const dayInfo = await page.evaluate(selectedDate => new Promise((resolve, reject) => {
      const timeout = window.setTimeout(() => reject(new Error("Deepstation availability timed out")), 15_000);
      window.$.getJSON("/rez/ajax.dayinfo.php", {
        date: selectedDate,
        rez_id: "",
        rtype: "프리다이빙",
      }).done(result => {
        window.clearTimeout(timeout);
        resolve(result);
      }).fail((_xhr, status, error) => {
        window.clearTimeout(timeout);
        reject(new Error(error || status));
      });
    }), date);

    if (dayInfo?.code !== 1) throw new Error("Deepstation returned an unavailable date");
    return parseDeepstationAvailability(dayInfo);
  } finally {
    await browser.close();
  }
}
