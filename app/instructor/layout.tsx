import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '강사 로그인 | 블루피스',
  robots: { index: false, follow: false, nocache: true },
  alternates: { canonical: '/instructor/mypage' },
};

export default function InstructorLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
