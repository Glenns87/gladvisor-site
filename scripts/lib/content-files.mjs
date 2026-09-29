// Leest de frontmatter van de markdown-bestanden in src/content/<collectie>/
// zonder Astro te starten. Gebruikt door scripts/check-pillars.mjs en het
// sitemapfilter in astro.config.mjs.
//
// Id's volgen de regel van Astro's glob-loader: pad zonder extensie, zonder
// /index, of de slug uit de frontmatter. Bestandsnamen zijn al kleine letters
// met koppeltekens.
import { readFileSync, readdirSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { parse as parseYaml } from 'yaml';

const contentDir = 'src/content';

function markdownFiles(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return markdownFiles(path);
    return entry.name.endsWith('.md') ? [path] : [];
  });
}

export function readCollection(name) {
  const base = join(contentDir, name);
  return markdownFiles(base).map((path) => {
    const match = readFileSync(path, 'utf8').match(/^---\r?\n([\s\S]*?)\r?\n---/);
    const data = match ? (parseYaml(match[1]) ?? {}) : {};
    const id = data.slug
      ? String(data.slug)
      : relative(base, path)
          .split(sep)
          .join('/')
          .replace(/\.md$/, '')
          .replace(/\/index$/, '')
          .toLowerCase();
    return { id, path, data };
  });
}

// URL-pad per entry, gelijk aan de routes in src/pages/.
const pathFor = {
  services: (id) => `/${id}/`,
  cases: (id) => `/cases/${id}/`,
  blog: (id) => `/blog/${id}/`,
  pages: (id) => (id === 'home' ? '/' : `/${id}/`),
};

// Paden van entries met noindex: true, voor het sitemapfilter.
export function noindexPaths() {
  return Object.entries(pathFor).flatMap(([collection, toPath]) =>
    readCollection(collection)
      .filter((entry) => entry.data.noindex === true)
      .map((entry) => toPath(entry.id)),
  );
}
