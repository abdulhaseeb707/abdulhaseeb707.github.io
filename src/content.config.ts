import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// Long project stories. Short facts about each project live in src/data/profile.yaml.
const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: z.strictObject({
    title: z.string(),
    summary: z.string(),
    period: z.string(),
    status: z.enum(['completed', 'ongoing']),
    // hidden until the files that back it up are in the repo (see AGENTS.md)
    draft: z.boolean().default(false),
    featured: z.boolean().default(false),
    order: z.number().default(99),
    chapter: z.string().optional(),
    question: z.string(),
    data: z.string().optional(),
    methods: z.array(z.string()).default([]),
    tools: z.array(z.string()).default([]),
    links: z.array(z.strictObject({ label: z.string(), url: z.string() })).default([]),
  }),
});

export const collections = { projects };
