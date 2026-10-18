import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://abdulhaseeb707.github.io',
  integrations: [
    sitemap({
      // the CV page is a print layout for the PDF, not a page to land on from search
      filter: (page) => !page.endsWith('/cv/'),
    }),
  ],
});
