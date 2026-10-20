import type { NextConfig } from 'next';

// NEXT_OUTPUT=standalone builds a Node server (for the Oracle Cloud server).
// Anything else builds plain static files into out/ (what the Oracle server serves; see DEPLOY-ORACLE.md).
const standalone = process.env.NEXT_OUTPUT === 'standalone';

const config: NextConfig = {
  output: standalone ? 'standalone' : 'export',
  // NEXT_BASE_PATH=/portfolio-preview builds a copy for a sub-folder address (see lib/base.ts)
  basePath: process.env.NEXT_BASE_PATH ?? '',
  trailingSlash: true,
  images: { unoptimized: true },
  serverExternalPackages: ['@react-pdf/renderer'],
  poweredByHeader: false,
};

export default config;
