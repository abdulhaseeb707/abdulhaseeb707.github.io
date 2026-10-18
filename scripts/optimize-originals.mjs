// One-time: shrink the full-size originals in _archive/originals into src/assets.
// - longest edge capped at 2400px (Astro makes the smaller responsive sizes at build time)
// - orientation fixed from EXIF, then ALL metadata dropped (phone photos carry GPS location)
// Re-run with `npm run photos` after adding a new original to the map below.
import sharp from 'sharp';
import { mkdir, stat } from 'node:fs/promises';
import path from 'node:path';

const SRC = '_archive/originals';
const MAX = 2400;

// original file -> destination inside src/assets
const files = {
  'Profile.jpeg': 'photos/portrait.jpg',
  '20250928_193054.jpg': 'photos/iofs-2025-arrival-krasnoyarsk.jpg',
  '20250928_224520.jpg': 'photos/iofs-2025-campus-night.jpg',
  '20250929_091010.jpg': 'photos/iofs-2025-team-kit.jpg',
  '20250930_114414.jpg': 'photos/iofs-2025-press-wall.jpg',
  '20251001_132323.jpg': 'photos/iofs-2025-podium.jpg',
  '20251001_194755.jpg': 'photos/iofs-2025-evening-walk.jpg',
  '20251001_223358.jpg': 'photos/iofs-2025-medal-and-kit.jpg',
  'IOFS.png': 'photos/iofs-2025-award-stage.png',
  '20260912_192838.jpg': 'photos/ify-2026-znanie-pavilion.jpg',
  '20260913_132814.jpg': 'photos/ify-2026-flag-avenue.jpg',
  '20260914_135244.jpg': 'photos/ify-2026-alabuga-robot.jpg',
  '20260914_190514.jpg': 'photos/ify-2026-kaspersky-model.jpg',
  '20260916_135348.jpg': 'photos/ify-2026-znanie-presentation.jpg',
  'IOFS Cert.png': 'certificates/iofs-2025-diploma.png',
  'WB.png': 'certificates/world-bank-youth-summit-2026.png',
  'SBP.png': 'certificates/sbp-smes-access-to-finance-2026.png',
};

const kb = (bytes) => `${Math.round(bytes / 1024)} KB`;

for (const [from, to] of Object.entries(files)) {
  const input = path.join(SRC, from);
  const output = path.join('src/assets', to);
  await mkdir(path.dirname(output), { recursive: true });

  let image = sharp(input).rotate().resize({ width: MAX, height: MAX, fit: 'inside', withoutEnlargement: true });
  image = output.endsWith('.png')
    ? image.png({ compressionLevel: 9, palette: false })
    : image.jpeg({ quality: 82, mozjpeg: true });
  const info = await image.toFile(output);

  const before = (await stat(input)).size;
  console.log(`${from.padEnd(22)} ${kb(before).padStart(9)} -> ${to} ${info.width}x${info.height} ${kb(info.size)}`);
}
