// Screenshot every section at a given build, for before/after token-migration diffing.
// Usage: node shoot.mjs <outDir> <baseUrl>
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const outDir = process.argv[2];
const baseUrl = process.argv[3] || 'http://localhost:4173';

// Real anchors, verified against the source — not guessed.
// Doctrine has NO id (it is wrapped in <ScanReveal>), so it is reached via
// .dx-bar, its elevation bars. It matters most here: it is the section whose
// 20 orange occurrences were re-fenced to lime.
const SECTIONS = [
  ['hero', '#hero'],
  ['thesis', '#thesis'],
  ['machine', '#machine'],
  ['gear', '#gear'],
  ['doctrine', '.dx-bar'],
  ['rides', '#rides'],
  ['story', '#story'],
  ['gallery', '#gallery'],
  ['connect', '#connect'],
];

mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 1,
  // Kill motion so scroll-driven reveals resolve to a stable end state — otherwise
  // GSAP mid-flight would produce false diffs that have nothing to do with colour.
  reducedMotion: 'reduce',
});

const errors = [];
page.on('pageerror', (e) => errors.push(`PAGEERROR: ${e.message}`));
page.on('console', (m) => { if (m.type() === 'error') errors.push(`CONSOLE: ${m.text()}`); });

await page.goto(baseUrl, { waitUntil: 'networkidle', timeout: 60000 });
await page.waitForTimeout(2500);

for (const [name, sel] of SECTIONS) {
  try {
    if (sel) {
      const el = await page.$(sel);
      if (!el) { console.log(`  skip ${name} (no ${sel})`); continue; }
      await el.scrollIntoViewIfNeeded();
      await page.waitForTimeout(1400); // let scroll-triggered reveals settle
    } else {
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(1200);
    }
    await page.screenshot({ path: `${outDir}/${name}.png` });
    console.log(`  shot ${name}`);
  } catch (e) {
    console.log(`  FAIL ${name}: ${e.message}`);
  }
}

await browser.close();
console.log(errors.length ? `\nRUNTIME ERRORS (${errors.length}):\n` + [...new Set(errors)].join('\n') : '\nno runtime errors');
