export const bookingDays = [
  { id: "mon", label: "월요일", shortLabel: "월", kind: "weekday" },
  { id: "tue", label: "화요일", shortLabel: "화", kind: "weekday" },
  { id: "wed", label: "수요일", shortLabel: "수", kind: "weekday" },
  { id: "thu", label: "목요일", shortLabel: "목", kind: "weekday" },
  { id: "fri", label: "금요일", shortLabel: "금", kind: "weekday" },
  { id: "sat", label: "토요일", shortLabel: "토", kind: "weekend" },
  { id: "sun", label: "일요일", shortLabel: "일", kind: "weekend" },
  { id: "holiday", label: "공휴일", shortLabel: "공휴일", kind: "holiday" },
];

const everyDay = bookingDays.map(day => day.id);
const weekendDays = ["sat", "sun"];

export const bookingPools = {
  passnine: {
    id: "passnine",
    name: "칠곡 패스나인 풀장",
    storedName: "칠곡 패스나인",
    active: true,
    notice: "회차별 실제 잔여석과 운영 여부는 상담 후 확정됩니다.",
    slots: [
      { id: "t1", label: "1부", time: "09:00~11:30", allowedDays: everyDay },
      { id: "t2", label: "2부", time: "12:30~15:00", allowedDays: everyDay },
      { id: "t3", label: "3부", time: "16:00~18:30", allowedDays: everyDay },
      { id: "t4", label: "4부", time: "19:30~22:00", allowedDays: everyDay },
    ],
  },
  miryang: {
    id: "miryang",
    name: "밀양 아리랑 풀장",
    storedName: "밀양 아리랑",
    active: true,
    notice: "오전부는 토요일과 일요일만 선택할 수 있습니다. 공휴일 운영은 상담 때 확인합니다.",
    slots: [
      { id: "t0", label: "오전부", time: "08:00~10:00", allowedDays: weekendDays, restriction: "토·일 전용" },
      { id: "t1", label: "1부", time: "10:00~12:00", allowedDays: everyDay },
      { id: "t2", label: "2부", time: "12:00~14:00", allowedDays: everyDay },
      { id: "t3", label: "3부", time: "14:00~16:00", allowedDays: everyDay },
      { id: "t4", label: "4부", time: "16:00~18:00", allowedDays: everyDay },
      { id: "t5", label: "5부", time: "18:00~20:00", allowedDays: everyDay },
      { id: "t6", label: "6부", time: "20:00~22:00", allowedDays: everyDay },
    ],
  },
  duryu: {
    id: "duryu",
    name: "대구 두류풀장",
    storedName: "대구 두류풀장",
    active: false,
    notice: "기존 운영 안내 기준 내부 공사로 현재 선택할 수 없습니다. 최신 이용 상태는 운영자 확인이 필요합니다.",
    slots: [],
  },
};

