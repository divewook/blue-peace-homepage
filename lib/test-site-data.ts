export type TestCourse = {
  id: string;
  name: string;
  shortName: string;
  association: string;
  intro: string;
  image: string;
  headlinePrice: string;
  duration: string;
  sessions: string;
  levels: Array<{ name: string; price: string }>;
};

export const testCourses: TestCourse[] = [
  {
    id: 'freediving', name: '프리다이빙', shortName: '프리다이빙', association: 'AIDA / PSA',
    intro: '물 적응부터 호흡, 이퀄라이징, 수심 적응까지 목표에 맞춰 단계적으로 상담합니다.',
    image: '/DSC02297.jpg', headlinePrice: '체험 5만원부터', duration: '체험 과정 약 3시간', sessions: '자격 과정 횟수는 상담 시 안내',
    levels: [
      { name: '체험 과정', price: '5만원 · 풀장 입장료/장비 별도' },
      { name: '1레벨 (프리다이버)', price: '15만원 · 교육비+발급비 포함' },
      { name: '2레벨 (오픈워터)', price: '35만원 · 교육비+발급비 포함' },
      { name: '3레벨 (어드밴스드)', price: '55만원 · 교육비+발급비 포함 / 무제한 트레이닝 안내' },
      { name: '4레벨 (마스터)', price: '85만원 · 교육비+발급비 포함 / 무제한 트레이닝 안내' },
      { name: '1+2레벨 패키지', price: '40만원 · 교육비+발급비 포함' },
      { name: '3+4레벨 패키지', price: '130만원 · 교육비+발급비 포함' },
      { name: '강사 과정', price: '별도 상담' },
    ],
  },
  {
    id: 'youth', name: '유스 프리다이빙', shortName: '유스', association: 'PSA',
    intro: '수강 인원과 연령을 먼저 확인하고 성장 단계에 맞는 과정과 일정을 상담합니다.',
    image: '/DSC04128-Enhanced-NR.jpg', headlinePrice: '체험 10만원부터', duration: '과정별 상담 시 안내', sessions: '과정별 상담 시 안내',
    levels: [
      { name: '체험 과정', price: '10만원 · 풀장 입장료/장비 별도' },
      { name: '1레벨 (돌핀)', price: '35만원 · 교육비+발급비 포함' },
      { name: '2레벨 (오르카)', price: '45만원 · 교육비+발급비 포함' },
      { name: '3레벨 (샤크)', price: '55만원 · 교육비+발급비 포함' },
      { name: '돌핀+오르카 패키지', price: '70만원 · 교육비+발급비 포함' },
      { name: '오르카+샤크 패키지', price: '90만원 · 교육비+발급비 포함' },
      { name: '유스 강사 과정', price: '별도 상담' },
    ],
  },
  {
    id: 'safety', name: '수중레저안전요원', shortName: '수중안전', association: 'PSA',
    intro: '수중 활동 안전 역량과 자격 과정에 필요한 세부 조건을 확인해 안내합니다.',
    image: '/DSC05353-Enhanced-NR.jpg', headlinePrice: '35만원부터', duration: '과정별 상담 시 안내', sessions: '과정별 상담 시 안내',
    levels: [
      { name: '수중레저안전요원', price: '35만원 · 교육비+발급비 포함' },
      { name: '마스터 안전요원', price: '55만원 · 교육비+발급비 포함' },
      { name: '안전요원 강사 과정', price: '별도 상담' },
    ],
  },
  {
    id: 'mermaid', name: '머메이드 다이빙', shortName: '머메이드', association: 'PSA',
    intro: '기초 움직임부터 수중 표현까지 단계와 경험에 맞춰 과정을 선택합니다.',
    image: '/DSC06986.jpg', headlinePrice: '체험 10만원부터', duration: '과정별 상담 시 안내', sessions: '과정별 상담 시 안내',
    levels: [
      { name: '체험 과정', price: '10만원 · 풀장 입장료/장비 별도' },
      { name: '1레벨 (베이직 머메이드)', price: '35만원 · 교육비+발급비 포함' },
      { name: '2레벨 (머메이드)', price: '45만원 · 교육비+발급비 포함' },
      { name: '3레벨 (오션 머메이드)', price: '55만원 · 교육비+발급비 포함' },
      { name: '베이직+머메이드 패키지', price: '70만원 · 교육비+발급비 포함' },
      { name: '머메이드+오션 패키지', price: '90만원 · 교육비+발급비 포함' },
      { name: '머메이드 강사 과정', price: '별도 상담' },
    ],
  },
  {
    id: 'scuba', name: '스쿠버다이빙', shortName: '스쿠버', association: 'PSAI',
    intro: '장비 사용과 수중 적응부터 자격 단계까지 목표와 경험에 맞춰 안내합니다.',
    image: '/DSC01783-Enhanced-NR.jpg', headlinePrice: '체험 10만원부터', duration: '과정별 상담 시 안내', sessions: '과정별 상담 시 안내',
    levels: [
      { name: '체험 과정', price: '10만원 · 풀장 입장료/장비 별도' },
      { name: '오픈워터', price: '50만원 · 교육비+발급비 포함' },
      { name: '어드벤처', price: '50만원 · 교육비+발급비 포함' },
      { name: '어드밴스드', price: '60만원 · 교육비+발급비 포함' },
      { name: '오픈워터+어드밴스드 패키지', price: '100만원 · 교육비+발급비 포함' },
    ],
  },
  {
    id: 'special', name: '스페셜 교육', shortName: '스페셜', association: 'PSA / 과정별 안내',
    intro: '응급처치·CPR과 수중 사진 촬영처럼 필요한 주제를 선택해 상담합니다.',
    image: '/DSC03811-Enhanced-NR.jpg', headlinePrice: '15만원부터', duration: '과정별 상담 시 안내', sessions: '과정별 상담 시 안내',
    levels: [
      { name: '응급처치 및 CPR 교육', price: '15만원 · 국제 자격 발급비 포함' },
      { name: '수중 사진 촬영 교육', price: '15만원 · 촬영 테크닉 레슨' },
      { name: '응급처치 CPR 강사 과정', price: '별도 상담' },
    ],
  },
];

