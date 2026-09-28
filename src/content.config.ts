import { defineCollection, reference } from 'astro:content';
import { file, glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { parse as parseYaml } from 'yaml';

// Contentmodel volgens docs/bouwplan.md, stap 1.
// De build faalt bij een te lange title of description, een ontbrekend
// verplicht veld of een reference() naar een entry die niet bestaat.

const schemaTypes = z.enum([
  'Organization',
  'Person',
  'WebSite',
  'Service',
  'FAQPage',
  'Article',
  'BreadcrumbList',
]);

// Gedeelde SEO-velden voor alle collecties.
// draft: true betekent niet bouwen; filter via getPublished() in src/lib/content.ts.
const seo = {
  title: z.string().min(1).max(60),
  description: z.string().min(1).max(155),
  noindex: z.boolean().default(false),
  ogImage: z.string().optional(),
  schema: z.array(schemaTypes).default([]),
  draft: z.boolean().default(false),
};

const link = z.object({
  label: z.string().min(1),
  href: z.string().min(1),
});

const formType = z.enum(['seo-quickscan', 'page-review', 'ai-check']);

const markdown = (dir: string) =>
  glob({ pattern: '**/*.md', base: `./src/content/${dir}` });

const services = defineCollection({
  loader: markdown('services'),
  schema: z
    .object({
      ...seo,
      h1: z.string().min(1),
      focusKeyword: z.string().min(1),
      secondaryKeywords: z.array(z.string()).default([]),
      type: z.enum(['pijler', 'sub']),
      pillar: reference('services').optional(),
      hero: z.object({
        statement: z.string().min(1),
        audience: z.string().min(1).optional(),
        ctaPrimary: link,
      }),
      proof: z
        .array(
          z.union([
            reference('cases'),
            z.object({
              label: z.string().min(1),
              value: z.string().min(1),
              source: z.string().min(1).optional(),
            }),
          ]),
        )
        .default([]),
      softConversion: z
        .object({
          label: z.string().min(1),
          description: z.string().min(1),
          formType,
        })
        .optional(),
      faq: z
        .array(z.object({ q: z.string().min(1), a: z.string().min(1) }))
        .default([]),
      related: z
        .array(z.union([reference('services'), reference('blog')]))
        .default([]),
    })
    .refine((data) => data.type !== 'sub' || data.pillar !== undefined, {
      message: 'pillar is verplicht bij type: sub',
      path: ['pillar'],
    })
    .refine((data) => data.type !== 'pijler' || data.pillar === undefined, {
      message: 'een pijler heeft geen pillar',
      path: ['pillar'],
    }),
});

const cases = defineCollection({
  loader: markdown('cases'),
  schema: z.object({
    ...seo,
    client: z.string().min(1),
    sector: z.string().min(1),
    role: z.string().min(1),
    period: z.string().min(1),
    services: z.array(reference('services')).min(1),
    result: z.object({
      metric: z.string().min(1),
      value: z.string().min(1),
      context: z.string().min(1),
    }),
    quote: z
      .object({
        text: z.string().min(1),
        name: z.string().min(1),
        role: z.string().min(1),
      })
      .optional(),
    logo: z.string().optional(),
    featured: z.boolean().default(false),
    order: z.number().int().default(0),
  }),
});

const blog = defineCollection({
  loader: markdown('blog'),
  schema: z.object({
    ...seo,
    h1: z.string().min(1),
    focusKeyword: z.string().min(1),
    pillar: reference('services'),
    publishDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    author: z.string().default('Glenn Snel'),
  }),
});

const pages = defineCollection({
  loader: markdown('pages'),
  schema: z.object({
    ...seo,
    h1: z.string().min(1),
  }),
});

// src/data/site.yaml is één object; het wordt opgeslagen als entry 'site'.
// Ophalen met getEntry('site', 'site').
const site = defineCollection({
  loader: file('src/data/site.yaml', {
    parser: (text) => ({ site: parseYaml(text) }),
  }),
  schema: z.object({
    logos: z.array(
      z.object({
        name: z.string().min(1),
        file: z.string().min(1),
        visible: z.boolean().default(true),
      }),
    ),
    contact: z.object({
      mail: z.email(),
      telefoon: z.string().min(1),
      linkedin: z.url(),
    }),
    kvk: z.string().regex(/^\d{8}$/, 'kvk moet uit 8 cijfers bestaan'),
    werkgebied: z.string().min(1),
    entryOffers: z.object({
      'seo-quickscan': z.object({ titel: z.string().min(1), omschrijving: z.string().min(1) }),
      'page-review': z.object({ titel: z.string().min(1), omschrijving: z.string().min(1) }),
      'ai-check': z.object({ titel: z.string().min(1), omschrijving: z.string().min(1) }),
    }),
  }),
});

export const collections = { services, cases, blog, pages, site };
