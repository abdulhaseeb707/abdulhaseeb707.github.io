// Draws the PNG icons from public/favicon.svg at build time (npm run assets); generated files are gitignored.
// - public/icons/icon-96.png: what Google shows next to the site in results (a multiple of 48 px)
// - public/icons/apple-touch-icon.png: iPhone home-screen icon (180 px, square corners: iOS rounds them itself)
// - public/favicon.ico: for browsers and crawlers that ask for /favicon.ico (one 48 px PNG inside an ICO file)
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import sharp from 'sharp';

const svg = readFileSync('public/favicon.svg', 'utf8');
const square = svg.replace(/rx="[\d.]+"/, 'rx="0"');
const png = (source, size) => sharp(Buffer.from(source), { density: 72 * (size / 64) * 2 }).resize(size, size).png({ compressionLevel: 9 }).toBuffer();

mkdirSync('public/icons', { recursive: true });
writeFileSync('public/icons/icon-96.png', await png(svg, 96));
writeFileSync(
  'public/icons/apple-touch-icon.png',
  await sharp(await png(square, 180)).flatten({ background: '#f4f1ea' }).png({ compressionLevel: 9 }).toBuffer(),
);

// ICO: a 6-byte header, one 16-byte directory entry, then the PNG itself
const ico48 = await png(svg, 48);
const header = Buffer.alloc(22);
header.writeUInt16LE(0, 0); // reserved
header.writeUInt16LE(1, 2); // type: icon
header.writeUInt16LE(1, 4); // one image
header.writeUInt8(48, 6); // width
header.writeUInt8(48, 7); // height
header.writeUInt8(0, 8); // no palette
header.writeUInt8(0, 9); // reserved
header.writeUInt16LE(1, 10); // colour planes
header.writeUInt16LE(32, 12); // bits per pixel
header.writeUInt32LE(ico48.length, 14); // image size
header.writeUInt32LE(22, 18); // image offset
writeFileSync('public/favicon.ico', Buffer.concat([header, ico48]));

console.log('icons: public/icons/icon-96.png, public/icons/apple-touch-icon.png, public/favicon.ico');
