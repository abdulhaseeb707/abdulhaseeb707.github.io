import type { NextConfig } from 'next';

// NEXT_OUTPUT=standalone builds a Node server (for the Oracle Cloud server).
// Anything else builds plain static files into out/ (for GitHub Pages).
const standalone = process.env.NEXT_OUTPUT === 'standalone';

const config: NextConfig = {
  output: standalone ? 'standalone' : 'export',
  trailingSlash: true,
  images: { unoptimized: true },
  serverExternalPackages: ['@react-pdf/renderer'],
  poweredByHeader: false,
};

export default config;
