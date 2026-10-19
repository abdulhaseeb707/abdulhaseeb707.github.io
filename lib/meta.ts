import type { Metadata } from 'next';
import { profile } from './profile';
import { img } from './images';

// Title, share card and canonical address for one page. A page's openGraph replaces the layout's whole block,
// so every page sets all of it; without this, shared links to inner pages showed and opened the home page.
const portrait = img(profile.person.portrait);

export function pageMeta({ title, description, path }: { title: string; description?: string; path: string }): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: 'article',
      title: `${title} · ${profile.person.name}`,
      description,
      url: path,
      images: [{ url: portrait.src, width: portrait.width, height: portrait.height, alt: profile.person.name }],
    },
  };
}
