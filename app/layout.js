import "./globals.css";

export const metadata = {
  title: "Blue Peace | 바다와 가까워지는 시간",
  description: "블루피스의 프리다이빙, 머메이드, 스쿠버 및 수중 안전 교육을 만나보세요.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
