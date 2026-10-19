// Loads content/profile.yaml at build time, validates it, and fails the build with a readable list of
// problems if anything is missing or misspelt. Used only on the server (pages, the CV PDF).
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { parse } from 'yaml';
import { z } from 'zod';
import { img } from './images';
import { withBase } from './base';

// YAML reads 2026 as a number; accept it as text so nobody has to remember quotes
const text = z.union([z.string(), z.number()]).transform(String);

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

const cvEntry = z.strictObject({
  title: z.string(),
  org: z.string().optional(),
  dates: text.optional(),
  link: z.union([z.url(), z.string().regex(/^\/\S+$/, 'a full address, or a path on this site such as /files/x.pdf')]).optional(),
  linkLabel: z.string().optional(), // what the PDF prints for the link; the address itself if left out
  pdf: z.boolean().default(true), // false: on the website only, left out of the PDF
  bullets: z.array(z.string()).default([]),
});

const schema = z.strictObject({
  person: z.strictObject({
    name: z.string(),
    location: z.string(),
    label: z.string(),
    headline: z.string(),
    intro: z.array(z.string()).min(1).max(2, 'two short lines at most'),
    portrait: z.string(),
    facts: z.array(z.strictObject({ figure: text, text: z.string() })).max(4),
  }),
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
    teaser: z.string(),
    origin: z.string(),
    moonCaption: z.string(),
    stats: z.array(z.strictObject({ figure: text, text: z.string() })),
    story: z.array(z.strictObject({ title: z.string(), text: z.string() })).length(6, 'the research story has six steps, one per chart'),
    implications: z.array(z.string()),
    limitations: z.string(),
    links: z.array(z.strictObject({ label: z.string(), note: z.string().optional(), url: z.url() })),
    did: z.array(z.string()),
    tags: z.array(z.string()),
  }),
  highlights: z.array(
    z.strictObject({
      id: z.string().regex(/^[a-z0-9-]+$/, 'lowercase letters, numbers and dashes only'),
      title: z.string(),
      org: z.string(),
      when: text,
      place: z.string(),
      line: z.string().max(140, 'keep it to one short sentence'),
      photos: z.array(photo).default([]),
      proof: z.array(proof).default([]),
    }),
  ),
  papers: z
    .array(
      z.strictObject({
        kind: z.string(),
        title: z.string(),
        where: z.string().optional(),
        when: text,
        line: z.string().optional(),
        url: z.url().optional(),
      }),
    )
    .default([]),
  projects: z
    .array(
      z
        .strictObject({
          slug: z.string().regex(/^[a-z0-9-]+$/, 'lowercase letters, numbers and dashes only').optional(),
          title: z.string(),
          kind: z.string(),
          when: text,
          where: z.string().optional(),
          line: z.string().optional(),
          tagline: z.string().optional(),
          teaser: z.string().optional(),
          note: z.string().optional(),
          stats: z.array(z.strictObject({ figure: text, text: z.string() })).default([]),
          intro: z.array(z.string()).default([]),
          sections: z
            .array(
              z.strictObject({
                heading: z.string(),
                text: z.string().optional(),
                list: z.array(z.string()).optional(),
                chart: z.enum(['plants', 'scenarios', 'cap']).optional(),
              }),
            )
            .default([]),
          did: z.array(z.string()).default([]),
          caveat: z.string().optional(),
          links: z.array(z.strictObject({ label: z.string(), note: z.string().optional(), url: z.url() })).default([]),
          tags: z.array(z.string()).default([]),
        })
        .refine(
          (p) => !p.slug || (p.tagline && p.teaser && p.stats.length && p.links.length && p.sections.length),
          'a project with its own page needs a tagline, teaser, stats, links and sections',
        ),
    )
    .default([]),
  places: z
    .array(
      z.strictObject({
        name: z.string(),
        country: z.string(),
        when: text,
        at: z.tuple([z.number().min(-180).max(180), z.number().min(-90).max(90)]),
        line: z.string(),
        work: z.string().optional(),
        labelLeft: z.boolean().default(false),
      }),
    )
    .min(2, 'home plus at least one other place'),
  services: z.array(z.string()).default([]),
  skills: z.array(z.strictObject({ group: z.string(), items: z.array(z.string()) })),
  languages: z.array(z.strictObject({ name: z.string(), level: z.string() })),
  cv: z.strictObject({
    showPhone: z.boolean().default(false),
    summary: z.string(),
    sections: z.array(z.strictObject({ title: z.string(), entries: z.array(cvEntry).min(1) })),
  }),
});

function load() {
  const file = path.join(process.cwd(), 'content', 'profile.yaml');
  const result = schema.safeParse(parse(readFileSync(file, 'utf8')));
  if (!result.success) {
    const lines = result.error.issues.map((i) => `  - ${i.path.join(' > ')}: ${i.message}`);
    throw new Error(`content/profile.yaml has problems:\n${lines.join('\n')}`);
  }
  const data = result.data;
  // every image reference must exist (img() throws a clear error otherwise)
  img(data.person.portrait);
  for (const h of data.highlights) {
    h.photos.forEach((p) => img(p.src));
    h.proof.forEach((p) => p.image && img(p.image));
  }
  for (const p of data.places) {
    if (p.work && !data.highlights.some((h) => h.id === p.work)) {
      throw new Error(`content/profile.yaml has problems:\n  - places > ${p.name} > work: no highlight has the id "${p.work}"`);
    }
  }
  return data;
}

export const profile = load();
export type Profile = typeof profile;
export type Highlight = Profile['highlights'][number];

export const site = {
  url: 'https://abdulhaseeb707.github.io',
  cvPage: '/cv/',
  cvFile: withBase('/Abdul-Haseeb-Khan-CV.pdf'), // a plain <a download>, so it needs the folder prefix
  researchPage: `/research/${profile.research.slug}/`,
  projectPage: (slug: string) => `/projects/${slug}/`,
  built: new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date()),
};
