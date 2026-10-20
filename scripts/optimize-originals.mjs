// Shrink the owner's full-size originals into assets/ (npm run photos).
// The originals live outside the code, in the owner's folder next to it (Desktop\Portfolio: "2 Photos",
// "3 Certificates", ...; see AGENTS.md). Set MATERIALS to use another folder.
// - longest edge capped at 2400px (npm run assets makes the smaller WebP sizes)
// - orientation fixed from EXIF, then ALL metadata dropped (phone photos carry GPS location)
// Re-run after adding a new original to the map below; npm run assets then makes the WebP versions.
import sharp from 'sharp';
import { mkdir, stat } from 'node:fs/promises';
import path from 'node:path';

const SRC = process.env.MATERIALS ?? '..';
const MAX = 2400;

// original file (inside the owner's folder) -> destination inside assets/
const iofs = '2 Photos/IOFS 2025 - Krasnoyarsk';
const ify = '2 Photos/Festival of Youth 2026 - Ekaterinburg';
const files = {
  '2 Photos/Portrait/Portrait.jpeg': 'photos/portrait.jpg',
  [`${iofs}/2025-09-28 Arrival at Krasnoyarsk airport.jpg`]: 'photos/iofs-2025-arrival-krasnoyarsk.jpg',
  [`${iofs}/2025-09-28 Campus at night.jpg`]: 'photos/iofs-2025-campus-night.jpg',
  [`${iofs}/2025-09-29 Team kit.jpg`]: 'photos/iofs-2025-team-kit.jpg',
  [`${iofs}/2025-09-30 Press wall.jpg`]: 'photos/iofs-2025-press-wall.jpg',
  [`${iofs}/2025-10-01 At the podium.jpg`]: 'photos/iofs-2025-podium.jpg',
  [`${iofs}/2025-10-01 Evening walk.jpg`]: 'photos/iofs-2025-evening-walk.jpg',
  [`${iofs}/2025-10-01 Medal and kit.jpg`]: 'photos/iofs-2025-medal-and-kit.jpg',
  [`${iofs}/Diploma on stage with the flag.png`]: 'photos/iofs-2025-award-stage.png',
  [`${ify}/2026-09-12 Znanie pavilion.jpg`]: 'photos/ify-2026-znanie-pavilion.jpg',
  [`${ify}/2026-09-13 Flag plaza.jpg`]: 'photos/ify-2026-flag-avenue.jpg',
  [`${ify}/2026-09-14 Alabuga robot.jpg`]: 'photos/ify-2026-alabuga-robot.jpg',
  [`${ify}/2026-09-14 Kaspersky city model.jpg`]: 'photos/ify-2026-kaspersky-model.jpg',
  [`${ify}/2026-09-16 My presentation.jpg`]: 'photos/ify-2026-znanie-presentation.jpg',
  '3 Certificates/IOFS 2025 - Diploma (II degree).png': 'certificates/iofs-2025-diploma.png',
  '3 Certificates/World Bank Youth Summit 2026 - delegate certificate.png': 'certificates/world-bank-youth-summit-2026.png',
  '3 Certificates/State Bank of Pakistan 2026 - SMEs and access to finance.png': 'certificates/sbp-smes-access-to-finance-2026.png',
  "3 Certificates/Financial Security Dictation 2026 - Winner's Diploma.jpg": 'certificates/dictation-2026-winners-diploma.jpg',
  '3 Certificates/World Economics Association 2026 - membership certificate.png': 'certificates/wea-membership-2026.png',
};

const kb = (bytes) => `${Math.round(bytes / 1024)} KB`;

for (const [from, to] of Object.entries(files)) {
  const input = path.join(SRC, from);
  const output = path.join('assets', to);
  await mkdir(path.dirname(output), { recursive: true });

  let image = sharp(input).rotate().resize({ width: MAX, height: MAX, fit: 'inside', withoutEnlargement: true });
  image = output.endsWith('.png')
    ? image.png({ compressionLevel: 9, palette: false })
    : image.jpeg({ quality: 82, mozjpeg: true });
  const info = await image.toFile(output);

  const before = (await stat(input)).size;
  console.log(`${path.basename(from).padEnd(48)} ${kb(before).padStart(9)} -> ${to} ${info.width}x${info.height} ${kb(info.size)}`);
}
