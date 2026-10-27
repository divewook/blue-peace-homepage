import "./globals.css";
import MarketingAttributionTracker from "../components/marketing-attribution";
import NaverTracking from "../components/naver-tracking";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.bluepeace.co.kr";
const siteTitle = "대구·경북 다이빙 교육 상담 | 블루피스 BLUE PEACE";
const siteDescription = "칠곡과 밀양 풀장을 중심으로 프리다이빙, 스쿠버다이빙, 유스, 머메이드, 수중레저안전요원 과정을 상담하고 가능한 일정에 맞는 강사를 연결합니다.";

const localBusinessData = {
  "@context": "https://schema.org",
  "@type": "SportsActivityLocation",
  name: "블루피스 BLUE PEACE",
  url: siteUrl,
  description: siteDescription,
  telephone: "+82-10-9897-8990",
  email: "divewook@naver.com",
  address: {
    "@type": "PostalAddress",
    streetAddress: "인강1길 38-12, 1층",
    addressRegion: "경상북도",
    addressLocality: "칠곡군 북삼읍",
    addressCountry: "KR",
  },
  areaServed: ["대구", "구미", "칠곡", "경북"],
  sameAs: ["https://www.instagram.com/bluepeace_diving/"],
};

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: siteTitle,
  description: siteDescription,
  keywords: [
    "대구프리다이빙", "구미프리다이빙", "칠곡프리다이빙", "경북프리다이빙",
    "대구스쿠버다이빙", "구미스쿠버다이빙", "유스프리다이빙", "머메이드다이빙",
    "해루질교육", "패스나인", "블루피스", "수중촬영",
  ],
  alternates: { canonical: "/" },
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    url: siteUrl,
    locale: "ko_KR",
    siteName: "Blue Peace",
    title: siteTitle,
    description: siteDescription,
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: siteDescription,
    images: ["/opengraph-image.png"],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body>
        <MarketingAttributionTracker />
        <NaverTracking />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessData) }} />
        {children}
      </body>
    </html>
  );
}
