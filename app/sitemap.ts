import type { MetadataRoute } from 'next';
import { publicCoursePages } from '../lib/seo-courses';

const site = 'https://www.bluepeace.co.kr';

export default function sitemap(): MetadataRoute.Sitemap {
  if (process.env.BLUEPEACE_PUBLIC_DEMO === 'true') return [];
  return [
    { url: site },
    ...publicCoursePages.map(page => ({ url: `${site}/courses/${page.slug}` })),
    { url: `${site}/inquiry` },
    { url: `${site}/privacy` },
    { url: `${site}/terms` },
  ];
}
