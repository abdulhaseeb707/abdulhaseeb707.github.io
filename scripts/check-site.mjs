// Runs after every build (npm run build). Enforces AGENTS.md: no wrong, private or "published" claims in what
// visitors see; no AI attribution; no gradients, shadows, blur or dark theme; no emoji; and a 2-page CV PDF.
import { readFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';

const OUT = 'out';
const exists = (p) => stat(p).then(() => true).catch(() => false);

async function files(dir, exts) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await files(full, exts)));
    else if (exts.includes(path.extname(entry.name))) out.push(full);
  }
  return out;
}

// in built pages, drawing data (icons, maps, charts) and CSS are not content
const content = (file, text) =>
  file.endsWith('.html')
    ? text.replace(/<svg[\s\S]*?<\/svg>/g, '').replace(/<style[\s\S]*?<\/style>/g, '').replace(/<script[\s\S]*?<\/script>/g, '')
    : file.endsWith('.txt')
      ? text.replace(/"d":"[^"]*"/g, '') // Next's page data (.txt) carries SVG path data too
      : text;

const problems = [];
async function scan(dirs, exts, rules) {
  for (const dir of dirs) {
    if (!(await exists(dir))) continue;
    for (const file of await files(dir, exts)) {
      const text = content(file, await readFile(file, 'utf8'));
      for (const [name, pattern] of rules) {
        const hit = text.match(pattern);
        if (hit) problems.push(`${path.relative('.', file)}: ${name} ("${hit[0]}")`);
      }
    }
  }
}

// 1. what visitors see
if (!(await exists(OUT))) {
  console.log('check-site: no out/ folder (standalone build); checking source only.');
} else {
  await scan([OUT], ['.html', '.txt', '.xml'], [
    ['old CGPA', /\b3\.34\b/],
    ['"First Division" claim', /first division/i],
    ['festival voucher', /voucher/i],
    ['date of birth', /date of birth|december 0?7,? 2001/i],
    ['festival ID number', /868e6193/i],
    ['phone number on a web page', /301\s*9734442|3019734442/],
    ['AI attribution', /\bclaude\b|co-authored-by|generated with|anthropic|chatgpt|openai/i],
    ['"published" research claim', /\bpublished (paper|research|study)\b|journal article|peer[- ]reviewed paper/i],
    ['causal claim', /inflation (causes|raises|lowers|reduces|increases) /i],
    // the owner keeps the cement company in the cost-optimization project unnamed ("a listed Pakistani cement producer")
    ['cement company name', /\bfauji\b|\bfccl\b/i],
    // the owner doesn't want the IOFS master's scholarship mentioned anywhere
    ['scholarship claim', /50\s?% (master's )?scholarship|master's scholarship/i],
    // the owner doesn't want the 2026 Olympiad mentioned anywhere
    ['2026 Olympiad mention', /VI International Olympiad|Olympiad on Financial Security 2026|eliminatory round/i],
    // the festival talk on financial fraud (Sep 2026) was a student speaker's talk, not based on his research
    ['festival talk called research', /research on financial fraud/i],
    // the BRICS Arts Festival (Nov 2025) was participation only, not an award
    ['BRICS award claim', /award for (excellence in )?financial data interpretation/i],
  ]);
}

// 2. how it looks (source)
await scan(['app', 'components'], ['.css', '.tsx', '.ts'], [
  ['gradient', /gradient\(/i],
  ['backdrop-filter', /backdrop-filter/i],
  ['box-shadow', /box-shadow/i],
  ['blur', /blur\(/i],
  ['text-shadow', /text-shadow/i],
  ['dark theme (the site is light only)', /prefers-color-scheme:\s*dark|data-theme=['"]?dark/i],
]);

// 3. how it reads (source and content)
await scan(['app', 'components', 'lib', 'content'], ['.tsx', '.ts', '.yaml', '.css'], [
  ['emoji', /\p{Extended_Pictographic}/u],
  ['banned word', /\b(passionate|leverag(e|ed|ing)|spearhead(ed)?|cutting-edge|synerg(y|ies)|delve|unlock|results-driven|world-class|game-changer|seamless(ly)?)\b/i],
]);

// 4. the CV PDF exists and is two pages
const pdf = path.join(OUT, 'Abdul-Haseeb-Khan-CV.pdf');
if (await exists(pdf)) {
  const bytes = await readFile(pdf);
  const pages = (bytes.toString('latin1').match(/\/Type\s*\/Page(?!s)/g) ?? []).length;
  if (pages !== 2) problems.push(`${pdf}: the CV is ${pages} page(s), it should be 2`);
  else console.log(`CV: ${pdf}, 2 pages, ${Math.round(bytes.length / 1024)} KB`);
} else if (await exists(OUT)) {
  problems.push(`${pdf} is missing`);
}

if (problems.length) {
  console.error(`Site check failed (see AGENTS.md):\n${problems.map((p) => `  - ${p}`).join('\n')}`);
  process.exit(1);
}
console.log('Site check passed: claims, privacy, styling, wording and CV all fine.');
