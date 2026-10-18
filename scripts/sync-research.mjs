// Copies the numbers behind the research charts from the public research repo into content/research/.
// The snapshot is committed, so builds never need the network. Re-run after the research repo changes:
//   npm run sync:research                      (from GitHub)
//   RESEARCH_REPO=../path/to/repo npm run sync:research   (from a local checkout)
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const RAW = 'https://raw.githubusercontent.com/abdulhaseeb707/inflation-corporate-profitability-pakistan/main';
const LOCAL = process.env.RESEARCH_REPO;
const OUT = 'content/research';

async function get(file) {
  if (LOCAL) return readFile(path.join(LOCAL, file), 'utf8');
  const res = await fetch(`${RAW}/${file}`);
  if (!res.ok) throw new Error(`${file}: HTTP ${res.status}`);
  return res.text();
}

// small CSV parser: handles quoted fields with commas; numbers become numbers
function csv(text) {
  const rows = [];
  let row = [], field = '', quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') { field += '"'; i++; }
      else if (c === '"') quoted = false;
      else field += c;
    } else if (c === '"') quoted = true;
    else if (c === ',') { row.push(field); field = ''; }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++;
      row.push(field); rows.push(row); row = []; field = '';
    } else field += c;
  }
  if (field || row.length) { row.push(field); rows.push(row); }
  const [head, ...body] = rows.filter((r) => r.some((v) => v !== ''));
  return body.map((r) =>
    Object.fromEntries(head.map((h, i) => {
      const v = r[i] ?? '';
      const n = Number(v);
      return [h || 'label', v !== '' && Number.isFinite(n) ? n : v];
    })),
  );
}

// Python's json writer emits NaN/Infinity, which JSON doesn't allow; read them as null (no value)
const json = (text) => JSON.parse(text.replace(/\bNaN\b/g, 'null').replace(/-?\bInfinity\b/g, 'null'));

const files = {
  'deck.json': ['presentation/deck_data.json', json],
  'key-results.json': ['outputs/logs/key_results.json', json],
  'annual.json': ['outputs/tables/table5_annual_summary.csv', csv],
  'sectors.json': ['outputs/tables/table13_sector_slopes.csv', csv],
  'by-sector.json': ['outputs/tables/table2_by_sector.csv', csv],
  'thresholds.json': ['outputs/tables/table9b_threshold_sensitivity.csv', csv],
  'regimes.json': ['outputs/tables/table4_by_inflation_regime.csv', csv],
};

await mkdir(OUT, { recursive: true });
for (const [name, [file, parse]] of Object.entries(files)) {
  const data = parse(await get(file));
  await writeFile(path.join(OUT, name), JSON.stringify(data, null, 2) + '\n');
  console.log(`${name.padEnd(18)} <- ${file}`);
}
await writeFile(
  path.join(OUT, 'SOURCE.md'),
  `Snapshot of numbers from https://github.com/abdulhaseeb707/inflation-corporate-profitability-pakistan (branch main).\n` +
    `Made by scripts/sync-research.mjs on ${new Date().toISOString().slice(0, 10)}. Do not edit by hand.\n`,
);
