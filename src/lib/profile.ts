// Loads src/data/profile.yaml, validates it, and shapes it for the website and the CV.
// A typo or a missing image fails the build here with a readable message.
import { parse } from 'yaml';
import { z } from 'astro/zod';
import type { ImageMetadata } from 'astro';
import raw from '../data/profile.yaml?raw';

// YAML reads 2026 as a number; accept it as text so nobody has to remember quotes
const text = z.union([z.string(), z.number()]).transform(String);
const color = z.enum(['green', 'yellow', 'coral', 'sky', 'paper']);

const photo = z.strictObject({
  src: z.string(),
  alt: z.string().min(10, 'describe the photo for people who cannot see it'),
  caption: z.string().optional(),
});

const proof = z
  .strictObject({
    label: z.string(),
    image: z.string().optional(),
    file: z.string().startsWith('/').optional(),
    url: z.url().optional(),
  })
  .refine((p) => [p.image, p.file, p.url].filter(Boolean).length === 1, 'give exactly one of image, file or url');

const highlight = z.strictObject({
  id: z.string().regex(/^[a-z0-9-]+$/, 'lowercase letters, numbers and dashes only'),
  title: z.string(),
  org: z.string(),
  when: text,
  place: z.string(),
  map: z.enum(['lahore', 'krasnoyarsk', 'ekaterinburg', 'online']).optional(),
  color: color.default('paper'),
  size: z.enum(['normal', 'wide']).default('normal'),
  line: z.string().max(140, 'keep highlight lines to one short sentence'),
  photos: z.array(photo).default([]),
  proof: z.array(proof).default([]),
});

const cvEntry = z.strictObject({
  title: z.string(),
  org: z.string().optional(),
  dates: text.optional(),
  link: z.url().optional(),
  bullets: z.array(z.string()).default([]),
});

const schema = z.strictObject({
  person: z.strictObject({
    name: z.string(),
    shortName: z.string(),
    location: z.string(),
    role: z.string(),
    line: z.string(),
    portrait: z.string(),
    photos: z.array(photo).min(1),
    tags: z.array(z.strictObject({ text: z.string(), color })).default([]),
  }),
  about: z.array(z.string()).min(1),
  contact: z.strictObject({
    email: z.email(),
    phone: z.string().optional(),
    linkedin: z.url(),
    github: z.url(),
  }),
  research: z.strictObject({
    slug: z.string(),
    title: z.string(),
    paperTitle: z.string(),
    status: z.string(),
    tagline: z.string(),
    origin: z.string(),
    stats: z.array(z.strictObject({ figure: text, text: z.string() })),
    findings: z.array(z.strictObject({ figure: text, text: z.string() })),
    figures: z.array(photo.extend({ tab: z.string() })).min(1),
    kink: z.strictObject({ at: z.number(), below: z.number(), above: z.number(), from: z.number(), to: z.number() }),
    links: z.array(z.strictObject({ label: z.string(), note: z.string().optional(), url: z.url() })),
    page: z.array(z.string()),
    exact: z.array(z.string()),
    did: z.array(z.string()),
    tags: z.array(z.string()),
  }),
  highlights: z.array(highlight).min(1),
  services: z.array(z.string()).default([]),
  skills: z.array(z.strictObject({ group: z.string(), items: z.array(z.string()) })).default([]),
  languages: z.array(z.strictObject({ name: z.string(), level: z.string() })).default([]),
  cv: z.strictObject({
    showPhone: z.boolean().default(false),
    summary: z.string(),
    sections: z.array(z.strictObject({ title: z.string(), entries: z.array(cvEntry).min(1) })),
  }),
});

const result = schema.safeParse(parse(raw));
if (!result.success) {
  const lines = result.error.issues.map((i) => `  - ${i.path.join(' > ')}: ${i.message}`);
  throw new Error(`src/data/profile.yaml has problems:\n${lines.join('\n')}`);
}
const data = result.data;

// Every image under src/assets, keyed by its path inside src/assets ("photos/portrait.jpg").
const assetModules = import.meta.glob<{ default: ImageMetadata }>('../assets/**/*.{jpg,jpeg,png,webp}', {
  eager: true,
});
const assets = new Map(Object.entries(assetModules).map(([key, mod]) => [key.replace('../assets/', ''), mod.default]));

export function asset(path: string): ImageMetadata {
  const found = assets.get(path);
  if (!found) throw new Error(`profile.yaml points to "${path}", but there is no such file in src/assets/`);
  return found;
}

// check every image reference up front
asset(data.person.portrait);
data.person.photos.forEach((p) => asset(p.src));
data.research.figures.forEach((f) => asset(f.src));
const ids = new Set<string>();
for (const h of data.highlights) {
  if (ids.has(h.id)) throw new Error(`profile.yaml: two highlights use the id "${h.id}"`);
  ids.add(h.id);
  h.photos.forEach((p) => asset(p.src));
  h.proof.forEach((p) => p.image && asset(p.image));
}

export type Highlight = (typeof data.highlights)[number];
export const { person, about, contact, research, highlights, services, skills, languages } = data;
export const cv = data.cv;

export const site = {
  url: 'https://abdulhaseeb707.github.io',
  cvPage: '/cv/',
  cvFile: '/Abdul-Haseeb-Khan-CV.pdf',
  researchPage: `/research/${data.research.slug}/`,
  built: new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date()),
};
