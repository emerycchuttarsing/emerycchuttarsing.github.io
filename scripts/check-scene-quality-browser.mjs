const { chromium } = await import(
  process.env['PLAYWRIGHT_MODULE'] ?? 'playwright'
);
import { mkdir, writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
const phase = process.argv[2] ?? 'after';
const out =
  process.env['PORTFOLIO_SCREENSHOTS'] ?? 'test-results/scene-quality';
const base = process.env['PORTFOLIO_BASE_URL'] ?? 'http://127.0.0.1:4321';
await mkdir(out, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const report = { browser: browser.version(), layouts: [], errors: [] };
try {
  for (const [width, height, dpr] of [
    [1440, 900, 2],
    [768, 1024, 2],
    [390, 844, 3],
  ]) {
    const context = await browser.newContext({
      viewport: { width, height },
      deviceScaleFactor: dpr,
    });
    await context.addInitScript(() => {
      window.__samples = [];
      const original =
        WebGL2RenderingContext.prototype.renderbufferStorageMultisample;
      WebGL2RenderingContext.prototype.renderbufferStorageMultisample =
        function (...args) {
          window.__samples.push(args[1]);
          return original.apply(this, args);
        };
    });
    const page = await context.newPage();
    page.on('pageerror', (e) => report.errors.push(e.message));
    page.on('console', (m) => {
      if (m.type() === 'error') report.errors.push(m.text());
    });
    await page.goto(`${base}/projects/`, { waitUntil: 'networkidle' });
    await page.waitForFunction(
      () => document.documentElement.dataset.panelsReady === 'true',
    );
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(800);
    const videoSizes = await page
      .locator('video')
      .evaluateAll((vs) =>
        vs
          .filter((v) => v.videoWidth)
          .map((v) => [v.videoWidth, v.videoHeight]),
      );
    await page.locator('[data-gallery] [data-motion-toggle]').click();
    await page.waitForTimeout(700);
    const detail = await page.evaluate(() => {
      const c = document.querySelector('canvas');
      return {
        viewport: [innerWidth, innerHeight],
        dpr: devicePixelRatio,
        canvas: [c.width, c.height],
        samples: [...new Set(window.__samples)],
        canvasCount: document.querySelectorAll('canvas').length,
        overflow: document.documentElement.scrollWidth > innerWidth,
        rows: document.querySelectorAll('.project-row').length,
        gpu: JSON.parse(
          document.querySelector('[data-scene-root]').dataset.gpuResources,
        ),
      };
    });
    detail.videoSizes = videoSizes;
    report.layouts.push(detail);
    await page.screenshot({ path: `${out}/index-${width}.png` });
    if (phase === 'after') {
      assert.equal(detail.rows, 7);
      assert.equal(detail.canvasCount, 1);
      assert.equal(detail.overflow, false);
      assert.equal(detail.canvas[0], width * 2, 'Retina canvas width');
      assert.equal(detail.canvas[1], height * 2, 'Retina canvas height');
      assert.ok(
        detail.samples.some((s) => s >= 2),
        'multisampling used for offscreen lighting passes',
      );
      assert.ok(
        videoSizes.every(([w, h]) => w === 1536 && h === 960),
        'HD panel video sources',
      );
    }
    await context.close();
  }
  if (phase === 'after') {
    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      deviceScaleFactor: 2,
      javaScriptEnabled: false,
    });
    const page = await context.newPage();
    await page.goto(`${base}/projects/`, { waitUntil: 'networkidle' });
    const fallback = await page
      .locator('.works-fallback img')
      .evaluate((img) => ({
        source: img.currentSrc,
        loaded: img.complete && img.naturalWidth > 0,
      }));
    assert.ok(fallback.source.endsWith('works-still-desktop@2x.webp'));
    assert.ok(fallback.loaded);
    assert.equal(await page.locator('.row-title').count(), 7);
    await page.waitForTimeout(800);
    await page.screenshot({ path: `${out}/no-js-retina.png` });
    report.fallback = fallback;
    await context.close();
  }
  assert.deepEqual(report.errors, []);
  await writeFile(`${out}/report.json`, JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
} finally {
  await browser.close();
}
