// Draws the 1200x630 link-preview images (Open Graph) into public/og/ at build time (npm run assets):
// home.png, research.png, cv.png and one per project page (<slug>.png). The words come from content/profile.yaml,
// the charts from the same data snapshots as the site's charts. Rendered with Next's own image renderer (next/og);
// the fonts are the site's, from @fontsource. Generated files are gitignored.
import { createRequire } from 'node:module';
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import { parse } from 'yaml';

const require = createRequire(import.meta.url);
const { ImageResponse } = require('next/og');
const { createElement: h } = require('react');

const W = 1200;
const H = 630;
const OUT = 'public/og';
const C = {
  ivory: '#f4f1ea', paper: '#fbfaf6', ink: '#111a2b', slate: '#4b5466', hair: '#ddd7ca', grid: '#e7e2d7',
  forest: '#0e7a5a', brass: '#b7802a', brassInk: '#8a5f1d', muted: '#c3beb3',
};

const profile = parse(readFileSync('content/profile.yaml', 'utf8'));
const json = (p) => JSON.parse(readFileSync(p, 'utf8'));
const font = (pkg, file) => readFileSync(path.join('node_modules', '@fontsource', pkg, 'files', file));
const fonts = [
  { name: 'Serif', data: font('instrument-serif', 'instrument-serif-latin-400-normal.woff'), weight: 400, style: 'normal' },
  { name: 'Serif', data: font('instrument-serif', 'instrument-serif-latin-400-italic.woff'), weight: 400, style: 'italic' },
  { name: 'Sans', data: font('geist-sans', 'geist-sans-latin-400-normal.woff'), weight: 400, style: 'normal' },
  { name: 'Sans', data: font('geist-sans', 'geist-sans-latin-600-normal.woff'), weight: 600, style: 'normal' },
  { name: 'Mono', data: font('geist-mono', 'geist-mono-latin-400-normal.woff'), weight: 400, style: 'normal' },
];

// ── small building blocks ────────────────────────────────────────────────────
const box = (style, ...children) => h('div', { style: { display: 'flex', ...style } }, ...children);
const label = (text, color = C.slate) =>
  box({ fontFamily: 'Mono', fontSize: 17, letterSpacing: 1.2, textTransform: 'uppercase', color }, text);

// "a *word* here": one item per word so the emphasised words can wrap with the rest (italic serif, forest).
// Punctuation right after an emphasis ("*4%*, about") stays on the emphasised word, with no space before it.
const prose = (text, size, color = C.slate) => {
  const words = [];
  for (const part of text.split(/(\*[^*]+\*)/)) {
    const em = part.startsWith('*') && part.endsWith('*');
    let rest = part.replace(/\*/g, '');
    const lead = em ? null : rest.match(/^[.,;:!?)]+/);
    if (lead && words.length) {
      words[words.length - 1].text += lead[0];
      rest = rest.slice(lead[0].length);
    }
    for (const w of rest.split(' ').filter(Boolean)) words.push({ text: w, em });
  }
  return box(
    { flexWrap: 'wrap', fontFamily: 'Sans', fontSize: size, lineHeight: 1.4, color },
    ...words.map((w) =>
      h('span', {
        style: w.em
          ? { fontFamily: 'Serif', fontStyle: 'italic', fontSize: size * 1.12, color: C.forest, marginRight: size * 0.28 }
          : { marginRight: size * 0.28 },
      }, w.text),
    ),
  );
};

const moon = (size) =>
  h('svg', { width: size, height: size, viewBox: '0 0 64 64' },
    h('circle', { cx: 32, cy: 32, r: 21, fill: 'none', stroke: C.ink, strokeWidth: 2.5 }),
    h('path', { d: 'M 32 11 A 21 21 0 0 1 32 53 A 8 21 0 0 0 32 11 Z', fill: C.ink }),
  );

const footer = (right) =>
  box(
    { position: 'absolute', left: 64, right: 64, bottom: 44, alignItems: 'center', justifyContent: 'space-between',
      borderTop: `1px solid ${C.hair}`, paddingTop: 22 },
    box({ alignItems: 'center', gap: 14 }, moon(30), box({ fontFamily: 'Mono', fontSize: 21, color: C.slate }, 'abdulhaseebkhan.online')),
    right ? box({ fontFamily: 'Sans', fontSize: 21, color: C.slate }, right) : null,
  );

// the light line grid of the site's chart pages
const gridPaper = () =>
  h('svg', { width: W, height: H, viewBox: `0 0 ${W} ${H}`, style: { position: 'absolute', left: 0, top: 0 } },
    ...Array.from({ length: Math.ceil(W / 40) }, (_, i) => h('line', { x1: i * 40, y1: 0, x2: i * 40, y2: H, stroke: C.grid, strokeWidth: 1 })),
    ...Array.from({ length: Math.ceil(H / 40) }, (_, i) => h('line', { x1: 0, y1: i * 40, x2: W, y2: i * 40, stroke: C.grid, strokeWidth: 1 })),
  );