export const testFaqs = [
  { question: '수영을 못하거나 물이 무서워도 상담할 수 있나요?', answer: '가능합니다. 기존 홈페이지 안내에 따라 물 적응부터 단계적으로 진행하며, 신청자의 경험과 목표를 상담할 때 먼저 확인합니다.' },
  { question: '준비물은 무엇인가요?', answer: '수영복 또는 래시가드, 수건, 개인 샤워도구가 기본 준비물입니다. 과정별 추가 준비물은 담당 강사와 일정 조율 시 확인합니다.' },
  { question: '교육 시간과 횟수는 어떻게 되나요?', answer: '기존 자료에서 확인되는 체험 과정은 약 3시간 기준입니다. 자격 과정의 정확한 횟수와 시간은 과정과 개인 진도에 따라 상담 시 안내합니다.' },
  { question: '추가 비용이 있나요?', answer: '기존 안내상 풀장 입장료와 장비 렌탈료는 별도입니다. 풀장과 대여 장비에 따라 달라질 수 있어 예약 확정 전에 총 예상 비용을 다시 안내합니다.' },
  { question: '자격은 어디에서 발급되나요?', answer: '현재 홈페이지 자료에는 프리다이빙 AIDA·PSA, 유스·머메이드·수중레저안전요원 PSA, 스쿠버 PSAI로 안내되어 있습니다. 선택 과정의 실제 발급 기관은 상담 시 최종 확인합니다.' },
  { question: '유스 과정의 연령 조건은 어떻게 되나요?', answer: '수강 인원과 연령을 신청서에 적으면 담당자가 과정 가능 여부를 확인합니다. 저장소에서 과정별 확정 연령 기준은 확인되지 않아 상담 전 단정해 안내하지 않습니다.' },
  { question: '일정 변경이나 취소는 어떻게 하나요?', answer: '저장소에서 확정된 취소·변경 기준을 확인하지 못했습니다. 결제나 예약 확정 전에 적용 기준을 담당자에게 확인해 주세요.' },
  { question: '상담 신청 후 바로 예약이 확정되나요?', answer: '아닙니다. 상담 신청 후 강사 가능 일정 확인, 연락 상담, 풀장과 시간 조율을 거쳐 예약이 확정됩니다.' },
];

export const testReviews = [
  { title: '아이의 눈높이에 맞춘 세심한 수업', quote: '기본부터 차근차근 지도하고 아이와 소통하며 가능성을 끌어내 준 점이 좋았다는 후기입니다.', author: '유니3971', course: '유스 프리다이빙' },
  { title: '컨디션에 맞춘 안전한 레슨', quote: '당일 상태에 맞춘 수업과 핀 동작 교정이 세심했다는 후기입니다.', author: 'cuc****', course: '프리다이빙 레벨2' },
  { title: '친절하고 꼼꼼한 피드백', quote: '자세를 살펴보고 어려운 부분을 함께 고민했으며 사진과 영상도 전달받았다는 후기입니다.', author: 'hos****', course: '프리다이빙 입문' },
  { title: '단계적인 물 적응', quote: '단계적인 지도 덕분에 깊은 물을 편안하게 즐길 수 있게 되었다는 후기입니다.', author: '썸띵헬ㅆl', course: '프리다이빙' },
];
