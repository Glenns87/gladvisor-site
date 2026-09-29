# Werkafspraken gladvisor.nl

Website van Gladvisor B.V. (Glenn Snel, freelance SEO-specialist). Astro 7, TypeScript strict, geen UI-framework, gehost op Vercel.

## Bron van waarheid

- `docs/bouwplan.md` is de bron van waarheid. Wijk er niet van af zonder het eerst te vragen.
- Bij twijfel: stoppen en vragen.

## Tekst

- Alle teksten in het Nederlands.
- Geen Title Case in koppen: alleen de eerste letter en eigennamen met een hoofdletter.
- Spaarzaam met gedachtestreepjes.
- Niet overdrijven: geen superlatieven of beloftes die niet te onderbouwen zijn.

## Huisstijl

- Gebruik alleen tokens uit `src/styles/tokens.css`, geen losse kleurwaarden.
- Geen schaduwen, geen gekleurde balken over de volle breedte.
- Structuur uit hairlines, witruimte en gouden nummers.
- Goud (`--gold`, #C9A227) nooit voor kleine lopende tekst of links (contrast). Links en knoptekst in `--ink`, met gouden onderstreping of rand.
- Arial als enig lettertype, geen webfonts.

## Techniek

- Alle content server-side gerenderd; geen content die alleen via JavaScript laadt.
- Content staat in `src/content/` en `src/data/site.yaml`, gevalideerd door `src/content.config.ts`.
- Haal content op met `getPublished()` uit `src/lib/content.ts`, niet met `getCollection()`, zodat drafts niet worden gebouwd.
- Een `reference()` naar een entry die niet bestaat laat de build falen via `scripts/sync-strict.mjs`. Haal die stap niet uit het build-script.
- `pillar` (blog) en `services` (cases) moeten naar een service van type pijler wijzen; `scripts/check-pillars.mjs` controleert dat na de sync.
- Na `astro build` controleert `scripts/check-dist.mjs` de sitemap, canonicals, JSON-LD, één h1 per pagina en dat er geen `<script>` anders dan JSON-LD in de HTML staat. Haal die stap niet uit het build-script.
- JSON-LD alleen via `src/components/Schema.astro` (opbouw in `src/lib/schema.ts`), aangeroepen vanuit de Base-layout.
- URL's: kleine letters, koppeltekens, altijd een afsluitende slash.
- Domein: https://www.gladvisor.nl (met www). Absolute URL's komen uit `site` in `astro.config.mjs`; nergens `gladvisor.nl` zonder www hardcoderen.

## Inhoudelijke afspraken

- Geen tarieven op de site.
- Online Advertising Europe nergens noemen.
- Het KPN-logo staat uit (`visible: false` in `src/data/site.yaml`) tot het contract het toelaat.

## Werkwijze

- Kleine, logische commits met een duidelijke boodschap.
- Na elke taak de build draaien: `npm run build`. Die draait ook `astro check`.