const card = (children, { grid = false } = {}) =>
  box({ width: W, height: H, position: 'relative', background: C.ivory, fontFamily: 'Sans' }, grid ? gridPaper() : null, ...children);

async function render(name, element) {
  const png = Buffer.from(await new ImageResponse(element, { width: W, height: H, fonts }).arrayBuffer());
  const out = path.join(OUT, `${name}.png`);
  const info = await sharp(png).png({ compressionLevel: 9, palette: true, quality: 95 }).toFile(out);
  console.log(`share image: ${out} ${info.width}x${info.height} ${Math.round(info.size / 1024)} KB`);
}

// ── the cards ────────────────────────────────────────────────────────────────
const { person, research } = profile;
const fmt = (n, d = 0) => n.toLocaleString('en', { minimumFractionDigits: d, maximumFractionDigits: d });

async function home() {
  const portrait = await sharp('assets/' + person.portrait).resize(340, 340, { fit: 'cover', position: 'top' }).jpeg({ quality: 90 }).toBuffer();
  const orbit = h('svg', { width: 470, height: 470, viewBox: '0 0 470 470', style: { position: 'absolute', left: 0, top: 0 } },
    h('circle', { cx: 235, cy: 235, r: 226, fill: 'none', stroke: C.brass, strokeOpacity: 0.55, strokeWidth: 1.6, strokeDasharray: '2 9' }),
    h('circle', { cx: 395, cy: 75, r: 6, fill: C.brass }),
  );
  return card([
    box({ position: 'absolute', left: 64, top: 70, width: 620, flexDirection: 'column', gap: 26 },
      label(person.label.replace(/ · Lahore$/, '')),
      box({ fontFamily: 'Serif', fontSize: 98, lineHeight: 1, color: C.ink, letterSpacing: -1 }, person.name),
      prose(person.intro[0], 27),
    ),
    box({ position: 'absolute', right: 56, top: 50, width: 470, height: 470, alignItems: 'center', justifyContent: 'center' },
      orbit,
      box({ width: 380, height: 380, borderRadius: 190, background: C.paper, border: `1px solid ${C.hair}`, alignItems: 'center', justifyContent: 'center' },
        h('img', { src: `data:image/jpeg;base64,${portrait.toString('base64')}`, width: 340, height: 340, style: { borderRadius: 170, objectFit: 'cover' } }),
      ),
    ),
    footer(person.location),
  ]);
}

