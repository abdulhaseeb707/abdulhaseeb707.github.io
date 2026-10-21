// Runs after every build (npm run build). Enforces AGENTS.md: no wrong, private or "published" claims in what
// visitors see; no AI attribution; no gradients, shadows, blur or dark theme; no emoji; search basics on every
// indexable page (title, description, canonical, share image, structured data, sitemap); and a 2-page CV PDF.
import { readFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { claimRules, wordRules } from './rules.mjs';

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
    ...claimRules,
    ['phone number on a web page', /301\s*9734442|3019734442/],
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
await scan(['app', 'components', 'lib', 'content'], ['.tsx', '.ts', '.yaml', '.css'], wordRules);

// 4. what search engines and link previews read, on every page that may be indexed
if (await exists(OUT)) {
  const SITE = 'https://abdulhaseebkhan.online';
  const decode = (s) => s.replace(/&#x27;|&#39;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
  const meta = (html, attr, name) => html.match(new RegExp(`<meta ${attr}="${name}" content="([^"]*)"`))?.[1];
  const sitemap = (await exists(path.join(OUT, 'sitemap.xml'))) ? await readFile(path.join(OUT, 'sitemap.xml'), 'utf8') : '';
  const pngSize = (bytes) => (bytes.toString('latin1', 1, 4) === 'PNG' ? [bytes.readUInt32BE(16), bytes.readUInt32BE(20)] : null);

  let checked = 0;
  for (const file of (await files(OUT, ['.html'])).filter((f) => path.basename(f) === 'index.html')) {
    const html = await readFile(file, 'utf8');
    if (/<meta name="robots" content="noindex/.test(html)) continue; // redirect stubs and the 404 page
    checked++;
    const page = path.relative('.', file);
    const say = (problem) => problems.push(`${page}: ${problem}`);

    const title = decode(html.match(/<title>([^<]*)<\/title>/)?.[1] ?? '');
    if (!title) say('no <title>');
    else if (title.length > 70) say(`title is ${title.length} characters, Google cuts it at about 60-70 ("${title}")`);

    const description = decode(meta(html, 'name', 'description') ?? '');
    if (description.length < 70 || description.length > 160) say(`description is ${description.length} characters, it should be 70 to 160 (seo: in content/profile.yaml)`);

    const canonical = html.match(/<link rel="canonical" href="([^"]*)"/)?.[1];
    if (!canonical?.startsWith(SITE)) say(`canonical address is ${canonical ?? 'missing'}`);
    else if (!sitemap.includes(`<loc>${canonical}</loc>`)) say(`${canonical} is not in sitemap.xml`);

    const image = meta(html, 'property', 'og:image');
    const imageFile = image?.startsWith(SITE) ? path.join(OUT, decodeURI(new URL(image).pathname)) : null;
    if (!imageFile || !(await exists(imageFile))) say(`share image ${image ?? '(none)'} is missing`);
    else if (String(pngSize(await readFile(imageFile))) !== '1200,630') say(`share image ${image} should be a 1200x630 PNG`);
    if (meta(html, 'name', 'twitter:card') !== 'summary_large_image') say('twitter:card should be summary_large_image');

    const blocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => m[1]);
    if (!blocks.length) say('no structured data (JSON-LD)');
    for (const b of blocks) {
      try {
        if (JSON.parse(b)['@context'] !== 'https://schema.org') say('structured data without the schema.org @context');
      } catch {
        say('structured data that is not valid JSON');
      }
    }
  }
  console.log(`Search basics checked on ${checked} pages.`);
  if (!checked) problems.push('no indexable pages found in out/');
}

// 5. the CV PDF exists and is two pages
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
