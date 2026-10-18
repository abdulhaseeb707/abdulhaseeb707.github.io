// Reads the WebP manifest written by scripts/optimize-images.mjs (npm run assets).
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { BASE } from './base';

export type Img = { src: string; srcSet: string; width: number; height: number };

let manifest: Record<string, Img> | undefined;

export function img(key: string): Img {
  manifest ??= JSON.parse(readFileSync(path.join(process.cwd(), 'content', 'generated', 'images.json'), 'utf8'));
  const found = manifest![key];
  if (!found) {
    throw new Error(`"${key}" is not in assets/ (or npm run assets has not run). Check the path in content/profile.yaml.`);
  }
  // paths in the manifest start at the site root; add the folder prefix for preview builds
  return BASE ? { ...found, src: BASE + found.src, srcSet: found.srcSet.replace(/(^|, )\//g, `$1${BASE}/`) } : found;
}
