import type { Metadata } from 'next';
import { profile } from './profile';

// Title, description, share card and canonical address for one page. A page's openGraph replaces the layout's whole
// block, so every page sets all of it; without this, shared links to inner pages showed and opened the home page.
// The words come from the seo: block in content/profile.yaml; the 1200x630 share images are drawn at build time by
// scripts/make-share-images.mjs into public/og/<name>.png.

export const shareImage = (name: string, alt: string) => ({ url: `/og/${name}.png`, width: 1200, height: 630, alt });

export function pageMeta({
  title,
  description,
  path,
  image,
  type = 'article',
}: {
  title: string;
  description: string;
  path: string;
  image: ReturnType<typeof shareImage>;
  type?: 'article' | 'profile' | 'website';
}): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { type, title: `${title} · ${profile.person.name}`, description, url: path, images: [image] },
    twitter: { card: 'summary_large_image', title: `${title} · ${profile.person.name}`, description, images: [image] },
  };
}
