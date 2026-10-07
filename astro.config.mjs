// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { satteri } from '@astrojs/markdown-satteri';
import { noindexPaths } from './scripts/lib/content-files.mjs';
import { externalLinksPlugin } from './scripts/lib/external-links.mjs';

const site = 'https://www.gladvisor.nl';

// Niet in de sitemap: noindex-pagina's, /stijlgids/ en de 404.
const excluded = new Set(['/stijlgids/', '/404/', ...noindexPaths()]);

export default defineConfig({
  site,
  trailingSlash: 'always',
  markdown: {
    // Sätteri is de standaardverwerker van Astro 7. Externe links in markdown
    // openen in een nieuw tabblad met rel=noopener (zie scripts/lib/external-links.mjs).
    processor: satteri({ hastPlugins: [externalLinksPlugin] }),
  },
  integrations: [
    sitemap({
      filter: (page) => !excluded.has(new URL(page).pathname),
    }),
  ],
});
