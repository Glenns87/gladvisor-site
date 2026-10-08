# Bouwplan gladvisor.nl

Bron van waarheid voor de bouw van de nieuwe website van Gladvisor B.V. (Glenn Snel, freelance SEO-specialist). Afgeleid van het plan-document van 26 september 2026.

## Context

- Migratie van WordPress naar Astro op Vercel, content in markdown in de repo, workflow via Claude Code.
- Positionering: SEO-specialist als hoofdterm; CRO en AI-zichtbaarheid als tweede lijn. Strategie en uitvoering in één hand, gestuurd op omzet en relevant verkeer.
- Doelgroep: HR-managers en hirers (interim of freelance rol), ondernemers zonder eigen SEO'er, marketing- en e-commercemanagers.
- Werkgebied: Remote door heel Nederland, (deels) op locatie binnen een uur van Nieuwerkerk aan den IJssel. De verdeling op locatie/remote en de 100 km komen niet meer op de site.
- Vaste afspraken: geen tarieven op de site; Online Advertising Europe nergens noemen; KPN-logo staat uit tot het contract het toelaat; Nederlandse teksten, geen Title Case in koppen, spaarzaam met gedachtestreepjes, niet overdrijven.

## Sitestructuur (topical map)

Regel: commerciële subonderwerpen onder de pijler, informationele in /blog/ met een vaste link omhoog naar de pijler.

| URL | Laag | Focusterm | Launch |
| --- | --- | --- | --- |
| / | home | – | ja |
| /seo/ | pijler | seo specialist | ja |
| /seo/website-migratie/ | sub | seo migratie | ja |
| /seo/seo-audit/ | sub | seo audit, seo analyse | ja |
| /seo/seo-strategie/ | sub | seo strategie | later |
| /cro/ | pijler | conversie optimalisatie | ja |
| /cro/cro-analyse/ | sub | cro analyse | later |
| /ai-zichtbaarheid/ | pijler | generative engine optimization, geo | ja |
| /blog/ | overzicht | – | ja |
| /blog/ai-overviews/ | blog | ai overviews | ja |
| /blog/wat-is-generative-engine-optimization/ | blog | generative engine optimization | ja |
| /blog/ai-seo/ | blog | ai seo | later |
| /blog/ab-testen-kleine-webshops/ | blog | a/b testen | later |
| /cases/ en /cases/<naam>/ | bewijs | – | ja |
| /over/, /contact/, /privacy/ | vast | – | ja |

Cases bij launch: fortune-coffee, horloge-nl, rcn. Logostrip (in deze volgorde): MediaMarkt, Horloge.nl, RCN, Fortune Coffee, Alpine, Bamigo. Fingerspitz, Rinkel en KPN staan op visible: false.

Instapproducten (secundaire conversie): seo-quickscan (op /seo/ en /ai-zichtbaarheid/) en page-review (op /cro/). Beide worden vooraf bekeken en mondeling besproken in een kennismaking van 30 minuten, zonder schriftelijk rapport. Het aparte instapproduct voor AI-zichtbaarheid is vervallen.

## Bouwvoorbereiding

### Stap 1: contentmodel

Collecties in src/content.config.ts met zod. De build moet falen bij een te lange title, een ontbrekend verplicht veld of een verwijzing naar iets dat niet bestaat (gebruik reference()). Ook faalt de build als pillar (blog) of services (cases) naar een service verwijst die geen pijler is.

| Collectie | Map | Inhoud |
| --- | --- | --- |
| services | src/content/services/ | pijlers en subpagina's (seo/index.md, seo/website-migratie.md, ...) |
| cases | src/content/cases/ | klantcases |
| blog | src/content/blog/ | informationele artikelen |
| pages | src/content/pages/ | home, over, contact, privacy |
| site | src/data/site.yaml | gedeelde gegevens |

Gedeelde SEO-velden (alle collecties):

- title: verplicht, max. 60 tekens, patroon 'onderwerp | Gladvisor'
- description: verplicht, max. 155 tekens
- noindex: standaard false
- ogImage: optioneel
- schema: lijst, bijv. Service, FAQPage, Person
- draft: standaard false; drafts worden niet gebouwd

services:

