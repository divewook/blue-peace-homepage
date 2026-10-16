import { NextResponse } from "next/server";
import { hasAdminSession } from "../../../../lib/admin-session";

const MARINA_BOOKING_URL = "https://marina.busanpa.com/marina/diving/agree/PG01.marina?menuCd=DOM_000000103001000000";

export const maxDuration = 60;

function koreaDate(offsetDays = 0) {
  const now = new Date(Date.now() + offsetDays * 86_400_000);
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul", year: "numeric", month: "2-digit", day: "2-digit",
  }).format(now);
}

function isAllowedDate(date) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return false;
  const parsed = new Date(`${date}T00:00:00Z`);
  const isRealDate = !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === date;
  return isRealDate && date >= koreaDate() && date <= koreaDate(90);
}

export async function GET(request) {
  if (!await hasAdminSession()) return NextResponse.json({ error: "관리자 로그인이 필요합니다." }, { status: 401 });

  const date = new URL(request.url).searchParams.get("date") || "";
  if (!isAllowedDate(date)) {
    return NextResponse.json({ error: "오늘부터 90일 이내의 날짜를 선택해 주세요." }, { status: 400 });
  }
  const hasCredentials = (process.env.MARINA_ID && process.env.MARINA_PW) || process.env.DEEPSTATION_PW;
  if (!hasCredentials) {
    console.error("Marina availability credentials are missing");
    return NextResponse.json({ error: "북항마리나 조회 설정이 완료되지 않았습니다." }, { status: 503 });
  }

  let operationStage = "scraper_import";
  try {
    const { fetchMarinaAvailability } = await import("../../../../lib/marina-scraper");
    operationStage = "scrape";
    const result = await fetchMarinaAvailability(date);
    return NextResponse.json({
      date,
      open: result.open,
      reason: result.reason,
      sessions: result.sessions,
      checked_at: new Date().toISOString(),
      source_url: MARINA_BOOKING_URL,
    }, { headers: { "Cache-Control": "private, no-store, max-age=0" } });
  } catch (error) {
    const stage = typeof error?.marinaStage === "string" ? error.marinaStage : operationStage;
    console.error("Failed to load Marina availability", { stage, message: error instanceof Error ? error.message : String(error) });
    return NextResponse.json(
      { error: "북항마리나 예약 현황을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.", code: stage },
      { status: 502 },
    );
  }
}
