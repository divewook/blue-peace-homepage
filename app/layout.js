import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
  || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://www.freediving.pe.kr");
const siteTitle = "대구·경북 최대 다이빙 전문 센터 | 블루피스 BLUE PEACE";
const siteDescription = "대구·구미·경북 최대 다이빙 전문 센터 블루피스. 프리다이빙, 스쿠버다이빙, 유스, 머메이드, 수중안전요원 라이센스 및 무제한 트레이닝 보장.";

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
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessData) }} />
        {children}
      </body>
    </html>
  );
}