- h1, focusKeyword, secondaryKeywords
- breadcrumbLabel: optioneel, max. 30 tekens; kort label voor de laatste stap van het kruimelpad bij subpagina's (zonder label wordt de h1 gebruikt)
- type: 'pijler' | 'sub'
- pillar: reference naar services (verplicht bij sub)
- hero: statement (de lead, inclusief doelgroep), audience (optioneel, wordt niet los getoond), ctaPrimary { label, href }; label in de hero: 'Plan een kennismaking'
- proof: lijst van reference naar cases en/of { label, value, source (optioneel) }
- softConversion: { label, description, formType: 'seo-quickscan' | 'page-review' }
- faq: lijst van { q, a } (voedt FAQPage-schema)
- related: lijst van reference naar services of blog

cases:

- h1: verplicht; de kop is het resultaat, niet de klantnaam (bijv. 'Websitemigratie naar Shopware zonder SEO-verlies'). Klantnaam en sector staan in de eyebrow.
- client, sector, role, period
- services: lijst van reference naar services van type pijler
- result: { metric, value, context }
- quote: { text, name, role } (optioneel)
- logo, featured, order

blog:

- h1, focusKeyword
- pillar: verplichte reference naar een service van type pijler
- publishDate, updatedDate, author (standaard 'Glenn Snel')

pages:

- h1, eyebrow (optioneel), lead (optioneel; op home de subregel), proof (optioneel, max. 3 × { value, label, source }; op home de cijfers in de proof bar); secties vrij in markdown. Home krijgt een eigen template dat services, cases en logo's uit de andere collecties haalt.

site.yaml:

- logos: { name, file, visible } (KPN: visible false)
- contact: mail (glenn@gladvisor.nl, het enige contactgegeven op de site); linkedin optioneel en pas getoond als ingevuld; geen telefoonnummer
- kvk: 93742193, voor de footer en Organization-schema
- werkgebied: tekst zoals onder Context
- entryOffers: seo-quickscan en page-review, elk met titel en korte omschrijving

Bewust buiten het contentmodel: redirects (vercel.json) en tarieven (worden niet getoond).

### Stap 2: design tokens en basiscomponenten

Huisstijl: crème en goud, Arial voor alles, structuur uit hairlines, witruimte en gouden nummers. Geen kaarten met slagschaduw, geen gekleurde balken over de volle breedte. De site moet voelen als de Gladvisor-decks, maar leesbaar op mobiel.

Kleurtokens (src/styles/tokens.css, op :root):

| Token | Waarde | Gebruik |
| --- | --- | --- |
| --bg | #FAF6EE | achtergrond overal |
| --bg-soft | #F4EFE4 | proof bar, FAQ-blok, formulier, instapproduct |
| --line | #E5E0D5 | hairlines, tabelranden |
| --line-strong | #B8AE98 | invoervelden, focusrand |
| --ink | #111111 | koppen, knoppen, links |
| --text | #1F1F1F | lopende tekst |
| --muted | #6E6E6E | eyebrows, subteksten |
| --muted-warm | #8C8474 | alleen grotere tekst of decoratie; kleine tekst en metadata in --muted (contrast) |
| --gold | #C9A227 | nummers, accentstreepjes, grote cijfers |
| --gold-logo | #C9A050 | logo-vierkantje |
| --gold-ghost | #EBE2CC | ghost-cijfers achter secties |
| --positive | #3E8E5E | alleen in cases/tabellen |
| --attention | #D9952B | alleen in cases/tabellen |
| --risk | #C0504D | alleen in cases/tabellen |

Contrast: goud nooit voor kleine lopende tekst of links. Links en knoptekst in --ink met gouden onderstreping of rand.

Typografie:

- font-family: Arial, Helvetica, sans-serif; geen webfonts
- Desktop: H1 44px bold, H2 28px bold, H3 18px bold, lead 20px, body 17px regelhoogte 1.6, klein 14px
- Mobiel (onder 768px): H1 35px, H2 22px, H3 18px, lead 16px, body 17px, klein 14px
- Breakpoint: 768px; mobiel eerst, desktopwaarden vanaf min-width 768px
- Eyebrow: 12px, hoofdletters, letter-spacing 0.2em, --muted, bijv. 'DIENST · SEO'
- Lopende tekst max-width 680px

Layout:

- Contentbreedte max. 1120px; zijmarge 24px mobiel, 48px desktop
- Spacing in stappen van 8px (8, 16, 24, 32, 48, 64, 96); secties 96px uit elkaar op desktop, 64px op mobiel
- Elke sectie opent met eyebrow, H2 en hairline

Basiscomponenten:

