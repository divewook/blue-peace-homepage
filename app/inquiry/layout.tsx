import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '교육 상담 신청 | 블루피스',
  description: '블루피스의 프리다이빙·스쿠버·머메이드·유스 등 원하는 과정을 고르고 대표와 교육 상담을 시작하세요. 접수 후 직접 연락드립니다.',
  alternates: { canonical: '/inquiry' },
};

export default function InquiryLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
