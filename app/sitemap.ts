import type { MetadataRoute } from 'next';
import { profile, site } from '@/lib/profile';

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  const projects = profile.projects.filter((p) => p.slug).map((p) => site.projectPage(p.slug!));
  return ['/', site.researchPage, ...projects, site.cvPage].map((p) => ({ url: new URL(p, site.url).href, lastModified: new Date() }));
}
