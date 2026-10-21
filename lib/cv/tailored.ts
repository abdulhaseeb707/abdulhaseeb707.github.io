// A CV or resume tailored to one job (npm run cv:tailored). Its YAML file lives in the owner's folder, in
// "4 CV\Applications\<company - role>", never in this repo and never online. The PDF has the website CV's design;
// the name, contact line and languages come from profile.yaml, and the truth rules in AGENTS.md apply unchanged:
// tailoring picks, orders and words the facts for the job, it never adds new ones.
import { z } from 'zod';
import { profile, cvEntry } from '../profile';
import type { CvContent } from './CvDocument';

export const tailoredSchema = z.strictObject({
  for: z.string(), // the job, for the record
  kind: z.enum(['CV', 'Resume']),
  file: z.string().regex(/^[\w .()-]+\.pdf$/, 'a file name ending in .pdf'),
  pages: z.number().int().min(1).max(3),
  label: z.string().optional(), // the line under the name; profile.yaml's person.label if left out
  summary: z.string(),
  skills: z.array(z.strictObject({ group: z.string(), items: z.array(z.string()).min(1) })).optional(), // profile.yaml's if left out
  sections: z.array(z.strictObject({ title: z.string(), entries: z.array(cvEntry).min(1) })).min(1),
});

export type Tailored = z.infer<typeof tailoredSchema>;

export function tailoredContent(t: Tailored): CvContent {
  return {
    kind: t.kind,
    label: t.label ?? profile.person.label,
    summary: t.summary,
    sections: t.sections.map((x) => ({ heading: x.title, entries: x.entries.filter((e) => e.pdf) })),
    skills: t.skills ?? profile.skills,
    skillsFirst: true,
  };
}
