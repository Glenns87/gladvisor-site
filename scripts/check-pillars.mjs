// Controleert dat pillar (blog) en services (cases) naar een service van
// type pijler verwijzen. Zod kan dat niet zelf: een reference() wordt pas na
// het laden van alle collecties opgezocht, en dan is het type niet te zien.
//
// Leest de frontmatter rechtstreeks uit src/content/. Id's volgen de regel van
// Astro's glob-loader: pad zonder extensie, zonder /index, of de slug uit de
// frontmatter. Bestandsnamen zijn al kleine letters met koppeltekens.
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

function readCollection(name) {
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

// Een reference staat als string ('seo') of als object ({ collection, id }).
const refId = (ref) => (typeof ref === 'string' ? ref : ref?.id);

const serviceTypes = new Map(readCollection('services').map((s) => [s.id, s.data.type]));
const errors = [];

function check(path, field, ref) {
  const id = refId(ref);
  if (id === undefined) return;
  const type = serviceTypes.get(id);
  // Een niet-bestaande entry meldt sync-strict.mjs al.
  if (type !== undefined && type !== 'pijler') {
    errors.push(`${path}: ${field} verwijst naar '${id}', een service van type '${type}'. Verwijs naar een pijler.`);
  }
}

for (const post of readCollection('blog')) {
  check(post.path, 'pillar', post.data.pillar);
}
for (const item of readCollection('cases')) {
  for (const ref of item.data.services ?? []) check(item.path, 'services', ref);
}

if (errors.length > 0) {
  console.error(errors.join('\n'));
  console.error('\nBuild gestopt: pillar en services moeten naar een pijler verwijzen.');
  process.exit(1);
}
