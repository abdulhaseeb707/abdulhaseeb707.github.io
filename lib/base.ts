// The folder the site is served from. Empty for the real site (abdulhaseebkhan.online/);
// set NEXT_BASE_PATH=/portfolio-preview to build a copy that lives in a sub-folder (a preview address).
// Next.js adds it to <Link>, fonts and scripts itself; withBase() is for plain <a>/<img> paths.
export const BASE = (process.env.NEXT_BASE_PATH ?? '').replace(/\/$/, '');

export const withBase = (path: string) => (path.startsWith('/') ? `${BASE}${path}` : path);