export const courseCatalog = [
  {
    id: "freediving", name: "프리다이빙", association: "AIDA / PSA", startingPrice: "체험 5만원부터",
    audience: "처음 물에 적응하려는 분부터 단계별 자격 취득을 원하는 분",
    summary: "호흡, 이퀄라이징, 수면과 수중 동작을 목표에 맞춰 배웁니다.",
    prerequisite: "과정별 사전 자격과 평가 기준은 상담 시 확인",
    duration: "체험 과정 약 3시간 · 자격 과정 횟수는 확인 필요",
    levels: [
      { id: "trial", name: "체험 과정", price: "5만원", issuance: "자격 발급 과정 아님" },
      { id: "level1", name: "1레벨 (프리다이버)", price: "15만원", issuance: "교육비·발급비 포함" },
      { id: "level2", name: "2레벨 (오픈워터)", price: "35만원", issuance: "교육비·발급비 포함" },
      { id: "level3", name: "3레벨 (어드밴스드)", price: "55만원", issuance: "교육비·발급비 포함" },
      { id: "level4", name: "4레벨 (마스터)", price: "85만원", issuance: "교육비·발급비 포함" },
      { id: "package12", name: "1+2레벨 패키지", price: "40만원", issuance: "교육비·발급비 포함" },
      { id: "package34", name: "3+4레벨 패키지", price: "130만원", issuance: "교육비·발급비 포함" },
      { id: "instructor", name: "강사 과정", price: "별도 상담", issuance: "발급 조건 확인 필요" },
    ],
  },
  {
    id: "youth", name: "유스 프리다이빙", association: "PSA", startingPrice: "체험 10만원부터",
    audience: "연령과 인원에 맞춘 상담이 필요한 청소년 수강생",
    summary: "수강생의 연령과 물 적응 정도를 먼저 확인해 적합한 단계를 안내합니다.",
    prerequisite: "과정별 확정 연령 기준은 운영자 확인 필요",
    duration: "과정별 시간과 횟수는 상담 시 확인",
    levels: [
      { id: "trial", name: "체험 과정", price: "10만원", issuance: "자격 발급 과정 아님" },
      { id: "level1", name: "1레벨 (돌핀)", price: "35만원", issuance: "교육비·발급비 포함" },
      { id: "level2", name: "2레벨 (오르카)", price: "45만원", issuance: "교육비·발급비 포함" },
      { id: "level3", name: "3레벨 (샤크)", price: "55만원", issuance: "교육비·발급비 포함" },
      { id: "package12", name: "돌핀+오르카 패키지", price: "70만원", issuance: "교육비·발급비 포함" },
      { id: "package23", name: "오르카+샤크 패키지", price: "90만원", issuance: "교육비·발급비 포함" },
      { id: "instructor", name: "유스 강사 과정", price: "별도 상담", issuance: "발급 조건 확인 필요" },
    ],
  },
  {
    id: "safety", name: "수중레저안전요원", association: "PSA", startingPrice: "35만원부터",
    audience: "수중 활동 안전 역량과 관련 자격 과정을 확인하려는 분",
    summary: "안전 활동에 필요한 과정과 자격 범위를 상담합니다.",
    prerequisite: "사전 자격과 평가 기준은 상담 시 확인",
    duration: "과정별 시간과 횟수는 상담 시 확인",
    levels: [
      { id: "safety", name: "수중레저안전요원", price: "35만원", issuance: "교육비·발급비 포함" },
      { id: "master", name: "마스터 안전요원", price: "55만원", issuance: "교육비·발급비 포함" },
      { id: "instructor", name: "안전요원 강사 과정", price: "별도 상담", issuance: "발급 조건 확인 필요" },
    ],
  },
  {
    id: "mermaid", name: "머메이드 다이빙", association: "PSA", startingPrice: "체험 10만원부터",
    audience: "기초 움직임부터 수중 표현을 단계적으로 배우려는 분",
    summary: "모노핀 움직임과 수중 표현을 경험과 목표에 맞춰 배웁니다.",
    prerequisite: "과정별 사전 자격과 평가 기준은 상담 시 확인",
    duration: "과정별 시간과 횟수는 상담 시 확인",
    levels: [
      { id: "trial", name: "체험 과정", price: "10만원", issuance: "자격 발급 과정 아님" },
      { id: "level1", name: "1레벨 (베이직 머메이드)", price: "35만원", issuance: "교육비·발급비 포함" },
      { id: "level2", name: "2레벨 (머메이드)", price: "45만원", issuance: "교육비·발급비 포함" },
      { id: "level3", name: "3레벨 (오션 머메이드)", price: "55만원", issuance: "교육비·발급비 포함" },
      { id: "package12", name: "베이직+머메이드 패키지", price: "70만원", issuance: "교육비·발급비 포함" },
      { id: "package23", name: "머메이드+오션 패키지", price: "90만원", issuance: "교육비·발급비 포함" },
      { id: "instructor", name: "머메이드 강사 과정", price: "별도 상담", issuance: "발급 조건 확인 필요" },
    ],
  },
  {
    id: "scuba", name: "스쿠버다이빙", association: "PSAI", startingPrice: "체험 10만원부터",
    audience: "장비를 사용한 수중 활동을 체험하거나 자격 취득을 원하는 분",
    summary: "장비 사용, 수중 적응과 자격 단계별 내용을 상담합니다.",
    prerequisite: "과정별 사전 자격과 평가 기준은 상담 시 확인",
    duration: "과정별 시간과 횟수는 상담 시 확인",
    levels: [
      { id: "trial", name: "체험 과정", price: "10만원", issuance: "자격 발급 과정 아님" },
      { id: "openwater", name: "오픈워터", price: "50만원", issuance: "교육비·발급비 포함" },
      { id: "adventure", name: "어드벤처", price: "50만원", issuance: "교육비·발급비 포함" },
      { id: "advanced", name: "어드밴스드", price: "60만원", issuance: "교육비·발급비 포함" },
      { id: "package", name: "오픈워터+어드밴스드 패키지", price: "100만원", issuance: "교육비·발급비 포함" },
    ],
  },
  {
    id: "special", name: "스페셜 교육", association: "PSA / 과정별 안내", startingPrice: "15만원부터",
    audience: "응급처치·CPR 또는 수중 사진 촬영 교육이 필요한 분",
    summary: "필요한 교육의 내용과 참여 조건을 확인하고 과정별 상담을 진행합니다.",
    prerequisite: "세부 과정별 참여 조건은 상담 시 확인",
    duration: "과정별 시간과 횟수는 상담 시 확인",
    levels: [
      { id: "cpr", name: "응급처치 및 CPR 교육", price: "15만원", issuance: "국제 자격 발급비 포함" },
      { id: "photo", name: "수중 사진 촬영 교육", price: "15만원", issuance: "촬영 테크닉 레슨" },
      { id: "instructor", name: "응급처치 CPR 강사 과정", price: "별도 상담", issuance: "발급 조건 확인 필요" },
    ],
  },
];

export function getCourse(courseId) {
  return courseCatalog.find(course => course.id === courseId) || null;
}

export function getPool(poolId) {
  return bookingPools[poolId] || null;
}

