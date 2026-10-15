import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
  || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://www.freediving.pe.kr");

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: "블루피스 | 프리미엄 프리다이빙 아카데미",
  description: "바다 속에서 만나는 가장 완벽한 자유. 블루피스의 프리다이빙, 유스, 머메이드, 스쿠버 및 수중 안전 교육을 만나보세요.",
  openGraph: {
    type: "website",
    url: siteUrl,
    locale: "ko_KR",
    siteName: "Blue Peace",
    title: "블루피스 | 프리미엄 프리다이빙 아카데미",
    description: "바다 속에서 만나는 가장 완벽한 자유. 블루피스 프리미엄 프리다이빙 아카데미.",
  },
  twitter: {
    card: "summary_large_image",
    title: "블루피스 | 프리미엄 프리다이빙 아카데미",
    description: "바다 속에서 만나는 가장 완벽한 자유.",
    images: ["/opengraph-image.png"],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
