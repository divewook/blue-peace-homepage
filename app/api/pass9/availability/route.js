import { NextResponse } from "next/server";
import { hasAdminSession } from "../../../../lib/admin-session";
import { PASS9_BOOKING_URL, parsePass9Availability } from "../../../../lib/pass9-availability";

const NAVER_GRAPHQL_URL = "https://m.booking.naver.com/graphql";
const BUSINESS_ID = "1022931";
const BIZ_ITEM_ID = "5456880";
const BUSINESS_TYPE_ID = 12;

const scheduleQuery = `
  query hourlySchedule($scheduleParams: ScheduleParams) {
    schedule(input: $scheduleParams) {
      bizItemSchedule {
        hourly {
          unitStartDateTime
          unitStartTime
          unitBookingCount
          unitStock
          isBusinessDay
          isSaleDay
          isUnitSaleDay
          isUnitBusinessDay
        }
      }
    }
  }
`;

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

  try {
    const response = await fetch(NAVER_GRAPHQL_URL, {
      method: "POST",
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
      headers: {
        "content-type": "application/json",
        "origin": "https://m.booking.naver.com",
        "referer": PASS9_BOOKING_URL,
        "user-agent": "Mozilla/5.0 (compatible; BluePeace-Pass9-Availability/1.0)",
      },
      body: JSON.stringify({
        operationName: "hourlySchedule",
        variables: {
          scheduleParams: {
            businessId: BUSINESS_ID,
            bizItemId: BIZ_ITEM_ID,
            businessTypeId: BUSINESS_TYPE_ID,
            startDateTime: `${date}T00:00:00+09:00`,
            endDateTime: `${date}T00:00:00+09:00`,
          },
        },
        query: scheduleQuery,
      }),
    });
    if (!response.ok) throw new Error(`Naver booking returned ${response.status}`);
    const payload = await response.json();
    if (payload?.errors?.length) throw new Error("Naver booking GraphQL error");
    const hourly = payload?.data?.schedule?.bizItemSchedule?.hourly;

    return NextResponse.json({
      date,
      sessions: parsePass9Availability(hourly),
      checked_at: new Date().toISOString(),
      source_url: PASS9_BOOKING_URL,
    }, { headers: { "Cache-Control": "private, no-store, max-age=0" } });
  } catch (error) {
    console.error("Failed to load PASS9 availability", error);
    return NextResponse.json({ error: "패스나인 예약 현황을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요." }, { status: 502 });
  }
}
