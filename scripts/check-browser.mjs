const { chromium } = await import(
  process.env['PLAYWRIGHT_MODULE'] ?? 'playwright'
);
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
const out = process.env['PORTFOLIO_SCREENSHOTS'] ?? 'test-results/jalon-2';
await mkdir(out, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const base = process.env['PORTFOLIO_BASE_URL'] ?? 'http://127.0.0.1:4321';
const report = {
  checkedAt: new Date().toISOString(),
  browser: browser.version(),
  viewports: [],
  fallbacks: [],
  navigation: {},
  errors: [],
};
function monitor(page, expectedWebGL = false) {
  page.on('pageerror', (e) => report.errors.push(e.message));
  page.on('console', (m) => {
    if (
      m.type() === 'error' &&
      !(expectedWebGL && /WebGL|context/.test(m.text()))
    )
      report.errors.push(m.text());
  });
}
async function waitScene(page) {
  await page.waitForFunction(
    () => document.documentElement.dataset.terrainReady === 'true',
  );
}
async function gallery(page) {
  await page.evaluate(() =>
    window.scrollTo(0, document.querySelector('#projects').offsetTop),
  );
  await page.waitForTimeout(120);
}
async function metrics(page) {
  return page.evaluate(() => ({
    width: innerWidth,
    height: innerHeight,
    overflow: document.documentElement.scrollWidth > innerWidth,
    panels: [...document.querySelectorAll('.project-row')].map((e) => ({
      id: e.dataset.projectId,
      top: e.getBoundingClientRect().top,
      bottom: e.getBoundingClientRect().bottom,
    })),
    canvasCount: document.querySelectorAll('canvas').length,
    flags: { ...document.documentElement.dataset },
    posterOpacity:
      getComputedStyle(document.querySelector('.works-fallback')).visibility ===
      'visible'
        ? '1'
        : '0',
  }));
}
for (const [width, height] of [
  [1440, 900],
  [1280, 800],
  [768, 1024],
  [390, 844],
]) {
  const context = await browser.newContext({
    viewport: { width, height },
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();
  monitor(page);
  await page.goto(base, { waitUntil: 'networkidle' });
  await waitScene(page);
  assert.equal((await metrics(page)).overflow, false, `hero overflow ${width}`);
  await page.screenshot({ path: `${out}/hero-${width}x${height}.png` });
  await gallery(page);
  const m = await metrics(page);
  assert.equal(m.panels.length, 7);
  assert.equal(m.overflow, false);
  assert.equal(m.canvasCount, 1);
  if (width === 1440)
    assert(
      m.panels.every((p) => p.top >= 0 && p.bottom <= height),
      'all seven visible at 1440',
    );
  assert.equal(m.flags.panelsReady, 'true');
  await page.screenshot({
    path: `${out}/gallery-${width}x${height}.png`,
    fullPage: false,
  });
  report.viewports.push(m);
  console.log(`Validated viewport ${width} × ${height}`);
  if (width === 1440) {
    for (const [route, name] of [
      ['/projects/', 'index'],
      ['/projects/rl-path-signatures/', 'case'],
      ['/about/', 'about'],
      ['/404.html', '404'],
    ]) {
      await page.goto(base + route, { waitUntil: 'networkidle' });
      assert.equal(
        await page.locator('canvas').count(),
        route === '/projects/' ? 1 : 0,
        'scene on home and Works index only',
      );
      await page.screenshot({
        path: `${out}/${name}-1440.png`,
        fullPage: true,
      });
    }
  }
  if (width === 390) {
    for (const route of [
      '/projects/',
      '/projects/rl-path-signatures/',
      '/about/',
      '/404.html',
    ]) {
      await page.goto(base + route, { waitUntil: 'networkidle' });
      assert.equal(
        await page.evaluate(
          () => document.documentElement.scrollWidth > innerWidth,
        ),
        false,
        `overflow ${route}`,
      );
    }
  }
  await context.close();
}
for (const kind of ['no-js', 'reduced-motion', 'no-webgl']) {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    javaScriptEnabled: kind !== 'no-js',
    reducedMotion: kind === 'reduced-motion' ? 'reduce' : 'no-preference',
  });
  if (kind === 'no-webgl')
    await context.addInitScript(() => {
      const original = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = function (type, ...args) {
        if (
          type === 'webgl' ||
          type === 'webgl2' ||
          type === 'experimental-webgl'
        )
          return null;
        return original.call(this, type, ...args);
      };
    });
  const page = await context.newPage();
  monitor(page, kind === 'no-webgl');
  const scripts = [];
  page.on('request', (r) => {
    if (r.resourceType() === 'script') scripts.push(r.url());
  });
  await page.goto(base, { waitUntil: 'networkidle' });
  await gallery(page);
  const m = await metrics(page);
  assert.equal(m.canvasCount, 0);
  assert.equal(m.panels.length, 7);
  assert.equal(m.posterOpacity, '1');
  assert.equal(
    await page
      .locator('.works-fallback img')
      .evaluateAll((es) => es.every((e) => e.complete && e.naturalWidth > 0)),
    true,
  );
  await page.screenshot({ path: `${out}/fallback-${kind}.png` });
  report.fallbacks.push({ kind, ...m, scripts });
  console.log(`Validated ${kind}`);
  await context.close();
}
const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
});
await context.addInitScript(() => {
  window.__rafCount = 0;
  const native = requestAnimationFrame;
  window.requestAnimationFrame = (callback) => {
    window.__rafCount++;
    return native(callback);
  };
});
const page = await context.newPage();
monitor(page);
await page.goto(base, { waitUntil: 'networkidle' });
await waitScene(page);
await page.keyboard.press('Tab');
assert.equal(await page.locator(':focus').textContent(), 'Skip to content');
await page.keyboard.press('Enter');
assert.equal(await page.locator(':focus').getAttribute('id'), 'main');
const reached = [];
for (let i = 0; i < 32 && reached.length < 7; i++) {
  await page.keyboard.press('Tab');
  const active = await page.evaluate(() => {
    const e = document.activeElement;
    return {
      href: e?.getAttribute('href'),
      project: e?.classList.contains('row-title'),
      outline: e ? getComputedStyle(e).outlineStyle : 'none',
    };
  });
  if (active.project) {
    reached.push(active.href);
    assert.notEqual(active.outline, 'none');
  }
}
assert.equal(new Set(reached).size, 7, 'all project links reached by keyboard');
await gallery(page);
const ids = await page
  .locator('.project-row')
  .evaluateAll((es) => es.map((e) => e.dataset.projectId));
