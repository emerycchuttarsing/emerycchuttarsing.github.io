const { chromium } = await import(
  process.env['PLAYWRIGHT_MODULE'] ?? 'playwright'
);
import { mkdir } from 'node:fs/promises';
const out = process.env['PORTFOLIO_STILLS'] ?? 'test-results/works-stills';
await mkdir(out, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', headless: true });
for (const [label, width, height] of [
  ['desktop', 1440, 900],
  ['tablet', 768, 1024],
  ['mobile', 390, 844],
]) {
  const page = await browser.newPage({ viewport: { width, height } });
  await page.goto(
    (process.env['PORTFOLIO_BASE_URL'] ?? 'http://127.0.0.1:4321') +
      '/projects/',
  );
  await page.waitForFunction(
    () => document.documentElement.dataset.panelsReady === 'true',
  );
  await page.locator('[data-gallery] [data-motion-toggle]').click();
  await page.waitForTimeout(700);
  await page.addStyleTag({
    content:
      '.works-content,.site-header,.site-footer,.skip-link{visibility:hidden!important}',
  });
  await page.screenshot({ path: `${out}/still-${label}.png` });
  await page.close();
}
await browser.close();
