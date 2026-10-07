// Externe links openen in een nieuw tabblad. Gebruikt door de Sätteri-plugin
// in astro.config.mjs (markdown) en door scripts/check-dist.mjs (controle).
//
// Extern: een http(s)-link waarvan de host niet gladvisor.nl of
// www.gladvisor.nl is. mailto, tel, ankers en relatieve links zijn niet extern.

const siteHosts = new Set(['gladvisor.nl', 'www.gladvisor.nl']);

export function isExternalUrl(href) {
  if (typeof href !== 'string' || !/^https?:\/\//i.test(href)) return false;
  try {
    return !siteHosts.has(new URL(href).hostname.toLowerCase());
  } catch {
    return false;
  }
}

export const newTabLabel = ' (opent in nieuw tabblad)';

// Hast-plugin voor Sätteri: target="_blank", rel="noopener" en een verborgen
// melding voor schermlezers (klasse visually-hidden uit global.css).
export const externalLinksPlugin = {
  name: 'external-links',
  element: {
    filter: ['a'],
    visit(node, ctx) {
      if (!isExternalUrl(node.properties?.href)) return;
      ctx.setProperty(node, 'target', '_blank');
      ctx.setProperty(node, 'rel', ['noopener']);
      ctx.appendChild(node, {
        type: 'element',
        tagName: 'span',
        properties: { className: ['visually-hidden'] },
        children: [{ type: 'text', value: newTabLabel }],
      });
    },
  },
};
