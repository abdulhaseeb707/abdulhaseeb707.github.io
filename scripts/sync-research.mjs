// Copies the numbers behind the research charts from the public research repo into content/research/.
// The snapshot is committed, so builds never need the network. Re-run after the research repo changes:
//   npm run sync:research                      (from GitHub)
//   RESEARCH_REPO=../path/to/repo npm run sync:research   (from a local checkout)
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { csv, json } from './csv.mjs';

const RAW = 'https://raw.githubusercontent.com/abdulhaseeb707/inflation-corporate-profitability-pakistan/main';
const LOCAL = process.env.RESEARCH_REPO;
const OUT = 'content/research';

async function get(file) {
  if (LOCAL) return readFile(path.join(LOCAL, file), 'utf8');
  const res = await fetch(`${RAW}/${file}`);
  if (!res.ok) throw new Error(`${file}: HTTP ${res.status}`);
  return res.text();
}


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
