// Interest-based education guidance only; these are not eligibility decisions.
export const startingGoals = [
  { id: "try", label: "수중 활동을 한번 체험해 보고 싶어요", description: "체험 과정으로 물속 활동의 차이를 살펴보세요.", courseIds: ["freediving", "scuba", "mermaid"] },
  { id: "ocean", label: "바닷속을 탐험하고 싶어요", description: "호흡 방식과 장비 사용이 다른 두 교육을 비교해 보세요. 실제 해양 교육 조건은 상담에서 확인합니다.", courseIds: ["freediving", "scuba"] },
  { id: "certificate", label: "자격증을 취득하고 싶어요", description: "관심 분야에 맞는 자격 과정을 살펴보세요. 발급은 각 과정의 평가 기준을 충족해야 합니다.", courseIds: ["freediving", "scuba", "mermaid", "safety"] },
  { id: "youth", label: "우리 아이에게 다이빙을 가르쳐주고 싶어요", description: "연령과 인원을 먼저 확인하는 유스 과정을 살펴보세요.", courseIds: ["youth"] },
  { id: "special", label: "해루질이나 수중 촬영에 관심 있어요", description: "수중레저안전요원과 수중 사진 촬영 교육의 내용을 비교해 보세요.", courseIds: ["safety", "special"] },
  { id: "unsure", label: "아직 어떤 교육이 맞는지 모르겠어요", description: "교육 목표를 상담에서 함께 정할 수 있습니다. 과정을 미리 결정할 필요가 없습니다.", courseIds: [] },
];

export const educationCards = [
  { id: "freediving", courseId: "freediving", title: "프리다이빙", image: "/DSC04128-Enhanced-NR.jpg", imageAlt: "블루피스 수중 촬영 사진, 물속에서 움직이는 다이버", tag: "호흡과 수중 움직임" },
  { id: "scuba", courseId: "scuba", title: "스쿠버다이빙", image: "/bluepeace-hero-scuba.webp", imageAlt: "블루피스 수중 촬영 사진, 장비를 착용한 다이버", tag: "장비와 함께하는 수중 활동" },
  { id: "mermaid", courseId: "mermaid", title: "머메이드", image: "/DSC05155-Enhanced-NR.jpg", imageAlt: "블루피스에서 촬영한 수중 사진", tag: "수중 표현과 움직임" },
  { id: "youth", courseId: "youth", title: "유스 프리다이빙", image: "/DSC04183-Enhanced-NR.jpg", imageAlt: "블루피스 수중 촬영 사진, 물속에서 함께 움직이는 사람들", tag: "어린이·청소년 교육 상담" },
  { id: "safety", courseId: "safety", title: "수중레저안전요원", image: "/DSC02294.jpg", imageAlt: "블루피스에서 촬영한 수중 교육 장소", tag: "해루질 관련 교육 상담" },
  { id: "photo", courseId: "special", title: "언더워터 포토그래퍼", image: "/DSC03811-Enhanced-NR.jpg", imageAlt: "블루피스에서 촬영한 수중 인물 사진", tag: "수중 사진 촬영 교육", description: "물속에서 사진을 찍는 방법과 촬영 테크닉을 배우는 교육입니다.", audience: "수중 사진 촬영에 관심 있는 분", levelIds: ["photo"] },
  { id: "cpr", courseId: "special", title: "응급처치·CPR 및 강사과정", image: "/DSC01925-Enhanced-NR.jpg", imageAlt: "블루피스에서 촬영한 수중 활동 사진", tag: "응급처치와 교육 지도", description: "응급처치·CPR 교육과 강사과정의 내용과 참여 조건을 확인해 보세요.", audience: "응급처치 교육이나 해당 강사과정에 관심 있는 분", levelIds: ["cpr", "instructor"] },
];

export function goalById(id) { return startingGoals.find(goal => goal.id === id) || null; }
