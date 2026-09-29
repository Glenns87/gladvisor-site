// Genereert public/og-default.png (1200x630) en public/logo.png (512x512)
// in huisstijl, met de kleuren uit src/styles/tokens.css.
// Handmatig draaien na een wijziging in de huisstijl; vereist Playwright
// met Chromium: `node scripts/og-images.mjs`.
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { execSync } from 'node:child_process';

const require = createRequire(import.meta.url);
let playwright;
try {
  playwright = require('playwright');
} catch {
  playwright = require(`${execSync('npm root -g').toString().trim()}/playwright`);
}

const tokens = readFileSync('src/styles/tokens.css', 'utf8');

const og = `
  <div class="og">
    <div class="brand"><span class="mark"></span>Gladvisor</div>
    <div class="line"></div>
    <p>Glenn Snel · freelance SEO-specialist</p>
  </div>`;

const logo = `
  <div class="logo"><span class="mark"></span></div>`;

const css = `
  ${tokens}
  html, body { margin: 0; }
  body { background: var(--bg); font-family: var(--font); color: var(--ink); }
  .og { width: 1200px; height: 630px; box-sizing: border-box; padding: 96px;
        display: flex; flex-direction: column; justify-content: center; }
  .brand { display: flex; align-items: center; gap: 36px; font-size: 120px; font-weight: 700; letter-spacing: -0.01em; }
  .mark { display: block; width: 96px; height: 96px; background: var(--gold-logo); }
  .line { width: 96px; height: 4px; background: var(--gold); margin: 56px 0 40px; }
  p { margin: 0; font-size: 40px; color: var(--muted); }
  .logo { width: 512px; height: 512px; display: flex; align-items: center; justify-content: center; }
  .logo .mark { width: 320px; height: 320px; }
`;

const browser = await playwright.chromium.launch();
for (const [html, width, height, path] of [
  [og, 1200, 630, 'public/og-default.png'],
  [logo, 512, 512, 'public/logo.png'],
]) {
  const page = await browser.newPage({ viewport: { width, height } });
  await page.setContent(`<!doctype html><style>${css}</style>${html}`);
  await page.screenshot({ path });
  console.log(`${path} (${width}x${height})`);
}
await browser.close();
