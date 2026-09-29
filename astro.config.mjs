// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { noindexPaths } from './scripts/lib/content-files.mjs';

const site = 'https://gladvisor.nl';

// Niet in de sitemap: noindex-pagina's, /stijlgids/ en de 404.
const excluded = new Set(['/stijlgids/', '/404/', ...noindexPaths()]);

export default defineConfig({
  site,
  trailingSlash: 'always',
  integrations: [
    sitemap({
      filter: (page) => !excluded.has(new URL(page).pathname),
    }),
  ],
});
