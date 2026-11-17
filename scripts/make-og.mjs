// Renders public/og.png, the 1200 × 630 image shown when a link to the site is shared.
// The headshot and both fonts are embedded, so nothing is fetched from another origin.
import { readFile } from 'node:fs/promises';
import { chromium } from '@playwright/test';
import { parse } from 'yaml';

const site = parse(await readFile('src/data/site.yaml', 'utf8'));
const headshot = (await readFile('src/assets/photos/headshot.jpg')).toString('base64');
const font = async (file) => (await readFile(`node_modules/@fontsource-variable/${file}`)).toString('base64');
const sansFont = async (file) => (await readFile(`node_modules/@fontsource/${file}`)).toString('base64');
const escape = (text) => text.replace(/&/g, '&amp;').replace(/</g, '&lt;');
const roles = site.roles.split(' · ');

const html = `<!doctype html><html><head><meta charset="utf-8"><style>
  @font-face { font-family: 'Fraunces Variable'; font-weight: 100 900; font-optical-sizing: auto; src: url(data:font/woff2;base64,${await font('fraunces/files/fraunces-latin-standard-normal.woff2')}) format('woff2-variations'); }
  @font-face { font-family: 'Source Sans 3'; font-weight: 400; src: url(data:font/woff2;base64,${await sansFont('source-sans-3/files/source-sans-3-latin-400-normal.woff2')}) format('woff2'); }
  @font-face { font-family: 'Source Sans 3'; font-weight: 600; src: url(data:font/woff2;base64,${await sansFont('source-sans-3/files/source-sans-3-latin-600-normal.woff2')}) format('woff2'); }
  * { box-sizing: border-box; }
  body { margin: 0; width: 1200px; height: 630px; overflow: hidden;
    background:
      radial-gradient(46% 60% at 88% 8%, rgba(246,178,61,.38) 0%, rgba(246,178,61,0) 70%),
      radial-gradient(60% 70% at 8% 100%, rgba(200,234,226,.55) 0%, rgba(200,234,226,0) 70%),
      #fbf3e6;
    color: #0b3b42; font-family: 'Source Sans 3', sans-serif; }
  .page { display: flex; align-items: center; justify-content: space-between; height: 100%; padding: 0 88px 0 96px; gap: 48px; }
  .copy { max-width: 620px; }
  .mark { color: #0b8b87; margin-bottom: 26px; }
  h1 { margin: 0; font: 700 108px/0.98 'Fraunces Variable', Georgia, serif; font-optical-sizing: auto; letter-spacing: -0.035em; color: #08363d; }
  .roles { margin: 26px 0 0; font-size: 37px; line-height: 1.32; font-weight: 600; color: #0d5c66; }
  .site { margin: 34px 0 0; font-size: 25px; font-weight: 600; letter-spacing: 0.02em; color: #0b8b87; }
  .photo { position: relative; width: 372px; flex: none; }
  .slab { position: absolute; inset: 22px -20px -16px 24px; border-radius: 999px 999px 30px 30px;
    transform: rotate(-2deg); background: linear-gradient(155deg, #ffd07a 0%, #f6b23d 46%, #e79a24 100%); }
  .frame { position: relative; padding: 10px; background: #fffcf4; border-radius: 999px 999px 28px 28px; }
  img { display: block; width: 100%; height: 466px; object-fit: cover; object-position: 58% 31%; border-radius: 999px 999px 21px 21px; }
</style></head><body>
  <div class="page">
    <div class="copy">
      <svg class="mark" width="76" height="50" viewBox="0 0 27 19" fill="none" aria-hidden="true">
        <path d="M1 12c2.7-4.8 5.4-4.8 8.1 0s5.4 4.8 8.1 0 5.4-4.8 8.1 0" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/>
        <path d="M2.7 5.6c2.1-3.6 4.2-3.6 6.3 0s4.2 3.6 6.3 0 4.2-3.6 6.3 0" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" opacity=".5"/>
      </svg>
      <h1>${escape(site.name)}</h1>
      <p class="roles">${escape(roles.slice(0, 2).join(' · '))} ·<br>${escape(roles[2] ?? '')}</p>
      <p class="site">heyhannah.xyz</p>
    </div>
    <div class="photo">
      <span class="slab"></span>
      <div class="frame"><img src="data:image/jpeg;base64,${headshot}" alt=""></div>
    </div>
  </div>
</body></html>`;

const browser = await chromium.launch();
try {
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
  await page.setContent(html);
  await page.screenshot({ path: 'public/og.png' });
} finally {
  await browser.close();
}
console.log('Wrote public/og.png');
