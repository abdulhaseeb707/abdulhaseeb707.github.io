// CVs and resumes tailored to one job: npm run cv:tailored -- "<folder or .yaml file>" [...]
// Each YAML file (format: lib/cv/tailored.ts) becomes a PDF next to it, in the website CV's design. The files belong
// in the owner's folder ("4 CV\Applications\<company - role>"), outside this repo: they never go online.
// Fails if a file breaks the AGENTS.md wording and truth rules, or if the PDF has a different number of pages.
import './ts-hooks.mjs';
import { readFile, readdir, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { createElement } from 'react';
import { renderToBuffer } from '@react-pdf/renderer';
import { parse } from 'yaml';
import { claimRules, wordRules } from './rules.mjs';

const { tailoredSchema, tailoredContent } = await import('../lib/cv/tailored.ts');
const { CvDocument } = await import('../lib/cv/CvDocument.tsx');

const rules = [
  ...claimRules,
  ...wordRules,
  ['"economist" as his title (not yet: AGENTS.md)', /\beconomist\b/i],
  ['"MPhil" without "Economics"', /\bMPhil\b(?!\s+(in\s+)?Economics)/],
];

const args = process.argv.slice(2);
if (!args.length) {
  console.error('usage: npm run cv:tailored -- "<folder or .yaml file>" [...]');
  process.exit(1);
}

const inputs = [];
for (const arg of args) {
  if ((await stat(arg)).isDirectory()) {
    for (const name of await readdir(arg)) if (/\.ya?ml$/.test(name)) inputs.push(path.join(arg, name));
  } else inputs.push(arg);
}

let failed = false;
for (const file of inputs) {
  const text = await readFile(file, 'utf8');
  const problems = rules.flatMap(([name, pattern]) => {
    const hit = text.match(pattern);
    return hit ? [`${name} ("${hit[0]}")`] : [];
  });
  let data;
  try {
    data = parse(text);
  } catch (error) {
    problems.push(`not valid YAML (put a line with ": " in quotes): ${error.message.split('\n')[0]}`);
  }
  const parsed = tailoredSchema.safeParse(data);
  if (data && !parsed.success) problems.push(...parsed.error.issues.map((i) => `${i.path.join(' > ')}: ${i.message}`));
  if (problems.length) {
    console.error(`${file}:\n${problems.map((p) => `  - ${p}`).join('\n')}`);
    failed = true;
    continue;
  }

  const t = parsed.data;
  const pdf = await renderToBuffer(createElement(CvDocument, { content: tailoredContent(t) }));
  const pages = (Buffer.from(pdf).toString('latin1').match(/\/Type\s*\/Page(?!s)/g) ?? []).length;
  const out = path.join(path.dirname(file), t.file);
  await writeFile(out, pdf);
  if (pages !== t.pages) {
    console.error(`${out}: ${pages} page(s), it should be ${t.pages}; shorten or lengthen ${path.basename(file)}`);
    failed = true;
  } else console.log(`${out}: ${t.kind.toLowerCase()} for ${t.for}, ${pages} page(s), ${Math.round(pdf.length / 1024)} KB`);
}
process.exit(failed ? 1 : 0);
