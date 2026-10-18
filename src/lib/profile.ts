// Loads src/data/profile.yaml, validates it, and shapes it for the website and the CV.
// A typo or a missing photo fails the build here with a readable message.
import { parse } from 'yaml';
import { z } from 'astro/zod';
import type { ImageMetadata } from 'astro';
import raw from '../data/profile.yaml?raw';

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'use YYYY-MM-DD');
// YAML reads 2026 as a number; accept it as text so nobody has to remember quotes
const text = z.union([z.string(), z.number()]).transform(String);

const photo = z.strictObject({
  src: z.string(),
  alt: z.string().min(10, 'describe the photo for people who cannot see it'),
  caption: z.string().optional(),
});

const evidence = z
  .strictObject({
    label: z.string(),
    image: z.string().optional(),
    file: z.string().startsWith('/').optional(),
    url: z.url().optional(),
  })
  .refine((e) => [e.image, e.file, e.url].filter(Boolean).length === 1, 'give exactly one of image, file or url');

export const cvSections = {
  education: 'Education',
  experience: 'Experience',
  honours: 'Honours and awards',
  projects: 'Projects',
  events: 'Conferences and programmes',
  memberships: 'Memberships',
  certifications: 'Certifications',
} as const;

const cvEntry = z.strictObject({
  section: z.enum(Object.keys(cvSections) as [keyof typeof cvSections, ...(keyof typeof cvSections)[]]),
  title: z.string(),
  org: z.string().optional(),
  place: z.string().optional(),
  dates: text.optional(),
  order: z.number().optional(),
  bullets: z.array(z.string()).default([]),
});

export const categories = {
  study: 'Study',
  work: 'Work',
  research: 'Research',
  international: 'International',
} as const;

const chapter = z.strictObject({
  id: z.string().regex(/^[a-z0-9-]+$/, 'lowercase letters, numbers and dashes only'),
  date: isoDate,
  when: text,
  place: z.string(),
  map: z.enum(['lahore', 'krasnoyarsk', 'ekaterinburg', 'online']).optional(),
  category: z.enum(Object.keys(categories) as [keyof typeof categories, ...(keyof typeof categories)[]]),
  title: z.string(),
  summary: z.string(),
  story: z.string().optional(),
  photos: z.array(photo).default([]),
  evidence: z.array(evidence).default([]),
  project: z.string().optional(),
  cv: z.array(cvEntry).default([]),
});

const schema = z.strictObject({
  person: z.strictObject({
    name: z.string(),
    location: z.string(),
    tagline: z.string(),
    portrait: z.string(),
    hero: photo.optional(),
    intro: z.array(z.string()).min(1),
  }),
  highlights: z.array(z.strictObject({ figure: text, text: z.string() })).max(4).default([]),
  contact: z.strictObject({
    email: z.email(),
    phone: z.string().optional(),
    linkedin: z.url(),
    github: z.url(),
  }),
  cv: z.strictObject({
    showPhone: z.boolean().default(false),
    summary: z.string(),
  }),
  timeline: z.array(chapter).min(1),
  next: z.array(z.strictObject({ title: z.string(), text: z.string(), tools: z.string().optional() })).default([]),
  interests: z.array(z.string()).default([]),
  services: z.array(z.strictObject({ title: z.string(), text: z.string() })).default([]),
  skills: z.array(z.strictObject({ group: z.string(), items: z.array(z.string()) })).default([]),
  languages: z.array(z.strictObject({ name: z.string(), level: z.string() })).default([]),
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
  if (!found) {
    throw new Error(`profile.yaml points to "${path}", but there is no such file in src/assets/`);
  }
  return found;
}

const ids = new Set<string>();
for (const c of data.timeline) {
  if (ids.has(c.id)) throw new Error(`profile.yaml: two timeline chapters use the id "${c.id}"`);
  ids.add(c.id);
  c.photos.forEach((p) => asset(p.src));
  c.evidence.forEach((e) => e.image && asset(e.image));
}
asset(data.person.portrait);
if (data.person.hero) asset(data.person.hero.src);

export const timeline = [...data.timeline].sort((a, b) => a.date.localeCompare(b.date));
export type Chapter = (typeof timeline)[number];

/** Label used by the year rail: the chapter's year, or "Now" for the closing chapter. */
export const yearOf = (c: Chapter) => (c.when === 'Now' ? 'Now' : c.date.slice(0, 4));
export const years = [...new Set(timeline.map(yearOf))];

/** Paragraphs of a multi-line YAML text block. */
export const paragraphs = (text?: string) =>
  (text ?? '')
    .split(/\n\s*\n/)
    .map((p) => p.replace(/\s*\n\s*/g, ' ').trim())
    .filter(Boolean);

/** CV sections assembled from the cv blocks of every chapter, newest first (education by `order`). */
export function cv() {
  return (Object.keys(cvSections) as (keyof typeof cvSections)[])
    .map((key) => {
      const entries = timeline
        .flatMap((c) => c.cv.filter((e) => e.section === key).map((e) => ({ ...e, sortDate: c.date })))
        .sort((a, b) =>
          a.order !== undefined || b.order !== undefined
            ? (a.order ?? 99) - (b.order ?? 99)
            : b.sortDate.localeCompare(a.sortDate),
        );
      return { key, title: cvSections[key], entries };
    })
    .filter((s) => s.entries.length > 0);
}

export const { person, highlights, contact, next, interests, services, skills, languages } = data;
export const cvSettings = data.cv;

export const site = {
  url: 'https://abdulhaseeb707.github.io',
  cvFile: '/Abdul-Haseeb-Khan-CV.pdf',
  built: new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date()),
};
