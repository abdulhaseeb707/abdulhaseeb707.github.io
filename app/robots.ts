import type { MetadataRoute } from 'next';
import { site } from '@/lib/profile';

export const dynamic = 'force-static';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/academia/', '/projects/inflation-profitability/'] },
    sitemap: `${site.url}/sitemap.xml`,
  };
}
