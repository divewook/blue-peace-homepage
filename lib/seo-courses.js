// Public course explanations use only the existing catalog and confirmed
// operating scope. Prices and eligibility are intentionally not inferred here.
export const publicCoursePages = [
  {
    slug: 'freediving', catalogId: 'freediving', inquiryCourse: 'freediving',
    name: '프리다이빙', title: '대구·경북 프리다이빙 교육 | 블루피스',
    description: '대구·구미·칠곡·경산에서 프리다이빙 체험과 단계별 교육을 상담하세요. 호흡, 이퀄라이징, 수면·수중 동작을 목표에 맞춰 배웁니다.',
    intro: '물속을 처음 경험하는 체험부터 단계별 자격 과정까지, 현재 경험과 목표를 확인하고 알맞은 교육을 상담합니다.',
    audience: '프리다이빙을 처음 체험하려는 분과 기존 경험을 바탕으로 다음 단계를 찾는 분',
    learn: ['호흡과 물 적응', '이퀄라이징과 수면·수중 동작', '선택한 단계의 교육 및 평가 기준 확인'],
    levelIds: ['trial', 'level1', 'level2', 'package12', 'level3', 'level4', 'package34', 'instructor'],
  },
  {
    slug: 'scuba', catalogId: 'scuba', inquiryCourse: 'scuba',
    name: '스쿠버다이빙', title: '대구·경북 스쿠버다이빙 교육 | 블루피스',
    description: '대구·구미·칠곡·경산에서 스쿠버다이빙 체험과 오픈워터 등 단계별 교육을 상담하세요. 장비 사용과 수중 적응부터 안내합니다.',
    intro: '장비를 사용하는 수중 활동을 처음 경험하거나 다음 자격 단계를 알아보려는 분께 과정 차이를 설명합니다.',
    audience: '스쿠버다이빙 체험, 장비 사용과 수중 적응, 단계별 교육을 원하는 분',
    learn: ['장비 사용과 수중 적응', '체험과 자격 과정의 차이', '오픈워터와 이후 단계의 참여 조건 확인'],
    levelIds: ['trial', 'openwater', 'adventure', 'advanced', 'package'],
  },
  {
    slug: 'mermaid', catalogId: 'mermaid', inquiryCourse: 'mermaid',
    name: '머메이드', title: '대구·경북 머메이드 교육 | 블루피스',
    description: '대구·경북권 머메이드 체험과 단계별 교육을 안내합니다. 모노핀 움직임과 수중 표현을 경험과 목표에 맞춰 상담하세요.',
    intro: '처음 머메이드를 접하는 분부터 다음 단계를 알아보는 분까지, 경험에 맞는 수중 움직임 교육을 안내합니다.',
    audience: '모노핀 움직임과 수중 표현을 경험하거나 단계별 과정을 알아보려는 분',
    learn: ['모노핀 움직임', '수중 표현', '체험·베이직·머메이드·오션 과정의 차이 확인'],
    levelIds: ['trial', 'level1', 'level2', 'level3', 'package12', 'package23', 'instructor'],
  },
  {
    slug: 'youth', catalogId: 'youth', inquiryCourse: 'youth',
    name: '유스 프리다이빙', title: '대구·경북 유스 프리다이빙 교육 | 블루피스',
    description: '대구·경북권 유스 프리다이빙을 상담하세요. 수강생의 연령과 인원, 물 적응 정도를 확인해 적합한 단계를 안내합니다.',
    intro: '아이의 연령과 인원, 물 적응 정도를 먼저 확인하고 체험 또는 단계별 교육을 상담합니다.',
    audience: '자녀의 수중 교육을 알아보는 보호자와 청소년 수강생',
    learn: ['연령·인원에 맞는 교육 조건 확인', '물 적응 수준에 따른 과정 상담', '체험과 돌핀·오르카·샤크 단계 안내'],
    levelIds: ['trial', 'level1', 'level2', 'level3', 'package12', 'package23', 'instructor'],
  },
  {
    slug: 'safety', catalogId: 'safety', inquiryCourse: 'safety',
    name: '수중레저안전요원', title: '수중레저안전요원·해루질 관련 교육 | 블루피스',
    description: '야간 해루질 등 수중 활동과 관련한 수중레저안전요원 교육을 안내합니다. 참여 조건과 과정별 자격 범위를 상담에서 확인하세요.',
    intro: '수중 활동의 안전 역량과 관련 자격 과정을 알아보는 분께 교육 범위와 참여 조건을 상담합니다.',
    audience: '야간 해루질 관련 교육이나 수중레저안전요원 과정을 찾는 분',
    learn: ['안전요원 과정의 교육 범위', '마스터 및 강사 과정의 구분', '사전 자격과 평가 기준 확인'],
    levelIds: ['safety', 'master', 'instructor'],
  },
  {
    slug: 'underwater-photography', catalogId: 'special', inquiryCourse: 'special', inquiryLevel: 'photo',
    name: '언더워터 포토그래퍼', title: '수중 사진 촬영 교육 | 블루피스',
    description: '블루피스의 수중 사진 촬영 교육을 안내합니다. 기존 수중 활동 경험과 촬영 목표를 확인하고 촬영 테크닉 레슨을 상담하세요.',
    intro: '수중 촬영에 관심 있는 분의 경험과 촬영 목표를 확인하고 적합한 레슨 내용을 상담합니다.',
    audience: '수중 사진 촬영과 촬영 테크닉을 배우려는 분',
    learn: ['현재 수중 활동 경험 확인', '촬영 목표와 필요한 레슨 범위 상담', '교육 장소와 준비 사항 확인'],
    levelIds: ['photo'],
  },
  {
    slug: 'cpr', catalogId: 'special', inquiryCourse: 'special', inquiryLevel: 'cpr',
    name: '응급처치·CPR', title: '응급처치·CPR 및 강사과정 | 블루피스',
    description: '응급처치·CPR 교육과 강사과정을 안내합니다. 교육 목적, 참여 조건, 자격 발급 기준은 선택한 과정에 따라 상담에서 확인하세요.',
    intro: '응급처치와 CPR 교육이 필요한 분, 강사과정을 알아보는 분께 각 과정의 범위를 구분해 안내합니다.',
    audience: '응급처치·CPR 교육 또는 관련 강사과정을 알아보려는 분',
    learn: ['응급처치·CPR 교육의 범위', '일반 교육과 강사과정의 차이', '선택 과정의 참여·발급 조건 확인'],
    levelIds: ['cpr', 'instructor'],
  },
];

export function getPublicCoursePage(slug) {
  return publicCoursePages.find(page => page.slug === slug) || null;
}

export const courseDetailLinks = {
  freediving: [{ slug: 'freediving', label: '프리다이빙 자세히 보기' }],
  scuba: [{ slug: 'scuba', label: '스쿠버다이빙 자세히 보기' }],
  mermaid: [{ slug: 'mermaid', label: '머메이드 자세히 보기' }],
  youth: [{ slug: 'youth', label: '유스 프리다이빙 자세히 보기' }],
  safety: [{ slug: 'safety', label: '수중레저안전요원 자세히 보기' }],
  special: [
    { slug: 'underwater-photography', label: '수중 사진 촬영 자세히 보기' },
    { slug: 'cpr', label: '응급처치·CPR 자세히 보기' },
  ],
};
