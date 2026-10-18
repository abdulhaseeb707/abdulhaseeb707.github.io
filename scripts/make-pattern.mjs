// Builds a seamless "doodle wallpaper" tile (WhatsApp-style) from small economist-themed line drawings.
// Runs before every build (npm run assets). usage: node scripts/make-pattern.mjs [out.svg] [opacity]
import { writeFileSync } from 'node:fs';

const [out = 'app/pattern.svg', opacityArg] = process.argv.slice(2);
const OPACITY = Number(opacityArg ?? 0.105);
const TILE = 640;
const CELLS = 10; // 10 x 10 cells of 64px
const CELL = TILE / CELLS;

// each doodle is drawn in a 40 x 40 box, centred on 20,20; strokes only
const d = {
  crescent: '<path d="M27 7a14 14 0 1 0 0 26a11 11 0 1 1 0-26z"/>',
  fullMoon: '<circle cx="20" cy="20" r="12"/><circle cx="16" cy="16" r="2.5"/><circle cx="24" cy="23" r="1.6"/><circle cx="17" cy="25" r="1.2"/>',
  halfMoon: '<circle cx="20" cy="20" r="12"/><path d="M20 8a12 12 0 0 1 0 24"/><path d="M22 12v16M25 13.5v13M28 16v8"/>',
  sparkle: '<path d="M20 7c1 8 3 11 13 13c-10 2-12 5-13 13c-1-8-3-11-13-13c10-2 12-5 13-13z"/>',
  dots: '<circle cx="12" cy="24" r="1.6"/><circle cx="20" cy="16" r="1.6"/><circle cx="28" cy="22" r="1.6"/><circle cx="22" cy="28" r="1.2"/>',
  lineChart: '<path d="M8 8v24h26"/><path d="M11 27l7-7 5 4 9-12"/><circle cx="32" cy="12" r="1.4"/>',
  barChart: '<path d="M8 32h26"/><path d="M11 32v-8M17 32v-14M23 32v-10M29 32v-18"/>',
  pie: '<circle cx="20" cy="20" r="12"/><path d="M20 20V8M20 20l10 7"/>',
  percent: '<circle cx="13" cy="13" r="4"/><circle cx="27" cy="27" r="4"/><path d="M29 10L11 30"/>',
  supplyDemand: '<path d="M8 8v24h26"/><path d="M11 12c6 2 13 9 20 17"/><path d="M11 29c7-4 13-10 20-18"/>',
  coins: '<ellipse cx="20" cy="12" rx="10" ry="3.5"/><path d="M10 12v5c0 2 4.5 3.5 10 3.5s10-1.5 10-3.5v-5M10 17v5c0 2 4.5 3.5 10 3.5s10-1.5 10-3.5v-5M10 22v5c0 2 4.5 3.5 10 3.5s10-1.5 10-3.5v-5"/>',
  globe: '<circle cx="20" cy="20" r="12"/><ellipse cx="20" cy="20" rx="5" ry="12"/><path d="M8 20h24M10 14h20M10 26h20"/>',
  scale: '<path d="M20 8v24M13 32h14M9 13h22"/><path d="M9 13l-4 9h8zM31 13l-4 9h8z"/>',
  candles: '<path d="M12 8v24M20 11v19M28 6v22"/><rect x="10" y="13" width="4" height="10" rx="1"/><rect x="18" y="16" width="4" height="8" rx="1"/><rect x="26" y="10" width="4" height="12" rx="1"/>',
  magnifier: '<circle cx="17" cy="17" r="8"/><path d="M23 23l9 9"/>',
  book: '<path d="M20 12c-4-3-9-3-13-2v20c4-1 9-1 13 2c4-3 9-3 13-2V10c-4-1-9-1-13 2zM20 12v20"/>',
  sigma: '<path d="M30 9H11l10 11-10 11h19"/>',
  trend: '<path d="M7 29l9-9 6 5 11-12"/><path d="M27 13h6v6"/>',
  orbit: '<circle cx="20" cy="20" r="6"/><ellipse cx="20" cy="20" rx="15" ry="5" transform="rotate(-20 20 20)"/>',
  grid: '<rect x="9" y="9" width="22" height="22" rx="2"/><path d="M9 16.3h22M9 23.6h22M16.3 9v22M23.6 9v22"/>',
  delta: '<path d="M20 9L32 31H8z"/>',
  calculator: '<rect x="11" y="7" width="18" height="26" rx="2"/><rect x="14" y="10" width="12" height="5"/><path d="M15 20h.01M20 20h.01M25 20h.01M15 24.5h.01M20 24.5h.01M25 24.5h.01M15 29h.01M20 29h10"/>',
  star: '<path d="M20 9l3 7 7 .6-5.4 4.6 1.7 7-6.3-3.8-6.3 3.8 1.7-7L10 16.6l7-.6z"/>',
  tinyDots: '<circle cx="14" cy="14" r="1"/><circle cx="26" cy="12" r="1.3"/><circle cx="20" cy="27" r="1"/>',
};
const names = Object.keys(d);

// seeded random so the tile is the same every build
let seed = 20261018;
const rnd = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;

let body = '';
for (let row = 0; row < CELLS; row++) {
  for (let col = 0; col < CELLS; col++) {
    const name = names[Math.floor(rnd() * names.length)];
    const scale = 0.5 + rnd() * 0.24;
    const rot = Math.round((rnd() - 0.5) * 60);
    // jitter inside the cell, keeping a margin so nothing crosses the tile edge
    const x = col * CELL + 8 + rnd() * (CELL - 16 - 40 * scale);
    const y = row * CELL + 8 + rnd() * (CELL - 16 - 40 * scale);
    body += `<g transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(${scale.toFixed(2)}) rotate(${rot} 20 20)">${d[name]}</g>`;
  }
}

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${TILE}" height="${TILE}" viewBox="0 0 ${TILE} ${TILE}"><g fill="none" stroke="#111a2b" stroke-opacity="${OPACITY}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${body}</g></svg>`;
writeFileSync(out, svg);
console.log(`wrote ${out}: ${Math.round(svg.length / 1024)} KB, ${CELLS * CELLS} doodles`);
