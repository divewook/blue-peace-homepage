import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '블루피스 테스트 페이지 | 운영 페이지 아님',
  description: '블루피스 홈페이지 개선안을 확인하는 별도 테스트 페이지입니다.',
  alternates: { canonical: '/TEST' },
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
    },
  },
};

export default function TestLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
