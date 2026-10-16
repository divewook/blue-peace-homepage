export const DEEPSTATION_BOOKING_URL = "https://deepstation.kr/rez/step1.php";

export const deepstationSessions = [
  { id: "t1", label: "1부", time: "08:00–11:00", front: ["08:00", "09:30"], back: ["09:30", "11:00"] },
  { id: "t2", label: "2부", time: "11:00–14:00", front: ["11:00", "12:30"], back: ["12:30", "14:00"] },
  { id: "t3", label: "3부", time: "14:00–17:00", front: ["14:00", "15:30"], back: ["15:30", "17:00"] },
  { id: "t4", label: "4부", time: "17:00–20:00", front: ["17:00", "18:30"], back: ["18:30", "20:00"] },
  { id: "t5", label: "5부", time: "20:00–23:00", front: ["20:00", "21:30"], back: ["21:30", "23:00"] },
];

function partAvailability(slots, [start, end], sessionAvailable) {
  const slot = slots.find(item => item?.stime === start && item?.etime === end);
  return {
    time: `${start}–${end}`,
    available: sessionAvailable && Number(slot?.remain_buoys) > 0,
  };
}

export function parseDeepstationAvailability(dayInfo) {
  const buoySlots = Array.isArray(dayInfo?.remain_buoys) ? dayInfo.remain_buoys : [];
  const generalSlots = Array.isArray(dayInfo?.remain?.gen) ? dayInfo.remain.gen : [];
  const freeDivingAllowed = !Array.isArray(dayInfo?.only_types)
    || dayInfo.only_types.length === 0
    || dayInfo.only_types.includes("프리다이빙");
  const generalTicketAllowed = !Array.isArray(dayInfo?.except_tickets)
    || !dayInfo.except_tickets.includes("gen");

  return deepstationSessions.map(session => {
    const ticket = generalSlots.find(item => item?.stime === session.front[0] && item?.etime === session.back[1]);
    const sessionAvailable = freeDivingAllowed
      && generalTicketAllowed
      && Number(ticket?.remain) >= 2
      && ticket?.in_time !== 0;
    return {
      id: session.id,
      label: session.label,
      time: session.time,
      front: partAvailability(buoySlots, session.front, sessionAvailable),
      back: partAvailability(buoySlots, session.back, sessionAvailable),
    };
  });
}
