// Makes WebP versions of every image in assets/ (runs before dev and build: npm run assets).
// Writes public/img/<folder>/<name>-<width>.webp and content/generated/images.json, which <Photo> reads.
// Skips files that are already up to date, so it is fast after the first run.
import sharp from 'sharp';
import { readdir, mkdir, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';

const SRC = 'assets';
const OUT = 'public/img';
const WIDTHS = [480, 960, 1600];

const mtime = (file) => stat(file).then((s) => s.mtimeMs).catch(() => 0);
const manifest = {};
let made = 0;

for (const folder of (await readdir(SRC, { withFileTypes: true })).filter((d) => d.isDirectory()).map((d) => d.name)) {
  await mkdir(path.join(OUT, folder), { recursive: true });
  for (const file of await readdir(path.join(SRC, folder))) {
    if (!/\.(jpe?g|png|webp)$/i.test(file)) continue;
    const input = path.join(SRC, folder, file);
    const { width, height } = await sharp(input).metadata();
    const base = file.replace(/\.[^.]+$/, '');
    // the standard widths that are smaller than the original, plus the original width itself (never upscale)
    const widths = [...new Set([...WIDTHS.filter((w) => w < width), Math.min(width, WIDTHS.at(-1))])].sort((a, b) => a - b);
    const variants = [];
    for (const w of widths) {
      const name = `${base}-${w}.webp`;
      const out = path.join(OUT, folder, name);
      if ((await mtime(out)) < (await mtime(input))) {
        await sharp(input).resize({ width: w, withoutEnlargement: true }).webp({ quality: 80 }).toFile(out);
        made++;
      }
      variants.push({ w, src: `/img/${folder}/${name}` });
    }
    manifest[`${folder}/${file}`] = {
      width,
      height,
      src: variants.at(-1).src,
      srcSet: variants.map((v) => `${v.src} ${v.w}w`).join(', '),
    };
  }
}

await mkdir('content/generated', { recursive: true });
await writeFile('content/generated/images.json', JSON.stringify(manifest, null, 2) + '\n');
console.log(`images: ${Object.keys(manifest).length} sources, ${made} new WebP files`);
