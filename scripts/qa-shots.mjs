// Screenshots of the built site (out/) at the nine screen sizes in AGENTS.md, plus a few layout checks.
// usage: npm run build && npm run qa [-- outDir]
// Uses the installed Microsoft Edge on Windows, Playwright's Chromium elsewhere.
import { createServer } from 'node:http';
import { readFile, mkdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';

const OUT = path.resolve('out');
const SHOTS = path.resolve(process.argv[2] ?? 'qa-shots');
const SIZES = [
  [360, 740], [390, 844], [768, 1024], [1024, 768], [1366, 657], [1536, 695], [1920, 969], [2560, 1329], [3440, 1329],
];
const PAGES = ['/', '/research/inflation-profitability/', '/cv/'];
const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.woff2': 'font/woff2', '.pdf': 'application/pdf', '.txt': 'text/plain', '.png': 'image/png', '.jpg': 'image/jpeg' };

const server = createServer(async (req, res) => {
  let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  if (p.endsWith('/')) p += 'index.html';
  let file = path.join(OUT, p);
  if (!file.startsWith(OUT)) return res.writeHead(403).end();
  if (!(await stat(file).catch(() => null))?.isFile()) file = path.join(OUT, '404.html');
  res.writeHead(200, { 'content-type': TYPES[path.extname(file)] ?? 'application/octet-stream' }).end(await readFile(file));
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const base = `http://127.0.0.1:${server.address().port}`;

await mkdir(SHOTS, { recursive: true });
const browser = await chromium.launch({ channel: process.platform === 'win32' ? 'msedge' : 'chromium' });
const report = [];
try {
  for (const [w, h] of SIZES) {
    const page = await browser.newPage({ viewport: { width: w, height: h } });
    for (const p of PAGES) {
      await page.goto(base + p, { waitUntil: 'networkidle' });
      // full-page shots never scroll, so show the fade-in elements and load lazy images up front
      await page.addStyleTag({ content: '.js .reveal{opacity:1!important;transform:none!important}' });
      await page.evaluate(() => document.querySelectorAll('img[loading="lazy"]').forEach((i) => (i.loading = 'eager')));
      await page.evaluate(() => document.fonts.ready);
      await page.waitForTimeout(1300); // the dot moon draws in ~1.1s
      const m = await page.evaluate(() => {
        const vis = (el) => { const r = el.getBoundingClientRect(); return el.offsetParent !== null && r.top >= 0 && r.bottom <= innerHeight; };
        const h1 = document.querySelector('h1');
        return {
          overflowX: document.documentElement.scrollWidth - innerWidth,
          h1: h1 ? Math.round(parseFloat(getComputedStyle(h1).fontSize)) : null,
          cvOnFirstScreen: [...document.querySelectorAll('a[download]')].some(vis),
        };
      });
      report.push({ size: `${w}x${h}`, page: p, ...m });
      const name = `${(p.replace(/\W+/g, '-').replace(/^-|-$/g, '') || 'home')}_${w}x${h}.png`;
      await page.screenshot({ path: path.join(SHOTS, name), fullPage: w <= 1536 && p === '/' });
    }
    await page.close();
  }
} finally {
  await browser.close();
  server.close();
}
console.table(report);
const bad = report.filter((r) => r.overflowX > 0 || !r.cvOnFirstScreen);
if (bad.length) {
  console.error(`Layout problems: ${bad.map((b) => `${b.page} @ ${b.size}`).join(', ')}`);
  process.exitCode = 1;
}
console.log(`Screenshots in ${SHOTS}`);