async function researchCard() {
  const deck = json('content/research/deck.json');
  const years = deck.idx_years;
  const nominal = deck.nominal_index;
  const real = deck.real_index;
  const cw = 500, ch = 300, pad = { l: 8, r: 8, t: 12, b: 34 };
  const max = Math.max(...nominal, ...real) * 1.05;
  const x = (i) => pad.l + (i / (years.length - 1)) * (cw - pad.l - pad.r);
  const y = (v) => pad.t + (1 - v / max) * (ch - pad.t - pad.b);
  const line = (vals) => vals.map((v, i) => `${i ? 'L' : 'M'} ${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(' ');
  const last = years.length - 1;
  const chart = box({ position: 'absolute', right: 64, top: 118, width: cw + 150, height: ch + 30, flexDirection: 'column' },
    box({ position: 'relative', width: cw + 150, height: ch },
      h('svg', { width: cw, height: ch, viewBox: `0 0 ${cw} ${ch}`, style: { position: 'absolute', left: 0, top: 0 } },
        h('line', { x1: pad.l, x2: cw - pad.r, y1: y(100), y2: y(100), stroke: C.muted, strokeWidth: 1.4, strokeDasharray: '5 5' }),
        h('line', { x1: pad.l, x2: cw - pad.r, y1: ch - pad.b, y2: ch - pad.b, stroke: C.hair, strokeWidth: 1.4 }),
        h('path', { d: line(nominal), fill: 'none', stroke: C.forest, strokeWidth: 4, strokeLinejoin: 'round', strokeLinecap: 'round' }),
        h('path', { d: line(real), fill: 'none', stroke: C.brass, strokeWidth: 4, strokeLinejoin: 'round', strokeLinecap: 'round' }),
        h('circle', { cx: x(last), cy: y(nominal[last]), r: 7, fill: C.forest }),
        h('circle', { cx: x(last), cy: y(real[last]), r: 7, fill: C.brass }),
      ),
      box({ position: 'absolute', left: cw + 16, top: y(nominal[last]) - 22, flexDirection: 'column' },
        box({ fontFamily: 'Sans', fontWeight: 600, fontSize: 30, color: C.ink }, fmt(nominal[last])),
        box({ fontFamily: 'Mono', fontSize: 16, color: C.slate }, 'in rupees'),
      ),
      box({ position: 'absolute', left: cw + 16, top: y(real[last]) - 30, flexDirection: 'column' },
        box({ fontFamily: 'Sans', fontWeight: 600, fontSize: 30, color: C.ink }, fmt(real[last])),
        box({ fontFamily: 'Mono', fontSize: 16, color: C.slate }, 'after inflation'),
      ),
    ),
    box({ width: cw, justifyContent: 'space-between', fontFamily: 'Mono', fontSize: 16, color: C.slate },
      box({}, years[0]), box({}, `operating profit, ${years[0]} = 100`), box({}, years[last])),
  );
  return card([
    box({ position: 'absolute', left: 64, top: 70, width: 470, flexDirection: 'column', gap: 24 },
      label(research.status.replace(/\. /, ' · ').replace(/\.$/, ''), C.brassInk),
      box({ fontFamily: 'Serif', fontSize: 62, lineHeight: 1.04, color: C.ink, letterSpacing: -0.5 }, research.title.replace(/,\s*FY.*$/, '')),
      prose(research.teaser, 25),
    ),
    chart,
    footer(person.name),
  ], { grid: true });
}

async function projectCard(p) {
  const plants = json(`content/projects/${p.slug}/plants.json`);
  const allocation = json(`content/projects/${p.slug}/allocation.json`);
  const summary = json(`content/projects/${p.slug}/summary.json`);
  const sum = (xs) => xs.reduce((a, b) => a + b, 0);
  const rows = plants
    .map((pl) => {
      const a = allocation.filter((r) => r.plant_id === pl.plant_id);
      const change = (sum(a.map((r) => r.optimized_cost_pkr)) / sum(a.map((r) => r.baseline_cost_pkr)) - 1) * 100;
      return { name: pl.plant_name, change };
    })
    .sort((a, b) => a.change - b.change);
  rows.push({ name: 'All plants', change: -summary.saving_pct, total: true });
  const most = Math.max(...rows.map((r) => Math.abs(r.change)));
  const barMax = 300;
  const chart = box({ position: 'absolute', right: 64, top: 128, width: 560, flexDirection: 'column', gap: 18 },
    box({ fontFamily: 'Mono', fontSize: 16, color: C.slate, marginBottom: 4 }, 'fuel cost per GJ, optimized mix vs FY2025 mix'),
    ...rows.map((r) =>
      box({ alignItems: 'center', gap: 16, ...(r.total ? { borderTop: `1px solid ${C.hair}`, paddingTop: 16 } : {}) },
        box({ width: 170, justifyContent: 'flex-end', fontFamily: 'Sans', fontSize: 21, fontWeight: r.total ? 600 : 400, color: C.ink }, r.name),
        box({ width: Math.max(6, (Math.abs(r.change) / most) * barMax), height: 22, borderRadius: 4, background: r.total ? C.forest : C.muted }),
        box({ fontFamily: 'Sans', fontSize: 21, fontWeight: r.total ? 600 : 400, color: C.ink }, `${r.change < 0 ? '−' : '+'}${fmt(Math.abs(r.change), 1)}%`),
      ),
    ),
  );
  return card([
    box({ position: 'absolute', left: 64, top: 70, width: 480, flexDirection: 'column', gap: 24 },
      label(`Project · ${p.when}`, C.brassInk),
      box({ fontFamily: 'Serif', fontSize: 58, lineHeight: 1.04, color: C.ink, letterSpacing: -0.5 }, p.title),
      prose(p.teaser, 25),
    ),
    chart,
    footer(person.name),
  ], { grid: true });
}

function cvCard() {
  const rule = (w, color = C.hair, height = 2) => box({ width: w, height, background: color, borderRadius: 1 });
  const page = (left, top, rotate, withName) =>
    box({ position: 'absolute', left, top, width: 290, height: 380, background: C.paper, border: `1px solid ${C.hair}`,
      transform: `rotate(${rotate}deg)`, flexDirection: 'column', alignItems: 'center', paddingTop: 34, gap: 12 },
      withName ? box({ fontFamily: 'Serif', fontSize: 30, color: C.ink }, person.name) : rule(150, C.muted, 6),
      rule(200, C.hair, 1),
      ...[0, 1, 2].flatMap((s) => [
        box({ width: 230, marginTop: 10 }, rule(70, C.ink, 4)),
        rule(230), rule(230), rule(180),
      ]),
    );
  return card([
    box({ position: 'absolute', left: 64, top: 70, width: 620, flexDirection: 'column', gap: 26 },
      label('CV · 2 pages · PDF', C.brassInk),
      box({ fontFamily: 'Serif', fontSize: 98, lineHeight: 1, color: C.ink, letterSpacing: -1 }, person.name),
      prose(person.label.replace(/ · /g, ', '), 27),
      prose('Education, research, experience and awards.', 27),
    ),
    page(800, 90, 4, false),
    page(760, 70, -3, true),
    footer(person.location),
  ]);
}

mkdirSync(OUT, { recursive: true });
await render('home', await home());
await render('research', await researchCard());
await render('cv', cvCard());
for (const p of profile.projects.filter((x) => x.slug)) await render(p.slug, await projectCard(p));
