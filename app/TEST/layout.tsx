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
  return (
    <>
      <div data-test-page-banner className="relative z-[100] w-full border-b border-amber-400 bg-amber-300 px-3 py-2 text-center text-xs font-black text-amber-950">
        테스트 페이지 · 운영 페이지 아님 · 제출 미전송
      </div>
      {children}
    </>
  );
}
