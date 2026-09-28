// Hoofdnavigatie volgens docs/bouwplan.md (Header).
export const mainNav = [
  { label: 'SEO', href: '/seo/' },
  { label: 'CRO', href: '/cro/' },
  { label: 'AI-zichtbaarheid', href: '/ai-zichtbaarheid/' },
  { label: 'Cases', href: '/cases/' },
  { label: 'Over', href: '/over/' },
] as const;

// Korte naam van een pijler voor eyebrows, bijv. 'DIENST · SEO'.
export function pillarLabel(id: string): string {
  const root = id.split('/')[0];
  return mainNav.find((item) => item.href === `/${root}/`)?.label ?? root;
}

// Pad met afsluitende slash voor een entry-id, bijv. 'seo/seo-audit' -> '/seo/seo-audit/'.
export const servicePath = (id: string) => `/${id}/`;
export const casePath = (id: string) => `/cases/${id}/`;
export const blogPath = (id: string) => `/blog/${id}/`;
