// Controleert de gebouwde site in dist/ na `astro build`. De build faalt als:
// - de sitemap een noindex-pagina, /stijlgids/ of de 404 bevat, of een
//   indexeerbare pagina mist;
// - een pagina in de sitemap geen canonical naar zichzelf heeft;
// - een JSON-LD-blok geen geldige JSON is of verplichte velden mist;
// - een pagina niet precies één h1 heeft;
// - er een <script> in de HTML staat anders dan JSON-LD (alles server-side).
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

const dist = 'dist';
const site = 'https://gladvisor.nl';
const errors = [];
const fail = (message) => errors.push(message);

function htmlFiles(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return htmlFiles(path);
    return entry.name.endsWith('.html') ? [path] : [];
  });
}

// dist/seo/index.html -> /seo/, dist/404.html -> /404/
function pathOf(file) {
  const rel = relative(dist, file).split(sep).join('/');
  if (rel === 'index.html') return '/';
  return `/${rel.replace(/(\/index)?\.html$/, '')}/`;
}

const pages = new Map(htmlFiles(dist).map((file) => [pathOf(file), readFileSync(file, 'utf8')]));

// Sitemap
const sitemapFiles = readdirSync(dist).filter((name) => /^sitemap-\d+\.xml$/.test(name));
if (!existsSync(join(dist, 'sitemap-index.xml')) || sitemapFiles.length === 0) fail('sitemap ontbreekt');
const sitemapPaths = new Set(
  sitemapFiles.flatMap((name) =>
    [...readFileSync(join(dist, name), 'utf8').matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname),
  ),
);

const isNoindex = (html) => /<meta name="robots" content="[^"]*noindex/.test(html);

for (const [path, html] of pages) {
  const inSitemap = sitemapPaths.has(path);
  if (isNoindex(html) || path === '/stijlgids/' || path === '/404/') {
    if (inSitemap) fail(`${path} staat in de sitemap, maar hoort er niet in`);
  } else {
    if (!inSitemap) fail(`${path} is indexeerbaar maar ontbreekt in de sitemap`);
    const canonical = html.match(/<link rel="canonical" href="([^"]+)"/)?.[1];
    if (canonical !== `${site}${path}`) fail(`${path}: canonical is ${canonical ?? 'leeg'}`);
  }

  const h1s = html.match(/<h1[\s>]/g)?.length ?? 0;
  if (h1s !== 1) fail(`${path}: ${h1s} h1-koppen in plaats van 1`);

  for (const [, attrs] of html.matchAll(/<script([^>]*)>/g)) {
    if (!attrs.includes('application/ld+json')) fail(`${path}: <script${attrs}> gevonden; content moet server-side staan`);
  }

  for (const [, json] of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    let data;
    try {
      data = JSON.parse(json);
    } catch (error) {
      fail(`${path}: JSON-LD is geen geldige JSON (${error.message})`);
      continue;
    }
    if (data['@context'] !== 'https://schema.org') fail(`${path}: JSON-LD mist @context`);
    for (const node of data['@graph'] ?? []) checkNode(path, node);
  }
}

for (const path of sitemapPaths) {
  if (!pages.has(path)) fail(`sitemap verwijst naar ${path}, maar die pagina is niet gebouwd`);
}

// Verplichte velden per type (schema.org en Google-richtlijnen).
function checkNode(path, node) {
  const need = (...keys) => {
    for (const key of keys) if (node[key] === undefined || node[key] === '') fail(`${path}: ${node['@type']} mist ${key}`);
  };
  switch (node['@type']) {
    case 'Organization':
      need('@id', 'name', 'url', 'logo', 'email', 'identifier');
      if ('telephone' in node) fail(`${path}: Organization bevat een telefoonnummer`);
      break;
    case 'Person':
      need('@id', 'name');
      break;
    case 'WebSite':
      need('@id', 'name', 'url');
      break;
    case 'Service':
      need('name', 'provider', 'url');
      break;
    case 'FAQPage':
      need('mainEntity');
      for (const q of node.mainEntity ?? []) {
        if (q['@type'] !== 'Question' || !q.name || !q.acceptedAnswer?.text) fail(`${path}: FAQPage met onvolledige vraag`);
      }
      break;
    case 'Article':
      need('headline', 'datePublished', 'author', 'publisher', 'image');
      break;
    case 'BreadcrumbList':
      need('itemListElement');
      (node.itemListElement ?? []).forEach((item, index) => {
        if (item.position !== index + 1 || !item.name || !item.item?.endsWith('/')) {
          fail(`${path}: BreadcrumbList-item ${index + 1} is onvolledig`);
        }
      });
      break;
    default:
      fail(`${path}: onbekend JSON-LD-type ${node['@type']}`);
  }
}

if (errors.length > 0) {
  console.error(errors.join('\n'));
  console.error('\nBuild gestopt: de gebouwde site voldoet niet aan de SEO-basis (zie hierboven).');
  process.exit(1);
}
console.log(`check-dist: ${pages.size} pagina's gecontroleerd, ${sitemapPaths.size} in de sitemap.`);