| Component | Opbouw |
| --- | --- |
| Header | goud vierkantje + 'Gladvisor' bold links; navigatie rechts (SEO, CRO, AI-zichtbaarheid, Cases, Over); knop 'Kennismaken' |
| Hero | desktop tweekoloms: links eyebrow, H1, lead (met doelgroep), primaire CTA 'Plan een kennismaking' + tekstlink naar instapproduct; rechts portret op ca. 40% breedte, beeldverhouding 4:5. Mobiel: portret kleiner onder de knoppen. Tot de foto er is: placeholder in --bg-soft met hairline-rand, alt 'Portret van Glenn Snel' |
| ProofBar | --bg-soft vlak, 3 cijfers groot in goud met label eronder en optioneel een bron als kleine regel in --muted; logostrip in grijs (zonder logobestand: naam in --muted, regular) |
| SectionHeader | eyebrow, H2, hairline over de contentbreedte |
| NumberedRow | hairline, goud nummer 01/02/03, titel bold, omschrijving --muted; mobiel gestapeld |
| SectionDivider | groot ghost-cijfer in --gold-ghost achter de H2 (alleen pijlers en home) |
| CaseCard | hairline boven, klant + sector als eyebrow, resultaat groot in goud, één zin, link; geen schaduw |
| Table | koprij bold, hairlines, geen gekleurde vlakken, horizontaal scrollen op mobiel |
| Faq | details/summary, hairline tussen vragen, plusteken in goud |
| EntryOffer | --bg-soft vlak, titel, twee regels uitleg, knop; formType uit het contentmodel |
| Button | primaire CTA overal 'Plan een kennismaking', alleen de header 'Kennismaken'; primair: --ink vlak met crème tekst; secundair: rand --ink; hover: gouden onderrand |
| Footer | hairline, logo, contact, werkgebied, KvK, links; klein en --muted |

Geen dark mode in de eerste versie. Geen stockfoto's.

### Stap 3: mappenstructuur, redirects en SEO-basis

```
gladvisor-site/
├── astro.config.mjs        site: https://www.gladvisor.nl, trailingSlash: 'always', sitemap
├── vercel.json             redirects en trailingSlash: true
├── public/
│   ├── robots.txt
│   ├── favicon.svg         goud vierkantje
│   ├── og-default.png      1200x630, gegenereerd met scripts/og-images.mjs
│   ├── logo.png            512x512, logo voor Organization-schema
│   └── logos/
├── src/
│   ├── content.config.ts
│   ├── content/
│   │   ├── services/
│   │   ├── cases/
│   │   ├── blog/
│   │   └── pages/
│   ├── data/site.yaml
│   ├── styles/tokens.css
│   ├── components/
│   ├── layouts/            Base, Page, Service, Case, Post
│   └── pages/              routes + 404.astro
├── docs/bouwplan.md
└── CLAUDE.md
```

URL-conventie: kleine letters, koppeltekens, altijd afsluitende slash. Primair domein: https://www.gladvisor.nl (met www) voor canonicals, sitemap, robots.txt, Open Graph en JSON-LD.

Redirects (vercel.json, permanent: true):

| Van | Naar |
| --- | --- |
| /wat/seo/ | /seo/ |
| /wat/cro/ | /cro/ |
| /wat/ | /seo/ |
| /wat/online-marketing/ | /seo/ |
| /wat/e-commerce/ | /cro/ |
| /portfolio/ | /cases/ |
| /waarom/ | /over/ |
| /hoe/ | /over/ |
| /cookieverklaring/ | /privacy/ |
| /feed/ | /blog/ |

Oude WordPress-pagina's /hello-world/, /author/glenn/ en /category/uncategorized/ worden niet gebouwd en geven een 404.

SEO-basis in de Base-layout:

