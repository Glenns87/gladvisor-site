import { getEntry } from 'astro:content';

// Gedeelde gegevens uit src/data/site.yaml.
export async function getSite() {
  const entry = await getEntry('site', 'site');
  if (!entry) throw new Error('src/data/site.yaml ontbreekt of is ongeldig');
  return entry.data;
}
