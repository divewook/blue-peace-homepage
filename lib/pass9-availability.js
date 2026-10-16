export const PASS9_BOOKING_URL = "https://m.booking.naver.com/booking/12/bizes/1022931/items/5456880";

export const pass9Sessions = [
  { id: "t1", label: "1부", time: "09:00" },
  { id: "t2", label: "2부", time: "12:30" },
  { id: "t3", label: "3부", time: "16:00" },
  { id: "t4", label: "4부", time: "19:30" },
];

function slotTime(slot) {
  if (typeof slot?.unitStartTime === "string") {
    const match = slot.unitStartTime.match(/\b(\d{2}:\d{2}):\d{2}$/);
    if (match) return match[1];
  }
  if (typeof slot?.unitStartDateTime === "string") {
    const date = new Date(slot.unitStartDateTime);
    if (!Number.isNaN(date.getTime())) {
      return new Intl.DateTimeFormat("en-GB", {
        timeZone: "Asia/Seoul", hour: "2-digit", minute: "2-digit", hourCycle: "h23",
      }).format(date);
    }
  }
  return "";
}

export function parsePass9Availability(hourly) {
  const slots = Array.isArray(hourly) ? hourly : [];
  return pass9Sessions.map(session => {
    const source = slots.find(slot => slotTime(slot) === session.time);
    if (!source) return { ...session, status: "closed", remaining: null };

    const capacity = Number(source.unitStock);
    const booked = Number(source.unitBookingCount);
    const remaining = Number.isFinite(capacity) && Number.isFinite(booked)
      ? Math.max(0, Math.min(20, capacity - booked))
      : 0;
    const selectable = source.isBusinessDay !== false
      && source.isSaleDay !== false
      && source.isUnitBusinessDay !== false
      && source.isUnitSaleDay !== false
      && remaining > 0;

    return {
      ...session,
      status: selectable ? "available" : "closed",
      remaining: selectable ? remaining : null,
    };
  });
}