for (const id of ids) {
  await page.locator(`[data-project-id="${id}"] .row-title`).click();
  await page.waitForURL(`**/projects/${id}/`);
  await page.reload({ waitUntil: 'networkidle' });
  assert.equal(await page.locator('h1').count(), 1);
  assert.equal(await page.locator('canvas').count(), 0);
  await page.goBack({ waitUntil: 'networkidle' });
  await waitScene(page);
  await gallery(page);
  assert.equal(await page.locator('canvas').count(), 1);
}
await page.locator('[data-gallery] [data-motion-toggle]').click();
await page.waitForFunction(() =>
  [...document.querySelectorAll('video')].every((video) => video.paused),
);
await page.waitForFunction(
  () =>
    document.querySelector('[data-scene-root]').dataset.progress === '1.000',
);
await page.waitForTimeout(250);
const idleBefore = await page.evaluate(() => window.__rafCount);
await page.waitForTimeout(500);
const idleAfter = await page.evaluate(() => window.__rafCount);
assert.equal(idleBefore, idleAfter, 'no perpetual render loop');
await page.locator('.about-teaser').scrollIntoViewIfNeeded();
await page.evaluate(() =>
  window.scrollTo(0, document.documentElement.scrollHeight),
);
await page.waitForTimeout(100);
await page.setViewportSize({ width: 1024, height: 768 });
await page.waitForTimeout(120);
assert.equal(
  (await metrics(page)).canvasCount,
  1,
  'compact resize keeps the scene',
);
assert.equal((await metrics(page)).overflow, false);
await page.setViewportSize({ width: 1440, height: 900 });
await gallery(page);
await page.waitForFunction(
  () => document.documentElement.dataset.panelsReady === 'true',
);
assert.equal(await page.locator('canvas').count(), 1);
assert.equal(await page.locator('canvas').evaluate((e) => e.width), 1440);
await page.emulateMedia({ reducedMotion: 'reduce' });
await page.waitForFunction(
  () => document.querySelectorAll('canvas').length === 0,
);
assert.equal((await metrics(page)).posterOpacity, '1');
assert.equal((await metrics(page)).overflow, false);
await page.emulateMedia({ reducedMotion: 'no-preference' });
await waitScene(page);
await gallery(page);
assert.equal(await page.locator('canvas').count(), 1);
await page.evaluate(() =>
  document
    .querySelector('canvas')
    .getContext('webgl2')
    .getExtension('WEBGL_lose_context')
    .loseContext(),
);
await page.waitForFunction(
  () => document.querySelectorAll('canvas').length === 0,
);
assert.equal((await metrics(page)).posterOpacity, '1');
assert.equal((await metrics(page)).overflow, false);
report.navigation = {
  keyboardProjects: reached.length,
  openedReloadedAndReturned: ids,
  canvasAfterRepeatedNavigation: 1,
  idleRafRequests: idleAfter - idleBefore,
  resize: true,
  motionPreferenceChange: true,
  contextLoss: true,
};
await browser.close();
await writeFile(`${out}/report.json`, JSON.stringify(report, null, 2));
assert.deepEqual(report.errors, []);
console.log(JSON.stringify(report, null, 2));
