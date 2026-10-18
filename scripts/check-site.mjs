// Enforces the rules in AGENTS.md after a build: no false or private claims in the output,
// no "AI look" styling, no emoji, no banned buzzwords. Exits with an error if anything is found.
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';

async function files(dir, exts) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await files(full, exts)));
    else if (exts.includes(path.extname(entry.name))) out.push(full);
  }
  return out;
}

// in built pages, drawing data (icon and map paths) and CSS are not content: skip them
const content = (file, text) =>
  file.endsWith('.html')
    ? text.replace(/<svg[\s\S]*?<\/svg>/g, '').replace(/<style[\s\S]*?<\/style>/g, '')
    : text;

const problems = [];
async function scan(dir, exts, rules) {
  for (const file of await files(dir, exts)) {
    const text = content(file, await readFile(file, 'utf8'));
    for (const [name, pattern] of rules) {
      const hit = text.match(pattern);
      if (hit) problems.push(`${path.relative('.', file)}: ${name} ("${hit[0]}")`);
    }
  }
}

// 1. what visitors can see: wrong or private facts
await scan('dist', ['.html', '.xml'], [
  ['old CGPA', /\b3\.34\b/],
  ['"First Division" claim', /first division/i],
  ['festival voucher', /voucher/i],
  ['unverified tool claim', /statsmodels/i],
  ['date of birth', /date of birth|07\.12\.2001|december 0?7,? 2001/i],
  ['festival ID number', /868e6193/i],
  ['phone number on a web page', /301\s*9734442|3019734442/],
]);

// 2. how it looks: no gradients, glass, glow or shadows
await scan('src', ['.css', '.astro'], [
  ['gradient', /gradient\(/i],
  ['backdrop-filter', /backdrop-filter/i],
  ['box-shadow', /box-shadow/i],
  ['blur', /blur\(/i],
  ['text-shadow', /text-shadow/i],
  ['dark theme (the site is light only)', /prefers-color-scheme:\s*dark|data-theme=['"]?dark/i],
]);

// 3. how it reads: no emoji, no buzzwords
await scan('src', ['.astro', '.yaml', '.md', '.ts'], [
  ['emoji', /\p{Extended_Pictographic}/u],
  [
    'banned word',
    /\b(passionate|leverag(e|ed|ing)|spearhead(ed)?|cutting-edge|synerg(y|ies)|delve|results-driven|world-class|game-changer|seamless(ly)?)\b/i,
  ],
]);

if (problems.length) {
  console.error(`Site check failed (see AGENTS.md):\n${problems.map((p) => `  - ${p}`).join('\n')}`);
  process.exit(1);
}
console.log('Site check passed: no banned claims, styling or wording found.');