export function getDay(dayId) {
  return bookingDays.find(day => day.id === dayId) || null;
}

export function getAvailableSlots(poolId, dayId) {
  const pool = getPool(poolId);
  if (!pool?.active || !getDay(dayId)) return [];
  return pool.slots.filter(slot => slot.allowedDays.includes(dayId));
}

// Null means the instructor has not converted the legacy day × time settings yet.
export function getInstructorSchedule(instructor) {
  if (instructor?.schedule_by_day !== null && instructor?.schedule_by_day !== undefined) {
    return instructor.schedule_by_day;
  }
  return Object.fromEntries(["passnine", "miryang"].map(poolId => [
    poolId,
    Object.fromEntries(bookingDays.filter(day => instructor?.[`can_${poolId}`] === true && instructor?.[`${poolId}_day_${day.id}`] === true)
      .map(day => [day.id, getAvailableSlots(poolId, day.id)
        .filter(slot => instructor?.[`${poolId}_${slot.id}`] === true).map(slot => slot.id)])),
  ]));
}

export function validateInstructorSchedule(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return { valid: false, error: "요일별 시간표를 확인해 주세요." };
  const normalized = {};
  for (const [poolId, days] of Object.entries(value)) {
    const pool = getPool(poolId);
    if (!pool?.active || !days || typeof days !== "object" || Array.isArray(days)) return { valid: false, error: "이용할 수 없는 풀장이 포함되어 있습니다." };
    normalized[poolId] = {};
    for (const [dayId, slots] of Object.entries(days)) {
      const day = getDay(dayId);
      if (!day || !Array.isArray(slots) || slots.length > pool.slots.length || slots.some(slot => typeof slot !== "string")) {
        return { valid: false, error: `${pool.name}의 요일별 시간을 확인해 주세요.` };
      }
      const allowed = getAvailableSlots(poolId, dayId).map(slot => slot.id);
      if (new Set(slots).size !== slots.length || slots.some(slot => !allowed.includes(slot))) {
        return { valid: false, error: `${pool.name} ${day.label}에 운영하지 않는 회차가 포함되어 있습니다.` };
      }
      if (slots.length) normalized[poolId][dayId] = slots;
    }
  }
  if (!Object.values(normalized).some(days => Object.values(days).some(slots => slots.length))) {
    return { valid: false, error: "한 풀장, 한 요일 이상에 수업 가능 시간을 선택해 주세요." };
  }
  return { valid: true, schedule: normalized };
}

export function findMatchingAlternative(instructor, alternatives) {
  const schedule = getInstructorSchedule(instructor);
  return (alternatives || []).find(option => {
    if (instructor?.schedule_by_day == null && instructor?.[`can_${option.poolId}`] !== true) return false;
    if (!getAvailableSlots(option.poolId, option.dayId).some(slot => slot.id === option.slotId)) return false;
    return Array.isArray(schedule?.[option.poolId]?.[option.dayId])
      && schedule[option.poolId][option.dayId].includes(option.slotId);
  }) || null;
}

export function scheduleLabel(option) {
  const pool = getPool(option.poolId);
  const day = getDay(option.dayId);
  const slot = pool?.slots.find(item => item.id === option.slotId);
  return pool && day && slot ? `${pool.name} / ${day.label} / ${slot.label} ${slot.time}` : "미완성 일정";
}

export function validateScheduleAlternatives(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return { valid: false, errors: ["일정 정보를 확인해 주세요."], alternatives: [] };
  }
  if (value.mode === "flexible") {
    return { valid: true, errors: [], alternatives: [], mode: "flexible" };
  }
  if (value.mode !== "exact" || !Array.isArray(value.alternatives) || value.alternatives.length < 1 || value.alternatives.length > 8) {
    return { valid: false, errors: ["가능한 일정을 1개 이상 8개 이하로 선택해 주세요."], alternatives: [] };
  }
  const errors = [];
  const normalized = [];
  const seen = new Set();
  value.alternatives.forEach((option, index) => {
    const pool = getPool(option?.poolId);
    const day = getDay(option?.dayId);
    const slot = pool?.slots.find(item => item.id === option?.slotId);
    const prefix = `${index + 1}번째 일정`;
    if (!pool || !day || !slot) {
      errors.push(`${prefix}의 풀장·요일·시간을 모두 선택해 주세요.`);
      return;
    }
    if (!pool.active) {
      errors.push(`${pool.name}은 현재 신청할 수 없습니다.`);
      return;
    }
    if (!slot.allowedDays.includes(day.id)) {
      errors.push(`${pool.name} ${slot.label}(${slot.time})은 ${day.label}에 선택할 수 없습니다.`);
      return;
    }
    const key = `${pool.id}:${day.id}:${slot.id}`;
    if (seen.has(key)) {
      errors.push(`${prefix} 일정이 앞의 일정과 중복됩니다.`);
      return;
    }
    seen.add(key);
    normalized.push({ poolId: pool.id, dayId: day.id, slotId: slot.id });
  });
  return { valid: errors.length === 0, errors, alternatives: normalized, mode: "exact" };
}
