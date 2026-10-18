// Prints the website's /cv/ page to dist/Abdul-Haseeb-Khan-CV.pdf.
// Runs after `astro build` (npm run build) locally and in GitHub Actions.
// On Linux/CI it needs Playwright's Chromium once: npx playwright install chromium
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { parse } from 'yaml';
import { chromium } from 'playwright';

const DIST = path.resolve('dist');
const OUT = path.join(DIST, 'Abdul-Haseeb-Khan-CV.pdf');
const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
};

// a tiny static server for dist/, so fonts and styles load exactly as on the live site
const server = createServer(async (req, res) => {
  let urlPath = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
  if (urlPath.endsWith('/')) urlPath += 'index.html';
  const file = path.join(DIST, urlPath);
  if (!file.startsWith(DIST)) return res.writeHead(403).end();
  try {
    const body = await readFile(file);
    res.writeHead(200, { 'content-type': TYPES[path.extname(file)] ?? 'application/octet-stream' }).end(body);
  } catch {
    res.writeHead(404).end();
  }
});
await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const { port } = server.address();

const profile = parse(await readFile('src/data/profile.yaml', 'utf8'));
// GitHub Actions (Linux): Playwright's Chromium. Windows: the Microsoft Edge that ships with Windows
// (same Blink engine, nothing to download). Override with CV_BROWSER=chromium|msedge|chrome.
const channel = process.env.CV_BROWSER ?? (process.platform === 'win32' ? 'msedge' : 'chromium');
const browser = await chromium.launch({ channel });
try {
  const page = await browser.newPage();
  await page.goto(`http://127.0.0.1:${port}/cv/`, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);

  // the phone number goes into the PDF only, never into a web page
  if (profile.cv?.showPhone && profile.contact?.phone) {
    await page.evaluate((phone) => {
      const el = document.querySelector('[data-phone]');
      if (el) {
        el.textContent = phone;
        el.hidden = false;
      }
    }, String(profile.contact.phone));
  }

  await page.pdf({ path: OUT, format: 'A4', printBackground: true, preferCSSPageSize: true, tagged: true });
} finally {
  await browser.close();
  server.close();
}

const pdf = await readFile(OUT);
const pages = (pdf.toString('latin1').match(/\/Type\s*\/Page(?!s)/g) ?? []).length;
console.log(`CV written to ${path.relative('.', OUT)}: ${pages} page(s), ${Math.round(pdf.length / 1024)} KB`);
if (pages > 2) console.warn('Warning: the CV is longer than two pages. Shorten the cv: blocks in profile.yaml.');
