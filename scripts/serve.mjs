// Serves the built static site (out/) the way the server will, for a local look before publishing.
// usage: npm run build && npm run serve   ->  http://localhost:3000
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';

const OUT = path.resolve('out');
const PORT = Number(process.env.PORT ?? 3000);
const TYPES = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json',
  '.svg': 'image/svg+xml', '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.woff2': 'font/woff2',
  '.pdf': 'application/pdf', '.txt': 'text/plain; charset=utf-8', '.xml': 'application/xml',
};

const isFile = (p) => stat(p).then((s) => s.isFile()).catch(() => false);

createServer(async (req, res) => {
  let p = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
  if (p.endsWith('/')) p += 'index.html';
  let file = path.join(OUT, p);
  if (!file.startsWith(OUT)) return res.writeHead(403).end();
  let status = 200;
  if (!(await isFile(file))) {
    if (await isFile(path.join(file, 'index.html'))) {
      return res.writeHead(301, { location: `${p}/` }).end();
    }
    file = path.join(OUT, '404.html');
    status = 404;
  }
  const body = await readFile(file);
  res.writeHead(status, { 'content-type': TYPES[path.extname(file)] ?? 'application/octet-stream' }).end(body);
}).listen(PORT, () => console.log(`Serving out/ at http://localhost:${PORT}`));
