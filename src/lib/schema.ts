// Bouwt de JSON-LD-graaf per pagina, volgens docs/bouwplan.md stap 3:
// Organization + Person + WebSite (home), Service (diensten), FAQPage (waar
// een FAQ staat), Article (blog), BreadcrumbList (alle pagina's behalve home).
// Welke typen op een pagina komen, volgt uit het paginatype plus het
// schema-veld in de frontmatter. Uitvoer via src/components/Schema.astro.

export type SchemaType =
  | 'Organization'
  | 'Person'
  | 'WebSite'
  | 'Service'
  | 'FAQPage'
  | 'Article'
  | 'BreadcrumbList';

export interface Crumb {
  name: string;
  path: string;
}

export interface SchemaInput {
  types: SchemaType[];
  breadcrumbs?: Crumb[];
  service?: { name: string; serviceType: string };
  faq?: { q: string; a: string }[];
  article?: { headline: string; published: Date; modified?: Date; author: string };
}

interface Context extends SchemaInput {
  site: URL;
  url: URL;
  title: string;
  description: string;
  image: URL;
  contact: { mail: string; linkedin?: string };
  kvk: string;
}

type Node = Record<string, unknown>;

export function buildGraph(ctx: Context): Node[] {
  const at = (path: string) => new URL(path, ctx.site).href;
  const orgId = at('/#organization');
  const personId = at('/#person');
  const websiteId = at('/#website');
  const sameAs = ctx.contact.linkedin ? [ctx.contact.linkedin] : undefined;

  const orgRef = { '@type': 'Organization', '@id': orgId, name: 'Gladvisor B.V.', url: at('/') };
  const personRef = { '@type': 'Person', '@id': personId, name: 'Glenn Snel', url: at('/over/') };

  const builders: Record<SchemaType, () => Node | undefined> = {
    Organization: () => ({
      '@type': 'Organization',
      '@id': orgId,
      name: 'Gladvisor B.V.',
      alternateName: 'Gladvisor',
      url: at('/'),
      logo: at('/logo.png'),
      email: ctx.contact.mail,
      identifier: { '@type': 'PropertyValue', propertyID: 'KvK', value: ctx.kvk },
      founder: { '@id': personId },
      sameAs,
    }),
    Person: () => ({
      '@type': 'Person',
      '@id': personId,
      name: 'Glenn Snel',
      jobTitle: 'Freelance SEO-specialist',
      url: at('/over/'),
      worksFor: { '@id': orgId },
      sameAs,
    }),
    WebSite: () => ({
      '@type': 'WebSite',
      '@id': websiteId,
      name: 'Gladvisor',
      url: at('/'),
      inLanguage: 'nl-NL',
      publisher: { '@id': orgId },
    }),
    Service: () =>
      ctx.service && {
        '@type': 'Service',
        '@id': `${ctx.url.href}#service`,
        name: ctx.service.name,
        serviceType: ctx.service.serviceType,
        description: ctx.description,
        url: ctx.url.href,
        provider: orgRef,
        areaServed: { '@type': 'Country', name: 'Nederland' },
      },
    FAQPage: () =>
      ctx.faq && ctx.faq.length > 0
        ? {
            '@type': 'FAQPage',
            '@id': `${ctx.url.href}#faq`,
            url: ctx.url.href,
            mainEntity: ctx.faq.map((item) => ({
              '@type': 'Question',
              name: item.q,
              acceptedAnswer: { '@type': 'Answer', text: item.a },
            })),
          }
        : undefined,
    Article: () =>
      ctx.article && {
        '@type': 'Article',
        '@id': `${ctx.url.href}#article`,
        headline: ctx.article.headline,
        description: ctx.description,
        image: ctx.image.href,
        datePublished: ctx.article.published.toISOString(),
        dateModified: (ctx.article.modified ?? ctx.article.published).toISOString(),
        author: ctx.article.author === 'Glenn Snel' ? personRef : { '@type': 'Person', name: ctx.article.author },
        publisher: { ...orgRef, logo: { '@type': 'ImageObject', url: at('/logo.png') } },
        mainEntityOfPage: ctx.url.href,
        inLanguage: 'nl-NL',
      },
    BreadcrumbList: () =>
      ctx.breadcrumbs && ctx.breadcrumbs.length > 0
        ? {
            '@type': 'BreadcrumbList',
            '@id': `${ctx.url.href}#breadcrumb`,
            itemListElement: ctx.breadcrumbs.map((crumb, index) => ({
              '@type': 'ListItem',
              position: index + 1,
              name: crumb.name,
              item: at(crumb.path),
            })),
          }
        : undefined,
  };

  const nodes: Node[] = [];
  for (const type of new Set(ctx.types)) {
    const node = builders[type]();
    if (node === undefined && type !== 'FAQPage') {
      throw new Error(`Schema ${type} gevraagd voor ${ctx.url.pathname}, maar de gegevens ontbreken`);
    }
    if (node) nodes.push(node);
  }
  return nodes;
}

