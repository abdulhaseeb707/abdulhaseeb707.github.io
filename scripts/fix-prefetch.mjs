// Runs after every static build (npm run build), before check-site.mjs.
// Next 16.4's export writes a page's prefetch data into a nested folder (cv/__next.cv/__PAGE__.txt), but the
// browser asks for the dotted name (cv/__next.cv.__PAGE__.txt), so every prefetch was a 404. This copies each
// nested file to the name the browser asks for. Safe to delete once Next writes the dotted names itself.
import { copyFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';

const OUT = 'out';
const exists = (p) => stat(p).then(() => true).catch(() => false);

async function filesIn(dir) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await filesIn(full)));
    else out.push(full);
  }
  return out;
}

async function fix(dir) {
  let copied = 0;
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const full = path.join(dir, entry.name);
    if (entry.name.startsWith('__next.')) {
      for (const file of await filesIn(full)) {
        const dotted = [entry.name, ...path.relative(full, file).split(path.sep)].join('.');
        await copyFile(file, path.join(dir, dotted));
        copied++;
      }
    } else if (entry.name !== '_next') {
      copied += await fix(full);
    }
  }
  return copied;
}

if (await exists(OUT)) console.log(`fix-prefetch: copied ${await fix(OUT)} prefetch file(s) to their dotted names`);
