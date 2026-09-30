import { getEntry } from 'astro:content';

// Gedeelde gegevens uit src/data/site.yaml.
export async function getSite() {
  const entry = await getEntry('site', 'site');
  if (!entry) throw new Error('src/data/site.yaml ontbreekt of is ongeldig');
  return entry.data;
}

// mailto-link met onderwerp, bijv. mailtoHref(site.contact.mail, 'Kennismaking').
export function mailtoHref(mail: string, subject?: string): string {
  return subject ? `mailto:${mail}?subject=${encodeURIComponent(subject)}` : `mailto:${mail}`;
}
