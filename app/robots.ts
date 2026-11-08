import type { MetadataRoute } from 'next';

const site = 'https://www.bluepeace.co.kr';

export default function robots(): MetadataRoute.Robots {
  if (process.env.BLUEPEACE_PUBLIC_DEMO === 'true') {
    return { rules: { userAgent: '*', disallow: '/' } };
  }
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/instructor', '/api', '/TEST'],
    },
    sitemap: `${site}/sitemap.xml`,
    host: site,
  };
}