- title, description, canonical (eigen URL met slash), Open Graph, Twitter-tags, noindex uit frontmatter; standaard og-image /og-default.png, per pagina te vervangen met ogImage
- @astrojs/sitemap, zonder noindex-pagina's, /stijlgids/ en 404 (filter in astro.config.mjs)
- robots.txt: alleen `User-agent: *`, `Allow: /` en `Sitemap: https://www.gladvisor.nl/sitemap-index.xml`. Daarmee zijn ook alle AI-zoek- en trainingscrawlers toegestaan; aparte regels per crawler zijn niet nodig
- JSON-LD via één Schema-component: Organization + Person + WebSite (home), Service (diensten), FAQPage (waar een FAQ staat), Article (blog), BreadcrumbList (alle pagina's behalve home). Het schema-veld in de frontmatter voegt typen toe (bijv. Person op /seo/). Organization bevat e-mail en KvK, geen telefoonnummer
- Na de build controleert scripts/check-dist.mjs sitemap, canonicals, JSON-LD, één h1 per pagina en dat er geen scripts in de HTML staan
- Alle content server-side gerenderd; niets dat alleen via JavaScript laadt
- Externe links (http(s), host niet gladvisor.nl of www.gladvisor.nl) openen altijd in een nieuw tabblad: target="_blank", rel="noopener" (geen nofollow, geen noreferrer), plus een verborgen tekst "(opent in nieuw tabblad)" voor schermlezers. mailto, tel, ankers en relatieve links blijven ongemoeid. Markdown via een eigen hast-plugin op Sätteri (scripts/lib/external-links.mjs); scripts/check-dist.mjs laat de build falen bij een externe link zonder deze attributen
- 404-pagina in huisstijl met links naar de drie pijlers en contact
- Afbeeldingen via Astro's image-component

## Pagina-skeletten

Elke dienstpagina: 600–800 woorden, één primaire CTA naar /contact/, secundaire CTA naar /cases/ of het instapproduct.

### /seo/

- Title: SEO-specialist, strategie én uitvoering | Gladvisor
- Meta: Freelance SEO-specialist voor e-commerce en B2B. Strategie en uitvoering in één hand, gestuurd op omzet en relevant verkeer.
- H1: SEO-specialist die strategie en uitvoering niet scheidt
- Hero, proof bar (13+ jaar, +18% na migratie, nominatie Website van het Jaar 2026, logostrip)
- H2 Wanneer je mij inschakelt: drie situaties met doorlink naar /seo/seo-audit/, /seo/website-migratie/, /seo/seo-strategie/
- H2 Hoe ik werk: nulmeting (techniek, content, autoriteit, AI-zichtbaarheid standaard), prioritering op business impact (quick wins, 1–3 maanden, 3–12 maanden), uitvoering met vaste eigenaar aan klantzijde
- H2 Bewijs: Fortune Coffee kort, link naar case en /seo/website-migratie/
- H2 SEO-specialist in de regio Rotterdam
- FAQ (3), instapproduct seo-quickscan, H2 Ook interessant (/cro/ en /ai-zichtbaarheid/)
- Schema: Service, Person, FAQPage

### /seo/website-migratie/

- Status: gevuld en live op de preview, tekst in src/content/services/seo/website-migratie.md (sub onder /seo/)
- Title: SEO bij websitemigratie: zonder verkeersverlies | Gladvisor
- H1: SEO bij een websitemigratie: overstappen zonder je verkeer te verliezen
- Proof bar: +18% organisch verkeer na Shopware-migratie (Fortune Coffee); 13+ jaar ervaring in SEO; 100 weken opdracht, gestart als 13 (Fortune Coffee)
- H2's: waarom migraties verkeer kosten; mijn aanpak in vier fases; case Fortune Coffee: naar Shopware met 18% groei; wanneer je mij erbij haalt
- FAQ (3), instapproduct seo-quickscan, Ook interessant (/seo/seo-audit/ en /cro/)
- Schema: Service, FAQPage

### /seo/seo-audit/

- Status: gevuld en live op de preview, tekst in src/content/services/seo/seo-audit.md (sub onder /seo/, kruimelpadlabel 'SEO-audit')
- Title: SEO-audit: techniek, content en AI-zichtbaarheid | Gladvisor
- H1: SEO-audit: weten waar je staat en wat als eerste moet
- Proof bar: 13+ jaar ervaring in SEO (klant-, bureau- en freelancekant); AI-crawltoegang standaard meegenomen in elke audit; 3 termijnen in de roadmap: quick wins, 1–3 en 3–12 maanden
- H2's: wat ik onderzoek; wat je krijgt; voor wie; uit de praktijk (anoniem voorbeeld)
- FAQ (3), instapproduct seo-quickscan, Ook interessant (/seo/website-migratie/ en /ai-zichtbaarheid/)
- Schema: Service, FAQPage

### /cro/

- Status: live op de preview, tekst in src/content/services/cro/index.md
- Title: Conversie optimalisatie (CRO) | CRO-specialist | Gladvisor (aangepast aan de limiet van 60 tekens)
- H1: Conversie optimalisatie: meer omzet uit het verkeer dat je al hebt
- Proof bar: ruim 2x traffic en omzet (Horloge.nl, 2018–2022); 13+ jaar SEO en CRO; nominatie Website van het Jaar 2026 (RCN)
- H2's: herken je dit; mijn aanpak: van CRO-analyse naar verbeteringen; waarom ik niet met A/B-testen begin; CRO en SEO in één hand; voorbeelden uit de praktijk (RCN, Bamigo)
- FAQ (4), instapproduct page-review, Ook interessant (/seo/ en /ai-zichtbaarheid/)
- Schema: Service, FAQPage

### /ai-zichtbaarheid/

- Status: live op de preview, tekst in src/content/services/ai-zichtbaarheid/index.md
- Title: AI-zichtbaarheid (GEO) | ChatGPT en AI Overviews | Gladvisor (aangepast aan de limiet van 60 tekens)
- H1: AI-zichtbaarheid: zichtbaar worden in ChatGPT, AI Overviews en Perplexity
- Proof bar: 13+ jaar SEO; AI-crawltoegang in elke audit gecheckt; 4 markten SEO en AI-zichtbaarheid (Rinkel)
- H2's: herken je dit; wat AI-zichtbaarheid wel en niet is; mijn aanpak (quickscan, content, vermeldingen, meetopzet); wat je niet nodig hebt; eerlijk over de stand van zaken; onderdeel van SEO, ook los af te nemen
- FAQ (4), instapproduct seo-quickscan (geen eigen instapproduct), Ook interessant (/seo/ en /cro/)
- Meetopzet AI: Search Console (rapport generatieve AI), Bing Webmaster Tools (AI-rapport) en GA4. Geen prompt tracking en geen eigen site als experiment.
- Schema: Service, FAQPage

### Cases

Status: de drie cases bij launch zijn gevuld en live op de preview, tekst in src/content/cases/. Op /cases/ en op home staan ze als kaarten in de volgorde Fortune Coffee, Horloge.nl, RCN, met resultaat, zin en link in een rij uitgelijnd (subgrid).

/cases/fortune-coffee/

- Title: Case Fortune Coffee: migratie naar Shopware | Gladvisor
- H1: Van een eigen CMS naar Shopware, met 18% organische groei
- Rol: Freelance lead online marketing (SEO en CRO)
- Periode: 2023–2024 (23 maanden)
- Resultaat: +18% organisch verkeer, ten opzichte van een jaar eerder, in de vier maanden na livegang

/cases/horloge-nl/

- Title: Case Horloge.nl: traffic en omzet ruim 2x | Gladvisor
- H1: Traffic en omzet ruim verdubbeld bij een horlogewebshop met 70+ merken
- Rol: Van SEO-specialist tot Marketing Manager en MT-lid (in loondienst)
- Periode: April 2018 – augustus 2022
- Resultaat: ruim 2x traffic en omzet, over de periode april 2018 tot augustus 2022

/cases/rcn/

- Title: Case RCN: interim website lead en CRO | Gladvisor
- H1: Een doorlopend CRO-programma, snel overgenomen als interim website lead
- Rol: Interim website lead (SEO en CRO)
- Periode: 2026 (6 maanden)
- Resultaat: 2–3 A/B-tests per maand, in een doorlopend CRO-programma, soms parallel in dezelfde customer journey

Open punten:

- Fortune Coffee: aanpak uitbreiden en een tweede cijfer (volgt van Glenn)
- Horloge.nl: aanpak in drie stappen (volgt)
- Quotes: voorlopig overgeslagen bij alle drie de cases

### /over/

- Title: Over Glenn Snel, freelance SEO-specialist | Gladvisor
- H1: Ik begin bij je business, niet bij je website
- Opbouw why → hoe → wat: overtuiging; hoe ik werk; achtergrond; wat je van mij mag verwachten
- Tekst staat klaar in src/content/pages/over.md
- Schema: Person, Organization

### Home

- Title: Glenn Snel | freelance SEO-specialist | Gladvisor
- H1: Meer omzet uit organisch verkeer, met een plan én iemand die het uitvoert
- Eyebrow: Freelance SEO-specialist
- Subregel (lead): Freelance SEO-specialist voor e-commerce en B2B, met CRO en AI-zichtbaarheid als verlengstuk.
- Proof bar: 13+ jaar ervaring in SEO (klant-, bureau- en freelancekant); +18% organisch verkeer na Shopware-migratie (Fortune Coffee); nominatie Website van het Jaar 2026 (RCN)
- Hero: primaire CTA Plan een kennismaking, secundaire link Bekijk een case
- Blokken: diensten (drie), bewijs, voor wie, hoe ik werk, logostrip, CTA kennismaking
- Schema: Organization, Person, WebSite

De definitieve teksten volgen later; gebruik tot die tijd placeholders die de structuur tonen.

## Livegang

- In Vercel wordt www.gladvisor.nl het primaire domein.
- gladvisor.nl (zonder www) stuurt permanent (308/301) door naar https://www.gladvisor.nl, met behoud van pad.
