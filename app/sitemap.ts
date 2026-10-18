import type { MetadataRoute } from 'next';
import { site } from '@/lib/profile';

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  return ['/', site.researchPage, site.cvPage].map((p) => ({ url: new URL(p, site.url).href, lastModified: new Date() }));
}
