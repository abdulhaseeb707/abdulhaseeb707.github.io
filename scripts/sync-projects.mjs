// Copies the numbers behind each project's charts from its public repo into content/projects/<slug>/.
// The snapshot is committed, so builds never need the network. Re-run after a project repo changes:
//   npm run sync:projects                                   (from GitHub)
//   PROJECT_REPO=../path/to/repo npm run sync:projects      (from a local checkout; one project only)
// Only model inputs and results are copied. The cost-optimization repo's company_public_data.csv names the
// company, which the owner keeps off the site, so it is never copied.
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { csv, json } from './csv.mjs';

const projects = {
  'cost-optimization': {
    repo: 'abdulhaseeb707/cost-optimization-linear-programming',
    files: {
      'summary.json': ['results/summary.json', json],
      'allocation.json': ['results/allocation_comparison.csv', csv],
      'scenarios.json': ['results/scenarios.csv', csv],
      'shadow-prices.json': ['results/shadow_prices.csv', csv],
      'alt-fuel-cap.json': ['results/sensitivity_alt_fuel_cap.csv', csv],
      'plants.json': ['data/model_inputs/plants.csv', csv],
      'fuels.json': ['data/model_inputs/fuel_sources.csv', csv],
    },
  },
};

for (const [slug, { repo, files }] of Object.entries(projects)) {
  const local = process.env.PROJECT_REPO;
  const get = async (file) => {
    if (local) return readFile(path.join(local, file), 'utf8');
    const res = await fetch(`https://raw.githubusercontent.com/${repo}/main/${file}`);
    if (!res.ok) throw new Error(`${repo}/${file}: HTTP ${res.status}`);
    return res.text();
  };
  const out = path.join('content', 'projects', slug);
  await mkdir(out, { recursive: true });
  for (const [name, [file, parse]] of Object.entries(files)) {
    await writeFile(path.join(out, name), JSON.stringify(parse(await get(file)), null, 2) + '\n');
    console.log(`${slug}/${name.padEnd(18)} <- ${file}`);
  }
  await writeFile(
    path.join(out, 'SOURCE.md'),
    `Snapshot of numbers from https://github.com/${repo} (branch main).\n` +
      `Made by scripts/sync-projects.mjs on ${new Date().toISOString().slice(0, 10)}. Do not edit by hand.\n`,
  );
}
